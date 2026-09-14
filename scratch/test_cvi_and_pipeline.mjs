import assert from 'assert';

console.log('====================================================');
console.log('🧪 COGNITIVE VITALITY INDEX (CVI) & PIPELINE TEST SUITE');
console.log('====================================================\n');

// 0. Setup Mock AsyncStorage for headless testing
const storageBackingMap = new Map();
globalThis.AsyncStorage = {
  getItem: async (key) => storageBackingMap.get(key) || null,
  setItem: async (key, val) => {
    storageBackingMap.set(key, val);
    return null;
  },
  removeItem: async (key) => {
    storageBackingMap.delete(key);
    return null;
  },
  clear: async () => {
    storageBackingMap.clear();
    return null;
  },
};

// Dynamic imports of all target modules
const { validateRoundResult, calculateCVI, CVI_CONSTANTS } = await import(
  '../src/modules/performance/CognitiveVitalityIndex.js'
);
const { SessionManager } = await import('../src/games/suhTahLam/engine/SessionManager.js');
const { CognitiveProfile } = await import('../src/games/suhTahLam/engine/CognitiveProfile.js');
const { DifficultyEngine } = await import('../src/games/suhTahLam/engine/DifficultyEngine.js');
const { LocalPerformanceStorage } = await import('../src/games/suhTahLam/storage/LocalPerformanceStorage.js');
const { PerformanceTracker } = await import('../src/games/suhTahLam/engine/PerformanceTracker.js');
const { CognitiveAnalyticsService } = await import('../src/modules/performance/CognitiveAnalyticsService.js');

