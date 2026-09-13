/**
 * Central Performance Tracker for Cognitive Games (SIH Memory Assistant)
 *
 * Facade coordinating:
 * - Session tracking
 * - Event logging & timestamps
 * - Metrics calculation (accuracy, response time, consistency)
 * - Adaptive difficulty evaluation
 * - Supabase persistence and offline syncing
 */

import { SessionManager } from './SessionManager.js';
import { DifficultyEngine, defaultDifficultyEngine } from './DifficultyEngine.js';
import {
  calculateAccuracy,
  calculateErrorRate,
  calculateResponseTimeStats,
  calculateResponseEfficiency,
  calculateConsistencyScore,
  calculatePerformanceScore,
} from './MetricsCalculator.js';
import { SupabasePerformanceService, defaultPerformanceService } from './SupabasePerformanceService.js';

export class PerformanceTracker {
  constructor({
    gameType = 'dhop_khel',
    playerId = 'P001',
    difficultyEngine = defaultDifficultyEngine,
    performanceService = defaultPerformanceService,
  } = {}) {
    this.gameType = gameType;
    this.playerId = playerId;
    this.difficultyEngine = difficultyEngine;
    this.performanceService = performanceService;
    this.sessionManager = new SessionManager();

    // Active round state
    this.activeRound = null;
    this.interactionStartTimestamp = null;
    this.roundHistory = [];
    this.profile = null;
    this.initialized = false;
  }

  /**
   * Initializes the tracker, loading player's historical profile
   */
  async initialize({ playerId, initialDifficulty = 'easy' } = {}) {
    if (playerId) {
      this.playerId = playerId;
    }

    this.profile = await this.performanceService.getProfile(this.gameType, this.playerId);
    this.roundHistory = await this.performanceService.getRoundHistory(this.gameType, this.playerId, 50);

    const difficulty = this.profile.currentDifficulty || initialDifficulty;
    this.sessionManager.startSession({
      playerId: this.playerId,
      gameType: this.gameType,
      initialDifficulty: difficulty,
    });

    this.initialized = true;

    // Trigger offline queue flush in background
    this.performanceService.flushOfflineQueue().catch(() => {});

    return {
      currentDifficulty: difficulty,
      profile: this.profile,
    };
  }

  /**
   * Starts a new round
   */
  startRound({ difficulty = 'easy', sequenceLength = 2, metadata = {} } = {}) {
    const roundNumber = (this.sessionManager.getSession()?.roundsCount || 0) + 1;
    this.interactionStartTimestamp = null;

    this.activeRound = {
      roundNumber,
      difficulty,
      sequenceLength,
      startedAt: new Date().toISOString(),
      events: [],
      attempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      responseTimesMs: [],
      chosenPlayerId: null,
      correctPlayerId: null,
      isCorrect: false,
      isAbandoned: false,
      metadata,
    };

    return this.activeRound;
  }

  /**
   * Records the exact moment the recall decision phase starts
   * (e.g. Dhop ball hides, players become selectable)
   */
  recordRecallStart() {
    this.interactionStartTimestamp = Date.now();
    this.recordEvent('recall_started', { timestamp: this.interactionStartTimestamp });
  }

