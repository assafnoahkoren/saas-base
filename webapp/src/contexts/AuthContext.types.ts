import type { User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  refetchUser?: () => void;
}
