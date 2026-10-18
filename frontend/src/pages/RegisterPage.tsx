import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  UserPlus,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  Phone,
  Send,
  GraduationCap,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { refreshSession } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '',
    nameKh: '',
    nameEn: '',
    gender: 'ប្រុស',
    building: '',
    faculty: '',
    classGroup: '',
    phone: '',
    telegram: '',
    category: 'STUDENT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = isKhmer ? 'សូមបញ្ចូល ID' : 'ID is required';
    }
    if (!formData.nameKh.trim()) {
      newErrors.nameKh = isKhmer ? 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ' : 'Khmer name is required';
    }
    if (!formData.nameEn.trim()) {
      newErrors.nameEn = isKhmer ? 'សូមបញ្ចូល Name ជាភាសាអង់គ្លេស' : 'English name is required';
    }
    if (!formData.faculty.trim()) {
      newErrors.faculty = isKhmer ? 'សូមបញ្ចូលដេប៉ាតឺម៉ង់' : 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.register(formData);

      if (res.isPending) {
        setPendingApproval(true);
      } else {
        await refreshSession();
        navigate('/attendance');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      const msg = isKhmer && err.data?.messageKh ? err.data.messageKh : err.message;
      setServerError(msg || (isKhmer ? 'ការចុះឈ្មោះបានបរាជ័យ' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 text-center animate-scale-up">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isKhmer ? 'គណនីកំពុងរង់ចាំការអនុម័ត' : 'Account Pending Approval'}
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {isKhmer
              ? 'ការចុះឈ្មោះរបស់អ្នកទទួលបានជោគជ័យ! ដោយសារគោលការណ៍សុវត្ថិភាព គណនីរបស់អ្នកត្រូវឆ្លងកាត់ការអនុម័តពីរដ្ឋបាលសាកលវិទ្យាល័យ មុនពេលអាចកត់ត្រាវត្តមានបាន។'
              : 'Your registration has been submitted. According to university policy, your account requires administrative approval before you can record attendance.'}
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center justify-center space-x-2 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            <span>{t.nav.home}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.register.title}
          </h2>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.register.category}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'STUDENT', label: t.roles.STUDENT },
                { value: 'TEACHER', label: t.roles.TEACHER },
                { value: 'STAFF', label: t.roles.STAFF },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    formData.category === cat.value
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              ID *
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder="ឧ. DUC2024-0417"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden transition-colors ${
                errors.identifier
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                  : 'border-slate-200 focus:border-brand-500 bg-white'
              }`}
            />
            {errors.identifier && (
              <p className="text-xs text-rose-600 mt-1">{errors.identifier}</p>
            )}
          </div>

          {/* 2. ឈ្មោះ (ភាសាខ្មែរ) & 3. Name (ឡាតាំង) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'ឈ្មោះ' : 'Name (Khmer)'} *
              </label>
              <input
                type="text"
                value={formData.nameKh}
                onChange={(e) => setFormData({ ...formData, nameKh: e.target.value })}
                placeholder="ឧ. ម៉ុក សម្បត្តិ"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-colors ${
                  errors.nameKh
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500 bg-white'
                }`}
              />
              {errors.nameKh && (
                <p className="text-xs text-rose-600 mt-1">{errors.nameKh}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Name (English) *
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="ex. MOK SAMBATH"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-colors ${
                  errors.nameEn
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500 bg-white'
                }`}
              />
              {errors.nameEn && (
                <p className="text-xs text-rose-600 mt-1">{errors.nameEn}</p>
              )}
            </div>
          </div>

          {/* 4. ភេទ (Gender) & 5. អគារ (Building) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'ភេទ' : 'Gender'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'ប្រុស', label: isKhmer ? 'ប្រុស' : 'Male' },
                  { value: 'ស្រី', label: isKhmer ? 'ស្រី' : 'Female' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g.value })}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      formData.gender === g.value
                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'អគារ' : 'Building'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="ឧ. P247"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 bg-white text-sm focus:outline-hidden transition-colors"
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 6. ដេប៉ាតឺម៉ង់ (Department) & 7. ថ្នាក់ (Class) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'ដេប៉ាតឺម៉ង់' : 'Department'} *
              </label>
              <input
                type="text"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                placeholder={isKhmer ? 'ឧ. វិទ្យាសាស្ត្រកុំព្យូទ័រ' : 'e.g. Computer Science'}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-colors ${
                  errors.faculty
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500 bg-white'
                }`}
              />
              {errors.faculty && (
                <p className="text-xs text-rose-600 mt-1">{errors.faculty}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'ថ្នាក់' : 'Class / Group'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.classGroup}
                  onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                  placeholder={isKhmer ? 'ឧ. ឆ្នាំទី២ ក្រុមA' : 'e.g. Year 2 Group A'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 bg-white text-sm focus:outline-hidden transition-colors"
                />
                <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 8. លេខទូរស័ព្ទ (Phone) & 9. Username Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ឧ. 012 345 678"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 bg-white text-sm focus:outline-hidden transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username Telegram
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="ឧ. @moksambath"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 bg-white text-sm focus:outline-hidden transition-colors"
                />
                <Send className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>{t.common.loading}</span>
              ) : (
                <>
                  <span>{t.register.submitBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Identify Option Link */}
          <div className="text-center pt-2">
            <Link
              to="/identify"
              className="text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              {t.register.alreadyAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
