import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PublicRoute } from '../components/PublicRoute';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { EmailVerificationPage } from '../pages/EmailVerificationPage';
import { DashboardPage } from '../pages/DashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes group */}
      <Route element={<Outlet />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email/:token"
          element={<EmailVerificationPage />}
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <div className="p-8 text-center">
                Forgot password page coming soon...
              </div>
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email-reminder"
          element={
            <div className="p-8 text-center">
              Please verify your email to continue.
            </div>
          }
        />
      </Route>

      {/* Private routes group */}
      <Route
        element={
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Add more private routes here */}
      </Route>

      {/* 404 page - must be last */}
      <Route
        path="*"
        element={<div className="p-8 text-center">Page not found</div>}
      />
    </Routes>
  );
};
