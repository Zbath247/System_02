import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Shield, AlertCircle, ArrowRight, Lock, User } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { refreshSession } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage(
        isKhmer
          ? 'សូមបញ្ចូលអត្តលេខ/អ៊ីមែល និងពាក្យសម្ងាត់'
          : 'Please enter your ID/email and password.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.adminLogin({ identifier: identifier.trim(), password });
      await refreshSession();
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      const msg = isKhmer && err.data?.messageKh ? err.data.messageKh : err.message;
      setErrorMessage(msg || (isKhmer ? 'ការចូលប្រើប្រាស់បានបរាជ័យ' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700/80 p-6 sm:p-10 text-white">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {t.admin.loginTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {t.admin.loginSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-rose-300 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.admin.identifierOrEmail}
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ADMIN001 or admin@university.edu.kh"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder-slate-500 focus:border-amber-400 text-sm focus:outline-hidden transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {t.admin.password}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder-slate-500 focus:border-amber-400 text-sm focus:outline-hidden transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? t.common.loading : t.admin.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Credentials hint */}
        <div className="mt-8 p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-2xl text-[11px] text-slate-400 text-center">
          <p className="font-semibold text-slate-300 mb-1">
            {isKhmer ? 'គណនីអភិបាល (Admin Credentials):' : 'Admin Credentials:'}
          </p>
          <p className="font-mono text-amber-400 font-bold">admin / admin@123</p>
        </div>
      </div>
    </div>
  );
};
