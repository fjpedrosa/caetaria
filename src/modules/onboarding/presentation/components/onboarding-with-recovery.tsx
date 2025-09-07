'use client';

/**
 * Onboarding with Session Recovery
 * Enhanced wrapper component with auth integration and improved UX
 */

import { useEffect, useState } from 'react';
import { Loader2, Shield, Sparkles } from 'lucide-react';

import { useSessionRecovery } from '../hooks/use-session-recovery';

import { OnboardingWizard } from './onboarding-wizard';
import { SessionRecoveryModal } from './session-recovery-modal';

export function OnboardingWithRecovery() {
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    loading,
    hasIncompleteSession,
    session,
    resumeSession,
    startFresh,
    lastActivityDate,
    completionPercentage,
    progressInfo,
    estimatedTimeRemaining,
    userName,
    isAuthenticated,
  } = useSessionRecovery({
    autoCheck: true,
    onRecovered: (session) => {
      console.log('Session recovered for user:', session.user_email || 'anonymous');

      // Track recovery analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'onboarding_session_recovered', {
          session_id: session.id,
          current_step: session.current_step,
          completion_percentage: completionPercentage,
          is_authenticated: isAuthenticated,
        });
      }
    },
  });

  useEffect(() => {
    if (!loading && hasIncompleteSession && !showRecoveryModal) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowRecoveryModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, hasIncompleteSession, showRecoveryModal]);

  const handleResume = async () => {
    setIsTransitioning(true);
    setShowRecoveryModal(false);

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));

    resumeSession();
  };

  const handleStartFresh = async () => {
    setIsTransitioning(true);
    setShowRecoveryModal(false);

    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));

    startFresh();
  };

  // Show loading state while checking for session
  if (loading || isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 rounded-full animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto relative" />
          </div>

          <div className="space-y-2">
            <p className="text-gray-700 font-medium text-lg">
              {isTransitioning ? 'Preparando tu experiencia...' : 'Verificando sesión guardada...'}
            </p>
            {isAuthenticated && userName && (
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                {userName}
              </p>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Recovery Modal */}
      <SessionRecoveryModal
        open={showRecoveryModal}
        onResume={handleResume}
        onStartFresh={handleStartFresh}
        lastActivityDate={lastActivityDate}
        completionPercentage={completionPercentage}
        currentStep={session?.current_step}
        progressInfo={progressInfo}
        estimatedTimeRemaining={estimatedTimeRemaining}
        userName={userName}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Onboarding Wizard */}
      <OnboardingWizard />
    </>
  );
}