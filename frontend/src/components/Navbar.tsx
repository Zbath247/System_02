import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  CalendarCheck2,
  History,
  Shield,
  LogOut,
  Share2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/scan');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center min-w-0 pr-2">
            <Link to="/scan" className="flex items-center space-x-2 sm:space-x-3 group">
              <img
                src="/duc-logo.png"
                alt="Digital University of Cambodia"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-slate-900 leading-tight text-[11px] xs:text-xs sm:text-sm tracking-tight whitespace-nowrap">
                  {isKhmer ? 'សាកលវិទ្យាល័យ ឌីជីថលកម្ពុជា' : 'Digital University of Cambodia'}
                </span>
                <span className="text-[9.5px] sm:text-[11px] text-brand-700 font-semibold tracking-wide whitespace-nowrap">
                  {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងវត្តមាន (DUC)' : 'Attendance Management System (DUC)'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            {isAuthenticated && (
              <>
                <Link
                  to="/attendance"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/attendance')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck2 className="w-4 h-4" />
                  <span>{t.nav.attendance}</span>
                </Link>

                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/history')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>{t.nav.history}</span>
                </Link>
              </>
            )}

            <Link
              to="/system-qr"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/system-qr')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>{t.nav.systemQr}</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{t.nav.admin}</span>
              </Link>
            )}
          </div>

          {/* Right Action Section: Language Switcher (No hamburger menu) */}
          <div className="flex items-center space-x-2 shrink-0">
            <LanguageSwitcher />

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title={t.nav.logout}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
