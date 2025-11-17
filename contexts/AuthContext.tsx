
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import type { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.setAuthToken(storedToken);
    }
    setIsLoading(false);
  }, []);
  
  const login = useCallback(async (email: string, pass: string) => {
    const data = await api.loginUser(email, pass);
    localStorage.setItem('token', data.token);
    const currentUser = { nome: data.nome };
    localStorage.setItem('user', JSON.stringify(currentUser));
    setToken(data.token);
    setUser(currentUser);
    api.setAuthToken(data.token);
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    await api.registerUser(name, email, pass);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  }), [user, token, isLoading, login, register, logout]);


  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
