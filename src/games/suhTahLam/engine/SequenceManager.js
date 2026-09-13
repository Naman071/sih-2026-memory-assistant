/**
 * SUH TAH LAM - Sequence Manager
 *
 * Handles sequence selection, anti-repetition memory, question retrieval,
 * and deterministic scenario compilation for all 6 cognitive modes.
 */

import { ALL_SEQUENCES } from '../data/sequences.js';
import { generateQuestionsForSequence } from '../data/questions.js';

export class SequenceManager {
  constructor() {
    this.recentSequenceIds = [];
    this.recentQuestionDomains = [];
  }

  /**
   * Retrieves the next appropriate sequence for the difficulty tier
   * ensuring no immediate repetitions.
   */
  getNextSequence(difficulty = 'easy') {
    const pool = ALL_SEQUENCES[difficulty] || ALL_SEQUENCES.easy;
    // Filter out sequences used in the last 5 rounds
    const available = pool.filter((seq) => !this.recentSequenceIds.includes(seq.id));

    const selectedPool = available.length > 0 ? available : pool;
    // Pick randomly from the available non-recent subset
    const randomIndex = Math.floor(Math.random() * selectedPool.length);
    const chosen = selectedPool[randomIndex];

    this.recentSequenceIds.push(chosen.id);
    if (this.recentSequenceIds.length > 8) {
      this.recentSequenceIds.shift();
    }

    // Attach deterministic questions
    const questions = generateQuestionsForSequence(chosen);

    return {
      ...chosen,
      questions,
    };
  }

  /**
   * Selects a question avoiding repeating the exact same domain back-to-back
   */
  selectQuestion(sequence) {
    const questions = sequence.questions || [];
    if (questions.length === 0) return null;

    const lastDomain = this.recentQuestionDomains[this.recentQuestionDomains.length - 1];
    const preferred = questions.filter((q) => q.domain !== lastDomain);
    const pool = preferred.length > 0 ? preferred : questions;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.recentQuestionDomains.push(chosen.domain);
    if (this.recentQuestionDomains.length > 5) {
      this.recentQuestionDomains.shift();
    }

    return chosen;
  }

  resetHistory() {
    this.recentSequenceIds = [];
    this.recentQuestionDomains = [];
  }
}

export const defaultSequenceManager = new SequenceManager();
