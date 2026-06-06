import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthUser } from '../types';
import { getUser, saveUser, saveToken, clearAuth } from '../utils/storage';
import { login as loginService } from '../services/authService';
import { decodeJwtPayload } from '../utils/formatters';

interface AuthContextData {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const storedUser = await getUser();
        if (storedUser) setUser(storedUser);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredUser();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const response = await loginService({ email, senha });

    const payload = decodeJwtPayload(response.token);
    const userId =
      typeof payload.userId === 'number'
        ? payload.userId
        : typeof payload.id === 'number'
        ? payload.id
        : undefined;

    const authUser: AuthUser = {
      token: response.token,
      email: response.email,
      role: response.role,
      id: userId,
    };

    await saveToken(response.token);
    await saveUser(authUser);
    setUser(authUser);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setUser(null);
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, isLoading, login, logout } },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
