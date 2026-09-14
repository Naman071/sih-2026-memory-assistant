/**
 * Multi-Game Cognitive Vitality Index (CVI) & Performance Verification Suite
 *
 * Verifies:
 * 1. Multi-game round validation across all 5 cognitive games
 * 2. Mandatory field validation (gameId, playerId, sessionId, attempts)
 * 3. LocalPerformanceStorage multi-game persistence and filtering
 * 4. Unified multi-game CVI formula and gameBreakdown
 * 5. Multi-game integration in CognitiveAnalyticsService & Caregiver Dashboard
 * 6. Authentic domain scores without fake 80/0.8 defaults
 * 7. Strict player data isolation
 */

import assert from 'assert';

// In-memory mock for AsyncStorage
const storageMap = new Map();
globalThis.AsyncStorage = {
  getItem: async (key) => storageMap.get(key) || null,
  setItem: async (key, value) => { storageMap.set(key, String(value)); },
  removeItem: async (key) => { storageMap.delete(key); },
  clear: async () => { storageMap.clear(); },
};

const { validateRoundResult, calculateCVI, CVI_CONSTANTS } = await import('../src/modules/performance/CognitiveVitalityIndex.js');
const { LocalPerformanceStorage } = await import('../src/games/suhTahLam/storage/LocalPerformanceStorage.js');
const { CognitiveAnalyticsService } = await import('../src/modules/performance/CognitiveAnalyticsService.js');
const { PerformanceTracker } = await import('../src/modules/performance/PerformanceTracker.js');

console.log('======================================================================');
console.log('🧪 MULTI-GAME COGNITIVE VITALITY INDEX (CVI) VERIFICATION SUITE');
console.log('======================================================================\n');

let passedTests = 0;
function testPass(num, name) {
  passedTests++;
  console.log(`✓ Test ${num}: ${name}`);
}

