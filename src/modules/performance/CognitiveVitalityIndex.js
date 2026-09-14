/**
 * Cognitive Vitality Index (CVI) Module
 * (SIH Memory Assistant)
 *
 * CVI is a transparent, non-medical gameplay progress indicator synthesized from
 * verified completed cognitive gameplay rounds.
 *
 * DISCLAIMER:
 * Cognitive Vitality Index is a gameplay progress indicator based on completed
 * cognitive game activity. It is not a medical diagnosis, dementia severity score,
 * clinical assessment, or medical prediction.
 */

export const CVI_CONSTANTS = {
  CALCULATION_VERSION: 'cvi_v1',
  DEFAULT_REQUIRED_ROUNDS: 3,
  WEIGHT_ACCURACY: 0.70,
  WEIGHT_CONSISTENCY: 0.30,
  DISCLAIMER:
    'Cognitive Vitality Index is a gameplay progress indicator based on completed cognitive game activity. It is not a medical diagnosis or clinical assessment.',
};

/**
 * Validates whether a round result meets strict criteria for analytics and CVI calculation.
 *
 * @param {Object} round - The round data to validate.
 * @returns {{ valid: boolean, reason: string|null }}
 */
export function validateRoundResult(round) {
  if (!round || typeof round !== 'object') {
    return {
      valid: false,
      reason: 'missing_round',
    };
  }

  // Reject legacy or explicitly unverified data
  if (round.eligibleForCVI === false || round.dataQuality === 'legacy_unverified') {
    return {
      valid: false,
      reason: 'unverified_or_ineligible',
    };
  }

  if (!round.playerId || typeof round.playerId !== 'string' || !round.playerId.trim()) {
    return {
      valid: false,
      reason: 'missing_player_id',
    };
  }

  if (!round.sessionId || typeof round.sessionId !== 'string' || !round.sessionId.trim()) {
    return {
      valid: false,
      reason: 'missing_session_id',
    };
  }

  if (!round.gameId || typeof round.gameId !== 'string' || !round.gameId.trim()) {
    return {
      valid: false,
      reason: 'missing_game_id',
    };
  }

  if (round.isAbandoned === true || round.status !== 'completed') {
    return {
      valid: false,
      reason: 'round_not_completed',
    };
  }

  if (!Number.isFinite(round.attempts) || round.attempts <= 0) {
    return {
      valid: false,
      reason: 'no_real_attempts',
    };
  }

  if (
    !Number.isFinite(round.correctAttempts) ||
    round.correctAttempts < 0 ||
    round.correctAttempts > round.attempts
  ) {
    return {
      valid: false,
      reason: 'invalid_correct_attempts',
    };
  }

  // Accuracy validation (normalize 0..1 or 0..100)
  if (round.accuracy !== undefined && round.accuracy !== null) {
    if (!Number.isFinite(round.accuracy)) {
      return {
        valid: false,
        reason: 'invalid_accuracy_not_number',
      };
    }
    // Allow either 0..1 ratio or 0..100 percentage
    if (round.accuracy < 0 || round.accuracy > 100) {
      return {
        valid: false,
        reason: 'invalid_accuracy_out_of_bounds',
      };
    }
  }

  // Non-negative duration check
  if (
    round.durationSec !== undefined &&
    round.durationSec !== null &&
    (!Number.isFinite(round.durationSec) || round.durationSec < 0)
  ) {
    return {
      valid: false,
      reason: 'negative_duration',
    };
  }

  if (
    round.completionTimeSec !== undefined &&
    round.completionTimeSec !== null &&
    (!Number.isFinite(round.completionTimeSec) || round.completionTimeSec < 0)
  ) {
    return {
      valid: false,
      reason: 'negative_duration',
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

/**
 * Calculates the Cognitive Vitality Index (CVI) from round history.
 *
 * @param {Array<Object>} rounds - Array of round records.
 * @param {Object} [options]
 * @param {number} [options.requiredRounds=3] - Minimum completed rounds required.
 * @param {string} [options.playerId] - Optional player ID to filter by.
 * @returns {Object} Deterministic CVI evaluation result.
 */
export function calculateCVI(rounds = [], options = {}) {
  const requiredRounds = Number.isInteger(options.requiredRounds) && options.requiredRounds > 0
    ? options.requiredRounds
    : CVI_CONSTANTS.DEFAULT_REQUIRED_ROUNDS;

  if (!Array.isArray(rounds) || rounds.length === 0) {
    return {
      status: 'insufficient_data',
      cvi: null,
      cviPercent: null,
      validRounds: 0,
      requiredRounds,
      message: 'Complete more cognitive game rounds to calculate your gameplay progress score.',
      isMedicalScore: false,
      disclaimer: CVI_CONSTANTS.DISCLAIMER,
    };
  }

  // Filter by player ID if provided
  const playerFilteredRounds = options.playerId
    ? rounds.filter((r) => r && r.playerId === options.playerId)
    : rounds;

  // Filter valid completed rounds
  const validRounds = playerFilteredRounds.filter((r) => validateRoundResult(r).valid);

  // Multi-game breakdown and games list
  const gamesIncluded = Array.from(new Set(validRounds.map((r) => r.gameId).filter(Boolean)));
  const gameBreakdown = {};

  for (const r of validRounds) {
    const gid = r.gameId;
    if (!gameBreakdown[gid]) {
      gameBreakdown[gid] = {
        validRounds: 0,
        totalAttempts: 0,
        totalCorrectAttempts: 0,
        accuracy: null,
      };
    }
    gameBreakdown[gid].validRounds += 1;
    gameBreakdown[gid].totalAttempts += r.attempts;
    gameBreakdown[gid].totalCorrectAttempts += r.correctAttempts;
  }

  for (const gid of Object.keys(gameBreakdown)) {
    const g = gameBreakdown[gid];
    g.accuracy = g.totalAttempts > 0
      ? Math.round((g.totalCorrectAttempts / g.totalAttempts) * 1000) / 1000
      : null;
  }

  if (validRounds.length < requiredRounds) {
    return {
      status: 'insufficient_data',
      cvi: null,
      cviPercent: null,
      validRounds: validRounds.length,
      requiredRounds,
      gamesIncluded,
      gameBreakdown,
      message: 'Complete more cognitive game rounds to calculate your gameplay progress score.',
      isMedicalScore: false,
      disclaimer: CVI_CONSTANTS.DISCLAIMER,
    };
  }

  // Calculate Accuracy Score: totalCorrectAttempts / totalAttempts
  let totalAttempts = 0;
  let totalCorrectAttempts = 0;

  for (const r of validRounds) {
    totalAttempts += r.attempts;
    totalCorrectAttempts += r.correctAttempts;
  }

  const accuracyScore = totalAttempts > 0
    ? totalCorrectAttempts / totalAttempts
    : 0;

  // Completion Consistency Score: completedValidRounds / startedEligibleRounds
  // startedEligibleRounds includes completed rounds, abandoned rounds, and incomplete rounds
  // that belong to the user's recorded play sessions.
  const startedEligibleRounds = playerFilteredRounds.filter((r) => {
    if (!r || typeof r !== 'object') return false;
    if (r.eligibleForCVI === false || r.dataQuality === 'legacy_unverified') return false;
    return Boolean(r.playerId && r.sessionId);
  }).length;

  const totalStarted = Math.max(validRounds.length, startedEligibleRounds);
  const completionConsistencyScore = totalStarted > 0
    ? validRounds.length / totalStarted
    : 1.0;

  // Weighted CVI Formula: 70% Accuracy + 30% Completion Consistency
  const rawCvi =
    accuracyScore * CVI_CONSTANTS.WEIGHT_ACCURACY +
    completionConsistencyScore * CVI_CONSTANTS.WEIGHT_CONSISTENCY;

  const clampedCvi = Math.max(0.0, Math.min(1.0, rawCvi));
  const cviRounded = Math.round(clampedCvi * 1000) / 1000;
  const cviPercent = Math.round(clampedCvi * 100);

  return {
    status: 'ready',
    cvi: cviRounded,
    cviPercent,
    accuracyScore: Math.round(accuracyScore * 1000) / 1000,
    completionConsistencyScore: Math.round(completionConsistencyScore * 1000) / 1000,
    validRounds: validRounds.length,
    totalAttempts,
    correctAttempts: totalCorrectAttempts,
    gamesIncluded,
    gameBreakdown,
    calculationVersion: CVI_CONSTANTS.CALCULATION_VERSION,
    isMedicalScore: false,
    disclaimer: CVI_CONSTANTS.DISCLAIMER,
  };
}

