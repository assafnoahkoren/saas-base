import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../../services/auth.service';
import type { RegisterData, RegisterResponse } from '../../types/auth';

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
