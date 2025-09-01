/**
 * useHeroMobileDemo - Main orchestrator hook for hero mobile demo
 * Combines all specialized hooks following Clean Architecture principles
 * This is the main hook that the container component will use
 */

import { useCallback } from 'react';

import {
  type AnimationSequenceOptions,
  type AnimationSequenceResult,
  useAnimationSequence} from './use-animation-sequence';
import {
  type HeroBadgeSystemOptions,
  type HeroBadgeSystemResult,
  useHeroBadgeSystem} from './use-hero-badge-system';
import {
  type HeroFlowSequenceOptions,
  type HeroFlowSequenceResult,
  useHeroFlowSequence} from './use-hero-flow-sequence';

export interface HeroMobileDemoOptions {
  // Core options
  isInView: boolean;

  // Animation options
  animationOptions?: Partial<AnimationSequenceOptions>;

  // Badge system options
  badgeOptions?: HeroBadgeSystemOptions;

  // Flow sequence options
  flowOptions?: HeroFlowSequenceOptions;

  // Event callbacks
  onFlowStart?: () => void;
  onFlowComplete?: () => void;
  onBadgeShow?: (badgeType: string) => void;
  onAnimationComplete?: () => void;
}

export interface HeroMobileDemoResult {
  // Animation state and controls
  animation: AnimationSequenceResult;

  // Badge system
  badges: HeroBadgeSystemResult;

  // Flow sequence
  flow: HeroFlowSequenceResult;

  // Derived state for easy consumption
  derivedState: {
    currentBadge: ReturnType<HeroBadgeSystemResult['getBadgeForPhase']>;
    isTyping: boolean;
    messagePhase: AnimationSequenceResult['messagePhase'];
    shouldShowFlow: boolean;
    flowStep: HeroFlowSequenceResult['flowStep'];
    reservationData: HeroFlowSequenceResult['reservationData'];
  };

  // Coordinated actions
  actions: {
    startDemo: () => void;
    stopDemo: () => void;
    resetDemo: () => void;
    restartDemo: () => void;
  };
}

/**
 * Main hero mobile demo hook that orchestrates all business logic
 * This hook combines animation sequencing, badge management, and flow control
 * into a cohesive demo experience
 */
export const useHeroMobileDemo = (
  options: HeroMobileDemoOptions
): HeroMobileDemoResult => {
  const {
    isInView,
    animationOptions = {},
    badgeOptions = {},
    flowOptions = {},
    onFlowStart,
    onFlowComplete,
    onBadgeShow,
    onAnimationComplete
  } = options;

  // ============================================================================
  // HOOK ORCHESTRATION
  // ============================================================================

  // Flow sequence hook - must be initialized first
  const flow = useHeroFlowSequence({
    ...flowOptions,
    onFlowComplete: (data) => {
      onFlowComplete?.();
      flowOptions.onFlowComplete?.(data);
    }
  });

  // Animation sequence hook with flow integration
  const animation = useAnimationSequence({
    isInView,
    onFlowStart: () => {
      flow.startFlowSequence();
      onFlowStart?.();
    },
    ...animationOptions
  });

  // Badge system hook
  const badges = useHeroBadgeSystem(badgeOptions);

  // ============================================================================
  // DERIVED STATE COMPUTATION
  // ============================================================================

  // Get current badge based on animation phase
  const currentBadge = badges.getBadgeForPhase(animation.messagePhase);

  // Determine if any typing indicator should be shown
  const isTyping = animation.isCustomerTyping || animation.isBotTyping;

  // Determine if flow should be shown based on animation state
  const shouldShowFlow = animation.showFlow && flow.isFlowActive;

  // ============================================================================
  // COORDINATED ACTIONS
  // ============================================================================

  // Start the complete demo experience
  const startDemo = useCallback(() => {
    flow.resetFlow();
    animation.resetAnimation();
    animation.startAnimation();
  }, [animation, flow]);

  // Stop all demo activities
  const stopDemo = useCallback(() => {
    animation.stopAnimation();
    flow.stopFlowSequence();
  }, [animation, flow]);

  // Reset everything to initial state
  const resetDemo = useCallback(() => {
    animation.resetAnimation();
    flow.resetFlow();
  }, [animation, flow]);

  // Restart the demo from beginning
  const restartDemo = useCallback(() => {
    resetDemo();
    // Small delay to ensure reset is complete
    setTimeout(() => {
      startDemo();
    }, 100);
  }, [resetDemo, startDemo]);

  // ============================================================================
  // SIDE EFFECTS COORDINATION
  // ============================================================================

  // Handle badge show events
  React.useEffect(() => {
    if (currentBadge) {
      onBadgeShow?.(currentBadge.id);
    }
  }, [currentBadge, onBadgeShow]);

  // Handle animation completion
  React.useEffect(() => {
    if (animation.isComplete) {
      onAnimationComplete?.();
    }
  }, [animation.isComplete, onAnimationComplete]);

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Raw hook results for advanced usage
    animation,
    badges,
    flow,

    // Derived state for easy consumption
    derivedState: {
      currentBadge,
      isTyping,
      messagePhase: animation.messagePhase,
      shouldShowFlow,
      flowStep: flow.flowStep,
      reservationData: flow.reservationData
    },

    // Coordinated actions
    actions: {
      startDemo,
      stopDemo,
      resetDemo,
      restartDemo
    }
  };
};

