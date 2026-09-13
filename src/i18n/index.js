import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from '../translations/en.json';
import as from '../translations/as.json';
import bn from '../translations/bn.json';
import hi from '../translations/hi.json';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া', flag: '🌿' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🌸' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
];

const translations = {
  en,
  as,
  bn,
  hi,
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function getDeviceLanguage() {
  try {
    const locales = Localization.getLocales ? Localization.getLocales() : [];
    if (locales && locales.length > 0 && locales[0].languageCode) {
      const code = locales[0].languageCode.toLowerCase();
      if (translations[code]) {
        return code;
      }
    }
  } catch (e) {
    console.warn('Failed to detect device language:', e);
  }
  return 'en';
}

// Initial locale setup
i18n.locale = getDeviceLanguage();

export function setLanguage(lang) {
  if (translations[lang]) {
    i18n.locale = lang;
    return lang;
  }
  i18n.locale = 'en';
  return 'en';
}

export function getLanguage() {
  return i18n.locale || 'en';
}

export function getAvailableLanguages() {
  return AVAILABLE_LANGUAGES;
}

/**
 * Humanizes a dotted key into a readable string
 * e.g. "common.selectLanguage" -> "Select Language"
 */
function humanizeKey(key) {
  if (!key || typeof key !== 'string') return '';
  const lastPart = key.split('.').pop() || '';
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Interpolates %{var} templates within a string
 */
function interpolate(template, params = {}) {
  if (typeof template !== 'string' || !params || typeof params !== 'object') {
    return template;
  }
  let result = template;
  for (const [pKey, pVal] of Object.entries(params)) {
    result = result.replace(new RegExp(`%\\{${pKey}\\}`, 'g'), String(pVal));
  }
  return result;
}

/**
 * Robust translation helper:
 * Supports:
 * - t('key')
 * - t('key', { name: 'Maya' })
 * - t('key', 'Default Fallback')
 * - t('key', 'Default Fallback', { count: 3 })
 *
 * Guarantees that raw keys (e.g. "common.*", "commom.*") are NEVER shown.
 */
export function t(key, fallbackOrParams, maybeParams) {
  if (!key || typeof key !== 'string') return '';

  // Correct common typos such as "commom."
  let normalizedKey = key;
  if (normalizedKey.startsWith('commom.')) {
    normalizedKey = 'common.' + normalizedKey.slice(7);
  }

  // Parse arguments
  let fallbackString = null;
  let params = {};

  if (typeof fallbackOrParams === 'string') {
    fallbackString = fallbackOrParams;
    if (typeof maybeParams === 'object' && maybeParams !== null) {
      params = maybeParams;
    }
  } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
    params = fallbackOrParams;
  }

  try {
    // 1. Try resolving in current locale via i18n-js
    const result = i18n.t(normalizedKey, params);
    if (typeof result === 'string' && !result.startsWith('[missing') && result !== normalizedKey) {
      return result;
    }
    if (typeof result === 'object' && result !== null && typeof result.title === 'string') {
      return result.title;
    }

    // 2. Try resolving in English dictionary
    const keyParts = normalizedKey.split('.');
    let enVal = en;
    for (const part of keyParts) {
      if (enVal && typeof enVal === 'object' && part in enVal) {
        enVal = enVal[part];
      } else {
        enVal = null;
        break;
      }
    }
    if (typeof enVal === 'string') {
      return interpolate(enVal, params);
    }
    if (typeof enVal === 'object' && enVal !== null && typeof enVal.title === 'string') {
      return interpolate(enVal.title, params);
    }

    // 3. Use explicitly provided fallback string
    if (typeof fallbackString === 'string' && fallbackString.trim().length > 0) {
      return interpolate(fallbackString, params);
    }

    // 4. Humanize key rather than displaying raw key
    return humanizeKey(normalizedKey);
  } catch (err) {
    if (typeof fallbackString === 'string' && fallbackString.trim().length > 0) {
      return fallbackString;
    }
    return humanizeKey(normalizedKey);
  }
}

export { i18n };
export default i18n;
