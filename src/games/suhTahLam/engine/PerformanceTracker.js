/**
 * SUH TAH LAM - Performance Tracker
 *
 * Coordinates:
 * - Deterministic event timestamps and cognitive latency
 * - Domain-specific updates (visual, sequence, spatial, change, movement)
 * - Adaptive difficulty evaluation via DifficultyEngine
 * - Offline persistence via LocalPerformanceStorage
 * - Strictly real attempts, zero-fabrication metrics
 *
 * NOTE: Caregiver metrics are computed accurately, but kept invisible to
 * the patient who receives only warm encouragement.
 */

import { CognitiveProfile } from './CognitiveProfile.js';
import { DifficultyEngine, defaultDifficultyEngine } from './DifficultyEngine.js';
import { LocalPerformanceStorage, defaultLocalStorage } from '../storage/LocalPerformanceStorage.js';
import { validateRoundResult } from './CognitiveVitalityIndex.js';
import { cognitiveAnalytics } from '../../../modules/performance/CognitiveAnalyticsService.js';

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

  async initialize({ playerId, initialDifficulty = 'easy' } = {}) {
    if (playerId) {
      this.playerId = playerId;
    }
    const storedProfile = await this.storage.getProfile(this.gameId, this.playerId);
    this.roundHistory = await this.storage.getRoundHistory(this.gameId, this.playerId, 50);

    const difficulty = storedProfile.currentDifficulty || initialDifficulty;
    this.profile = {
      ...storedProfile,
      playerId: this.playerId,
    };
    this.cognitiveProfile = new CognitiveProfile(this.profile);
    this.initialized = true;

    return {
      currentDifficulty: difficulty,
      profile: this.profile,
    };
  }

  startRound({
    difficulty = 'easy',
    sequenceId = null,
    sessionId = null,
    metadata = {},
  } = {}) {
    const roundNumber = (this.roundHistory.length || 0) + 1;
    this.interactionStartTimestamp = null;

    this.activeRound = {
      roundNumber,
      sessionId: sessionId || null,
      playerId: this.playerId,
      gameId: this.gameId,
      mode: metadata.mode || 'standard',
      difficulty,
      sequenceId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'active',
      events: [],
      attempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      accuracy: null,
      responseTimesMs: [],
      responseTimesSec: [],
      averageResponseTimeSec: null,
      responseTimeMs: null,
      score: null,
      performanceScore: null,
      domainScores: {},
      isCorrect: true,
      isAbandoned: false,
      eligibleForCVI: false,
      metadata,
    };

    return { ...this.activeRound };
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

  recordAnswer({
    domain = 'visual',
    questionId,
    chosenOption,
    correctOption,
    isCorrect,
    responseTimeMs = null,
  }) {
    if (!this.activeRound) return null;

    let responseTime = responseTimeMs;
    if (responseTime === null && this.interactionStartTimestamp) {
      responseTime = Math.max(50, Date.now() - this.interactionStartTimestamp);
    }

    this.activeRound.attempts += 1;
    this.activeRound.questionsTotal += 1;

    if (isCorrect) {
      this.activeRound.correctAttempts += 1;
      this.activeRound.questionsCorrect += 1;
    } else {
      this.activeRound.incorrectAttempts += 1;
      this.activeRound.isCorrect = false;
    }

    if (typeof responseTime === 'number' && responseTime > 0) {
      this.activeRound.responseTimesMs.push(responseTime);
      this.activeRound.responseTimesSec.push(Math.round((responseTime / 1000) * 10) / 10);
    }

    // Update internal domain breakdown
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
    const durationMs = Math.max(0, new Date(roundEnd).getTime() - new Date(roundStart).getTime());
    const durationSec = Math.max(1, Math.round(durationMs / 1000));

    // Handle zero-answer round: do NOT manufacture fake attempts or accuracy
    if (this.activeRound.attempts === 0) {
      const incompleteRound = {
        ...this.activeRound,
        completedAt: roundEnd,
        durationSec,
        activeDurationSec: durationSec,
        status: 'incomplete',
        accuracy: null,
        averageResponseTimeSec: null,
        responseTimeMs: null,
        score: 0,
        performanceScore: null,
        eligibleForCVI: false,
        dataQuality: 'zero_attempts_incomplete',
      };

      this.roundHistory.push(incompleteRound);
      this.activeRound = null;
      this.interactionStartTimestamp = null;

      try {
        await this.storage.saveRoundResult({
          session: {
            id: incompleteRound.sessionId || `session_${Date.now()}`,
            playerId: this.playerId,
            gameId: this.gameId,
          },
          roundData: incompleteRound,
          profile: this.profile,
        });
      } catch (err) {
        console.error('[PerformanceTracker] Failed to save incomplete round:', err);
      }

      return {
        round: incompleteRound,
        decision: {
          status: 'insufficient_data',
          decision: 'maintain',
          nextDifficulty: incompleteRound.difficulty,
          rollingScore: null,
        },
        profile: this.profile,
      };
    }

    // Valid completed round with real attempts
    const attempts = this.activeRound.attempts;
    const correctAttempts = this.activeRound.correctAttempts;
    const accuracy = Math.round((correctAttempts / attempts) * 100) / 100;

    const validTimes = this.activeRound.responseTimesMs;
    const avgResponseTimeMs =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : null;
    const averageResponseTimeSec =
      avgResponseTimeMs !== null ? Math.round((avgResponseTimeMs / 1000) * 10) / 10 : null;

    // Response efficiency: normalized score where calm, steady recall gets full marks
    const responseEfficiency =
      avgResponseTimeMs !== null && avgResponseTimeMs > 0 && avgResponseTimeMs < 12000
        ? 1.0
        : 0.8;

    // Rolling consistency across prior valid completed rounds
    const priorValidAccuracies = this.roundHistory
      .filter((r) => r && typeof r.accuracy === 'number' && !r.isAbandoned)
      .map((r) => r.accuracy);
    const recentAccuracies = [...priorValidAccuracies, accuracy].slice(-10);

    const consistency =
      recentAccuracies.length > 1
        ? 1.0 -
          Math.min(
            1.0,
            Math.sqrt(
              recentAccuracies.reduce((sum, a) => sum + Math.pow(a - accuracy, 2), 0) /
                recentAccuracies.length
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
      durationSec,
      activeDurationSec: durationSec,
      completionTimeSec: durationSec,
      status: 'completed',
      attempts,
      correctAttempts,
      incorrectAttempts: this.activeRound.incorrectAttempts,
      questionsTotal: attempts,
      questionsCorrect: correctAttempts,
      accuracy,
      responseTimeMs: avgResponseTimeMs,
      averageResponseTimeSec,
      score: Math.round(performanceScore * 10),
      performanceScore,
      isCorrect: this.activeRound.isCorrect,
      isAbandoned: false,
      eligibleForCVI: true,
      dataQuality: 'verified_gameplay',
      cognitiveScores: this.cognitiveProfile.toJSON(),
    };

    // Update profile tracking
    this.cognitiveProfile.recordCompletedRound();
    this.roundHistory.push(completedRound);

    // Evaluate difficulty adaptation with verified rounds
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
      currentDifficulty: difficultyDecision.nextDifficulty || completedRound.difficulty,
      roundsPlayed: (this.profile?.roundsPlayed || 0) + 1,
      totalRounds: this.cognitiveProfile.totalRounds,
      totalAttempts: this.cognitiveProfile.totalAttempts,
      totalCorrectAttempts: this.cognitiveProfile.totalCorrectAttempts,
      accuracy: this.cognitiveProfile.overallAccuracy,
      sequenceAccuracy: this.cognitiveProfile.sequenceRecallScore,
      spatialAccuracy: this.cognitiveProfile.spatialRecallScore,
      changeDetectionAccuracy: this.cognitiveProfile.changeDetectionScore,
      movementRecallScore: this.cognitiveProfile.movementRecallScore,
      recentScore: difficultyDecision.rollingScore,
      promotionCount,
      demotionCount,
      streak: newStreak,
      sampleCount: this.cognitiveProfile.sampleCount,
      hasEnoughData: this.cognitiveProfile.hasEnoughData,
      cognitiveScores: this.cognitiveProfile.toJSON(),
      updatedAt: new Date().toISOString(),
    };

    // Await persistence operation safely
    try {
      await this.storage.saveRoundResult({
        session: {
          id: completedRound.sessionId || null,
          playerId: this.playerId,
          gameId: this.gameId,
        },
        roundData: completedRound,
        profile: this.profile,
      });
    } catch (err) {
      console.error('[PerformanceTracker] Failed to save completed round:', err);
    }

    // Record into unified caregiver cognitive analytics service
    try {
      await cognitiveAnalytics.recordGameSession({
        gameId: this.gameId,
        gameName: 'Suh Tah Lam (Bamboo Rhythm)',
        domain: 'visual_memory',
        difficulty: completedRound.difficulty,
        durationSec: completedRound.durationSec || 0,
        questionsTotal: completedRound.attempts,
        questionsCorrect: completedRound.correctAttempts,
        accuracy: typeof completedRound.accuracy === 'number' ? Math.round(completedRound.accuracy * 100) : null,
        responseTimeSec:
          typeof completedRound.responseTimeMs === 'number' && completedRound.responseTimeMs > 0
            ? Math.round((completedRound.responseTimeMs / 1000) * 10) / 10
            : null,
        score: typeof completedRound.score === 'number' ? completedRound.score : Math.round((completedRound.performanceScore || 0) * 10),
        patientId: this.playerId,
        metadata: {
          sessionId: completedRound.sessionId || null,
          roundNumber: completedRound.roundNumber,
          eligibleForCVI: completedRound.eligibleForCVI,
        },
      });
    } catch (e) {
      console.error('[SuhTahLam PerformanceTracker] Exception recording session in cognitiveAnalytics:', e);
    }

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
      status: 'abandoned',
      isAbandoned: true,
      accuracy: null,
      averageResponseTimeSec: null,
      responseTimeMs: null,
      performanceScore: null,
      eligibleForCVI: false,
      dataQuality: 'abandoned_session',
    };
    this.activeRound = null;
    this.interactionStartTimestamp = null;
    return abandoned;
  }
}