async function runTests() {
  // -------------------------------------------------------------------------
  // TEST 1: All 5 game IDs validated successfully
  // -------------------------------------------------------------------------
  const gameIds = ['suh_tah_lam', 'dhop_khel', 'ubilakapki', 'northeast_memory', 'memory_stories'];
  for (const gid of gameIds) {
    const v = validateRoundResult({
      gameId: gid,
      playerId: 'P_TEST',
      sessionId: 'sess_1',
      status: 'completed',
      attempts: 4,
      correctAttempts: 4,
    });
    assert.strictEqual(v.valid, true, `Game ID ${gid} should be valid`);
  }
  testPass(1, 'All 5 cognitive game IDs (suh_tah_lam, dhop_khel, ubilakapki, northeast_memory, memory_stories) pass validation');

  // -------------------------------------------------------------------------
  // TEST 2: Missing gameId rejected with missing_game_id
  // -------------------------------------------------------------------------
  const vNoGame = validateRoundResult({
    playerId: 'P_TEST',
    sessionId: 'sess_1',
    status: 'completed',
    attempts: 4,
    correctAttempts: 4,
  });
  assert.strictEqual(vNoGame.valid, false);
  assert.strictEqual(vNoGame.reason, 'missing_game_id');

  const vEmptyGame = validateRoundResult({
    gameId: '   ',
    playerId: 'P_TEST',
    sessionId: 'sess_1',
    status: 'completed',
    attempts: 4,
    correctAttempts: 4,
  });
  assert.strictEqual(vEmptyGame.valid, false);
  assert.strictEqual(vEmptyGame.reason, 'missing_game_id');
  testPass(2, 'Missing or whitespace gameId is strictly rejected');

  // -------------------------------------------------------------------------
  // TEST 3: Missing playerId and sessionId rejected
  // -------------------------------------------------------------------------
  const vNoPlayer = validateRoundResult({
    gameId: 'dhop_khel',
    sessionId: 'sess_1',
    status: 'completed',
    attempts: 4,
    correctAttempts: 4,
  });
  assert.strictEqual(vNoPlayer.valid, false);
  assert.strictEqual(vNoPlayer.reason, 'missing_player_id');

  const vNoSess = validateRoundResult({
    gameId: 'dhop_khel',
    playerId: 'P_TEST',
    status: 'completed',
    attempts: 4,
    correctAttempts: 4,
  });
  assert.strictEqual(vNoSess.valid, false);
  assert.strictEqual(vNoSess.reason, 'missing_session_id');
  testPass(3, 'Missing playerId or sessionId strictly rejected');

  // -------------------------------------------------------------------------
  // TEST 4: LocalPerformanceStorage requires real gameId
  // -------------------------------------------------------------------------
  const storage = new LocalPerformanceStorage();
  const resNoGame = await storage.saveRoundResult({
    session: { id: 'sess_test', playerId: 'P_MULTI_1' },
    roundData: { playerId: 'P_MULTI_1', sessionId: 'sess_test', attempts: 5, correctAttempts: 5, status: 'completed' },
  });
  assert.strictEqual(resNoGame.success, false);
  assert.strictEqual(resNoGame.error, 'MISSING_GAME_ID');
  testPass(4, 'LocalPerformanceStorage saveRoundResult returns MISSING_GAME_ID when gameId is missing');

  // -------------------------------------------------------------------------
  // TEST 5: LocalPerformanceStorage saves rounds across multiple games
  // -------------------------------------------------------------------------
  const p1 = 'P_CROSS_GAME_01';

  // Game 1: Suh Tah Lam
  await storage.saveRoundResult({
    session: { id: 'sess_stl_1', playerId: p1, gameId: 'suh_tah_lam' },
    roundData: {
      gameId: 'suh_tah_lam',
      playerId: p1,
      sessionId: 'sess_stl_1',
      roundNumber: 1,
      status: 'completed',
      attempts: 4,
      correctAttempts: 4,
      durationSec: 25,
      startedAt: '2026-09-14T10:00:00.000Z',
    },
    profile: { playerId: p1 },
  });

  // Game 2: Dhopkhel
  await storage.saveRoundResult({
    session: { id: 'sess_dk_1', playerId: p1, gameId: 'dhop_khel' },
    roundData: {
      gameId: 'dhop_khel',
      playerId: p1,
      sessionId: 'sess_dk_1',
      roundNumber: 1,
      status: 'completed',
      attempts: 6,
      correctAttempts: 5,
      durationSec: 30,
      startedAt: '2026-09-14T10:05:00.000Z',
    },
    profile: { playerId: p1 },
  });

  // Game 3: Ubilakapki
  await storage.saveRoundResult({
    session: { id: 'sess_ubi_1', playerId: p1, gameId: 'ubilakapki' },
    roundData: {
      gameId: 'ubilakapki',
      playerId: p1,
      sessionId: 'sess_ubi_1',
      roundNumber: 1,
      status: 'completed',
      attempts: 5,
      correctAttempts: 4,
      durationSec: 20,
      startedAt: '2026-09-14T10:10:00.000Z',
    },
    profile: { playerId: p1 },
  });

  // Query by specific games
  const stlRounds = await storage.getRoundHistory('suh_tah_lam', p1);
  const dkRounds = await storage.getRoundHistory('dhop_khel', p1);
  const ubiRounds = await storage.getRoundHistory('ubilakapki', p1);

  assert.strictEqual(stlRounds.length, 1);
  assert.strictEqual(stlRounds[0].gameId, 'suh_tah_lam');
  assert.strictEqual(dkRounds.length, 1);
  assert.strictEqual(dkRounds[0].gameId, 'dhop_khel');
  assert.strictEqual(ubiRounds.length, 1);
  assert.strictEqual(ubiRounds[0].gameId, 'ubilakapki');

  // Query all rounds across games
  const allRounds = await storage.getAllRoundHistory(p1);
  assert.strictEqual(allRounds.length, 3);
  testPass(5, 'LocalPerformanceStorage correctly stores and filters rounds by individual gameId and all games');

  // -------------------------------------------------------------------------
  // TEST 6: Multi-game CVI calculation combines cross-game valid rounds
  // -------------------------------------------------------------------------
  const multiGameCvi = calculateCVI(allRounds, { playerId: p1 });
  assert.strictEqual(multiGameCvi.status, 'ready');
  assert.strictEqual(multiGameCvi.validRounds, 3);
  assert.strictEqual(multiGameCvi.totalAttempts, 15); // 4 + 6 + 5 = 15
  assert.strictEqual(multiGameCvi.correctAttempts, 13); // 4 + 5 + 4 = 13
  // Accuracy = 13 / 15 = 0.8667
  // Consistency = 3 / 3 = 1.0
  // CVI = (0.8667 * 0.70) + (1.0 * 0.30) = 0.6067 + 0.3000 = 0.9067 -> 91%
  assert.strictEqual(multiGameCvi.cviPercent, 91);
  assert.deepStrictEqual(multiGameCvi.gamesIncluded.sort(), ['dhop_khel', 'suh_tah_lam', 'ubilakapki'].sort());

  assert.strictEqual(multiGameCvi.gameBreakdown.suh_tah_lam.validRounds, 1);
  assert.strictEqual(multiGameCvi.gameBreakdown.suh_tah_lam.totalAttempts, 4);
  assert.strictEqual(multiGameCvi.gameBreakdown.suh_tah_lam.totalCorrectAttempts, 4);
  assert.strictEqual(multiGameCvi.gameBreakdown.suh_tah_lam.accuracy, 1.0);

  assert.strictEqual(multiGameCvi.gameBreakdown.dhop_khel.validRounds, 1);
  assert.strictEqual(multiGameCvi.gameBreakdown.dhop_khel.totalAttempts, 6);
  assert.strictEqual(multiGameCvi.gameBreakdown.dhop_khel.totalCorrectAttempts, 5);

  assert.strictEqual(multiGameCvi.gameBreakdown.ubilakapki.validRounds, 1);
  assert.strictEqual(multiGameCvi.gameBreakdown.ubilakapki.totalAttempts, 5);
  assert.strictEqual(multiGameCvi.gameBreakdown.ubilakapki.totalCorrectAttempts, 4);
  testPass(6, 'Multi-game CVI correctly calculates unified score (91%) with gamesIncluded and per-game breakdown');

  // -------------------------------------------------------------------------
  // TEST 7: CognitiveAnalyticsService records multi-game sessions
  // -------------------------------------------------------------------------
  const analyticsService = new CognitiveAnalyticsService();
  const p2 = 'PATIENT_SARAH_02';

  // 1. New user with 0 sessions
  const dashEmpty = await analyticsService.getCaregiverDashboardData('7d', { patientId: p2 });
  assert.strictEqual(dashEmpty.vitalityIndex, null);
  assert.strictEqual(dashEmpty.cviEvaluation.status, 'insufficient_data');
  assert.strictEqual(dashEmpty.overallAccuracy, null);
  assert.strictEqual(dashEmpty.domains.visual_memory.score, null);
  assert.strictEqual(dashEmpty.domains.attention_focus.score, null);
  assert.strictEqual(dashEmpty.domains.spatial_coordination.score, null);
  assert.strictEqual(dashEmpty.domains.episodic_recall.score, null);
  testPass(7, 'CognitiveAnalyticsService returns null vitalityIndex and null domain scores for unplayed games (no fake 80)');

  // 2. Play 1 round of Northeast Scenic Memory (episodic recall)
  await analyticsService.recordGameSession({
    gameId: 'northeast_memory',
    domain: 'episodic_recall',
    difficulty: 'easy',
    durationSec: 40,
    questionsTotal: 4,
    questionsCorrect: 3,
    accuracy: 75,
    responseTimeSec: 2.5,
    patientId: p2,
    metadata: { sessionId: 'nem_1', eligibleForCVI: true },
  });

  const dashRound1 = await analyticsService.getCaregiverDashboardData('7d', { patientId: p2 });
  assert.strictEqual(dashRound1.vitalityIndex, null);
  assert.strictEqual(dashRound1.cviEvaluation.validRounds, 1);
  assert.strictEqual(dashRound1.domains.episodic_recall.score, 75);
  assert.strictEqual(dashRound1.domains.visual_memory.score, null); // Other domains still null
  testPass(8, '1 round of Northeast Memory updates episodic_recall domain while CVI remains null (1/3 rounds)');

  // 3. Play 1 round of Memory Stories (episodic recall)
  await analyticsService.recordGameSession({
    gameId: 'memory_stories',
    domain: 'episodic_recall',
    difficulty: 'easy',
    durationSec: 50,
    questionsTotal: 3,
    questionsCorrect: 3,
    accuracy: 100,
    responseTimeSec: 3.1,
    patientId: p2,
    metadata: { sessionId: 'story_1', eligibleForCVI: true },
  });

  const dashRound2 = await analyticsService.getCaregiverDashboardData('7d', { patientId: p2 });
  assert.strictEqual(dashRound2.vitalityIndex, null);
  assert.strictEqual(dashRound2.cviEvaluation.validRounds, 2);
  testPass(9, '2nd round from Memory Stories recorded; CVI still requires 3 rounds');

  // 4. Play 1 round of Dhopkhel (attention focus)
  await analyticsService.recordGameSession({
    gameId: 'dhop_khel',
    domain: 'attention_focus',
    difficulty: 'easy',
    durationSec: 35,
    questionsTotal: 5,
    questionsCorrect: 4,
    accuracy: 80,
    responseTimeSec: 1.8,
    patientId: p2,
    metadata: { sessionId: 'dhop_1', eligibleForCVI: true },
  });

  // Now 3 valid rounds across 3 different games!
  const dashRound3 = await analyticsService.getCaregiverDashboardData('7d', { patientId: p2 });
  assert.strictEqual(dashRound3.isCalibrated, true);
  assert.strictEqual(dashRound3.cviEvaluation.status, 'ready');
  assert.strictEqual(dashRound3.cviEvaluation.validRounds, 3);
  assert.strictEqual(typeof dashRound3.vitalityIndex, 'number');
  assert.strictEqual(dashRound3.cviEvaluation.gamesIncluded.length, 3);
  assert.deepStrictEqual(
    dashRound3.cviEvaluation.gamesIncluded.sort(),
    ['dhop_khel', 'memory_stories', 'northeast_memory'].sort()
  );
  testPass(10, '3 rounds across 3 distinct games (Northeast Memory + Memory Stories + Dhopkhel) unlock unified CVI');

  // -------------------------------------------------------------------------
  // TEST 11: Patient Data Isolation
  // -------------------------------------------------------------------------
  const p3 = 'PATIENT_CLEAN_03';
  const dashP3 = await analyticsService.getCaregiverDashboardData('7d', { patientId: p3 });
  assert.strictEqual(dashP3.vitalityIndex, null);
  assert.strictEqual(dashP3.cviEvaluation.validRounds, 0);
  assert.strictEqual(dashP3.totalSessions, 0);
  testPass(11, 'Strict player data isolation: Player 3 has zero history and cannot see Player 2 data');

  console.log('\n======================================================================');
  console.log(`🎉 ALL ${passedTests} OF 11 MULTI-GAME CVI TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});

