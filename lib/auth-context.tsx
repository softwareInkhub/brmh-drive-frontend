'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SSOUtils, SSOUser } from './sso-utils';

interface AuthContextType {
  user: SSOUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SSOUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const currentUser = await SSOUtils.getUserAsync();
    setUser(currentUser);
  };

  const logout = async () => {
    try {
      await SSOUtils.logout();
      setUser(null);
      // Redirect to auth page
      window.location.href =
        'https://auth.brmh.in/login?next=' +
        encodeURIComponent(window.location.href);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      window.location.href =
        'https://auth.brmh.in/login?next=' +
        encodeURIComponent(window.location.href);
    }
  };

  useEffect(() => {
    // Initialize authentication
    const initAuth = async () => {
      try {
        // Check if authenticated
        const isAuth = SSOUtils.isAuthenticated();
        
        if (isAuth) {
          // Get user info asynchronously (works for both localhost and production)
          const currentUser = await SSOUtils.getUserAsync();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
