/**
 * SUH TAH LAM - Question Generator & Templates
 *
 * Strictly deterministic: Questions are generated directly from the known
 * ground-truth sequence state.
 *
 * Uses structured localization keys so all questions, options, and feedback
 * reactively re-render when the app language changes.
 */

const DANCER_ACTION_DATA = {
  step_left: { key: 'games.suhTahLam.actions.step_left', fallback: 'Stepped left' },
  step_right: { key: 'games.suhTahLam.actions.step_right', fallback: 'Stepped right' },
  step_center: { key: 'games.suhTahLam.actions.step_center', fallback: 'Stepped to center' },
  turn: { key: 'games.suhTahLam.actions.turn', fallback: 'Turned' },
  step_forward: { key: 'games.suhTahLam.actions.step_forward', fallback: 'Stepped forward' },
  step_backward: { key: 'games.suhTahLam.actions.step_backward', fallback: 'Stepped backward' },
};

const POSITION_NAMES = {
  1: 'Top Left (Pos 1)',
  2: 'Top Center (Pos 2)',
  3: 'Top Right (Pos 3)',
  4: 'Left Side (Pos 4)',
  5: 'Center (Pos 5)',
  6: 'Right Side (Pos 6)',
  7: 'Bottom Left (Pos 7)',
  8: 'Bottom Center (Pos 8)',
  9: 'Bottom Right (Pos 9)',
};

/**
 * Generates deterministic questions for a given sequence
 */
export function generateQuestionsForSequence(sequence) {
  const questions = [];
  const events = sequence.events || [];
  if (events.length === 0) return questions;

  const firstEvent = events[0];

  // 1. Sequence Recall: "What did the dancer do first?"
  const firstAction = firstEvent.dancerAction || 'step_center';
  const allActionIds = ['step_left', 'step_right', 'step_center', 'turn'];
  const distractorIds = allActionIds.filter((a) => a !== firstAction).slice(0, 3);
  const sequenceOptionIds = [firstAction, ...distractorIds].sort(() => 0.5 - 0.2);

  const sequenceOptions = sequenceOptionIds.map((id) => ({
    id,
    key: (DANCER_ACTION_DATA[id] || DANCER_ACTION_DATA.step_center).key,
    fallback: (DANCER_ACTION_DATA[id] || DANCER_ACTION_DATA.step_center).fallback,
  }));

  questions.push({
    id: `${sequence.id}_q_seq_first`,
    domain: 'sequence',
    promptKey: 'games.suhTahLam.questions.dancerFirstAction',
    fallbackPrompt: 'What did the dancer do first?',
    correctAnswerId: firstAction,
    correctAnswer: (DANCER_ACTION_DATA[firstAction] || DANCER_ACTION_DATA.step_center).fallback,
    options: sequenceOptions,
  });

  // 2. Bamboo Movement Recall: "How many times did the bamboo close?"
  const claps = sequence.bambooTotalClaps;
  const clapCounts = [
    claps,
    Math.max(1, claps + 1),
    Math.max(0, claps - 1),
    claps + 2,
  ];
  const uniqueClapCounts = [...new Set(clapCounts)].slice(0, 4);
  while (uniqueClapCounts.length < 4) {
    uniqueClapCounts.push(uniqueClapCounts.length + 3);
  }

  const clapOptions = uniqueClapCounts.map((count) => ({
    id: `clap_${count}`,
    count,
    key: 'games.suhTahLam.timesUnit',
    params: { count },
    fallback: `${count} times`,
  }));

  questions.push({
    id: `${sequence.id}_q_bamboo_claps`,
    domain: 'movement',
    promptKey: 'games.suhTahLam.questions.bambooClapCount',
    fallbackPrompt: 'How many times did the bamboo close?',
    correctAnswerId: `clap_${claps}`,
    correctAnswer: `${claps} times`,
    options: clapOptions,
  });

  // 3. Spatial Visual Recall: "Where was the dancer at the end of the sequence?"
  const finalPos = sequence.finalGridPosition || 5;
  const distractorPositions = [5, 4, 6, 2, 8].filter((p) => p !== finalPos).slice(0, 3);
  const spatialPositionIds = [finalPos, ...distractorPositions];

  const spatialOptions = spatialPositionIds.map((pos) => ({
    id: `pos_${pos}`,
    pos,
    key: `games.suhTahLam.positions.pos${pos}`,
    fallback: POSITION_NAMES[pos] || `Position ${pos}`,
  }));

  questions.push({
    id: `${sequence.id}_q_spatial_end`,
    domain: 'spatial',
    promptKey: 'games.suhTahLam.questions.dancerFinalPosition',
    fallbackPrompt: 'Where was the dancer standing when the rhythm finished?',
    correctAnswerId: `pos_${finalPos}`,
    correctAnswer: POSITION_NAMES[finalPos] || 'Center (Pos 5)',
    options: spatialOptions,
  });

  // 4. Bamboo Action Order: "Which bamboo movement happened first?"
  const firstBambooId = firstEvent.bambooAction === 'open' ? 'open' : 'close';
  const bambooOptions = [
    { id: 'open', key: 'games.suhTahLam.actions.open', fallback: 'OPEN' },
    { id: 'close', key: 'games.suhTahLam.actions.close', fallback: 'CLOSE' },
    { id: 'step_left', key: 'games.suhTahLam.actions.step_left', fallback: 'STEP LEFT' },
    { id: 'turn', key: 'games.suhTahLam.actions.turn', fallback: 'TURN' },
  ];

  questions.push({
    id: `${sequence.id}_q_bamboo_first`,
    domain: 'movement',
    promptKey: 'games.suhTahLam.questions.bambooFirstMovement',
    fallbackPrompt: 'Which bamboo movement happened first?',
    correctAnswerId: firstBambooId,
    correctAnswer: firstBambooId === 'open' ? 'OPEN' : 'CLOSE',
    options: bambooOptions,
  });

  return questions;
}
