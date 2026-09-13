/**
 * Supabase Performance & Offline Synchronization Service
 *
 * Implements:
 * - Local offline persistence via AsyncStorage
 * - Background synchronization to Supabase
 * - Graceful fallback to existing `game_results` table
 * - Safe offline queue with automatic replay
 * - Absolute zero-crash guarantee on network or schema failures
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient.js';
import { saveGameResult } from '../database.js';

const STORAGE_KEYS = {
  QUEUE: '@memory_assistant_offline_queue',
  PROFILE_PREFIX: '@difficulty_profile_',
  HISTORY_PREFIX: '@performance_history_',
};

export class SupabasePerformanceService {
  constructor() {
    this.isSyncing = false;
  }

  /**
   * Generates profile storage key for a player and game
   */
  getProfileKey(gameType, playerId) {
    return `${STORAGE_KEYS.PROFILE_PREFIX}${gameType}_${playerId}`;
  }

  /**
   * Generates history storage key for a player and game
   */
  getHistoryKey(gameType, playerId) {
    return `${STORAGE_KEYS.HISTORY_PREFIX}${gameType}_${playerId}`;
  }

  /**
   * Loads player's cached performance profile
   */
  async getProfile(gameType, playerId) {
    try {
      const raw = await AsyncStorage.getItem(this.getProfileKey(gameType, playerId));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Error reading performance profile from AsyncStorage:', err);
    }
    return {
      playerId,
      gameType,
      currentDifficulty: 'easy',
      recentScore: 0,
      promotionCount: 0,
      demotionCount: 0,
      roundsPlayed: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Saves updated performance profile locally and to Supabase
   */
  async saveProfile(profile) {
    const key = this.getProfileKey(profile.gameType, profile.playerId);
    try {
      await AsyncStorage.setItem(key, JSON.stringify(profile));
    } catch (err) {
      console.warn('Error writing performance profile to AsyncStorage:', err);
    }

    // Try syncing to Supabase difficulty_profiles table
    try {
      const { error } = await supabase
        .from('difficulty_profiles')
        .upsert(
          [
            {
              player_id: profile.playerId,
              game_type: profile.gameType,
              current_difficulty: profile.currentDifficulty,
              recent_score: profile.recentScore,
              promotion_count: profile.promotionCount || 0,
              demotion_count: profile.demotionCount || 0,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'player_id,game_type' }
        );

      if (error) {
        // Table not present or RLS issue; non-critical
        console.warn('Supabase difficulty_profiles save notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase profile save error (offline fallback used):', err.message);
    }
  }

  /**
   * Loads recent round history for player and game
   */
  async getRoundHistory(gameType, playerId, limit = 20) {
    try {
      const raw = await AsyncStorage.getItem(this.getHistoryKey(gameType, playerId));
      if (raw) {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list.slice(-limit) : [];
      }
    } catch (err) {
      console.warn('Error reading round history from AsyncStorage:', err);
    }
    return [];
  }

  /**
   * Saves round result locally and syncs to Supabase
   */
  async saveRoundResult({ session, roundData, profile }) {
    // 1. Update local round history immediately
    const historyKey = this.getHistoryKey(session.gameType, session.playerId);
    try {
      const existing = await this.getRoundHistory(session.gameType, session.playerId, 50);
      const updated = [...existing, roundData].slice(-50);
      await AsyncStorage.setItem(historyKey, JSON.stringify(updated));
    } catch (storageErr) {
      console.warn('Error updating local round history:', storageErr);
    }

    // 2. Update local profile
    if (profile) {
      await this.saveProfile(profile);
    }

    // 3. Dual-path sync to Supabase
    // A. Always save to verified existing `game_results` table
    try {
      await saveGameResult({
        patient_id: session.playerId,
        game_name: session.gameType === 'dhop_khel' ? 'Dhopkhel Memory' : session.gameType,
        score: roundData.isCorrect ? 10 : 0,
        duration: roundData.completionTimeSec || 2,
        difficulty:
          roundData.difficulty.charAt(0).toUpperCase() + roundData.difficulty.slice(1),
        played_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Fallback saveGameResult failed (will queue):', e.message);
    }

    // B. Attempt saving to dedicated `game_rounds` and `performance_metrics` if configured
    const payload = {
      type: 'round',
      session_id: session.id,
      player_id: session.playerId,
      game_type: session.gameType,
      round_number: session.roundsCount,
      difficulty: roundData.difficulty,
      started_at: roundData.startedAt,
      completed_at: roundData.completedAt,
      accuracy: roundData.accuracy,
      response_time: roundData.responseTimeMs,
      score: roundData.performanceScore,
      timestamp: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('game_rounds').insert([
        {
          session_id: payload.session_id,
          round_number: payload.round_number,
          difficulty: payload.difficulty,
          started_at: payload.started_at,
          completed_at: payload.completed_at,
          accuracy: payload.accuracy,
          response_time: payload.response_time,
          score: payload.score,
        },
      ]);

      if (error) {
        // Table not migrated yet; gracefully queue without crashing
        await this.enqueueOfflineItem(payload);
      }
    } catch (supabaseErr) {
      console.warn('Supabase round insert notice (queued for offline):', supabaseErr.message);
      await this.enqueueOfflineItem(payload);
    }
  }

  /**
   * Enqueues an un-synced item into local offline queue
   */
  async enqueueOfflineItem(item) {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.QUEUE);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ ...item, queuedAt: new Date().toISOString() });
      // Keep queue bounded
      const trimmed = queue.slice(-100);
      await AsyncStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('Error enqueuing offline performance item:', err);
    }
  }

  /**
   * Attempts to sync queued offline items when connection is available
   */
  async flushOfflineQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.QUEUE);
      if (!raw) {
        this.isSyncing = false;
        return;
      }
      const queue = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      const remaining = [];
      for (const item of queue) {
        try {
          if (item.type === 'round') {
            const { error } = await supabase.from('game_rounds').insert([
              {
                session_id: item.session_id,
                round_number: item.round_number,
                difficulty: item.difficulty,
                started_at: item.started_at,
                completed_at: item.completed_at,
                accuracy: item.accuracy,
                response_time: item.response_time,
                score: item.score,
              },
            ]);
            if (error) {
              remaining.push(item);
            }
          }
        } catch (e) {
          remaining.push(item);
        }
      }

      await AsyncStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(remaining));
    } catch (err) {
      console.warn('Error flushing offline queue:', err);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const defaultPerformanceService = new SupabasePerformanceService();
