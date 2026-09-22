import { sendGeminiChatMessage, isGeminiConfigured } from '../services/GeminiService.js';

// Safe translation lookup supporting both React Native and test environments
let t = (key) => null;
try {
  // eslint-disable-next-line
  const i18n = require('../i18n/index.js');
  if (i18n && typeof i18n.t === 'function') t = i18n.t;
} catch (e) {
  // Safe in plain Node environments
}

/**
 * Intelligent Multi-Lingual AI Memory Companion Engine
 * SIH 2026 Memory Assistant — Team OneCode (SIH26003)
 *
 * Supports Hindi, English, Assamese (অসমীয়া), and Bengali (বাংলা).
 * Integrates live schedule reminders, real clock reality-orientation,
 * location & home environment grounding, instant emergency caregiver call detection,
 * cultural heritage storytelling, and empathetic dementia caregiver support.
 */

// Helper: Detect language/dialect from query string and context
export function detectLanguage(text, contextLang = null) {
  if (!text || typeof text !== 'string') return contextLang || 'en';
  const lower = text.toLowerCase();

  // 1. Devanagari Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  // 2. Bengali / Assamese shared Unicode range (\u0980-\u09FF)
  // Non-negotiable principle: Assamese and Bengali share a script but are different languages.
  // Never rely on Unicode range alone.
  if (/[\u0980-\u09FF]/.test(text)) {
    // Assamese-exclusive characters: 'ৰ' (U+09F0) and 'ৱ' (U+09F1)
    if (/[\u09F0\u09F1]/.test(text)) {
      return 'as';
    }

    // Assamese-exclusive vocabulary markers:
    const assameseMarkers = [
      'আজি', 'কাইলৈ', 'বাৰ', 'দুপৰীয়া', 'দুপৰীয়া', 'ৰাতি', 'ৰাতিপুৱা', 'কোঠা',
      'ঘৰ', 'নমস্কাৰ', 'কেতিয়া', 'কেতিয়া', 'খাব', 'ঔষধ', 'সহায়', 'সহায়', 'পৰিয়াল', 'পৰিয়াল',
      'বতৰ', 'ঋতু', 'লগত', 'মই', 'মোৰ', 'আপুনি', 'আপোনাৰ', 'কʼত', 'ক’ত', 'কত',
      'কিবা', 'হৈছে', 'নাছিল', 'যাম', 'লাহে', 'দুৱাৰ', 'বিপদ', 'বচাওক'
    ];
    if (assameseMarkers.some((w) => lower.includes(w))) {
      return 'as';
    }

    // Bengali-exclusive vocabulary markers:
    const bengaliMarkers = [
      'আজ', 'আজকে', 'কাল', 'কালকে', 'বার', 'দুপুর', 'রাত', 'রাত্রি', 'সকাল',
      'ঘর', 'বাড়ি', 'বাড়ি', 'নমস্কার', 'কখন', 'খেতে', 'ওষুধ', 'সাহায্য', 'পরিবার',
      'বৃষ্টি', 'সঙ্গে', 'আমি', 'আমার', 'আপনি', 'আপনার', 'কোথায়', 'কোথায়', 'কী',
      'হয়েছে', 'যাব', 'ধীরে', 'দরজা', 'তালা', 'বিপদ', 'বাঁচান', 'জরুরি'
    ];
    if (bengaliMarkers.some((w) => lower.includes(w))) {
      return 'bn';
    }

    // Fall back to context language if it is explicitly 'as' or 'bn'
    if (contextLang === 'as' || contextLang === 'bn') {
      return contextLang;
    }

    // Bengali has 'র' (U+09B0), 'ড়' (U+09DC), 'ঢ়' (U+09DD)
    if (lower.includes('র') || lower.includes('ড়') || lower.includes('ঢ়')) {
      return 'bn';
    }

    return 'bn';
  }

  // 3. Hinglish heuristics (Romanized Hindi)
  const hinglishWords = [
    'kya', 'kaise', 'karo', 'khel', 'dawai', 'dawa', 'aaj', 'parivar', 'madad',
    'yaad', 'bhool', 'nahi', 'raha', 'hai', 'batao', 'namaste', 'kaun', 'mera',
    'meri', 'mere', 'khelna', 'khana', 'pani', 'kaisi', 'shubh', 'dar', 'neend',
    'kahan', 'kamra', 'darwaza', 'ghar', 'bhojan', 'dopahar', 'mausam', 'tala'
  ];
  const words = lower.split(/\s+/);
  const matchCount = words.filter((w) => hinglishWords.includes(w)).length;
  if (matchCount >= 1) {
    return 'hi';
  }

  // If context language is set and query is not distinctly English keywords, respect context
  if (contextLang && ['hi', 'as', 'bn'].includes(contextLang)) {
    const isPureEnglish = /^(what|where|who|when|how|why|is it|tell me|call|help)\b/i.test(lower);
    if (!isPureEnglish) {
      return contextLang;
    }
  }

  return 'en';
}

// Compute real-time clock orientation facts locally (never guessed by LLM)
export function getComputedOrientationData(now = new Date(), reminders = []) {
  const dayIndex = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  // Time of day categories
  let timeOfDayKey = 'morning';
  if (hours >= 12 && hours < 16) timeOfDayKey = 'afternoon';
  else if (hours >= 16 && hours < 20) timeOfDayKey = 'evening';
  else if (hours >= 20 || hours < 5) timeOfDayKey = 'night';

  // Season (North East India calendar)
  const month = now.getMonth(); // 0-11
  let seasonKey = 'autumn';
  if (month >= 2 && month <= 3) seasonKey = 'spring';
  else if (month >= 4 && month <= 5) seasonKey = 'summer';
  else if (month >= 6 && month <= 7) seasonKey = 'monsoon';
  else if (month >= 8 && month <= 9) seasonKey = 'autumn';
  else if (month === 10) seasonKey = 'late_autumn';
  else seasonKey = 'winter';

  // Day names across 4 languages
  const dayNames = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    as: ['দেওবাৰ', 'সোমবাৰ', 'মঙলবাৰ', 'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুকুৰবাৰ', 'শনিবাৰ'],
    bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  };

  // Extract scheduled meals from reminders
  let lunchTime = null;
  let dinnerTime = null;
  let breakfastTime = null;

  if (Array.isArray(reminders)) {
    for (const r of reminders) {
      const title = (r.title || '').toLowerCase();
      const cat = (r.category || '').toLowerCase();
      if (
        cat.includes('meal') ||
        title.includes('lunch') ||
        title.includes('dopahar') ||
        title.includes('দুপৰীয়া') ||
        title.includes('দুপৰীয়া') ||
        title.includes('দুপুর')
      ) {
        if (!lunchTime) lunchTime = r.time;
      }
      if (
        title.includes('dinner') ||
        title.includes('raat ka khana') ||
        title.includes('ৰাতিৰ ভাত') ||
        title.includes('রাতের খাবার') ||
        title.includes('shyam ka khana')
      ) {
        if (!dinnerTime) dinnerTime = r.time;
      }
      if (
        title.includes('breakfast') ||
        title.includes('nashta') ||
        title.includes('ৰাতিপুৱাৰ জলপান') ||
        title.includes('সকালের খাবার')
      ) {
        if (!breakfastTime) breakfastTime = r.time;
      }
    }
  }

  return {
    dayIndex,
    dayNames,
    timeStr,
    timeOfDayKey,
    seasonKey,
    lunchTime,
    dinnerTime,
    breakfastTime,
  };
}

