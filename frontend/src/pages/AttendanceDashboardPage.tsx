import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Location, AttendanceEvent } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  AlertCircle,
  FileText,
  History,
  Building2,
  Sparkles,
} from 'lucide-react';

export const AttendanceDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, isKhmer } = useLanguage();

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [note, setNote] = useState('');

  const [currentStatus, setCurrentStatus] = useState<'CHECKED_IN' | 'CHECKED_OUT' | 'NO_RECORD'>('NO_RECORD');
  const [latestEvent, setLatestEvent] = useState<AttendanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; duration?: number } | null>(null);

  // Confirmation Modals
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: 'CHECK_IN' | 'CHECK_OUT';
  }>({ open: false, action: 'CHECK_IN' });

  const fetchStatusAndLocations = async () => {
    try {
      const [statusRes, locRes] = await Promise.all([
        api.getMeStatus(),
        api.getActiveLocations(),
      ]);

      if (statusRes.success) {
        setCurrentStatus(statusRes.currentStatus);
        setLatestEvent(statusRes.latestEvent);
      }

      if (locRes.success && locRes.locations) {
        setLocations(locRes.locations);
        if (locRes.locations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(locRes.locations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndLocations();
  }, []);

  const handleActionClick = (action: 'CHECK_IN' | 'CHECK_OUT') => {
    setFeedback(null);
    if (!selectedLocationId) {
      setFeedback({
        type: 'error',
        message: isKhmer ? 'សូមជ្រើសរើសទីតាំងវត្តមាន' : 'Please select a location.',
      });
      return;
    }
    setConfirmModal({ open: true, action });
  };

  const handleConfirmSubmit = async () => {
    setActionLoading(true);
    setFeedback(null);

    const idempotencyKey = `att_${user?.id}_${Date.now()}`;

    try {
      if (confirmModal.action === 'CHECK_IN') {
        const res = await api.checkIn({
          locationId: selectedLocationId,
          note: note.trim() || undefined,
          idempotencyKey,
        });

        setFeedback({
          type: 'success',
          message: isKhmer && res.messageKh ? res.messageKh : res.message,
        });
        setCurrentStatus('CHECKED_IN');
        setLatestEvent(res.attendance);
        setNote('');
      } else {
        const res = await api.checkOut({
          locationId: selectedLocationId,
          note: note.trim() || undefined,
          idempotencyKey,
        });

        setFeedback({
          type: 'success',
          message: isKhmer && res.messageKh ? res.messageKh : res.message,
          duration: res.durationMinutes,
        });
        setCurrentStatus('CHECKED_OUT');
        setLatestEvent(res.attendance);
        setNote('');
      }
    } catch (err: any) {
      console.error('Attendance action failed:', err);
      const msg = isKhmer && err.data?.messageKh ? err.data.messageKh : err.message;
      setFeedback({
        type: 'error',
        message: msg || (isKhmer ? 'ប្រតិបត្តិការបានបរាជ័យ' : 'Action failed'),
      });
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, action: 'CHECK_IN' });
    }
  };

  // Format today's local date
  const todayDateStr = new Intl.DateTimeFormat(isKhmer ? 'km-KH' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const selectedLoc = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* User Identity Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-500/20">
                {user?.nameEn?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                  {user?.category ? t.roles[user.category as keyof typeof t.roles] : ''}
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isKhmer ? user?.nameKh || user?.nameEn : user?.nameEn || user?.nameKh}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {t.attendance.idLabel} <span className="font-bold text-slate-700">{user?.identifier}</span> • {user?.faculty}
                </p>
              </div>
            </div>

            {/* Date Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium self-start sm:self-auto">
              <CalendarCheck className="w-4 h-4 text-brand-600" />
              <span>{todayDateStr}</span>
            </div>
          </div>
        </div>

        {/* Current Attendance Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                {t.attendance.statusLabel}
              </p>
              <div className="mt-1 flex items-center space-x-2.5">
                {currentStatus === 'CHECKED_IN' ? (
                  <>
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                      {t.attendance.statusCheckedIn}
                    </span>
                  </>
                ) : currentStatus === 'CHECKED_OUT' ? (
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                    {t.attendance.statusCheckedOut}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {t.attendance.statusNoRecord}
                  </span>
                )}
              </div>
            </div>

            {/* Latest Event Info */}
            {latestEvent && (
              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 font-medium">{t.attendance.latestEvent}</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {isKhmer ? latestEvent.location.nameKh : latestEvent.location.nameEn}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  {new Date(latestEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`mt-6 p-4 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{feedback.message}</p>
                {feedback.duration !== undefined && (
                  <p className="mt-1 font-medium text-emerald-700">
                    {t.attendance.duration} <span className="font-bold">{feedback.duration} {t.attendance.minutes}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Attendance Action Form */}
          <div className="mt-6 space-y-5">
            {/* Location Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t.attendance.selectLocation} *
              </label>
              <div className="relative">
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 text-sm font-medium focus:outline-hidden bg-white appearance-none pr-10 cursor-pointer shadow-xs"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {isKhmer ? loc.nameKh : loc.nameEn} ({loc.category})
                      {loc.openTime ? ` • ${loc.openTime}-${loc.closeTime}` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                {t.attendance.optionalNote}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isKhmer ? 'ឧ. ចូលរៀនម៉ោង ៨:០០ ឬ ជួបសាស្ត្រាចារ្យ' : 'e.g. Attending morning lab lecture'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm focus:outline-hidden bg-white"
              />
            </div>

            {/* Prominent Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Check-In Button */}
              <button
                type="button"
                disabled={actionLoading || currentStatus === 'CHECKED_IN'}
                onClick={() => handleActionClick('CHECK_IN')}
                className={`group py-4 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2.5 ${
                  currentStatus === 'CHECKED_IN'
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 active:scale-98'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>{t.attendance.checkInBtn}</span>
              </button>

              {/* Check-Out Button */}
              <button
                type="button"
                disabled={actionLoading || currentStatus !== 'CHECKED_IN'}
                onClick={() => handleActionClick('CHECK_OUT')}
                className={`group py-4 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2.5 ${
                  currentStatus !== 'CHECKED_IN'
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-98'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>{t.attendance.checkOutBtn}</span>
              </button>
            </div>

            {currentStatus === 'CHECKED_IN' && (
              <p className="text-xs text-amber-600 text-center font-medium">
                {t.attendance.consecutiveWarning}
              </p>
            )}
          </div>
        </div>

        {/* Quick Link to Personal Attendance History */}
        <div className="flex justify-center items-center px-4">
          <Link
            to="/history"
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <History className="w-4 h-4" />
            <span>{t.history.title} &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        title={
          confirmModal.action === 'CHECK_IN'
            ? t.attendance.confirmCheckInTitle
            : t.attendance.confirmCheckOutTitle
        }
        message={
          confirmModal.action === 'CHECK_IN'
            ? `${t.attendance.confirmCheckInText} (${isKhmer ? selectedLoc?.nameKh : selectedLoc?.nameEn})`
            : `${t.attendance.confirmCheckOutText} (${isKhmer ? selectedLoc?.nameKh : selectedLoc?.nameEn})`
        }
        confirmLabel={
          confirmModal.action === 'CHECK_IN'
            ? t.attendance.checkInBtn
            : t.attendance.checkOutBtn
        }
        isLoading={actionLoading}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmModal({ open: false, action: 'CHECK_IN' })}
      />
    </div>
  );
};
