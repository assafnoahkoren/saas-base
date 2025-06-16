import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { MantineProvider } from './providers/MantineProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <MantineProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Redirect root to dashboard */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Public auth routes */}
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

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Placeholder routes */}
                <Route
                  path="/forgot-password"
                  element={
                    <div className="p-8 text-center">
                      Forgot password page coming soon...
                    </div>
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

                {/* 404 page */}
                <Route
                  path="*"
                  element={
                    <div className="p-8 text-center">Page not found</div>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </QueryProvider>
  );
}

export default App;
