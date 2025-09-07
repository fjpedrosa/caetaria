'use client';

/**
 * Session Recovery Hook
 * Manages recovery of incomplete onboarding sessions with auth integration
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContext } from '@/contexts/auth-context';

interface OnboardingSession {
  id: string;
  current_step: string;
  completed_steps: string[];
  step_data: Record<string, any>;
  last_activity_at: string;
  recovery_token: string;
  status: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
}

interface UseSessionRecoveryOptions {
  flowId?: string;
  onRecovered?: (session: OnboardingSession) => void;
  autoCheck?: boolean;
}

// Total steps for accurate percentage calculation
const TOTAL_STEPS = 7;

// Step configuration with enhanced metadata
const stepConfig: Record<string, {
  route: string;
  name: string;
  estimatedMinutes: number;
  order: number;
}> = {
  'business-info': {
    route: '/onboarding/business',
    name: 'Información del Negocio',
    estimatedMinutes: 3,
    order: 1
  },
  'whatsapp-integration': {
    route: '/onboarding/integration',
    name: 'Integración de WhatsApp',
    estimatedMinutes: 5,
    order: 2
  },
  'phone-verification': {
    route: '/onboarding/verification',
    name: 'Verificación del Teléfono',
    estimatedMinutes: 2,
    order: 3
  },
  'bot-setup': {
    route: '/onboarding/bot-setup',
    name: 'Configuración del Bot',
    estimatedMinutes: 4,
    order: 4
  },
  'testing': {
    route: '/onboarding/testing',
    name: 'Pruebas',
    estimatedMinutes: 3,
    order: 5
  },
  'customization': {
    route: '/onboarding/customization',
    name: 'Personalización',
    estimatedMinutes: 3,
    order: 6
  },
  'completion': {
    route: '/onboarding/completion',
    name: 'Finalización',
    estimatedMinutes: 1,
    order: 7
  }
};

export function useSessionRecovery(options: UseSessionRecoveryOptions = {}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [hasIncompleteSession, setHasIncompleteSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedThisSession, setHasCheckedThisSession] = useState(false);

  const { flowId = 'default', onRecovered, autoCheck = true } = options;

  // Check for existing incomplete session
  const checkForSession = useCallback(async () => {
    // Only show modal once per browser session
    if (hasCheckedThisSession) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Check URL for recovery token first
      const urlParams = new URLSearchParams(window.location.search);
      const recoveryToken = urlParams.get('recovery');

      let url = `/api/onboarding/get-session?flowId=${flowId}`;

      // Add user context if authenticated
      if (isAuthenticated && user) {
        url += `&userId=${user.id}`;
      }

      if (recoveryToken) {
        url += `&recoveryToken=${recoveryToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session && data.session.status !== 'completed') {
          // Enhance session with user data if available
          const enhancedSession = {
            ...data.session,
            user_id: user?.id || data.session.user_id,
            user_email: user?.email || data.session.user_email,
            user_name: user?.name || data.session.user_name,
          };

          setSession(enhancedSession);
          setHasIncompleteSession(true);
          setHasCheckedThisSession(true);

          // Store in sessionStorage to prevent repeated checks
          sessionStorage.setItem('onboarding_recovery_checked', 'true');

          return enhancedSession;
        }
      }
    } catch (err) {
      console.error('Error checking for session:', err);
      setError('Error al buscar sesión guardada');
    } finally {
      setLoading(false);
      setHasCheckedThisSession(true);
    }

    return null;
  }, [flowId, isAuthenticated, user, hasCheckedThisSession]);

  // Resume session at the last saved step
  const resumeSession = useCallback(async () => {
    if (!session) return;

    try {
      const config = stepConfig[session.current_step];
      const nextRoute = config?.route || '/onboarding';

      // Store session data in sessionStorage for the form to use
      sessionStorage.setItem('onboarding_recovery_data', JSON.stringify(session.step_data));
      sessionStorage.setItem('onboarding_recovery_session', JSON.stringify(session));

      // Update session status to indicate recovery
      try {
        await fetch('/api/onboarding/update-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionId: session.id,
            recoveryToken: session.recovery_token,
            action: 'resume',
          }),
        });
      } catch (updateErr) {
        console.error('Error updating session status:', updateErr);
      }

      // Call recovery callback if provided
      if (onRecovered) {
        onRecovered(session);
      }

      // Navigate to the appropriate step
      router.push(nextRoute);
    } catch (err) {
      console.error('Error resuming session:', err);
      setError('Error al recuperar la sesión');
    }
  }, [session, router, onRecovered]);

  // Start fresh session (clear existing)
  const startFresh = useCallback(async () => {
    try {
      // Clear any stored recovery data
      sessionStorage.removeItem('onboarding_recovery_data');
      sessionStorage.removeItem('onboarding_recovery_session');
      sessionStorage.removeItem('onboarding_recovery_checked');

      // Reset session if exists
      if (session) {
        try {
          await fetch('/api/onboarding/update-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              sessionId: session.id,
              action: 'reset',
            }),
          });
        } catch (resetErr) {
          console.error('Error resetting session:', resetErr);
        }
      }

      // Navigate to first step
      router.push('/onboarding');
    } catch (err) {
      console.error('Error starting fresh:', err);
    }
  }, [router, session]);

  // Get recovery data for a specific step
  const getStepData = useCallback((stepName: string) => {
    if (!session?.step_data) return null;
    return session.step_data[stepName] || null;
  }, [session]);

  // Calculate remaining time estimate
  const getRemainingTime = useCallback(() => {
    if (!session) return 0;

    const currentStepConfig = stepConfig[session.current_step];
    if (!currentStepConfig) return 0;

    let totalMinutes = 0;

    // Add time for remaining steps
    Object.values(stepConfig).forEach(step => {
      if (step.order > currentStepConfig.order) {
        totalMinutes += step.estimatedMinutes;
      }
    });

    // Add half the time for current step (assuming partially complete)
    totalMinutes += Math.ceil(currentStepConfig.estimatedMinutes / 2);

    return totalMinutes;
  }, [session]);

  // Get user-friendly progress information
  const getProgressInfo = useCallback(() => {
    if (!session) return null;

    const currentStepConfig = stepConfig[session.current_step];
    if (!currentStepConfig) return null;

    return {
      currentStep: currentStepConfig.order,
      totalSteps: TOTAL_STEPS,
      stepName: currentStepConfig.name,
      estimatedTimeRemaining: getRemainingTime(),
      completedSteps: session.completed_steps.length,
    };
  }, [session, getRemainingTime]);

  // Check for session on mount, but respect autoCheck flag
  useEffect(() => {
    // Check if we've already checked in this browser session
    const alreadyChecked = sessionStorage.getItem('onboarding_recovery_checked');

    if (!alreadyChecked && autoCheck && !hasCheckedThisSession) {
      checkForSession();
    } else {
      setLoading(false);
      setHasCheckedThisSession(true);
    }
  }, [autoCheck, checkForSession, hasCheckedThisSession]);

  // Clean up checked flag when component unmounts
  useEffect(() => {
    return () => {
      // Optionally clear the flag when unmounting
      // sessionStorage.removeItem('onboarding_recovery_checked');
    };
  }, []);

  return {
    // State
    loading,
    session,
    hasIncompleteSession,
    error,
    isAuthenticated,
    user,

    // Actions
    resumeSession,
    startFresh,
    checkForSession,
    getStepData,

    // Computed
    lastActivityDate: session ? new Date(session.last_activity_at) : null,
    completionPercentage: session
      ? Math.round((session.completed_steps.length / TOTAL_STEPS) * 100)
      : 0,
    progressInfo: getProgressInfo(),
    estimatedTimeRemaining: getRemainingTime(),
    currentStepName: session ? stepConfig[session.current_step]?.name : null,
    userName: session?.user_name || user?.name || null,
    userEmail: session?.user_email || user?.email || null,
  };
}