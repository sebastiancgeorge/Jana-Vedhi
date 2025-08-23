"use client";

import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import en from '@/locales/en.json';
import ml from '@/locales/ml.json';

type Language = 'english' | 'malayalam';

const translations = {
  english: en,
  malayalam: ml,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: any }) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('english');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Component has mounted, so the provider is ready.
    setReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, options?: { [key:string]: any }) => {
    if (!ready) return '';
    
    const langKey = language as keyof typeof translations;
    let translation = translations[langKey][key as keyof typeof en] || key;

    // Handle placeholder replacements like {{count}}
    if (options) {
      Object.keys(options).forEach(optKey => {
        const regex = new RegExp(`{{${optKey}}}`, 'g');
        translation = translation.replace(regex, options[optKey]);
      });
    }

    return translation;
  };

  const value = { language, setLanguage, t, ready };

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
