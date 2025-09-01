/**
 * Supabase Browser Client
 *
 * Client-side Supabase instance for use in React components and browser-only operations.
 * Handles client-side authentication, real-time subscriptions, and browser storage.
 *
 * Features:
 * - Automatic session management with localStorage
 * - Real-time capabilities for live updates
 * - Client-side authentication flows
 * - Browser-specific optimizations
 *
 * Usage:
 * ```ts
 * import { supabase } from '@/lib/supabase/client';
 *
 * // In React components
 * const { data, error } = await supabase.from('leads').select('*');
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

/**
 * Browser Supabase client instance
 *
 * Configured with optimal settings for client-side operations:
 * - Automatic session persistence in localStorage
 * - Real-time subscriptions enabled
 * - Auth persistence for seamless UX
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Persist auth session in localStorage for better UX
      persistSession: true,
      // Automatically refresh tokens before expiry
      autoRefreshToken: true,
      // Detect session changes across tabs
      detectSessionInUrl: true,
      // Storage key for session persistence
      storageKey: 'caetaria-auth-token',
    },
    // Enable real-time features
    realtime: {
      params: {
        // Enable presence tracking if needed
        eventsPerSecond: 10,
      }
    },
    // Client-specific configurations
    global: {
      headers: {
        'X-Client-Info': 'caetaria-browser@1.0.0',
      },
    },
  }
);

/**
 * Helper function to check if we're in a browser environment
 * Useful for SSR-safe operations
 */
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Safe browser client access
 * Returns null during SSR to prevent hydration mismatches
 */
export const getSafeSupabaseClient = () => {
  if (!isBrowser()) {
    return null;
  }
  return supabase;
};

/**
 * Auth state helpers for client-side components
 */
export const authHelpers = {
  /**
   * Get current session (client-side only)
   */
  async getCurrentSession() {
    if (!isBrowser()) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  },

  /**
   * Get current user (client-side only)
   */
  async getCurrentUser() {
    if (!isBrowser()) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  },

  /**
   * Sign out user
   */
  async signOut() {
    if (!isBrowser()) return { error: new Error('Not in browser environment') };

    const { error } = await supabase.auth.signOut();
    return { error };
  }
};

/**
 * Type exports for better TypeScript integration
 */
export type SupabaseClient = typeof supabase;
export type { Database };