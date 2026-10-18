import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import { Copy, Check } from 'lucide-react';

interface SystemQRCodeCardProps {
  url?: string;
  size?: number;
}

export const SystemQRCodeCard: React.FC<SystemQRCodeCardProps> = ({
  url = `${window.location.origin}/scan`,
  size = 280,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center text-center max-w-md mx-auto transition-all">
      {/* QR Code Container */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center relative group">
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/duc-logo.png',
            x: undefined,
            y: undefined,
            height: 48,
            width: 48,
            excavate: true,
          }}
        />
      </div>

      {/* Public URL Box */}
      <div className="mt-5 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-left">
        <div className="truncate mr-2">
          <p className="text-[10px] uppercase font-semibold text-slate-400">{t.systemQr.targetUrl}</p>
          <p className="text-xs font-mono text-slate-700 truncate">{url}</p>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className={`shrink-0 p-2 rounded-lg transition-colors flex items-center space-x-1 text-xs font-medium ${
            copied
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title={t.systemQr.copyLink}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {copied && (
        <p className="text-xs text-emerald-600 font-medium mt-1 animate-fade-in">
          {t.systemQr.linkCopied}
        </p>
      )}
    </div>
  );
};
