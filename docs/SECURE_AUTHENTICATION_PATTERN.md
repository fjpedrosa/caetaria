# Secure Authentication Pattern

## Overview

This document describes the secure authentication pattern implemented in the Neptunik application. The pattern ensures that authentication tokens are never exposed to client-side JavaScript, preventing XSS attacks and other security vulnerabilities.

## Security Principles

1. **Tokens in httpOnly Cookies Only**: Authentication tokens (access_token, refresh_token) are stored exclusively in httpOnly cookies managed by Supabase
2. **Server-Side Validation**: All authentication validation happens on the server using cookies
3. **No Client-Side Token Storage**: Tokens are NEVER stored in Redux, localStorage, or any client-accessible storage
4. **Props-Based User Data**: User profile data flows from Server Components to Client Components via props

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────────────────────────────────────────┤
│  httpOnly Cookies (Secure)  │  JavaScript (Client)          │
│  ├── access_token           │  ├── Redux Store              │
│  └── refresh_token          │  │   ├── user (profile only)  │
│      ↑                      │  │   └── NO TOKENS!           │
│      │                      │  └── React Components         │
├──────┼──────────────────────┴────────────────────────────────┤
│      │                     Server                            │
│      ↓                                                       │
│  middleware.ts                                               │
│  ├── updateSession() - Validates & refreshes cookies        │
│  ├── protectedRoutes() - Enforces auth requirements         │
│  └── authCallback() - Handles OAuth callbacks               │
│                                                              │
│  Server Components (RSC)                                     │
│  ├── layout.tsx - Gets user via getAuthenticatedUser()      │
│  ├── page.tsx - Can require auth with requireAuth()         │
│  └── Pass user data to Client Components via props          │
└──────────────────────────────────────────────────────────────┘
```

## Implementation Files

### Core Authentication Files

- `/src/lib/supabase/middleware.ts` - Middleware authentication handlers
- `/src/lib/supabase/server-auth.ts` - Server-side auth helpers
- `/src/middleware.ts` - Next.js middleware with auth checks

### State Management

- `/src/shared/state/slices/auth-slice.ts` - Redux auth state (user profile only, NO tokens)
- `/src/components/auth-listener.tsx` - Syncs Supabase auth events with Redux

### Hooks & Utilities

- `/src/hooks/use-secure-auth.ts` - Client-side auth actions with router.refresh()
- `/src/components/auth-provider-server.tsx` - Server component auth provider
- `/src/components/auth-provider-client.tsx` - Client component auth receiver

## Usage Patterns

### 1. Protected Server Component (Recommended)

```tsx
// app/dashboard/layout.tsx
import { requireAuth } from '@/lib/supabase/server-auth';

export default async function DashboardLayout({ children }) {
  // Validates httpOnly cookie on server
  const user = await requireAuth('/auth/login');
  
  return (
    <div>
      <header>Welcome, {user.email}</header>
      {children}
    </div>
  );
}
```

### 2. Optional Authentication Check

```tsx
// app/page.tsx
import { getAuthenticatedUser } from '@/lib/supabase/server-auth';

export default async function HomePage() {
  const user = await getAuthenticatedUser(); // Returns null if not authenticated
  
  return (
    <div>
      {user ? `Welcome back, ${user.name}` : 'Please sign in'}
    </div>
  );
}
```

### 3. Client Component with Auth Data

```tsx
// components/user-menu.tsx
'use client';

import { useSelector } from 'react-redux';
import { selectUser } from '@/shared/state/slices/auth-slice';

export function UserMenu() {
  // User data comes from Redux, populated by server via props
  const user = useSelector(selectUser);
  
  if (!user) return null;
  
  return <div>{user.email}</div>;
}
```

### 4. Authentication Actions

```tsx
// components/login-form.tsx
'use client';

import { useSecureAuth } from '@/hooks/use-secure-auth';

export function LoginForm() {
  const { signInWithEmail, loading, error } = useSecureAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signInWithEmail(email, password);
    // router.refresh() is called automatically
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Authentication Flow

### Login Flow

1. User submits credentials in client component
2. Supabase sets httpOnly cookies with tokens
3. `router.refresh()` triggers Server Component re-render
4. Server Component validates cookies and fetches user
5. User data passed to Client Components via props
6. Redux updated with user profile (no tokens)

### Logout Flow

1. User clicks logout in client component
2. Supabase clears httpOnly cookies
3. `router.refresh()` triggers Server Component re-render
4. Server Component sees no valid session
5. Redux cleared of user data

### Session Refresh

1. Middleware automatically refreshes expiring sessions
2. New tokens set in httpOnly cookies
3. Transparent to client-side code

## Security Benefits

✅ **XSS Protection**: Tokens in httpOnly cookies cannot be accessed by JavaScript
✅ **CSRF Protection**: SameSite cookie attribute prevents cross-site requests  
✅ **No Token Leakage**: Tokens never appear in Redux DevTools or console
✅ **Server Validation**: Every request validated server-side
✅ **Automatic Refresh**: Sessions refresh without client involvement

## Common Mistakes to Avoid

❌ **DON'T** store tokens in Redux state
❌ **DON'T** use localStorage or sessionStorage for tokens
❌ **DON'T** pass tokens as props to client components
❌ **DON'T** validate auth purely on client side
❌ **DON'T** expose token refresh logic to client

## Testing Checklist

- [ ] Verify no tokens in Redux DevTools
- [ ] Check httpOnly cookies in Browser DevTools > Application > Cookies
- [ ] Test protected routes redirect when not authenticated
- [ ] Verify session refresh works seamlessly
- [ ] Confirm XSS attempts cannot access tokens
- [ ] Test OAuth flow with proper redirects
- [ ] Verify server-side validation on API routes

## Migration from Insecure Pattern

If migrating from a pattern that stores tokens in Redux:

1. Remove token fields from auth state types
2. Update auth slice to exclude tokens
3. Modify auth listener to not pass tokens
4. Add server-side auth helpers
5. Update layouts to use server-side auth
6. Refactor client components to receive user via props
7. Update auth actions to use router.refresh()

## Maintenance Notes

- Always validate auth in middleware or Server Components
- Use `router.refresh()` after auth state changes
- Keep Redux for UI state only, not security state
- Regular security audits of auth flow
- Monitor for unauthorized token access attempts