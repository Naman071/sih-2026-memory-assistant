/**
 * UBILAKAPKI - Question & Recall Option Manager
 * Structures verified cognitive recall queries from the completed passing sequence.
 */

import { PLAYER_ARCHETYPES } from '../data/players.js';

export class QuestionManager {
  createQuestion(sequence) {
    if (!sequence) return null;

    const count = sequence.playerCount || 3;
    const activeArchetypes = PLAYER_ARCHETYPES.slice(0, count);
    const options = activeArchetypes.map((p) => p.id);
    const finalHolder = sequence.finalHolder || options[0];

    return {
      id: `ubi_q_${sequence.id || Date.now()}`,
      prompt: 'Who was holding the coconut at the end?',
      promptKey: 'games.ubilakapki.questionPrompt',
      options,
      correctAnswer: finalHolder,
      activeArchetypes,
      playerCount: count,
      explanation: `Player ${finalHolder} was holding the coconut at the end.`,
    };
  }
}

