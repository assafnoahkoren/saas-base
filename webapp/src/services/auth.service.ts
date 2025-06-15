import api from '../lib/api';
import type { RegisterData, RegisterResponse } from '../types/auth';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Handle axios error response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Email verification failed. Please try again.');
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to resend verification email. Please try again.');
    }
  }
}
