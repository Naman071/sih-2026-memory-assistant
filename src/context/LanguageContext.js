import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  t as i18nT,
  setLanguage as i18nSetLanguage,
  getLanguage,
  getDeviceLanguage,
  AVAILABLE_LANGUAGES,
} from '../i18n';

const STORAGE_KEY = '@app_language';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage() || 'en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadSavedLanguage() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          i18nSetLanguage(saved);
          setCurrentLanguage(saved);
        } else {
          const deviceLang = getDeviceLanguage();
          i18nSetLanguage(deviceLang);
          setCurrentLanguage(deviceLang);
        }
      } catch (err) {
        console.warn('Failed to load language from storage:', err);
      } finally {
        setIsReady(true);
      }
    }
    loadSavedLanguage();
  }, []);

  const changeLanguage = useCallback(async (lang) => {
    try {
      i18nSetLanguage(lang);
      setCurrentLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      console.warn('Failed to save language to storage:', err);
    }
  }, []);

  // Wrap t so it is bound to currentLanguage state for reactive re-renders
  const t = useCallback(
    (key, fallbackOrParams, maybeParams) => {
      return i18nT(key, fallbackOrParams, maybeParams);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
        languages: AVAILABLE_LANGUAGES,
        isReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;

