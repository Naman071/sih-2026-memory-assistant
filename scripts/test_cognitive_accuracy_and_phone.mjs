import assert from 'assert';
import {
  normalizeIndianPhone,
  isValidIndianMobile,
  formatIndianPhone,
  validateLoginRequirements,
} from '../src/utils/phoneValidation.js';
import {
  CognitiveAnalyticsService,
  COGNITIVE_DOMAINS,
} from '../src/modules/performance/CognitiveAnalyticsService.js';

console.log('🧪 RUNNING COGNITIVE ACCURACY & PHONE VALIDATION SUITE\n');

// 1. Phone number validation tests
console.log('--- 1. PHONE VALIDATION TESTS ---');

// 1.1 Normalization of valid Indian numbers
assert.strictEqual(normalizeIndianPhone('9876543210'), '9876543210');
assert.strictEqual(normalizeIndianPhone('+91 98765 43210'), '9876543210');
assert.strictEqual(normalizeIndianPhone('09876543210'), '9876543210');
assert.strictEqual(normalizeIndianPhone('91-98765-43210'), '9876543210');
assert.strictEqual(normalizeIndianPhone('  +91 81234 56789  '), '8123456789');
console.log('  ✅ Phone normalization handles +91, 0, whitespace, and hyphens');

// 1.2 Invalid numbers rejection
assert.strictEqual(normalizeIndianPhone('1234567890'), null, 'Number starting with 1 must be invalid in India');
assert.strictEqual(normalizeIndianPhone('5555555555'), null, 'Number starting with 5 must be invalid in India');
assert.strictEqual(normalizeIndianPhone('98765'), null, 'Short numbers must be invalid');
assert.strictEqual(normalizeIndianPhone('987654321000'), null, 'Too long numbers must be invalid');
assert.strictEqual(normalizeIndianPhone('abcdefghij'), null, 'Alpha strings must be invalid');
console.log('  ✅ Invalid numbers (non-Indian, wrong length, letters) correctly rejected');

// 1.3 Format display
assert.strictEqual(formatIndianPhone('9876543210'), '+91 98765 43210');
console.log('  ✅ Phone formatting produces clean +91 XXXXX XXXXX');

// 1.4 validateLoginRequirements
// Missing caregiver name
const resNoCg = validateLoginRequirements({ caregiverName: '', patientName: 'Aaji', caregiverPhone: '9876543210' });
assert.strictEqual(resNoCg.isValid, false);
assert.strictEqual(resNoCg.errorField, 'caregiverName');

// Missing patient name
const resNoPt = validateLoginRequirements({ caregiverName: 'Sara', patientName: '', caregiverPhone: '9876543210' });
assert.strictEqual(resNoPt.isValid, false);
assert.strictEqual(resNoPt.errorField, 'patientName');

// Neither phone provided
const resNoPhones = validateLoginRequirements({ caregiverName: 'Sara', patientName: 'Aaji', caregiverPhone: '', patientPhone: '' });
assert.strictEqual(resNoPhones.isValid, false);
assert.strictEqual(resNoPhones.errorField, 'phoneRequired');

// Both phones identical
const resSamePhones = validateLoginRequirements({ caregiverName: 'Sara', patientName: 'Aaji', caregiverPhone: '9876543210', patientPhone: '+91 98765 43210' });
assert.strictEqual(resSamePhones.isValid, false);
assert.strictEqual(resSamePhones.errorField, 'bothPhones');

// Only caregiver phone provided
const resCgOnly = validateLoginRequirements({ caregiverName: 'Sara', patientName: 'Aaji', caregiverPhone: '9876543210', patientPhone: '' });
assert.strictEqual(resCgOnly.isValid, true);
assert.strictEqual(resCgOnly.normalizedCaregiverPhone, '9876543210');
assert.strictEqual(resCgOnly.normalizedPatientPhone, '');

// Only patient phone provided
const resPtOnly = validateLoginRequirements({ caregiverName: 'Sara', patientName: 'Aaji', caregiverPhone: '', patientPhone: '9876543211' });
assert.strictEqual(resPtOnly.isValid, true);
assert.strictEqual(resPtOnly.normalizedCaregiverPhone, '');
assert.strictEqual(resPtOnly.normalizedPatientPhone, '9876543211');

