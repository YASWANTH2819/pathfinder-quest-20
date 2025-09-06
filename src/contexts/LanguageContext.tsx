import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'pf_lang';

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for a specific language
  const loadTranslations = async (lang: Language) => {
    try {
      const response = await import(`../i18n/${lang}.json`);
      return response.default;
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if translation fails
      if (lang !== 'en') {
        const fallback = await import(`../i18n/en.json`);
        return fallback.default;
      }
      return {};
    }
  };

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
      const browserLang = navigator.language;
      
      let initialLang: Language = 'en';
      
      if (savedLang && ['en', 'hi', 'te'].includes(savedLang)) {
        initialLang = savedLang;
      } else if (browserLang.startsWith('hi')) {
        initialLang = 'hi';
      } else if (browserLang.startsWith('te')) {
        initialLang = 'te';
      }

      const translationData = await loadTranslations(initialLang);
      setTranslations(translationData);
      setLanguageState(initialLang);
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  // Set new language and load its translations
  const setLanguage = async (lang: Language) => {
    setIsLoading(true);
    try {
      const translationData = await loadTranslations(lang);
      setTranslations(translationData);
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      
      // Update document language attribute
      document.documentElement.lang = lang;
      
      // Dispatch custom event for language change
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return the key itself if translation not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};