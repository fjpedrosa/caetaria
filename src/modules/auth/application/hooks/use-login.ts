'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase/client';

import type { UseLoginReturn } from '../../domain/types';

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Wait a moment for the session to be established
      if (data?.session) {
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if user needs onboarding (new user or incomplete onboarding)
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        // Redirect to onboarding if not completed, otherwise to dashboard
        const redirectPath = profile?.onboarding_completed === false ? '/onboarding' : '/dashboard';
        router.push(redirectPath);
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google');
      setLoading(false);
      throw error;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Handle email login form submission
   */
  const handleEmailLogin = async (email: string, password: string) => {
    clearError();

    try {
      await signInWithEmail(email, password);
    } catch {
      // Error is already handled in the hook
    }
  };

  /**
   * Handle Google login button click
   */
  const handleGoogleLogin = async () => {
    clearError();

    try {
      await signInWithGoogle();
    } catch {
      // Error is already handled in the hook
    }
  };

  return {
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    clearError,
    handleEmailLogin,
    handleGoogleLogin,
  };
};
