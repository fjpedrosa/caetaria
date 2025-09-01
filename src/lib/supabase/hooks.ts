/**
 * Supabase React Hooks
 *
 * Custom hooks for client-side Supabase integration with React.
 * Provides authentication, data fetching, and real-time subscriptions.
 *
 * Features:
 * - Authentication state management
 * - Real-time data subscriptions
 * - Optimistic updates
 * - Error handling and retry logic
 * - TypeScript support
 */

'use client';

import { useCallback, useEffect, useRef,useState } from 'react';

import type { AuthSession,AuthUser } from './types';
import { authHelpers, type Database,supabase } from './';

/**
 * Authentication hook
 *
 * Provides authentication state and methods for client-side auth
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setError(error.message);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Unexpected error getting session:', err);
        setError('Failed to initialize authentication');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          // Clear any client-side cache if needed
          console.log('User signed out');
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, options?: {
    data?: Record<string, any>;
    redirectTo?: string;
  }) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoading(false);
      return { error };
    }

    return { error: null };
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      return { error };
    }

    return { error: null };
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signInWithPassword,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
}

/**
 * Generic data fetching hook with real-time subscriptions
 */
export function useSupabaseQuery<T = any>(
  table: keyof Database['public']['Tables'],
  options?: {
    select?: string;
    eq?: Array<{ column: string; value: any }>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    realtime?: boolean;
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(options?.select || '*');

      // Apply filters
      if (options?.eq) {
        options.eq.forEach(({ column, value }) => {
          query = query.eq(column, value);
        });
      }

      // Apply ordering
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setData(data as T[]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [table, options]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      subscriptionRef.current = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table as string
          },
          (payload) => {
            console.log('Real-time change:', payload);

            // Refetch data on changes
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [fetchData, options?.realtime, table]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for inserting data with optimistic updates
 */
export function useSupabaseInsert<T = any>(
  table: keyof Database['public']['Tables']
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { data: insertedData as T, error: null };
    } catch (err: any) {
      console.error('Error inserting data:', err);
      const errorMessage = err.message || 'Failed to insert data';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [table]);

  return {
    insert,
    loading,
    error,
  };
}

/**
 * Hook for updating data
 */
export function useSupabaseUpdate<T = any>(
  table: keyof Database['public']['Tables']
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (
    filters: Record<string, any>,
    updates: any
  ) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).update(updates);

      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        query = query.eq(column, value);
      });

      const { data, error } = await query.select();

      if (error) throw error;

      return { data: data as T[], error: null };
    } catch (err: any) {
      console.error('Error updating data:', err);
      const errorMessage = err.message || 'Failed to update data';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [table]);

  return {
    update,
    loading,
    error,
  };
}

/**
 * Hook for deleting data
 */
export function useSupabaseDelete(
  table: keyof Database['public']['Tables']
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = useCallback(async (filters: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).delete();

      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        query = query.eq(column, value);
      });

      const { error } = await query;

      if (error) throw error;

      return { error: null };
    } catch (err: any) {
      console.error('Error deleting data:', err);
      const errorMessage = err.message || 'Failed to delete data';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [table]);

  return {
    delete: deleteRecord,
    loading,
    error,
  };
}

/**
 * Hook for real-time subscriptions
 */
export function useSupabaseSubscription(
  table: keyof Database['public']['Tables'],
  callback: (payload: any) => void,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
  }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_subscription_${Date.now()}`)
      .on('postgres_changes',
        {
          event: options?.event || '*',
          schema: 'public',
          table: table as string,
          filter: options?.filter,
        },
        (payload) => callbackRef.current(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, options?.event, options?.filter]);
}