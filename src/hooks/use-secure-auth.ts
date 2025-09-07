'use client';

/**
 * Secure Authentication Hook
 *
 * Provides authentication actions that work with httpOnly cookies.
 * After auth changes, triggers router.refresh() to update Server Components.
 *
 * SECURITY PATTERN:
 * 1. Auth actions modify httpOnly cookies via Supabase
 * 2. router.refresh() updates Server Components with new auth state
 * 3. Server Components pass updated user data to Client Components
 * 4. Redux is updated via props, not direct auth calls
 *
 * @module use-secure-auth
 */

import { useCallback,useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@/modules/auth/domain/types';
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser} from '@/shared/state/slices/auth-slice';

export function useSecureAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Get user data from Redux (populated by server via props)
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  /**
   * Sign in with email and password
   * Cookies are set automatically by Supabase
   */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Refresh the page to update Server Components with new auth state
      // This will fetch the user data server-side and pass it down
      router.refresh();

      // Optional: Redirect to a specific page
      // router.push('/dashboard');

    } catch (err: any) {
      setError({
        code: 'INVALID_CREDENTIALS',
        message: err.message || 'Failed to sign in',
        details: err,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Sign in with Google OAuth
   * Redirects to Google, then back to callback URL
   */
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // User will be redirected to Google

    } catch (err: any) {
      setError({
        code: 'OAUTH_ERROR',
        message: err.message || 'Failed to sign in with Google',
        details: err,
      });
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Refresh to update auth state
      router.refresh();

    } catch (err: any) {
      setError({
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Failed to sign up',
        details: err,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Sign out the current user
   * Clears httpOnly cookies
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Refresh to clear auth state in Server Components
      router.refresh();

      // Redirect to home page
      router.push('/');

    } catch (err: any) {
      setError({
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Failed to sign out',
        details: err,
      });
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Refresh the current session
   * This is typically handled automatically by middleware
   */
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();

      if (error) throw error;

      // Refresh Server Components to get updated session
      router.refresh();

    } catch (err: any) {
      // Session expired, redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // User data (from Redux, populated by server)
    user,
    isAuthenticated,
    loading: loading || authLoading,
    error,

    // Auth actions (modify httpOnly cookies)
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signOut,
    refreshSession,
    clearError,
  };
}

/**
 * Hook for protected client components
 * Ensures user is authenticated or redirects
 */
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Note: This is for client-side navigation only
  // Real protection happens in middleware and Server Components
  if (!isAuthenticated && typeof window !== 'undefined') {
    router.push(redirectTo);
  }

  return { user, isAuthenticated };
}