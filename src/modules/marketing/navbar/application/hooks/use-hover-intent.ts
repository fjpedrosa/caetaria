/**
 * Hook for intelligent hover detection with delay
 * Prevents accidental menu triggers while maintaining responsiveness
 */

import { useCallback, useRef, useState } from 'react';

interface UseHoverIntentOptions {
  enterDelay?: number; // Delay before triggering hover (default: 150ms)
  leaveDelay?: number; // Delay before removing hover (default: 300ms)
  onEnter?: () => void;
  onLeave?: () => void;
  disabled?: boolean;
}

interface UseHoverIntentReturn {
  isHovered: boolean;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onTouchStart: () => void;
  };
  reset: () => void;
}

/**
 * Custom hook for intelligent hover detection
 * Implements delay to distinguish intentional hover from accidental mouse movement
 */
export function useHoverIntent({
  enterDelay = 150,
  leaveDelay = 300,
  onEnter,
  onLeave,
  disabled = false,
}: UseHoverIntentOptions = {}): UseHoverIntentReturn {
  const [isHovered, setIsHovered] = useState(false);
  const enterTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();
  const touchedRef = useRef(false);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }
  }, []);

  // Handle mouse enter with delay
  const handleMouseEnter = useCallback(() => {
    if (disabled || touchedRef.current) return;

    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = undefined;
    }

    // If already hovered, don't set another timeout
    if (isHovered) return;

    // Set enter timeout
    enterTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      onEnter?.();
    }, enterDelay);
  }, [disabled, isHovered, enterDelay, onEnter]);

  // Handle mouse leave with delay
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;

    // Clear any pending enter timeout
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = undefined;
    }

    // If not hovered, don't set leave timeout
    if (!isHovered) return;

    // Set leave timeout
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      onLeave?.();
      touchedRef.current = false; // Reset touch flag
    }, leaveDelay);
  }, [disabled, isHovered, leaveDelay, onLeave]);

  // Handle focus (immediate, no delay)
  const handleFocus = useCallback(() => {
    if (disabled) return;
    
    clearTimeouts();
    setIsHovered(true);
    onEnter?.();
  }, [disabled, clearTimeouts, onEnter]);

  // Handle blur (immediate, no delay)
  const handleBlur = useCallback(() => {
    if (disabled) return;
    
    clearTimeouts();
    setIsHovered(false);
    onLeave?.();
  }, [disabled, clearTimeouts, onLeave]);

  // Handle touch to prevent hover on touch devices
  const handleTouchStart = useCallback(() => {
    touchedRef.current = true;
    clearTimeouts();
    
    // Reset touch flag after a delay
    setTimeout(() => {
      touchedRef.current = false;
    }, 500);
  }, [clearTimeouts]);

  // Reset function to clear state
  const reset = useCallback(() => {
    clearTimeouts();
    setIsHovered(false);
    touchedRef.current = false;
  }, [clearTimeouts]);

  // Cleanup on unmount
  useRef(() => {
    return () => clearTimeouts();
  });

  return {
    isHovered,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onTouchStart: handleTouchStart,
    },
    reset,
  };
}

/**
 * Hook for managing hover intent across multiple items
 * Useful for navigation items that should switch seamlessly
 */
export function useMultiHoverIntent<T extends string | number>(
  options: UseHoverIntentOptions = {}
) {
  const [hoveredId, setHoveredId] = useState<T | null>(null);
  const timeoutsRef = useRef<Map<T, NodeJS.Timeout>>(new Map());

  const handleItemEnter = useCallback((id: T) => {
    if (options.disabled) return;

    // Clear timeout for this item if it exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }

    // If switching directly from another item, no delay
    if (hoveredId !== null && hoveredId !== id) {
      setHoveredId(id);
      options.onEnter?.();
      return;
    }

    // Otherwise, use enter delay
    const newTimeout = setTimeout(() => {
      setHoveredId(id);
      options.onEnter?.();
    }, options.enterDelay ?? 150);

    timeoutsRef.current.set(id, newTimeout);
  }, [hoveredId, options]);

  const handleItemLeave = useCallback((id: T) => {
    if (options.disabled) return;

    // Clear any existing timeout for this ID first
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(id);
    }

    // Set leave timeout
    const leaveTimeout = setTimeout(() => {
      if (hoveredId === id) {
        setHoveredId(null);
        options.onLeave?.();
      }
    }, options.leaveDelay ?? 300);

    timeoutsRef.current.set(id, leaveTimeout);
  }, [hoveredId, options]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setHoveredId(null);
  }, []);

  const clearLeaveTimeout = useCallback((id: T) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  return {
    hoveredId,
    handleItemEnter,
    handleItemLeave,
    reset,
    clearLeaveTimeout,
    clearAllTimeouts,
  };
}