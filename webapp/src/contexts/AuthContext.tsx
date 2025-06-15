import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import api from '../lib/api';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const { access_token } =
                await AuthService.refreshToken(refreshToken);
              localStorage.setItem('access_token', access_token);
              originalRequest.headers['Authorization'] =
                `Bearer ${access_token}`;
              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              setIsAuthenticated(false);
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  // Set authorization header if token exists
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  // Query for current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: AuthService.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      queryClient.clear();
      window.location.href = '/login';
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: isAuthenticated && !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = useAuthContext;
