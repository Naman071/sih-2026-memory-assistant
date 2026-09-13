/**
 * SUH TAH LAM - Performance Repository Interface
 *
 * Abstract repository pattern enabling complete offline persistence
 * while leaving clean architecture open for future Supabase cloud synchronization.
 */

export class PerformanceRepository {
  async getProfile(gameId, playerId) {
    throw new Error('getProfile() must be implemented by repository');
  }

  async saveRoundResult({ session, roundData, profile }) {
    throw new Error('saveRoundResult() must be implemented by repository');
  }

  async getRoundHistory(gameId, playerId, limit = 50) {
    throw new Error('getRoundHistory() must be implemented by repository');
  }

  async flushOfflineQueue() {
    throw new Error('flushOfflineQueue() must be implemented by repository');
  }
}

