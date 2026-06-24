'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number;
  departmentId: number | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyOtp: (email: string, otp: string, purpose: string) => Promise<any>;
  resendOtp: (email: string, purpose: string) => Promise<any>;
  logout: (skipServerCall?: boolean) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<any>;
  confirmPasswordReset: (data: any) => Promise<any>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate user session from localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.verified) {
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  };

  const register = async (registerData: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  };

  const verifyOtp = async (email: string, otp: string, purpose: string) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }
    return data;
  };

  const resendOtp = async (email: string, purpose: string) => {
    const res = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'OTP resending failed');
    }
    return data;
  };

  const logout = async (skipServerCall: boolean = false) => {
    try {
      if (accessToken && !skipServerCall) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (e) {
      console.warn('Logout request ignored or failed', e);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Password reset request failed');
    }
    return data;
  };

  const confirmPasswordReset = async (resetData: any) => {
    const res = await fetch(`${API_URL}/auth/reset-password-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Password reset confirmation failed');
    }
    return data;
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accessToken');

    // If no token is available at all, don't attempt the request
    if (!token) {
      throw new Error('No active session. Please login.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    let res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiration & refresh
    if (res.status === 401) {
      const rToken = localStorage.getItem('refreshToken');
      const u = localStorage.getItem('user');
      if (rToken && u) {
        let parsedUser: any;
        try { parsedUser = JSON.parse(u); } catch { parsedUser = {}; }
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rToken, userId: parsedUser.id }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setAccessToken(refreshData.accessToken);
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);

          // Retry the original request with new token
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${refreshData.accessToken}`,
          };
          res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: newHeaders,
          });
        } else {
          // Refresh token is also invalid — force logout
          await logout(true);
          throw new Error('Session expired, please login again.');
        }
      } else {
        // No refresh token either — clear everything and redirect
        await logout(true);
        throw new Error('Session expired, please login again.');
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        requestPasswordReset,
        confirmPasswordReset,
        apiFetch,
      }}
    >
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
