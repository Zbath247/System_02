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
  Sparkles,
} from 'lucide-react';

export const SystemQRCodePage: React.FC = () => {
  const { t, isKhmer } = useLanguage();

  const isCloud = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';

  const cloudPublicUrl = typeof window !== 'undefined' ? `${window.location.origin}/scan` : 'https://university-attendance-frontend.onrender.com/scan';

  const [lanUrl, setLanUrl] = useState<string>('');
  const [localhostUrl] = useState<string>('http://localhost:5173/scan');
  const [selectedMode, setSelectedMode] = useState<'cloud' | 'lan' | 'localhost' | 'custom'>(
    isCloud ? 'cloud' : 'lan'
  );
  const [customUrl, setCustomUrl] = useState<string>('');
  const [primaryIp, setPrimaryIp] = useState<string>('');

  useEffect(() => {
    api.getPublicConfig()
      .then((cfg) => {
        if (!isCloud && cfg?.lanAttendanceUrl) {
          setLanUrl(cfg.lanAttendanceUrl);
          setPrimaryIp(cfg.primaryIp || '');
        } else if (cfg?.publicAttendanceUrl) {
          setLanUrl(cfg.publicAttendanceUrl);
        }
      })
      .catch(() => {
        setLanUrl(`${window.location.origin}/scan`);
      });
  }, [isCloud]);

  const activeUrl =
    selectedMode === 'cloud'
      ? cloudPublicUrl
      : selectedMode === 'lan'
      ? lanUrl || cloudPublicUrl
      : selectedMode === 'localhost'
      ? localhostUrl
      : customUrl || cloudPublicUrl;

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
              <Globe className="w-4 h-4 text-brand-600" />
              <span>{isKhmer ? 'ជ្រើសរើសប្រភេទតំណភ្ជាប់សម្រាប់ QR Code:' : 'Target URL Mode for QR Code:'}</span>
            </span>
            {isCloud ? (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud Production</span>
              </span>
            ) : primaryIp ? (
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                Wi-Fi IP: {primaryIp}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Cloud Production Mode (Always recommended when online) */}
            {isCloud ? (
              <button
                type="button"
                onClick={() => setSelectedMode('cloud')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedMode === 'cloud'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold">
                    {isKhmer ? '🌐 លើ Cloud (ណែនាំបំផុត)' : '🌐 Cloud Live (Recommended)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {cloudPublicUrl}
                </p>
              </button>
            ) : (
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
            )}

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
                placeholder="https://university-attendance-frontend.onrender.com/scan"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Explanation Callout */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start space-x-3 text-emerald-950 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">
                {isKhmer ? 'QR Code ប្រព័ន្ធសាធារណៈ ២៤/៧ (Cloud Live):' : 'Cloud Public 24/7 QR Code:'}
              </p>
              <p className="mt-0.5 text-emerald-800">
                {isKhmer
                  ? `QR Code នេះភ្ជាប់ទៅកាន់ «${activeUrl}»។ សិស្ស និងបុគ្គលិកអាចយកទូរសព្ទណាក៏បាន (ប្រើ 4G, 5G ឬ Wi-Fi ពីគ្រប់ទីកន្លែង) មកស្កេនដើម្បី Check-in ឬចុះឈ្មោះបានភ្លាមៗ ដោយមិនបាច់បើកកុំព្យូទ័រ Admin ឡើយ!`
                  : `This QR code targets "${activeUrl}". Students and staff can scan from any mobile device (via 4G, 5G, or Wi-Fi globally) to Check-in or Register instantly!`}
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
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>
              {isKhmer
                ? 'QR Code នេះជា QR Code សាធារណៈតែមួយគត់ សម្រាប់បិទលើជញ្ជាំង ខ្លោងទ្វារ ឬតាមបន្ទប់រៀនក្នុងសាកលវិទ្យាល័យ។'
                : 'This is the single shared public QR code to be printed and displayed at university campus gates and buildings.'}
            </li>
            <li>
              {isKhmer
                ? 'ពេលស្កេនលើកទី១៖ ប្រព័ន្ធនឹងនាំទៅកាន់ទម្រង់ចុះឈ្មោះដោយស្វ័យប្រវត្តិ។'
                : 'First-time scan: Directly opens user registration form.'}
            </li>
            <li>
              {isKhmer
                ? 'ពេលស្កេនលើកទី២ឡើងទៅ៖ ប្រព័ន្ធនឹងនាំទៅកាន់ផ្ទាំង Check-in / Check-out ភ្លាមៗតែម្ដង។'
                : 'Second-time scan: Directly opens attendance check-in/out dashboard.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
