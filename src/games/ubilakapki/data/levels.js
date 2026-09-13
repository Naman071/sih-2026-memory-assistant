/**
 * UBILAKAPKI - Level & Difficulty Configurations
 * Tailored specifically for elderly individuals experiencing memory difficulties.
 * Calm, predictable pacing, with progressive cognitive challenge across 3 tiers.
 */

export const LEVEL_CONFIGS = {
  easy: {
    id: 'easy',
    playerCount: 3,
    minTransfers: 3,
    maxTransfers: 4,
    passDurationMs: 1200,    // Flight travel duration
    holdDurationMs: 850,     // Time receiving player holds before next pass
    preRollDurationMs: 1000, // Initial observation time before first pass
    finalPauseMs: 1600,      // Observation pause on final holder before scene hides
    nameKey: 'games.ubilakapki.levelEasyName',
    badgeKey: 'games.ubilakapki.levelEasyBadge',
    subtitleKey: 'games.ubilakapki.levelEasySubtitle',
    descKey: 'games.ubilakapki.levelEasyDesc',
  },
  medium: {
    id: 'medium',
    playerCount: 4,
    minTransfers: 4,
    maxTransfers: 6,
    passDurationMs: 1050,
    holdDurationMs: 700,
    preRollDurationMs: 900,
    finalPauseMs: 1500,
    nameKey: 'games.ubilakapki.levelMediumName',
    badgeKey: 'games.ubilakapki.levelMediumBadge',
    subtitleKey: 'games.ubilakapki.levelMediumSubtitle',
    descKey: 'games.ubilakapki.levelMediumDesc',
  },
  hard: {
    id: 'hard',
    playerCount: 5,
    minTransfers: 6,
    maxTransfers: 8,
    passDurationMs: 950,
    holdDurationMs: 550,
    preRollDurationMs: 800,
    finalPauseMs: 1400,
    nameKey: 'games.ubilakapki.levelHardName',
    badgeKey: 'games.ubilakapki.levelHardBadge',
    subtitleKey: 'games.ubilakapki.levelHardSubtitle',
    descKey: 'games.ubilakapki.levelHardDesc',
  },
};

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