// ============================================================================
// UTILITIES AND HELPERS
// ============================================================================

/**
 * Performance monitoring hook for hero mobile demo
 * Tracks metrics and performance indicators
 */
export const useHeroMobileDemoPerformance = (demoResult: HeroMobileDemoResult) => {
  const [metrics, setMetrics] = React.useState({
    renderCount: 0,
    lastAnimationDuration: 0,
    memoryUsage: 0,
    badgeShownCount: 0,
    flowCompletionCount: 0
  });

  // Track renders
  React.useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1
    }));
  });

  // Track badge shows
  React.useEffect(() => {
    if (demoResult.derivedState.currentBadge) {
      setMetrics(prev => ({
        ...prev,
        badgeShownCount: prev.badgeShownCount + 1
      }));
    }
  }, [demoResult.derivedState.currentBadge]);

  // Track flow completions
  React.useEffect(() => {
    if (demoResult.animation.isComplete) {
      setMetrics(prev => ({
        ...prev,
        flowCompletionCount: prev.flowCompletionCount + 1
      }));
    }
  }, [demoResult.animation.isComplete]);

  return metrics;
};

/**
 * Debug hook for hero mobile demo
 * Provides debugging information in development
 */
export const useHeroMobileDemoDebug = (demoResult: HeroMobileDemoResult) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const debugInfo = React.useMemo(() => ({
    animation: {
      phase: demoResult.animation.messagePhase,
      isAnimating: demoResult.animation.isAnimating,
      currentStep: demoResult.animation.currentStepIndex,
      totalSteps: demoResult.animation.totalSteps,
      isComplete: demoResult.animation.isComplete
    },
    badges: {
      currentBadge: demoResult.derivedState.currentBadge?.id || null,
      availableBadges: Object.keys(demoResult.badges.badges)
    },
    flow: {
      isActive: demoResult.flow.isFlowActive,
      currentStep: demoResult.flow.flowStep,
      progress: demoResult.flow.getProgress(),
      hasData: demoResult.flow.reservationData.guests > 0
    },
    ui: {
      shouldShowFlow: demoResult.derivedState.shouldShowFlow,
      isTyping: demoResult.derivedState.isTyping
    }
  }), [demoResult]);

  // Log state changes in development
  React.useEffect(() => {
    console.log('[HeroMobileDemo Debug]', debugInfo);
  }, [debugInfo]);

  return debugInfo;
};

// Add React import at the top since we're using React.useEffect
import React from 'react';