import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiUser, loginRequest, meRequest, registerRequest } from '../api/auth';
import { ApiClientError } from '../api/client';

const TOKEN_KEY = 'ici_tracker_auth_token';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthStoreContextValue {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  user: ApiUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, storeName: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthStoreContext = createContext<AuthStoreContextValue | undefined>(undefined);

function getErrorMessage(err: unknown): string {
  return err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.';
}

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const { user: fetchedUser } = await meRequest(storedToken);
          setToken(storedToken);
          setUser(fetchedUser);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (nextToken: string, nextUser: ApiUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setIsSubmitting(true);
      try {
        const result = await loginRequest(email.trim(), password);
        await persistSession(result.token, result.user);
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const register = useCallback(
    async (email: string, password: string, storeName: string): Promise<AuthResult> => {
      setIsSubmitting(true);
      try {
        const result = await registerRequest(email.trim(), password, storeName.trim());
        await persistSession(result.token, result.user);
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  }, []);

  const value = useMemo<AuthStoreContextValue>(
    () => ({
      isBootstrapping,
      isAuthenticated: token !== null,
      isSubmitting,
      user,
      token,
      login,
      register,
      logout,
    }),
    [isBootstrapping, token, isSubmitting, user, login, register, logout]
  );

  return <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>;
}

export function useAuthStore(): AuthStoreContextValue {
  const context = useContext(AuthStoreContext);
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthStoreProvider');
  }
  return context;
}
