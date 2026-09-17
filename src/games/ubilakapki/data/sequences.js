/**
 * UBILAKAPKI - Sequence Generator & Anti-Repetition Registry
 * Generates verified coconut passing sequences with unique fingerprints.
 */

import { LEVEL_CONFIGS } from './levels.js';
import { PLAYER_ARCHETYPES } from './players.js';

/**
 * Pre-validated seed sequences for instant playback and testing
 */
export const SEED_SEQUENCES = {
  easy: [
    {
      id: 'ubi_e_01',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['A', 'C', 'B', 'A'],
      startHolder: 'A',
      finalHolder: 'A',
      fingerprint: 'ubi_3_A_A-C-B-A_3',
    },
    {
      id: 'ubi_e_02',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['B', 'A', 'C', 'B'],
      startHolder: 'B',
      finalHolder: 'B',
      fingerprint: 'ubi_3_B_B-A-C-B_3',
    },
    {
      id: 'ubi_e_03',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['C', 'B', 'A', 'C'],
      startHolder: 'C',
      finalHolder: 'C',
      fingerprint: 'ubi_3_C_C-B-A-C_3',
    },
    {
      id: 'ubi_e_04',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['A', 'B', 'C', 'B'],
      startHolder: 'A',
      finalHolder: 'B',
      fingerprint: 'ubi_3_A_A-B-C-B_3',
    },
    {
      id: 'ubi_e_05',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['B', 'C', 'A', 'C'],
      startHolder: 'B',
      finalHolder: 'C',
      fingerprint: 'ubi_3_B_B-C-A-C_3',
    },
    {
      id: 'ubi_e_06',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['C', 'A', 'B', 'A'],
      startHolder: 'C',
      finalHolder: 'A',
      fingerprint: 'ubi_3_C_C-A-B-A_3',
    },
    {
      id: 'ubi_e_07',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['A', 'C', 'A', 'B'],
      startHolder: 'A',
      finalHolder: 'B',
      fingerprint: 'ubi_3_A_A-C-A-B_3',
    },
    {
      id: 'ubi_e_08',
      difficulty: 'easy',
      playerCount: 3,
      passes: ['B', 'A', 'B', 'C'],
      startHolder: 'B',
      finalHolder: 'C',
      fingerprint: 'ubi_3_B_B-A-B-C_3',
    },
  ],
  medium: [
    {
      id: 'ubi_m_01',
      difficulty: 'medium',
      playerCount: 3,
      passes: ['A', 'C', 'B', 'A', 'C'],
      startHolder: 'A',
      finalHolder: 'C',
      fingerprint: 'ubi_3_A_A-C-B-A-C_4',
    },
    {
      id: 'ubi_m_02',
      difficulty: 'medium',
      playerCount: 3,
      passes: ['B', 'A', 'C', 'B', 'A'],
      startHolder: 'B',
      finalHolder: 'A',
      fingerprint: 'ubi_3_B_B-A-C-B-A_4',
    },
    {
      id: 'ubi_m_03',
      difficulty: 'medium',
      playerCount: 3,
      passes: ['C', 'B', 'A', 'C', 'B'],
      startHolder: 'C',
      finalHolder: 'B',
      fingerprint: 'ubi_3_C_C-B-A-C-B_4',
    },
    {
      id: 'ubi_m_04',
      difficulty: 'medium',
      playerCount: 3,
      passes: ['A', 'B', 'C', 'B', 'A'],
      startHolder: 'A',
      finalHolder: 'A',
      fingerprint: 'ubi_3_A_A-B-C-B-A_4',
    },
    {
      id: 'ubi_m_05',
      difficulty: 'medium',
      playerCount: 3,
      passes: ['B', 'C', 'A', 'C', 'B', 'C'],
      startHolder: 'B',
      finalHolder: 'C',
      fingerprint: 'ubi_3_B_B-C-A-C-B-C_5',
    },
  ],
  hard: [
    {
      id: 'ubi_h_01',
      difficulty: 'hard',
      playerCount: 3,
      passes: ['A', 'C', 'B', 'A', 'B', 'C', 'A'],
      startHolder: 'A',
      finalHolder: 'A',
      fingerprint: 'ubi_3_A_A-C-B-A-B-C-A_6',
    },
    {
      id: 'ubi_h_02',
      difficulty: 'hard',
      playerCount: 3,
      passes: ['B', 'A', 'C', 'B', 'A', 'C', 'B'],
      startHolder: 'B',
      finalHolder: 'B',
      fingerprint: 'ubi_3_B_B-A-C-B-A-C-B_6',
    },
    {
      id: 'ubi_h_03',
      difficulty: 'hard',
      playerCount: 3,
      passes: ['C', 'B', 'A', 'C', 'B', 'A', 'C'],
      startHolder: 'C',
      finalHolder: 'C',
      fingerprint: 'ubi_3_C_C-B-A-C-B-A-C_6',
    },
    {
      id: 'ubi_h_04',
      difficulty: 'hard',
      playerCount: 3,
      passes: ['A', 'B', 'A', 'C', 'B', 'C', 'B'],
      startHolder: 'A',
      finalHolder: 'B',
      fingerprint: 'ubi_3_A_A-B-A-C-B-C-B_6',
    },
  ],
};

