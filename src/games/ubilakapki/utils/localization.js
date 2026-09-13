/**
 * UBILAKAPKI - Dynamic Multilingual Localization Helper
 * Translates players, question prompts, choices, praises, and interface controls
 * into English, Assamese, Bengali, and Hindi.
 * 
 * Uses authentic, familiar Northeast Indian person names so elders feel like
 * they are playing with real neighbors from their community.
 */

export const PLAYER_NAME_MAP = {
  A: {
    en: 'Jonali',
    as: 'জোনালী',
    bn: 'জোনালী',
    hi: 'जोनाली',
  },
  B: {
    en: 'Rupjyoti',
    as: 'ৰূপজ্যোতি',
    bn: 'রূপজ্যোতি',
    hi: 'रूपज्योति',
  },
  C: {
    en: 'Bobita',
    as: 'ববিতা',
    bn: 'ববিতা',
    hi: 'बबीता',
  },
  D: {
    en: 'Debajit',
    as: 'দেৱজিৎ',
    bn: 'দেবজিৎ',
    hi: 'देबजीत',
  },
  E: {
    en: 'Anamika',
    as: 'অনামিকা',
    bn: 'অনামিকা',
    hi: 'अनामिका',
  },
};

export const ATTIRE_DESCRIPTION_MAP = {
  A: {
    en: 'Crimson & Muga Gold Attire',
    as: 'ৰঙা আৰু মুগা সোণালী সাজ',
    bn: 'লাল ও মুগা সোনালী পোশাক',
    hi: 'लाल और मुगा सुनहरा परिधान',
  },
  B: {
    en: 'Indigo & Silver Attire',
    as: 'নীলা আৰু ৰূপালী সাজ',
    bn: 'নীল ও রূপালী পোশাক',
    hi: 'नीला और चांदी का परिधान',
  },
  C: {
    en: 'Emerald Green Attire',
    as: 'সেউজীয়া সাজ',
    bn: 'সবুজ পোশাক',
    hi: 'हरा परिधान',
  },
  D: {
    en: 'Terracotta & Ochre Attire',
    as: 'মাটি ৰঙা আৰু হালধীয়া সাজ',
    bn: 'মাটির লাল ও হলুদ পোশাক',
    hi: 'गेरुआ और पीला परिधान',
  },
  E: {
    en: 'Turquoise & White Attire',
    as: 'ফিৰোজা আৰু বগা সাজ',
    bn: 'ফিরোজা ও সাদা পোশাক',
    hi: 'फिरोजा और सफेद परिधान',
  },
};

/**
 * Normalizes player ID from 'playerA' or 'A' to 'A'
 */
function normalizePlayerId(id) {
  if (!id) return 'A';
  const str = String(id).trim();
  if (str.startsWith('player')) {
    return str.replace('player', '').toUpperCase();
  }
  return str.toUpperCase();
}

/**
 * Get localized authentic player person name
 */
export function getLocalizedPlayerName(playerId, t, currentLanguage = 'en') {
  const cleanId = normalizePlayerId(playerId);
  const lang = currentLanguage || 'en';

  if (t) {
    const trans1 = t(`games.ubilakapki.players.${cleanId}`);
    if (trans1 && !trans1.includes('missing')) {
      return trans1;
    }
    const trans2 = t(`games.ubilakapki.player${cleanId}`);
    if (trans2 && !trans2.includes('missing')) {
      return trans2;
    }
  }

  return PLAYER_NAME_MAP[cleanId]?.[lang] || PLAYER_NAME_MAP[cleanId]?.en || 'Jonali';
}

/**
 * Get localized attire subtitle
 */
export function getLocalizedPlayerAttire(playerId, t, currentLanguage = 'en') {
  const cleanId = normalizePlayerId(playerId);
  const lang = currentLanguage || 'en';

  if (t) {
    const trans = t(`games.ubilakapki.attires.${cleanId}`);
    if (trans && !trans.includes('missing')) {
      return trans;
    }
  }

  return ATTIRE_DESCRIPTION_MAP[cleanId]?.[lang] || ATTIRE_DESCRIPTION_MAP[cleanId]?.en || '';
}

/**
 * Get localized question prompt
 */
export function getLocalizedPrompt(t) {
  if (t) {
    const trans = t('games.ubilakapki.questionPrompt');
    if (trans && !trans.includes('missing')) {
      return trans;
    }
  }
  return 'Who was holding the coconut at the end?';
}

/**
 * Get localized dignified praise or encouragement
 */
export function getLocalizedFeedback(isCorrect, t) {
  if (isCorrect) {
    const praises = [
      t ? t('games.ubilakapki.praise1') : null,
      t ? t('games.ubilakapki.praise2') : null,
      t ? t('games.ubilakapki.praise3') : null,
    ].filter(Boolean);
    const fallback = ['Well Remembered!', 'Wonderful memory!', 'Excellent observation!'];
    const pool = praises.length > 0 ? praises : fallback;
    return pool[Math.floor(Math.random() * pool.length)];
  } else {
    return (
      (t ? t('games.ubilakapki.gentleFeedback') : null) ||
      "That's okay. Let's try another round together."
    );
  }
}
