import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TargetProfile } from '@kcal-log/types';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { APP_CONFIG } from '../config';
import type { AuthState, UserSession } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateApiUrl: (url: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    activeTarget: null,
    apiUrl: APP_CONFIG.DEFAULT_API_BASE_URL,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await api.initialize();
        const savedToken = api.getToken();
        const currentUrl = api.getBaseUrl();
        const savedProfile = await storage.getJSON<{
          user: UserSession;
          activeTarget: TargetProfile | null;
        } | null>(APP_CONFIG.STORAGE_KEYS.USER_PROFILE, null);

        if (savedToken && savedProfile) {
          setState({
            token: savedToken,
            user: savedProfile.user,
            activeTarget: savedProfile.activeTarget,
            apiUrl: currentUrl,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(prev => ({
            ...prev,
            apiUrl: currentUrl,
            isLoading: false,
          }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    api.setOnUnauthorized(() => {
      setState(prev => ({
        ...prev,
        token: null,
        user: null,
        activeTarget: null,
        isAuthenticated: false,
      }));
    });

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await api.login(email, password);
      setState(prev => ({
        ...prev,
        token: res.token,
        user: res.user,
        activeTarget: res.activeTarget,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await api.logout();
    setState(prev => ({
      ...prev,
      token: null,
      user: null,
      activeTarget: null,
      isAuthenticated: false,
      isLoading: false,
    }));
  };

  const updateApiUrl = async (url: string) => {
    api.setBaseUrl(url);
    setState(prev => ({ ...prev, apiUrl: api.getBaseUrl() }));
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getCurrentUser();
      setState(prev => ({
        ...prev,
        user: res.user,
        activeTarget: res.activeTarget,
      }));
      await storage.setJSON(APP_CONFIG.STORAGE_KEYS.USER_PROFILE, {
        user: res.user,
        activeTarget: res.activeTarget,
      });
    } catch {
      // Ignore background refresh errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateApiUrl,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
