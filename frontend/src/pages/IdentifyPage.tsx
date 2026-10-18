import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  UserCheck,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react';

export const IdentifyPage: React.FC = () => {
  const { refreshSession } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !name.trim()) {
      setErrorMessage(
        isKhmer
          ? 'សូមបញ្ចូលអត្តលេខ ID និងឈ្មោះពេញរបស់អ្នក'
          : 'Please enter both your Student/Staff ID and Full Name.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.identify({ identifier: identifier.trim(), name: name.trim() });
      await refreshSession();
      navigate('/attendance');
    } catch (err: any) {
      console.error('Identification failed:', err);
      const msg = isKhmer && err.data?.messageKh ? err.data.messageKh : err.message;
      setErrorMessage(msg || (isKhmer ? 'ការផ្ទៀងផ្ទាត់មិនជោគជ័យ' : 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.identify.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {t.identify.subtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.identify.identifier} *
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t.identify.identifierPlaceholder}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm font-mono focus:outline-hidden transition-colors bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.identify.fullName} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.identify.fullNamePlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm focus:outline-hidden transition-colors bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isKhmer
                ? 'អាចបញ្ចូលជាឈ្មោះខ្មែរ (ឧ. សុខ សុវណ្ណ) ឬឈ្មោះអង់គ្លេស (ឧ. Sok Sovann)'
                : 'Enter registered Khmer name or English name.'}
            </p>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Link
              to="/scan"
              className="px-4 py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t.identify.cancelBtn}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? t.common.loading : t.identify.verifyBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Security & Rate Limiting Notice */}
        <div className="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-start space-x-2 text-slate-600 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>{t.identify.securityNotice}</p>
          </div>
          <div className="flex items-start space-x-2 text-slate-500 text-[11px] leading-relaxed">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>{t.identify.limitNotice}</p>
          </div>
        </div>

        {/* First time registration link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            {isKhmer ? 'មិនទាន់មានគណនីមែនទេ?' : "Don't have an account yet?"}{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-800">
              {t.register.title}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
