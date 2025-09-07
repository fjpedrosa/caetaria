'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase/client';

import type {
  AuthError,
  AuthErrorCode,
  AuthSession,
  UseAuthReturn,
  User} from '../../domain/types';

/**
 * Custom hook for authentication management
 *
 * Handles all authentication logic including:
 * - Google OAuth sign-in
 * - Session management
 * - User state
 * - Sign out
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get initial session
        const { data: { session: supabaseSession }, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (supabaseSession?.user) {
          const mappedUser: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email!,
            name: supabaseSession.user.user_metadata?.full_name ||
                  supabaseSession.user.user_metadata?.name,
            avatar: supabaseSession.user.user_metadata?.avatar_url ||
                    supabaseSession.user.user_metadata?.picture,
            provider: supabaseSession.user.app_metadata?.provider || 'email',
            createdAt: new Date(supabaseSession.user.created_at),
            updatedAt: new Date(supabaseSession.user.updated_at || supabaseSession.user.created_at),
          };

          const mappedSession: AuthSession = {
            user: mappedUser,
            accessToken: supabaseSession.access_token,
            refreshToken: supabaseSession.refresh_token,
            expiresAt: new Date(supabaseSession.expires_at! * 1000),
          };

          setUser(mappedUser);
          setSession(mappedSession);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError({
          code: 'UNKNOWN_ERROR' as AuthErrorCode,
          message: 'Failed to initialize authentication',
          details: err,
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (event === 'SIGNED_IN' && supabaseSession?.user) {
          const mappedUser: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email!,
            name: supabaseSession.user.user_metadata?.full_name ||
                  supabaseSession.user.user_metadata?.name,
            avatar: supabaseSession.user.user_metadata?.avatar_url ||
                    supabaseSession.user.user_metadata?.picture,
            provider: supabaseSession.user.app_metadata?.provider || 'email',
            createdAt: new Date(supabaseSession.user.created_at),
            updatedAt: new Date(supabaseSession.user.updated_at || supabaseSession.user.created_at),
          };

          const mappedSession: AuthSession = {
            user: mappedUser,
            accessToken: supabaseSession.access_token,
            refreshToken: supabaseSession.refresh_token,
            expiresAt: new Date(supabaseSession.expires_at! * 1000),
          };

          setUser(mappedUser);
          setSession(mappedSession);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
          // Update session with new tokens
          setSession((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              accessToken: supabaseSession.access_token,
              refreshToken: supabaseSession.refresh_token,
              expiresAt: new Date(supabaseSession.expires_at! * 1000),
            };
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the redirect parameter from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      const redirectTo = redirectParam
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectParam)}`
        : `${window.location.origin}/auth/callback`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        throw signInError;
      }

      // The actual sign-in will happen through redirect
      // The auth state change listener will handle the rest
    } catch (err: any) {
      console.error('Google sign-in error:', err);

      const authError: AuthError = {
        code: 'OAUTH_ERROR' as AuthErrorCode,
        message: err.message || 'Failed to sign in with Google',
        details: err,
      };

      setError(authError);
      setLoading(false);

      // Re-throw for component-level handling if needed
      throw authError;
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      // Clear local state
      setUser(null);
      setSession(null);

      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Sign out error:', err);

      const authError: AuthError = {
        code: 'UNKNOWN_ERROR' as AuthErrorCode,
        message: err.message || 'Failed to sign out',
        details: err,
      };

      setError(authError);

      // Re-throw for component-level handling if needed
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user && !!session,
  };
};