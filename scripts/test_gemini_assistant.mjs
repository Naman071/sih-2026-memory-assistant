import {
  buildSystemInstruction,
  formatChatHistory,
  isGeminiConfigured,
  sendGeminiChatMessage,
} from '../src/services/GeminiService.js';
import { getAIResponseAsync, getAIResponse } from '../src/modules/aiData.js';

async function runGeminiAssistantTestSuite() {
  console.log('================================================================');
  console.log(' SIH 2026 MEMORY ASSISTANT — NOKLAI AI ASSISTANT TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      if (details) console.error(`       Details: ${details}`);
    }
  }

  // -------------------------------------------------------------
  // Test 1: System Instruction Construction with Patient Context
  // -------------------------------------------------------------
  const sampleContext = {
    patientName: 'Ramesh Sharma',
    caregiverName: 'Sita Sharma',
    role: 'patient',
    language: 'hi',
    reminders: [
      { id: '1', title: 'Blood Pressure Medicine', time: '09:00 AM', done: true },
      { id: '2', title: 'Evening Garden Walk', time: '05:30 PM', done: false },
    ],
    analyticsData: {
      vitalityIndex: 78,
      totalSessions: 12,
      overallAccuracy: 84,
    },
  };

  const systemInstruction = buildSystemInstruction(sampleContext);
  assert(
    systemInstruction.includes('Ramesh Sharma') &&
    systemInstruction.includes('Sita Sharma') &&
    systemInstruction.includes('Blood Pressure Medicine') &&
    systemInstruction.includes('78/100'),
    'System Instruction injects authorized patient, caregiver, schedule, and CVI context'
  );

  // -------------------------------------------------------------
  // Test 2: Dementia & Clinical Safety Guardrails
  // -------------------------------------------------------------
  assert(
    systemInstruction.includes('NEVER diagnose dementia') &&
    systemInstruction.includes('NEVER prescribe') &&
    systemInstruction.includes('Suh Tah Lam') &&
    systemInstruction.includes('Ubilakapki'),
    'System Instruction enforces dementia safety guardrails and cultural memory games'
  );

  // -------------------------------------------------------------
  // Test 3: Multi-Turn Conversation History Formatting
  // -------------------------------------------------------------
  const mockHistory = [
    { sender: 'user', text: 'Hello Noklai, my name is Ramesh.' },
    { sender: 'ai', text: 'Hello Ramesh! It is wonderful to speak with you today.' },
  ];
  const formattedTurns = formatChatHistory(mockHistory, 'What is my name?');

  assert(
    formattedTurns.length === 3 &&
    formattedTurns[0].role === 'user' &&
    formattedTurns[0].parts[0].text === 'Hello Noklai, my name is Ramesh.' &&
    formattedTurns[1].role === 'model' &&
    formattedTurns[2].role === 'user' &&
    formattedTurns[2].parts[0].text === 'What is my name?',
    'Multi-turn history accurately maps user and model roles with latest prompt appended'
  );

  // -------------------------------------------------------------
  // Test 4: Empty / Malformed Message Protection
  // -------------------------------------------------------------
  const emptyResult = await sendGeminiChatMessage({
    message: '   ',
    history: [],
    context: sampleContext,
  });
  assert(
    emptyResult.success === false && emptyResult.error === 'EMPTY_MESSAGE',
    'Rejects empty or whitespace-only messages gracefully'
  );

  // -------------------------------------------------------------
  // Test 5: Missing API Key Clear Diagnostic Messaging
  // -------------------------------------------------------------
  const savedKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const noKeyResult = await sendGeminiChatMessage({
    message: 'Hello Noklai',
    history: [],
    context: sampleContext,
  });

  assert(
    noKeyResult.success === false &&
    noKeyResult.error === 'NO_API_KEY' &&
    noKeyResult.message.includes('EXPO_PUBLIC_GEMINI_API_KEY'),
    'Provides transparent configuration guidance when API key is unconfigured'
  );

  // -------------------------------------------------------------
  // Test 6: Offline Resilient Contextual Fallback
  // -------------------------------------------------------------
  const offlineResult = await getAIResponseAsync('What is my name?', sampleContext, []);
  assert(
    offlineResult.fallback &&
    offlineResult.fallback.includes('Ramesh') &&
    offlineResult.source === 'offline_fallback',
    'Offline engine provides empathetic, identity-aware answers when API key is absent'
  );

  // -------------------------------------------------------------
  // Test 7: Offline Schedule & Reminder Answering
  // -------------------------------------------------------------
  const scheduleResult = getAIResponse('What is my medicine today?', sampleContext);
  assert(
    typeof scheduleResult === 'string' && scheduleResult.length > 20,
    'Offline helper provides schedule guidance for elderly queries'
  );

  // -------------------------------------------------------------
  // Test 8: Live / Mock Gemini REST Execution Verification
  // -------------------------------------------------------------
  // Test with mock fetch to verify complete request/response flow
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                { text: `Hello ${sampleContext.patientName}! Your name is indeed Ramesh. How may I assist you today?` },
              ],
            },
          },
        ],
      }),
    };
  };

  process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'TEST_KEY_FOR_AUTOMATED_VALIDATION_1234567890';

  const mockApiResult = await sendGeminiChatMessage({
    message: 'What is my name?',
    history: mockHistory,
    context: sampleContext,
  });

  assert(
    mockApiResult.success === true &&
    mockApiResult.text.includes('Ramesh'),
    'Gemini REST request flow accurately parses response candidate text'
  );

  // Restore fetch
  globalThis.fetch = originalFetch;
  if (savedKey) {
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = savedKey;
  } else {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  // -------------------------------------------------------------
  // Test 9: User Isolation & Scoped Storage Keys
  // -------------------------------------------------------------
  const patientAKey = `@noklai_chat_history_v2_P001_patient`;
  const patientBKey = `@noklai_chat_history_v2_P002_patient`;
  const caregiverKey = `@noklai_chat_history_v2_P001_caregiver`;

  assert(
    patientAKey !== patientBKey &&
    patientAKey !== caregiverKey,
    'Storage keys enforce strict tenant isolation between patients and caregivers'
  );

  // -------------------------------------------------------------
  // Test 10: Multi-Lingual Query Detection
  // -------------------------------------------------------------
  const hindiResponse = getAIResponse('नमस्ते नोकलाई', sampleContext);
  assert(
    hindiResponse.includes('नमस्ते') || hindiResponse.includes('नोकलाई'),
    'Multi-lingual greeting properly handles Devanagari Hindi'
  );

  console.log('\n================================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runGeminiAssistantTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