// Both valid distinct phones provided
const resBoth = validateLoginRequirements({ caregiverName: 'Sara', patientName: 'Aaji', caregiverPhone: '+91 98765 43210', patientPhone: '9876543211' });
assert.strictEqual(resBoth.isValid, true);
assert.strictEqual(resBoth.normalizedCaregiverPhone, '9876543210');
assert.strictEqual(resBoth.normalizedPatientPhone, '9876543211');
console.log('  ✅ validateLoginRequirements enforces all rules with 100% precision');

// 2. Cognitive Analytics Precision & Domain Resolution
console.log('\n--- 2. COGNITIVE ANALYTICS PRECISION & DOMAINS ---');

const memoryStore = new Map();
const customStorage = {
  getItem: async (k) => memoryStore.get(k) || null,
  setItem: async (k, v) => memoryStore.set(k, v),
  removeItem: async (k) => memoryStore.delete(k),
};

const service = new CognitiveAnalyticsService(customStorage);

// Test domain resolution for canonical and alias game IDs
assert.strictEqual(service._resolveDomain('suh_tah_lam'), 'visual_memory');
assert.strictEqual(service._resolveDomain('suhTahLam'), 'visual_memory');
assert.strictEqual(service._resolveDomain('ubilakapki'), 'spatial_coordination');
assert.strictEqual(service._resolveDomain('dhop_khel'), 'attention_focus');
assert.strictEqual(service._resolveDomain('dhopkhel'), 'attention_focus');
assert.strictEqual(service._resolveDomain('northeast_memory'), 'episodic_recall');
assert.strictEqual(service._resolveDomain('northeast'), 'episodic_recall');
assert.strictEqual(service._resolveDomain('memory_stories'), 'episodic_recall');
assert.strictEqual(service._resolveDomain('stories'), 'episodic_recall');
console.log('  ✅ Domain resolution accurately handles all 5 games and their aliases');

// Test human game names
assert.strictEqual(service._getHumanGameName('suhTahLam'), 'Suh Tah Lam (Bamboo Rhythm)');
assert.strictEqual(service._getHumanGameName('dhopkhel'), 'Dhopkhel Memory');
assert.strictEqual(service._getHumanGameName('stories'), 'Xuworoni Kotha');
console.log('  ✅ Human game names mapped cleanly for aliases');

// Test CVI round conversion precision: 73% accuracy must not become binary 0 or 1
// Unique patient per run keeps the suite idempotent: the service syncs sessions to
// live Supabase, so a fixed patient id across runs would pollute remote data.
const testPatient = `PATIENT_PRECISION_${Date.now()}`;

// Record 3 sessions without questionsTotal but with specific accuracy percentages
await service.recordGameSession({
  patientId: testPatient,
  gameId: 'suh_tah_lam',
  accuracy: 75,
  durationSec: 60,
});
await service.recordGameSession({
  patientId: testPatient,
  gameId: 'dhop_khel',
  accuracy: 80,
  durationSec: 60,
});
await service.recordGameSession({
  patientId: testPatient,
  gameId: 'ubilakapki',
  accuracy: 85,
  durationSec: 60,
});

const dashboard = await service.getCaregiverDashboardData('all', { patientId: testPatient });
assert.strictEqual(dashboard.isCalibrated, true, '3 rounds should calibrate CVI');
assert.ok(dashboard.vitalityIndex > 0, 'CVI should have computed a positive index');
// Verify domain scores are non-null for played domains
assert.strictEqual(dashboard.domains.visual_memory.score, 75);
assert.strictEqual(dashboard.domains.attention_focus.score, 80);
assert.strictEqual(dashboard.domains.spatial_coordination.score, 85);
assert.strictEqual(dashboard.domains.episodic_recall.score, null, 'Unplayed episodic recall domain must remain null');
console.log('  ✅ Continuous precision preserved across rounds, CVI calculation, and domain breakdown');

console.log('\n🎉 ALL TESTS IN SUITE PASSED PERFECTLY!\n');

