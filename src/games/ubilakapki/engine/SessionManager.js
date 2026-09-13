/**
 * UBILAKAPKI - Master Session Manager
 * Coordinates sequence generation, question creation, round timing, and local session analytics.
 */

import { DifficultyEngine } from './DifficultyEngine.js';
import { SequenceManager } from './SequenceManager.js';
import { QuestionManager } from './QuestionManager.js';
import { LEVEL_CONFIGS } from '../data/levels.js';

export class SessionManager {
  constructor(initialDifficulty = 'easy') {
    this.difficultyEngine = new DifficultyEngine(initialDifficulty);
    this.sequenceManager = new SequenceManager();
    this.questionManager = new QuestionManager();

    this.currentRound = 0;
    this.activeSequence = null;
    this.activeQuestion = null;
    this.roundStartTime = 0;
    this.recallStartTime = 0;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
  }

  startSession(initialDifficulty = 'easy') {
    this.difficultyEngine.setLevel(initialDifficulty);
    this.currentRound = 0;
    this.sequenceManager.reset();
  }

  startNextRound() {
    this.currentRound++;
    const difficulty = this.difficultyEngine.getLevel();
    const sequence = this.sequenceManager.getNextSequence(difficulty);
    const question = this.questionManager.createQuestion(sequence);
    const levelConfig = LEVEL_CONFIGS[difficulty] || LEVEL_CONFIGS.easy;

    this.activeSequence = sequence;
    this.activeQuestion = question;
    this.roundStartTime = Date.now();
    this.recallStartTime = 0;
    this.totalPausedDuration = 0;
    this.isPaused = false;

    return {
      roundNumber: this.currentRound,
      difficulty,
      sequence,
      question,
      levelConfig,
    };
  }

  recordRecallStart() {
    this.recallStartTime = Date.now();
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.totalPausedDuration += Date.now() - this.pauseStartTime;
    }
  }

  async endRound(selectedAnswer, isCorrect) {
    const now = Date.now();
    const effectiveRecallStart = this.recallStartTime || this.roundStartTime;
    const responseTimeSec = Math.max(
      0.5,
      parseFloat(((now - effectiveRecallStart - this.totalPausedDuration) / 1000).toFixed(2))
    );

    const evaluation = this.difficultyEngine.recordRound({
      isCorrect,
      responseTimeSec,
    });

    return {
      roundNumber: this.currentRound,
      selectedAnswer,
      isCorrect,
      responseTimeSec,
      evaluation,
      metrics: this.difficultyEngine.getMetricsSummary(),
    };
  }

  getCaregiverStats() {
    return {
      ...this.difficultyEngine.getMetricsSummary(),
      currentDifficulty: this.difficultyEngine.getLevel(),
      roundsCompleted: this.currentRound,
    };
  }
}
