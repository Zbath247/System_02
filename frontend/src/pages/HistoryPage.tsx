import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { AttendanceEvent } from '../types';
import {
  History as HistoryIcon,
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t, isKhmer } = useLanguage();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.getMyHistory(pageNum, 10);
      if (res.success) {
        setEvents(res.events);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.history.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKhmer
                  ? `ចំនួនកំណត់ត្រាសរុប៖ ${total} ព្រឹត្តិការណ៍`
                  : `Total records: ${total} attendance events`}
              </p>
            </div>
          </div>
        </div>

        {/* History Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {t.common.loading}
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium">{t.history.empty}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">{t.history.eventType}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.common.location}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.common.time}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.attendance.duration}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.common.note}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => {
                    const isCheckIn = event.eventType === 'CHECK_IN';
                    const dateObj = new Date(event.timestamp);

                    return (
                      <tr key={event.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">
                          {isCheckIn ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t.history.checkIn}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
                              <LogOut className="w-3.5 h-3.5 text-sky-600" />
                              <span>{t.history.checkOut}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 font-medium text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>
                              {isKhmer ? event.location.nameKh : event.location.nameEn}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-mono text-xs">
                          <div>
                            {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-medium">
                          {event.durationMinutes !== null && event.durationMinutes !== undefined ? (
                            <span className="inline-flex items-center space-x-1 text-slate-700 font-bold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{event.durationMinutes} {t.attendance.minutes}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-slate-500 max-w-xs truncate text-xs">
                          {event.note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-800">{page}</span> of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
