import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  gender: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, gender: string) => Promise<void>;
  logout: () => void;
  updateUserContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const checkUserLoggedIn = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        setToken(storedToken);
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Invalid token or session expired', err);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Use JSON-based login for standard web clients
      const res = await api.post('/auth/login-json', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.detail || 'Authentication failed');
    }
    setLoading(false);
  };

  const register = async (email: string, password: string, fullName: string, gender: string) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, full_name: fullName, gender });
      // Log in automatically after registration
      await login(email, password);
    } catch (err: any) {
      setLoading(false);
      throw new Error(err.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserContext = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to update user profile info', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