// In-session learned patient names keyed by patientId or session
export const sessionLearnedNames = {};

export const clearSessionLearnedNames = () => {
  for (const k in sessionLearnedNames) delete sessionLearnedNames[k];
};

// Regex patterns for immediate local classification
const EMERGENCY_PATTERNS = [
  /\b(?:call|phone)\s+(?:my\s+)?(?:caregiver|doctor|help|family|son|daughter|mummy|papa|maa)\b/i,
  /\b(?:i\s+need\s+help|call\s+for\s+help|help\s+me|emergency|sos|save\s+me)\b/i,
  /\b(?:madad|bachao|bchao|phone\s+(?:lagao|karo|milao))\b/i,
  /(?:केयरगिवर\s+को\s+फोन|मदद\s+चाहिए|मदद\s+करो|मुझे\s+मदद|सहायता\s+करो|बचाओ|आपातकाल|इमरजेंसी)/i,
  /(?:কেয়াৰগিভাৰক\s+ফোন|কেয়াৰগিভাৰক\s+ফোন|মোক\s+সহায়|মোক\s+সহায়|সহায়\s+কৰক|সহায়\s+কৰক|বিপদ|মোক\s+বচাওক|ফোন\s+কৰা)/i,
  /(?:কেয়ারগিভারকে\s+ফোন|আমার\s+সাহায্য\s+দরকার|সাহায্য\s+করুন|সাহায্য\s+চাই|বিপদ|জরুরি|আমাকে\s+বাঁচান|ফোন\s+করুন)/i,
];

export const isEmergencyDistressQuery = (query) => {
  if (!query || typeof query !== 'string') return false;
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(query));
};

const REALITY_PATTERNS = {
  dayOfWeek: /(?:what\s+day(?:\s+of\s+the\s+week)?(?:\s+is\s+it)?|which\s+day|day\s+of\s+the\s+week|kaun\s+sa\s+din|kya\s+din|din\s+kaun\s+sa|kaun\s+sa\s+vaar|din\s+kya\s+hai|आज\s+कौन\s+सा\s+दिन|কি\s+বাৰ|আজি\s+কি\s+বাৰ|আজ\s+কি\s+বার|আজ\s+কী\s+বার|কোন\s+দিন)/i,
  timeOfDay: /(?:is\s+it\s+(?:morning\s+or\s+night|day\s+or\s+night)|morning\s+or\s+night|day\s+or\s+night|what\s+time\s+is\s+it|what\s+time\b|subah\s+hai\s+ya\s+raat|din\s+hai\s+ya\s+raat|kya\s+samay|kitne\s+baje|subah\s+hai|raat\s+hai|सुबह\s+है\s+या\s+रात|दिन\s+है\s+या\s+रात|कितने\s+बजे|কিমান\s+সময়|কিমান\s+বাজিছে|ৰাতিপুৱা\s+নে\s+ৰাতি|দিন\s+নে\s+ৰাতি|সকাল\s+না\s+রাত|সকাল\s+নাকি\s+রাত|কটা\s+বাজে|এখন\s+কি\s+সময়|এখন\s+কী\s+সময়)/i,
  mealTimes: /(?:when\s+is\s+(?:lunch|dinner|breakfast|meal|food)|lunch\s+time|dinner\s+time|breakfast\s+time|lunch\s+kab|dinner\s+kab|khana\s+kab|dopahar\s+ka\s+khana|raat\s+ka\s+khana|bhojan\s+kab|खाना\s+कब|दोपहर\s+का\s+खाना|রাত\s+का\s+खाना|দুপৰীয়াৰ\s+ভাত|দুপৰীয়াৰ\s+ভাত|ৰাতিৰ\s+ভাত|ভাত\s+কেতিয়া|ভাত\s+কেতিয়া|আহাৰ\s+কেতিয়া|আহাৰ\s+কেতিয়া|দুপুরের\s+খাবার|রাতের\s+খাবার|খাবার\s+কখন|লাঞ্চ\s+কখন|ডিনার\s+কখন)/i,
  season: /(?:what\s+season|which\s+season|current\s+season|season\s+are\s+we\s+in|kaun\s+sa\s+mausam|kaun\s+si\s+ritu|mausam\s+kaun\s+sa|ritu\s+kaun\s+si|मौसम|ऋतु|কি\s+ঋতু|কী\s+ঋতু|কোনটো\s+ঋতু|কি\s+বতৰ|কোন\s+ঋতু|কোন\s+কাল)/i,
  location: /(?:where\s+am\s+i|whose\s+house|which\s+house|where\s+is\s+this\s+place|am\s+i\s+at\s+home|what\s+is\s+this\s+place|main\s+kahan\s+hoon|kahan\s+hoon\s+main|ye\s+kiska\s+ghar|kiska\s+ghar|kaha\s+hu|मैं\s+कहाँ\s+हूँ|कहाँ\s+हूँ|किसका\s+घर|মই\s+কʼত\s+আছোঁ|মই\s+কত\s+আছোঁ|মই\s+ক’ত\s+আছোঁ|মই\s+কʼত|মই\s+কত|কাৰ\s+ঘৰ|এইটো\s+কাৰ\s+ঘৰ|আমি\s+কোথায়|আমি\s+কোথায়|আমি\s+কোথায়\s+আছি|আমি\s+কোথায়\s+আছি|কার\s+বাড়ি|কার\s+বাড়ি|এটা\s+কার\s+বাড়ি|এটা\s+কার\s+বাড়ি)/i,
  roomDirections: /(?:how\s+do\s+i\s+get\s+to\s+my\s+room|where\s+is\s+my\s+room|way\s+to\s+my\s+room|directions\s+to\s+my\s+room|take\s+me\s+to\s+my\s+room|my\s+bedroom|mera\s+kamra\s+kahan|kamre\s+mein\s+kaise\s+jau|kamre\s+ka\s+rasta|mera\s+room|कमरा\s+कहाँ|कमरे\s+का\s+रास्ता|মোৰ\s+কোঠালৈ\s+কেনেকৈ\s+যাম|মোৰ\s+কোঠা\s+কʼত|মোৰ\s+কোঠা\s+কত|কোঠাৰ\s+পথ|কোঠাটো\s+কʼত|আমার\s+ঘরে\s+কিভাবে\s+যাব|আমার\s+ঘর\s+কোথায়|আমার\s+ঘর\s+কোথায়|ঘরের\s+রাস্তা|আমার\s+রুম\s+কোথায়)/i,
  doorLocked: /(?:why\s+is\s+the\s+door\s+locked|why\s+is\s+door\s+locked|door\s+locked|who\s+locked\s+the\s+door|locked\s+the\s+door|open\s+the\s+door|darwaza\s+band\s+kyu|darwaza\s+band\s+kyon|darwaza\s+lock\s+kyu|tala\s+kyu\s+laga|दरवाजा\s+बंद\s+क्यों|ताला\s+क्यों\s+लगा|দুৱাৰখন\s+কিয়\s+বন্ধ|দুৱাৰখন\s+কিয়\s+বন্ধ|দুৱাৰ\s+কিয়\s+বন্ধ|দুৱাৰত\s+তলা\s+কিয়|দুৱাৰ\s+কিয়\s+লক্|দুৱাৰ\s+বন্ধ\s+কিয়|দরজা\s+কেন\s+বন্ধ|দরজায়\s+তালা\s+কেন|দরজা\s+বন্ধ\s+কেন|দরজা\s+কেন\s+লক|দরজায়\s+তালা)/i,
};

