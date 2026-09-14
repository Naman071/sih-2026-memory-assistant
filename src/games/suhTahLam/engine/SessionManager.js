/**
 * SUH TAH LAM - Session Manager
 *
 * Coordinates lifecycle states:
 * - Session start/pause/resume/restart/end
 * - Background/Foreground resilience
 * - Active duration tracking (excluding paused time)
 * - Safe session identity with crypto.randomUUID fallback
 */

export class SessionManager {
  constructor() {
    this.session = null;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.totalPausedDurationMs = 0;
  }

  /**
   * Generates a collision-resistant session identifier
   */
  createSessionId() {
    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return `stl_sess_${uuid}`;
  }

  /**
   * Starts a new session with an authentic playerId and difficulty
   */
  startSession({ playerId = 'P001', initialDifficulty = 'easy' } = {}) {
    const now = new Date().toISOString();
    this.totalPausedDurationMs = 0;
    this.isPaused = false;
    this.pauseStartTime = null;

    this.session = {
      id: this.createSessionId(),
      playerId,
      currentDifficulty: initialDifficulty,
      startedAt: now,
      endedAt: null,
      roundsCompleted: 0,
      isPaused: false,
      isCompleted: false,
      totalPausedDurationMs: 0,
      activeDurationMs: 0,
      activeDurationSec: 0,
    };

    return { ...this.session };
  }

  /**
   * Pauses the active session and begins tracking pause duration
   */
  pause() {
    if (!this.session) return;
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      this.session.isPaused = true;
    }
  }

  /**
   * Resumes the active session and accumulates paused time
   */
  resume() {
    if (!this.session) return;
    if (this.isPaused) {
      this.isPaused = false;
      if (this.pauseStartTime) {
        this.totalPausedDurationMs += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }
      this.session.isPaused = false;
      this.session.totalPausedDurationMs = this.totalPausedDurationMs;
    }
  }

  /**
   * Increments completed rounds for this session
   */
  recordRoundCompleted() {
    if (this.session) {
      this.session.roundsCompleted += 1;
    }
  }

  /**
   * Restarts the session by closing the current one and initiating a fresh session
   * with a new unique session ID and start timestamp.
   *
   * @returns {{ previousSession: Object|null, newSession: Object }}
   */
  restart({ initialDifficulty } = {}) {
    const previousSession = this.endSession();
    const newSession = this.startSession({
      playerId: previousSession?.playerId || 'P001',
      initialDifficulty: initialDifficulty || previousSession?.currentDifficulty || 'easy',
    });

    return {
      previousSession,
      newSession,
    };
  }

  /**
   * Safely terminates the active session, closing any active pause interval
   * and calculating total active duration.
   * Returns null if no session is currently active.
   */
  endSession() {
    if (!this.session) {
      this.isPaused = false;
      this.pauseStartTime = null;
      this.totalPausedDurationMs = 0;
      return null;
    }

    // If session ended while paused, close the current pause interval
    if (this.isPaused && this.pauseStartTime) {
      this.totalPausedDurationMs += Date.now() - this.pauseStartTime;
      this.pauseStartTime = null;
      this.isPaused = false;
    }

    const endedAt = new Date().toISOString();
    const startMs = new Date(this.session.startedAt).getTime();
    const endMs = new Date(endedAt).getTime();
    const totalWallMs = Math.max(0, endMs - startMs);
    const activeDurationMs = Math.max(0, totalWallMs - this.totalPausedDurationMs);
    const activeDurationSec = Math.round(activeDurationMs / 1000);

    const endedSession = {
      ...this.session,
      endedAt,
      isPaused: false,
      isCompleted: true,
      totalPausedDurationMs: this.totalPausedDurationMs,
      activeDurationMs,
      activeDurationSec,
    };

    this.session = null;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.totalPausedDurationMs = 0;

    return { ...endedSession };
  }

  /**
   * Returns an immutable copy of the current session state
   */
  getSession() {
    if (!this.session) return null;
    return { ...this.session };
  }
}