/**
 * Computes a deterministic sequence fingerprint
 */
export function createSequenceFingerprint(passes) {
  if (!Array.isArray(passes) || passes.length < 2) return 'invalid_fp';
  const playerCount = new Set(passes).size;
  const start = passes[0];
  const end = passes[passes.length - 1];
  const path = passes.join('-');
  return `ubi_${playerCount}_${start}_${path}_${passes.length - 1}`;
}

/**
 * Generates a valid passing sequence for the requested difficulty
 * avoiding recently used fingerprints.
 */
export function generatePassingSequence(difficulty = 'easy', excludeFingerprints = []) {
  const config = LEVEL_CONFIGS[difficulty] || LEVEL_CONFIGS.easy;
  const count = config.playerCount;
  const availablePlayers = PLAYER_ARCHETYPES.slice(0, count).map((p) => p.id);
  const excludeSet = new Set(excludeFingerprints);

  // 1. Check if seed sequences have an unused match
  const seeds = SEED_SEQUENCES[difficulty] || [];
  const unusedSeeds = seeds.filter((s) => !excludeSet.has(s.fingerprint));
  if (unusedSeeds.length > 0) {
    const pick = unusedSeeds[Math.floor(Math.random() * unusedSeeds.length)];
    return {
      ...pick,
      config,
    };
  }

  // 2. Procedural generator
  const transferCount =
    config.minTransfers +
    Math.floor(Math.random() * (config.maxTransfers - config.minTransfers + 1));

  let attempts = 0;
  while (attempts < 50) {
    attempts++;
    const passes = [];
    let currentHolder = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    passes.push(currentHolder);

    for (let i = 0; i < transferCount; i++) {
      // Pick next receiver different from current holder
      const validReceivers = availablePlayers.filter((p) => p !== currentHolder);
      const nextReceiver = validReceivers[Math.floor(Math.random() * validReceivers.length)];
      passes.push(nextReceiver);
      currentHolder = nextReceiver;
    }

    const fp = createSequenceFingerprint(passes);
    if (!excludeSet.has(fp)) {
      return {
        id: `ubi_gen_${Date.now()}_${attempts}`,
        difficulty,
        playerCount: count,
        passes,
        startHolder: passes[0],
        finalHolder: passes[passes.length - 1],
        fingerprint: fp,
        config,
      };
    }
  }

  // Fallback if all permutations exhausted
  const fallback = seeds[0] || {
    id: `ubi_fallback_${difficulty}`,
    difficulty,
    playerCount: count,
    passes: availablePlayers.slice(0, 3).concat([availablePlayers[0]]),
    startHolder: availablePlayers[0],
    finalHolder: availablePlayers[0],
    fingerprint: 'ubi_fallback',
  };

  return {
    ...fallback,
    config,
  };
}

