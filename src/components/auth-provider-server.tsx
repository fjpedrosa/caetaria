/**
 * Server-Side Auth Provider Pattern
 *
 * This demonstrates the secure pattern for passing authentication
 * data from Server Components to Client Components.
 *
 * PATTERN:
 * 1. Server Component fetches user data using httpOnly cookies
 * 2. User data is passed as props to Client Components
 * 3. Client Components NEVER access tokens directly
 * 4. Redux is only used for UI state derived from user data
 *
 * Usage in a Server Component (layout.tsx or page.tsx):
 * ```tsx
 * import { AuthProviderServer } from '@/components/auth-provider-server';
 * import { getAuthenticatedUser } from '@/lib/supabase/server-auth';
 *
 * export default async function Layout({ children }) {
 *   const user = await getAuthenticatedUser();
 *
 *   return (
 *     <AuthProviderServer user={user}>
 *       {children}
 *     </AuthProviderServer>
 *   );
 * }
 * ```
 */

import type { User } from '@/modules/auth/domain/types';

import { AuthProviderClient } from './auth-provider-client';

interface AuthProviderServerProps {
  user: User | null;
  children: React.ReactNode;
}

/**
 * Server Component that passes auth data to client components
 */
export function AuthProviderServer({ user, children }: AuthProviderServerProps) {
  return (
    <AuthProviderClient user={user}>
      {children}
    </AuthProviderClient>
  );
}