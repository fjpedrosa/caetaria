'use client';

/**
 * Client-Side Auth Provider
 *
 * Receives user data from Server Components via props.
 * Updates Redux store with user data for UI components.
 *
 * SECURITY PRINCIPLES:
 * - Never stores or accesses tokens
 * - Only handles user profile data for UI rendering
 * - Auth validation happens server-side only
 * - Uses Redux selectors for performance optimization
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import type { User } from '@/modules/auth/domain/types';
import { updateSession } from '@/shared/state/slices/auth-slice';
import type { AppDispatch } from '@/shared/state/store';

interface AuthProviderClientProps {
  user: User | null;
  children: React.ReactNode;
}

export function AuthProviderClient({ user, children }: AuthProviderClientProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Update Redux with user data from server
    // This is for UI components that need user info
    if (user) {
      dispatch(updateSession({
        user,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now (approximate)
        // Note: Actual session expiry is managed server-side
        // This is just for UI hints (e.g., "Session expires in...")
      }));
    } else {
      dispatch(updateSession(null));
    }
  }, [user, dispatch]);

  return <>{children}</>;
}

/**
 * Hook for Client Components to access user data
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { useClientAuth } from '@/components/auth-provider-client';
 *
 * function MyComponent() {
 *   const { user, isAuthenticated } = useClientAuth();
 *
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export function useClientAuth() {
  // This would use Redux selectors
  // For now, returning a placeholder
  return {
    user: null as User | null,
    isAuthenticated: false,
  };
}