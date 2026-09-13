/**
 * SUH TAH LAM - Performance Tracker
 *
 * Coordinates:
 * - Deterministic event timestamps and cognitive latency
 * - Domain-specific updates (visual, sequence, spatial, change, movement)
 * - Adaptive difficulty evaluation via DifficultyEngine
 * - Offline persistence via LocalPerformanceStorage
 *
 * NOTE: Caregiver metrics are computed accurately, but kept invisible to
 * the patient who receives only warm encouragement.
 */

import { CognitiveProfile } from './CognitiveProfile.js';
import { DifficultyEngine, defaultDifficultyEngine } from './DifficultyEngine.js';
import { LocalPerformanceStorage, defaultLocalStorage } from '../storage/LocalPerformanceStorage.js';

export class PerformanceTracker {
  constructor({
    gameId = 'suh_tah_lam',
    playerId = 'P001',
    difficultyEngine = defaultDifficultyEngine,
    storage = defaultLocalStorage,
  } = {}) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.difficultyEngine = difficultyEngine;
    this.storage = storage;

    this.profile = null;
    this.cognitiveProfile = null;
    this.roundHistory = [];
    this.activeRound = null;
    this.interactionStartTimestamp = null;
    this.initialized = false;
  }

  async initialize({ playerId = 'P001', initialDifficulty = 'easy' } = {}) {
    this.playerId = playerId;
    const storedProfile = await this.storage.getProfile(this.gameId, this.playerId);
    this.roundHistory = await this.storage.getRoundHistory(this.gameId, this.playerId, 50);

    const difficulty = storedProfile.currentDifficulty || initialDifficulty;
    this.profile = storedProfile;
    this.cognitiveProfile = new CognitiveProfile(storedProfile.cognitiveScores || {});
    this.initialized = true;

    return {
      currentDifficulty: difficulty,
      profile: this.profile,
    };
  }

  startRound({ difficulty = 'easy', sequenceId = null, metadata = {} } = {}) {
    const roundNumber = (this.roundHistory.length || 0) + 1;
    this.interactionStartTimestamp = null;

    this.activeRound = {
      roundNumber,
      difficulty,
      sequenceId,
      startedAt: new Date().toISOString(),
      events: [],
      attempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      responseTimesMs: [],
      domainScores: {},
      isCorrect: true,
      metadata,
    };

    return this.activeRound;
  }

  recordRecallStart() {
    this.interactionStartTimestamp = Date.now();
    this.recordEvent('recall_started', { timestamp: this.interactionStartTimestamp });
  }

  recordEvent(eventType, metadata = {}) {
    if (!this.activeRound) return;
    this.activeRound.events.push({
      eventType,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  recordAnswer({ domain = 'visual', questionId, chosenOption, correctOption, isCorrect, responseTimeMs = null }) {
    if (!this.activeRound) return null;

    let responseTime = responseTimeMs;
    if (responseTime === null && this.interactionStartTimestamp) {
      responseTime = Math.max(50, Date.now() - this.interactionStartTimestamp);
    }

    this.activeRound.attempts += 1;
    if (isCorrect) {
      this.activeRound.correctAttempts += 1;
    } else {
      this.activeRound.incorrectAttempts += 1;
      this.activeRound.isCorrect = false;
    }

    if (responseTime) {
      this.activeRound.responseTimesMs.push(responseTime);
    }

    // Update internal cognitive profile
    this.cognitiveProfile.updateDomain(domain, isCorrect);
    this.activeRound.domainScores[domain] = isCorrect;

    this.recordEvent('question_answered', {
      domain,
      questionId,
      chosenOption,
      correctOption,
      isCorrect,
      responseTimeMs: responseTime,
    });

    return { isCorrect, responseTimeMs: responseTime };
  }

  async completeRound() {
    if (!this.activeRound) return null;

    const roundEnd = new Date().toISOString();
    const roundStart = this.activeRound.startedAt;
    const completionTimeSec = Math.max(
      1,
      Math.round((new Date(roundEnd).getTime() - new Date(roundStart).getTime()) / 1000)
    );

    const attempts = Math.max(1, this.activeRound.attempts);
    const accuracy = Math.round((this.activeRound.correctAttempts / attempts) * 100) / 100;
    const validTimes = this.activeRound.responseTimesMs;
    const avgResponseTimeMs =
      validTimes.length > 0 ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : 0;

    // Response efficiency: normalized score where calm, steady recall gets full marks
    const responseEfficiency = avgResponseTimeMs > 0 && avgResponseTimeMs < 12000 ? 1.0 : 0.8;

    // Rolling consistency
    const recentAccuracies = [...this.roundHistory.map((r) => r.accuracy), accuracy].slice(-10);
    const consistency =
      recentAccuracies.length > 1
        ? 1.0 -
          Math.min(
            1.0,
            Math.sqrt(
              recentAccuracies.reduce((sum, a) => sum + Math.pow(a - accuracy, 2), 0) / recentAccuracies.length
            )
          )
        : 1.0;

    const performanceScore = this.difficultyEngine.calculateWeightedScore({
      accuracy,
      taskSuccess: this.activeRound.isCorrect ? 1.0 : 0.0,
      consistency,
      domainAccuracy: this.cognitiveProfile.overallAccuracy,
      responseEfficiency,
    });

    const completedRound = {
      ...this.activeRound,
      completedAt: roundEnd,
      completionTimeSec,
      accuracy,
      responseTimeMs: avgResponseTimeMs,
      performanceScore,
      cognitiveScores: this.cognitiveProfile.toJSON(),
    };

    this.roundHistory.push(completedRound);

    // Evaluate difficulty adaptation
    const difficultyDecision = this.difficultyEngine.evaluate({
      currentDifficulty: completedRound.difficulty,
      roundHistory: this.roundHistory,
    });

    let promotionCount = this.profile?.promotionCount || 0;
    let demotionCount = this.profile?.demotionCount || 0;
    if (difficultyDecision.decision === 'promote') promotionCount++;
    if (difficultyDecision.decision === 'demote') demotionCount++;

    const newStreak = this.activeRound.isCorrect ? (this.profile?.streak || 0) + 1 : 0;

    this.profile = {
      gameId: this.gameId,
      playerId: this.playerId,
      currentDifficulty: difficultyDecision.nextDifficulty,
      roundsPlayed: (this.profile?.roundsPlayed || 0) + 1,
      accuracy: this.cognitiveProfile.overallAccuracy,
      sequenceAccuracy: this.cognitiveProfile.sequenceRecallScore,
      spatialAccuracy: this.cognitiveProfile.spatialRecallScore,
      changeDetectionAccuracy: this.cognitiveProfile.changeDetectionScore,
      movementRecallScore: this.cognitiveProfile.movementRecallScore,
      recentScore: difficultyDecision.rollingScore,
      promotionCount,
      demotionCount,
      streak: newStreak,
      cognitiveScores: this.cognitiveProfile.toJSON(),
      updatedAt: new Date().toISOString(),
    };

    // Save offline asynchronously without blocking
    this.storage
      .saveRoundResult({
        session: { id: `session_${Date.now()}`, playerId: this.playerId, gameId: this.gameId },
        roundData: completedRound,
        profile: this.profile,
      })
      .catch((err) => {
        console.warn('[PerformanceTracker] Offline storage error caught safely:', err);
      });

    this.activeRound = null;
    this.interactionStartTimestamp = null;

    return {
      round: completedRound,
      decision: difficultyDecision,
      profile: this.profile,
    };
  }

  abandonRound() {
    if (!this.activeRound) return null;
    const abandoned = {
      ...this.activeRound,
      completedAt: new Date().toISOString(),
      isAbandoned: true,
      accuracy: 0,
      performanceScore: 0,
    };
    this.activeRound = null;
    this.interactionStartTimestamp = null;
    return abandoned;
  }
}