export const isRealityOrientationQuery = (query) => {
  if (!query || typeof query !== 'string') return false;
  return Object.values(REALITY_PATTERNS).some((pattern) => pattern.test(query));
};

/**
 * Returns detailed response object including emergency actions and metadata
 */
export const getAIResponseDetails = (question, contextOrPatientId = 'P001') => {
  if (!question || typeof question !== 'string') {
    return {
      text: t('ai.responses.default') || 'Hello! I am your Noklai Memory Companion. How can I help you today?',
      isEmergencyCall: false,
    };
  }

  let ctx = {};
  if (typeof contextOrPatientId === 'object' && contextOrPatientId !== null) {
    ctx = contextOrPatientId;
  } else {
    ctx = { patientId: contextOrPatientId || 'P001' };
  }

  const pid = ctx.patientId || 'P001';
  let pName = ctx.learnedName || sessionLearnedNames[pid] || ctx.patientName || 'Loved One';
  const cName = ctx.caregiverName || 'Caregiver';
  const cPhone = (ctx.caregiverPhone || '').trim();
  const lang = detectLanguage(question, ctx.language);
  const query = question.trim().toLowerCase();
  const orientation = getComputedOrientationData(new Date(), ctx.reminders || []);

  // -------------------------------------------------------------
  // 0. EMERGENCY DISTRESS / CALL CAREGIVER (HIGHEST PRIORITY - 0ms)
  // -------------------------------------------------------------
  if (isEmergencyDistressQuery(query)) {
    let reply = '';
    if (cPhone) {
      if (lang === 'hi') {
        reply = `मैं आपको आपके प्राथमिक देखभालकर्ता, ${cName} जी से जोड़ रहा हूँ। तुरंत बात करने के लिए नीचे दिए गए बटन पर टैप करें। घबराइए मत, वे आपके साथ हैं।`;
      } else if (lang === 'as') {
        reply = `মই আপোনাক আপোনাৰ প্ৰাথমিক কেয়াৰগিভাৰ ${cName}ৰ সৈতে যোগাযোগ কৰাই দিছোঁ। কথা পাতিবলৈ তলৰ বুটামত টিপক। চিন্তিত নহ'ব, সকলো ঠিকেই আছে।`;
      } else if (lang === 'bn') {
        reply = `আমি আপনাকে আপনার প্রাথমিক কেয়ারগিভার ${cName}-এর সাথে যোগাযোগ করিয়ে দিচ্ছি। কথা বলতে নিচের বোতামে চাপ দিন। কোনো ভয় নেই, তিনি আপনার কাছেই আছেন।`;
      } else {
        reply = `I am connecting you with your primary caregiver, ${cName}. Tap the button below to call immediately. Take a deep breath, you are safe.`;
      }
    } else {
      if (lang === 'hi') {
        reply = `आपके देखभालकर्ता ${cName} जी आपकी मदद के लिए उपस्थित हैं। कृपया सेटिंग्स में जाकर उनका फोन नंबर जोड़ने के लिए कहें ताकि एक टैप में कॉल हो सके।`;
      } else if (lang === 'as') {
        reply = `আপোনাৰ কেয়াৰগিভাৰ ${cName} আপোনাৰ সহায়ৰ বাবে আছে। অনুগ্ৰহ কৰি ছেটিংছত গৈ তেওঁৰ ফোন নম্বৰ যোগ কৰিবলৈ কওক যাতে এটা টিপতেই ফোন কৰিব পাৰি।`;
      } else if (lang === 'bn') {
        reply = `আপনার কেয়ারগিভার ${cName} আপনাকে সাহায্য করতে প্রস্তুত। এক চাপে কল করার জন্য অনুগ্রহ করে সেটিংসে গিয়ে ফোন নম্বরটি যোগ করতে বলুন।`;
      } else {
        reply = `Your caregiver ${cName} is here to help you. Please ask your caregiver to add their phone number in Settings so we can connect in one tap.`;
      }
    }

    return {
      text: reply,
      isEmergencyCall: true,
      caregiverName: cName,
      caregiverPhone: cPhone,
      hasCaregiverPhone: Boolean(cPhone),
      source: 'emergency_local',
    };
  }

  // -------------------------------------------------------------
  // 1. MEDICAL SAFETY & CLINICAL BOUNDARIES
  // -------------------------------------------------------------
  if (
    query.includes('diagnose') ||
    query.includes('do i have dementia') ||
    query.includes('do i have alzheimer') ||
    query.includes('kya mujhe dementia') ||
    query.includes('cure dementia') ||
    query.includes('what medicine should i take') ||
    query.includes('kon si dawa lu') ||
    query.includes('chest pain') ||
    query.includes('prescribe')
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = `मैं सामान्य सहायता और संज्ञानात्मक अभ्यास प्रदान कर सकता हूँ, लेकिन मैं चिकित्सीय निदान नहीं कर सकता। कृपया चिकित्सीय सलाह के लिए किसी डॉक्टर या अपने देखभालकर्ता (${cName} जी) से संपर्क करें।`;
    } else if (lang === 'as') {
      reply = `মই সাধাৰণ সহায় আৰু স্মৃতি অনুশীলন প্ৰদান কৰিব পাৰোঁ, কিন্তু মই চিকিৎসাজনিত নিদান দিব নোৱাৰোঁ। অনুগ্ৰহ কৰি চিকিৎসক বা আপোনাৰ কেয়াৰগিভাৰ (${cName})ৰ পৰামৰ্শ লওক।`;
    } else if (lang === 'bn') {
      reply = `আমি সাধারণ সাহায্য ও স্মৃতির অনুশীলন প্রদান করতে পারি, তবে আমি কোনো চিকিৎসা সংক্রান্ত রোগ নির্ণয় করতে পারি না। দয়া করে চিকিৎসক বা আপনার কেয়ারগিভার (${cName})-এর পরামর্শ নিন।`;
    } else {
      reply = `I can provide general support, but I cannot diagnose medical conditions. Please contact a healthcare professional or your caregiver (${cName}) for medical advice.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'safety_local' };
  }

  // -------------------------------------------------------------
  // 2. REALITY ORIENTATION: DAY OF THE WEEK
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.dayOfWeek.test(query)) {
    const dayName = orientation.dayNames[lang]?.[orientation.dayIndex] || orientation.dayNames.en[orientation.dayIndex];
    let reply = '';
    if (lang === 'hi') {
      reply = `आज ${dayName} है। आराम से अपना दिन बिताएं, आप बहुत अच्छा कर रहे हैं।`;
    } else if (lang === 'as') {
      reply = `আজি ${dayName}। লাহে ধীৰে দিনটো উপভোগ কৰক, আপুনি খুব ভাল কৰিছে।`;
    } else if (lang === 'bn') {
      reply = `আজ ${dayName}। শান্তভাবে আজকের দিনটি উপভোগ করুন, আপনি খুব ভালো আছেন।`;
    } else {
      reply = `Today is ${dayName}. Take your time today, you are doing wonderfully.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 3. REALITY ORIENTATION: TIME OF DAY (MORNING OR NIGHT / WHAT TIME)
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.timeOfDay.test(query)) {
    const timeStr = orientation.timeStr;
    const timeKey = orientation.timeOfDayKey; // morning, afternoon, evening, night
    let reply = '';

    if (lang === 'hi') {
      const timeNames = { morning: 'सुबह', afternoon: 'दोपहर', evening: 'शाम', night: 'रात' };
      reply = `अभी ${timeNames[timeKey] || 'दिन'} का समय है, लगभग ${timeStr} बजे हैं। आप पूरी तरह सुरक्षित हैं।`;
    } else if (lang === 'as') {
      const timeNames = { morning: 'ৰাতিপুৱাৰ', afternoon: 'দুপৰীয়াৰ', evening: 'সন্ধিয়াৰ', night: 'ৰাতিৰ' };
      reply = `এতিয়া ${timeNames[timeKey] || 'দিনৰ'} সময়, প্ৰায় ${timeStr} বাজিছে। আপুনি আপোনাৰ ঘৰতেই শান্তভাৱে আছে।`;
    } else if (lang === 'bn') {
      const timeNames = { morning: 'সকালের', afternoon: 'দুপুরের', evening: 'সন্ধ্যার', night: 'রাতের' };
      reply = `এখন ${timeNames[timeKey] || 'দিনের'} সময়, প্রায় ${timeStr} বাজে। আপনি নিজের ঘরে সম্পূর্ণ নিরাপদে আছেন।`;
    } else {
      reply = `Right now it is ${timeKey}, around ${timeStr}. Everything is peaceful and on schedule.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 4. REALITY ORIENTATION: MEAL TIMES (LUNCH / DINNER)
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.mealTimes.test(query)) {
    const isDinnerQuery = query.includes('dinner') || query.includes('raat') || query.includes('ৰাতি') || query.includes('রাত');
    const isBreakfastQuery = query.includes('breakfast') || query.includes('nashta') || query.includes('জলপান');

    let reply = '';
    if (isDinnerQuery) {
      const dTime = orientation.dinnerTime || '8:00 PM';
      if (lang === 'hi') {
        reply = orientation.dinnerTime
          ? `रात का खाना आपके शेड्यूल में ${dTime} बजे निर्धारित है। जब तक भोजन तैयार हो, आप आराम कर सकते हैं।`
          : `रात का खाना आमतौर पर रात 8:00 बजे परोसा जाता है। आपका परिवार सब तैयारी प्यार से कर रहा है।`;
      } else if (lang === 'as') {
        reply = orientation.dinnerTime
          ? `ৰাতিৰ ভাত আপোনাৰ সূচীত ${dTime} বজাত নিৰ্ধাৰণ কৰা আছে। আপুনি অলপ বিশ্ৰাম ল'ব পাৰে।`
          : `ৰাতিৰ ভাত সাধাৰণতে নিশা ৮:০০ বজাত খোৱা হয়। শান্তভাৱে থাকক, সকলো প্ৰস্তুত কৰা হৈছে।`;
      } else if (lang === 'bn') {
        reply = orientation.dinnerTime
          ? `রাতের খাবার আপনার রুটিনে ${dTime} টায় নির্ধারিত আছে। আপনি নিশ্চিন্তে বিশ্রাম নিন।`
          : `রাতের খাবার সাধারণত রাত ৮:০০ টায় হয়। আপনার জন্য খাবার তৈরি করা হচ্ছে।`;
      } else {
        reply = orientation.dinnerTime
          ? `Dinner is scheduled for ${dTime}. You can relax comfortably while everything is prepared.`
          : `Dinner is usually served around 8:00 PM. Take your time, your family is preparing everything with love.`;
      }
    } else if (isBreakfastQuery) {
      const bTime = orientation.breakfastTime || '8:00 AM';
      if (lang === 'hi') {
        reply = `सुबह का नाश्ता आमतौर पर ${bTime} बजे होता है।`;
      } else if (lang === 'as') {
        reply = `ৰাতিপুৱাৰ জলপান সাধাৰণতে ${bTime} বজাত খোৱা হয়।`;
      } else if (lang === 'bn') {
        reply = `সকালের নাস্তা সাধারণত ${bTime} টায় হয়।`;
      } else {
        reply = `Breakfast is usually served around ${bTime}.`;
      }
    } else {
      // Default to Lunch
      const lTime = orientation.lunchTime || '1:00 PM';
      if (lang === 'hi') {
        reply = orientation.lunchTime
          ? `दोपहर का खाना (Lunch) आपके शेड्यूल में ${lTime} बजे निर्धारित है। क्या आप तब तक थोड़ा गुनगुना पानी पीना चाहेंगे?`
          : `दोपहर का भोजन आमतौर पर दोपहर 1:00 बजे होता है। आराम से बैठिए, आपका परिवार सब तैयारी कर रहा है।`;
      } else if (lang === 'as') {
        reply = orientation.lunchTime
          ? `দুপৰীয়াৰ ভাত আপোনাৰ সূচীত ${lTime} বজাত নিৰ্ধাৰণ কৰা আছে। আপুনি অলপ পানী খাব বিচাৰিব নেকি?`
          : `দুপৰীয়াৰ ভাত সাধাৰণতে দিনৰ ১:০০ বজাত খোৱা হয়। শান্তভাৱে থাকক, সকলো প্ৰস্তুত কৰা হৈছে।`;
      } else if (lang === 'bn') {
        reply = orientation.lunchTime
          ? `দুপুরের খাবার আপনার রুটিনে ${lTime} টায় নির্ধারিত আছে। আপনি কি একটু জল খেতে চান?`
          : `দুপুরের খাবার সাধারণত দুপুর ১:০০ টায় হয়। নিশ্চিন্তে থাকুন, আপনার জন্য সবকিছু প্রস্তুত হচ্ছে।`;
      } else {
        reply = orientation.lunchTime
          ? `Lunch is scheduled for ${lTime}. Would you like a glass of warm water while you wait?`
          : `Lunch is usually served around 1:00 PM. Take your time, your family is preparing everything with love.`;
      }
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 5. REALITY ORIENTATION: CURRENT SEASON
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.season.test(query)) {
    const seasonKey = orientation.seasonKey;
    const seasonNames = {
      spring: { en: 'Spring (Bohag / Vasant)', hi: 'वसंत ऋतु (Spring)', as: "বসন্ত ঋতু (ব'হাগ)", bn: 'বসন্ত কাল (Spring)' },
      summer: { en: 'Summer (Grisma)', hi: 'ग्रीष्म ऋतु (Summer)', as: 'গ্ৰীষ্ম ঋতু', bn: 'গ্রীষ্ম কাল' },
      monsoon: { en: 'Monsoon (Barsha)', hi: 'वर्षा ऋतु (Monsoon)', as: 'বৰ্ষা ঋতু', bn: 'বর্ষা কাল' },
      autumn: { en: 'Autumn (Sarat Ritu)', hi: 'शरद ऋतु (Autumn/पतझड़)', as: 'শৰৎ ঋতু', bn: 'শরৎ ঋতু' },
      late_autumn: { en: 'Late Autumn (Hemanta)', hi: 'हेमंत ऋतु (Late Autumn)', as: 'হেমন্ত ঋতু', bn: 'হেমন্ত কাল' },
      winter: { en: 'Winter (Xitol / Sheet)', hi: 'शीत ऋतु (Winter/सर्दी)', as: 'শীত ঋতু', bn: 'শীত কাল' },
    };

    const sName = seasonNames[seasonKey]?.[lang] || seasonNames[seasonKey]?.en || 'Autumn';
    let reply = '';
    if (lang === 'hi') {
      reply = `अभी ${sName} का मौसम चल रहा है। पूर्वोत्तर में हवा सुखद और शांत है।`;
    } else if (lang === 'as') {
      reply = `এতিয়া ${sName} চলি আছে। আকাশ ফৰকাল আৰু বতাহো মৃদু হৈ পৰিছে।`;
    } else if (lang === 'bn') {
      reply = `এখন ${sName} চলছে। চারপাশের আবহাওয়া মনোরম ও শান্ত।`;
    } else {
      reply = `We are currently in the ${sName} season. The air is pleasant and gentle across North East India.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 6. LOCATION & ENVIRONMENT: WHERE AM I / WHOSE HOUSE IS THIS
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.location.test(query)) {
    const houseDesc = ctx.houseDescription?.trim();
    let reply = '';
    if (houseDesc) {
      if (lang === 'hi') {
        reply = `आप अपने घर पर हैं। ${houseDesc} आप यहाँ अपने परिवार के साथ पूरी तरह सुरक्षित और सुरक्षित हैं।`;
      } else if (lang === 'as') {
        reply = `আপুনি নিজৰ ঘৰতেই আছে। ${houseDesc} আপুনি ইয়াত নিজৰ পৰিয়ালৰ সৈতে সম্পূৰ্ণ সুৰক্ষিত।`;
      } else if (lang === 'bn') {
        reply = `আপনি নিজের বাড়িতেই আছেন। ${houseDesc} আপনি এখানে পরিবারের সাথে সম্পূর্ণ নিরাপদ ও সুরক্ষিত।`;
      } else {
        reply = `You are at home. ${houseDesc} You are safe, warm, and surrounded by your loved ones.`;
      }
    } else {
      // Reassure first, then state caregiver note status honestly
      if (lang === 'hi') {
        reply = `आप अपने घर पर अपने परिवार के साथ बिल्कुल सुरक्षित हैं। आपके देखभालकर्ता (${cName}) ने अभी घर का विस्तृत विवरण नहीं जोड़ा है, लेकिन वे आपके पास ही हैं।`;
      } else if (lang === 'as') {
        reply = `আপুনি নিজৰ পৰিয়ালৰ লগত ঘৰত সম্পূৰ্ণ সুৰক্ষিত হৈ আছে। আপোনাৰ কেয়াৰগিভাৰে (${cName}) এতিয়ালৈকে ঘৰৰ বিতং তথ্য যোগ কৰা নাই, কিন্তু তেওঁ আপোনাৰ লগতেই আছে।`;
      } else if (lang === 'bn') {
        reply = `আপনি পরিবারের সাথে নিজের ঘরে সম্পূর্ণ নিরাপদে আছেন। আপনার কেয়ারগিভার (${cName}) এখনো বাড়ির বিস্তারিত বিবরণ যুক্ত করেননি, তবে তিনি আপনার কাছেই আছেন।`;
      } else {
        reply = `You are completely safe in your home with your family. Your caregiver (${cName}) has not added a detailed house description yet, but they are right here with you.`;
      }
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 7. LOCATION & ENVIRONMENT: HOW DO I GET TO MY ROOM
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.roomDirections.test(query)) {
    const directions = ctx.roomDirections?.trim();
    let reply = '';
    if (directions) {
      if (lang === 'hi') {
        reply = `आपके कमरे का रास्ता यह है: ${directions}। आराम से चलिए, कोई जल्दी नहीं है।`;
      } else if (lang === 'as') {
        reply = `আপোনাৰ কোঠালৈ যোৱাৰ পথ হৈছে: ${directions}। লাহে লাহে খোজ লওক, কোনো খৰখেদা নাই।`;
      } else if (lang === 'bn') {
        reply = `আপনার ঘরে যাওয়ার পথ হলো: ${directions}। ধীরে ধীরে যান, কোনো তাড়াহুড়ো নেই।`;
      } else {
        reply = `Here are the directions to your room: ${directions}. Take your time, there is no rush at all.`;
      }
    } else {
      if (lang === 'hi') {
        reply = `एक गहरी सांस लीजिए, आपका कमरा बिल्कुल पास ही है। आपके देखभालकर्ता (${cName}) ने अभी दिशा-निर्देश नहीं लिखे हैं, लेकिन वे आपको आराम से आपके कमरे तक ले जाने के लिए यहीं हैं।`;
      } else if (lang === 'as') {
        reply = `লাহেকৈ উশাহ লওক, আপোনাৰ কোঠাটো কাষতেই আছে। কেয়াৰগিভাৰে (${cName}) এতিয়ালৈকে পথটো লিখা নাই, কিন্তু তেওঁ আপোনাক কোঠালৈ লৈ যাবলৈ কাষতেই আছে।`;
      } else if (lang === 'bn') {
        reply = `একটু শান্ত হোন, আপনার ঘর কাছেই আছে। কেয়ারগিভার (${cName}) এখনো নির্দিষ্ট পথটি লিখে রাখেননি, তবে তিনি আপনাকে ঘরে পৌঁছে দেওয়ার জন্য কাছেই আছেন।`;
      } else {
        reply = `Take a gentle breath, your room is right nearby. Your caregiver (${cName}) has not written down the specific directions yet, but they are right here to walk you there safely.`;
      }
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 8. LOCATION & ENVIRONMENT: WHY IS THE DOOR LOCKED
  // -------------------------------------------------------------
  if (REALITY_PATTERNS.doorLocked.test(query)) {
    const doorNote = ctx.doorSafetyNote?.trim();
    let reply = '';
    if (doorNote) {
      if (lang === 'hi') {
        reply = `दरवाजा आपकी सुरक्षा के लिए बंद रखा गया है: ${doorNote}। आप अपने घर में सुरक्षित हैं।`;
      } else if (lang === 'as') {
        reply = `আপোনাৰ সুৰক্ষাৰ বাবে দুৱাৰখন বন্ধ ৰখা হৈছে: ${doorNote}। আপুনি নিজৰ ঘৰত সুৰক্ষিত।`;
      } else if (lang === 'bn') {
        reply = `আপনার সুরক্ষার জন্যই দরজাটি বন্ধ রাখা হয়েছে: ${doorNote}। আপনি নিজের ঘরে সম্পূর্ণ নিরাপদ।`;
      } else {
        reply = `The door is secured for your safety: ${doorNote}. You are safe and well-cared for.`;
      }
    } else {
      if (lang === 'hi') {
        reply = `दरवाजा इसलिए बंद रखा गया है ताकि आप घर के अंदर सुरक्षित और सहज महसूस करें। आपका परिवार और देखभालकर्ता (${cName}) आपके साथ हैं।`;
      } else if (lang === 'as') {
        reply = `আপুনি ঘৰৰ ভিতৰত সুৰক্ষিত আৰু শান্তভাৱে থাকিবলৈ দুৱাৰখন বন্ধ ৰখা হৈছে। আপোনাৰ পৰিয়াল আৰু কেয়াৰগিভাৰ (${cName}) আপোনাৰ লগতেই আছে।`;
      } else if (lang === 'bn') {
        reply = `আপনি যাতে ঘরের ভেতরে নিরাপদ ও স্বাচ্ছন্দ্যে থাকেন, সেজন্য দরজাটি বন্ধ রাখা হয়েছে। আপনার পরিবার ও কেয়ারগিভার (${cName}) আপনার কাছেই আছেন।`;
      } else {
        reply = `The front door is kept locked to keep you safe and comfortable inside your warm home. Your family and caregiver (${cName}) are right here with you.`;
      }
    }
    return { text: reply, isEmergencyCall: false, source: 'reality_local' };
  }

  // -------------------------------------------------------------
  // 9. IN-SESSION NAME LEARNING ("MY NAME IS DHRUV")
  // -------------------------------------------------------------
  const nameIntroMatch = question.match(
    /(?:my name is|mera naam hai|mera naam|i am called|call me|main hoon|আমি|আমার নাম|মোৰ নাম)\s+([A-Za-z\u0900-\u097F\u0980-\u09FF]+)/i
  );
  if (nameIntroMatch && !query.includes('what is') && !query.includes('kya') && !query.includes('কি')) {
    const rawName = nameIntroMatch[1].trim();
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    sessionLearnedNames[pid] = formattedName;

    let reply = '';
    if (lang === 'hi') {
      reply = `नमस्ते ${formattedName} जी! आपसे मिलकर बहुत खुशी हुई। मैं नोकलाई (NOKLAI) हूँ। मैं आपकी याददाश्त और दिमागी गतिविधियों में मदद के लिए यहाँ हूँ।`;
    } else if (lang === 'as') {
      reply = `নমস্কাৰ ${formattedName}! আপোনাক পাই বৰ ভাল লাগিল। মই নোকলাই (NOKLAI)। মই আপোনাৰ স্মৃতি আৰু দৈনন্দিন সহায়ৰ সংগী।`;
    } else if (lang === 'bn') {
      reply = `নমস্কার ${formattedName}! আপনার সাথে পরিচিত হয়ে খুব আনন্দ হলো। আমি নোকলাই (NOKLAI)। আমি আপনার স্মৃতির যত্ন ও দৈনন্দিন সহায়তায় আছি।`;
    } else {
      reply = `Nice to meet you, ${formattedName}. I'm NOKLAI. I'm here to help you with memory activities and daily routines.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'name_learning' };
  }

  // -------------------------------------------------------------
  // 10. IDENTITY: WHAT IS MY NAME / WHO AM I / WHO IS CAREGIVER
  // -------------------------------------------------------------
  if (
    query.includes('what is my name') ||
    query.includes('mera naam kya') ||
    query.includes('who am i') ||
    query.includes('mein kaun') ||
    query.includes('মোৰ নাম কি') ||
    query.includes('আমার নাম কি') ||
    query.includes('আমার নাম কী')
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = ctx.role === 'caregiver'
        ? `आप ${cName} हैं, और आप ${pName} जी की प्राथमिक देखभाल कर रहे हैं।`
        : `आपका नाम ${pName} है!`;
    } else if (lang === 'as') {
      reply = ctx.role === 'caregiver'
        ? `আপুনি ${cName}, আৰু আপুনি ${pName}ৰ প্ৰাথমিক কেয়াৰগিভাৰ।`
        : `আপোনাৰ নাম ${pName}!`;
    } else if (lang === 'bn') {
      reply = ctx.role === 'caregiver'
        ? `আপনি ${cName}, এবং আপনি ${pName}-এর প্রাথমিক কেয়ারগিভার।`
        : `আপনার নাম ${pName}!`;
    } else {
      reply = ctx.role === 'caregiver'
        ? `You are ${cName}, the primary caregiver supporting ${pName}.`
        : `Your name is ${pName}.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'identity_local' };
  }

  if (
    query.includes('who is my caregiver') ||
    query.includes('mera caregiver kaun') ||
    query.includes('meri dekhbhal kaun') ||
    query.includes('মোৰ কেয়াৰগিভাৰ কোন') ||
    query.includes('আমার কেয়ারগিভার কে')
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = `आपके प्राथमिक देखभालकर्ता ${cName} जी हैं। वे हमेशा आपकी मदद और सुरक्षा के लिए आपके साथ हैं।`;
    } else if (lang === 'as') {
      reply = `আপোনাৰ প্ৰাথমিক কেয়াৰগিভাৰ হ'ল ${cName}। তেওঁ সদায় আপোনাৰ সুৰক্ষা আৰু সহায়ৰ বাবে লগত আছে।`;
    } else if (lang === 'bn') {
      reply = `আপনার প্রাথমিক কেয়ারগিভার হলেন ${cName}। তিনি সবসময় আপনার যত্ন ও সুরক্ষায় আপনার পাশে আছেন।`;
    } else {
      reply = `Your primary caregiver is ${cName}. They are always here to support and care for you.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'caregiver_identity' };
  }

  // -------------------------------------------------------------
  // 11. ENERGY / TIREDNESS: "I FEEL TIRED"
  // -------------------------------------------------------------
  if (
    query.includes('tired') ||
    query.includes('feel tired') ||
    query.includes('thak gaya') ||
    query.includes('thakan') ||
    query.includes('ভাগৰ লাগিছে') ||
    query.includes('ক্লান্ত')
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = `कोई बात नहीं। आप थोड़ा आराम कर लीजिए। जब भी आप तैयार महसूस करें, हम एक छोटी सी गतिविधि आज़मा सकते हैं।`;
    } else if (lang === 'as') {
      reply = `কোনো কথা নাই। আপুনি অলপ জিৰণি লওক। আপুনি যেতিয়াই সাজু অনুভৱ কৰে, আমি এটি সৰু খেল খেলিব পাৰোঁ।`;
    } else if (lang === 'bn') {
      reply = `কোনো সমস্যা নেই। আপনি একটু বিশ্রাম নিন। আপনি প্রস্তুত বোধ করলেই আমরা একটি ছোট কার্যকলাপ শুরু করতে পারি।`;
    } else {
      reply = `That's completely okay. You can take a gentle rest. We can try a small activity whenever you feel ready.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'empathy_local' };
  }

  // -------------------------------------------------------------
  // 12. JOKES: "TELL ME A JOKE"
  // -------------------------------------------------------------
  if (query.includes('joke') || query.includes('chutkula') || query.includes('hasao') || query.includes('ধেমালি') || query.includes('কৌতুক')) {
    let reply = '';
    if (lang === 'hi') {
      reply = `एक छोटा सा चुटकुला आपके चेहरे पर मुस्कान के लिए: 😄\n\nडॉक्टर: आपको चश्मा लगाने की सख्त जरूरत है।\nमरीज: आपको कैसे पता चला डॉक्टर साहब?\nडॉक्टर: क्योंकि आप क्लीनिक की जगह मिठाई की दुकान में घुस आए हैं! 🍬\n\nआशा है आपको अच्छा लगा!`;
    } else if (lang === 'as') {
      reply = `আপোনাৰ বাবে এটি মৃদু ধেমালি: 😄\n\nএজন মানুহে ডাক্টৰক সুধিলে: "ডাঙৰীয়া, মই সুস্থ হ'বলৈ কি কৰা উচিত?"\nডাক্টৰে ক'লে: "প্ৰতিদিনে ফল খাওক, বিশেষকৈ আপুনি যেতিয়া নাখায়!" 🍎`;
    } else if (lang === 'bn') {
      reply = `আপনার মুখে একটু হাসির জন্য একটি মিষ্টি কৌতুক: 😄\n\nরোগী: ডাক্তারবাবু, আমি কি চশমা পরলে পড়তে পারব?\nডাক্তার: নিশ্চয়ই!\nরোগী: বাহ! আমি তো লেখাপড়াই জানতাম না, চশমা পরে পড়তে পারলে তো দারুণ হবে! 👓`;
    } else {
      reply = `Why did the scarecrow win an award? Because he was outstanding in his field! 😄 Hope that brought a gentle smile to your face.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'joke_local' };
  }

  // -------------------------------------------------------------
  // 13. GAME SUGGESTIONS: "WHAT CAN I PLAY?"
  // -------------------------------------------------------------
  if (
    query.includes('what can i play') ||
    query.includes('kya khel sakta') ||
    query.includes('khel') ||
    query.includes('কি খেলিব') ||
    query.includes('কী খেলা')
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = `आप धोपखेल (Dhopkhel), उबिलाकापकी (Ubilakapki), या एक मेमोरी स्टोरी (Xuworoni Kotha) खेल सकते हैं। क्या आप इनमें से कोई एक शुरू करना चाहेंगे?`;
    } else if (lang === 'as') {
      reply = `আপুনি ধোপখেল (Dhopkhel), উবিলাকাপকী (Ubilakapki), বা স্মৃতিৰ কাহিনী (Xuworoni Kotha) খেলিব পাৰে। আপুনি কোনোবা এটা আৰম্ভ কৰিব নেকি?`;
    } else if (lang === 'bn') {
      reply = `আপনি ধোপখেল (Dhopkhel), উবিলাকাপকি (Ubilakapki), বা একটি স্মৃতি গল্প (Xuworoni Kotha) খেলতে পারেন। আপনি কি শুরু করতে চান?`;
    } else {
      reply = `You can try Dhopkhel, Ubilakapki, Suh Tah Lam, or a Memory Story. Would you like to start one?`;
    }
    return { text: reply, isEmergencyCall: false, source: 'games_local' };
  }

  // -------------------------------------------------------------
  // 14. GREETINGS & INTRODUCTIONS
  // -------------------------------------------------------------
  if (
    /^(hi|hello|hey|namaste|pranam|namaskar|shubh prabhat|good morning|good evening|good afternoon|ki khobor|kemon acho|नमस्ते|प्रणाम|नमस्कार|নমস্কাৰ|নমস্কার)/iu.test(query) ||
    query === 'hi' ||
    query === 'hello'
  ) {
    let reply = '';
    if (lang === 'hi') {
      reply = ctx.role === 'caregiver'
        ? `नमस्ते ${cName} जी! मैं आपका नोकलाई (Noklai) केयर असिस्टेंट हूँ। मैं ${pName} जी की दिनचर्या, गेम प्रोग्रेस, और याददाश्त देखभाल में आपकी मदद के लिए उपस्थित हूँ।`
        : `नमस्ते ${pName} जी! मैं आपका नोकलाई साथी हूँ। आप आज कैसा महसूस कर रहे हैं? आप मुझसे अपनी दवाइयों, परिवार, या आज के शेड्यूल के बारे में कभी भी पूछ सकते हैं!`;
    } else if (lang === 'as') {
      reply = ctx.role === 'caregiver'
        ? `নমস্কাৰ ${cName}! মই আপোনাৰ নোকলাই কেয়াৰ সহায়ক। ${pName}ৰ যত্ন আৰু মানসিক স্বাস্থ্যৰ অগ্ৰগতি সম্পৰ্কে সহায় কৰিবলৈ সাজু আছোঁ।`
        : `নমস্কাৰ ${pName}! মই আপোনাৰ নোকলাই সংগী। আজি আপোনাৰ দিনটো কেনে গৈছে? কিবা সহায়ৰ প্ৰয়োজন আছে নেকি?`;
    } else if (lang === 'bn') {
      reply = ctx.role === 'caregiver'
        ? `নমস্কার ${cName}! আমি আপনার নোকলাই কেয়ার অ্যাসিস্ট্যান্ট। ${pName}-এর প্রোগ্রেস ও প্রতিদিনের যত্নে সাহায্য করার জন্য আমি আছি।`
        : `নমস্কার ${pName}! আমি আপনার নোকলাই বন্ধু। আজকের দিনটি কেমন কাটছে? কোনো সাহায্য প্রয়োজন?`;
    } else {
      reply = ctx.role === 'caregiver'
        ? `Hello ${cName}! I am your Noklai Care Assistant. I can help you monitor ${pName}'s cognitive progress, review upcoming reminders, or suggest memory exercises.`
        : `Hello ${pName}! I'm your Noklai companion. How are you feeling today? Take your time—I can help you with your daily routine, family stories, or gentle memory exercises.`;
    }
    return { text: reply, isEmergencyCall: false, source: 'greeting_local' };
  }

  // -------------------------------------------------------------
  // 15. MEDICINE & PRESCRIPTION REMINDERS
  // -------------------------------------------------------------
  if (
    query.includes('medicine') ||
    query.includes('dawai') ||
    query.includes('dawa') ||
    query.includes('tablet') ||
    query.includes('goli') ||
    query.includes('ঔষধ') ||
    query.includes('ওষুধ') ||
    query.includes('दवा')
  ) {
    const medReminders = (ctx.reminders || []).filter(
      (r) => r.category === 'Medicine' || r.title?.toLowerCase().includes('med') || r.title?.toLowerCase().includes('dawa') || r.title?.toLowerCase().includes('ঔষধ') || r.title?.toLowerCase().includes('ওষুধ')
    );
    if (medReminders.length > 0) {
      const pendingMeds = medReminders.filter((r) => !r.done);
      if (pendingMeds.length > 0) {
        if (lang === 'hi') {
          return {
            text: `आज की जरूरी दवाइयां:\n• ` + pendingMeds.map((m) => `${m.time}: ${m.title}`).join('\n• ') + `\n\nकृपया पानी के साथ समय पर लें।`,
            isEmergencyCall: false,
          };
        }
        if (lang === 'as') {
          return {
            text: `আজিৰ প্ৰয়োজনীয় ঔষধসমূহ:\n• ` + pendingMeds.map((m) => `${m.time}: ${m.title}`).join('\n• ') + `\n\nঅনুগ্ৰহ কৰি সময়মতে পানীৰ সৈতে খাব।`,
            isEmergencyCall: false,
          };
        }
        if (lang === 'bn') {
          return {
            text: `আজকের প্রয়োজনীয় ওষুধসমূহ:\n• ` + pendingMeds.map((m) => `${m.time}: ${m.title}`).join('\n• ') + `\n\nদয়া করে সময়মতো জল দিয়ে খাবেন।`,
            isEmergencyCall: false,
          };
        }
        return {
          text: `Upcoming medications for ${pName}:\n• ` + pendingMeds.map((m) => `${m.time}: ${m.title}`).join('\n• ') + `\n\nPlease ensure taken on time with water.`,
          isEmergencyCall: false,
        };
      }
      return {
        text: lang === 'hi'
          ? `आज की सभी निर्धारित दवाइयाँ पूरी हो चुकी हैं। बहुत बढ़िया!`
          : `All scheduled medications for today have already been marked completed! Great routine consistency.`,
        isEmergencyCall: false,
      };
    }
    return {
      text: lang === 'hi'
        ? `दवाइयों का सामान्य समय: सुबह 8:00 AM और रात 8:00 PM भोजन के बाद।`
        : `Routine medication timing is usually at 8:00 AM and 8:00 PM after meals. Please check your personalized routine tab or consult your doctor.`,
      isEmergencyCall: false,
    };
  }

  // -------------------------------------------------------------
  // 16. DEFAULT CONTEXTUAL EMPATHETIC FALLBACK
  // -------------------------------------------------------------
  let defaultReply = '';
  if (lang === 'hi') {
    defaultReply = ctx.role === 'caregiver'
      ? `मैं ${pName} जी की देखरेख में आपकी सहायता के लिए तैयार हूँ। आप मुझसे उनके गेम स्कोर (CVI), दवाइयों के समय, या दिनचर्या के बारे में पूछ सकते हैं।`
      : `मैं हर कदम पर आपके साथ हूँ ${pName} जी। आप मुझसे अपनी दवाइयों, परिवार, आज के दिन, या घर के बारे में कभी भी पूछ सकते हैं।`;
  } else if (lang === 'as') {
    defaultReply = `মই আপোনাৰ লগত আছোঁ ${pName}। আপুনি আপোনাৰ ঔষধ, আজিৰ দিনটো, ঘৰ, বা পৰিয়ালৰ বিষয়ে সুধিব পাৰে।`;
  } else if (lang === 'bn') {
    defaultReply = `আমি সবসময় আপনার সাথে আছি ${pName}। আপনি আপনার ওষুধ, আজকের দিন, বাড়ি, বা পরিবারের বিষয়ে জানতে চাইতে পারেন।`;
  } else {
    defaultReply = ctx.role === 'caregiver'
      ? `I'm monitoring ${pName}'s daily routines and memory engagement. You can ask me about game scores (CVI), schedule completion, or care suggestions.`
      : `I'm here with you always, ${pName}. Take your time, and feel free to ask me about today's day, meals, medicines, or your family!`;
  }

  return {
    text: defaultReply,
    isEmergencyCall: false,
    source: 'fallback_local',
  };
};

