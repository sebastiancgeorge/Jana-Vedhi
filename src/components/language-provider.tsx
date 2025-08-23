"use client";

import { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import { i18n } from 'i18next';
import { translateText, TranslateTextInputSchema, TranslateTextOutputSchema } from '@/ai/flows/translate-flow';

type Language = 'english' | 'malayalam';

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
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // This provider is now ready to be used.
    setReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Clear translations when language changes to force re-fetching
    if (lang === 'english') {
      setTranslations({});
    }
  };

  const translate = useCallback(async (key: string) => {
    if (language === 'english') {
      return key;
    }
    if (translations[key]) {
      return translations[key];
    }
    
    try {
      const response = await translateText({ text: key, targetLanguage: language });
      setTranslations(prev => ({...prev, [key]: response.translation}));
      return response.translation;
    } catch (error) {
      console.error("Translation error:", error);
      return key; // Fallback to key
    }
  }, [language, translations]);

  const value = { language, setLanguage, translate, translations, ready };

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
