
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/language-provider';

export function useTranslation() {
  const { language, translate, translations, ready } = useLanguage();
  // This state is used to force a re-render when translations are updated.
  const [localTranslations, setLocalTranslations] = useState(translations);

  useEffect(() => {
    // When the global translations change (after a fetch), update the local state.
    setLocalTranslations(translations);
  }, [translations]);
  
  const t = useCallback((key: string, options?: { [key: string]: any }) => {
    if (!key || !ready) return '';

    let translatedText;

    if (language === 'english') {
      translatedText = key;
    } else {
      // Get translation from the local state (which is a copy of the global cache)
      translatedText = localTranslations[key] || key; // Fallback to key if not translated yet
      
      // If the translation isn't in the cache, trigger the fetch.
      // The component will re-render once the translation is available.
      if (!localTranslations[key]) {
        translate(key);
      }
    }
    
    // Handle placeholder replacements like {{count}}
    if (options) {
      Object.keys(options).forEach(optKey => {
        const regex = new RegExp(`{{${optKey}}}`, 'g');
        translatedText = translatedText.replace(regex, options[optKey]);
      });
    }

    return translatedText;

  }, [language, translate, localTranslations, ready]);

  return { t, ready, language };
}
