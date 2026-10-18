import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SystemQRCodeCard } from '../components/SystemQRCodeCard';
import { api } from '../services/api';
import {
  QrCode,
  Info,
  CheckCircle2,
  Smartphone,
  Laptop,
  Wifi,
  AlertTriangle,
  Globe,
} from 'lucide-react';

export const SystemQRCodePage: React.FC = () => {
  const { t, isKhmer } = useLanguage();

  const [lanUrl, setLanUrl] = useState<string>('');
  const [localhostUrl, setLocalhostUrl] = useState<string>('http://localhost:5173/scan');
  const [selectedMode, setSelectedMode] = useState<'lan' | 'localhost' | 'custom'>('lan');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [primaryIp, setPrimaryIp] = useState<string>('');

  useEffect(() => {
    api.getPublicConfig()
      .then((cfg) => {
        if (cfg?.lanAttendanceUrl) {
          setLanUrl(cfg.lanAttendanceUrl);
          setPrimaryIp(cfg.primaryIp || '');
        } else if (cfg?.publicAttendanceUrl) {
          setLanUrl(cfg.publicAttendanceUrl);
        }
      })
      .catch(() => {
        setLanUrl(`${window.location.origin}/scan`);
      });
  }, []);

  const activeUrl =
    selectedMode === 'lan'
      ? lanUrl || `${window.location.origin}/scan`
      : selectedMode === 'localhost'
      ? localhostUrl
      : customUrl || `${window.location.origin}/scan`;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
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

        {/* Network & Mobile Scan Mode Selector */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Wifi className="w-4 h-4 text-brand-600" />
              <span>{isKhmer ? 'ជ្រើសរើសប្រភេទតំណភ្ជាប់សម្រាប់ QR Code:' : 'Target Network IP Mode:'}</span>
            </span>
            {primaryIp && (
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                Wi-Fi IP: {primaryIp}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Wi-Fi IP Mode (Recommended for Mobile Phones) */}
            <button
              type="button"
              onClick={() => setSelectedMode('lan')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedMode === 'lan'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold">
                  {isKhmer ? 'ទូរស័ព្ទដៃ (Wi-Fi IP)' : 'Mobile Phone (Wi-Fi)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {lanUrl || 'Loading Wi-Fi IP...'}
              </p>
            </button>

            {/* Localhost Mode */}
            <button
              type="button"
              onClick={() => setSelectedMode('localhost')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedMode === 'localhost'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Laptop className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold">
                  {isKhmer ? 'កុំព្យូទ័រនេះ (Localhost)' : 'This PC (Localhost)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                http://localhost:5173/scan
              </p>
            </button>

            {/* Custom URL */}
            <button
              type="button"
              onClick={() => setSelectedMode('custom')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedMode === 'custom'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">
                  {isKhmer ? 'តំណភ្ជាប់ផ្ទាល់ខ្លួន' : 'Custom Domain/IP'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {customUrl || (isKhmer ? 'បញ្ចូល Domain របស់អ្នក' : 'Enter custom URL')}
              </p>
            </button>
          </div>

          {selectedMode === 'custom' && (
            <div className="pt-2 animate-fade-in">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://attendance.university.edu.kh/scan"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Important Explanation Callout */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">
                {isKhmer ? 'ហេតុអ្វីទូរស័ព្ទដៃស្កេន localhost មិនចូល?' : 'Why mobile phones cannot open localhost:'}
              </p>
              <p className="mt-0.5 text-amber-800">
                {isKhmer
                  ? `ពាក្យ "localhost" ដំណើរការតែនៅលើកុំព្យូទ័រនេះផ្ទាល់ប៉ុណ្ណោះ។ នៅពេលទូរស័ព្ទដៃស្កេន វានឹងស្វែងរកនៅលើម៉ាស៊ីនទូរស័ព្ទផ្ទាល់ (ដែលគ្មាន Server)។ ដូចនេះ សូមជ្រើសរើស "ទូរស័ព្ទដៃ (Wi-Fi IP: ${primaryIp || '172.20.10.3'})" ហើយប្រាកដថាទូរស័ព្ទ និងកុំព្យូទ័រភ្ជាប់ Wi-Fi តែមួយ!`
                  : `The term "localhost" only exists inside this laptop. When your phone scans a localhost QR code, it looks for the server inside the phone itself. Use the "Mobile Phone (Wi-Fi IP)" option instead and ensure both devices are on the same Wi-Fi!`}
              </p>
            </div>
          </div>
        </div>

        {/* Big Printable Card with Active URL */}
        <div className="print:shadow-none print:border-none">
          <SystemQRCodeCard url={activeUrl} size={280} showActions={true} />
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4 print:hidden">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Info className="w-4 h-4 text-brand-600" />
            <span>{isKhmer ? 'គោលការណ៍ QR Code រួម' : 'System QR Code Architecture'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                {isKhmer
                  ? 'QR Code នេះមានសុវត្ថិភាពខ្ពស់ គ្មានផ្ទុកលេខសម្ងាត់ ឬ Token ផ្ទាល់ខ្លួនឡើយ អាចបោះពុម្ពបិទនៅច្រកទ្វារបាន។'
                  : 'Contains NO personal IDs, passwords, PINs, or session tokens. Completely safe for public wall posters.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                {isKhmer
                  ? 'ការស្កេន QR Code គ្រាន់តែបើកគេហទំព័រប៉ុណ្ណោះ អ្នកប្រើត្រូវចុច Check-in ឬ Check-out លើទូរស័ព្ទដើម្បីកត់ត្រា។'
                  : 'Scanning alone only opens the portal. The student or staff member then confirms their Check-in / Check-out on their phone.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
