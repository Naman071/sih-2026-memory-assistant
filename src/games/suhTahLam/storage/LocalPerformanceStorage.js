/**
 * SUH TAH LAM - Local Performance Storage
 *
 * Concrete implementation of PerformanceRepository using AsyncStorage.
 * Operates 100% offline with zero external network dependencies.
 * Fail-safe: Any disk error is caught gracefully to ensure uninterrupted gameplay.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerformanceRepository } from './PerformanceRepository.js';

const STORAGE_KEY_PREFIX = '@suh_tah_lam_performance_v1';

export class LocalPerformanceStorage extends PerformanceRepository {
  constructor() {
    super();
    this.memoryCache = new Map();
  }

  _getStorageKey(playerId) {
    return `${STORAGE_KEY_PREFIX}_${playerId || 'default'}`;
  }

  /**
   * Retrieves player's historical profile
   */
  async getProfile(gameId = 'suh_tah_lam', playerId = 'P001') {
    try {
      const key = this._getStorageKey(playerId);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.profile || this._getDefaultProfile(gameId, playerId);
      }
    } catch (err) {
      console.warn('[LocalPerformanceStorage] Failed to read profile from storage:', err);
    }
    return this._getDefaultProfile(gameId, playerId);
  }

  /**
   * Saves round result, updating profile and local history
   */
  async saveRoundResult({ session, roundData, profile }) {
    try {
      const playerId = profile?.playerId || session?.playerId || 'P001';
      const key = this._getStorageKey(playerId);

      let existingData = { profile: null, rounds: [] };
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        existingData = JSON.parse(raw);
      }

      const updatedRounds = [roundData, ...(existingData.rounds || [])].slice(0, 100);

      const recordToSave = {
        version: 1,
        gameId: 'suh_tah_lam',
        playerId,
        profile: {
          ...profile,
          updatedAt: new Date().toISOString(),
        },
        rounds: updatedRounds,
        lastSessionId: session?.id,
      };

      await AsyncStorage.setItem(key, JSON.stringify(recordToSave));
      this.memoryCache.set(key, recordToSave);
      return true;
    } catch (err) {
      console.warn('[LocalPerformanceStorage] Failed to save round result:', err);
      return false;
    }
  }

  /**
   * Retrieves historical rounds for calculation
   */
  async getRoundHistory(gameId = 'suh_tah_lam', playerId = 'P001', limit = 50) {
    try {
      const key = this._getStorageKey(playerId);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return (parsed.rounds || []).slice(0, limit);
      }
    } catch (err) {
      console.warn('[LocalPerformanceStorage] Failed to read round history:', err);
    }
    return [];
  }

  async flushOfflineQueue() {
    // No-op for local offline storage
    return Promise.resolve();
  }

  _getDefaultProfile(gameId, playerId) {
    return {
      gameId,
      playerId,
      currentDifficulty: 'easy',
      roundsPlayed: 0,
      accuracy: 1.0,
      sequenceAccuracy: 1.0,
      spatialAccuracy: 1.0,
      changeDetectionAccuracy: 1.0,
      movementRecallScore: 1.0,
      recentScore: 0.85,
      promotionCount: 0,
      demotionCount: 0,
      streak: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const defaultLocalStorage = new LocalPerformanceStorage();
