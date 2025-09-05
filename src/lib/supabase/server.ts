/**
 * Supabase Server Client
 *
 * Server-side Supabase instance for use in Server Components, API routes, and server actions.
 * Handles cookie-based authentication and server-side rendering requirements.
 *
 * Features:
 * - Cookie-based session management for SSR
 * - Server-side authentication
 * - Optimized for Next.js App Router
 * - Secure server-only operations
 *
 * Usage:
 * ```ts
 * // In Server Components
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('leads').select('*');
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 *
 * // In API Routes
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *   // ... use supabase
 * }
 * ```
 */

import { createServerClient } from '@supabase/ssr';

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
 * Create a Supabase client for server-side operations
 *
 * This function creates a new client instance for each request to ensure
 * proper isolation and authentication context.
 *
 * @returns Promise<SupabaseClient> - Server-configured Supabase client
 */
export async function createClient() {
  // Get cookies from the request
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Cookie configuration for server-side auth
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Ensure secure settings for production
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true,
              });
            });
          } catch (error) {
            // Handle the case where we can't set cookies (e.g., in static generation)
            console.warn('Unable to set cookies in server environment:', error);
          }
        },
      },
      auth: {
        // Server-side auth configuration
        persistSession: false, // Don't persist on server
        autoRefreshToken: false, // Handle token refresh client-side
        detectSessionInUrl: false, // Not needed on server
      },
      // Server-specific configurations
      global: {
        headers: {
          'X-Client-Info': 'neptunik-server@1.0.0',
        },
      },
    }
  );
}

/**
 * Create a Supabase client with service role key for admin operations
 *
 * WARNING: Only use this for server-side admin operations that require
 * bypassing RLS policies. Never expose this to client-side code.
 *
 * @returns Promise<SupabaseClient> - Admin Supabase client
 */
export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'This is required for admin operations. Add it to your .env.local file.'
    );
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true,
              });
            });
          } catch (error) {
            console.warn('Unable to set cookies in admin client:', error);
          }
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'neptunik-admin@1.0.0',
        },
      },
    }
  );
}

/**
 * Server-side authentication helpers
 */
export const serverAuthHelpers = {
  /**
   * Get current user from server-side context
   *
   * @param supabase - Supabase client instance
   * @returns User object or null
   */
  async getUser(supabase: Awaited<ReturnType<typeof createClient>>) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting user from server:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Unexpected error getting user:', error);
      return null;
    }
  },

  /**
   * Get current session from server-side context
   *
   * @param supabase - Supabase client instance
   * @returns Session object or null
   */
  async getSession(supabase: Awaited<ReturnType<typeof createClient>>) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session from server:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Unexpected error getting session:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   *
   * @param supabase - Supabase client instance
   * @returns boolean indicating authentication status
   */
  async isAuthenticated(supabase: Awaited<ReturnType<typeof createClient>>) {
    const user = await this.getUser(supabase);
    return !!user;
  },

  /**
   * Require authenticated user (throws if not authenticated)
   *
   * @param supabase - Supabase client instance
   * @returns User object or throws error
   */
  async requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
    const user = await this.getUser(supabase);

    if (!user) {
      throw new Error('Authentication required. User not found.');
    }

    return user;
  }
};

/**
 * Type exports for better TypeScript integration
 */
export type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;
export type AdminSupabaseClient = Awaited<ReturnType<typeof createAdminClient>>;
export type { Database };