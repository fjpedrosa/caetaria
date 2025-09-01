/**
 * Supabase Middleware Integration
 *
 * Handles authentication and session management at the middleware layer.
 * Ensures proper cookie handling for SSR and authentication flows.
 *
 * Features:
 * - Automatic session refresh
 * - Cookie-based authentication for SSR
 * - Secure token management
 * - Integration with Next.js middleware
 *
 * Usage:
 * ```ts
 * import { updateSession } from '@/lib/supabase/middleware';
 *
 * export async function middleware(request: NextRequest) {
 *   // Handle Supabase auth first
 *   const authResponse = await updateSession(request);
 *   if (authResponse) return authResponse;
 *
 *   // Continue with other middleware logic...
 * }
 * ```
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { Database } from './types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Auth features will be disabled.');
}

/**
 * Update session in middleware
 *
 * This function handles session management in Next.js middleware,
 * ensuring proper authentication state across server and client.
 *
 * @param request - Next.js request object
 * @returns Promise<NextResponse | null> - Response with updated cookies or null
 */
export async function updateSession(request: NextRequest): Promise<NextResponse | null> {
  // Skip if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies in the response
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, {
                ...options,
                // Ensure secure settings
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true,
              });
            });
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            'X-Client-Info': 'caetaria-middleware@1.0.0',
          },
        },
      }
    );

    // Attempt to get the current user
    // This will automatically refresh the session if needed
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('Supabase auth error in middleware:', error.message);
    }

    // Add user context to response headers for server components
    if (user) {
      supabaseResponse.headers.set('x-user-id', user.id);
      supabaseResponse.headers.set('x-user-email', user.email || '');
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Error in Supabase middleware:', error);
    // Return the response even if there's an error to avoid breaking the app
    return supabaseResponse;
  }
}

/**
 * Protected route middleware
 *
 * Redirects unauthenticated users to login page for protected routes.
 *
 * @param request - Next.js request object
 * @param protectedPaths - Array of paths that require authentication
 * @param loginPath - Path to redirect unauthenticated users (default: '/auth/login')
 * @returns Promise<NextResponse | null> - Redirect response or null
 */
export async function protectedRoutes(
  request: NextRequest,
  protectedPaths: string[] = ['/dashboard', '/profile', '/admin'],
  loginPath: string = '/auth/login'
): Promise<NextResponse | null> {
  // Skip if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const path = request.nextUrl.pathname;

  // Check if current path is protected
  const isProtectedRoute = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  );

  if (!isProtectedRoute) {
    return null;
  }

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Don't set cookies in this context
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    // If no user or auth error, redirect to login
    if (!user || error) {
      const redirectUrl = new URL(loginPath, request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }

    return null; // User is authenticated, continue
  } catch (error) {
    console.error('Error in protected routes middleware:', error);
    // Redirect to login on error to be safe
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }
}

/**
 * Auth callback middleware
 *
 * Handles authentication callbacks and code exchanges.
 *
 * @param request - Next.js request object
 * @param callbackPath - Path for auth callbacks (default: '/auth/callback')
 * @param successRedirect - Where to redirect after successful auth (default: '/')
 * @returns Promise<NextResponse | null> - Redirect response or null
 */
export async function authCallback(
  request: NextRequest,
  callbackPath: string = '/auth/callback',
  successRedirect: string = '/'
): Promise<NextResponse | null> {
  // Skip if not callback path or Supabase not configured
  if (!supabaseUrl || !supabaseAnonKey || !request.nextUrl.pathname.startsWith(callbackPath)) {
    return null;
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || successRedirect;

  if (code) {
    try {
      const supabaseResponse = NextResponse.redirect(new URL(redirectTo, request.url));

      const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, value, {
                  ...options,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  httpOnly: true,
                });
              });
            },
          },
        }
      );

      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code);

      return supabaseResponse;
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to error page or login
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  }

  return null;
}

/**
 * Middleware configuration helpers
 */
export const middlewareConfig = {
  /**
   * Default protected paths that require authentication
   */
  defaultProtectedPaths: [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/api/protected'
  ],

  /**
   * Paths that should bypass auth checks
   */
  publicPaths: [
    '/',
    '/auth',
    '/api/public',
    '/api/webhooks',
    '/privacy',
    '/terms',
    '/contact'
  ],

  /**
   * Check if a path is public
   */
  isPublicPath: (pathname: string) => {
    return middlewareConfig.publicPaths.some(path =>
      pathname.startsWith(path)
    );
  },

  /**
   * Check if a path is protected
   */
  isProtectedPath: (pathname: string) => {
    return middlewareConfig.defaultProtectedPaths.some(path =>
      pathname.startsWith(path)
    );
  }
};