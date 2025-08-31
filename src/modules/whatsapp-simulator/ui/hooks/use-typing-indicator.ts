/**
 * useTypingIndicator - Coordinate typing states and animations
 */

import { useCallback, useEffect, useRef,useState } from 'react';

import { SenderType } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';

export interface TypingState {
  isTyping: boolean;
  sender: SenderType;
  startTime: Date;
  duration: number;
  progress: number; // 0-1 representing typing progress
}

export interface TypingIndicatorConfig {
  showTypingIndicator: boolean;
  animationDuration: number; // duration of typing animation cycle in ms
  dotCount: number; // number of dots in typing animation
  fadeInDuration: number; // fade in duration in ms
  fadeOutDuration: number; // fade out duration in ms
  maxConcurrentTyping: number; // max number of simultaneous typing indicators
}

export interface TypingIndicatorState {
  typingStates: Map<SenderType, TypingState>;
  activeTypingUsers: SenderType[];
  isAnyoneTyping: boolean;
  typingAnimationFrame: number;
}

export interface TypingIndicatorActions {
  startTyping: (sender: SenderType, duration: number) => void;
  stopTyping: (sender: SenderType) => void;
  stopAllTyping: () => void;
  getTypingState: (sender: SenderType) => TypingState | null;
  getTypingProgress: (sender: SenderType) => number;
  isUserTyping: (sender: SenderType) => boolean;
}

export interface TypingIndicatorReturn {
  state: TypingIndicatorState;
  actions: TypingIndicatorActions;
  getTypingAnimation: (sender: SenderType) => {
    dots: string;
    opacity: number;
    scale: number;
  };
}

const DEFAULT_CONFIG: TypingIndicatorConfig = {
  showTypingIndicator: true,
  animationDuration: 1200, // 1.2 seconds per animation cycle
  dotCount: 3,
  fadeInDuration: 300,
  fadeOutDuration: 200,
  maxConcurrentTyping: 2
};

