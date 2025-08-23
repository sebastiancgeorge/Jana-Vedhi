import { useLanguage } from '@/components/language-provider';

export function useTranslation() {
  const { t, ready, language, translateDynamicText } = useLanguage();
  return { t, ready, language, translateDynamicText };
}
