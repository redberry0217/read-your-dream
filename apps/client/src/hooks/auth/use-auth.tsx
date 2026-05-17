import type { User } from '@/types/user';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  logout: () => void;
  setTokenAndUser: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function parseJwtPayload(token: string): { id: string; email: string; name?: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token'),
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_token');
    if (!stored) return null;
    const payload = parseJwtPayload(stored);
    if (!payload) return null;
    return { id: payload.id, email: payload.email, name: payload.name ?? payload.email.split('@')[0], jewels: 0 };
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  const setTokenAndUser = (newToken: string) => {
    const payload = parseJwtPayload(newToken);
    if (!payload) return;
    setToken(newToken);
    setUser({ id: payload.id, email: payload.email, name: payload.name ?? payload.email.split('@')[0], jewels: 0 });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, setTokenAndUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
