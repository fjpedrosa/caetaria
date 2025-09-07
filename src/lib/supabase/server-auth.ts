/**
 * Server-Side Authentication Helpers
 *
 * Secure authentication utilities for Server Components and API routes.
 * These functions work with httpOnly cookies managed by Supabase.
 *
 * SECURITY PRINCIPLES:
 * 1. Authentication is validated server-side using httpOnly cookies
 * 2. Tokens are never exposed to client-side JavaScript
 * 3. User data is passed from Server Components to Client Components via props
 * 4. Session refresh happens automatically via middleware
 *
 * @module server-auth
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

import type { User } from '@/modules/auth/domain/types';

import type { Database } from './types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Auth features will be disabled.');
}

/**
 * Creates a Supabase client for Server Components
 * This client has access to httpOnly cookies for authentication
 */
export async function createAuthClient() {
  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the authenticated user from Server Components
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createAuthClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Map Supabase user to domain User type
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0],
      avatar: user.user_metadata?.avatar_url ||
              user.user_metadata?.picture,
      provider: user.app_metadata?.provider || 'email',
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require authentication for a Server Component
 * Redirects to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/auth/login') {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Check if user is authenticated (for conditional rendering)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return !!user;
}

/**
 * Get session info including expiry (but not tokens)
 */
export async function getSessionInfo() {
  try {
    const supabase = await createAuthClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return {
      user: await getAuthenticatedUser(),
      expiresAt: new Date(session.expires_at! * 1000),
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
}

/**
 * Sign out the user (clears httpOnly cookies)
 */
export async function signOut() {
  try {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

/**
 * Refresh the user's session
 * This is typically handled automatically by middleware
 */
export async function refreshSession() {
  try {
    const supabase = await createAuthClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

/**
 * Helper for protected API routes
 * Use this in API route handlers to validate authentication
 */
export async function validateApiAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return user;
}