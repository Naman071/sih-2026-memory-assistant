/**
 * SUH TAH LAM - Local Performance Storage
 *
 * Concrete implementation of PerformanceRepository using AsyncStorage.
 * Operates 100% offline with zero external network dependencies.
 * Fully player-scoped, versioned storage schema with legacy backward compatibility.
 * Fail-safe: Storage errors are logged with structured context and never crash gameplay.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerformanceRepository } from './PerformanceRepository.js';
import { validateRoundResult } from '../engine/CognitiveVitalityIndex.js';

const STORAGE_KEY_V2_PREFIX = '@cognitive_performance_v2';
const STORAGE_KEY_STL_PREFIX = '@suh_tah_lam_performance_v2';
const STORAGE_KEY_V1_PREFIX = '@suh_tah_lam_performance_v1';

const getStorageInstance = () => {
  if (globalThis.AsyncStorage !== undefined) {
    return globalThis.AsyncStorage;
  }
  if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
    return AsyncStorage;
  }
  if (AsyncStorage?.default && typeof AsyncStorage.default.getItem === 'function') {
    return AsyncStorage.default;
  }
  return null;
};

export class LocalPerformanceStorage extends PerformanceRepository {
  constructor() {
    super();
    this.memoryCache = new Map();
  }

  _getStorageKey(playerId) {
    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return null;
    }
    return `${STORAGE_KEY_V2_PREFIX}_${playerId.trim()}`;
  }

  _getSuhTahLamStorageKey(playerId) {
    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return null;
    }
    return `${STORAGE_KEY_STL_PREFIX}_${playerId.trim()}`;
  }

  _getLegacyStorageKey(playerId) {
    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return null;
    }
    return `${STORAGE_KEY_V1_PREFIX}_${playerId.trim()}`;
  }

  /**
   * Retrieves player's historical profile.
   * Requires authentic playerId; returns null if missing or empty.
   */
  async getProfile(arg1 = 'suh_tah_lam', arg2) {
    if (arg1 === '' || arg1 === null) {
      return null;
    }

    let gameId = 'all';
    let playerId = null;

    if (arg2 !== undefined) {
      if (arg2 === '' || arg2 === null) {
        return null;
      }
      gameId = arg1;
      playerId = arg2;
    } else {
      playerId = arg1;
    }

    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return null;
    }

    const cleanPlayerId = playerId.trim();
    const key = this._getStorageKey(cleanPlayerId);
    const stlKey = this._getSuhTahLamStorageKey(cleanPlayerId);
    if (!key) return null;

    try {
      const storage = getStorageInstance();
      let raw = null;

      if (storage) {
        try {
          raw = await storage.getItem(key);
          if (!raw && stlKey) {
            raw = await storage.getItem(stlKey);
          }
          if (!raw) {
            const legacyKey = this._getLegacyStorageKey(cleanPlayerId);
            if (legacyKey) raw = await storage.getItem(legacyKey);
          }
        } catch (storageReadErr) {
          console.warn('[LocalPerformanceStorage] Storage engine read error, using memoryCache:', storageReadErr?.message);
        }
      }

      // Consistent fallback to memory cache if storage returns null or is unavailable
      if (!raw) {
        const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
        if (cached?.profile) {
          return {
            ...this._getDefaultProfile(gameId, cleanPlayerId),
            ...cached.profile,
            playerId: cleanPlayerId,
          };
        }
      }

      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed?.profile) {
          this.memoryCache.set(key, parsed);
          if (stlKey) this.memoryCache.set(stlKey, parsed);
          return {
            ...this._getDefaultProfile(gameId, cleanPlayerId),
            ...parsed.profile,
            playerId: cleanPlayerId,
          };
        }
      }
    } catch (err) {
      console.error('[LocalPerformanceStorage] Failed to read profile from storage, checking memory cache:', err);
      const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
      if (cached?.profile) {
        return {
          ...this._getDefaultProfile(gameId, cleanPlayerId),
          ...cached.profile,
          playerId: cleanPlayerId,
        };
      }
    }
    return this._getDefaultProfile(gameId, cleanPlayerId);
  }

  /**
   * Saves round result, updating profile and local history.
   * Awaits AsyncStorage and handles errors transparently.
   */
  async saveRoundResult({ session, roundData, profile }) {
    try {
      // 1. Authenticate player ID (no hardcoded P001 or default fallback)
      const playerId = profile?.playerId || session?.playerId || roundData?.playerId;
      if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
        return { success: false, error: 'MISSING_PLAYER_ID' };
      }
      const cleanPlayerId = playerId.trim();

      // 2. Validate session ID for round persistence
      const sessionId = session?.id || session?.sessionId || roundData?.sessionId;
      if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
        return { success: false, error: 'MISSING_SESSION_ID' };
      }
      const cleanSessionId = sessionId.trim();

      // 3. Validate real gameId (no hardcoded 'suh_tah_lam' fallback)
      const gameId = roundData?.gameId || session?.gameId || session?.gameType || profile?.gameId;
      if (!gameId || typeof gameId !== 'string' || !gameId.trim()) {
        return { success: false, error: 'MISSING_GAME_ID' };
      }
      const cleanGameId = gameId.trim();

      const key = this._getStorageKey(cleanPlayerId);
      const stlKey = this._getSuhTahLamStorageKey(cleanPlayerId);
      if (!key) {
        return { success: false, error: 'MISSING_PLAYER_ID' };
      }

      const storage = getStorageInstance();

      let existingData = { profile: null, rounds: [] };
      if (storage) {
        try {
          let raw = await storage.getItem(key);
          if (!raw && stlKey) {
            raw = await storage.getItem(stlKey);
          }
          if (raw) {
            try {
              existingData = JSON.parse(raw) || existingData;
            } catch (pe) {
              console.error('[LocalPerformanceStorage] Corrupt storage JSON encountered, resetting buffer:', pe);
            }
          }
        } catch (storageReadErr) {
          console.warn('[LocalPerformanceStorage] Storage engine read error, using memoryCache:', storageReadErr?.message);
          const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
          if (cached) existingData = cached;
        }
      } else {
        const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
        if (cached) existingData = cached;
      }

      // 4. Build the complete sanitized round object first
      const rawRound = {
        ...roundData,
        playerId: cleanPlayerId,
        sessionId: cleanSessionId,
        gameId: cleanGameId,
      };

      // 5. Run validateRoundResult on sanitizedRound
      const validation = validateRoundResult(rawRound);

      // 6. Explicitly label data quality and CVI eligibility
      const dataQuality = validation.valid ? 'verified_gameplay' : 'invalid_gameplay';
      const sanitizedRound = {
        ...rawRound,
        dataQuality,
        eligibleForCVI: validation.valid === true,
        validationReason: validation.reason || null,
      };

      // 7. Deduplicate existing rounds
      const existingRounds = Array.isArray(existingData.rounds) ? existingData.rounds : [];
      const filteredExisting = existingRounds.filter((r) => {
        if (cleanSessionId && r.sessionId === cleanSessionId && r.roundNumber === sanitizedRound.roundNumber) {
          return false;
        }
        if (sanitizedRound.startedAt && r.startedAt === sanitizedRound.startedAt) {
          return false;
        }
        return true;
      });
      const updatedRounds = [sanitizedRound, ...filteredExisting].slice(0, 100);

      const recordToSave = {
        version: 2,
        gameId: cleanGameId,
        playerId: cleanPlayerId,
        profile: {
          ...profile,
          gameId: cleanGameId,
          playerId: cleanPlayerId,
          updatedAt: new Date().toISOString(),
        },
        rounds: updatedRounds,
        lastSessionId: cleanSessionId,
      };

      if (storage) {
        try {
          await storage.setItem(key, JSON.stringify(recordToSave));
          if (stlKey) {
            await storage.setItem(stlKey, JSON.stringify(recordToSave));
          }
        } catch (storageWriteErr) {
          console.error('[LocalPerformanceStorage] Failed to save round result:', storageWriteErr);
          // Still maintain in memoryCache so gameplay continues seamlessly
          this.memoryCache.set(key, recordToSave);
          if (stlKey) this.memoryCache.set(stlKey, recordToSave);
          return { success: true, round: sanitizedRound, storageWarning: storageWriteErr?.message };
        }
      }
      this.memoryCache.set(key, recordToSave);
      if (stlKey) this.memoryCache.set(stlKey, recordToSave);
      return { success: true, round: sanitizedRound };
    } catch (err) {
      console.error('[LocalPerformanceStorage] Failed to save round result:', err);
      return { success: false, error: 'ROUND_SAVE_FAILED', details: err?.message };
    }
  }

  /**
   * Retrieves all historical rounds for a player across all cognitive games.
   * @param {string} playerId
   * @param {number} [limit=50]
   * @returns {Promise<Array>}
   */
  async getAllRoundHistory(playerId, limit = 50) {
    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return [];
    }
    return this.getRoundHistory('all', playerId.trim(), limit);
  }

  /**
   * Retrieves historical rounds for calculation with legacy tagging.
   * Can filter by specific gameId (e.g. 'suh_tah_lam'), or return all games if gameId is 'all' or omitted.
   * Requires authentic playerId; returns [] if missing or empty.
   */
  async getRoundHistory(arg1 = 'suh_tah_lam', arg2, limit = 50) {
    if (arg1 === null || arg1 === '' || arg1 === undefined) {
      return [];
    }

    let filterGameId = null;
    let playerId = null;
    let actualLimit = limit;

    if (arg2 !== undefined && typeof arg2 !== 'number') {
      if (arg2 === null || arg2 === '') {
        return [];
      }
      filterGameId = arg1;
      playerId = arg2;
    } else {
      if (typeof arg2 === 'number') {
        actualLimit = arg2;
      }
      playerId = arg1;
      filterGameId = null; // all games
    }

    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return [];
    }

    const cleanPlayerId = playerId.trim();
    const key = this._getStorageKey(cleanPlayerId);
    const stlKey = this._getSuhTahLamStorageKey(cleanPlayerId);
    if (!key) return [];

    try {
      const storage = getStorageInstance();
      let raw = null;
      let isLegacy = false;

      if (storage) {
        try {
          raw = await storage.getItem(key);
          if (!raw && stlKey) {
            raw = await storage.getItem(stlKey);
          }
          // Check legacy v1 key if v2 not yet created
          if (!raw) {
            const legacyKey = this._getLegacyStorageKey(cleanPlayerId);
            if (legacyKey) {
              raw = await storage.getItem(legacyKey);
              if (raw) isLegacy = true;
            }
          }
        } catch (storageReadErr) {
          console.warn('[LocalPerformanceStorage] Storage engine read error, using memoryCache:', storageReadErr?.message);
        }
      }

      // Consistent fallback to memory cache if storage returns null or is unavailable
      if (!raw) {
        const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
        if (cached) {
          raw = JSON.stringify(cached);
        }
      }

      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        this.memoryCache.set(key, parsed);
        if (stlKey) this.memoryCache.set(stlKey, parsed);
        const rawRounds = Array.isArray(parsed?.rounds) ? parsed.rounds : [];

        // Normalize and tag rounds (mark unverified/legacy data)
        const normalized = rawRounds.map((r) => {
          if (isLegacy || !r.sessionId || !Number.isFinite(r.attempts) || r.attempts <= 0) {
            return {
              ...r,
              playerId: r.playerId || cleanPlayerId,
              dataQuality: 'legacy_unverified',
              eligibleForCVI: false,
              validationReason: r.validationReason || 'legacy_or_unverified_attempts',
            };
          }
          return {
            ...r,
            playerId: r.playerId || cleanPlayerId,
            eligibleForCVI: r.eligibleForCVI === true,
            dataQuality: r.dataQuality || (r.eligibleForCVI === true ? 'verified_gameplay' : 'invalid_gameplay'),
            validationReason: r.validationReason || null,
          };
        });

        // Filter by gameId if requested and not 'all'
        let matchingRounds = normalized;
        if (filterGameId && filterGameId !== 'all') {
          matchingRounds = normalized.filter((r) => r.gameId === filterGameId);
        }

        return matchingRounds.slice(0, actualLimit);
      }
    } catch (err) {
      console.error('[LocalPerformanceStorage] Failed to read round history, checking memory cache:', err);
      const cached = this.memoryCache.get(key) || (stlKey ? this.memoryCache.get(stlKey) : null);
      if (cached?.rounds) {
        let matchingRounds = cached.rounds;
        if (filterGameId && filterGameId !== 'all') {
          matchingRounds = cached.rounds.filter((r) => r.gameId === filterGameId);
        }
        return matchingRounds.slice(0, actualLimit);
      }
    }
    return [];
  }

  /**
   * Intentionally a no-op. LocalPerformanceStorage is an offline-only local repository
   * and does not maintain an outgoing network sync queue. Remote background sync
   * is managed independently by SupabasePerformanceService.
   */
  async flushOfflineQueue() {
    return Promise.resolve();
  }

  _getDefaultProfile(gameId, playerId) {
    return {
      gameId,
      playerId,
      currentDifficulty: 'easy',
      roundsPlayed: 0,
      totalRounds: 0,
      totalAttempts: 0,
      totalCorrectAttempts: 0,
      overallAccuracy: null,
      sequenceAccuracy: null,
      spatialAccuracy: null,
      changeDetectionAccuracy: null,
      movementRecallScore: null,
      recentScore: null,
      promotionCount: 0,
      demotionCount: 0,
      streak: 0,
      sampleCount: 0,
      hasEnoughData: false,
      updatedAt: null,
    };
  }
}

export const defaultLocalStorage = new LocalPerformanceStorage();
