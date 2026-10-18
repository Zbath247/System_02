import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SystemQRCodeCard } from '../components/SystemQRCodeCard';
import { QrCode } from 'lucide-react';

export const SystemQRCodePage: React.FC = () => {
  const { t } = useLanguage();

  // Automatically use the current origin /scan (works seamlessly on Render and localhost)
  const activeUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/scan`
      : 'https://university-attendance-frontend.onrender.com/scan';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center print:hidden">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.systemQr.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            {t.systemQr.instruction}
          </p>
        </div>

        {/* Big Printable Card with Active URL */}
        <div className="print:shadow-none print:border-none">
          <SystemQRCodeCard url={activeUrl} size={300} showActions={true} />
        </div>
      </div>
    </div>
  );
};
