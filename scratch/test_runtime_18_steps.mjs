import assert from 'assert';

console.log('======================================================================');
console.log('📱 REAL-APP RUNTIME VERIFICATION: 18-STEP MANUAL SCENARIOS SIMULATION');
console.log('======================================================================\n');

// Mock AsyncStorage backed by persistent memory map
const persistentStore = new Map();
globalThis.AsyncStorage = {
  getItem: async (k) => persistentStore.get(k) || null,
  setItem: async (k, v) => {
    persistentStore.set(k, v);
    return null;
  },
  removeItem: async (k) => {
    persistentStore.delete(k);
    return null;
  },
  clear: async () => {
    persistentStore.clear();
    return null;
  },
};

// Import active application services
const { calculateCVI, validateRoundResult } = await import('../src/modules/performance/CognitiveVitalityIndex.js');
const { LocalPerformanceStorage } = await import('../src/games/suhTahLam/storage/LocalPerformanceStorage.js');
const { PerformanceTracker } = await import('../src/games/suhTahLam/engine/PerformanceTracker.js');
const { SessionManager } = await import('../src/games/suhTahLam/engine/SessionManager.js');
const { CognitiveAnalyticsService } = await import('../src/modules/performance/CognitiveAnalyticsService.js');

async function runRuntimeScenarios() {
  const stepsPassed = [];

  // =========================================================================
  // STEP 1: Login as a new user with no gameplay history
  // =========================================================================
  console.log('--- STEP 1: Login as a new user with no gameplay history ---');
  const user1 = {
    patientId: 'PATIENT_MEI_01',
    patientName: 'Mei Lin',
    patientAge: '71',
    caregiverName: 'Anand Lin',
  };
  const storageUser1 = new LocalPerformanceStorage();
  const initialProfile = await storageUser1.getProfile('suh_tah_lam', user1.patientId);
  const initialHistory = await storageUser1.getRoundHistory('suh_tah_lam', user1.patientId);

  assert.strictEqual(initialHistory.length, 0, 'User 1 must start with 0 history');
  assert.strictEqual(initialProfile.hasEnoughData, false);
  assert.strictEqual(initialProfile.overallAccuracy, null);
  console.log(`✓ User 1 (${user1.patientName}, ID: ${user1.patientId}) created with zero history.\n`);
  stepsPassed.push('Step 1: New user initialized with 0 rounds');

  // =========================================================================
  // STEP 2 & 3: Open Insights/Analytics screen & Confirm Insufficient Data
  // =========================================================================
  console.log('--- STEP 2 & 3: Open Insights screen & Confirm Insufficient Data (No fake 0.8/80/85) ---');
  const analyticsService = new CognitiveAnalyticsService();
  const dashboardStep2 = await analyticsService.getCaregiverDashboardData('7d', user1);

  console.log('  Dashboard State Snapshot:');
  console.log(`    vitalityIndex: ${dashboardStep2.vitalityIndex}`);
  console.log(`    cviEvaluation.status: ${dashboardStep2.cviEvaluation.status}`);
  console.log(`    cviEvaluation.validRounds: ${dashboardStep2.cviEvaluation.validRounds} / ${dashboardStep2.cviEvaluation.requiredRounds}`);
  console.log(`    overallAccuracy: ${dashboardStep2.overallAccuracy}`);
  console.log(`    avgSpeed: ${dashboardStep2.avgSpeed}`);

  assert.strictEqual(dashboardStep2.vitalityIndex, null, 'CVI must be null, not fake fallback');
  assert.strictEqual(dashboardStep2.cviEvaluation.status, 'insufficient_data');
  assert.strictEqual(dashboardStep2.cviEvaluation.validRounds, 0);
  assert.strictEqual(dashboardStep2.overallAccuracy, null);
  assert.strictEqual(dashboardStep2.avgSpeed, null);
  assert.notStrictEqual(dashboardStep2.vitalityIndex, 0.8);
  assert.notStrictEqual(dashboardStep2.vitalityIndex, 0.85);
  assert.notStrictEqual(dashboardStep2.vitalityIndex, 80);
  assert.notStrictEqual(dashboardStep2.vitalityIndex, 85);
  assert.notStrictEqual(dashboardStep2.vitalityIndex, 100);
  console.log('✓ Verified: CVI displays Insufficient Data baseline (0/3 rounds) with zero fake numbers.\n');
  stepsPassed.push('Step 2 & 3: Analytics screen confirms Insufficient Data state');

  // =========================================================================
  // STEP 4, 5, 6: Complete one real cognitive game round & Confirm authenticity
  // =========================================================================
  console.log('--- STEP 4, 5, 6: Complete 1 real round (4 questions, 3 correct) ---');
  const sessionMgr1 = new SessionManager();
  const sess1 = sessionMgr1.startSession({ playerId: user1.patientId });

  const tracker1 = new PerformanceTracker({
    gameId: 'suh_tah_lam',
    playerId: user1.patientId,
    storage: storageUser1,
  });
  await tracker1.initialize({ playerId: user1.patientId });

  tracker1.startRound({ difficulty: 'easy', sessionId: sess1.id });
  // Answer 4 questions: 3 correct, 1 incorrect
  tracker1.recordAnswer({ domain: 'visual', isCorrect: true, responseTimeMs: 2400 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 2100 });
  tracker1.recordAnswer({ domain: 'visual', isCorrect: false, responseTimeMs: 3200 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 1900 });

  const round1Result = await tracker1.completeRound();

  // Sync to analytics service
  await analyticsService.recordGameSession({
    gameId: 'suh_tah_lam',
    gameName: 'Suh Tah Lam',
    patientId: user1.patientId,
    difficulty: 'easy',
    durationSec: round1Result.round.durationSec,
    questionsTotal: round1Result.round.attempts,
    questionsCorrect: round1Result.round.correctAttempts,
    accuracy: round1Result.round.accuracy * 100,
    responseTimeSec: round1Result.round.averageResponseTimeSec,
    metadata: { sessionId: sess1.id, roundNumber: round1Result.round.roundNumber, eligibleForCVI: round1Result.round.eligibleForCVI },
  });

  // Step 5: Check player ID & persistence
  const historyAfter1 = await storageUser1.getRoundHistory('suh_tah_lam', user1.patientId);
  assert.strictEqual(historyAfter1.length, 1);
  assert.strictEqual(historyAfter1[0].playerId, user1.patientId, 'Must match authenticated player ID');
  assert.strictEqual(historyAfter1[0].sessionId, sess1.id);

  // Step 6: Check attempts and correct answers match actual gameplay
  assert.strictEqual(historyAfter1[0].attempts, 4);
  assert.strictEqual(historyAfter1[0].correctAttempts, 3);
  assert.strictEqual(historyAfter1[0].accuracy, 0.75);
  assert.strictEqual(historyAfter1[0].dataQuality, 'verified_gameplay');
  assert.strictEqual(historyAfter1[0].eligibleForCVI, true);
  console.log(`✓ Round 1 completed: attempts=${historyAfter1[0].attempts}, correct=${historyAfter1[0].correctAttempts}, accuracy=75%`);
  console.log(`  Saved under Player ID: ${historyAfter1[0].playerId}\n`);
  stepsPassed.push('Step 4, 5, 6: Completed 1 real round with authentic metrics');

  // Verify CVI is STILL insufficient (1 / 3)
  const dashboardAfter1 = await analyticsService.getCaregiverDashboardData('7d', user1);
  assert.strictEqual(dashboardAfter1.vitalityIndex, null);
  assert.strictEqual(dashboardAfter1.cviEvaluation.validRounds, 1);
  console.log(`  Analytics after Round 1: ${dashboardAfter1.cviEvaluation.validRounds}/3 rounds (CVI still null as required).`);

  // =========================================================================
  // STEP 7 & 8: Complete two more valid rounds & Confirm CVI availability
  // =========================================================================
  console.log('\n--- STEP 7 & 8: Complete 2 more valid rounds (Total 3 valid rounds) ---');
  // Round 2: 4/4 correct
  tracker1.startRound({ difficulty: 'easy', sessionId: sess1.id });
  tracker1.recordAnswer({ domain: 'visual', isCorrect: true, responseTimeMs: 2000 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 2200 });
  tracker1.recordAnswer({ domain: 'visual', isCorrect: true, responseTimeMs: 1800 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 2100 });
  const round2Result = await tracker1.completeRound();
  await analyticsService.recordGameSession({
    gameId: 'suh_tah_lam',
    gameName: 'Suh Tah Lam',
    patientId: user1.patientId,
    difficulty: 'easy',
    durationSec: round2Result.round.durationSec,
    questionsTotal: round2Result.round.attempts,
    questionsCorrect: round2Result.round.correctAttempts,
    accuracy: round2Result.round.accuracy * 100,
    responseTimeSec: round2Result.round.averageResponseTimeSec,
    metadata: { sessionId: sess1.id, roundNumber: round2Result.round.roundNumber, eligibleForCVI: round2Result.round.eligibleForCVI },
  });

  // Round 3: 4/4 correct
  tracker1.startRound({ difficulty: 'easy', sessionId: sess1.id });
  tracker1.recordAnswer({ domain: 'visual', isCorrect: true, responseTimeMs: 2100 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 1900 });
  tracker1.recordAnswer({ domain: 'visual', isCorrect: true, responseTimeMs: 2000 });
  tracker1.recordAnswer({ domain: 'spatial', isCorrect: true, responseTimeMs: 1800 });
  const round3Result = await tracker1.completeRound();
  await analyticsService.recordGameSession({
    gameId: 'suh_tah_lam',
    gameName: 'Suh Tah Lam',
    patientId: user1.patientId,
    difficulty: 'easy',
    durationSec: round3Result.round.durationSec,
    questionsTotal: round3Result.round.attempts,
    questionsCorrect: round3Result.round.correctAttempts,
    accuracy: round3Result.round.accuracy * 100,
    responseTimeSec: round3Result.round.averageResponseTimeSec,
    metadata: { sessionId: sess1.id, roundNumber: round3Result.round.roundNumber, eligibleForCVI: round3Result.round.eligibleForCVI },
  });

  const dashboardAfter3 = await analyticsService.getCaregiverDashboardData('7d', user1);
  console.log('  Dashboard State after 3 Completed Rounds:');
  console.log(`    vitalityIndex: ${dashboardAfter3.vitalityIndex} / 100`);
  console.log(`    cviEvaluation.status: ${dashboardAfter3.cviEvaluation.status}`);
  console.log(`    cviEvaluation.validRounds: ${dashboardAfter3.cviEvaluation.validRounds}`);
  console.log(`    accuracyScore: ${dashboardAfter3.cviEvaluation.accuracyScore} (70% weight)`);
  console.log(`    consistencyScore: ${dashboardAfter3.cviEvaluation.completionConsistencyScore} (30% weight)`);

  assert.strictEqual(dashboardAfter3.cviEvaluation.status, 'ready');
  assert.strictEqual(dashboardAfter3.cviEvaluation.validRounds, 3);
  assert(typeof dashboardAfter3.vitalityIndex === 'number' && dashboardAfter3.vitalityIndex > 0);
  console.log('✓ Verified: CVI unlocked automatically upon achieving 3/3 valid rounds.\n');
  stepsPassed.push('Step 7 & 8: CVI unlocked after 3 valid rounds');

  // =========================================================================
  // STEP 9 & 10: Start a round and exit without answering (abandoned/zero-answer)
  // =========================================================================
  console.log('--- STEP 9 & 10: Start round and exit without answering (abandoned/zero-answer) ---');
  tracker1.startRound({ difficulty: 'easy', sessionId: sess1.id });
  const abandonedRound = tracker1.abandonRound();

  assert.strictEqual(abandonedRound.status, 'abandoned');
  assert.strictEqual(abandonedRound.eligibleForCVI, false);
  assert.strictEqual(abandonedRound.attempts, 0);

  // Attempt to save to storage
  const saveAbandoned = await storageUser1.saveRoundResult({
    session: { id: sess1.id, playerId: user1.patientId },
    roundData: abandonedRound,
    profile: tracker1.profile,
  });

  assert.strictEqual(saveAbandoned.round.eligibleForCVI, false);
  assert.strictEqual(saveAbandoned.round.dataQuality, 'invalid_gameplay');

  // Query CVI again to confirm valid rounds count did NOT increase
  const user1Rounds = await storageUser1.getRoundHistory('suh_tah_lam', user1.patientId);
  const evalCheck = calculateCVI(user1Rounds, { playerId: user1.patientId });

  assert.strictEqual(evalCheck.validRounds, 3, 'Valid completed rounds must still remain 3');
  console.log(`✓ Abandoned/zero-attempt round tagged as invalid_gameplay (eligibleForCVI: false).`);
  console.log(`  Valid rounds count remains exactly: ${evalCheck.validRounds} (did not increase).\n`);
  stepsPassed.push('Step 9 & 10: Abandoned/zero-answer round excluded from valid CVI rounds');

  // =========================================================================
  // STEP 11 & 12: Pause and resume game (confirm paused time excluded from duration)
  // =========================================================================
  console.log('--- STEP 11 & 12: Pause and resume game (verify paused duration exclusion) ---');
  const pauseTestSessionMgr = new SessionManager();
  const pauseSess = pauseTestSessionMgr.startSession({ playerId: user1.patientId });

  // Simulate active play for 60ms
  await new Promise((r) => setTimeout(r, 60));
  pauseTestSessionMgr.pause();
  assert.strictEqual(pauseTestSessionMgr.isPaused, true);

  // Paused for 120ms
  await new Promise((r) => setTimeout(r, 120));
  pauseTestSessionMgr.resume();
  assert.strictEqual(pauseTestSessionMgr.isPaused, false);

  // Active for another 40ms
  await new Promise((r) => setTimeout(r, 40));
  const finishedSession = pauseTestSessionMgr.endSession();

  console.log(`    Total wall clock elapsed: ${Date.now() - new Date(pauseSess.startedAt).getTime()}ms`);
  console.log(`    Total paused duration: ${finishedSession.totalPausedDurationMs}ms`);
  console.log(`    Active duration: ${finishedSession.activeDurationMs}ms`);

  assert(finishedSession.totalPausedDurationMs >= 100, 'Paused duration >= 100ms');
  assert(finishedSession.activeDurationMs < Date.now() - new Date(pauseSess.startedAt).getTime());
  console.log('✓ Verified: Paused time is strictly excluded from active duration.\n');
  stepsPassed.push('Step 11 & 12: Paused duration cleanly excluded from active gameplay duration');

  // =========================================================================
  // STEP 13 & 14: Restart a session (confirm new unique session ID)
  // =========================================================================
  console.log('--- STEP 13 & 14: Restart session (verify new session ID generation) ---');
  const restartMgr = new SessionManager();
  const originalSession = restartMgr.startSession({ playerId: user1.patientId });
  const restartResult = restartMgr.restart();

  console.log(`    Original Session ID: ${originalSession.id}`);
  console.log(`    New Restarted Session ID: ${restartResult.newSession.id}`);

  assert(originalSession.id && restartResult.newSession.id);
  assert.notStrictEqual(originalSession.id, restartResult.newSession.id);
  assert.strictEqual(restartResult.previousSession.id, originalSession.id);
  console.log('✓ Verified: Session restart generates fresh unique session ID.\n');
  stepsPassed.push('Step 13 & 14: Session restart creates new session ID');

  // =========================================================================
  // STEP 15 & 16: Reload the app (confirm player history and CVI persist)
  // =========================================================================
  console.log('--- STEP 15 & 16: Reload app (simulate app restart from persistent storage) ---');
  // Re-instantiate brand new storage instance without in-memory state
  const reloadedStorage = new LocalPerformanceStorage();
  const reloadedProfile = await reloadedStorage.getProfile('suh_tah_lam', user1.patientId);
  const reloadedHistory = await reloadedStorage.getRoundHistory('suh_tah_lam', user1.patientId);

  const reloadedCvi = calculateCVI(reloadedHistory, { playerId: user1.patientId });

  console.log(`    Reloaded rounds count: ${reloadedHistory.length}`);
  console.log(`    Reloaded valid CVI rounds: ${reloadedCvi.validRounds}`);
  console.log(`    Reloaded CVI Percent: ${reloadedCvi.cviPercent}%`);

  assert(reloadedHistory.length >= 3);
  assert.strictEqual(reloadedCvi.status, 'ready');
  assert.strictEqual(reloadedCvi.validRounds, 3);
  console.log('✓ Verified: App reload preserves complete player history and CVI calculations.\n');
  stepsPassed.push('Step 15 & 16: Data persists across app reload');

  // =========================================================================
  // STEP 17 & 18: Test with a second user (confirm complete isolation)
  // =========================================================================
  console.log('--- STEP 17 & 18: Second user login (confirm 100% data isolation) ---');
  const user2 = {
    patientId: 'PATIENT_DEV_02',
    patientName: 'Devika Baruah',
    patientAge: '68',
    caregiverName: 'Tarun Baruah',
  };

  const storageUser2 = new LocalPerformanceStorage();
  const user2Profile = await storageUser2.getProfile('suh_tah_lam', user2.patientId);
  const user2History = await storageUser2.getRoundHistory('suh_tah_lam', user2.patientId);

  // User 2 dashboard
  const user2Dashboard = await analyticsService.getCaregiverDashboardData('7d', user2);

  console.log(`    User 2 History Count: ${user2History.length}`);
  console.log(`    User 2 Vitality Index: ${user2Dashboard.vitalityIndex}`);
  console.log(`    User 2 Valid Rounds: ${user2Dashboard.cviEvaluation.validRounds}`);

  assert.strictEqual(user2History.length, 0, 'User 2 must have 0 rounds');
  assert.strictEqual(user2Dashboard.vitalityIndex, null, 'User 2 must NOT see User 1 CVI score');
  assert.strictEqual(user2Dashboard.cviEvaluation.status, 'insufficient_data');
  assert.strictEqual(user2Dashboard.cviEvaluation.validRounds, 0);

  console.log(`✓ Verified: User 2 (${user2.patientName}) sees 0 records and cannot view User 1 data.\n`);
  stepsPassed.push('Step 17 & 18: Second user data is completely isolated');

  console.log('======================================================================');
  console.log(`🎉 ALL 18 / 18 REAL-APP RUNTIME VERIFICATION SCENARIOS PASSED!`);
  console.log('======================================================================\n');
}

runRuntimeScenarios().catch((err) => {
  console.error('❌ Runtime verification failed:', err);
  process.exit(1);
});
