import { useState, useEffect } from 'react';
import { Language, TranslationData } from '@/types';

// Import translation data
import translationsData from '@/data/translations.json';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const translations = translationsData as TranslationData;

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('pathfinder_language') as Language;
    if (savedLanguage && ['en', 'hi', 'te'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('pathfinder_language', language);
  };

  // Get translation by key path (e.g., 'dashboard.title')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
      { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
    ] as const
  };
};