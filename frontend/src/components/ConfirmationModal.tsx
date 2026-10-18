import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-6 animate-scale-up text-center">
        <div
          className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
            isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'
          }`}
        >
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">{message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel || t.common.cancel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2.5 text-xs font-semibold text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {isLoading ? t.common.loading : confirmLabel || t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
