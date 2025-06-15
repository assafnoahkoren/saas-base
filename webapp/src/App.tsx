import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { RegisterPage } from './pages/RegisterPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect root to register for now */}
            <Route path="/" element={<Navigate to="/register" replace />} />

            {/* Auth routes */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Placeholder for other routes */}
            <Route
              path="/login"
              element={
                <div className="p-8 text-center">Login page coming soon...</div>
              }
            />
            <Route
              path="/verify-email/:token"
              element={<EmailVerificationPage />}
            />
            <Route
              path="/dashboard"
              element={
                <div className="p-8 text-center">Dashboard coming soon...</div>
              }
            />

            {/* 404 page */}
            <Route
              path="*"
              element={<div className="p-8 text-center">Page not found</div>}
            />
          </Routes>
        </div>
      </Router>
    </QueryProvider>
  );
}

export default App;
