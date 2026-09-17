/**
 * test_demo_flow.mjs
 * Verification of the 5-step SIH 2026 presentation demo flow
 */

import { getAIResponse, sessionLearnedNames, clearSessionLearnedNames } from '../src/modules/aiData.js';
import { buildSystemInstruction } from '../src/services/GeminiService.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('\n--- STEP 1: WELCOME SCREEN & ROLE SELECTION ---');
const roleSelectFile = fs.readFileSync('src/noklai/screens/RoleSelectionScreen.js', 'utf8');
const launchFile = fs.readFileSync('src/noklai/screens/AppLaunchScreen.js', 'utf8');

assert(
  roleSelectFile.includes('A culturally familiar memory assistance platform for elderly people and their caregivers.'),
  'RoleSelectionScreen includes exact platform tagline'
);
assert(
  roleSelectFile.includes('I am a Patient') && roleSelectFile.includes('I am a Caregiver'),
  'RoleSelectionScreen has large "I am a Patient" and "I am a Caregiver" options'
);
assert(
  launchFile.includes('A culturally familiar memory assistance platform for elderly people and their caregivers.'),
  'AppLaunchScreen includes platform tagline'
);

console.log('\n--- STEP 2: PATIENT DEMO FLOW ---');
const patientHomeFile = fs.readFileSync('src/noklai/screens/patient/PatientHomeScreen.js', 'utf8');

assert(
  patientHomeFile.includes('Welcome back. What would you like to do today?'),
  'PatientHomeScreen has welcoming greeting: "Welcome back. What would you like to do today?"'
);
assert(
  patientHomeFile.includes('1. Play a Memory Game') &&
  patientHomeFile.includes('2. Continue Activity') &&
  patientHomeFile.includes('3. Talk to NOKLAI') &&
  patientHomeFile.includes('4. View My Progress'),
  'PatientHomeScreen features the 4 large elder-friendly action cards'
);
assert(
  patientHomeFile.includes('Take your time') && patientHomeFile.includes('Let’s try together'),
  'PatientHomeScreen features calm, supportive language'
);

console.log('\n--- STEP 3: PATIENT GAME EXPERIENCE ---');
const suhTahLamFile = fs.readFileSync('src/games/suhTahLam/SuhTahLamGame.js', 'utf8');
const dhopkhelFile = fs.readFileSync('src/games/DhopkhelGame.js', 'utf8');

assert(
  suhTahLamFile.includes('Take your time with zero rush') || suhTahLamFile.includes('Well done!'),
  'Suh Tah Lam game contains calm pacing and encouraging completion feedback'
);
assert(
  dhopkhelFile.includes('voiceWellDone') && dhopkhelFile.includes('voiceTryAgain'),
  'Dhopkhel game uses encouraging feedback without harsh failure language'
);

console.log('\n--- STEP 4: NOKLAI AI COMPANION ---');
clearSessionLearnedNames();

// 4a. In-session name learning
const introReply = getAIResponse('My name is Dhruv', { patientId: 'demo-patient-1' });
assert(
  introReply.toLowerCase().includes('dhruv') && introReply.toLowerCase().includes('noklai'),
  `Name learning intro acknowledges name: "${introReply}"`
);

// 4b. What is my name?
const nameQueryReply = getAIResponse('What is my name?', { patientId: 'demo-patient-1' });
assert(
  nameQueryReply.toLowerCase().includes('dhruv'),
  `AI recalls session learned name: "${nameQueryReply}"`
);

// 4c. Energy / Tiredness
const tiredReply = getAIResponse('I feel tired', { patientId: 'demo-patient-1' });
assert(
  tiredReply.toLowerCase().includes('rest') || tiredReply.toLowerCase().includes('ready'),
  `Tiredness response gives calm resting reassurance: "${tiredReply}"`
);

// 4d. What can I play?
const gameSuggestReply = getAIResponse('What can I play?', { patientId: 'demo-patient-1' });
assert(
  gameSuggestReply.includes('Dhopkhel') && gameSuggestReply.includes('Ubilakapki'),
  `Game suggestion offers native games: "${gameSuggestReply}"`
);

// 4e. Tell me a joke
const jokeReply = getAIResponse('Tell me a joke', { patientId: 'demo-patient-1' });
assert(
  jokeReply.length > 20 && (jokeReply.toLowerCase().includes('field') || jokeReply.toLowerCase().includes('smile')),
  `Joke response returns a clean wholesome joke: "${jokeReply}"`
);

// 4f. Safe non-medical responses
const medicalReply = getAIResponse('Do I have dementia? Diagnose me.', { patientId: 'demo-patient-1' });
assert(
  medicalReply.toLowerCase().includes('cannot diagnose') && (medicalReply.toLowerCase().includes('healthcare professional') || medicalReply.toLowerCase().includes('doctor')),
  `Medical boundary response protects clinical safety: "${medicalReply}"`
);

// 4g. Gemini System Instruction audit
const systemPrompt = buildSystemInstruction({
  patientName: 'Dhruv',
  caregiverName: 'Anita',
  role: 'patient',
});
assert(
  systemPrompt.includes('NEVER diagnose') && systemPrompt.includes('I feel tired') && systemPrompt.includes('What can I play?'),
  'Gemini system prompt embeds strict demo safety & response directives'
);

console.log('\n--- STEP 5: CAREGIVER DEMO FLOW ---');
const caregiverHomeFile = fs.readFileSync('src/noklai/screens/caregiver/CaregiverHomeScreen.js', 'utf8');

assert(
  caregiverHomeFile.includes('Cognitive Areas Practiced') &&
  caregiverHomeFile.includes('Memory') &&
  caregiverHomeFile.includes('Focus & Attention') &&
  caregiverHomeFile.includes('Reaction & Coordination'),
  'CaregiverHomeScreen includes the 3 cognitive areas in simple terms'
);

assert(
  caregiverHomeFile.includes('Encourage the patient to complete one short activity') &&
  caregiverHomeFile.includes('Use familiar family photos or stories') &&
  caregiverHomeFile.includes('Allow the patient to take breaks') &&
  caregiverHomeFile.includes('Celebrate effort instead of focusing only on scores'),
  'CaregiverHomeScreen includes all 4 supportive caregiver suggestions'
);

assert(
  caregiverHomeFile.includes('NOKLAI provides supportive cognitive activities and progress insights. It does not diagnose dementia or replace professional medical advice.'),
  'CaregiverHomeScreen features the exact non-medical disclaimer'
);

console.log(`\n========================================`);
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
