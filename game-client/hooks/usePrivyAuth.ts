'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCallback } from 'react';

export const usePrivyAuth = () => {
  const { 
    login,
    logout,
    authenticated,
    ready,
    user,
  } = usePrivy();

  const handleLogin = useCallback(async () => {
    try {
      await login();
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }, [login]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, [logout]);

  return {
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: authenticated,
    isReady: ready,
    user,
  };
};
