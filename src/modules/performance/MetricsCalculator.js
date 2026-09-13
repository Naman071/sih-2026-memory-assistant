/**
 * Centralized Metrics Calculator for Cognitive Games (SIH Memory Assistant)
 *
 * Implements standard, non-clinical gameplay performance metrics:
 * - Accuracy
 * - Error Rate
 * - Response Time distribution (Average, Median, Min, Max)
 * - Response Efficiency (Accuracy > Speed priority)
 * - Rolling Consistency
 * - Composite Performance Score (0.00 - 1.00)
 */

export const DEFAULT_WEIGHTS = {
  accuracy: 0.40,
  taskSuccess: 0.25,
  consistency: 0.15,
  responseEfficiency: 0.10,
  completionBehavior: 0.10,
};

/**
 * Calculates raw accuracy (0.0 to 1.0)
 */
export function calculateAccuracy(correctAttempts, totalAttempts) {
  if (!totalAttempts || totalAttempts <= 0) return 0;
  return Math.min(1, Math.max(0, correctAttempts / totalAttempts));
}

/**
 * Calculates error rate (0.0 to 1.0)
 */
export function calculateErrorRate(incorrectAttempts, totalAttempts) {
  if (!totalAttempts || totalAttempts <= 0) return 0;
  return Math.min(1, Math.max(0, incorrectAttempts / totalAttempts));
}

/**
 * Calculates statistical distribution of response times (in milliseconds)
 */
export function calculateResponseTimeStats(responseTimesMs = []) {
  const validTimes = responseTimesMs.filter((t) => typeof t === 'number' && t > 0);
  if (validTimes.length === 0) {
    return {
      count: 0,
      average: 0,
      median: 0,
      fastest: 0,
      slowest: 0,
    };
  }

  const sorted = [...validTimes].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const average = Math.round(sum / sorted.length);

  let median = 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    median = Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  } else {
    median = sorted[mid];
  }

  return {
    count: sorted.length,
    average,
    median,
    fastest: sorted[0],
    slowest: sorted[sorted.length - 1],
  };
}

/**
 * Calculates response efficiency (0.0 to 1.0)
 *
 * CRITICAL RULE: ACCURACY > SPEED
 * Fast incorrect answers must NOT score higher than slow correct answers.
 */
export function calculateResponseEfficiency(responseTimeMs, isCorrect) {
  if (typeof responseTimeMs !== 'number' || responseTimeMs <= 0) {
    return isCorrect ? 0.7 : 0.2;
  }

  const sec = responseTimeMs / 1000;

  if (isCorrect) {
    // Correct answer:
    // Ideal thoughtful range for older adults: 1.5s - 6.0s
    if (sec >= 1.5 && sec <= 6.0) return 1.0;
    // Quick but correct (1.0s - 1.5s)
    if (sec >= 1.0 && sec < 1.5) return 0.9;
    // Very fast correct (< 1.0s, possible lucky tap)
    if (sec < 1.0) return 0.8;
    // Slower correct (6.0s - 12.0s)
    if (sec > 6.0 && sec <= 12.0) {
      return Math.max(0.65, 1.0 - (sec - 6.0) * 0.05);
    }
    // Very slow correct (> 12.0s)
    return 0.60;
  } else {
    // Incorrect answer:
    // Fast incorrect (< 2.0s) indicates hasty guessing
    if (sec < 2.0) return 0.10;
    // Thoughtful but incorrect (> 2.0s)
    return 0.30;
  }
}

/**
 * Calculates rolling consistency (0.0 to 1.0) based on accuracy variation
 */
export function calculateConsistencyScore(recentValues = []) {
  if (!recentValues || recentValues.length < 2) {
    return recentValues && recentValues.length === 1 ? 1.0 : 0.5;
  }

  const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  if (mean === 0) {
    return recentValues.every((v) => v === 0) ? 1.0 : 0.5;
  }

  const variance =
    recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    recentValues.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation (scale-invariant relative variation)
  const cv = stdDev / Math.abs(mean);

  // Lower variation means higher consistency (clamped to 0.0 - 1.0)
  return Math.max(0, Math.min(1, Math.round((1 - Math.min(1, cv)) * 100) / 100));
}

/**
 * Calculates the composite Normalized Performance Score (0.00 to 1.00)
 *
 * Weighting:
 * - Accuracy: 40%
 * - Task / Memory Success: 25%
 * - Consistency: 15%
 * - Response Efficiency: 10%
 * - Completion Behavior: 10%
 */
export function calculatePerformanceScore(metrics = {}, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const accuracy = typeof metrics.accuracy === 'number' ? metrics.accuracy : 0;
  const taskSuccess = typeof metrics.taskSuccess === 'number' ? metrics.taskSuccess : (metrics.isCorrect ? 1.0 : 0.0);
  const consistency = typeof metrics.consistency === 'number' ? metrics.consistency : 0.7;
  const responseEfficiency = typeof metrics.responseEfficiency === 'number' ? metrics.responseEfficiency : 0.5;
  const completionBehavior = typeof metrics.completedNormally === 'boolean'
    ? (metrics.completedNormally ? 1.0 : 0.2)
    : (metrics.completionBehavior || 1.0);

  const rawScore =
    accuracy * weights.accuracy +
    taskSuccess * weights.taskSuccess +
    consistency * weights.consistency +
    responseEfficiency * weights.responseEfficiency +
    completionBehavior * weights.completionBehavior;

  return Math.max(0.0, Math.min(1.0, Math.round(rawScore * 100) / 100));
}
