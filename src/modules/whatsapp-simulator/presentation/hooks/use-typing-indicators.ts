/**
 * useTypingIndicators - Hook for typing indicator management
 * Replaces complex RxJS-based typing state with simple timer management
 */

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';

import { ConversationEvent } from '../../domain/events';
import {
  clearAllTypingStates,
  ConversationConfig,
  getActiveTypingSenders,
  logDebug,
  setTypingState} from '../../application/services/conversation-service';

export interface TypingIndicatorsOptions {
  defaultTypingDuration?: number;
  maxTypingDuration?: number;
  onTypingStart?: (sender: string) => void;
  onTypingStop?: (sender: string) => void;
  onTypingStateChange?: (typingStates: Map<string, boolean>) => void;
  config?: ConversationConfig;
}

export interface TypingIndicatorsResult {
  // State management
  typingStates: Map<string, boolean>;
  setUserTyping: (sender: string, isTyping: boolean, duration?: number) => void;
  clearUserTyping: (sender: string) => void;
  clearAllTyping: () => void;

  // Query functions
  isUserTyping: (sender: string) => boolean;
  getTypingUsers: () => string[];
  hasAnyTyping: () => boolean;
  getTypingCount: () => number;

  // Auto-management
  startAutoTyping: (sender: string, duration: number) => void;

  // Event handling
  handleTypingEvent: (event: ConversationEvent) => void;
}

export const useTypingIndicators = (
  options: TypingIndicatorsOptions = {}
): TypingIndicatorsResult => {
  const {
    defaultTypingDuration = 3000,
    maxTypingDuration = 10000,
    onTypingStart,
    onTypingStop,
    onTypingStateChange,
    config
  } = options;

  // Typing state
  const [typingStates, setTypingStates] = useState<Map<string, boolean>>(new Map());

  // Timer management for auto-stop
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear timer for specific user
  const clearUserTimer = useCallback((sender: string) => {
    const timer = typingTimersRef.current.get(sender);
    if (timer) {
      clearTimeout(timer);
      typingTimersRef.current.delete(sender);
      logDebug(config, 'Cleared typing timer', { sender });
    }
  }, [config]);

  // Set user typing state
  const setUserTyping = useCallback((
    sender: string,
    isTyping: boolean,
    duration: number = defaultTypingDuration
  ) => {
    // Clear existing timer for this user
    clearUserTimer(sender);

    // Update typing state
    setTypingStates(prevStates => {
      const newStates = setTypingState(prevStates, sender, isTyping);
      onTypingStateChange?.(newStates);

      logDebug(config, 'Typing state updated', {
        sender,
        isTyping,
        duration: isTyping ? duration : undefined,
        totalTypingUsers: getActiveTypingSenders(newStates).length
      });

      return newStates;
    });

    // Handle typing start/stop callbacks
    if (isTyping) {
      onTypingStart?.(sender);

      // Set auto-stop timer if duration is provided
      if (duration > 0) {
        const clampedDuration = Math.min(duration, maxTypingDuration);
        const timer = setTimeout(() => {
          setUserTyping(sender, false, 0);
        }, clampedDuration);

        typingTimersRef.current.set(sender, timer);
        logDebug(config, 'Set typing auto-stop timer', { sender, duration: clampedDuration });
      }
    } else {
      onTypingStop?.(sender);
    }
  }, [
    defaultTypingDuration,
    maxTypingDuration,
    onTypingStart,
    onTypingStop,
    onTypingStateChange,
    config,
    clearUserTimer
  ]);

  // Clear typing for specific user
  const clearUserTyping = useCallback((sender: string) => {
    setUserTyping(sender, false, 0);
  }, [setUserTyping]);

  // Clear all typing states
  const clearAllTyping = useCallback(() => {
    // Clear all timers
    typingTimersRef.current.forEach((timer, sender) => {
      clearTimeout(timer);
      logDebug(config, 'Cleared typing timer on clear all', { sender });
    });
    typingTimersRef.current.clear();

    // Clear all typing states
    setTypingStates(prevStates => {
      const activeUsers = getActiveTypingSenders(prevStates);

      // Call onTypingStop for all active users
      activeUsers.forEach(sender => {
        onTypingStop?.(sender);
      });

      const newStates = clearAllTypingStates();
      onTypingStateChange?.(newStates);

      logDebug(config, 'Cleared all typing states', {
        clearedUsers: activeUsers.length
      });

      return newStates;
    });
  }, [onTypingStop, onTypingStateChange, config]);

  // Query functions
  const isUserTyping = useCallback((sender: string) => {
    return typingStates.get(sender) === true;
  }, [typingStates]);

  const getTypingUsers = useCallback(() => {
    return getActiveTypingSenders(typingStates);
  }, [typingStates]);

  const hasAnyTyping = useCallback(() => {
    return getActiveTypingSenders(typingStates).length > 0;
  }, [typingStates]);

  const getTypingCount = useCallback(() => {
    return getActiveTypingSenders(typingStates).length;
  }, [typingStates]);

  // Start auto-managed typing (automatically stops after duration)
  const startAutoTyping = useCallback((sender: string, duration: number) => {
    setUserTyping(sender, true, duration);
  }, [setUserTyping]);

  // Handle typing events from conversation events
  const handleTypingEvent = useCallback((event: ConversationEvent) => {
    if (event.type === 'message.typing_started') {
      const payload = event.payload as any;
      if (payload?.message?.sender && payload?.typingDuration) {
        logDebug(config, 'Handling typing started event', {
          sender: payload.message.sender,
          duration: payload.typingDuration
        });

        startAutoTyping(payload.message.sender, payload.typingDuration);
      }
    } else if (event.type === 'message.typing_stopped') {
      const payload = event.payload as any;
      if (payload?.message?.sender) {
        logDebug(config, 'Handling typing stopped event', {
          sender: payload.message.sender
        });

        clearUserTyping(payload.message.sender);
      }
    }
  }, [config, startAutoTyping, clearUserTyping]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      typingTimersRef.current.forEach(timer => clearTimeout(timer));
      typingTimersRef.current.clear();
    };
  }, []);

  return {
    typingStates,
    setUserTyping,
    clearUserTyping,
    clearAllTyping,
    isUserTyping,
    getTypingUsers,
    hasAnyTyping,
    getTypingCount,
    startAutoTyping,
    handleTypingEvent
  };
};

