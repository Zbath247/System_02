import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  QrCode,
  CalendarCheck2,
  History,
  Shield,
  LogOut,
  Menu,
  X,
  UserCheck,
  Share2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/scan');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/scan" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-tight text-sm sm:text-base tracking-tight">
                  {isKhmer ? 'ប្រព័ន្ធគ្រប់គ្រងវត្តមាន' : 'University Attendance'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  {isKhmer ? 'សាកលវិទ្យាល័យជាតិ' : 'National University System'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
            <Link
              to="/scan"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/scan')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t.nav.home}</span>
            </Link>

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

          {/* Right Action Section */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {user?.nameEn?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 truncate max-w-[120px]">
                      {isKhmer ? user?.nameKh || user?.nameEn : user?.nameEn || user?.nameKh}
                    </p>
                    <p className="text-slate-500 font-mono text-[10px]">{user?.identifier}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <Link
                  to="/identify"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {t.landing.identifyBtn}
                </Link>
                <Link
                  to="/admin/login"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {user?.nameEn?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {isKhmer ? user?.nameKh : user?.nameEn}
                </p>
                <p className="text-xs text-slate-500 font-mono">{user?.identifier} • {user?.category}</p>
              </div>
            </div>
          )}

          <Link
            to="/scan"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            {t.nav.home}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/attendance"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t.nav.attendance}
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t.nav.history}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/identify"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t.landing.identifyBtn}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-brand-700 hover:bg-brand-50"
              >
                {t.register.title}
              </Link>
            </>
          )}

          <Link
            to="/system-qr"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            {t.nav.systemQr}
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
            >
              {t.nav.admin}
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.nav.logout}</span>
            </button>
          ) : (
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-100"
            >
              {t.admin.loginTitle}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