async function runAllTests() {
  let passedCount = 0;

  function markPassed(num, name) {
    passedCount++;
    console.log(`✓ Test ${num}: ${name}`);
  }

  // TEST 1: New player with no history
  {
    const res = calculateCVI([]);
    assert.strictEqual(res.status, 'insufficient_data');
    assert.strictEqual(res.cvi, null);
    assert.strictEqual(res.cviPercent, null);
    assert.strictEqual(res.validRounds, 0);
    assert.strictEqual(res.requiredRounds, 3);
    assert.strictEqual(res.isMedicalScore, false);
    assert(typeof res.disclaimer === 'string' && res.disclaimer.includes('not a medical'));
    markPassed(1, 'New player with no history returns insufficient_data');
  }

  // TEST 2: One valid round
  {
    const round1 = {
      playerId: 'P001',
      sessionId: 'sess_1',
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 4,
      correctAttempts: 4,
      accuracy: 1.0,
      durationSec: 30,
    };
    const res = calculateCVI([round1]);
    assert.strictEqual(res.status, 'insufficient_data');
    assert.strictEqual(res.cvi, null);
    assert.strictEqual(res.validRounds, 1);
    markPassed(2, 'One valid round returns insufficient_data (1/3)');
  }

  // TEST 3: Two valid rounds
  {
    const rounds = [
      {
        playerId: 'P001',
        sessionId: 'sess_1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 3,
        accuracy: 0.75,
        durationSec: 25,
      },
      {
        playerId: 'P001',
        sessionId: 'sess_1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 4,
        accuracy: 1.0,
        durationSec: 30,
      },
    ];
    const res = calculateCVI(rounds);
    assert.strictEqual(res.status, 'insufficient_data');
    assert.strictEqual(res.validRounds, 2);
    markPassed(3, 'Two valid rounds returns insufficient_data (2/3)');
  }

  // TEST 4: Three valid rounds (ready status)
  {
    const rounds = [
      {
        playerId: 'P001',
        sessionId: 'sess_1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 4,
        accuracy: 1.0,
        durationSec: 30,
      },
      {
        playerId: 'P001',
        sessionId: 'sess_1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 3,
        accuracy: 0.75,
        durationSec: 28,
      },
      {
        playerId: 'P001',
        sessionId: 'sess_1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 2,
        correctAttempts: 2,
        accuracy: 1.0,
        durationSec: 20,
      },
    ];
    // total attempts: 10, total correct: 9 -> acc = 0.9
    // consistency: 3 completed / 3 started = 1.0
    // CVI = 0.9 * 0.7 + 1.0 * 0.3 = 0.63 + 0.30 = 0.93 -> 93%
    const res = calculateCVI(rounds);
    assert.strictEqual(res.status, 'ready');
    assert.strictEqual(res.validRounds, 3);
    assert.strictEqual(res.totalAttempts, 10);
    assert.strictEqual(res.correctAttempts, 9);
    assert.strictEqual(res.accuracyScore, 0.9);
    assert.strictEqual(res.completionConsistencyScore, 1.0);
    assert.strictEqual(res.cvi, 0.93);
    assert.strictEqual(res.cviPercent, 93);
    assert.strictEqual(res.isMedicalScore, false);
    markPassed(4, 'Three valid rounds returns ready with accurate CVI');
  }

  // TEST 5: Partial accuracy calculation
  {
    const rounds = [
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 10, correctAttempts: 5 },
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 10, correctAttempts: 5 },
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 10, correctAttempts: 5 },
    ];
    const res = calculateCVI(rounds);
    assert.strictEqual(res.accuracyScore, 0.5);
    assert.strictEqual(res.completionConsistencyScore, 1.0);
    // 0.5 * 0.7 + 1.0 * 0.3 = 0.35 + 0.3 = 0.65 -> 65%
    assert.strictEqual(res.cvi, 0.65);
    assert.strictEqual(res.cviPercent, 65);
    markPassed(5, 'Partial accuracy correctly evaluated without artificial inflation');
  }

  // TEST 6: Zero-answer round rejected by validation
  {
    const zeroRound = {
      playerId: 'P001',
      sessionId: 's1',
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 0,
      correctAttempts: 0,
    };
    const val = validateRoundResult(zeroRound);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'no_real_attempts');
    markPassed(6, 'Zero-answer round is marked invalid and excluded');
  }

  // TEST 7: Abandoned round
  {
    const abandonedRound = {
      playerId: 'P001',
      sessionId: 's1',
      gameId: 'suh_tah_lam',
      status: 'abandoned',
      isAbandoned: true,
      attempts: 2,
      correctAttempts: 1,
    };
    const val = validateRoundResult(abandonedRound);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'round_not_completed');

    // Inclusion in started rounds impacts completion consistency
    const mix = [
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 4, correctAttempts: 4 },
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 4, correctAttempts: 4 },
      { playerId: 'P001', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 4, correctAttempts: 4 },
      abandonedRound,
    ];
    const res = calculateCVI(mix);
    assert.strictEqual(res.validRounds, 3);
    assert.strictEqual(res.accuracyScore, 1.0);
    // 3 completed / 4 started = 0.75
    assert.strictEqual(res.completionConsistencyScore, 0.75);
    // 1.0 * 0.7 + 0.75 * 0.3 = 0.7 + 0.225 = 0.925 -> 93%
    assert.strictEqual(res.cvi, 0.925);
    markPassed(7, 'Abandoned round affects consistency without being counted as valid completion');
  }

  // TEST 8: Missing response time is preserved as null (never fabricated)
  {
    const tracker = new PerformanceTracker({
      gameId: 'suh_tah_lam',
      playerId: 'P_TEST',
      storage: new LocalPerformanceStorage(),
    });
    await tracker.initialize({ playerId: 'P_TEST' });
    tracker.startRound({ difficulty: 'easy', sessionId: 'test_sess' });

    // Answer question without timestamp tracking
    tracker.recordAnswer({
      domain: 'visual',
      questionId: 'q1',
      chosenOption: 'A',
      correctOption: 'A',
      isCorrect: true,
      responseTimeMs: null,
    });

    const res = await tracker.completeRound();
    assert.strictEqual(res.round.responseTimeMs, null);
    assert.strictEqual(res.round.averageResponseTimeSec, null);
    markPassed(8, 'Missing response time remains null instead of using fake 3.0s fallback');
  }

  // TEST 9: Missing player ID
  {
    const noPlayerRound = {
      playerId: '',
      sessionId: 'sess_123',
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 3,
      correctAttempts: 3,
    };
    const val = validateRoundResult(noPlayerRound);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'missing_player_id');
    markPassed(9, 'Missing playerId fails validation');
  }

  // TEST 10: Missing session ID
  {
    const noSessionRound = {
      playerId: 'P001',
      sessionId: null,
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 3,
      correctAttempts: 3,
    };
    const val = validateRoundResult(noSessionRound);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'missing_session_id');
    markPassed(10, 'Missing sessionId fails validation');
  }

  // TEST 11: Invalid correct answer count
  {
    const invalidAttemptsRound = {
      playerId: 'P001',
      sessionId: 'sess_1',
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 3,
      correctAttempts: 5, // Impossible: more correct than attempts
    };
    const val = validateRoundResult(invalidAttemptsRound);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'invalid_correct_attempts');
    markPassed(11, 'Correct attempts greater than total attempts fails validation');
  }

  // TEST 12: Storage failure resilience
  {
    // Storage that throws on setItem
    const faultStorage = new LocalPerformanceStorage();
    const brokenAsyncStorage = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error('DISK_FULL');
      },
    };
    globalThis.AsyncStorage = brokenAsyncStorage;

    const tracker = new PerformanceTracker({
      gameId: 'suh_tah_lam',
      playerId: 'P_FAULT',
      storage: faultStorage,
    });
    await tracker.initialize({ playerId: 'P_FAULT' });
    tracker.startRound({ difficulty: 'easy', sessionId: 'sess_err' });
    tracker.recordAnswer({ domain: 'visual', questionId: 'q', isCorrect: true });

    // Should complete cleanly without crashing
    const completed = await tracker.completeRound();
    assert(completed && completed.round, 'Round completed despite storage error');
    assert.strictEqual(completed.round.attempts, 1);

    // Restore mock storage
    globalThis.AsyncStorage = {
      getItem: async (k) => storageBackingMap.get(k) || null,
      setItem: async (k, v) => {
        storageBackingMap.set(k, v);
        return null;
      },
    };
    markPassed(12, 'Storage failure does not crash gameplay flow');
  }

  // TEST 13: Multiple players data isolation
  {
    const storage = new LocalPerformanceStorage();
    await storage.saveRoundResult({
      session: { id: 'sess_p1', playerId: 'PLAYER_A' },
      roundData: {
        playerId: 'PLAYER_A',
        sessionId: 'sess_p1',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 4,
      },
      profile: { playerId: 'PLAYER_A', streak: 1 },
    });

    await storage.saveRoundResult({
      session: { id: 'sess_p2', playerId: 'PLAYER_B' },
      roundData: {
        playerId: 'PLAYER_B',
        sessionId: 'sess_p2',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 4,
        correctAttempts: 1,
      },
      profile: { playerId: 'PLAYER_B', streak: 0 },
    });

    const roundsA = await storage.getRoundHistory('suh_tah_lam', 'PLAYER_A');
    const roundsB = await storage.getRoundHistory('suh_tah_lam', 'PLAYER_B');

    assert.strictEqual(roundsA.length, 1);
    assert.strictEqual(roundsA[0].correctAttempts, 4);
    assert.strictEqual(roundsB.length, 1);
    assert.strictEqual(roundsB[0].correctAttempts, 1);
    markPassed(13, 'Multiple players data is strictly isolated by playerId');
  }

  // TEST 14: App restart and persistence
  {
    const storage = new LocalPerformanceStorage();
    const profileBefore = await storage.getProfile('suh_tah_lam', 'P_PERSIST');
    assert.strictEqual(profileBefore.overallAccuracy, null);

    // Simulate saving profile and rounds
    await storage.saveRoundResult({
      session: { id: 'sess_persist', playerId: 'P_PERSIST' },
      roundData: {
        playerId: 'P_PERSIST',
        sessionId: 'sess_persist',
        gameId: 'suh_tah_lam',
        status: 'completed',
        attempts: 5,
        correctAttempts: 4,
        accuracy: 0.8,
      },
      profile: {
        playerId: 'P_PERSIST',
        roundsPlayed: 1,
        overallAccuracy: 0.8,
      },
    });

    // Create a new instance simulating app restart
    const newStorage = new LocalPerformanceStorage();
    const profileAfter = await newStorage.getProfile('suh_tah_lam', 'P_PERSIST');
    const historyAfter = await newStorage.getRoundHistory('suh_tah_lam', 'P_PERSIST');

    assert.strictEqual(profileAfter.overallAccuracy, 0.8);
    assert.strictEqual(historyAfter.length, 1);
    assert.strictEqual(historyAfter[0].attempts, 5);
    markPassed(14, 'App restart loads persisted profile and rounds correctly');
  }

  // TEST 15: Paused session duration (active duration excludes paused time)
  {
    const sm = new SessionManager();
    const sess = sm.startSession({ playerId: 'P001' });

    // Simulate 300ms active
    await new Promise((r) => setTimeout(r, 50));
    sm.pause();
    // In pause for 100ms
    await new Promise((r) => setTimeout(r, 100));
    sm.resume();
    // Simulate another 50ms active
    await new Promise((r) => setTimeout(r, 50));

    const ended = sm.endSession();
    assert(ended.totalPausedDurationMs >= 80, 'Paused duration accumulated');
    assert(
      ended.activeDurationMs < Date.now() - new Date(sess.startedAt).getTime(),
      'Active duration is less than total wall clock time'
    );
    markPassed(15, 'Paused duration is tracked and excluded from active duration');
  }

  // TEST 16: Ending session while paused
  {
    const sm = new SessionManager();
    sm.startSession({ playerId: 'P001' });
    sm.pause();
    await new Promise((r) => setTimeout(r, 60));

    // End while paused
    const ended = sm.endSession();
    assert.strictEqual(ended.isPaused, false);
    assert(ended.totalPausedDurationMs >= 50, 'Pause interval was properly closed before finalizing');
    markPassed(16, 'Ending session while paused closes pause interval cleanly');
  }

  // TEST 17: Restart creates a new session ID and timestamp
  {
    const sm = new SessionManager();
    const first = sm.startSession({ playerId: 'P001' });
    await new Promise((r) => setTimeout(r, 10));

    const restartRes = sm.restart();
    assert(restartRes.previousSession, 'Has previous session record');
    assert.strictEqual(restartRes.previousSession.id, first.id);
    assert.notStrictEqual(restartRes.newSession.id, first.id);
    assert(
      new Date(restartRes.newSession.startedAt).getTime() >=
        new Date(restartRes.previousSession.startedAt).getTime()
    );
    markPassed(17, 'Session restart generates a fresh unique session ID');
  }

  // TEST 18: 0 performance score is preserved (not replaced by fallback 0.8)
  {
    const de = new DifficultyEngine({ minRoundsBeforeChange: 3 });
    const scoreZero = de.calculateWeightedScore({
      accuracy: 0,
      taskSuccess: 0,
      consistency: 0,
      domainAccuracy: 0,
      responseEfficiency: 0,
    });
    assert.strictEqual(scoreZero, 0, 'Score is 0, not replaced by default');

    // Evaluation with genuine 0 scores
    const historyWithZeros = [
      { difficulty: 'easy', performanceScore: 0, attempts: 2, status: 'completed' },
      { difficulty: 'easy', performanceScore: 0, attempts: 2, status: 'completed' },
      { difficulty: 'easy', performanceScore: 0, attempts: 2, status: 'completed' },
    ];
    const decision = de.evaluate({ currentDifficulty: 'easy', roundHistory: historyWithZeros });
    assert.strictEqual(decision.rollingScore, 0);
    assert.notStrictEqual(decision.rollingScore, 0.8);
    markPassed(18, 'Performance score of 0 is preserved without fake 0.8 fallback');
  }

  // TEST 19: Invalid records excluded from CVI
  {
    const mixedRecords = [
      // Valid round 1
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 3, correctAttempts: 3 },
      // Valid round 2
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 3, correctAttempts: 2 },
      // Invalid: missing sessionId
      { playerId: 'P1', sessionId: '', gameId: 'g1', status: 'completed', attempts: 3, correctAttempts: 2 },
      // Invalid: legacy unverified
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 3, correctAttempts: 2, dataQuality: 'legacy_unverified' },
      // Invalid: zero attempts
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 0, correctAttempts: 0 },
      // Valid round 3
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 4, correctAttempts: 4 },
    ];

    const cvi = calculateCVI(mixedRecords);
    assert.strictEqual(cvi.validRounds, 3);
    assert.strictEqual(cvi.status, 'ready');
    // Total attempts from only valid rounds: 3 + 3 + 4 = 10; correct: 3 + 2 + 4 = 9
    assert.strictEqual(cvi.totalAttempts, 10);
    assert.strictEqual(cvi.correctAttempts, 9);
    markPassed(19, 'Invalid and legacy records are strictly filtered from CVI calculations');
  }

  // TEST 20: CVI calculation determinism
  {
    const dataset = [
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 5, correctAttempts: 4 },
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 5, correctAttempts: 5 },
      { playerId: 'P1', sessionId: 's1', gameId: 'g1', status: 'completed', attempts: 5, correctAttempts: 3 },
    ];

    const run1 = calculateCVI(dataset);
    const run2 = calculateCVI(dataset);
    const run3 = calculateCVI([...dataset]);

    assert.strictEqual(run1.cvi, run2.cvi);
    assert.strictEqual(run1.cvi, run3.cvi);
    assert.strictEqual(run1.cviPercent, run2.cviPercent);
    assert.strictEqual(run1.accuracyScore, run2.accuracyScore);
    assert.strictEqual(run1.completionConsistencyScore, run2.completionConsistencyScore);
    markPassed(20, 'CVI calculation is 100% deterministic and reproducible');
  }

  // TEST 21: Storage deduplication (saving identical round twice does not duplicate)
  {
    const storage = new LocalPerformanceStorage();
    const testRound = {
      playerId: 'P_DEDUP',
      sessionId: 'sess_dedup_1',
      roundNumber: 1,
      gameId: 'suh_tah_lam',
      status: 'completed',
      attempts: 4,
      correctAttempts: 4,
      startedAt: '2026-09-14T11:00:00.000Z',
    };

    // Save twice
    await storage.saveRoundResult({
      session: { id: 'sess_dedup_1', playerId: 'P_DEDUP' },
      roundData: testRound,
      profile: { playerId: 'P_DEDUP' },
    });
    await storage.saveRoundResult({
      session: { id: 'sess_dedup_1', playerId: 'P_DEDUP' },
      roundData: testRound,
      profile: { playerId: 'P_DEDUP' },
    });

    const history = await storage.getRoundHistory('suh_tah_lam', 'P_DEDUP');
    assert.strictEqual(history.length, 1, 'Duplicate round was prevented by deduplication');

    // Test CognitiveAnalyticsService session deduplication
    const analytics = new CognitiveAnalyticsService();
    const sessA = await analytics.recordGameSession({
      gameId: 'suh_tah_lam',
      patientId: 'P_DEDUP',
      questionsTotal: 4,
      questionsCorrect: 4,
      metadata: { sessionId: 'sess_analytics_dedup_1' },
    });
    // Record same session again
    await analytics.recordGameSession({
      gameId: 'suh_tah_lam',
      patientId: 'P_DEDUP',
      questionsTotal: 4,
      questionsCorrect: 4,
      metadata: { sessionId: 'sess_analytics_dedup_1' },
    });

    const allSess = await analytics.getAllSessions();
    const dedupMatches = allSess.filter((s) => s.metadata?.sessionId === 'sess_analytics_dedup_1');
    assert.strictEqual(dedupMatches.length, 1, 'Duplicate session was prevented in analytics service');
    markPassed(21, 'Offline storage and sync deduplication verified');
  }

  // TEST 22: Missing playerId rejected by LocalPerformanceStorage
  {
    const storage = new LocalPerformanceStorage();
    const saveNoPlayer = await storage.saveRoundResult({
      session: { id: 'sess_1' },
      roundData: { status: 'completed', attempts: 4, correctAttempts: 4 },
      profile: {},
    });
    assert.strictEqual(saveNoPlayer.success, false);
    assert.strictEqual(saveNoPlayer.error, 'MISSING_PLAYER_ID');

    // Test getProfile with missing/empty playerId in all signature variations
    const profEmpty1 = await storage.getProfile('');
    assert.strictEqual(profEmpty1, null, "getProfile('') must return null");

    const profEmpty2 = await storage.getProfile('suh_tah_lam', '');
    assert.strictEqual(profEmpty2, null, "getProfile('suh_tah_lam', '') must return null");

    const profNull = await storage.getProfile(null);
    assert.strictEqual(profNull, null, "getProfile(null) must return null");

    // Test getRoundHistory with missing/empty playerId in all signature variations
    const histNull1 = await storage.getRoundHistory(null);
    assert.deepStrictEqual(histNull1, [], "getRoundHistory(null) must return []");

    const histNull2 = await storage.getRoundHistory('suh_tah_lam', null);
    assert.deepStrictEqual(histNull2, [], "getRoundHistory('suh_tah_lam', null) must return []");

    const histEmpty = await storage.getRoundHistory('');
    assert.deepStrictEqual(histEmpty, [], "getRoundHistory('') must return []");

    // Ensure no P001 or default storage key was accessed or created
    assert.strictEqual(storageBackingMap.has('@suh_tah_lam_performance_v2_P001'), false);
    assert.strictEqual(storageBackingMap.has('@suh_tah_lam_performance_v2_default'), false);

    markPassed(22, 'Missing playerId correctly returns MISSING_PLAYER_ID and blocks access without fallback');
  }

  // TEST 23: Missing sessionId rejected by LocalPerformanceStorage
  {
    const storage = new LocalPerformanceStorage();
    const saveNoSession = await storage.saveRoundResult({
      session: { playerId: 'P_VALID' },
      roundData: { playerId: 'P_VALID', status: 'completed', attempts: 4, correctAttempts: 4 },
      profile: { playerId: 'P_VALID' },
    });
    assert.strictEqual(saveNoSession.success, false);
    assert.strictEqual(saveNoSession.error, 'MISSING_SESSION_ID');

    const saveEmptySession = await storage.saveRoundResult({
      session: { id: '', playerId: 'P_VALID' },
      roundData: { playerId: 'P_VALID', status: 'completed', attempts: 4, correctAttempts: 4 },
      profile: { playerId: 'P_VALID' },
    });
    assert.strictEqual(saveEmptySession.success, false);
    assert.strictEqual(saveEmptySession.error, 'MISSING_SESSION_ID');
    markPassed(23, 'Missing sessionId correctly returns MISSING_SESSION_ID');
  }

  // TEST 24: Invalid gameplay round stored with invalid_gameplay and validationReason (in both environments)
  {
    const invalidRound = {
      playerId: 'P_INVALID_TEST',
      sessionId: 'sess_inv_1',
      gameId: 'suh_tah_lam',
      roundNumber: 1,
      status: 'completed',
      attempts: 2,
      correctAttempts: 5, // Invalid: correct > attempts
    };

    // Environment A: With AsyncStorage available
    {
      const storageWithAsync = new LocalPerformanceStorage();
      const res = await storageWithAsync.saveRoundResult({
        session: { id: 'sess_inv_1', playerId: 'P_INVALID_TEST', gameId: 'suh_tah_lam' },
        roundData: invalidRound,
        profile: { playerId: 'P_INVALID_TEST', gameId: 'suh_tah_lam' },
      });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.round.dataQuality, 'invalid_gameplay');
      assert.strictEqual(res.round.eligibleForCVI, false);
      assert.strictEqual(res.round.validationReason, 'invalid_correct_attempts');

      const history = await storageWithAsync.getRoundHistory('suh_tah_lam', 'P_INVALID_TEST');
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].dataQuality, 'invalid_gameplay');
      assert.strictEqual(history[0].eligibleForCVI, false);
      assert.strictEqual(history[0].validationReason, 'invalid_correct_attempts');
    }

    // Environment B: Without AsyncStorage (memory cache fallback)
    {
      const savedStorage = globalThis.AsyncStorage;
      try {
        globalThis.AsyncStorage = null; // Disable AsyncStorage
        const storageWithoutAsync = new LocalPerformanceStorage();

        const res = await storageWithoutAsync.saveRoundResult({
          session: { id: 'sess_inv_1', playerId: 'P_INVALID_NO_ASYNC', gameId: 'suh_tah_lam' },
          roundData: { ...invalidRound, playerId: 'P_INVALID_NO_ASYNC' },
          profile: { playerId: 'P_INVALID_NO_ASYNC', gameId: 'suh_tah_lam' },
        });
        assert.strictEqual(res.success, true, 'Saves to memoryCache when storage unavailable');
        assert.strictEqual(res.round.dataQuality, 'invalid_gameplay');
        assert.strictEqual(res.round.eligibleForCVI, false);
        assert.strictEqual(res.round.validationReason, 'invalid_correct_attempts');

        // Reads back from memoryCache
        const historyNoAsync = await storageWithoutAsync.getRoundHistory('suh_tah_lam', 'P_INVALID_NO_ASYNC');
        assert.strictEqual(historyNoAsync.length, 1, 'Reads back from memoryCache');
        assert.strictEqual(historyNoAsync[0].dataQuality, 'invalid_gameplay');
        assert.strictEqual(historyNoAsync[0].eligibleForCVI, false);
        assert.strictEqual(historyNoAsync[0].validationReason, 'invalid_correct_attempts');
      } finally {
        globalThis.AsyncStorage = savedStorage; // Restore mock storage
      }
    }

    markPassed(24, 'Invalid gameplay accurately labeled invalid_gameplay in both storage and memory environments');
  }

  // TEST 25: Missing gameId rejected by LocalPerformanceStorage
  {
    const storage = new LocalPerformanceStorage();
    const saveNoGame = await storage.saveRoundResult({
      session: { id: 'sess_valid', playerId: 'P_VALID' },
      roundData: { playerId: 'P_VALID', sessionId: 'sess_valid', status: 'completed', attempts: 4, correctAttempts: 4 },
      profile: { playerId: 'P_VALID' },
    });
    assert.strictEqual(saveNoGame.success, false);
    assert.strictEqual(saveNoGame.error, 'MISSING_GAME_ID');
    markPassed(25, 'Missing gameId correctly returns MISSING_GAME_ID');
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedCount} OF 25 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runAllTests().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:');
  console.error(err);
  process.exit(1);
});