export function useTypingIndicator(
  config: Partial<TypingIndicatorConfig> = {}
): TypingIndicatorReturn {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const animationFrameRef = useRef<number>(0);
  const timeoutsRef = useRef<Map<SenderType, NodeJS.Timeout>>(new Map());

  const [typingStates, setTypingStates] = useState<Map<SenderType, TypingState>>(new Map());
  const [animationFrame, setAnimationFrame] = useState<number>(0);

  // Animation loop for typing indicators
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      animationId = requestAnimationFrame(animate);
    };

    if (typingStates.size > 0) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [typingStates.size]);

  // Update typing progress for active states
  useEffect(() => {
    const now = Date.now();

    setTypingStates(prevStates => {
      const newStates = new Map(prevStates);
      let hasChanges = false;

      Array.from(newStates.entries()).forEach(([sender, state]) => {
        const elapsed = now - state.startTime.getTime();
        const newProgress = Math.min(elapsed / state.duration, 1);

        if (newProgress !== state.progress) {
          newStates.set(sender, {
            ...state,
            progress: newProgress
          });
          hasChanges = true;
        }

        // Auto-stop typing when duration is reached
        if (newProgress >= 1) {
          newStates.delete(sender);
          hasChanges = true;
        }
      });

      return hasChanges ? newStates : prevStates;
    });
  }, [animationFrame]);

  const startTyping = useCallback(
    (sender: SenderType, duration: number) => {
      if (!fullConfig.showTypingIndicator) return;

      // Clear any existing timeout for this sender
      const existingTimeout = timeoutsRef.current.get(sender);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Check max concurrent typing limit
      if (typingStates.size >= fullConfig.maxConcurrentTyping) {
        // Remove the oldest typing state
        const oldestSender = Array.from(typingStates.keys())[0];
        setTypingStates(prev => {
          const newStates = new Map(prev);
          newStates.delete(oldestSender);
          return newStates;
        });
      }

      const typingState: TypingState = {
        isTyping: true,
        sender,
        startTime: new Date(),
        duration,
        progress: 0
      };

      setTypingStates(prev => new Map(prev).set(sender, typingState));

      // Set timeout to auto-stop typing
      const timeout = setTimeout(() => {
        stopTyping(sender);
        timeoutsRef.current.delete(sender);
      }, duration);

      timeoutsRef.current.set(sender, timeout);
    },
    [fullConfig.showTypingIndicator, fullConfig.maxConcurrentTyping, typingStates.size]
  );

  const stopTyping = useCallback((sender: SenderType) => {
    const timeout = timeoutsRef.current.get(sender);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(sender);
    }

    setTypingStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(sender);
      return newStates;
    });
  }, []);

  const stopAllTyping = useCallback(() => {
    // Clear all timeouts
    Array.from(timeoutsRef.current.values()).forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutsRef.current.clear();

    setTypingStates(new Map());
  }, []);

  const getTypingState = useCallback(
    (sender: SenderType): TypingState | null => {
      return typingStates.get(sender) || null;
    },
    [typingStates]
  );

  const getTypingProgress = useCallback(
    (sender: SenderType): number => {
      const state = typingStates.get(sender);
      return state ? state.progress : 0;
    },
    [typingStates]
  );

  const isUserTyping = useCallback(
    (sender: SenderType): boolean => {
      return typingStates.has(sender);
    },
    [typingStates]
  );

  const getTypingAnimation = useCallback(
    (sender: SenderType) => {
      const state = typingStates.get(sender);
      if (!state) {
        return {
          dots: '',
          opacity: 0,
          scale: 1
        };
      }

      const elapsed = Date.now() - state.startTime.getTime();
      const cyclePosition = (elapsed % fullConfig.animationDuration) / fullConfig.animationDuration;

      // Create animated dots
      let dots = '';
      for (let i = 0; i < fullConfig.dotCount; i++) {
        const dotPosition = (cyclePosition + i * 0.2) % 1;
        const dotOpacity = Math.sin(dotPosition * Math.PI * 2) * 0.3 + 0.7;
        const isVisible = dotOpacity > 0.4;
        dots += isVisible ? '●' : '○';
      }

      // Calculate fade in/out
      let opacity = 1;
      if (elapsed < fullConfig.fadeInDuration) {
        opacity = elapsed / fullConfig.fadeInDuration;
      } else if (state.progress > 0.9) {
        const fadeOutStart = state.duration - fullConfig.fadeOutDuration;
        const fadeOutElapsed = elapsed - fadeOutStart;
        if (fadeOutElapsed > 0) {
          opacity = Math.max(0, 1 - (fadeOutElapsed / fullConfig.fadeOutDuration));
        }
      }

      // Calculate scale animation
      const scaleWave = Math.sin(cyclePosition * Math.PI * 4) * 0.1 + 1;

      return {
        dots,
        opacity,
        scale: scaleWave
      };
    },
    [typingStates, fullConfig.dotCount, fullConfig.animationDuration, fullConfig.fadeInDuration, fullConfig.fadeOutDuration]
  );

  // Handle conversation events
  const handleConversationEvent = useCallback(
    (event: ConversationEvent) => {
      switch (event.type) {
        case 'message.typing_started':
          startTyping(
            (event.payload as any).message.sender,
            (event.payload as any).typingDuration
          );
          break;
        case 'message.typing_stopped':
          stopTyping((event.payload as any).message.sender);
          break;
        case 'conversation.reset':
        case 'conversation.completed':
          stopAllTyping();
          break;
      }
    },
    [startTyping, stopTyping, stopAllTyping]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllTyping();
    };
  }, [stopAllTyping]);

  const activeTypingUsers = Array.from(typingStates.keys());
  const isAnyoneTyping = typingStates.size > 0;

  const state: TypingIndicatorState = {
    typingStates,
    activeTypingUsers,
    isAnyoneTyping,
    typingAnimationFrame: animationFrame
  };

  const actions: TypingIndicatorActions = {
    startTyping,
    stopTyping,
    stopAllTyping,
    getTypingState,
    getTypingProgress,
    isUserTyping
  };

  return {
    state,
    actions,
    getTypingAnimation
  };
}

/**
 * Hook to integrate typing indicator with conversation events
 */
export function useTypingIndicatorWithEvents(
  events$: any, // Observable<ConversationEvent>
  config?: Partial<TypingIndicatorConfig>
): TypingIndicatorReturn {
  const typingIndicator = useTypingIndicator(config);

  useEffect(() => {
    if (!events$) return;

    const subscription = events$.subscribe((event: ConversationEvent) => {
      switch (event.type) {
        case 'message.typing_started':
          typingIndicator.actions.startTyping(
            (event.payload as any).message.sender,
            (event.payload as any).typingDuration
          );
          break;
        case 'message.typing_stopped':
          typingIndicator.actions.stopTyping((event.payload as any).message.sender);
          break;
        case 'conversation.reset':
        case 'conversation.completed':
          typingIndicator.actions.stopAllTyping();
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [events$, typingIndicator.actions]);

  return typingIndicator;
}