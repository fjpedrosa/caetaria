'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { supabase } from '@/lib/supabase/client';
import {
  initializeAuth,
  updateSession,
  updateUser
} from '@/shared/state/slices/auth-slice';
import type { AppDispatch } from '@/shared/state/store';

/**
 * Auth Listener Component
 *
 * This component listens to Supabase auth state changes
 * and updates the Redux store accordingly.
 *
 * Should be mounted once at the app root level.
 */
export const AuthListener: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize auth state on mount
    dispatch(initializeAuth());

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthListener] Auth state change:', event, session?.user?.email);

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              // Map Supabase session to our domain model
              // SECURITY: Never store tokens in Redux - they're in httpOnly cookies
              const mappedSession = {
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0],
                  avatar: session.user.user_metadata?.avatar_url ||
                          session.user.user_metadata?.picture,
                  provider: session.user.app_metadata?.provider || 'email',
                  createdAt: new Date(session.user.created_at),
                  updatedAt: new Date(session.user.updated_at || session.user.created_at),
                },
                expiresAt: new Date(session.expires_at! * 1000),
                // Tokens are managed securely in httpOnly cookies by Supabase
              };
              dispatch(updateSession(mappedSession));
              console.log('[AuthListener] User signed in:', mappedSession.user.email);
            }
            break;

          case 'SIGNED_OUT':
            dispatch(updateSession(null));
            console.log('[AuthListener] User signed out');
            break;

          case 'TOKEN_REFRESHED':
            if (session) {
              // SECURITY: Token refresh is handled in httpOnly cookies
              // We only update the user data and expiry, not the tokens
              const mappedSession = {
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.full_name ||
                        session.user.user_metadata?.name ||
                        session.user.email?.split('@')[0],
                  avatar: session.user.user_metadata?.avatar_url ||
                          session.user.user_metadata?.picture,
                  provider: session.user.app_metadata?.provider || 'email',
                  createdAt: new Date(session.user.created_at),
                  updatedAt: new Date(session.user.updated_at || session.user.created_at),
                },
                expiresAt: new Date(session.expires_at! * 1000),
              };
              dispatch(updateSession(mappedSession));
              console.log('[AuthListener] Token refreshed (stored in httpOnly cookies)');
            }
            break;

          case 'USER_UPDATED':
            if (session?.user) {
              const updatedUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name ||
                      session.user.user_metadata?.name ||
                      session.user.email?.split('@')[0],
                avatar: session.user.user_metadata?.avatar_url ||
                        session.user.user_metadata?.picture,
                provider: session.user.app_metadata?.provider || 'email',
                createdAt: new Date(session.user.created_at),
                updatedAt: new Date(session.user.updated_at || session.user.created_at),
              };
              dispatch(updateUser(updatedUser));
              console.log('[AuthListener] User updated:', updatedUser.email);
            }
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};