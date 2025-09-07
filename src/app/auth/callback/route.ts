import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

interface OnboardingSession {
  id: string;
  current_step: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

interface UserProfile {
  id: string;
  created_at: string;
  onboarding_completed: boolean;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('Auth callback initiated:', { code: !!code, next, error });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', { error, errorDescription });
    // Track authentication failure
    // TODO: Add analytics tracking for auth errors

    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    console.error('No authorization code provided');
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'Invalid authentication request.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createClient();

    // Exchange code for session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Get user error:', userError);
      throw new Error(`Failed to get user data: ${userError?.message || 'User not found'}`);
    }

    console.log('User authenticated successfully:', { userId: user.id, email: user.email });

    // Check if user is new (created within the last minute)
    const isNewUser = await checkIfNewUser(supabase, user.id);
    console.log('User status:', { isNewUser, userId: user.id });

    if (isNewUser) {
      // Track new user registration
      console.log('New user detected, tracking registration event');
      // TODO: Add analytics tracking for new user registration

      // For new users, check if onboarding session was created by trigger
      const onboardingSession = await getOrCreateOnboardingSession(supabase, user.id);

      if (onboardingSession) {
        console.log('Redirecting new user to onboarding');
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
      } else {
        console.error('Failed to create onboarding session for new user');
        throw new Error('Failed to initialize onboarding session');
      }
    }

    // For existing users, check their onboarding status
    const userProfile = await getUserProfile(supabase, user.id);

    if (!userProfile?.onboarding_completed) {
      // User has not completed onboarding, check for active session
      const onboardingSession = await getOnboardingSession(supabase, user.id);

      if (onboardingSession && onboardingSession.status !== 'completed') {
        // Redirect to current step in onboarding
        const currentStep = onboardingSession.current_step || 'business-info';
        console.log('Redirecting existing user to onboarding step:', currentStep);
        return NextResponse.redirect(new URL(`/onboarding/${currentStep}`, requestUrl.origin));
      } else {
        // No active session, create new one and start onboarding
        console.log('Creating new onboarding session for existing user');
        const newSession = await getOrCreateOnboardingSession(supabase, user.id);

        if (newSession) {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
        } else {
          console.error('Failed to create onboarding session for existing user');
          throw new Error('Failed to initialize onboarding session');
        }
      }
    }

    // User has completed onboarding, redirect to intended destination
    const finalRedirect = next || '/dashboard';
    console.log('User has completed onboarding, redirecting to:', finalRedirect);

    // Track successful login
    console.log('Tracking successful login event');
    // TODO: Add analytics tracking for successful login

    return NextResponse.redirect(new URL(finalRedirect, requestUrl.origin));

  } catch (error) {
    console.error('Auth callback error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: user?.id || 'unknown'
    });

    // Track authentication error
    // TODO: Add analytics tracking for auth callback errors

    // Provide user-friendly error message
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    const errorMessage = error instanceof Error && error.message.includes('Failed to create session')
      ? 'Authentication session could not be established. Please try again.'
      : error instanceof Error && error.message.includes('Failed to get user')
      ? 'Unable to retrieve your account information. Please try again.'
      : error instanceof Error && error.message.includes('onboarding')
      ? 'There was an issue setting up your account. Please contact support.'
      : 'Authentication failed. Please try again.';

    loginUrl.searchParams.set('error', errorMessage);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Check if user is new (created within the last minute)
 */
async function checkIfNewUser(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('created_at, onboarding_completed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking user profile:', error);
      return false;
    }

    if (!profile) {
      return false;
    }

    // Check if user was created within the last minute
    const createdAt = new Date(profile.created_at);
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const isRecentlyCreated = createdAt > oneMinuteAgo;

    // Also check if onboarding_completed is false (additional indicator)
    const hasNotCompletedOnboarding = !profile.onboarding_completed;

    console.log('User profile check:', {
      userId,
      createdAt: createdAt.toISOString(),
      oneMinuteAgo: oneMinuteAgo.toISOString(),
      isRecentlyCreated,
      hasNotCompletedOnboarding,
      isNewUser: isRecentlyCreated && hasNotCompletedOnboarding
    });

    return isRecentlyCreated && hasNotCompletedOnboarding;
  } catch (error) {
    console.error('Error checking if user is new:', error);
    return false;
  }
}

/**
 * Get user profile information
 */
async function getUserProfile(supabase: any, userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, created_at, onboarding_completed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get existing onboarding session
 */
async function getOnboardingSession(supabase: any, userId: string): Promise<OnboardingSession | null> {
  try {
    const { data: session, error } = await supabase
      .from('onboarding_sessions')
      .select('id, current_step, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('No onboarding session found for user:', userId);
        return null;
      }
      console.error('Error getting onboarding session:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error fetching onboarding session:', error);
    return null;
  }
}

/**
 * Get existing onboarding session or create a new one
 */
async function getOrCreateOnboardingSession(supabase: any, userId: string): Promise<OnboardingSession | null> {
  try {
    // First, try to get existing session
    const session = await getOnboardingSession(supabase, userId);

    if (session) {
      console.log('Found existing onboarding session:', session.id);
      return session;
    }

    // If no session exists, create one
    // Note: This should normally be handled by the database trigger, but we handle it here as fallback
    console.log('Creating new onboarding session for user:', userId);

    const { data: newSession, error } = await supabase
      .from('onboarding_sessions')
      .insert({
        user_id: userId,
        current_step: 'business-info',
        status: 'in_progress',
        progress: {}
      })
      .select('id, current_step, status')
      .single();

    if (error) {
      console.error('Error creating onboarding session:', error);
      return null;
    }

    console.log('Created new onboarding session:', newSession.id);
    return newSession;
  } catch (error) {
    console.error('Error getting or creating onboarding session:', error);
    return null;
  }
}