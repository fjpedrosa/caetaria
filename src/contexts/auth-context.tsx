'use client';

import React, { createContext, useCallback, useContext, useEffect,useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { supabase } from '@/lib/supabase/client';
import type {
  AuthError,
  AuthErrorCode,
  AuthSession,
  User} from '@/modules/auth/domain/types';

/**
 * AuthContext Interface
 *
 * Defines the shape of authentication context value
 * Extends the functionality of useAuth hook with additional methods
 */
interface AuthContextValue {
  // State
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

/**
 * SignUp Metadata Interface
 *
 * Additional data that can be provided during sign up
 */
interface SignUpMetadata {
  name?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Create Auth Context with undefined default value
 * This ensures we catch any usage outside of the provider
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Custom hook to use Auth Context
 *
 * Throws error if used outside of AuthProvider
 * This ensures proper context usage throughout the app
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

/**
 * Map Supabase user to domain User type
 *
 * Pure function to transform Supabase user data to our domain model
 */
const mapSupabaseUserToDomain = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split('@')[0], // Fallback to email prefix
    avatar: supabaseUser.user_metadata?.avatar_url ||
            supabaseUser.user_metadata?.picture,
    provider: supabaseUser.app_metadata?.provider || 'email',
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
  };
};

/**
 * Map Supabase session to domain AuthSession type
 *
 * Pure function to transform Supabase session to our domain model
 */
const mapSupabaseSessionToDomain = (supabaseSession: any): AuthSession => {
  const user = mapSupabaseUserToDomain(supabaseSession.user);

  return {
    user,
    accessToken: supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    expiresAt: new Date(supabaseSession.expires_at! * 1000),
  };
};

/**
 * Create error object from exception
 *
 * Pure function to standardize error handling
 */
const createAuthError = (error: any, defaultCode: AuthErrorCode = 'UNKNOWN_ERROR' as AuthErrorCode): AuthError => {
  // Check for specific Supabase error codes
  let code: AuthErrorCode = defaultCode;
  let message = error?.message || 'An authentication error occurred';

  if (error?.status === 400 && error?.message?.includes('Invalid login credentials')) {
    code = 'INVALID_CREDENTIALS' as AuthErrorCode;
    message = 'Invalid email or password';
  } else if (error?.status === 404) {
    code = 'USER_NOT_FOUND' as AuthErrorCode;
    message = 'User not found';
  } else if (error?.message?.includes('JWT')) {
    code = 'SESSION_EXPIRED' as AuthErrorCode;
    message = 'Your session has expired. Please sign in again';
  } else if (error?.message?.includes('network')) {
    code = 'NETWORK_ERROR' as AuthErrorCode;
    message = 'Network error. Please check your connection';
  }

  return {
    code,
    message,
    details: error,
  };
};

/**
 * Auth Provider Component
 *
 * Provides authentication context to the entire application
 * Manages authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  /**
   * Initialize authentication state
   * Checks for existing session on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        const { data: { session: supabaseSession }, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (supabaseSession?.user) {
          const mappedSession = mapSupabaseSessionToDomain(supabaseSession);
          setUser(mappedSession.user);
          setSession(mappedSession);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(createAuthError(err));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('[AuthContext] Auth state change:', event, supabaseSession?.user?.email);

        switch (event) {
          case 'SIGNED_IN':
            if (supabaseSession?.user) {
              const mappedSession = mapSupabaseSessionToDomain(supabaseSession);
              setUser(mappedSession.user);
              setSession(mappedSession);
              setError(null);
              console.log('[AuthContext] User signed in:', mappedSession.user.email);
            }
            break;

          case 'SIGNED_OUT':
            setUser(null);
            setSession(null);
            setError(null);
            break;

          case 'TOKEN_REFRESHED':
            if (supabaseSession) {
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
            break;

          case 'USER_UPDATED':
            if (supabaseSession?.user) {
              const updatedUser = mapSupabaseUserToDomain(supabaseSession.user);
              setUser(updatedUser);
              setSession((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  user: updatedUser,
                };
              });
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.session) {
        const mappedSession = mapSupabaseSessionToDomain(data.session);
        setUser(mappedSession.user);
        setSession(mappedSession);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const authError = createAuthError(err, 'INVALID_CREDENTIALS' as AuthErrorCode);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        const mappedSession = mapSupabaseSessionToDomain(data.session);
        setUser(mappedSession.user);
        setSession(mappedSession);
      }

      // Note: User might need to confirm email depending on Supabase settings
    } catch (err: any) {
      console.error('Sign up error:', err);
      const authError = createAuthError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get redirect parameter from URL if it exists
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

      // The actual sign-in happens through redirect
      // The auth state change listener will handle the rest
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const authError = createAuthError(err, 'OAUTH_ERROR' as AuthErrorCode);
      setError(authError);
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

      // State will be cleared by the auth state change listener
    } catch (err: any) {
      console.error('Sign out error:', err);
      const authError = createAuthError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session: refreshedSession }, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError) {
        throw refreshError;
      }

      if (refreshedSession) {
        const mappedSession = mapSupabaseSessionToDomain(refreshedSession);
        setUser(mappedSession.user);
        setSession(mappedSession);
      }
    } catch (err: any) {
      console.error('Session refresh error:', err);
      const authError = createAuthError(err, 'SESSION_EXPIRED' as AuthErrorCode);
      setError(authError);

      // If refresh fails, sign out the user
      await signOut();
      throw authError;
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  /**
   * Memoized context value
   *
   * Optimizes re-renders by only updating when dependencies change
   */
  const contextValue = useMemo<AuthContextValue>(() => ({
    // State
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user && !!session,

    // Actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
    refreshSession,
  }), [
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
    refreshSession,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * HOC for protecting routes that require authentication
 *
 * Usage:
 * const ProtectedPage = withAuth(MyPage);
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuthContext();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // You can redirect to login page or show an error
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

/**
 * Export types for external usage
 */
export type { AuthContextValue, SignUpMetadata };