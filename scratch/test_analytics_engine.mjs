import assert from 'assert';

console.log('--- TESTING COGNITIVE ANALYTICS SERVICE & STATS ENGINE ---');

// Mock AsyncStorage for headless testing before importing service
const mockStorage = new Map();
globalThis.AsyncStorage = {
  getItem: async (key) => mockStorage.get(key) || null,
  setItem: async (key, val) => { mockStorage.set(key, val); return null; },
  removeItem: async (key) => { mockStorage.delete(key); return null; },
};

const { CognitiveAnalyticsService } = await import('../src/modules/performance/CognitiveAnalyticsService.js');
const service = new CognitiveAnalyticsService();

async function runTests() {
  console.log('1. Testing baseline dashboard data when no prior sessions exist...');
  const baselineData = await service.getCaregiverDashboardData('7d', {
    patientName: 'Maya Sharma',
    caregiverName: 'Priya Sharma',
    relationship: 'Daughter',
  });

  assert.strictEqual(baselineData.vitalityIndex, null, 'Vitality index must be null when no sessions exist');
  assert.strictEqual(baselineData.isCalibrated, false, 'Dashboard must indicate not calibrated yet');
  assert.strictEqual(baselineData.cviEvaluation?.status, 'insufficient_data', 'CVI status must be insufficient_data');
  assert(baselineData.domains.visual_memory, 'Must have visual_memory domain');
  assert(baselineData.domains.spatial_coordination, 'Must have spatial_coordination domain');
  assert(baselineData.domains.attention_focus, 'Must have attention_focus domain');
  assert(baselineData.domains.episodic_recall, 'Must have episodic_recall domain');
  assert(Array.isArray(baselineData.clinicalObservations), 'Clinical observations must be array');
  console.log(`✓ Verified baseline status: insufficient_data (${baselineData.cviEvaluation?.validRounds}/${baselineData.cviEvaluation?.requiredRounds} valid rounds), zero fake defaults.`);

  console.log('2. Recording dynamic gameplay sessions across games...');
  await service.recordGameSession({
    gameId: 'suh_tah_lam',
    gameName: 'Suh Tah Lam',
    domain: 'visual_memory',
    difficulty: 'medium',
    durationSec: 45,
    questionsTotal: 3,
    questionsCorrect: 3,
    accuracy: 100,
    responseTimeSec: 2.1,
    score: 30,
    patientId: 'P001',
  });

  await service.recordGameSession({
    gameId: 'ubilakapki',
    gameName: 'Ubilakapki Coconut Toss',
    domain: 'spatial_coordination',
    difficulty: 'easy',
    durationSec: 55,
    questionsTotal: 4,
    questionsCorrect: 3,
    accuracy: 75,
    responseTimeSec: 2.9,
    score: 30,
    patientId: 'P001',
  });

  await service.recordGameSession({
    gameId: 'dhop_khel',
    gameName: 'Dhopkhel Memory',
    domain: 'attention_focus',
    difficulty: 'medium',
    durationSec: 60,
    questionsTotal: 5,
    questionsCorrect: 4,
    accuracy: 80,
    responseTimeSec: 2.4,
    score: 40,
    patientId: 'P001',
  });

  await service.recordGameSession({
    gameId: 'northeast_memory',
    gameName: 'North East Scenic Memory',
    domain: 'episodic_recall',
    difficulty: 'easy',
    durationSec: 70,
    questionsTotal: 4,
    questionsCorrect: 4,
    accuracy: 100,
    responseTimeSec: 3.1,
    score: 40,
    patientId: 'P001',
  });

  console.log('3. Testing calculated caregiver dashboard data with recorded sessions...');
  const activeData = await service.getCaregiverDashboardData('7d', {
    patientName: 'Maya Sharma',
    caregiverName: 'Priya Sharma',
    relationship: 'Daughter',
  });

  assert(activeData.totalSessions >= 4, 'Must count all recorded sessions');
  assert(activeData.domains.visual_memory.score >= 80, 'Visual memory score calculated');
  assert(activeData.domains.spatial_coordination.score >= 70, 'Spatial tracking score calculated');
  assert(activeData.domains.attention_focus.score >= 75, 'Attention focus score calculated');
  assert(activeData.domains.episodic_recall.score >= 80, 'Episodic recall score calculated');
  assert(activeData.gameBreakdown.length >= 4, 'Must have at least 4 game breakdown cards');
  console.log(`✓ Active vitality index: ${activeData.vitalityIndex}/100, Growth: +${activeData.growthPercent}%`);

  console.log('4. Testing Clinician Summary Report generation...');
  const clinicianReport = service.generateClinicianSummary(activeData, {
    patientName: 'Maya Sharma',
    caregiverName: 'Priya Sharma',
    relationship: 'Daughter',
  });

  assert(typeof clinicianReport === 'string', 'Report must be formatted string');
  assert(clinicianReport.includes('Maya Sharma'), 'Report must include patient name');
  assert(clinicianReport.includes('Priya Sharma (Daughter)'), 'Report must include caregiver name');
  assert(clinicianReport.includes('COGNITIVE DOMAIN BREAKDOWN'), 'Report must include domain breakdown');
  assert(clinicianReport.includes('CAREGIVER OBSERVATIONS'), 'Report must include caregiver observations');
  console.log('✓ Clinician Summary Report generated successfully:');
  console.log('----------------------------------------------------');
  console.log(clinicianReport.substring(0, 350) + '...\n----------------------------------------------------');

  console.log('🎉 ALL COGNITIVE ANALYTICS SERVICE TESTS PASSED 100%!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
