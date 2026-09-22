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
      const cleanText = String(msg.text).trim().slice(0, 4000);
      if (cleanText) {
        contents.push({
          role,
          parts: [{ text: cleanText }],
        });
      }
    }
  }

  // Ensure the latest message is added as the final 'user' turn
  const cleanLatestMessage = typeof latestMessage === 'string' ? latestMessage.trim() : '';
  if (cleanLatestMessage) {
    // If the last item is already identical user message, avoid duplicate
    const lastItem = contents[contents.length - 1];
    if (!lastItem || lastItem.role !== 'user' || lastItem.parts[0]?.text !== cleanLatestMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: cleanLatestMessage }],
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
  signal,
} = {}) => {
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  if (!cleanMessage || cleanMessage.length > 4000) {
    return {
      success: false,
      error: cleanMessage ? 'MESSAGE_TOO_LONG' : 'EMPTY_MESSAGE',
      message: cleanMessage
        ? 'Please keep your message under 4,000 characters.'
        : 'Please provide a non-empty message.',
    };
  }

  if (!Array.isArray(history) || !context || typeof context !== 'object' || Array.isArray(context)) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Please provide a valid conversation request.',
    };
  }

  const targetModel = typeof model === 'string' && /^[a-zA-Z0-9._-]{1,100}$/.test(model)
    ? model
    : 'gemini-2.0-flash';
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
  const systemInstructionText = buildSystemInstruction(context || {});
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

  return runGeminiRequest(requestBody, signal, targetModel);
};

/**
 * Send a recorded voice clip straight to Gemini. Gemini transcribes the
 * audio AND generates the reply in a single call, so no separate
 * speech-to-text step is needed.
 */
export const sendGeminiAudioMessage = async ({
  audioBase64,
  mimeType = 'audio/m4a',
  history = [],
  context = {},
  model = 'gemini-2.0-flash',
  signal,
} = {}) => {
  if (typeof audioBase64 !== 'string' || audioBase64.length < 10) {
    return {
      success: false,
      error: 'EMPTY_AUDIO',
      message: 'No audio was recorded. Please try again.',
    };
  }

  if (!Array.isArray(history) || !context || typeof context !== 'object' || Array.isArray(context)) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Please provide a valid conversation request.',
    };
  }

  const targetModel = typeof model === 'string' && /^[a-zA-Z0-9._-]{1,100}$/.test(model)
    ? model
    : 'gemini-2.0-flash';
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message:
        'Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file to enable live AI responses.',
    };
  }

  const systemInstructionText = buildSystemInstruction(context || {});
  // Reuse formatChatHistory for prior turns only (empty latestMessage means
  // it won't add a text turn) — the audio clip becomes the final user turn.
  const contents = formatChatHistory(history, '');
  contents.push({
    role: 'user',
    parts: [
      { text: 'The user sent this as a voice message. Listen to it and reply naturally, as if they had typed it.' },
      { inline_data: { mime_type: mimeType, data: audioBase64 } },
    ],
  });

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

  return runGeminiRequest(requestBody, signal, targetModel);
};

/**
 * Shared executor: sends a fully-built requestBody to Gemini with
 * timeout, retry, and model-fallback handling. Used by both the text
 * and audio send functions above so they share identical error handling.
 */
const runGeminiRequest = async (requestBody, signal, targetModel) => {
  const apiKey = getApiKey();
  const maxAttempts = 3;
  const timeoutMs = 18000;
  const retryDelay = (attempt) => Math.min(400 * (2 ** attempt), 1500);
  const isTransientStatus = (status) => status === 429 || status >= 500;
  const wait = (ms) => new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener?.('abort', onAbort);
      reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    };
    if (signal?.addEventListener) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });

  const fetchWithTimeout = async (targetModel) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller?.abort();
    }, timeoutMs);
    const abortListener = () => controller?.abort();
    signal?.addEventListener?.('abort', abortListener, { once: true });
    try {
      return await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        ...(controller ? { signal: controller.signal } : {}),
      });
    } catch (error) {
      error.isTimeout = timedOut;
      throw error;
    } finally {
      clearTimeout(timeoutId);
      signal?.removeEventListener?.('abort', abortListener);
    }
  };

  const modelCandidates = [targetModel];
  if (targetModel !== 'gemini-1.5-flash') modelCandidates.push('gemini-1.5-flash');

  try {
    for (let modelIndex = 0; modelIndex < modelCandidates.length; modelIndex += 1) {
      const currentModel = modelCandidates[modelIndex];
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (signal?.aborted) {
          return { success: false, error: 'CANCELLED', message: 'The request was cancelled.' };
        }
        let response;
        try {
          response = await fetchWithTimeout(currentModel);
        } catch (error) {
          const timedOut = error?.isTimeout || error?.name === 'AbortError';
          if (signal?.aborted && !timedOut) {
            return { success: false, error: 'CANCELLED', message: 'The request was cancelled.' };
          }
          if (attempt + 1 < maxAttempts) {
            await wait(retryDelay(attempt));
            continue;
          }
          return {
            success: false,
            error: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
            message: timedOut
              ? 'The request timed out. Please try again.'
              : 'Unable to connect to Noklai AI. Please check your connection and try again.',
          };
        }

        if (response.status === 404 && modelIndex === 0 && modelCandidates.length > 1) break;
        if (!response.ok) {
          if (isTransientStatus(response.status) && attempt + 1 < maxAttempts) {
            await wait(retryDelay(attempt));
            continue;
          }
          if (response.status === 429) {
            return { success: false, error: 'RATE_LIMIT', message: 'Noklai AI is busy right now. Please wait a moment and try again.' };
          }
          if (response.status === 400 || response.status === 403) {
            return { success: false, error: 'AUTH_ERROR', message: 'Noklai could not authenticate this request. Please check the service configuration.' };
          }
          return { success: false, error: 'API_ERROR', message: 'Noklai encountered a service error. Please try again.' };
        }

        let data;
        try {
          data = typeof response.json === 'function' ? await response.json() : null;
        } catch {
          return { success: false, error: 'INVALID_RESPONSE', message: 'Noklai received an invalid response. Please try again.' };
        }
        if (!data || typeof data !== 'object') {
          return { success: false, error: 'INVALID_RESPONSE', message: 'Noklai received an invalid response. Please try again.' };
        }
        if (data.promptFeedback?.blockReason) {
          return { success: false, error: 'SAFETY_BLOCKED', message: 'This topic cannot be discussed. Please reach out to your doctor or family caregiver for assistance.' };
        }
        const replyText = data.candidates?.[0]?.content?.parts?.find((part) => typeof part?.text === 'string')?.text;
        if (!replyText?.trim()) {
          return { success: false, error: 'EMPTY_RESPONSE', message: 'Noklai was unable to formulate a response. Please rephrase your question.' };
        }
        return { success: true, text: replyText.trim() };
      }
    }
    return { success: false, error: 'API_ERROR', message: 'Noklai encountered a service error. Please try again.' };
  } catch {
    if (signal?.aborted) {
      return { success: false, error: 'CANCELLED', message: 'The request was cancelled.' };
    }
    return { success: false, error: 'NETWORK_ERROR', message: 'Unable to connect to Noklai AI. Please try again.' };
  }
};


export default {
  buildSystemInstruction,
  formatChatHistory,
  isGeminiConfigured,
  sendGeminiChatMessage,
  sendGeminiAudioMessage,
};
