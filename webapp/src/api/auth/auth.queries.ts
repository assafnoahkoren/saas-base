import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../../services/auth.service';
import type {
  RegisterData,
  RegisterResponse,
  LoginData,
  LoginResponse,
} from '../../types/auth';

/**
 * Hook for user registration
 */
export const useRegisterMutation = () => {
  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: (data: RegisterData) => AuthService.register(data),
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmailMutation = () => {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
  });
};

/**
 * Hook for resending verification email
 */
export const useResendVerificationMutation = () => {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (email: string) => AuthService.resendVerificationEmail(email),
  });
};

/**
 * Hook for user login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: (data: LoginData) => AuthService.login(data),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Invalidate and refetch any user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Trigger a refetch of the current user
      queryClient.refetchQueries({ queryKey: ['user', 'current'] });
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear all queries
      queryClient.clear();
    },
  });
};
