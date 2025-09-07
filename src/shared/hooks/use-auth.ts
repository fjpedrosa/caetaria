/**
 * Custom auth hooks for Redux
 *
 * These hooks provide a clean API for auth operations
 * with performance optimizations through selective subscriptions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearError,
  refreshSession,
  selectAuthError,
  selectAuthInitialized,
  selectAuthLoading,
  selectIsAuthenticated,
  selectSession,
  selectUser,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
} from '@/shared/state/slices/auth-slice';
import type { AppDispatch } from '@/shared/state/store';

/**
 * Main auth hook with all auth operations
 * Use this when you need multiple auth properties
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors - only subscribe to what we need
  const user = useSelector(selectUser);
  const session = useSelector(selectSession);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const initialized = useSelector(selectAuthInitialized);

  // Auth operations wrapped in useCallback for performance
  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(signIn({ email, password }));
      if (signIn.rejected.match(result)) {
        throw result.error;
      }
      return result.payload;
    },
    [dispatch]
  );

  const handleSignUp = useCallback(
    async (email: string, password: string, metadata?: Record<string, any>) => {
      const result = await dispatch(signUp({ email, password, metadata }));
      if (signUp.rejected.match(result)) {
        throw result.error;
      }
      return result.payload;
    },
    [dispatch]
  );

  const handleSignInWithGoogle = useCallback(
    async () => {
      const result = await dispatch(signInWithGoogle());
      if (signInWithGoogle.rejected.match(result)) {
        throw result.error;
      }
      return result.payload;
    },
    [dispatch]
  );

  const handleSignOut = useCallback(
    async () => {
      const result = await dispatch(signOut());
      if (signOut.rejected.match(result)) {
        throw result.error;
      }
    },
    [dispatch]
  );

  const handleRefreshSession = useCallback(
    async () => {
      const result = await dispatch(refreshSession());
      if (refreshSession.rejected.match(result)) {
        throw result.error;
      }
      return result.payload;
    },
    [dispatch]
  );

  const handleClearError = useCallback(
    () => {
      dispatch(clearError());
    },
    [dispatch]
  );

  return {
    // State
    user,
    session,
    isAuthenticated,
    loading,
    error,
    initialized,

    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,
    clearError: handleClearError,
  };
};

/**
 * Lightweight hook for just checking authentication status
 * Use this when you only need to know if user is authenticated
 * Prevents unnecessary re-renders from other auth state changes
 */
export const useIsAuthenticated = () => {
  return useSelector(selectIsAuthenticated);
};

/**
 * Lightweight hook for just getting the current user
 * Use this when you only need user info, not auth operations
 */
export const useCurrentUser = () => {
  return useSelector(selectUser);
};

/**
 * Lightweight hook for auth loading state
 * Use this for showing loading indicators
 */
export const useAuthLoading = () => {
  return useSelector(selectAuthLoading);
};

/**
 * Lightweight hook for auth initialization status
 * Use this to check if auth has been initialized on app start
 */
export const useAuthInitialized = () => {
  return useSelector(selectAuthInitialized);
};