/**
 * Core conversational generator with full context awareness (Offline / Fallback mode)
 * Returns plain string for backwards compatibility with any callers expecting string
 */
export const getAIResponse = (question, contextOrPatientId = 'P001') => {
  const result = getAIResponseDetails(question, contextOrPatientId);
  return result?.text || '';
};

/**
 * Asynchronous real Gemini AI conversation handler with multi-turn memory
 * Integrates immediate 0ms local distress detection, local reality-orientation,
 * and grounded live Gemini 2.0 Flash REST queries.
 */
export const getAIResponseAsync = async (question, contextOrPatientId = 'P001', history = [], options = {}) => {
  let ctx = {};
  if (typeof contextOrPatientId === 'object' && contextOrPatientId !== null) {
    ctx = contextOrPatientId;
  } else {
    ctx = { patientId: contextOrPatientId || 'P001' };
  }

  const cleanQuery = typeof question === 'string' ? question.trim() : '';
  if (!cleanQuery) {
    return {
      success: false,
      error: 'EMPTY_MESSAGE',
      message: 'Please provide a non-empty question.',
      fallback: getAIResponse(question, ctx),
      source: 'empty',
    };
  }

  // 1. NON-NEGOTIABLE SAFETY: Immediate 0ms local check for distress / Call Caregiver
  // Do NOT route emergency requests through LLM!
  if (isEmergencyDistressQuery(cleanQuery)) {
    const details = getAIResponseDetails(cleanQuery, ctx);
    return {
      success: true,
      text: details.text,
      isEmergencyCall: true,
      caregiverName: details.caregiverName,
      caregiverPhone: details.caregiverPhone,
      hasCaregiverPhone: details.hasCaregiverPhone,
      source: 'emergency_local',
    };
  }

  // 2. DETERMINISTIC REALITY ORIENTATION LAYER: Instant, guaranteed-correct, works offline
  if (isRealityOrientationQuery(cleanQuery)) {
    const details = getAIResponseDetails(cleanQuery, ctx);
    return {
      success: true,
      text: details.text,
      isEmergencyCall: false,
      source: 'reality_orientation_local',
    };
  }

  const signal = options && typeof options.addEventListener === 'function'
    ? options
    : options?.signal;

  // 3. GEMINI REST CLIENT GROUNDING LAYER
  if (isGeminiConfigured()) {
    try {
      const geminiResult = await sendGeminiChatMessage({
        message: cleanQuery,
        history,
        context: ctx,
        signal,
      });

      if (geminiResult.success && geminiResult.text) {
        return {
          success: true,
          text: geminiResult.text,
          source: 'gemini',
        };
      }

      const fallbackDetails = getAIResponseDetails(cleanQuery, ctx);
      return {
        success: false,
        error: geminiResult.error,
        message: geminiResult.message,
        fallback: fallbackDetails.text,
        isEmergencyCall: fallbackDetails.isEmergencyCall,
        caregiverPhone: fallbackDetails.caregiverPhone,
        caregiverName: fallbackDetails.caregiverName,
        source: 'error',
      };
    } catch (err) {
      const fallbackDetails = getAIResponseDetails(cleanQuery, ctx);
      return {
        success: false,
        error: 'EXCEPTION',
        message: 'Unable to connect to Noklai AI. Please try again.',
        fallback: fallbackDetails.text,
        isEmergencyCall: fallbackDetails.isEmergencyCall,
        caregiverPhone: fallbackDetails.caregiverPhone,
        caregiverName: fallbackDetails.caregiverName,
        source: 'error',
      };
    }
  }

  // 4. OFFLINE / NO API KEY FALLBACK
  const offlineDetails = getAIResponseDetails(cleanQuery, ctx);
  return {
    success: false,
    error: 'NO_API_KEY',
    message: 'Google Gemini API key is not configured. Answering via local offline engine.',
    fallback: offlineDetails.text,
    isEmergencyCall: offlineDetails.isEmergencyCall,
    caregiverPhone: offlineDetails.caregiverPhone,
    caregiverName: offlineDetails.caregiverName,
    source: 'offline_fallback',
  };
};

export default {
  detectLanguage,
  getComputedOrientationData,
  isEmergencyDistressQuery,
  isRealityOrientationQuery,
  getAIResponseDetails,
  getAIResponse,
  getAIResponseAsync,
  sessionLearnedNames,
  clearSessionLearnedNames,
};