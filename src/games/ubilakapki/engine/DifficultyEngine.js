/**
 * UBILAKAPKI - Adaptive Difficulty Engine
 * Evaluates multi-round rolling performance for elderly cognitive wellness.
 * Incorporates hysteresis to prevent abrupt swings from a single accidental error.
 */

import { DIFFICULTY_LEVELS } from '../data/levels.js';

export class DifficultyEngine {
  constructor(initialLevel = 'easy', windowSize = 3) {
    this.currentLevel = initialLevel;
    this.windowSize = windowSize;
    this.history = []; // Array of { isCorrect, responseTimeSec, score }
  }

  setLevel(level) {
    if (DIFFICULTY_LEVELS.includes(level)) {
      this.currentLevel = level;
    }
  }

  getLevel() {
    return this.currentLevel;
  }

  recordRound({ isCorrect, responseTimeSec = 4.0 }) {
    // Dementia-friendly scoring calculation
    const accuracyScore = isCorrect ? 1.0 : 0.0;
    // Normalized response score (comfortable time between 2s and 10s)
    const normResp = Math.max(0, Math.min(1, (10 - responseTimeSec) / 8));
    // Composite round score
    const roundScore = accuracyScore * 0.7 + normResp * 0.3;

    this.history.push({
      isCorrect: Boolean(isCorrect),
      responseTimeSec,
      score: roundScore,
      level: this.currentLevel,
      timestamp: Date.now(),
    });

    if (this.history.length > 20) {
      this.history.shift();
    }

    return this.evaluateProgression();
  }

  evaluateProgression() {
    if (this.history.length < this.windowSize) {
      return {
        level: this.currentLevel,
        decision: 'maintain',
        reason: 'Collecting initial baseline observation window',
      };
    }

    const recent = this.history.slice(-this.windowSize);
    const recentCorrect = recent.filter((r) => r.isCorrect).length;
    const recentAvgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;

    // Promotion criteria: 3 consecutive correct in window with good engagement
    if (this.currentLevel === 'easy' && recentCorrect === this.windowSize && recentAvgScore >= 0.75) {
      this.currentLevel = 'medium';
      return {
        level: 'medium',
        decision: 'promote',
        reason: 'Consistently accurate across Easy tier sequence recall',
      };
    }

    if (this.currentLevel === 'medium' && recentCorrect === this.windowSize && recentAvgScore >= 0.80) {
      this.currentLevel = 'hard';
      return {
        level: 'hard',
        decision: 'promote',
        reason: 'Mastery of 4-player circular passing sequence',
      };
    }

    // Demotion / support criteria: 2 or more errors in window
    if (this.currentLevel === 'hard' && recentCorrect <= 1) {
      this.currentLevel = 'medium';
      return {
        level: 'medium',
        decision: 'demote',
        reason: 'Adjusting to comfortable pace to preserve confidence',
      };
    }

    if (this.currentLevel === 'medium' && recentCorrect <= 1) {
      this.currentLevel = 'easy';
      return {
        level: 'easy',
        decision: 'demote',
        reason: 'Returning to 3-player gentle observation tier',
      };
    }

    return {
      level: this.currentLevel,
      decision: 'maintain',
      reason: 'Performance stable within target engagement zone',
    };
  }

  getMetricsSummary() {
    if (this.history.length === 0) {
      return {
        roundsPlayed: 0,
        accuracy: 0,
        averageResponseTimeSec: 0,
        trend: 'Starting Journey',
      };
    }

    const total = this.history.length;
    const correct = this.history.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correct / total) * 100);
    const avgResp = (
      this.history.reduce((sum, r) => sum + r.responseTimeSec, 0) / total
    ).toFixed(1);

    const recent = this.history.slice(-3);
    const recentCorrect = recent.filter((r) => r.isCorrect).length;
    let trend = 'Stable & Focused';
    if (recentCorrect === recent.length && total >= 3) {
      trend = 'Attentive & Improving';
    } else if (recentCorrect <= 1 && total >= 3) {
      trend = 'Calm & Steady';
    }

    return {
      roundsPlayed: total,
      accuracy,
      averageResponseTimeSec: parseFloat(avgResp),
      trend,
    };
  }

  reset() {
    this.history = [];
    this.currentLevel = 'easy';
  }
}

