/**
 * useEducationalBadges - Hook for managing educational badge display and interactions
 * Extracted from WhatsAppSimulator to follow Single Responsibility Principle
 */

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';

import { EducationalBadge } from '../../domain/types';

export interface UseEducationalBadgesOptions {
  badges?: EducationalBadge[];
  enabled?: boolean;
  onBadgeShow?: (badge: EducationalBadge) => void;
  onBadgeHide?: (badge: EducationalBadge) => void;
  onBadgeClick?: (badge: EducationalBadge) => void;
  autoHide?: boolean;
  maxSimultaneousBadges?: number;
}

export interface EducationalBadgesResult {
  // Current state
  activeBadge: EducationalBadge | null;
  badgeQueue: EducationalBadge[];
  shownBadges: Set<string>;

  // Actions
  showBadge: (badge: EducationalBadge) => void;
  hideBadge: () => void;
  hideAllBadges: () => void;
  queueBadge: (badge: EducationalBadge) => void;
  handleBadgeClick: (badge: EducationalBadge) => void;
  clearBadge: () => void;
  handleBadgeDisplay: (badge: EducationalBadge) => void;

  // Trigger functions
  showBadgeForMessage: (messageIndex: number) => boolean;
  showBadgeById: (badgeId: string) => boolean;

  // Queue management
  processQueue: () => void;
  clearQueue: () => void;

  // State queries
  hasBadgeInQueue: (badgeId: string) => boolean;
  hasActiveBadge: () => boolean;
  getBadgeForMessage: (messageIndex: number) => EducationalBadge | null;

  // Statistics
  badgeStats: {
    totalShown: number;
    averageDisplayTime: number;
    mostShownBadge: EducationalBadge | null;
  };
}

