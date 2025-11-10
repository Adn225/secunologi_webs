import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { AdminAccount, AdminSession } from '../types';
import { fetchAdminSession, loginAdmin, logoutAdmin } from '../services/api';

interface AuthContextValue {
  admin: AdminAccount | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = 'secunologi_admin_session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredSession = (): AdminSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
};

const persistSession = (session: AdminSession | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const token = session?.token;
    if (!token) {
      setInitializing(false);
      return;
    }

    const verify = async () => {
      setLoading(true);
      try {
        const freshSession = await fetchAdminSession(token);
        if (!mountedRef.current) {
          return;
        }
        setSession(freshSession);
        persistSession(freshSession);
        setError(null);
      } catch (err) {
        if (!mountedRef.current) {
          return;
        }
        setSession(null);
        persistSession(null);
        const message = err instanceof Error ? err.message : 'Votre session a expiré. Veuillez vous reconnecter.';
        setError(message);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginAdmin(email, password);
      if (!mountedRef.current) {
        return false;
      }
      setSession(result);
      persistSession(result);
      setError(null);
      return true;
    } catch (err) {
      if (!mountedRef.current) {
        return false;
      }
      const message = err instanceof Error ? err.message : 'Impossible de se connecter.';
      setError(message);
      return false;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;
    if (!token) {
      setSession(null);
      persistSession(null);
      return;
    }

    setLoading(true);
    try {
      await logoutAdmin(token);
    } catch {
      // Even if the API call fails we clear the session locally
    } finally {
      if (mountedRef.current) {
        setSession(null);
        persistSession(null);
        setLoading(false);
      }
    }
  }, [session]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(() => ({
    admin: session?.admin ?? null,
    token: session?.token ?? null,
    loading,
    initializing,
    error,
    login,
    logout,
    clearError,
  }), [session, loading, initializing, error, login, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
