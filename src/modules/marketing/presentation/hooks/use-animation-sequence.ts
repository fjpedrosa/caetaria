
import { useCallback,useEffect, useState } from 'react';

// Domain types - these will be moved to domain/types.ts later
export type MessagePhase = 'initial' | 'customer_typing1' | 'customer1' | 'message_read1' |
  'badge_ai' | 'bot_typing1' | 'bot1' | 'customer_typing2' | 'customer2' | 'message_read2' |
  'bot_typing2' | 'bot2' | 'badge_flow' | 'flow' | 'badge_crm' | 'complete';

export type BadgeType = 'ai' | 'flow' | 'crm';

export interface AnimationSequenceState {
  // Core animation state
  messagePhase: MessagePhase;
  isCustomerTyping: boolean;
  isBotTyping: boolean;

  // Message read states
  message1Read: boolean;
  message2Read: boolean;

  // Flow control
  showFlow: boolean;

  // Badge system
  activeBadge: BadgeType | null;
}

export interface AnimationSequenceOptions {
  isInView: boolean;
  onFlowStart?: () => void;
  customSequence?: AnimationStep[];
  autoRestart?: boolean;
  restartDelay?: number;
}

export interface AnimationStep {
  phase: MessagePhase;
  delay: number;
  badge: BadgeType | null;
}

export interface AnimationSequenceResult extends AnimationSequenceState {
  // Control functions
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  jumpToPhase: (phase: MessagePhase) => void;

  // State queries
  isAnimating: boolean;
  isComplete: boolean;
  currentStepIndex: number;
  totalSteps: number;
}

// Default animation sequence configuration
const DEFAULT_ANIMATION_SEQUENCE: AnimationStep[] = [
  { phase: 'customer_typing1', delay: 4500, badge: null },
  { phase: 'customer1', delay: 5000, badge: null },
  { phase: 'message_read1', delay: 5200, badge: null },
  { phase: 'badge_ai', delay: 5800, badge: 'ai' },
  { phase: 'bot_typing1', delay: 6000, badge: null },
  { phase: 'bot1', delay: 7000, badge: null },
  { phase: 'customer_typing2', delay: 9500, badge: null },
  { phase: 'customer2', delay: 10000, badge: null },
  { phase: 'message_read2', delay: 10200, badge: null },
  { phase: 'bot_typing2', delay: 11000, badge: null },
  { phase: 'bot2', delay: 12000, badge: null },
  { phase: 'badge_flow', delay: 14000, badge: 'flow' },
  { phase: 'flow', delay: 15500, badge: null },
  { phase: 'badge_crm', delay: 21000, badge: 'crm' },
  { phase: 'complete', delay: 23000, badge: null }
];