export const useEducationalBadges = (
  options: UseEducationalBadgesOptions = {}
): EducationalBadgesResult => {
  const {
    badges = [],
    enabled = true,
    onBadgeShow,
    onBadgeHide,
    onBadgeClick,
    autoHide = true,
    maxSimultaneousBadges = 1
  } = options;

  // State management
  const [activeBadge, setActiveBadge] = useState<EducationalBadge | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<EducationalBadge[]>([]);
  const [shownBadges, setShownBadges] = useState<Set<string>>(new Set());

  // Tracking refs
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimesRef = useRef<Map<string, number>>(new Map());
  const showCountsRef = useRef<Map<string, number>>(new Map());

  // Clear hide timer
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Show a specific badge
  const showBadge = useCallback((badge: EducationalBadge) => {
    if (!enabled || !badge) return;

    // Clear any existing timer
    clearHideTimer();

    // Track display start time
    const startTime = Date.now();
    displayTimesRef.current.set(badge.id, startTime);

    // Update show count
    const currentCount = showCountsRef.current.get(badge.id) || 0;
    showCountsRef.current.set(badge.id, currentCount + 1);

    // Set active badge
    setActiveBadge(badge);
    setShownBadges(prev => new Set(prev).add(badge.id));

    // Callback
    onBadgeShow?.(badge);

    // Auto-hide if enabled
    if (autoHide && badge.duration && badge.duration > 0) {
      hideTimerRef.current = setTimeout(() => {
        hideBadge();
      }, badge.duration);
    }
  }, [enabled, autoHide, onBadgeShow, clearHideTimer]);

  // Hide the current badge
  const hideBadge = useCallback(() => {
    if (!activeBadge) return;

    clearHideTimer();

    // Track display time
    const startTime = displayTimesRef.current.get(activeBadge.id);
    if (startTime) {
      const displayTime = Date.now() - startTime;
      displayTimesRef.current.set(activeBadge.id, displayTime);
    }

    const badgeToHide = activeBadge;
    setActiveBadge(null);

    // Callback
    onBadgeHide?.(badgeToHide);

    // Process queue after a short delay
    setTimeout(() => {
      processQueue();
    }, 200);
  }, [activeBadge, onBadgeHide, clearHideTimer]);

  // Hide all badges and clear queue
  const hideAllBadges = useCallback(() => {
    clearHideTimer();
    setActiveBadge(null);
    setBadgeQueue([]);
  }, [clearHideTimer]);

  // Add badge to queue
  const queueBadge = useCallback((badge: EducationalBadge) => {
    if (!enabled || !badge) return;

    // Check if badge is already in queue or currently showing
    if (activeBadge?.id === badge.id) return;
    if (badgeQueue.some(b => b.id === badge.id)) return;

    setBadgeQueue(prev => {
      const newQueue = [...prev, badge];
      // Sort by priority (high -> medium -> low)
      return newQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    });

    // If no active badge, process immediately
    if (!activeBadge) {
      setTimeout(processQueue, 100);
    }
  }, [enabled, activeBadge, badgeQueue]);

  // Process the badge queue
  const processQueue = useCallback(() => {
    if (!enabled || activeBadge || badgeQueue.length === 0) return;

    const nextBadge = badgeQueue[0];
    setBadgeQueue(prev => prev.slice(1));
    showBadge(nextBadge);
  }, [enabled, activeBadge, badgeQueue, showBadge]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    setBadgeQueue([]);
  }, []);

  // Show badge for specific message index
  const showBadgeForMessage = useCallback((messageIndex: number): boolean => {
    if (!enabled) return false;

    const badge = badges.find(b =>
      b.triggerMessageIndex === messageIndex &&
      !shownBadges.has(b.id)
    );

    if (badge) {
      if (activeBadge) {
        queueBadge(badge);
      } else {
        showBadge(badge);
      }
      return true;
    }

    return false;
  }, [enabled, badges, shownBadges, activeBadge, showBadge, queueBadge]);

  // Show badge by ID
  const showBadgeById = useCallback((badgeId: string): boolean => {
    if (!enabled) return false;

    const badge = badges.find(b => b.id === badgeId);
    if (badge && !shownBadges.has(badge.id)) {
      if (activeBadge) {
        queueBadge(badge);
      } else {
        showBadge(badge);
      }
      return true;
    }

    return false;
  }, [enabled, badges, shownBadges, activeBadge, showBadge, queueBadge]);

  // Check if badge is in queue
  const hasBadgeInQueue = useCallback((badgeId: string): boolean => {
    return badgeQueue.some(b => b.id === badgeId);
  }, [badgeQueue]);

  // Check if there's an active badge
  const hasActiveBadge = useCallback((): boolean => {
    return activeBadge !== null;
  }, [activeBadge]);

  // Get badge for message index
  const getBadgeForMessage = useCallback((messageIndex: number): EducationalBadge | null => {
    return badges.find(b => b.triggerMessageIndex === messageIndex) || null;
  }, [badges]);

  // Badge statistics
  const badgeStats = useMemo(() => {
    const totalShown = shownBadges.size;

    // Calculate average display time
    const displayTimes = Array.from(displayTimesRef.current.values());
    const averageDisplayTime = displayTimes.length > 0
      ? displayTimes.reduce((sum, time) => sum + time, 0) / displayTimes.length
      : 0;

    // Find most shown badge
    let mostShownBadge: EducationalBadge | null = null;
    let maxCount = 0;

    for (const [badgeId, count] of showCountsRef.current.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostShownBadge = badges.find(b => b.id === badgeId) || null;
      }
    }

    return {
      totalShown,
      averageDisplayTime,
      mostShownBadge
    };
  }, [shownBadges, badges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  // Handle badge click
  const handleBadgeClick = useCallback((badge: EducationalBadge) => {
    onBadgeClick?.(badge);

    // Optionally hide on click
    if (badge === activeBadge) {
      hideBadge();
    }
  }, [activeBadge, onBadgeClick, hideBadge]);

  // Clear badge (alias for hideBadge)
  const clearBadge = useCallback(() => {
    hideBadge();
  }, [hideBadge]);

  // Handle badge display (show badge)
  const handleBadgeDisplay = useCallback((badge: EducationalBadge) => {
    showBadge(badge);
  }, [showBadge]);

  // Enhanced return object with click handler
  return {
    activeBadge,
    badgeQueue,
    shownBadges,
    showBadge,
    hideBadge,
    hideAllBadges,
    queueBadge,
    showBadgeForMessage,
    showBadgeById,
    processQueue,
    clearQueue,
    hasBadgeInQueue,
    hasActiveBadge,
    getBadgeForMessage,
    badgeStats,
    // Additional methods for components
    handleBadgeClick,
    clearBadge,
    handleBadgeDisplay
  };
};

// Hook for badge positioning and animations
// Note: BadgeAnimationOptions is imported from domain/types but this hook uses a simpler interface
interface SimpleBadgeAnimationOptions {
  animationDuration?: number;
  animationEasing?: string;
  slideDirection?: 'left' | 'right' | 'up' | 'down';
  enableBounce?: boolean;
}

