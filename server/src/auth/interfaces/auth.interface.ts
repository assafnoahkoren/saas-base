export interface JwtPayload {
  sub: string;
  email: string;
  emailVerified: boolean;
  iat?: number;
  exp?: number;
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

export interface EmailVerificationResult {
  success: boolean;
  message: string;
}
