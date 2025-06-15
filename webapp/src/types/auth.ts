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
