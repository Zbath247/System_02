import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';

import { LandingScanPage } from './pages/LandingScanPage';
import { RegisterPage } from './pages/RegisterPage';
import { IdentifyPage } from './pages/IdentifyPage';
import { AttendanceDashboardPage } from './pages/AttendanceDashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminLocationsPage } from './pages/AdminLocationsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { SystemQRCodePage } from './pages/SystemQRCodePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/scan" replace />;
  }

  return <>{children}</>;
};

// Admin Protected Route Component
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Checking administrative privileges...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// 404 Not Found Page
const NotFoundPage: React.FC = () => (
  <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center bg-slate-50">
    <h1 className="text-6xl font-extrabold text-slate-300">404</h1>
    <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found / រកមិនឃើញទំព័រនេះទេ</h2>
    <p className="text-xs text-slate-500 mt-1 max-w-sm">
      The requested page does not exist or has been moved.
    </p>
    <a
      href="/scan"
      className="mt-6 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
    >
      Return to Home / ត្រឡប់ទៅទំព័រដើម
    </a>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/scan" replace />} />
                <Route path="/scan" element={<LandingScanPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/identify" element={<IdentifyPage />} />
                <Route path="/system-qr" element={<SystemQRCodePage />} />

                {/* Authenticated User Attendance Routes */}
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute>
                      <AttendanceDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboardPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminProtectedRoute>
                      <AdminUsersPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/locations"
                  element={
                    <AdminProtectedRoute>
                      <AdminLocationsPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <AdminProtectedRoute>
                      <AdminReportsPage />
                    </AdminProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
