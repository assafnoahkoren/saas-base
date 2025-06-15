export interface RegisterData {
  email: string;
  name?: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
  };
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}
