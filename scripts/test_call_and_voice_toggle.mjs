import assert from 'assert';
import {
  isEmergencyDistressQuery,
  getAIResponseDetails,
  getAIResponseAsync,
} from '../src/modules/aiData.js';

console.log('--- Testing One-Tap Caregiver Call & Emergency Detection ---');

// 1. Distress query detection in all 4 languages
const emergencyQueries = [
  'call my caregiver',
  'call caregiver',
  'call doctor',
  'call for help',
  'I need help',
  'help me please',
  'emergency',
  'sos',
  'केयरगिवर को फोन',
  'मदद चाहिए',
  'मुझे मदद करो',
  'কেয়াৰগিভাৰক ফোন',
  'মোক সহায় কৰক',
  'কেয়ারগিভারকে ফোন',
  'আমার সাহায্য দরকার',
  'সাহায্য করুন',
];

for (const q of emergencyQueries) {
  const isEmergency = isEmergencyDistressQuery(q);
  assert.strictEqual(isEmergency, true, `Expected "${q}" to be detected as emergency distress`);
}
console.log(`✅ All ${emergencyQueries.length} emergency queries recognized accurately across 4 languages.`);

// 2. Non-emergency queries should NOT trigger emergency call
const nonEmergencyQueries = [
  'What day is it today?',
  'What can I play?',
  'Tell me a joke',
  'What is my name?',
  'When is lunch?',
  'Where am I?',
];

for (const q of nonEmergencyQueries) {
  const isEmergency = isEmergencyDistressQuery(q);
  assert.strictEqual(isEmergency, false, `Expected "${q}" to NOT be emergency distress`);
}
console.log(`✅ All ${nonEmergencyQueries.length} regular queries correctly NOT flagged as emergency.`);

// 3. Test emergency response WITH phone number configured
const ctxWithPhone = {
  patientId: 'P001',
  patientName: 'Chandni Devi',
  caregiverName: 'Rahul Sharma',
  caregiverPhone: '+91 98765 43210',
  language: 'en',
};

const resWithPhone = getAIResponseDetails('call my caregiver', ctxWithPhone);
assert.strictEqual(resWithPhone.isEmergencyCall, true);
assert.strictEqual(resWithPhone.hasCaregiverPhone, true);
assert.strictEqual(resWithPhone.caregiverPhone, '+91 98765 43210');
assert.strictEqual(resWithPhone.caregiverName, 'Rahul Sharma');
assert.ok(resWithPhone.text.includes('Rahul Sharma'));
console.log('✅ Emergency response with phone number configured matches specifications.');

// 4. Test emergency response WITHOUT phone number configured
const ctxWithoutPhone = {
  patientId: 'P001',
  patientName: 'Chandni Devi',
  caregiverName: 'Rahul Sharma',
  caregiverPhone: '',
  language: 'en',
};

const resWithoutPhone = getAIResponseDetails('call my caregiver', ctxWithoutPhone);
assert.strictEqual(resWithoutPhone.isEmergencyCall, true);
assert.strictEqual(resWithoutPhone.hasCaregiverPhone, false);
assert.strictEqual(resWithoutPhone.caregiverPhone, '');
assert.ok(
  resWithoutPhone.text.includes('Settings') || resWithoutPhone.text.includes('phone number'),
  'Should prompt to add phone number in Settings'
);
console.log('✅ Emergency response without phone number configured provides helpful guidance without failing.');

// 5. Test getAIResponseAsync emergency path
const asyncRes = await getAIResponseAsync('call my caregiver', ctxWithPhone);
assert.strictEqual(asyncRes.isEmergencyCall, true);
assert.strictEqual(asyncRes.caregiverPhone, '+91 98765 43210');
assert.strictEqual(asyncRes.caregiverName, 'Rahul Sharma');
console.log('✅ getAIResponseAsync returns emergency call payload directly (0ms local bypass).');

// 6. Test Hindi emergency response
const ctxHindi = {
  patientId: 'P001',
  patientName: 'चाँदनी',
  caregiverName: 'राहुल',
  caregiverPhone: '+91 98765 43210',
  language: 'hi',
};
const resHindi = getAIResponseDetails('मदद चाहिए', ctxHindi);
assert.strictEqual(resHindi.isEmergencyCall, true);
assert.ok(resHindi.text.includes('राहुल'));
console.log('✅ Hindi emergency response localized properly.');

// 7. Test Assamese emergency response
const ctxAssamese = {
  patientId: 'P001',
  patientName: 'চান্দনী',
  caregiverName: 'ৰাহুল',
  caregiverPhone: '+91 98765 43210',
  language: 'as',
};
const resAssamese = getAIResponseDetails('মোক সহায় কৰক', ctxAssamese);
assert.strictEqual(resAssamese.isEmergencyCall, true);
assert.ok(resAssamese.text.includes('ৰাহুল'));
console.log('✅ Assamese emergency response localized properly with Assamese letters.');

// 8. Test Bengali emergency response
const ctxBengali = {
  patientId: 'P001',
  patientName: 'চাঁদনী',
  caregiverName: 'রাহুল',
  caregiverPhone: '+91 98765 43210',
  language: 'bn',
};
const resBengali = getAIResponseDetails('সাহায্য করুন', ctxBengali);
assert.strictEqual(resBengali.isEmergencyCall, true);
assert.ok(resBengali.text.includes('রাহুল'));
console.log('✅ Bengali emergency response localized properly with Bengali letters.');

console.log('\n--- ALL ONE-TAP CALL & EMERGENCY TESTS PASSED ---');