// Hook for typing animations and UI helpers
export interface TypingAnimationOptions {
  animationDuration?: number;
  dotCount?: number;
  dotInterval?: number;
}

export const useTypingAnimation = (
  isTyping: boolean,
  options: TypingAnimationOptions = {}
) => {
  const { animationDuration = 1500, dotCount = 3, dotInterval = 500 } = options;
  const [currentDots, setCurrentDots] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'typing' | 'complete'>('idle');

  useEffect(() => {
    if (!isTyping) {
      setCurrentDots(0);
      setAnimationPhase('idle');
      return;
    }

    setAnimationPhase('typing');

    const interval = setInterval(() => {
      setCurrentDots(prev => (prev + 1) % (dotCount + 1));
    }, dotInterval);

    return () => clearInterval(interval);
  }, [isTyping, dotCount, dotInterval]);

  const typingText = useMemo(() => {
    if (!isTyping) return '';
    return '.'.repeat(currentDots);
  }, [isTyping, currentDots]);

  const typingDisplay = useMemo(() => {
    if (!isTyping) return '';
    const dots = '.'.repeat(currentDots);
    const spaces = ' '.repeat(dotCount - currentDots);
    return `typing${dots}${spaces}`;
  }, [isTyping, currentDots, dotCount]);

  return {
    typingText,
    typingDisplay,
    animationPhase,
    progress: isTyping ? (currentDots / dotCount) : 0
  };
};

// Hook for typing statistics and metrics
export interface TypingStatsOptions {
  trackingEnabled?: boolean;
}

export const useTypingStats = (
  typingResult: TypingIndicatorsResult,
  options: TypingStatsOptions = {}
) => {
  const { trackingEnabled = true } = options;

  const [stats, setStats] = useState({
    totalTypingEvents: 0,
    typingByUser: new Map<string, number>(),
    averageTypingDuration: 0,
    maxConcurrentTyping: 0,
    currentSessionStart: Date.now()
  });

  // Track typing events
  useEffect(() => {
    if (!trackingEnabled) return;

    // Monitor typing state changes
    const currentTypingCount = typingResult.getTypingCount();

    setStats(prev => ({
      ...prev,
      maxConcurrentTyping: Math.max(prev.maxConcurrentTyping, currentTypingCount)
    }));
  }, [typingResult.typingStates, trackingEnabled, typingResult]);

  // Reset statistics
  const resetStats = useCallback(() => {
    setStats({
      totalTypingEvents: 0,
      typingByUser: new Map(),
      averageTypingDuration: 0,
      maxConcurrentTyping: 0,
      currentSessionStart: Date.now()
    });
  }, []);

  // Get user-specific stats
  const getUserStats = useCallback((sender: string) => {
    return {
      typingEvents: stats.typingByUser.get(sender) || 0,
      isCurrentlyTyping: typingResult.isUserTyping(sender)
    };
  }, [stats.typingByUser, typingResult]);

  return {
    stats: {
      ...stats,
      activeTypingUsers: typingResult.getTypingCount(),
      sessionDuration: Date.now() - stats.currentSessionStart
    },
    resetStats,
    getUserStats
  };
};