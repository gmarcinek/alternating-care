export interface User {
  id: string;
  email: string;
  name: string;
  rolesByGroup: Record<string, 'admin' | 'member' | 'viewer'>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}
