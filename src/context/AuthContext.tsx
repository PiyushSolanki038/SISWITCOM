import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Role } from '@/config/roles';
import { API_CONFIG } from '@/config/api';

export type UserRole = Role | null;
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Provides authentication state and methods (login, logout, signup) to the application.
 * Wraps the application to ensure all components can access auth state.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const updateSubscription = async (plan: SubscriptionPlan) => {
    if (!user) return;
    
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/subscription/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, plan }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Subscription update failed');
        }

        // Update local state
        const updatedUser = { ...user, subscriptionStatus: 'active' as const, subscriptionPlan: plan };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
        console.error('Subscription update error:', error);
        throw error;
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token || null);
      if (data.token) localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.user);
      setToken(data.token || null);
      if (data.token) localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }
      
      // Success - no action needed on state
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user && !!token;
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup, updateSubscription, forgotPassword, token }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to easily access the AuthContext.
 * Throws an error if used outside of an AuthProvider.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
