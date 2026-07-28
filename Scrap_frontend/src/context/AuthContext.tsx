import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { authService } from '../services/auth';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (access: string, refresh: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          storage.getAccessToken(),
          storage.getUser(),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUserState(savedUser);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const formatUser = (rawUser: any): User => {
    return {
      id: rawUser.id || rawUser._id || '',
      phone: rawUser.phone || '',
      first_name: rawUser.first_name || (rawUser.name ? rawUser.name.split(' ')[0] : null),
      last_name: rawUser.last_name || (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : null),
      email: rawUser.email || null,
      referral_code: rawUser.referral_code || null,
      category: rawUser.category || 'individual',
      role: rawUser.role || 'user',
      scrapperStatus: rawUser.scrapperStatus || 'none',
    };
  };

  const login = async (access: string, refresh: string, rawUser: any) => {
    const userData = formatUser(rawUser);
    await storage.setTokens(access, refresh);
    await storage.setUser(userData);
    setToken(access);
    setUserState(userData);
  };

  const logout = async () => {
    await storage.clearTokens();
    await storage.clearUser();
    setToken(null);
    setUserState(null);
  };

  const setUser = (rawUser: any) => {
    const userData = formatUser(rawUser);
    setUserState(userData);
    storage.setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
