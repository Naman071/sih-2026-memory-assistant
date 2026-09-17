/**
 * GeminiService.js — Official Google Gemini API Client
 * SIH 2026 Memory Assistant
 *
 * Provides real-time conversational AI integration for Noklai AI Assistant.
 * Supports multi-turn conversation memory, dynamic patient-caregiver context,
 * cultural heritage awareness (North East India), multi-lingual understanding,
 * and clinical dementia safety guardrails.
 */

// Discover Gemini API key from environment
const getApiKey = () => {
  return (
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();
};

/**
 * Build structured system instructions embedding authorized context and safety rules
 */
export const buildSystemInstruction = (context = {}) => {
  const patientName = context.patientName || 'Loved One';
  const caregiverName = context.caregiverName || 'Caregiver';
  const isCaregiver = context.role === 'caregiver';
  const language = context.language || 'en';

  // Format daily schedule / reminders safely
  let remindersSummary = 'None scheduled yet.';
  if (Array.isArray(context.reminders) && context.reminders.length > 0) {
    remindersSummary = context.reminders
      .map((r, i) => `${i + 1}. ${r.title || 'Task'} at ${r.time || 'unscheduled'} (${r.done ? 'Done' : 'Pending'})`)
      .join('\n');
  }

  // Format cognitive performance / CVI safely
  let performanceSummary = 'No recent sessions recorded.';
  if (context.analyticsData) {
    const a = context.analyticsData;
    const cvi = a.vitalityIndex !== null && a.vitalityIndex !== undefined ? `${a.vitalityIndex}/100` : 'Not assessed';
    const games = a.totalSessions || 0;
    const acc = a.overallAccuracy ? `${a.overallAccuracy}%` : 'N/A';
    performanceSummary = `Games Played: ${games}, Overall Accuracy: ${acc}, Cognitive Vitality Index (CVI): ${cvi}.`;
  }

  const roleInstruction = isCaregiver
    ? `You are currently speaking with the CAREGIVER (${caregiverName}), who is supporting the elderly patient (${patientName}).
Provide insightful, compassionate guidance on dementia care, daily schedule management, cognitive stimulation through games, and stress management.
Highlight upcoming medication or routine tasks when requested.`
    : `You are currently speaking directly with the ELDERLY PATIENT (${patientName}).
Speak with extreme gentleness, warmth, patience, and respect. Keep your sentences simple, comforting, and clear.
Never make them feel embarrassed if they repeat themselves or forget. Remind them gently of their family, routine, or favorite memories.`;

  return `You are Noklai, a culturally grounded, warm, empathetic AI Memory Assistant designed for elderly individuals and family caregivers in North East India (Assam, Meghalaya, Manipur, Nagaland, Mizoram, Tripura, Arunachal Pradesh, Sikkim).

${roleInstruction}

AUTHORIZED CONTEXT:
- Patient Name: ${patientName}
- Caregiver Name: ${caregiverName}
- Today's Routine & Medication Schedule:
${remindersSummary}
- Cognitive Health & Games Summary:
${performanceSummary}

CULTURAL GROUNDEDNESS & FAMILIARITY:
- Familiar with North East Indian culture, folklore, landscapes (Brahmaputra, tea gardens, hills), traditions, and festivals (Bihu, etc.).
- Familiar with traditional memory games available in the app:
  * "Suh Tah Lam" (Bamboo Balance game — focuses on spatial tracking and executive rhythm)
  * "Ubilakapki" (Animal Recall game — focuses on sequential memory)
  * "Dhopkhel" (Traditional indigenous tag game — focuses on reaction time)
  * "North East Scenic Memory" (Visual place-recognition of cultural landmarks)

LANGUAGE HANDLING:
- Detect the user's language and respond naturally in the same language or dialect:
  * Hindi (Devanagari or Romanized Hinglish)
  * English
  * Assamese (অসমীয়া)
  * Bengali (বাংলা)
- Match the emotional tone: reassuring, affirmative, and dignified.

CRITICAL CLINICAL & MEDICAL SAFETY GUARDRAILS:
1. NEVER diagnose dementia, Alzheimer's, or any medical condition.
2. If asked medical or diagnostic questions, respond safely: "I can provide general support, but I cannot diagnose medical conditions. Please contact a healthcare professional or your caregiver for medical advice."
3. NEVER prescribe, modify, or recommend specific medical dosages.
4. If the user reports severe physical pain, confusion, chest distress, or danger, urgently and gently advise alerting their primary caregiver (${caregiverName}) or calling a doctor.
5. If the user introduces themselves (e.g. "My name is Dhruv" or "Mera naam Dhruv hai"), warmly acknowledge: "Nice to meet you, [Name]. I'm NOKLAI. I'm here to help you with memory activities." and remember their name.
6. If asked "What is my name?", reply directly: "Your name is [Name]."
7. If the user says "I feel tired", respond warmly: "That's okay. You can take a rest. We can try a small activity whenever you feel ready."
8. If the user asks "What can I play?", suggest: "You can try Dhopkhel, Ubilakapki, or a Memory Story. Would you like to start one?"
9. If asked for a joke ("Tell me a joke"), share a clean, gentle, lighthearted joke.
10. Keep responses comfortably concise (1-3 sentences or short paragraphs) so elderly eyes are not overwhelmed.`;
};

/**
 * Formats a chat history array into Gemini's expected contents structure:
 * [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
 */
export const formatChatHistory = (history = [], latestMessage = '') => {
  const contents = [];

  // Filter and map prior messages
  if (Array.isArray(history)) {
    // Only take the last 16 turns to avoid exceeding context window while preserving memory
    const recentTurns = history.slice(-16);
    for (const msg of recentTurns) {
      if (!msg || !msg.text) continue;
      const role = msg.sender === 'user' ? 'user' : 'model';
      // Gemini requires non-empty text
      const cleanText = String(msg.text).trim();
      if (cleanText) {
        contents.push({
          role,
          parts: [{ text: cleanText }],
        });
      }
    }
  }

  // Ensure the latest message is added as the final 'user' turn
  if (latestMessage && latestMessage.trim()) {
    // If the last item is already identical user message, avoid duplicate
    const lastItem = contents[contents.length - 1];
    if (!lastItem || lastItem.role !== 'user' || lastItem.parts[0]?.text !== latestMessage.trim()) {
      contents.push({
        role: 'user',
        parts: [{ text: latestMessage.trim() }],
      });
    }
  }

  return contents;
};

/**
 * Check whether a valid Gemini API key is configured
 */
export const isGeminiConfigured = () => {
  const key = getApiKey();
  return typeof key === 'string' && key.length > 10;
};

/**
 * Execute real conversational chat request to Gemini REST API
 *
 * @param {Object} params
 * @param {string} params.message - The latest user message
 * @param {Array} params.history - Array of previous messages [{ sender: 'user'|'ai', text: string }]
 * @param {Object} params.context - Authorized patient and caregiver context object
 * @param {string} [params.model='gemini-2.0-flash'] - Target model name
 * @returns {Promise<{ success: boolean, text?: string, error?: string, message?: string }>}
 */
export const sendGeminiChatMessage = async ({
  message,
  history = [],
  context = {},
  model = 'gemini-2.0-flash',
}) => {
  const cleanMessage = (message || '').trim();
  if (!cleanMessage) {
    return {
      success: false,
      error: 'EMPTY_MESSAGE',
      message: 'Please provide a non-empty message.',
    };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message:
        'Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file to enable live AI responses.',
    };
  }

  // Build system instruction & multi-turn history
  const systemInstructionText = buildSystemInstruction(context);
  const contents = formatChatHistory(history, cleanMessage);

  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });
  }

  const requestBody = {
    contents,
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  };

  // Helper to fetch with timeout
  const fetchWithTimeout = async (targetModel) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let response = await fetchWithTimeout(model);

    // If primary model returns 404 (e.g. 2.0-flash not available in some regions), fallback to 1.5-flash
    if (response.status === 404 && model !== 'gemini-1.5-flash') {
      console.warn(`Gemini model ${model} returned 404. Retrying with gemini-1.5-flash...`);
      response = await fetchWithTimeout('gemini-1.5-flash');
    }

    // Handle HTTP errors
    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = {};
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}

      const errorMsg = parsedErr.error?.message || errText || `HTTP ${response.status}`;

      if (response.status === 429) {
        return {
          success: false,
          error: 'RATE_LIMIT',
          message: 'Noklai AI is receiving many requests right now. Please wait a moment and try again.',
        };
      }

      if (response.status === 400 || response.status === 403) {
        return {
          success: false,
          error: 'AUTH_ERROR',
          message: 'Gemini API authentication issue. Please verify that your API key is valid and has Generative AI permissions.',
        };
      }

      return {
        success: false,
        error: `API_ERROR_${response.status}`,
        message: `Noklai encountered a service error (${response.status}). Please try again.`,
        details: errorMsg,
      };
    }

    const data = await response.json();

    // Check safety blocks
    if (data.promptFeedback?.blockReason) {
      return {
        success: false,
        error: 'SAFETY_BLOCKED',
        message: 'This topic cannot be discussed. Please reach out to your doctor or family caregiver for assistance.',
      };
    }

    const candidate = data.candidates?.[0];
    const replyText = candidate?.content?.parts?.[0]?.text;

    if (!replyText || !replyText.trim()) {
      return {
        success: false,
        error: 'EMPTY_RESPONSE',
        message: 'Noklai was unable to formulate a response. Please rephrase your question.',
      };
    }

    return {
      success: true,
      text: replyText.trim(),
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'TIMEOUT',
        message: 'The request timed out. Please check your internet connection and try again.',
      };
    }

    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect to Noklai AI. Please ensure your device is connected to the internet.',
      details: err.message || String(err),
    };
  }
};

export default {
  buildSystemInstruction,
  formatChatHistory,
  isGeminiConfigured,
  sendGeminiChatMessage,
};

