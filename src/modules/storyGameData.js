/**
 * Data module for the dementia-friendly "Memory Stories" (Story Recall) game.
 * Contains the story text keys and 9 carefully designed questions across 3 tiers:
 * - Easy: 4 questions (direct core facts)
 * - Medium: 3 questions (descriptive details)
 * - Hard: 2 questions (environmental / context recall)
 */

export const STORY_DATA = {
  id: 'maya_market_walk',
  titleKey: 'games.memoryStories.storyTitle',
  paragraph1Key: 'games.memoryStories.storyParagraph1',
  paragraph2Key: 'games.memoryStories.storyParagraph2',
};

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export const LEVEL_METADATA = {
  easy: {
    key: 'easy',
    order: 0,
    requiredCount: 4,
    badgeKey: 'games.memoryStories.levelEasyBadge',
    titleKey: 'games.memoryStories.levelEasy',
    descKey: 'games.memoryStories.levelEasyDesc',
    color: '#059669', // Emerald
    bgLight: '#ECFDF5',
  },
  medium: {
    key: 'medium',
    order: 1,
    requiredCount: 3,
    badgeKey: 'games.memoryStories.levelMediumBadge',
    titleKey: 'games.memoryStories.levelMedium',
    descKey: 'games.memoryStories.levelMediumDesc',
    color: '#2563EB', // Blue
    bgLight: '#EFF6FF',
  },
  hard: {
    key: 'hard',
    order: 2,
    requiredCount: 2,
    badgeKey: 'games.memoryStories.levelHardBadge',
    titleKey: 'games.memoryStories.levelHard',
    descKey: 'games.memoryStories.levelHardDesc',
    color: '#D97706', // Warm Amber
    bgLight: '#FEF3C7',
  },
};

export const STORY_QUESTIONS = [
  // Tier 1: Easy (4 Questions)
  {
    id: 'q1',
    difficulty: 'easy',
    number: 1,
    tierIndex: 0,
    questionKey: 'games.memoryStories.questions.q1.text',
    choiceKeys: [
      'games.memoryStories.questions.q1.choice0',
      'games.memoryStories.questions.q1.choice1',
      'games.memoryStories.questions.q1.choice2',
    ],
    correctIndex: 0, // Maya
    explanationKey: 'games.memoryStories.questions.q1.explanation',
  },
  {
    id: 'q2',
    difficulty: 'easy',
    number: 2,
    tierIndex: 1,
    questionKey: 'games.memoryStories.questions.q2.text',
    choiceKeys: [
      'games.memoryStories.questions.q2.choice0',
      'games.memoryStories.questions.q2.choice1',
      'games.memoryStories.questions.q2.choice2',
    ],
    correctIndex: 1, // Sweet red apples
    explanationKey: 'games.memoryStories.questions.q2.explanation',
  },
  {
    id: 'q3',
    difficulty: 'easy',
    number: 3,
    tierIndex: 2,
    questionKey: 'games.memoryStories.questions.q3.text',
    choiceKeys: [
      'games.memoryStories.questions.q3.choice0',
      'games.memoryStories.questions.q3.choice1',
      'games.memoryStories.questions.q3.choice2',
    ],
    correctIndex: 0, // Her neighbor Sunita
    explanationKey: 'games.memoryStories.questions.q3.explanation',
  },
  {
    id: 'q4',
    difficulty: 'easy',
    number: 4,
    tierIndex: 3,
    questionKey: 'games.memoryStories.questions.q4.text',
    choiceKeys: [
      'games.memoryStories.questions.q4.choice0',
      'games.memoryStories.questions.q4.choice1',
      'games.memoryStories.questions.q4.choice2',
    ],
    correctIndex: 2, // To her cozy home
    explanationKey: 'games.memoryStories.questions.q4.explanation',
  },

  // Tier 2: Medium (3 Questions)
  {
    id: 'q5',
    difficulty: 'medium',
    number: 5,
    tierIndex: 0,
    questionKey: 'games.memoryStories.questions.q5.text',
    choiceKeys: [
      'games.memoryStories.questions.q5.choice0',
      'games.memoryStories.questions.q5.choice1',
      'games.memoryStories.questions.q5.choice2',
    ],
    correctIndex: 0, // Blue
    explanationKey: 'games.memoryStories.questions.q5.explanation',
  },
  {
    id: 'q6',
    difficulty: 'medium',
    number: 6,
    tierIndex: 1,
    questionKey: 'games.memoryStories.questions.q6.text',
    choiceKeys: [
      'games.memoryStories.questions.q6.choice0',
      'games.memoryStories.questions.q6.choice1',
      'games.memoryStories.questions.q6.choice2',
    ],
    correctIndex: 1, // A small cloth bag
    explanationKey: 'games.memoryStories.questions.q6.explanation',
  },
  {
    id: 'q7',
    difficulty: 'medium',
    number: 7,
    tierIndex: 2,
    questionKey: 'games.memoryStories.questions.q7.text',
    choiceKeys: [
      'games.memoryStories.questions.q7.choice0',
      'games.memoryStories.questions.q7.choice1',
      'games.memoryStories.questions.q7.choice2',
    ],
    correctIndex: 1, // Four
    explanationKey: 'games.memoryStories.questions.q7.explanation',
  },

  // Tier 3: Hard (2 Questions)
  {
    id: 'q8',
    difficulty: 'hard',
    number: 8,
    tierIndex: 0,
    questionKey: 'games.memoryStories.questions.q8.text',
    choiceKeys: [
      'games.memoryStories.questions.q8.choice0',
      'games.memoryStories.questions.q8.choice1',
      'games.memoryStories.questions.q8.choice2',
    ],
    correctIndex: 2, // A flower shop
    explanationKey: 'games.memoryStories.questions.q8.explanation',
  },
  {
    id: 'q9',
    difficulty: 'hard',
    number: 9,
    tierIndex: 1,
    questionKey: 'games.memoryStories.questions.q9.text',
    choiceKeys: [
      'games.memoryStories.questions.q9.choice0',
      'games.memoryStories.questions.q9.choice1',
      'games.memoryStories.questions.q9.choice2',
    ],
    correctIndex: 1, // A sunny morning
    explanationKey: 'games.memoryStories.questions.q9.explanation',
  },
];

export const TOTAL_QUESTIONS = STORY_QUESTIONS.length; // 9

export function getQuestionsByDifficulty(difficulty) {
  return STORY_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

