"use client";

import { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import { translateText } from '@/ai/flows/translate-flow';

type Language = 'english' | 'malayalam';

// This will hold our translations in memory
const translationsCache: Record<string, Record<string, string>> = {
  english: {},
  malayalam: {},
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string) => Promise<string>;
  translations: Record<string, string>;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('english');
  const [translations, setTranslations] = useState<Record<string, string>>(translationsCache[language]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Component has mounted, so the provider is ready.
    setReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // When language changes, update the translations from our cache.
    setTranslations(translationsCache[lang] || {});
  };

  const translate = useCallback(async (key: string) => {
    // English is the default, so the key is the translation.
    if (language === 'english') {
      return key;
    }
    
    // If we already have the translation in our cache, return it.
    if (translationsCache[language]?.[key]) {
      return translationsCache[language][key];
    }
    
    // If not, fetch it from the AI.
    try {
      const response = await translateText({ text: key, targetLanguage: language });
      const translation = response.translation;

      // Store the new translation in our cache.
      if (!translationsCache[language]) {
        translationsCache[language] = {};
      }
      translationsCache[language][key] = translation;
      
      // Update the state to trigger a re-render in components using the hook.
      setTranslations(prev => ({...prev, [key]: translation}));

      return translation;
    } catch (error) {
      console.error("Translation error:", error);
      return key; // Fallback to the original key on error.
    }
  }, [language]);

  const value = { language, setLanguage, translate, translations: translationsCache[language], ready };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
