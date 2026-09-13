import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('--- STARTING UBILAKAPKI TEST SUITE ---');

// 1. Data Layer Tests
import { REGIONS, DEFAULT_REGION, REGION_LIST } from '../src/games/ubilakapki/data/regions.js';
import { PLAYER_ARCHETYPES, getRingCoordinates } from '../src/games/ubilakapki/data/players.js';
import { LEVEL_CONFIGS, DIFFICULTY_LEVELS } from '../src/games/ubilakapki/data/levels.js';
import { SEED_SEQUENCES, generatePassingSequence, createSequenceFingerprint } from '../src/games/ubilakapki/data/sequences.js';

console.log('✓ Testing Regions...');
assert.strictEqual(DEFAULT_REGION.id, 'assam', 'Default region must be Assam');
assert.strictEqual(REGION_LIST.length, 8, 'Must support 8 Northeast regions');
assert(REGIONS.meghalaya, 'Meghalaya profile must exist');
assert(REGIONS.manipur, 'Manipur profile must exist');
assert(REGIONS.nagaland, 'Nagaland profile must exist');

console.log('✓ Testing Players & Ring Geometry...');
assert.strictEqual(PLAYER_ARCHETYPES.length, 5, 'Must have 5 distinct player archetypes A-E');
const coords3 = getRingCoordinates(3, 100);
assert.strictEqual(Object.keys(coords3).length, 3, '3 players must yield 3 ring coordinates');
const coords5 = getRingCoordinates(5, 100);
assert.strictEqual(Object.keys(coords5).length, 5, '5 players must yield 5 ring coordinates');

console.log('✓ Testing Levels...');
assert.strictEqual(DIFFICULTY_LEVELS.length, 3, 'Must have 3 difficulty levels');
assert.strictEqual(LEVEL_CONFIGS.easy.playerCount, 3, 'Easy must have 3 players');
assert.strictEqual(LEVEL_CONFIGS.medium.playerCount, 4, 'Medium must have 4 players');
assert.strictEqual(LEVEL_CONFIGS.hard.playerCount, 5, 'Hard must have 5 players');

console.log('✓ Testing Procedural Sequence Generator...');
for (const diff of ['easy', 'medium', 'hard']) {
  const seq = generatePassingSequence(diff, []);
  assert(seq.id, `Sequence for ${diff} must have an ID`);
  assert(seq.passes.length >= 3, `Sequence must have passes`);
  assert.strictEqual(seq.finalHolder, seq.passes[seq.passes.length - 1], 'Final holder must match last pass');
  // Check no adjacent duplicate passes (a player cannot pass to themselves)
  for (let i = 0; i < seq.passes.length - 1; i++) {
    assert.notStrictEqual(seq.passes[i], seq.passes[i + 1], `Player cannot pass to self at pass ${i}`);
  }
}

// 2. Engine Layer Tests
import { DifficultyEngine } from '../src/games/ubilakapki/engine/DifficultyEngine.js';
import { SequenceManager } from '../src/games/ubilakapki/engine/SequenceManager.js';
import { QuestionManager } from '../src/games/ubilakapki/engine/QuestionManager.js';
import { SessionManager } from '../src/games/ubilakapki/engine/SessionManager.js';

console.log('✓ Testing SequenceManager...');
const seqMgr = new SequenceManager();
const s1 = seqMgr.getNextSequence('easy');
const s2 = seqMgr.getNextSequence('easy');
assert.strictEqual(s1.playerCount, 3, 'Easy sequence must have 3 players');
assert.strictEqual(s2.playerCount, 3, 'Easy sequence must have 3 players');

console.log('✓ Testing QuestionManager...');
const qMgr = new QuestionManager();
const question = qMgr.createQuestion(s1);
assert(question, 'Question must be created');
assert.strictEqual(question.options.length, 3, 'Question must have 3 options for easy');
assert.strictEqual(question.correctAnswer, s1.finalHolder, 'Correct answer must match final holder');
assert(question.promptKey, 'Question must have promptKey');

console.log('✓ Testing DifficultyEngine...');
const diffEngine = new DifficultyEngine('easy', 3);
assert.strictEqual(diffEngine.getLevel(), 'easy');

// 3 consecutive correct with fast response -> should promote
diffEngine.recordRound({ isCorrect: true, responseTimeSec: 2.5 });
diffEngine.recordRound({ isCorrect: true, responseTimeSec: 2.8 });
const eval1 = diffEngine.recordRound({ isCorrect: true, responseTimeSec: 3.0 });
assert.strictEqual(eval1.decision, 'promote', '3 strong rounds should trigger promotion');
assert.strictEqual(diffEngine.getLevel(), 'medium', 'Should advance to medium');

// 2 consecutive errors in medium -> demotes back to easy
diffEngine.recordRound({ isCorrect: false, responseTimeSec: 8.0 });
const eval2 = diffEngine.recordRound({ isCorrect: false, responseTimeSec: 9.0 });
assert.strictEqual(eval2.decision, 'demote', '2 errors in 3-round window should trigger demotion');
assert.strictEqual(diffEngine.getLevel(), 'easy', 'Should demote back to easy');

console.log('✓ Testing SessionManager...');
const sessMgr = new SessionManager('easy');
sessMgr.startSession('easy');
const round1 = sessMgr.startNextRound();
assert.strictEqual(round1.roundNumber, 1);
assert.strictEqual(round1.difficulty, 'easy');
assert(round1.sequence);
assert(round1.question);

sessMgr.recordRecallStart();
const roundRes = await sessMgr.endRound(round1.question.correctAnswer, true);
assert.strictEqual(roundRes.isCorrect, true);
assert(roundRes.responseTimeSec >= 0.5);

const stats = sessMgr.getCaregiverStats();
assert.strictEqual(stats.roundsCompleted, 1);
assert.strictEqual(stats.accuracy, 100);

// 3. Localization Verification
console.log('✓ Testing Translations in JSON files...');
const enPath = path.resolve('src/translations/en.json');
const asPath = path.resolve('src/translations/as.json');
const bnPath = path.resolve('src/translations/bn.json');
const hiPath = path.resolve('src/translations/hi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const as = JSON.parse(fs.readFileSync(asPath, 'utf8'));
const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

for (const [langCode, dict] of [['en', en], ['as', as], ['bn', bn], ['hi', hi]]) {
  assert(dict.games?.ubilakapki, `${langCode}.json must have games.ubilakapki`);
  const ubi = dict.games.ubilakapki;
  assert(ubi.title, `${langCode} must have ubilakapki.title`);
  assert(ubi.questionPrompt, `${langCode} must have ubilakapki.questionPrompt`);
  assert(ubi.wellRemembered, `${langCode} must have ubilakapki.wellRemembered`);
  assert(ubi.players?.A, `${langCode} must have player A`);
  assert(ubi.players?.B, `${langCode} must have player B`);
  assert(ubi.players?.C, `${langCode} must have player C`);
  assert(ubi.players?.D, `${langCode} must have player D`);
  assert(ubi.players?.E, `${langCode} must have player E`);
  assert(ubi.attires?.A, `${langCode} must have attire A`);
  assert(ubi.leaveGameTitle, `${langCode} must have leaveGameTitle`);
}

console.log('✓ ALL UBILAKAPKI UNIT & INTEGRATION TESTS PASSED!');
