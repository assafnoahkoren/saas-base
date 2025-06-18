import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import api from '../lib/api';
import type { AuthContextType } from './AuthContext.types';
import { AuthContext } from './auth-context';

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
              // Update the Authorization header
              originalRequest.headers['Authorization'] =
                `Bearer ${access_token}`;
              // Also update the default headers for future requests
              api.defaults.headers.common['Authorization'] =
                `Bearer ${access_token}`;
              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              delete api.defaults.headers.common['Authorization'];
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

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Set default headers if token exists
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Query for current user
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: AuthService.getCurrentUser,
    enabled: isAuthenticated,
    retry: 1, // Allow one retry to handle initial token setup
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Handle authentication error
  useEffect(() => {
    if (isError && isAuthenticated) {
      // Token is invalid, clear everything
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      queryClient.clear();
    }
  }, [isError, isAuthenticated, queryClient]);

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
    isLoading: isLoading || (isAuthenticated && !user && !isError),
    isAuthenticated: isAuthenticated && !!user && !isError,
    logout,
    setAuthenticated: setIsAuthenticated,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
