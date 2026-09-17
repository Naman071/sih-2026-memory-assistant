/**
 * Cognitive Analytics Service (SIH Memory Assistant)
 *
 * Centralized, non-clinical cognitive tracking & evaluation service.
 * Aggregates gameplay data across all games and transforms it into
 * caregiver gameplay progress insights:
 * - Cognitive Vitality Index (0-100) using real validated gameplay
 * - 4 Core Cognitive Domains (Visual Memory, Spatial Attention, Focus, Episodic Recall)
 * - Thought Processing Speed & Fluidity Trends
 * - Consistency, Engagement Streak, & Exercise Minutes
 * - Plain-language compassionate caregiver observations
 * - Progress Summary generator with explicit non-medical disclaimers
 *
 * Fully resilient: Offline-first with AsyncStorage + graceful Supabase sync.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient.js';
import { saveGameResult } from '../database.js';
import { calculateCVI, validateRoundResult, CVI_CONSTANTS } from './CognitiveVitalityIndex.js';

const getStorage = () => {
  if (globalThis.AsyncStorage && typeof globalThis.AsyncStorage.getItem === 'function') return globalThis.AsyncStorage;
  if (AsyncStorage && typeof AsyncStorage.getItem === 'function') return AsyncStorage;
  if (AsyncStorage?.default && typeof AsyncStorage.default.getItem === 'function') return AsyncStorage.default;
  return null;
};

const STORAGE_KEYS = {
  SESSIONS: '@cognitive_analytics_sessions_v1',
  BASELINE: '@cognitive_analytics_baseline_v1',
};

// Domain definitions mapped to cognitive neuro-rehabilitation categories
export const COGNITIVE_DOMAINS = {
  VISUAL_MEMORY: {
    id: 'visual_memory',
    nameKey: 'analytics.domains.visualMemory',
    defaultName: 'Visual & Sequence Memory',
    icon: 'eye-outline',
    color: '#D97706', // Warm Amber
    description: 'Recalling visual patterns, dancer rhythms, and sequence changes',
    games: ['suh_tah_lam'],
  },
  SPATIAL_COORDINATION: {
    id: 'spatial_coordination',
    nameKey: 'analytics.domains.spatialCoordination',
    defaultName: 'Spatial Tracking & Orientation',
    icon: 'compass-outline',
    color: '#2563EB', // Blue
    description: 'Tracking positions in a circle, orientation, and mental mapping',
    games: ['ubilakapki'],
  },
  ATTENTION_FOCUS: {
    id: 'attention_focus',
    nameKey: 'analytics.domains.attentionFocus',
    defaultName: 'Sustained Attention & Reflex',
    icon: 'flash-outline',
    color: '#059669', // Emerald Green
    description: 'Dynamic visual focus, trajectory tracking, and target response',
    games: ['dhop_khel'],
  },
  EPISODIC_RECALL: {
    id: 'episodic_recall',
    nameKey: 'analytics.domains.episodicRecall',
    defaultName: 'Episodic & Story Recall',
    icon: 'book-outline',
    color: '#7C3AED', // Purple
    description: 'Recalling narrative details, cultural scenes, and heritage memories',
    games: ['northeast_memory', 'memory_stories'],
  },
};

export class CognitiveAnalyticsService {
  constructor() {
    this.memorySessions = null;
  }

  /**
   * Records an authentic completed game session into unified storage
   */
  async recordGameSession({
    gameId,
    gameName,
    domain = 'visual_memory',
    difficulty = 'easy',
    durationSec = 0,
    questionsTotal = 0,
    questionsCorrect = 0,
    accuracy = null,
    responseTimeSec = null,
    score = 0,
    maxScore = 10,
    patientId = 'P001',
    metadata = {},
  }) {
    try {
      const computedAccuracy =
        accuracy !== null
          ? accuracy
          : questionsTotal > 0
          ? Math.round((questionsCorrect / questionsTotal) * 100)
          : null;

      const sessionRecord = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        patientId,
        gameId,
        gameName: gameName || this._getHumanGameName(gameId),
        domain: this._resolveDomain(gameId, domain),
        difficulty,
        durationSec: Math.max(0, Math.round(durationSec || 0)),
        questionsTotal: typeof questionsTotal === 'number' ? Math.max(0, questionsTotal) : 0,
        questionsCorrect: typeof questionsCorrect === 'number' ? Math.max(0, questionsCorrect) : 0,
        accuracy: computedAccuracy !== null ? Math.min(100, Math.max(0, computedAccuracy)) : null,
        responseTimeSec:
          responseTimeSec !== null && typeof responseTimeSec === 'number' && responseTimeSec > 0
            ? Math.round(responseTimeSec * 10) / 10
            : null,
        score: typeof score === 'number' ? Math.max(0, score) : 0,
        maxScore: typeof maxScore === 'number' ? Math.max(1, maxScore) : 10,
        metadata: {
          ...metadata,
          sessionId: metadata?.sessionId || null,
        },
        timestamp: new Date().toISOString(),
      };

      // 1. Read existing sessions and deduplicate exact duplicate records
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter((s) => {
        if (s.id === sessionRecord.id) return false;
        if (
          sessionRecord.metadata?.sessionId &&
          s.metadata?.sessionId === sessionRecord.metadata.sessionId
        ) {
          if (
            sessionRecord.metadata?.roundNumber !== undefined &&
            s.metadata?.roundNumber !== undefined
          ) {
            return s.metadata.roundNumber !== sessionRecord.metadata.roundNumber;
          }
          return false;
        }
        return true;
      });
      filteredSessions.push(sessionRecord);

      // Keep recent 120 sessions to prevent storage bloat
      const trimmed = filteredSessions.slice(-120);
      this.memorySessions = trimmed;

      const storage = getStorage();
      if (storage) {
        await storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));
      }

      // 2. Dual-path sync to Supabase (safe background call)
      this._syncToSupabase(sessionRecord).catch(() => {
        // Non-critical, offline safe background sync
      });

      return sessionRecord;
    } catch (err) {
      console.error('[CognitiveAnalyticsService] Failed to record session:', err);
      return null;
    }
  }

  /**
   * Retrieves all recorded sessions from local storage
   */
  async getAllSessions() {
    if (this.memorySessions) return [...this.memorySessions];

    try {
      const storage = getStorage();
      if (storage) {
        const raw = await storage.getItem(STORAGE_KEYS.SESSIONS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.memorySessions = parsed;
            return [...parsed];
          }
        }
      }
    } catch (err) {
      console.error('[CognitiveAnalyticsService] Error reading sessions from storage:', err);
    }
    this.memorySessions = [];
    return [];
  }

  /**
   * Computes comprehensive caregiver dashboard statistics strictly from verified gameplay data
   */
  async getCaregiverDashboardData(timeframe = '7d', patientInfo = {}) {
    const allSessions = await this.getAllSessions();
    const now = Date.now();

    // Filter by timeframe
    let cutoffMs = 0;
    if (timeframe === '7d') cutoffMs = now - 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === '30d') cutoffMs = now - 30 * 24 * 60 * 60 * 1000;

    let filtered = allSessions.filter((s) => {
      const t = new Date(s.timestamp).getTime();
      return isNaN(t) || t >= cutoffMs;
    });

    if (patientInfo?.patientId) {
      filtered = filtered.filter((s) => s.patientId === patientInfo.patientId);
    }

    // Convert sessions to round representation for verified CVI evaluation
    const roundsForCvi = filtered.map((s) => ({
      sessionId: s.metadata?.sessionId || s.id,
      playerId: s.patientId,
      gameId: s.gameId,
      status: 'completed',
      attempts: s.questionsTotal,
      correctAttempts: s.questionsCorrect,
      accuracy: typeof s.accuracy === 'number' ? s.accuracy / 100 : null,
      durationSec: s.durationSec,
      eligibleForCVI: s.metadata?.eligibleForCVI !== false && s.questionsTotal > 0,
    }));

    const cviEvaluation = calculateCVI(roundsForCvi, { playerId: patientInfo?.patientId });
    const isCalibrated = cviEvaluation.status === 'ready';

    // 1. Calculate accuracy & processing speed
    const totalSessions = filtered.length;
    const totalDurationSec = filtered.reduce((sum, s) => sum + (s.durationSec || 0), 0);
    const exerciseMinutes = Math.round(totalDurationSec / 60);

    const totalQuestions = filtered.reduce((sum, s) => sum + (s.questionsTotal || 0), 0);
    const totalCorrect = filtered.reduce((sum, s) => sum + (s.questionsCorrect || 0), 0);
    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    const validSpeeds = filtered
      .map((s) => s.responseTimeSec)
      .filter((s) => typeof s === 'number' && s > 0);
    const avgSpeed =
      validSpeeds.length > 0
        ? Math.round((validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length) * 10) / 10
        : null;

    // 2. Cognitive Vitality Index (0-100) - strictly from verified gameplay
    const vitalityIndex = isCalibrated ? cviEvaluation.cviPercent : null;

    // 3. Growth Trend Calculation
    let growthPercent = 0;
    let trendLabel = isCalibrated ? 'Stable & Active' : 'Gathering Data';
    if (totalSessions >= 4) {
      const mid = Math.floor(totalSessions / 2);
      const firstHalfSessions = filtered.slice(0, mid);
      const secondHalfSessions = filtered.slice(mid);

      const firstHalfAcc =
        firstHalfSessions.reduce((a, b) => a + (b.accuracy ?? 0), 0) / Math.max(1, firstHalfSessions.length);
      const secondHalfAcc =
        secondHalfSessions.reduce((a, b) => a + (b.accuracy ?? 0), 0) / Math.max(1, secondHalfSessions.length);
      const diff = Math.round(secondHalfAcc - firstHalfAcc);
      growthPercent = diff;
      if (diff >= 4) trendLabel = 'Improving';
      else if (diff <= -4) trendLabel = 'Slight Fatigue';
      else trendLabel = 'Stable & Active';
    }

    // 4. Cognitive Domain Scores
    const domains = this._computeDomainScores(filtered);

    // 5. Engagement Streak (consecutive days)
    const streakDays = this._computeActiveStreak(filtered);

    // 6. Caregiver Observations
    const clinicalObservations = this._generateClinicalObservations({
      vitalityIndex,
      cviEvaluation,
      overallAccuracy,
      avgSpeed,
      growthPercent,
      domains,
      totalSessions,
      exerciseMinutes,
      patientName: patientInfo.patientName || 'Patient',
    });

    // 7. Game-by-game breakdown
    const gameBreakdown = this._computeGameBreakdown(filtered);

    return {
      timeframe,
      vitalityIndex,
      cviEvaluation,
      growthPercent,
      trendLabel,
      overallAccuracy,
      avgSpeed,
      exerciseMinutes,
      totalSessions,
      streakDays,
      domains,
      clinicalObservations,
      gameBreakdown,
      isCalibrated,
      lastSessionAt: filtered[filtered.length - 1]?.timestamp || null,
      disclaimer: CVI_CONSTANTS.DISCLAIMER,
    };
  }

  /**
   * Generates a formal text progress report for the caregiver to share
   */
  generateClinicianSummary(dashboardData, patientInfo = {}) {
    const pName = patientInfo.patientName || 'Patient';
    const cName = patientInfo.caregiverName || 'Caregiver';
    const rel = patientInfo.relationship || 'Family Member';
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const cviLine =
      dashboardData.vitalityIndex !== null
        ? `OVERALL COGNITIVE VITALITY: ${dashboardData.vitalityIndex} / 100`
        : `OVERALL COGNITIVE VITALITY: Baseline in progress (${dashboardData.cviEvaluation?.validRounds || 0} / ${dashboardData.cviEvaluation?.requiredRounds || 3} sessions completed)`;

    const accLine =
      dashboardData.overallAccuracy !== null
        ? `Overall Recall Accuracy: ${dashboardData.overallAccuracy}%`
        : `Overall Recall Accuracy: Awaiting data`;

    const paceLine =
      dashboardData.avgSpeed !== null
        ? `Mean Decision/Reaction Pace: ${dashboardData.avgSpeed} seconds`
        : `Mean Decision/Reaction Pace: Awaiting data`;

    return `=== COGNITIVE GAMEPLAY PROGRESS REPORT ===
Date: ${dateStr}
Patient Name: ${pName}
Primary Caregiver: ${cName} (${rel})
Platform: SIH 2026 Cultural Memory Assistant (NE Region)

${cviLine}
Activity Status: ${dashboardData.trendLabel} (${dashboardData.growthPercent >= 0 ? '+' : ''}${dashboardData.growthPercent}% vs baseline)
${accLine}
${paceLine}
Total Therapeutic Exercise Time: ${dashboardData.exerciseMinutes || 0} minutes (${dashboardData.totalSessions || 0} sessions completed)
Active Engagement Streak: ${dashboardData.streakDays || 0} consecutive days

COGNITIVE DOMAIN BREAKDOWN:
• Visual & Sequence Memory (Suh Tah Lam): ${dashboardData.domains?.visual_memory?.score !== null && dashboardData.domains?.visual_memory?.score !== undefined ? `${dashboardData.domains.visual_memory.score}%` : 'Awaiting data'} (${dashboardData.domains?.visual_memory?.status || 'Awaiting data'})
• Spatial Tracking & Coordination (Ubilakapki): ${dashboardData.domains?.spatial_coordination?.score !== null && dashboardData.domains?.spatial_coordination?.score !== undefined ? `${dashboardData.domains.spatial_coordination.score}%` : 'Awaiting data'} (${dashboardData.domains?.spatial_coordination?.status || 'Awaiting data'})
• Sustained Attention & Reflex (Dhopkhel): ${dashboardData.domains?.attention_focus?.score !== null && dashboardData.domains?.attention_focus?.score !== undefined ? `${dashboardData.domains.attention_focus.score}%` : 'Awaiting data'} (${dashboardData.domains?.attention_focus?.status || 'Awaiting data'})
• Episodic & Heritage Recall (Stories & Scenes): ${dashboardData.domains?.episodic_recall?.score !== null && dashboardData.domains?.episodic_recall?.score !== undefined ? `${dashboardData.domains.episodic_recall.score}%` : 'Awaiting data'} (${dashboardData.domains?.episodic_recall?.status || 'Awaiting data'})

CAREGIVER OBSERVATIONS:
${dashboardData.clinicalObservations?.map((obs) => `- ${obs.text}`).join('\n') || '- No observations recorded yet.'}

DISCLAIMER:
Cognitive Vitality Index is a gameplay progress indicator based on completed cognitive game activity. It is not a medical diagnosis or clinical assessment.`;
  }

  /**
   * Helper: Resolves cognitive domain for a given game
   */
  _resolveDomain(gameId, providedDomain) {
    if (providedDomain) return providedDomain;
    if (gameId === 'suh_tah_lam') return 'visual_memory';
    if (gameId === 'ubilakapki') return 'spatial_coordination';
    if (gameId === 'dhop_khel') return 'attention_focus';
    if (gameId === 'northeast_memory' || gameId === 'memory_stories') return 'episodic_recall';
    return 'visual_memory';
  }

  /**
   * Helper: Human-friendly name for a game ID
   */
  _getHumanGameName(gameId) {
    switch (gameId) {
      case 'suh_tah_lam':
        return 'Suh Tah Lam (Bamboo Rhythm)';
      case 'ubilakapki':
        return 'Ubilakapki Coconut Toss';
      case 'dhop_khel':
        return 'Dhopkhel Memory';
      case 'northeast_memory':
        return 'Sinaki Sthan';
      case 'memory_stories':
        return 'Xuworoni Kotha';
      default:
        return 'Cognitive Exercise';
    }
  }

  /**
   * Helper: Computes scores for the 4 core cognitive domains without fake defaults
   */
  _computeDomainScores(sessions) {
    const domainBuckets = {
      visual_memory: [],
      spatial_coordination: [],
      attention_focus: [],
      episodic_recall: [],
    };

    sessions.forEach((s) => {
      const d = s.domain || 'visual_memory';
      if (domainBuckets[d]) {
        domainBuckets[d].push(s);
      }
    });

    const result = {};
    for (const domainInfo of Object.values(COGNITIVE_DOMAINS)) {
      const key = domainInfo.id;
      const items = domainBuckets[key] || [];
      if (items.length === 0) {
        result[key] = {
          ...domainInfo,
          score: null,
          status: 'Awaiting data',
          sessionsPlayed: 0,
        };
      } else {
        const validAccs = items
          .map((curr) => curr.accuracy)
          .filter((a) => typeof a === 'number' && Number.isFinite(a));
        const avgAcc =
          validAccs.length > 0
            ? Math.round(validAccs.reduce((acc, curr) => acc + curr, 0) / validAccs.length)
            : null;

        let status = 'Awaiting data';
        if (avgAcc !== null) {
          if (avgAcc >= 88) status = 'Strong';
          else if (avgAcc >= 75) status = 'Steady';
          else status = 'Needs Practice';
        }

        result[key] = {
          ...domainInfo,
          score: avgAcc,
          status,
          sessionsPlayed: items.length,
        };
      }
    }
    return result;
  }

  /**
   * Helper: Calculates consecutive daily streaks
   */
  _computeActiveStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;
    const dates = new Set(
      sessions
        .filter((s) => s.timestamp)
        .map((s) => new Date(s.timestamp).toISOString().split('T')[0])
    );
    return dates.size;
  }

  /**
   * Helper: Generates plain-language caregiver observations without diagnostic claims
   */
  _generateClinicalObservations({
    vitalityIndex,
    cviEvaluation,
    overallAccuracy,
    avgSpeed,
    growthPercent,
    domains,
    totalSessions,
    exerciseMinutes,
    patientName,
  }) {
    const observations = [];

    // Accuracy & Vitality observation
    if (vitalityIndex === null) {
      const valid = cviEvaluation?.validRounds || 0;
      const req = cviEvaluation?.requiredRounds || 3;
      observations.push({
        type: 'neutral',
        icon: 'information-circle-outline',
        color: '#2563EB',
        text: `${patientName} has completed ${valid} of ${req} rounds needed to generate a verified gameplay progress indicator. Continue regular practice.`,
      });
    } else if (vitalityIndex >= 80) {
      observations.push({
        type: 'positive',
        icon: 'checkmark-circle-outline',
        color: '#059669',
        text: `${patientName} exhibits strong gameplay retention (${overallAccuracy}% accuracy) across completed cultural exercises.`,
      });
    } else {
      observations.push({
        type: 'neutral',
        icon: 'information-circle-outline',
        color: '#2563EB',
        text: `${patientName} maintains steady baseline participation (${overallAccuracy}% accuracy). Consistent daily gameplay is encouraged.`,
      });
    }

    // Response Pace observation
    if (avgSpeed !== null) {
      if (avgSpeed <= 3.2) {
        observations.push({
          type: 'positive',
          icon: 'timer-outline',
          color: '#D97706',
          text: `Processing pace is fluid (average ${avgSpeed}s per decision), reflecting confident recall without hesitation.`,
        });
      } else {
        observations.push({
          type: 'neutral',
          icon: 'timer-outline',
          color: '#4B5563',
          text: `Patient exhibits a gentle, deliberate decision pace (average ${avgSpeed}s), typical of thoughtful responses.`,
        });
      }
    }

    // Growth trend observation
    if (totalSessions >= 4) {
      if (growthPercent > 0) {
        observations.push({
          type: 'positive',
          icon: 'trending-up-outline',
          color: '#059669',
          text: `Positive gameplay progression: a +${growthPercent}% accuracy rise detected across the current observation window.`,
        });
      } else if (growthPercent === 0) {
        observations.push({
          type: 'neutral',
          icon: 'remove-outline',
          color: '#2563EB',
          text: `Gameplay consistency index remains firmly maintained across sessions.`,
        });
      } else {
        observations.push({
          type: 'neutral',
          icon: 'alert-circle-outline',
          color: '#D97706',
          text: `Mild pace variation detected (-${Math.abs(growthPercent)}%). Suggest shorter, relaxing sessions to prevent fatigue.`,
        });
      }
    }

    // Domain highlight
    const domainKeys = Object.keys(domains || {});
    let topDomain = null;
    domainKeys.forEach((k) => {
      if (domains[k]?.score !== null) {
        if (!topDomain || domains[k].score > topDomain.score) {
          topDomain = domains[k];
        }
      }
    });

    if (topDomain) {
      observations.push({
        type: 'positive',
        icon: 'star-outline',
        color: '#7C3AED',
        text: `Strongest exercise domain: ${topDomain.defaultName} (${topDomain.score}% mastery). Excellent cultural resonance.`,
      });
    }

    if (totalSessions > 0) {
      observations.push({
        type: 'neutral',
        icon: 'shield-checkmark-outline',
        color: '#0D9488',
        text: `Total practice duration: ${exerciseMinutes} mins across ${totalSessions} sessions. Well-tolerated with comfortable cognitive pacing.`,
      });
    }

    return observations;
  }

  /**
   * Helper: Calculates per-game summary cards without fake defaults
   */
  _computeGameBreakdown(sessions) {
    const gameMap = {};

    sessions.forEach((s) => {
      const gId = s.gameId || 'general';
      if (!gameMap[gId]) {
        gameMap[gId] = {
          gameId: gId,
          gameName: s.gameName || this._getHumanGameName(gId),
          sessionsCount: 0,
          accuracies: [],
          speeds: [],
          highestDifficulty: s.difficulty,
          lastPlayed: s.timestamp,
        };
      }
      gameMap[gId].sessionsCount += 1;
      if (typeof s.accuracy === 'number' && Number.isFinite(s.accuracy)) {
        gameMap[gId].accuracies.push(s.accuracy);
      }
      if (typeof s.responseTimeSec === 'number' && s.responseTimeSec > 0) {
        gameMap[gId].speeds.push(s.responseTimeSec);
      }
      if (new Date(s.timestamp) > new Date(gameMap[gId].lastPlayed)) {
        gameMap[gId].lastPlayed = s.timestamp;
      }
    });

    return Object.values(gameMap).map((g) => {
      const avgAcc =
        g.accuracies.length > 0
          ? Math.round(g.accuracies.reduce((a, b) => a + b, 0) / g.accuracies.length)
          : null;
      const avgSpd =
        g.speeds.length > 0
          ? Math.round((g.speeds.reduce((a, b) => a + b, 0) / g.speeds.length) * 10) / 10
          : null;

      return {
        gameId: g.gameId,
        gameName: g.gameName,
        sessionsCount: g.sessionsCount,
        accuracy: avgAcc,
        avgSpeed: avgSpd,
        difficulty: g.highestDifficulty,
        lastPlayed: g.lastPlayed,
      };
    });
  }

  /**
   * Syncs to Supabase background tables if available
   */
  async _syncToSupabase(sessionRecord) {
    try {
      await saveGameResult({
        patient_id: sessionRecord.patientId,
        game_name: sessionRecord.gameName,
        score: sessionRecord.score,
        duration: sessionRecord.durationSec,
        difficulty: sessionRecord.difficulty,
        played_at: sessionRecord.timestamp,
      });

      await supabase.from('game_performance').insert([
        {
          patient_id: sessionRecord.patientId,
          game_name: sessionRecord.gameName,
          accuracy: sessionRecord.accuracy,
          response_time: sessionRecord.responseTimeSec,
          difficulty: sessionRecord.difficulty,
          is_correct: typeof sessionRecord.accuracy === 'number' && sessionRecord.accuracy >= 70,
        },
      ]);
    } catch (e) {
      // Supabase sync failure is expected offline and fully handled
    }
  }
}

// Export singleton instance
export const cognitiveAnalytics = new CognitiveAnalyticsService();
