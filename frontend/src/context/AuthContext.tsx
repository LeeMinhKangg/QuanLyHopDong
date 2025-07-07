'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  birth?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  client: Client | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!client;

  useEffect(() => {
    const storedClient = localStorage.getItem('client');
    if (storedClient) {
      try {
        setClient(JSON.parse(storedClient));
      } catch (error) {
        localStorage.removeItem('client');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      setClient(data.client);
      localStorage.setItem('client', JSON.stringify(data.client));
      console.log('✅ Login successful, client stored');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (clientData: any) => {
    try {
      console.log('📝 Attempting registration for:', clientData.email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      const data = await response.json();
      console.log('📡 Register response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      setClient(data.client);
      localStorage.setItem('client', JSON.stringify(data.client));
      console.log('✅ Registration successful, client stored');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    console.log('👋 Logging out client');
    setClient(null);
    localStorage.removeItem('client');
  };

  return (
    <AuthContext.Provider
      value={{
        client,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
