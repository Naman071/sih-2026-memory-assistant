/**
 * SUH TAH LAM - Adaptive Difficulty Engine
 *
 * Implements smooth difficulty adaptation with hysteresis:
 * - 3 levels: 'easy', 'medium', 'hard'
 * - Requires minimum 3 completed rounds at current level before promoting
 * - Never oscillates rapidly (gradual step-by-step promotion/demotion)
 * - Prioritizes cognitive accuracy over speed
 */

export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'easy',
    movementEvents: 3,
    spatialPositions: 3,
    holdDuration: 2400,
    travelDuration: 1600,
    allowedDancerSteps: ['step_left', 'step_right', 'step_center'],
    questionCount: 2,
    description: 'Calm rhythm, 3 steps, clear spatial positions',
  },
  medium: {
    name: 'medium',
    movementEvents: 5,
    spatialPositions: 5,
    holdDuration: 1800,
    travelDuration: 1200,
    allowedDancerSteps: ['step_left', 'step_right', 'step_center', 'turn'],
    questionCount: 3,
    description: 'Moderate rhythm, 5 steps, intermediate recall',
  },
  hard: {
    name: 'hard',
    movementEvents: 7,
    spatialPositions: 7,
    holdDuration: 1500,
    travelDuration: 1000,
    allowedDancerSteps: ['step_left', 'step_right', 'step_center', 'turn', 'diagonal_step'],
    questionCount: 4,
    description: 'Complex rhythmic sequences, multi-step reconstruction',
  },
};

export class DifficultyEngine {
  constructor({
    promotionThreshold = 0.85,
    demotionThreshold = 0.45,
    minRoundsBeforeChange = 3,
  } = {}) {
    this.promotionThreshold = promotionThreshold;
    this.demotionThreshold = demotionThreshold;
    this.minRoundsBeforeChange = minRoundsBeforeChange;
  }

  /**
   * Calculates performance score using weighted cognitive components:
   * Accuracy: 45%
   * Task Success: 20%
   * Consistency: 15%
   * Sequence / Spatial Accuracy: 10%
   * Response Efficiency: 10%
   */
  calculateWeightedScore({
    accuracy = 1.0,
    taskSuccess = 1.0,
    consistency = 1.0,
    domainAccuracy = 1.0,
    responseEfficiency = 0.8,
  }) {
    const score =
      0.45 * Math.max(0, Math.min(1, accuracy)) +
      0.20 * Math.max(0, Math.min(1, taskSuccess)) +
      0.15 * Math.max(0, Math.min(1, consistency)) +
      0.10 * Math.max(0, Math.min(1, domainAccuracy)) +
      0.10 * Math.max(0, Math.min(1, responseEfficiency));

    return Math.round(score * 1000) / 1000;
  }

  /**
   * Evaluates historical performance and returns next difficulty with hysteresis
   */
  evaluate({ currentDifficulty = 'easy', roundHistory = [] }) {
    // Filter rounds played at current difficulty
    const currentDiffRounds = roundHistory.filter((r) => r.difficulty === currentDifficulty);

    if (currentDiffRounds.length < this.minRoundsBeforeChange) {
      return {
        decision: 'maintain',
        nextDifficulty: currentDifficulty,
        reason: `Gathering baseline data (${currentDiffRounds.length}/${this.minRoundsBeforeChange} rounds)`,
        rollingScore: 0.8,
      };
    }

    // Look at last 3 to 5 rounds at current difficulty
    const recent = currentDiffRounds.slice(-5);
    const rollingScore =
      recent.reduce((sum, r) => sum + (r.performanceScore || 0.8), 0) / recent.length;

    let nextDifficulty = currentDifficulty;
    let decision = 'maintain';
    let reason = 'Performance is stable within target parameters';

    if (rollingScore >= this.promotionThreshold) {
      if (currentDifficulty === 'easy') {
        nextDifficulty = 'medium';
        decision = 'promote';
        reason = 'High rolling performance; progressing smoothly to medium';
      } else if (currentDifficulty === 'medium') {
        nextDifficulty = 'hard';
        decision = 'promote';
        reason = 'Consistently strong recall; progressing smoothly to hard';
      }
    } else if (rollingScore <= this.demotionThreshold) {
      if (currentDifficulty === 'hard') {
        nextDifficulty = 'medium';
        decision = 'demote';
        reason = 'Adjusting challenge to maintain comfortable cognitive pacing';
      } else if (currentDifficulty === 'medium') {
        nextDifficulty = 'easy';
        decision = 'demote';
        reason = 'Returning to gentle base rhythm to reinforce confidence';
      }
    }

    return {
      decision,
      currentDifficulty,
      nextDifficulty,
      rollingScore: Math.round(rollingScore * 100) / 100,
      reason,
    };
  }

  getConfig(difficulty) {
    return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  }
}

export const defaultDifficultyEngine = new DifficultyEngine();

