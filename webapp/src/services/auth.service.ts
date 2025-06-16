import api from '../lib/api';
import type {
  RegisterData,
  RegisterResponse,
  LoginData,
  LoginResponse,
  User,
} from '../types/auth';

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

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', data);

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      // Logout handled
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch user data.');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    try {
      const response = await api.post<{ access_token: string }>(
        '/auth/refresh',
        {
          refresh_token: refreshToken,
        },
      );

      return response.data;
    } catch {
      throw new Error('Session expired. Please login again.');
    }
  }
}
