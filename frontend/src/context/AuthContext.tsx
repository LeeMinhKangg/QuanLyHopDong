'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  company_name?: string | null;
  tax_code?: string | null;
  avatar?: string | null;
  birth?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  client: Client | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!client && !!token;

  useEffect(() => {
    console.log('🔄 AuthProvider: Loading stored auth data...');
    
    // Load từ localStorage khi component mount
    const storedClient = localStorage.getItem('client');
    const storedToken = localStorage.getItem('token');
    
    if (storedClient && storedToken) {
      try {
        const parsedClient = JSON.parse(storedClient);
        setClient(parsedClient);
        setToken(storedToken);
        console.log('✅ AuthProvider: Restored client session for', parsedClient.email);
      } catch (error) {
        console.error('❌ AuthProvider: Error parsing stored client data:', error);
        localStorage.removeItem('client');
        localStorage.removeItem('token');
      }
    } else {
      console.log('ℹ️ AuthProvider: No stored session found');
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Attempting login for:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 AuthContext: Login response received', {
        success: data.success,
        hasClient: !!data.client,
        hasToken: !!data.token
      });

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu client và token từ Laravel
      setClient(data.client);
      setToken(data.token);
      
      localStorage.setItem('client', JSON.stringify(data.client));
      localStorage.setItem('token', data.token);
      
      console.log('✅ AuthContext: Login successful, session stored');
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (userData: any) => {
    try {
      console.log('📝 AuthContext: Attempting registration for:', userData.email);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('📡 AuthContext: Register response received', {
        success: data.success,
        hasClient: !!data.client,
        hasToken: !!data.token
      });

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Lưu client và token từ Laravel
      setClient(data.client);
      setToken(data.token);
      
      localStorage.setItem('client', JSON.stringify(data.client));
      localStorage.setItem('token', data.token);
      
      console.log('✅ AuthContext: Registration successful, session stored');
    } catch (error: any) {
      console.error('❌ AuthContext: Registration error:', error);
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    console.log('👋 AuthContext: Logging out client');
    
    setClient(null);
    setToken(null);
    localStorage.removeItem('client');
    localStorage.removeItem('token');
    
    console.log('✅ AuthContext: Logout completed');
  };

  return (
    <AuthContext.Provider
      value={{
        client,
        token,
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
