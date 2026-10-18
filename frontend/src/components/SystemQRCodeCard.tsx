import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import { Download, Printer, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface SystemQRCodeCardProps {
  url?: string;
  size?: number;
  showActions?: boolean;
}

export const SystemQRCodeCard: React.FC<SystemQRCodeCardProps> = ({
  url = `${window.location.origin}/scan`,
  size = 240,
  showActions = true,
}) => {
  const { t, isKhmer } = useLanguage();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDownloadPng = () => {
    const svgElement = cardRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'university_attendance_system_qr.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-100 flex flex-col items-center text-center max-w-md mx-auto transition-all"
    >
      {/* Header Tag */}
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4">
        <QrCode className="w-3.5 h-3.5" />
        <span>{isKhmer ? 'QR CODE រួមសម្រាប់គ្រប់គ្នា' : 'ONE SHARED SYSTEM QR CODE'}</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        {t.systemQr.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm">
        {t.systemQr.subtitle}
      </p>

      {/* QR Code Container */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center relative group">
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '/favicon.svg',
            x: undefined,
            y: undefined,
            height: 38,
            width: 38,
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

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.systemQr.downloadPng}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.systemQr.printQr}</span>
          </button>
        </div>
      )}
    </div>
  );
};
