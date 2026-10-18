import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LandingScanPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // លើកទី២ (មាន session រួច)៖ លោតផ្ទាំងចុច Check-in ឬ Check-out តែម្តង
        navigate('/attendance', { replace: true });
      } else {
        // លើកទី១ (មិនទាន់ចុះឈ្មោះ / គ្មាន session)៖ លោតតែផ្ទាំងបំពេញព័ត៌មានតែប៉ុណ្ណោះ
        navigate('/register', { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
      <div className="text-center p-6 animate-fade-in">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-semibold">
          {isKhmer ? 'កំពុងត្រួតពិនិត្យគណនីរបស់អ្នក...' : 'Checking your attendance session...'}
        </p>
      </div>
    </div>
  );
};