  /**
   * Records an arbitrary gameplay event
   */
  recordEvent(eventType, metadata = {}) {
    if (!this.activeRound) return;
    this.activeRound.events.push({
      eventType,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Records the player's answer selection
   */
  recordAnswer({ chosenPlayerId, correctPlayerId, isCorrect, responseTimeMs = null }) {
    if (!this.activeRound) return null;

    let computedResponseTime = responseTimeMs;
    if (computedResponseTime === null && this.interactionStartTimestamp) {
      computedResponseTime = Math.max(50, Date.now() - this.interactionStartTimestamp);
    }

    this.activeRound.attempts += 1;
    this.activeRound.chosenPlayerId = chosenPlayerId;
    this.activeRound.correctPlayerId = correctPlayerId;
    this.activeRound.isCorrect = isCorrect;

    if (isCorrect) {
      this.activeRound.correctAttempts += 1;
    } else {
      this.activeRound.incorrectAttempts += 1;
    }

    if (computedResponseTime) {
      this.activeRound.responseTimesMs.push(computedResponseTime);
    }

    this.recordEvent('answer_submitted', {
      chosenPlayerId,
      correctPlayerId,
      isCorrect,
      responseTimeMs: computedResponseTime,
    });

    return {
      isCorrect,
      responseTimeMs: computedResponseTime,
    };
  }

  /**
   * Completes the active round, calculates metrics, evaluates adaptive difficulty, and persists
   */
  async completeRound() {
    if (!this.activeRound) return null;

    const roundEnd = new Date().toISOString();
    const roundStart = this.activeRound.startedAt;
    const completionTimeSec = Math.max(
      1,
      Math.round((new Date(roundEnd).getTime() - new Date(roundStart).getTime()) / 1000)
    );

    const accuracy = calculateAccuracy(
      this.activeRound.correctAttempts,
      this.activeRound.attempts || 1
    );
    const errorRate = calculateErrorRate(
      this.activeRound.incorrectAttempts,
      this.activeRound.attempts || 1
    );
    const responseStats = calculateResponseTimeStats(this.activeRound.responseTimesMs);
    const responseEfficiency = calculateResponseEfficiency(
      responseStats.average,
      this.activeRound.isCorrect
    );

    // Calculate rolling consistency with historical rounds
    const recentAccuracies = [
      ...this.roundHistory.map((r) => r.accuracy),
      accuracy,
    ].slice(-10);
    const consistencyScore = calculateConsistencyScore(recentAccuracies);

    const performanceScore = calculatePerformanceScore({
      accuracy,
      taskSuccess: this.activeRound.isCorrect ? 1.0 : 0.0,
      consistency: consistencyScore,
      responseEfficiency,
      completedNormally: true,
    });

    const completedRound = {
      ...this.activeRound,
      completedAt: roundEnd,
      completionTimeSec,
      accuracy,
      errorRate,
      responseTimeMs: responseStats.average,
      responseStats,
      responseEfficiency,
      consistencyScore,
      performanceScore,
    };

    // Update history
    this.roundHistory.push(completedRound);

    // Update session
    const session = this.sessionManager.recordRound(completedRound);

    // Evaluate Adaptive Difficulty
    const difficultyDecision = this.difficultyEngine.evaluate({
      currentDifficulty: completedRound.difficulty,
      roundHistory: this.roundHistory,
    });

    // Update Profile
    let promotionCount = this.profile?.promotionCount || 0;
    let demotionCount = this.profile?.demotionCount || 0;
    if (difficultyDecision.decision === 'promote') promotionCount++;
    if (difficultyDecision.decision === 'demote') demotionCount++;

    this.profile = {
      playerId: this.playerId,
      gameType: this.gameType,
      currentDifficulty: difficultyDecision.nextDifficulty,
      recentScore: difficultyDecision.rollingScore,
      promotionCount,
      demotionCount,
      roundsPlayed: (this.profile?.roundsPlayed || 0) + 1,
      updatedAt: new Date().toISOString(),
    };

    // Background Async Persistence (local and Supabase)
    this.performanceService
      .saveRoundResult({
        session: session || { id: 'temp', playerId: this.playerId, gameType: this.gameType },
        roundData: completedRound,
        profile: this.profile,
      })
      .catch((err) => {
        console.warn('Background saveRoundResult error handled safely:', err);
      });

    this.activeRound = null;
    this.interactionStartTimestamp = null;

    return {
      round: completedRound,
      decision: difficultyDecision,
      profile: this.profile,
    };
  }

  /**
   * Handles user backing out or abandoning a round mid-way
   */
  async abandonRound() {
    if (!this.activeRound) return null;

    const roundEnd = new Date().toISOString();
    const abandonedRound = {
      ...this.activeRound,
      completedAt: roundEnd,
      isAbandoned: true,
      accuracy: 0,
      performanceScore: 0,
    };

    this.sessionManager.abandonSession();
    this.activeRound = null;
    this.interactionStartTimestamp = null;

    return abandonedRound;
  }

  /**
   * Completes the entire session cleanly
   */
  endSession() {
    return this.sessionManager.completeSession();
  }

  /**
   * Retrieves private, comprehensive caregiver/clinician analytics
   */
  getCaregiverProfile() {
    const totalRounds = this.roundHistory.length;
    if (totalRounds === 0) {
      return {
        currentDifficulty: this.profile?.currentDifficulty || 'easy',
        roundsPlayed: 0,
        accuracy: 0,
        averageResponseTimeSec: 0,
        consistencyScore: 0,
        trend: 'New player',
        recentRounds: [],
      };
    }

    const correctRounds = this.roundHistory.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctRounds / totalRounds) * 100);

    const validTimes = this.roundHistory
      .map((r) => r.responseTimeMs)
      .filter((t) => typeof t === 'number' && t > 0);
    const avgMs =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : 0;

    const recentScores = this.roundHistory.map((r) => r.performanceScore);
    const consistencyScore = Math.round(calculateConsistencyScore(recentScores) * 100);

    // Calculate trend
    let trend = 'Stable';
    if (totalRounds >= 4) {
      const half = Math.floor(totalRounds / 2);
      const firstHalfAvg =
        recentScores.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const secondHalfAvg =
        recentScores.slice(half).reduce((a, b) => a + b, 0) / (totalRounds - half);
      if (secondHalfAvg - firstHalfAvg >= 0.08) {
        trend = 'Improving';
      } else if (firstHalfAvg - secondHalfAvg >= 0.08) {
        trend = 'Needs attention';
      }
    }

    return {
      currentDifficulty: this.profile?.currentDifficulty || 'easy',
      roundsPlayed: totalRounds,
      accuracy,
      averageResponseTimeSec: Math.round((avgMs / 1000) * 10) / 10,
      consistencyScore,
      trend,
      promotionCount: this.profile?.promotionCount || 0,
      demotionCount: this.profile?.demotionCount || 0,
      recentRounds: this.roundHistory.slice(-5).map((r) => ({
        roundNumber: r.roundNumber,
        difficulty: r.difficulty,
        isCorrect: r.isCorrect,
        responseTimeMs: r.responseTimeMs,
        score: Math.round((r.performanceScore || 0) * 100),
      })),
    };
  }
}
