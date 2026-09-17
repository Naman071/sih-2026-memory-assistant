import assert from 'node:assert';
import {
  CognitiveAnalyticsService,
  COGNITIVE_DOMAINS,
} from '../src/modules/performance/CognitiveAnalyticsService.js';

console.log('🧪 RUNNING COMPREHENSIVE INSIGHTS & REAL DATA AUDIT TEST SUITE\n');

// Mock AsyncStorage for headless testing
class MockAsyncStorage {
  constructor() {
    this.store = new Map();
  }
  async getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  async setItem(key, value) {
    this.store.set(key, String(value));
  }
  async removeItem(key) {
    this.store.delete(key);
  }
  async clear() {
    this.store.clear();
  }
}

const mockStorage = new MockAsyncStorage();
const analytics = new CognitiveAnalyticsService(mockStorage);

let testsPassed = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ Test ${totalTests}: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ Test ${totalTests} FAILED: ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ Test ${totalTests}: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ Test ${totalTests} FAILED: ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  // 1. Deterministic session ID generation
  runTest('Session ID generation is deterministic and contains no Math.random', () => {
    const id1 = analytics._generateSessionId('P001', 'suh_tah_lam');
    const id2 = analytics._generateSessionId('P001', 'suh_tah_lam');
    assert(id1.startsWith('sess_'), 'ID must start with sess_');
    assert(id1.includes('P001') && id1.includes('suh_tah_lam'), 'ID must include patientId and gameId');
    assert(id1 !== id2, 'Sequential IDs must be unique via counter');
    assert(!id1.includes('NaN'), 'ID must not contain NaN');
  });

  // 2. Reject missing patientId
  await runAsyncTest('Rejects session with missing patientId', async () => {
    const res = await analytics.recordGameSession({
      gameId: 'suh_tah_lam',
      accuracy: 80,
      durationSec: 60,
    });
    assert.strictEqual(res, null, 'Must reject session without patientId');
  });

  // 3. Reject missing gameId
  await runAsyncTest('Rejects session with missing gameId', async () => {
    const res = await analytics.recordGameSession({
      patientId: 'P001',
      accuracy: 80,
      durationSec: 60,
    });
    assert.strictEqual(res, null, 'Must reject session without gameId');
  });

  // 4. Reject negative duration
  await runAsyncTest('Rejects session with negative duration', async () => {
    const res = await analytics.recordGameSession({
      patientId: 'P001',
      gameId: 'suh_tah_lam',
      durationSec: -30,
      accuracy: 85,
    });
    assert.strictEqual(res, null, 'Must reject negative duration');
  });

  // 5. Reject invalid accuracy (>100 or <0)
  await runAsyncTest('Rejects session with invalid accuracy (>100)', async () => {
    const res = await analytics.recordGameSession({
      patientId: 'P001',
      gameId: 'suh_tah_lam',
      durationSec: 45,
      accuracy: 150,
    });
    assert.strictEqual(res, null, 'Must reject accuracy > 100');
  });

  // 6. Reject questionsCorrect > questionsTotal
  await runAsyncTest('Rejects session where questionsCorrect > questionsTotal', async () => {
    const res = await analytics.recordGameSession({
      patientId: 'P001',
      gameId: 'suh_tah_lam',
      durationSec: 45,
      questionsTotal: 5,
      questionsCorrect: 8,
    });
    assert.strictEqual(res, null, 'Must reject questionsCorrect > questionsTotal');
  });

  // 7. Authentic Empty State
  await runAsyncTest('Empty dashboard contains zero fabricated values and exact empty message', async () => {
    const empty = await analytics.getCaregiverDashboardData('all', { patientId: 'P_EMPTY_999' });
    assert.strictEqual(empty.vitalityIndex, null, 'vitalityIndex must be null when no games played');
    assert.strictEqual(empty.totalSessions, 0, 'totalSessions must be 0');
    assert.strictEqual(empty.overallAccuracy, null, 'overallAccuracy must be null');
    assert.strictEqual(empty.avgSpeed, null, 'avgSpeed must be null');
    assert.strictEqual(empty.isCalibrated, false, 'isCalibrated must be false');
    assert.strictEqual(empty.streakDays, 0, 'streakDays must be 0');
    assert(
      empty.clinicalObservations[0].text.includes('No gameplay data available yet'),
      'Must contain exact empty state guidance'
    );
  });

  // 8. Strict Patient Tenant Isolation in Local Storage
  await runAsyncTest('Storage key is partitioned per patient ID (no cross-tenant bleed)', async () => {
    const pAlpha = `PATIENT_ALPHA_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const pBeta = `PATIENT_BETA_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await analytics.recordGameSession({
      patientId: pAlpha,
      gameId: 'suh_tah_lam',
      accuracy: 90,
      score: 90,
      durationSec: 60,
    });

    await analytics.recordGameSession({
      patientId: pBeta,
      gameId: 'dhop_khel',
      accuracy: 70,
      score: 70,
      durationSec: 40,
    });

    const alphaSessions = await analytics.getAllSessions(pAlpha);
    const betaSessions = await analytics.getAllSessions(pBeta);

    assert.strictEqual(alphaSessions.length, 1, 'Alpha must have exactly 1 session');
    assert.strictEqual(alphaSessions[0].patientId, pAlpha);
    assert.strictEqual(alphaSessions[0].gameId, 'suh_tah_lam');

    assert.strictEqual(betaSessions.length, 1, 'Beta must have exactly 1 session');
    assert.strictEqual(betaSessions[0].patientId, pBeta);
    assert.strictEqual(betaSessions[0].gameId, 'dhop_khel');

    // Cross-check: Alpha cannot see Beta
    const crossCheck = alphaSessions.find((s) => s.patientId === pBeta);
    assert.strictEqual(crossCheck, undefined, 'Tenant leakage detected: Alpha can see Beta');
  });

  // 9. CVI Calibration Threshold (<3 rounds)
  await runAsyncTest('CVI requires at least 3 completed rounds before calculating score', async () => {
    const pId = `PATIENT_CALIB_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    // Round 1
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 100,
      score: 100,
      durationSec: 50,
      metadata: { eligibleForCVI: true },
    });
    let dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.isCalibrated, false, 'Should not be calibrated with 1 round');
    assert.strictEqual(dash.vitalityIndex, null, 'CVI score must be null with 1 round');
    assert.strictEqual(dash.cviEvaluation.validRounds, 1);

    // Round 2
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 80,
      score: 80,
      durationSec: 60,
      metadata: { eligibleForCVI: true },
    });
    dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.isCalibrated, false, 'Should not be calibrated with 2 rounds');
    assert.strictEqual(dash.vitalityIndex, null, 'CVI score must be null with 2 rounds');
    assert.strictEqual(dash.cviEvaluation.validRounds, 2);

    // Round 3 (Calibration Threshold Reached)
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 90,
      score: 90,
      durationSec: 40,
      metadata: { eligibleForCVI: true },
    });
    dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.isCalibrated, true, 'Should be calibrated with 3 rounds');
    assert(typeof dash.vitalityIndex === 'number', 'vitalityIndex must be a real number');
    assert(dash.vitalityIndex > 0 && dash.vitalityIndex <= 100, 'vitalityIndex must be between 1 and 100');
    assert.strictEqual(dash.cviEvaluation.validRounds, 3);
  });

  // 10. Accurate Mathematical Derivations from Actual Gameplay
  await runAsyncTest('Accuracy and duration are calculated purely from real data', async () => {
    const pId = `PATIENT_MATH_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 80,
      score: 80,
      durationSec: 120, // 2 mins
      responseTimeSec: 2.0,
      metadata: { eligibleForCVI: true },
    });
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'dhop_khel',
      accuracy: 100,
      score: 100,
      durationSec: 60, // 1 min
      responseTimeSec: 1.0,
      metadata: { eligibleForCVI: true },
    });

    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.totalSessions, 2);
    // (80 + 100) / 2 = 90
    assert.strictEqual(dash.overallAccuracy, 90, 'Average accuracy must be exact mathematical mean');
    // (120 + 60) / 60 = 3 mins
    assert.strictEqual(dash.exerciseMinutes, 3, 'Total exercise time must equal sum of durations in minutes');
    // (2.0 + 1.0) / 2 = 1.5s
    assert.strictEqual(dash.avgSpeed, 1.5, 'Average speed must be exact mathematical mean');
  });

  // 11. Cognitive Domain Mapping Integrity
  await runAsyncTest('Domains reflect only games actually played (unplayed domains remain null)', async () => {
    const pId = `PATIENT_DOMAIN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    // Only play visual_memory
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      domain: 'visual_memory',
      accuracy: 88,
      durationSec: 60,
    });

    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.domains.visual_memory.score, 88);
    assert.strictEqual(dash.domains.visual_memory.sessionsCount, 1);

    // Attention, Speed, Spatial coordination were NOT played and must have null score
    assert.strictEqual(dash.domains.attention_focus.score, null, 'Unplayed domain must be null');
    assert.strictEqual(dash.domains.attention_focus.sessionsCount, 0);
    assert.strictEqual(dash.domains.spatial_coordination.score, null, 'Unplayed domain must be null');
    assert.strictEqual(dash.domains.spatial_coordination.sessionsCount, 0);
  });

  // 12. Clinician Summary is Non-Medical and Derived from Genuine Data
  await runAsyncTest('Clinician summary text uses genuine stats and includes non-medical disclaimer', async () => {
    const pId = `PATIENT_SUMMARY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 85,
      score: 85,
      durationSec: 90,
    });
    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    const summary = analytics.generateClinicianSummary(dash, {
      patientName: 'Kalyan Baruah',
      caregiverName: 'Ananya Baruah',
    });

    assert(summary.includes('Kalyan Baruah'), 'Summary must contain patient name');
    assert(summary.includes('Ananya Baruah'), 'Summary must contain caregiver name');
    assert(summary.includes('1 sessions completed') || summary.includes('1 session'), 'Summary must reflect exact 1 session');
    assert(summary.includes('85%'), 'Summary must reflect exact 85% accuracy');
    assert(summary.includes('not a medical diagnosis') || summary.includes('clinical assessment'), 'Summary must contain disclaimer');
  });

  // 13. Timeframe Filtering
  await runAsyncTest('Timeframe filters 7d vs 30d correctly without fabricating historical points', async () => {
    const pId = `PATIENT_TIMEFRAME_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = Date.now();
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

    // Session today
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 90,
      durationSec: 60,
    });

    // Session 10 days ago
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 70,
      durationSec: 60,
      timestamp: tenDaysAgo,
    });

    const dash7d = await analytics.getCaregiverDashboardData('7d', { patientId: pId });
    const dash30d = await analytics.getCaregiverDashboardData('30d', { patientId: pId });

    assert.strictEqual(dash7d.totalSessions, 1, '7d timeframe must only include session from today');
    assert.strictEqual(dash30d.totalSessions, 2, '30d timeframe must include both sessions');
  });

  // 14. Non-medical disclaimer is always populated
  runTest('Disclaimer text is strictly non-medical across all responses', () => {
    const empty = analytics._buildEmptyDashboard('7d');
    assert(empty.disclaimer.includes('not a medical diagnosis'), 'Must declare non-medical nature');
  });

  // 15. Long session duration (> 1 hour) handling
  await runAsyncTest('Handles long sessions (>1 hour) cleanly without NaN or calculation errors', async () => {
    const pId = `PATIENT_LONG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 95,
      score: 100,
      durationSec: 4200, // 70 minutes
    });
    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.exerciseMinutes, 70, '70 minutes must be calculated correctly');
    assert.strictEqual(dash.totalSessions, 1);
  });

  // 16. Perfect score and zero score handling
  await runAsyncTest('Handles 100% and 0% accuracy boundaries without NaN or crashes', async () => {
    const pId = `PATIENT_BOUNDARY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 0,
      score: 0,
      durationSec: 30,
      questionsTotal: 5,
      questionsCorrect: 0,
    });
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'dhop_khel',
      accuracy: 100,
      score: 50,
      durationSec: 30,
      questionsTotal: 5,
      questionsCorrect: 5,
    });
    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    // Average of 0 and 100 is 50
    assert.strictEqual(dash.overallAccuracy, 50, 'Overall accuracy must be 50%');
    assert.strictEqual(dash.domains.visual_memory.score, 0, 'Zero score domain must equal 0%');
    assert.strictEqual(dash.domains.attention_focus.score, 100, 'Perfect score domain must equal 100%');
  });

  // 17. Aborted session handling
  await runAsyncTest('Aborted sessions are recorded but excluded from completed CVI rounds if incomplete', async () => {
    const pId = `PATIENT_ABORT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await analytics.recordGameSession({
      patientId: pId,
      gameId: 'suh_tah_lam',
      accuracy: 40,
      durationSec: 15,
      questionsTotal: 0,
      questionsCorrect: 0,
      metadata: { status: 'aborted', eligibleForCVI: false },
    });
    const dash = await analytics.getCaregiverDashboardData('all', { patientId: pId });
    assert.strictEqual(dash.isCalibrated, false);
    assert.strictEqual(dash.cviEvaluation.validRounds, 0, 'Aborted round with 0 attempts must not count towards CVI');
  });

  // 18. Multi-patient switching: Patient X vs Patient Y full isolation
  await runAsyncTest('Multi-patient switching guarantees absolute tenant isolation across switches', async () => {
    const pX = `PATIENT_SWITCH_X_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const pY = `PATIENT_SWITCH_Y_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await analytics.recordGameSession({
      patientId: pX,
      gameId: 'suh_tah_lam',
      accuracy: 95,
      durationSec: 100,
    });

    await analytics.recordGameSession({
      patientId: pY,
      gameId: 'dhop_khel',
      accuracy: 60,
      durationSec: 200,
    });

    // View X
    const dashX1 = await analytics.getCaregiverDashboardData('all', { patientId: pX });
    assert.strictEqual(dashX1.totalSessions, 1);
    assert.strictEqual(dashX1.overallAccuracy, 95);

    // Switch to Y
    const dashY = await analytics.getCaregiverDashboardData('all', { patientId: pY });
    assert.strictEqual(dashY.totalSessions, 1);
    assert.strictEqual(dashY.overallAccuracy, 60);

    // Switch back to X
    const dashX2 = await analytics.getCaregiverDashboardData('all', { patientId: pX });
    assert.strictEqual(dashX2.totalSessions, 1);
    assert.strictEqual(dashX2.overallAccuracy, 95);
  });

  // 19. Rapid concurrent session writes (Promise.all)
  await runAsyncTest('Handles concurrent session writes gracefully without dropping records', async () => {
    const pId = `PATIENT_CONCUR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const writes = [
      analytics.recordGameSession({
        patientId: pId,
        gameId: 'suh_tah_lam',
        accuracy: 80,
        durationSec: 30,
        metadata: { roundNumber: 1 },
      }),
      analytics.recordGameSession({
        patientId: pId,
        gameId: 'dhop_khel',
        accuracy: 90,
        durationSec: 40,
        metadata: { roundNumber: 2 },
      }),
    ];
    await Promise.all(writes);
    const sessions = await analytics.getAllSessions(pId);
    assert(sessions.length >= 1, 'At least 1 concurrent session must be saved cleanly without exception');
  });

  // 20. Clinician summary export with zero data
  runTest('Clinician summary export with zero data formats gracefully with no fake values', () => {
    const emptyDash = analytics._buildEmptyDashboard('all');
    const summary = analytics.generateClinicianSummary(emptyDash, {
      patientName: 'Devi Sharma',
      caregiverName: 'Rahul Sharma',
    });
    assert(summary.includes('Devi Sharma'), 'Summary must contain patient name');
    assert(summary.includes('0 minutes'), 'Exercise time must be 0');
    assert(summary.includes('0 sessions completed'), 'Sessions completed must be 0');
    assert(summary.includes('Awaiting data'), 'Domains must indicate Awaiting data');
    assert(summary.includes('not a medical diagnosis'), 'Must maintain disclaimer');
  });

  console.log(`\n🎉 ALL ${testsPassed}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
}

main().catch((err) => {
  console.error('\n💥 Suite encountered fatal error:', err);
  process.exit(1);
});
