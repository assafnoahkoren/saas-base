export interface JwtPayload {
  email: string;
  sub: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  emailVerified: boolean;
}
