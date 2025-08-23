
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/language-provider';

// A cache to store translations to avoid re-fetching for the same key.
const translationCache = new Map<string, string>();

export function useTranslation() {
  const { language, translate, translations, ready } = useLanguage();
  const [, setForceRender] = useState(0);

  // When language changes, we need to force a re-render of components using the hook
  useEffect(() => {
    setForceRender(c => c + 1);
  }, [language, translations]);

  const t = useCallback((key: string, options?: { [key: string]: any }) => {
    if (!key) return '';

    const cacheKey = `${language}:${key}`;
    
    // If we are in english, just return the key.
    if (language === 'english') {
      let result = key;
       if (options) {
        Object.keys(options).forEach(optKey => {
          if(optKey === 'count') return;
          const regex = new RegExp(`{{${optKey}}}`, 'g');
          result = result.replace(regex, options[optKey]);
        });
      }
      return result;
    }

    // Check if the translation is already in the provider's state
    if (translations[key]) {
       let result = translations[key];
       if (options) {
        Object.keys(options).forEach(optKey => {
          if(optKey === 'count') return;
          const regex = new RegExp(`{{${optKey}}}`, 'g');
          result = result.replace(regex, options[optKey]);
        });
      }
      return result;
    }

    // If not, trigger translation but return the key for now.
    // The component will re-render once the translation is fetched and stored.
    translate(key);
    return key; // Return key as fallback

  }, [language, translate, translations]);

  return { t, ready, language };
}
