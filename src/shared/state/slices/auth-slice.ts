/**
 * Auth Slice - Redux state for authentication
 *
 * This replaces the AuthContext to provide better performance:
 * - Only components that use useSelector with auth state will re-render
 * - No unnecessary re-renders of the entire app
 * - Selective subscriptions to specific auth properties
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { supabase } from '@/lib/supabase/client';
import type { AuthError,AuthSession, User } from '@/modules/auth/domain/types';

// State interface
interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
};

// Helper functions to map Supabase data to domain types
const mapSupabaseUserToDomain = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url ||
            supabaseUser.user_metadata?.picture,
    provider: supabaseUser.app_metadata?.provider || 'email',
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
  };
};

const mapSupabaseSessionToDomain = (supabaseSession: any): AuthSession => {
  const user = mapSupabaseUserToDomain(supabaseSession.user);
  return {
    user,
    expiresAt: new Date(supabaseSession.expires_at! * 1000),
    // Tokens are handled by Supabase in httpOnly cookies
    // Never expose tokens to JavaScript for security
  };
};

const createAuthError = (error: any): AuthError => {
  let code = 'UNKNOWN_ERROR' as any;
  let message = error?.message || 'An authentication error occurred';

  if (error?.status === 400 && error?.message?.includes('Invalid login credentials')) {
    code = 'INVALID_CREDENTIALS';
    message = 'Invalid email or password';
  } else if (error?.status === 404) {
    code = 'USER_NOT_FOUND';
    message = 'User not found';
  } else if (error?.message?.includes('JWT')) {
    code = 'SESSION_EXPIRED';
    message = 'Your session has expired. Please sign in again';
  } else if (error?.message?.includes('network')) {
    code = 'NETWORK_ERROR';
    message = 'Network error. Please check your connection';
  }

  return { code, message, details: error };
};

// Async thunks for auth operations
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    console.log('[Redux Auth] Initializing auth state...');
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (session?.user) {
      console.log('[Redux Auth] Found existing session for:', session.user.email);
      return mapSupabaseSessionToDomain(session);
    }

    console.log('[Redux Auth] No existing session found');
    return null;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    console.log('[Redux Auth] Signing in with email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      console.log('[Redux Auth] Sign in successful:', data.session.user.email);
      return mapSupabaseSessionToDomain(data.session);
    }

    throw new Error('No session returned after sign in');
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({
    email,
    password,
    metadata = {}
  }: {
    email: string;
    password: string;
    metadata?: Record<string, any>
  }) => {
    console.log('[Redux Auth] Signing up with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    if (data.session) {
      console.log('[Redux Auth] Sign up successful:', data.session.user.email);
      return mapSupabaseSessionToDomain(data.session);
    }

    // User might need to confirm email
    return null;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    console.log('[Redux Auth] Initiating Google OAuth...');
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const redirectTo = redirectParam
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectParam)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    // The actual sign-in happens through redirect
    return null;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    console.log('[Redux Auth] Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[Redux Auth] Sign out successful');
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async () => {
    console.log('[Redux Auth] Refreshing session...');
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    if (session) {
      console.log('[Redux Auth] Session refreshed for:', session.user.email);
      return mapSupabaseSessionToDomain(session);
    }

    throw new Error('Failed to refresh session');
  }
);

// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateSession: (state, action: PayloadAction<AuthSession | null>) => {
      if (action.payload) {
        console.log('[Redux Auth] Session updated for:', action.payload.user.email);
        state.session = action.payload;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      } else {
        console.log('[Redux Auth] Session cleared');
        state.session = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      console.log('[Redux Auth] User updated:', action.payload.email);
      state.user = action.payload;
      if (state.session) {
        state.session.user = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        if (action.payload) {
          state.session = action.payload;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = createAuthError(action.error);
      });

    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.session = action.payload;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = createAuthError(action.error);
      });

    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.session = action.payload;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = createAuthError(action.error);
      });

    // Google sign in
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state) => {
        state.loading = false;
        // OAuth redirect will handle the actual sign in
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = createAuthError(action.error);
      });

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = createAuthError(action.error);
      });

    // Refresh session
    builder
      .addCase(refreshSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.session = action.payload;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading = false;
        state.error = createAuthError(action.error);
        // If refresh fails, clear auth state
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
      });
  },
});

// Export actions and reducer
export const { clearError, updateSession, updateUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors for optimized re-renders
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.initialized;
export const selectSession = (state: { auth: AuthState }) => state.auth.session;

// Security Note: Tokens are managed in httpOnly cookies by Supabase.
// They are never exposed to JavaScript to prevent XSS attacks.
// Use middleware.ts to validate authentication on the server side.