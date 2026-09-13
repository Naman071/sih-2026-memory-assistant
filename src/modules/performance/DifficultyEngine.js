/**
 * Centralized Adaptive Difficulty Engine for Cognitive Games (SIH Memory Assistant)
 *
 * Implements:
 * - 3 Tiers: EASY, MEDIUM, HARD
 * - Configurable promotion, stay, and demotion thresholds
 * - Minimum rounds required (anti-rush safeguard)
 * - Hysteresis to avoid flapping back and forth
 * - Priority of accuracy and sustained performance over speed
 */

export const DEFAULT_DIFFICULTY_CONFIG = {
  minRoundsForPromotion: 3,
  minRoundsForDemotion: 2,
  promotionThresholds: {
    easyToMedium: 0.80,
    mediumToHard: 0.85,
  },
  demotionThresholds: {
    hardToMedium: 0.50,
    mediumToEasy: 0.45,
  },
  recentWindowSize: 5,
};

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export class DifficultyEngine {
  constructor(customConfig = {}) {
    this.config = {
      ...DEFAULT_DIFFICULTY_CONFIG,
      ...customConfig,
      promotionThresholds: {
        ...DEFAULT_DIFFICULTY_CONFIG.promotionThresholds,
        ...(customConfig.promotionThresholds || {}),
      },
      demotionThresholds: {
        ...DEFAULT_DIFFICULTY_CONFIG.demotionThresholds,
        ...(customConfig.demotionThresholds || {}),
      },
    };
  }

  /**
   * Evaluates player history and returns the recommended difficulty.
   *
   * @param {Object} params
   * @param {string} params.currentDifficulty - 'easy' | 'medium' | 'hard'
   * @param {Array<Object>} params.roundHistory - Recent round records with score/isCorrect/performanceScore
   * @returns {Object} Evaluation result
   */
  evaluate({ currentDifficulty = 'easy', roundHistory = [] }) {
    const validRounds = roundHistory.filter(
      (r) => r && typeof r.performanceScore === 'number' && !r.isAbandoned
    );

    // Filter to rounds played at the current difficulty tier to measure current mastery
    const currentTierRounds = validRounds.filter(
      (r) => (r.difficulty || 'easy').toLowerCase() === currentDifficulty.toLowerCase()
    );

    const windowRounds = currentTierRounds.slice(-this.config.recentWindowSize);
    const totalTierRounds = currentTierRounds.length;

    if (totalTierRounds === 0) {
      return {
        nextDifficulty: currentDifficulty,
        decision: 'stay',
        reason: 'No completed rounds at current difficulty tier yet.',
        rollingScore: 0,
        roundsEvaluated: 0,
        streak: 0,
      };
    }

    // Calculate rolling score across recent window
    const rollingScore =
      Math.round(
        (windowRounds.reduce((acc, r) => acc + r.performanceScore, 0) / windowRounds.length) * 100
      ) / 100;

    // Calculate current win streak
    let streak = 0;
    for (let i = currentTierRounds.length - 1; i >= 0; i--) {
      if (currentTierRounds[i].isCorrect) {
        streak++;
      } else {
        break;
      }
    }

    const {
      minRoundsForPromotion,
      minRoundsForDemotion,
      promotionThresholds,
      demotionThresholds,
    } = this.config;

    // Check Promotion Rules
    if (currentDifficulty.toLowerCase() === 'easy') {
      if (
        totalTierRounds >= minRoundsForPromotion &&
        rollingScore >= promotionThresholds.easyToMedium
      ) {
        return {
          nextDifficulty: 'medium',
          decision: 'promote',
          reason: `Strong sustained performance on Easy (${Math.round(rollingScore * 100)}% score over ${windowRounds.length} rounds).`,
          rollingScore,
          roundsEvaluated: windowRounds.length,
          streak,
        };
      }
    } else if (currentDifficulty.toLowerCase() === 'medium') {
      // Promotion check
      if (
        totalTierRounds >= minRoundsForPromotion &&
        rollingScore >= promotionThresholds.mediumToHard
      ) {
        return {
          nextDifficulty: 'hard',
          decision: 'promote',
          reason: `Strong sustained performance on Medium (${Math.round(rollingScore * 100)}% score over ${windowRounds.length} rounds).`,
          rollingScore,
          roundsEvaluated: windowRounds.length,
          streak,
        };
      }

      // Demotion check (hysteresis: require multiple struggling rounds)
      if (
        totalTierRounds >= minRoundsForDemotion &&
        rollingScore < demotionThresholds.mediumToEasy
      ) {
        return {
          nextDifficulty: 'easy',
          decision: 'demote',
          reason: `Gentle adaptation to Easy to build confidence (${Math.round(rollingScore * 100)}% score).`,
          rollingScore,
          roundsEvaluated: windowRounds.length,
          streak,
        };
      }
    } else if (currentDifficulty.toLowerCase() === 'hard') {
      // Demotion check
      if (
        totalTierRounds >= minRoundsForDemotion &&
        rollingScore < demotionThresholds.hardToMedium
      ) {
        return {
          nextDifficulty: 'medium',
          decision: 'demote',
          reason: `Adapting to Medium for a more comfortable pace (${Math.round(rollingScore * 100)}% score).`,
          rollingScore,
          roundsEvaluated: windowRounds.length,
          streak,
        };
      }
    }

    // Default Stay Rule
    return {
      nextDifficulty: currentDifficulty,
      decision: 'stay',
      reason: `Performance stable at current level (${Math.round(rollingScore * 100)}% score).`,
      rollingScore,
      roundsEvaluated: windowRounds.length,
      streak,
    };
  }
}

export const defaultDifficultyEngine = new DifficultyEngine();

