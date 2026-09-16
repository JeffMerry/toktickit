import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export type UserRole = 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

async function readJson(response: Response): Promise<any> {
  return response.json().catch(() => null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await apiFetch('/api/auth/me');
        const data = await readJson(response);
        if (response.ok && isMounted) setUser(data.user);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();
    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(errorMessage(data, 'Unable to sign in.'));
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const response = await apiFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(errorMessage(data, 'Unable to change password.'));
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout, changePassword }), [user, isLoading, login, logout, changePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
