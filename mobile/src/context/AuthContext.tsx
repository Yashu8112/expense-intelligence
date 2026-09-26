import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authAPI, setToken, removeToken, getToken, User, LoginPayload, SignupPayload } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Called once at app startup to restore session from SecureStore */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await getToken();
      if (stored) {
        setTokenState(stored);
        const res = await authAPI.getMe();
        const payload = res.data?.data ?? res.data;
        setUser(payload?.user ?? payload);
      }
    } catch {
      // Token expired or invalid – clear it silently
      await removeToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authAPI.login(payload);
    // Backend returns ApiResponse: { success: true, message: "...", data: { accessToken, user } }
    const authData = res.data?.data ?? res.data;
    const tokenStr = authData?.accessToken || authData?.token;
    const userObj = authData?.user;

    if (!tokenStr || typeof tokenStr !== 'string') {
      throw new Error('Authentication failed: no access token received from server');
    }

    await setToken(tokenStr);
    setTokenState(tokenStr);
    setUser(userObj);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await authAPI.signup(payload);
    const authData = res.data?.data ?? res.data;
    const tokenStr = authData?.accessToken || authData?.token;
    const userObj = authData?.user;

    if (!tokenStr || typeof tokenStr !== 'string') {
      throw new Error('Signup failed: no access token received from server');
    }

    await setToken(tokenStr);
    setTokenState(tokenStr);
    setUser(userObj);
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const payload = res.data?.data ?? res.data;
      setUser(payload?.user ?? payload);
    } catch {
      await logout();
    }
  }, [logout]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    refreshUser,
    initialize,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
