"use client";

import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import ml from '@/locales/ml.json';
import { translateText } from '@/ai/flows/translate-text-flow';

type Language = 'english' | 'malayalam';

const translations = {
  english: en,
  malayalam: ml,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: any }) => string;
  translateDynamicText: (text: string) => Promise<string>;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple in-memory cache for dynamic translations
const translationCache = new Map<string, string>();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('malayalam');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Component has mounted, so the provider is ready.
    setReady(true);
  }, []);

  const setLanguage = (lang: Language) => {
    // Clear cache when language changes to fetch new translations
    if (lang !== language) {
        translationCache.clear();
    }
    setLanguageState(lang);
  };

  const t = (key: string, options?: { [key:string]: any }) => {
    if (!ready) return key; // Return key if not ready to prevent empty strings
    
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

  const translateDynamicText = useCallback(async (text: string): Promise<string> => {
    if (!ready || language === 'english' || !text) {
        return text;
    }
    
    const cacheKey = `${language}:${text}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    try {
        const result = await translateText({ text, targetLanguage: 'Malayalam' });
        const translatedText = result.translation;
        translationCache.set(cacheKey, translatedText);
        return translatedText;
    } catch (error) {
        console.error("Dynamic translation failed:", error);
        return text; // Fallback to original text on error
    }
  }, [language, ready]);


  const value = { language, setLanguage, t, translateDynamicText, ready };

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