export const useAnimationSequence = (
  options: AnimationSequenceOptions = { isInView: false }
): AnimationSequenceResult => {
  const {
    isInView,
    onFlowStart,
    customSequence = DEFAULT_ANIMATION_SEQUENCE,
    autoRestart = true,
    restartDelay = 30000
  } = options;

  // Animation state
  const [messagePhase, setMessagePhase] = useState<MessagePhase>('initial');
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [message1Read, setMessage1Read] = useState(false);
  const [message2Read, setMessage2Read] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [activeBadge, setActiveBadge] = useState<BadgeType | null>(null);

  // Control state
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Timer management
  const [timers, setTimers] = useState<NodeJS.Timeout[]>([]);

  // Clear all timers utility
  const clearAllTimers = useCallback(() => {
    timers.forEach(clearTimeout);
    setTimers([]);
  }, [timers]);

  // Reset animation state
  const resetAnimation = useCallback(() => {
    setMessagePhase('initial');
    setIsCustomerTyping(false);
    setIsBotTyping(false);
    setMessage1Read(false);
    setMessage2Read(false);
    setShowFlow(false);
    setActiveBadge(null);
    setIsAnimating(false);
    setCurrentStepIndex(0);
    clearAllTimers();
  }, [clearAllTimers]);

  // Process animation step
  const processAnimationStep = useCallback((step: AnimationStep, index: number) => {
    const { phase, badge } = step;

    // Handle typing states
    if (phase === 'customer_typing1' || phase === 'customer_typing2') {
      setIsCustomerTyping(true);
      setIsBotTyping(false);
    } else if (phase === 'bot_typing1' || phase === 'bot_typing2') {
      setIsCustomerTyping(false);
      setIsBotTyping(true);
    } else {
      setIsCustomerTyping(false);
      setIsBotTyping(false);
    }

    // Handle read states
    if (phase === 'message_read1') {
      setMessage1Read(true);
    } else if (phase === 'message_read2') {
      setMessage2Read(true);
    }

    // Handle badge display
    if (badge) {
      setActiveBadge(badge);
    } else if (phase !== 'badge_ai' && phase !== 'badge_flow' && phase !== 'badge_crm') {
      setActiveBadge(null);
    }

    // Handle flow display
    if (phase === 'flow') {
      setShowFlow(true);
      onFlowStart?.();
    }

    setMessagePhase(phase);
    setCurrentStepIndex(index);

    // Check if animation is complete
    if (index === customSequence.length - 1) {
      setIsAnimating(false);
    }
  }, [customSequence.length, onFlowStart]);

  // Start animation sequence
  const startAnimation = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    clearAllTimers();

    const newTimers: NodeJS.Timeout[] = [];

    customSequence.forEach((step, index) => {
      const timer = setTimeout(() => {
        processAnimationStep(step, index);
      }, step.delay);
      newTimers.push(timer);
    });

    // Auto-restart animation if enabled
    if (autoRestart) {
      const restartTimer = setTimeout(() => {
        resetAnimation();
      }, restartDelay);
      newTimers.push(restartTimer);
    }

    setTimers(newTimers);
  }, [
    isAnimating,
    customSequence,
    processAnimationStep,
    autoRestart,
    restartDelay,
    clearAllTimers,
    resetAnimation
  ]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    clearAllTimers();
  }, [clearAllTimers]);

  // Jump to specific phase
  const jumpToPhase = useCallback((phase: MessagePhase) => {
    const stepIndex = customSequence.findIndex(step => step.phase === phase);
    if (stepIndex !== -1) {
      const step = customSequence[stepIndex];
      processAnimationStep(step, stepIndex);
    }
  }, [customSequence, processAnimationStep]);

  // Auto-start animation when in view
  useEffect(() => {
    if (isInView && !isAnimating && messagePhase === 'initial') {
      startAnimation();
    }
  }, [isInView, isAnimating, messagePhase, startAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Computed values
  const isComplete = messagePhase === 'complete';
  const totalSteps = customSequence.length;

  return {
    // Animation state
    messagePhase,
    isCustomerTyping,
    isBotTyping,
    message1Read,
    message2Read,
    showFlow,
    activeBadge,

    // Control functions
    startAnimation,
    stopAnimation,
    resetAnimation,
    jumpToPhase,

    // State queries
    isAnimating,
    isComplete,
    currentStepIndex,
    totalSteps
  };
};

// Utility functions for animation sequence manipulation
export const animationSequenceHelpers = {
  // Create custom sequence with different timings
  createSequence: (baseSequence: AnimationStep[], speedMultiplier: number = 1): AnimationStep[] => {
    return baseSequence.map(step => ({
      ...step,
      delay: step.delay * speedMultiplier
    }));
  },

  // Filter sequence to include only certain badge types
  filterByBadgeType: (sequence: AnimationStep[], badgeTypes: (BadgeType | null)[]): AnimationStep[] => {
    return sequence.filter(step => badgeTypes.includes(step.badge));
  },

  // Get the next phase in sequence
  getNextPhase: (currentPhase: MessagePhase, sequence: AnimationStep[] = DEFAULT_ANIMATION_SEQUENCE): MessagePhase | null => {
    const currentIndex = sequence.findIndex(step => step.phase === currentPhase);
    const nextStep = sequence[currentIndex + 1];
    return nextStep?.phase || null;
  },

  // Get the previous phase in sequence
  getPreviousPhase: (currentPhase: MessagePhase, sequence: AnimationStep[] = DEFAULT_ANIMATION_SEQUENCE): MessagePhase | null => {
    const currentIndex = sequence.findIndex(step => step.phase === currentPhase);
    const prevStep = sequence[currentIndex - 1];
    return prevStep?.phase || null;
  },

  // Calculate total animation duration
  getTotalDuration: (sequence: AnimationStep[]): number => {
    return Math.max(...sequence.map(step => step.delay));
  },

  // Get phases that include badges
  getBadgePhases: (sequence: AnimationStep[] = DEFAULT_ANIMATION_SEQUENCE): MessagePhase[] => {
    return sequence.filter(step => step.badge !== null).map(step => step.phase);
  },

  // Get phases that show typing indicators
  getTypingPhases: (sequence: AnimationStep[] = DEFAULT_ANIMATION_SEQUENCE): MessagePhase[] => {
    return sequence
      .filter(step => step.phase.includes('typing'))
      .map(step => step.phase);
  }
};