/**
 * SUH TAH LAM - Game Flow State Manager
 *
 * Coordinates state transitions across the 6 dementia-friendly cognitive modes:
 * START -> OBSERVE -> QUESTION_RECALL -> SPATIAL_GRID -> SPOT_CHANGE -> RECONSTRUCT -> RESULT
 */

export const GAME_PHASE = {
  START: 'START',
  OBSERVE: 'OBSERVE',
  QUESTION_RECALL: 'QUESTION_RECALL',
  SPATIAL_GRID: 'SPATIAL_GRID',
  SPOT_CHANGE: 'SPOT_CHANGE',
  RECONSTRUCT: 'RECONSTRUCT',
  RESULT: 'RESULT',
};

export class GameManager {
  constructor() {
    this.currentPhase = GAME_PHASE.START;
    this.listeners = [];
  }

  getPhase() {
    return this.currentPhase;
  }

  setPhase(phase) {
    this.currentPhase = phase;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach((cb) => cb(this.currentPhase));
  }
}

