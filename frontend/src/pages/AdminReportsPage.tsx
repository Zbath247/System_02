import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { AttendanceEvent, Location } from '../types';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Search,
  LogIn,
  LogOut,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { t, isKhmer } = useLanguage();

  const [records, setRecords] = useState<AttendanceEvent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [faculty, setFaculty] = useState('');
  const [locationId, setLocationId] = useState('');
  const [eventType, setEventType] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFiltersAndData = async () => {
    setLoading(true);
    try {
      const [reportRes, locRes] = await Promise.all([
        api.getReports({
          page,
          limit: 20,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: search.trim() || undefined,
          category: category || undefined,
          faculty: faculty.trim() || undefined,
          locationId: locationId || undefined,
          eventType: eventType || undefined,
        }),
        api.getActiveLocations(),
      ]);

      if (reportRes.success) {
        setRecords(reportRes.records);
        setPage(reportRes.pagination.page);
        setTotalPages(reportRes.pagination.totalPages);
        setTotal(reportRes.pagination.total);
      }

      if (locRes.success) {
        setLocations(locRes.locations);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersAndData();
  }, [page, category, locationId, eventType]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFiltersAndData();
  };

  const handleExportCsv = () => {
    const exportUrl = api.getExportUrl({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search.trim() || undefined,
      category: category || undefined,
      faculty: faculty.trim() || undefined,
      locationId: locationId || undefined,
      eventType: eventType || undefined,
    });
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.reports.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.reports.totalRecords} <span className="font-bold text-slate-800">{total}</span>
              </p>
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.common.exportCsv}</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <form
          onSubmit={handleApplyFilters}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t.reports.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t.reports.endDate}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t.reports.filterByCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="">{t.common.all}</option>
                <option value="STUDENT">{t.roles.STUDENT}</option>
                <option value="TEACHER">{t.roles.TEACHER}</option>
                <option value="STAFF">{t.roles.STAFF}</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                {t.reports.filterByLocation}
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="">{t.common.all}</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {isKhmer ? loc.nameKh : loc.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 text-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isKhmer ? 'ស្វែងរកតាម ID ឬឈ្មោះ...' : 'Search by ID or name...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors w-full sm:w-auto"
              >
                {t.common.filter}
              </button>
            </div>
          </div>
        </form>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">{t.common.loading}</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {isKhmer ? 'មិនមានកំណត់ត្រាវត្តមានតាមលក្ខខណ្ឌនេះទេ' : 'No records found matching filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">User / ID</th>
                    <th className="py-3.5 px-4 sm:px-6">Faculty</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.history.eventType}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.common.location}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.common.time}</th>
                    <th className="py-3.5 px-4 sm:px-6">{t.attendance.duration}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {isKhmer ? r.user?.nameKh || r.user?.nameEn : r.user?.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.user?.identifier} • {r.user?.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 text-xs">
                        {r.user?.faculty}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        {r.eventType === 'CHECK_IN' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Check-In</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200/60">
                            <LogOut className="w-3.5 h-3.5 text-sky-600" />
                            <span>Check-Out</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-800 font-medium">
                        {isKhmer ? r.location.nameKh : r.location.nameEn}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-mono text-xs">
                        <div>
                          {new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-700 font-medium">
                        {r.durationMinutes !== null && r.durationMinutes !== undefined ? (
                          <span className="font-bold">{r.durationMinutes} min</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
