import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { DashboardStats, AttendanceEvent } from '../types';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Shield,
  FileSpreadsheet,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { t, isKhmer } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentActivity(res.recentActivity);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>{isKhmer ? 'ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល' : 'ADMINISTRATIVE CONSOLE'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.admin.dashboardTitle}
            </h1>
          </div>

          {/* Quick Sub-navigation buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/users"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4 text-brand-600" />
              <span>{t.admin.userManagement}</span>
            </Link>
            <Link
              to="/admin/locations"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t.admin.locationManagement}</span>
            </Link>
            <Link
              to="/admin/reports"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>{t.admin.reports}</span>
            </Link>
            <Link
              to="/system-qr"
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.nav.systemQr}</span>
            </Link>
          </div>
        </div>

        {/* 7 Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.totalUsers}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {loading ? '...' : stats?.totalUsers || 0}
            </p>
          </div>

          {/* Active Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.activeUsers}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
              {loading ? '...' : stats?.activeUsers || 0}
            </p>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.pendingApprovals}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
              {loading ? '...' : stats?.pendingApprovals || 0}
            </p>
          </div>

          {/* Suspended Accounts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.suspendedUsers}
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <UserX className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
              {loading ? '...' : stats?.suspendedUsers || 0}
            </p>
          </div>

          {/* Today's Check-ins */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.todayCheckIns}
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <LogIn className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-2">
              {loading ? '...' : stats?.todayCheckIns || 0}
            </p>
          </div>

          {/* Today's Check-outs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.todayCheckOuts}
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-2">
              {loading ? '...' : stats?.todayCheckOuts || 0}
            </p>
          </div>

          {/* Currently Open Sessions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.admin.openSessions}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-2">
              {loading ? '...' : stats?.currentlyOpenSessions || 0}
            </p>
          </div>
        </div>

        {/* Recent Attendance Activity Feed */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {t.admin.recentActivity}
            </h3>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
            >
              <span>{t.common.view} {t.admin.reports}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t.common.loading}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {isKhmer ? 'មិនទាន់មានសកម្មភាពថ្មីៗទេ' : 'No recent attendance activity'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">{t.history.eventType}</th>
                    <th className="py-3 px-4">{t.common.location}</th>
                    <th className="py-3 px-4">{t.common.time}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivity.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {isKhmer ? event.user?.nameKh || event.user?.nameEn : event.user?.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {event.user?.identifier} • {event.user?.faculty}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {event.eventType === 'CHECK_IN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                            Check-In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold">
                            Check-Out
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {isKhmer ? event.location.nameKh : event.location.nameEn}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
