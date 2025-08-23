import { useLanguage } from '@/components/language-provider';

export function useTranslation() {
  const { t, ready, language } = useLanguage();
  return { t, ready, language };
}