export const useBadgeAnimation = (
  badge: EducationalBadge | null,
  options: SimpleBadgeAnimationOptions = {}
) => {
  const {
    animationDuration = 300,
    animationEasing = 'ease-out',
    slideDirection = 'right',
    enableBounce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation states
  useEffect(() => {
    if (badge) {
      setIsAnimating(true);
      setIsVisible(true);

      // End animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      // Hide after exit animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [badge, animationDuration]);

  // Animation styles
  const animationStyles = useMemo(() => {
    if (!badge) return {};

    const baseStyles = {
      position: 'absolute' as const,
      left: badge.position.x,
      top: badge.position.y,
      transition: `all ${animationDuration}ms ${animationEasing}`,
    };

    // Entry/exit transforms
    const transforms = {
      left: isVisible ? 'translateX(0)' : 'translateX(-100%)',
      right: isVisible ? 'translateX(0)' : 'translateX(100%)',
      up: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      down: isVisible ? 'translateY(0)' : 'translateY(100%)',
    };

    return {
      ...baseStyles,
      transform: transforms[slideDirection],
      opacity: isVisible ? 1 : 0,
      animation: enableBounce && isAnimating && isVisible
        ? `bounce ${animationDuration}ms ${animationEasing}`
        : undefined
    };
  }, [badge, isVisible, isAnimating, animationDuration, animationEasing, slideDirection, enableBounce]);

  return {
    isVisible,
    isAnimating,
    animationStyles
  };
};

// Hook for badge accessibility
// Note: BadgeAccessibilityOptions is imported from domain/types but this hook uses a simpler interface
interface SimpleBadgeAccessibilityOptions {
  announceOnShow?: boolean;
  announceOnHide?: boolean;
  keyboardDismiss?: boolean;
}

export const useBadgeAccessibility = (
  badgeResult: EducationalBadgesResult,
  options: SimpleBadgeAccessibilityOptions = {}
) => {
  const {
    announceOnShow = true,
    announceOnHide = false,
    keyboardDismiss = true
  } = options;

  const [announcement, setAnnouncement] = useState<string>('');

  // Handle announcements
  useEffect(() => {
    if (badgeResult.activeBadge && announceOnShow) {
      setAnnouncement(
        `Educational badge shown: ${badgeResult.activeBadge.title}. ${badgeResult.activeBadge.content}`
      );
    } else if (!badgeResult.activeBadge && announceOnHide && announcement) {
      setAnnouncement('Badge hidden');
    }
  }, [badgeResult.activeBadge, announceOnShow, announceOnHide, announcement]);

  // Keyboard event handling
  useEffect(() => {
    if (!keyboardDismiss || !badgeResult.activeBadge) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        badgeResult.hideBadge();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardDismiss, badgeResult]);

  // Clear announcement after it's been read
  const clearAnnouncement = useCallback(() => {
    setAnnouncement('');
  }, []);

  return {
    announcement,
    clearAnnouncement,
    ariaLive: 'polite' as const,
    role: 'status' as const
  };
};

// ============================================================================
// BADGE HELPERS - Utility functions for badge components
// ============================================================================

/**
 * Helper functions for educational badge display and interaction
 * Exported as an object to maintain functional programming approach
 */
export const badgeHelpers = {
  /**
   * Get animation configuration for a badge
   */
  getBadgeAnimationConfig: (badge: EducationalBadge) => ({
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: badge.priority === 'high' ? 0.3 : 0.5
    }
  }),

  /**
   * Get badge position styles
   */
  getBadgePosition: (badge: EducationalBadge) => ({
    position: 'absolute' as const,
    left: badge.position.x,
    top: badge.position.y,
    zIndex: badge.priority === 'high' ? 1000 : badge.priority === 'medium' ? 900 : 800
  }),

  /**
   * Get badge priority class name
   */
  getBadgePriorityClass: (badge: EducationalBadge) => {
    const baseClass = 'educational-badge';
    return `${baseClass} ${baseClass}--${badge.priority}`;
  },

  /**
   * Get badge icon component based on badge ID
   */
  getBadgeIcon: (badgeId: string) => {
    const iconMap: Record<string, string> = {
      'ai': 'Brain',
      'automation': 'Settings',
      'data': 'Database',
      'enhancement': 'Sparkles'
    };
    return iconMap[badgeId] || 'Sparkles';
  },

  /**
   * Determine if badge should show bounce animation
   */
  shouldBounce: (badge: EducationalBadge) => {
    return badge.priority === 'high' || badge.type === 'feature';
  },

  /**
   * Get badge color scheme based on priority and type
   */
  getBadgeColorScheme: (badge: EducationalBadge) => {
    const schemes = {
      high: {
        background: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-900 dark:text-red-100',
        icon: 'text-red-600 dark:text-red-400'
      },
      medium: {
        background: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-100',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      low: {
        background: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-900 dark:text-green-100',
        icon: 'text-green-600 dark:text-green-400'
      }
    };
    return schemes[badge.priority] || schemes.medium;
  },

  /**
   * Format badge duration for display
   */
  formatDuration: (duration?: number) => {
    if (!duration) return 'Auto-hide disabled';
    return duration < 1000
      ? `${duration}ms`
      : `${(duration / 1000).toFixed(1)}s`;
  },

  /**
   * Check if badge should be visible based on message index
   */
  shouldShowForMessage: (badge: EducationalBadge, messageIndex: number, shownBadges: Set<string>) => {
    return badge.triggerMessageIndex === messageIndex && !shownBadges.has(badge.id);
  },

  /**
   * Get accessibility attributes for badge
   */
  getAccessibilityProps: (badge: EducationalBadge) => ({
    role: 'alert',
    'aria-live': badge.priority === 'high' ? 'assertive' : 'polite',
    'aria-label': `Educational badge: ${badge.title}`,
    'aria-describedby': `badge-content-${badge.id}`,
    tabIndex: 0
  }),

  /**
   * Generate unique key for badge rendering
   */
  getBadgeKey: (badge: EducationalBadge) => {
    return `badge-${badge.id}-${Date.now()}`;
  }
};