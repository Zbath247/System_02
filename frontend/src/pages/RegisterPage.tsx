import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { refreshSession } = useAuth();
  const { t, isKhmer } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nameKh: '',
    nameEn: '',
    identifier: '',
    category: 'STUDENT',
    faculty: '',
    major: '',
    classGroup: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameKh.trim()) {
      newErrors.nameKh = isKhmer ? 'សូមបញ្ចូលឈ្មោះជាភាសាខ្មែរ' : 'Khmer name is required';
    }
    if (!formData.nameEn.trim()) {
      newErrors.nameEn = isKhmer ? 'សូមបញ្ចូលឈ្មោះជាភាសាអង់គ្លេស' : 'English name is required';
    }
    if (!formData.identifier.trim()) {
      newErrors.identifier = isKhmer ? 'សូមបញ្ចូលអត្តលេខ ID' : 'Student/Staff ID is required';
    }
    if (!formData.faculty.trim()) {
      newErrors.faculty = isKhmer ? 'សូមបញ្ចូលមហាវិទ្យាល័យ ឬដេប៉ាតឺម៉ង់' : 'Faculty/Department is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = isKhmer ? 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ' : 'Invalid email format';
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
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.register.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {t.register.subtitle}
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.register.category} *
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

          {/* Student/Staff ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.register.identifier} *
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder={t.register.identifierPlaceholder}
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

          {/* Names (Khmer & English) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.register.nameKh} *
              </label>
              <input
                type="text"
                value={formData.nameKh}
                onChange={(e) => setFormData({ ...formData, nameKh: e.target.value })}
                placeholder={t.register.nameKhPlaceholder}
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
                {t.register.nameEn} *
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder={t.register.nameEnPlaceholder}
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

          {/* Faculty & Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.register.faculty} *
              </label>
              <input
                type="text"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                placeholder={t.register.facultyPlaceholder}
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
                {t.register.major}
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder={t.register.majorPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Class / Group */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.register.classGroup}
            </label>
            <input
              type="text"
              value={formData.classGroup}
              onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
              placeholder={t.register.classGroupPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm focus:outline-hidden bg-white"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.register.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@university.edu.kh"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden transition-colors ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500 bg-white'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.register.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012 345 678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 text-sm focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 mt-6 flex items-center justify-center space-x-2"
          >
            <span>{loading ? t.common.loading : t.register.submitBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Option B */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            {t.register.alreadyAccount}{' '}
            <Link to="/identify" className="font-bold text-brand-600 hover:text-brand-800">
              {t.identify.title}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
