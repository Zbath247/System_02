import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
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
  );
};
