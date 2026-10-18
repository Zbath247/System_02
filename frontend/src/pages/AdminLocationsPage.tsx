import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { Location } from '../types';
import {
  MapPin,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Check,
  X,
} from 'lucide-react';

export const AdminLocationsPage: React.FC = () => {
  const { t, isKhmer } = useLanguage();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    nameKh: '',
    nameEn: '',
    description: '',
    category: 'CAMPUS',
    canCheckIn: true,
    canCheckOut: true,
    isActive: true,
    openTime: '06:00',
    closeTime: '22:00',
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminLocations();
      if (res.success) {
        setLocations(res.locations);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({
      code: '',
      nameKh: '',
      nameEn: '',
      description: '',
      category: 'CAMPUS',
      canCheckIn: true,
      canCheckOut: true,
      isActive: true,
      openTime: '06:00',
      closeTime: '22:00',
    });
    setModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormData({
      code: loc.code,
      nameKh: loc.nameKh,
      nameEn: loc.nameEn,
      description: loc.description || '',
      category: loc.category,
      canCheckIn: loc.canCheckIn,
      canCheckOut: loc.canCheckOut,
      isActive: loc.isActive,
      openTime: loc.openTime || '',
      closeTime: loc.closeTime || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await api.updateLocation(editingLocation.id, formData);
      } else {
        await api.createLocation(formData);
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      alert(err.message || 'Error saving location');
    }
  };

  const handleToggleActive = async (loc: Location) => {
    try {
      await api.updateLocation(loc.id, { isActive: !loc.isActive });
      fetchLocations();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t.admin.locationManagement}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKhmer
                  ? `ទីតាំងសរុប៖ ${locations.length} កន្លែង`
                  : `Total configured locations: ${locations.length}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.location.addTitle}</span>
          </button>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`bg-white rounded-3xl p-6 border shadow-2xs transition-all relative flex flex-col justify-between ${
                loc.isActive ? 'border-slate-200/80' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700">
                    {loc.code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      loc.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {loc.isActive ? t.common.active : t.common.inactive}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">
                  {isKhmer ? loc.nameKh : loc.nameEn}
                </h3>
                <p className="text-xs text-slate-500">
                  {isKhmer ? loc.nameEn : loc.nameKh}
                </p>

                {loc.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {loc.description}
                  </p>
                )}

                {/* Badges for rules */}
                <div className="flex flex-wrap gap-2 mt-4 text-[11px]">
                  <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                    {loc.category}
                  </span>
                  {loc.canCheckIn && (
                    <span className="px-2 py-1 rounded-md bg-teal-50 text-teal-700 font-semibold">
                      Check-In Allowed
                    </span>
                  )}
                  {loc.canCheckOut && (
                    <span className="px-2 py-1 rounded-md bg-sky-50 text-sky-700 font-semibold">
                      Check-Out Allowed
                    </span>
                  )}
                  {loc.openTime && loc.closeTime && (
                    <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-mono font-semibold flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{loc.openTime} - {loc.closeTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => openEditModal(loc)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t.common.edit}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    loc.isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {loc.isActive ? t.admin.suspend : t.admin.reactivate}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 p-6 sm:p-8 animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingLocation ? t.location.editTitle : t.location.addTitle}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.code} *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled={!!editingLocation}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="LOC-GATE-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white disabled:bg-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.category} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="CAMPUS">CAMPUS</option>
                    <option value="BUILDING">BUILDING</option>
                    <option value="HALL">HALL</option>
                    <option value="ROOM">ROOM</option>
                    <option value="LAB">LAB</option>
                    <option value="GATE">GATE</option>
                    <option value="LIBRARY">LIBRARY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.nameKh} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameKh}
                    onChange={(e) => setFormData({ ...formData, nameKh: e.target.value })}
                    placeholder="ច្រកទ្វារធំ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.nameEn} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Main Gate"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Building C entrance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>

              {/* Operating hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.openTime}
                  </label>
                  <input
                    type="text"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    placeholder="07:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    {t.location.closeTime}
                  </label>
                  <input
                    type="text"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    placeholder="21:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canCheckIn}
                    onChange={(e) => setFormData({ ...formData, canCheckIn: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t.location.allowCheckIn}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canCheckOut}
                    onChange={(e) => setFormData({ ...formData, canCheckOut: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>{t.location.allowCheckOut}</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 text-xs font-bold text-white hover:bg-brand-700 shadow-sm"
                >
                  {t.location.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
