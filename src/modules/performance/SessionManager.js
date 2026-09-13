/**
 * Session Manager for Cognitive Games (SIH Memory Assistant)
 *
 * Tracks the complete lifecycle of a play session:
 * - START GAME -> Create session
 * - START ROUND -> Track active state
 * - Round completions & statistics
 * - Early exit / back -> Mark session as abandoned without penalizing patient
 * - Normal completion -> Mark session completed
 */

export class SessionManager {
  constructor() {
    this.currentSession = null;
  }

  /**
   * Starts a new game session
   */
  startSession({ playerId = 'P001', gameType = 'dhop_khel', initialDifficulty = 'easy' } = {}) {
    const now = new Date().toISOString();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.currentSession = {
      id: sessionId,
      playerId,
      gameType,
      difficulty: initialDifficulty,
      startedAt: now,
      completedAt: null,
      status: 'active', // 'active' | 'completed' | 'abandoned'
      roundsCount: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      rounds: [],
    };

    return this.currentSession;
  }

  /**
   * Records a completed round in this session
   */
  recordRound(roundData) {
    if (!this.currentSession) return null;

    this.currentSession.roundsCount += 1;
    this.currentSession.totalAttempts += roundData.totalAttempts || 1;
    if (roundData.isCorrect) {
      this.currentSession.totalCorrect += 1;
    }
    this.currentSession.difficulty = roundData.difficulty || this.currentSession.difficulty;
    this.currentSession.rounds.push(roundData);

    return this.currentSession;
  }

  /**
   * Marks session as abandoned if user exits early
   */
  abandonSession() {
    if (!this.currentSession) return null;
    if (this.currentSession.status === 'active') {
      this.currentSession.status = 'abandoned';
      this.currentSession.completedAt = new Date().toISOString();
    }
    return this.currentSession;
  }

  /**
   * Marks session as cleanly completed
   */
  completeSession() {
    if (!this.currentSession) return null;
    this.currentSession.status = 'completed';
    this.currentSession.completedAt = new Date().toISOString();
    return this.currentSession;
  }

  /**
   * Gets current session object
   */
  getSession() {
    return this.currentSession;
  }

  /**
   * Gets overall summary of current session
   */
  getSummary() {
    if (!this.currentSession) return null;
    const durationSec = Math.round(
      (Date.now() - new Date(this.currentSession.startedAt).getTime()) / 1000
    );

    return {
      sessionId: this.currentSession.id,
      playerId: this.currentSession.playerId,
      gameType: this.currentSession.gameType,
      difficulty: this.currentSession.difficulty,
      status: this.currentSession.status,
      roundsCount: this.currentSession.roundsCount,
      totalCorrect: this.currentSession.totalCorrect,
      totalAttempts: this.currentSession.totalAttempts,
      accuracy:
        this.currentSession.totalAttempts > 0
          ? Math.round((this.currentSession.totalCorrect / this.currentSession.totalAttempts) * 100) / 100
          : 0,
      durationSec,
      startedAt: this.currentSession.startedAt,
      completedAt: this.currentSession.completedAt,
    };
  }
}

