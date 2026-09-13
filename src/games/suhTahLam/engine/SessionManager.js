/**
 * SUH TAH LAM - Session Manager
 *
 * Coordinates lifecycle states:
 * - Session start/pause/resume/restart/end
 * - Background/Foreground resilience
 * - Clean cleanup of timers and animation drivers
 */

export class SessionManager {
  constructor() {
    this.session = null;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.totalPausedDurationMs = 0;
  }

  startSession({ playerId = 'P001', initialDifficulty = 'easy' } = {}) {
    this.session = {
      id: `stl_sess_${Date.now()}`,
      playerId,
      currentDifficulty: initialDifficulty,
      startedAt: new Date().toISOString(),
      roundsCompleted: 0,
      isPaused: false,
    };
    this.isPaused = false;
    this.totalPausedDurationMs = 0;
    return this.session;
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      if (this.session) this.session.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.pauseStartTime) {
        this.totalPausedDurationMs += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }
      if (this.session) this.session.isPaused = false;
    }
  }

  recordRoundCompleted() {
    if (this.session) {
      this.session.roundsCompleted += 1;
    }
  }

  restart() {
    this.isPaused = false;
    this.pauseStartTime = null;
    this.totalPausedDurationMs = 0;
    if (this.session) {
      this.session.roundsCompleted = 0;
    }
  }

  endSession() {
    const endedSession = {
      ...this.session,
      endedAt: new Date().toISOString(),
      isCompleted: true,
    };
    this.session = null;
    this.isPaused = false;
    return endedSession;
  }
}

