import React, { createContext, useContext, useState, useEffect } from 'react';
import { km } from '../locales/km';
import { en } from '../locales/en';

type Language = 'km' | 'en';
type Translations = typeof km;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isKhmer: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('uni_app_lang');
    return (saved === 'en' ? 'en' : 'km') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('uni_app_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = language === 'km' ? km : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isKhmer: language === 'km' }}>
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
