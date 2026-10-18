import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="shrink-0">
      {/* Mobile compact toggle: tap to switch language without taking up screen width */}
      <button
        type="button"
        onClick={() => setLanguage(language === 'km' ? 'en' : 'km')}
        className="sm:hidden inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-2xs"
        title="ប្តូរភាសា / Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="text-[11px] font-bold text-slate-800">
          {language === 'km' ? 'ខ្មែរ' : 'EN'}
        </span>
      </button>

      {/* Desktop full switcher */}
      <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <Globe className="w-4 h-4 text-slate-500 ml-1.5" />
        <button
          type="button"
          onClick={() => setLanguage('km')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
            language === 'km'
              ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ភាសាខ្មែរ
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
            language === 'en'
              ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
};
