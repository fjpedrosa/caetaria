/**
 * useConversationFlow - Main hook for conversation orchestration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, tap, throttleTime } from 'rxjs/operators';

import {
  ConversationOrchestrator,
  createConversationOrchestrator,
  PlaybackState
} from '../../application/services';
import {
  jumpToMessage,
  pauseConversation,
  playConversation,
  resetConversation,
  setPlaybackSpeed
} from '../../application/use-cases';
import { Conversation, Message } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';

export interface ConversationFlowConfig {
  enableDebug?: boolean;
  enablePerformanceTracking?: boolean;
  maxRetries?: number;
  autoCleanup?: boolean;
}

export interface ConversationFlowState {
  // Core state
  conversation: Conversation | null;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  error: Error | null;

  // Message state
  currentMessage: Message | null;
  nextMessage: Message | null;
  currentMessageIndex: number;
  messages: Message[];

  // Progress state
  progress: {
    completionPercentage: number;
    elapsedTime: number;
    remainingTime: number;
  };

  // Visual state
  typingStates: Map<string, boolean>;
  playbackSpeed: number;

  // Debug state
  events: ConversationEvent[];
  lastEvent: ConversationEvent | null;
}

export interface ConversationFlowActions {
  // Core actions
  loadConversation: (conversation: Conversation) => Promise<boolean>;
  play: () => Promise<boolean>;
  pause: () => Promise<boolean>;
  reset: () => Promise<boolean>;

  // Navigation actions
  jumpTo: (messageIndex: number) => Promise<boolean>;
  nextMessage: () => void;
  previousMessage: () => void;

  // Control actions
  setSpeed: (speed: number) => Promise<boolean>;

  // Utility actions
  clearEvents: () => void;
  cleanup: () => void;
}

export interface ConversationFlowReturn {
  state: ConversationFlowState;
  actions: ConversationFlowActions;
  events$: Observable<ConversationEvent>;
  orchestrator: ConversationOrchestrator;
  isReady: boolean;
}

export function useConversationFlow(
  config: ConversationFlowConfig = {}
): ConversationFlowReturn {
  // Memoized orchestrator configuration (must be before orchestratorRef)
  const orchestratorConfig = useMemo(() => ({
    enableDebug: config.enableDebug || false,
    enablePerformanceTracking: config.enablePerformanceTracking || false,
    maxRetries: config.maxRetries || 3,
    optimizeTransitions: true,
    fastModeEnabled: config.enableDebug === false // Enable fast mode when not debugging
  }), [config.enableDebug, config.enablePerformanceTracking, config.maxRetries]);

  // Orchestrator instance - Initialize synchronously
  const orchestratorRef = useRef<ConversationOrchestrator | null>(null);

  // CRITICAL FIX: Initialize orchestrator synchronously on first render
  // This ensures the orchestrator is available immediately, not after useEffect
  if (!orchestratorRef.current) {
    const initStartTime = performance.now();
    console.log('[ConversationFlow] 🔧 Synchronous orchestrator initialization', {
      timestamp: new Date().toISOString(),
      config: orchestratorConfig,
      phase: 'sync-init'
    });

    orchestratorRef.current = createConversationOrchestrator(orchestratorConfig);

    const initDuration = performance.now() - initStartTime;
    console.log('[ConversationFlow] ✅ Orchestrator initialized synchronously', {
      timestamp: new Date().toISOString(),
      duration: `${initDuration.toFixed(2)}ms`,
      orchestratorReady: true,
      phase: 'sync-init-complete'
    });
  }

  // Subscriptions
  const subscriptionsRef = useRef<Subscription[]>([]);
  const hasSubscribedRef = useRef(false);

  // State
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    conversation: null,
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    hasError: false,
    currentMessageIndex: 0,
    currentMessage: null,
    nextMessage: null,
    playbackSpeed: 1.0,
    progress: {
      completionPercentage: 0,
      elapsedTime: 0,
      remainingTime: 0
    },
    typingStates: new Map(),
    error: undefined
  });

  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<ConversationEvent | null>(null);
  const [isReady, setIsReady] = useState(true); // Set to true since orchestrator is ready

  // Set up subscriptions in useEffect (but orchestrator already exists)
  useEffect(() => {
    // Only set up subscriptions once
    if (!hasSubscribedRef.current && orchestratorRef.current) {
      hasSubscribedRef.current = true;
      console.log('[ConversationFlow] Setting up subscriptions for orchestrator');

      // Subscribe to playback state changes with optimization
      const playbackStateSubscription = orchestratorRef.current.playbackState$.pipe(
        distinctUntilChanged((prev, curr) =>
          prev.isPlaying === curr.isPlaying &&
          prev.currentMessageIndex === curr.currentMessageIndex &&
          prev.isCompleted === curr.isCompleted
        )
      ).subscribe(
        (newState) => {
          setPlaybackState(prevState => ({
            ...newState,
            error: newState.error || null
          }));
        }
      );

      // Subscribe to events with throttling
      const eventsSubscription = orchestratorRef.current.events$.pipe(
        throttleTime(50), // Throttle high-frequency events
        tap(event => {
          if (config.enableDebug || ['conversation.started', 'conversation.completed', 'message.sent'].includes(event.type)) {
            console.log('[ConversationFlow] Event:', event.type);
          }
        })
      ).subscribe(
        (event) => {
          setLastEvent(event);
          setEvents(prev => {
            const newEvents = [...prev.slice(-49), event];
            return newEvents;
          });
        }
      );

      subscriptionsRef.current.push(playbackStateSubscription, eventsSubscription);
      console.log('[ConversationFlow] ✅ Subscriptions set up successfully');
    }

    // Cleanup on unmount
    return () => {
      if (config.autoCleanup !== false) {
        // Inline cleanup logic to avoid dependency issues
        // Unsubscribe from all subscriptions with error handling
        subscriptionsRef.current.forEach(sub => {
          try {
            sub.unsubscribe();
          } catch (error) {
            console.warn('[ConversationFlow] Error unsubscribing:', error);
          }
        });
        subscriptionsRef.current = [];

        // Destroy orchestrator with proper cleanup
        if (orchestratorRef.current) {
          try {
            orchestratorRef.current.destroy();
          } catch (error) {
            console.warn('[ConversationFlow] Error destroying orchestrator:', error);
          }
          orchestratorRef.current = null;
        }

        // Reset state
        setEvents([]);
        setLastEvent(null);
      }
    };
  }, [orchestratorConfig, config.autoCleanup, config.enableDebug]);

  // Action implementations with enhanced logging
  const loadConversation = useCallback(async (conversation: Conversation): Promise<boolean> => {
    const loadStartTime = performance.now();
    try {
      const orchestratorExists = !!orchestratorRef.current;
      console.log('[ConversationFlow] 📥 loadConversation called', {
        timestamp: new Date().toISOString(),
        orchestratorExists,
        messageCount: conversation?.messages?.length || 0,
        phase: 'load-start'
      });

      if (!orchestratorRef.current) {
        console.error('[ConversationFlow] ❌ Orchestrator not initialized', {
          timestamp: new Date().toISOString(),
          phase: 'load-error-no-orchestrator'
        });
        return false;
      }

      console.log('[ConversationFlow] 🔄 Calling orchestrator.loadConversation...');
      const result = await orchestratorRef.current.loadConversation(conversation);

      const loadDuration = performance.now() - loadStartTime;
      console.log('[ConversationFlow] ✅ Load result', {
        timestamp: new Date().toISOString(),
        success: result.success,
        duration: `${loadDuration.toFixed(2)}ms`,
        phase: 'load-complete'
      });

      return result.success;
    } catch (error) {
      const loadDuration = performance.now() - loadStartTime;
      console.error('[ConversationFlow] ❌ Failed to load conversation', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${loadDuration.toFixed(2)}ms`,
        phase: 'load-error'
      });
      return false;
    }
  }, []);

  const play = useCallback(async (): Promise<boolean> => {
    try {
      if (!orchestratorRef.current) return false;

      const result = await orchestratorRef.current.play({ autoStart: true });
      return result.success;
    } catch (error) {
      console.error('Failed to play conversation:', error);
      return false;
    }
  }, []);

  const pause = useCallback(async (): Promise<boolean> => {
    try {
      if (!orchestratorRef.current) return false;

      const result = await orchestratorRef.current.pause();
      return result.success;
    } catch (error) {
      console.error('Failed to pause conversation:', error);
      return false;
    }
  }, []);

  const reset = useCallback(async (): Promise<boolean> => {
    try {
      if (!orchestratorRef.current) return false;

      const result = await orchestratorRef.current.reset();
      return result.success;
    } catch (error) {
      console.error('Failed to reset conversation:', error);
      return false;
    }
  }, []);

  const jumpTo = useCallback(async (messageIndex: number): Promise<boolean> => {
    try {
      if (!orchestratorRef.current) return false;

      const result = await orchestratorRef.current.jumpTo(messageIndex);
      return result.success;
    } catch (error) {
      console.error('Failed to jump to message:', error);
      return false;
    }
  }, []);

  const setSpeed = useCallback(async (speed: number): Promise<boolean> => {
    try {
      if (!orchestratorRef.current) return false;

      const result = await orchestratorRef.current.setSpeed(speed);
      return result.success;
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      return false;
    }
  }, []);

  const nextMessage = useCallback(async (): Promise<void> => {
    if (orchestratorRef.current) {
      await orchestratorRef.current.nextMessage();
    }
  }, []);

  const previousMessage = useCallback(async (): Promise<void> => {
    if (orchestratorRef.current) {
      await orchestratorRef.current.previousMessage();
    }
  }, []);

  const clearEvents = useCallback((): void => {
    setEvents([]);
    setLastEvent(null);
  }, []);

  const cleanup = useCallback((): void => {
    // Unsubscribe from all subscriptions with error handling
    subscriptionsRef.current.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.warn('[ConversationFlow] Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];

    // Destroy orchestrator with proper cleanup
    if (orchestratorRef.current) {
      try {
        orchestratorRef.current.destroy();
      } catch (error) {
        console.warn('[ConversationFlow] Error destroying orchestrator:', error);
      }
      orchestratorRef.current = null;
    }

    // Reset state
    setEvents([]);
    setLastEvent(null);
  }, []);

  // Memoized state and actions
  const state: ConversationFlowState = useMemo(() => ({
    conversation: playbackState.conversation,
    isPlaying: playbackState.isPlaying,
    isPaused: playbackState.isPaused,
    isCompleted: playbackState.isCompleted,
    hasError: playbackState.hasError,
    error: playbackState.error || null,
    currentMessage: playbackState.currentMessage,
    nextMessage: playbackState.nextMessage,
    currentMessageIndex: playbackState.currentMessageIndex,
    messages: [...(playbackState.conversation?.messages || [])],
    progress: playbackState.progress,
    typingStates: playbackState.typingStates,
    playbackSpeed: playbackState.playbackSpeed,
    events,
    lastEvent
  }), [playbackState, events, lastEvent]);

  const actions: ConversationFlowActions = useMemo(() => ({
    loadConversation,
    play,
    pause,
    reset,
    jumpTo,
    nextMessage,
    previousMessage,
    setSpeed,
    clearEvents,
    cleanup
  }), [
    loadConversation,
    play,
    pause,
    reset,
    jumpTo,
    nextMessage,
    previousMessage,
    setSpeed,
    clearEvents,
    cleanup
  ]);

  // Events observable - stable reference, orchestrator is guaranteed to exist
  const events$ = useMemo(
    () => orchestratorRef.current!.events$, // Safe to use ! since orchestrator is initialized synchronously
    [] // Empty dependencies - orchestrator is created once on first render
  );

  return {
    state,
    actions,
    events$,
    orchestrator: orchestratorRef.current as ConversationOrchestrator, // Guaranteed non-null due to synchronous init
    isReady
  };
}