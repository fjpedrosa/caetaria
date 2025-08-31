/**
 * useConversationFlow - Main hook for conversation orchestration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, tap, throttleTime } from 'rxjs/operators';

import { ConversationEngine, PlaybackState } from '../../application/engines/conversation-engine';
import {
  JumpToMessageUseCase,
  PauseConversationUseCase,
  PlayConversationUseCase,
  ResetConversationUseCase,
  SetPlaybackSpeedUseCase
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
  engine: ConversationEngine;
}

export function useConversationFlow(
  config: ConversationFlowConfig = {}
): ConversationFlowReturn {
  // Engine and use case instances
  const engineRef = useRef<ConversationEngine | null>(null);
  const useCasesRef = useRef<{
    play: PlayConversationUseCase;
    pause: PauseConversationUseCase;
    reset: ResetConversationUseCase;
    jumpTo: JumpToMessageUseCase;
    setSpeed: SetPlaybackSpeedUseCase;
  } | null>(null);

  // Subscriptions
  const subscriptionsRef = useRef<Subscription[]>([]);

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

  // Memoized engine configuration
  const engineConfig = useMemo(() => ({
    enableDebug: config.enableDebug || false,
    enablePerformanceTracking: config.enablePerformanceTracking || false,
    maxRetries: config.maxRetries || 3,
    optimizeTransitions: true,
    fastModeEnabled: config.enableDebug === false // Enable fast mode when not debugging
  }), [config.enableDebug, config.enablePerformanceTracking, config.maxRetries]);

  // Initialize engine and use cases with optimized config
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new ConversationEngine(engineConfig);

      useCasesRef.current = {
        play: new PlayConversationUseCase(engineRef.current),
        pause: new PauseConversationUseCase(engineRef.current),
        reset: new ResetConversationUseCase(engineRef.current),
        jumpTo: new JumpToMessageUseCase(engineRef.current),
        setSpeed: new SetPlaybackSpeedUseCase(engineRef.current)
      };

      // Subscribe to playback state changes with optimization
      const playbackStateSubscription = engineRef.current.playbackState$.pipe(
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
      const eventsSubscription = engineRef.current.events$.pipe(
        throttleTime(50), // Throttle high-frequency events
        tap(event => {
          // Only log important events in production
          if (config.enableDebug || ['conversation.started', 'conversation.completed', 'message.sent'].includes(event.type)) {
            console.log('[ConversationFlow] Event:', event.type);
          }
        })
      ).subscribe(
        (event) => {
          setLastEvent(event);
          setEvents(prev => {
            const newEvents = [...prev.slice(-49), event]; // Reduced from 100 to 50 events
            return newEvents;
          });
        }
      );

      subscriptionsRef.current.push(playbackStateSubscription, eventsSubscription);
    }

    return () => {
      if (config.autoCleanup !== false) {
        cleanup();
      }
    };
  }, [engineConfig, config.autoCleanup]); // Removed cleanup dependency to fix initialization order

  // Action implementations
  const loadConversation = useCallback(async (conversation: Conversation): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      // Load conversation without starting playback
      const result = await useCasesRef.current.play.execute({
        conversation,
        autoStart: false
      });

      return result.success;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return false;
    }
  }, []);

  const play = useCallback(async (): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      // Just start playback without reloading the conversation
      const result = await useCasesRef.current.play.execute({
        // Don't pass conversation to avoid reloading
        autoStart: true
      });

      return result.success;
    } catch (error) {
      console.error('Failed to play conversation:', error);
      return false;
    }
  }, []);

  const pause = useCallback(async (): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      const result = await useCasesRef.current.pause.execute();
      return result.success;
    } catch (error) {
      console.error('Failed to pause conversation:', error);
      return false;
    }
  }, []);

  const reset = useCallback(async (): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      const result = await useCasesRef.current.reset.execute();
      return result.success;
    } catch (error) {
      console.error('Failed to reset conversation:', error);
      return false;
    }
  }, []);

  const jumpTo = useCallback(async (messageIndex: number): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      const result = await useCasesRef.current.jumpTo.execute({
        messageIndex
      });

      return result.success;
    } catch (error) {
      console.error('Failed to jump to message:', error);
      return false;
    }
  }, []);

  const setSpeed = useCallback(async (speed: number): Promise<boolean> => {
    try {
      if (!useCasesRef.current) return false;

      const result = await useCasesRef.current.setSpeed.execute({
        speed
      });

      return result.success;
    } catch (error) {
      console.error('Failed to set playback speed:', error);
      return false;
    }
  }, []);

  const nextMessage = useCallback((): void => {
    if (playbackState.conversation && playbackState.conversation.canGoForward) {
      const nextIndex = playbackState.currentMessageIndex + 1;
      jumpTo(nextIndex);
    }
  }, [playbackState.conversation, playbackState.currentMessageIndex, jumpTo]);

  const previousMessage = useCallback((): void => {
    if (playbackState.conversation && playbackState.conversation.canGoBack) {
      const previousIndex = playbackState.currentMessageIndex - 1;
      jumpTo(previousIndex);
    }
  }, [playbackState.conversation, playbackState.currentMessageIndex, jumpTo]);

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

    // Destroy engine with proper cleanup
    if (engineRef.current) {
      try {
        engineRef.current.destroy();
      } catch (error) {
        console.warn('[ConversationFlow] Error destroying engine:', error);
      }
      engineRef.current = null;
    }

    // Clear use cases
    useCasesRef.current = null;

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

  const events$ = useMemo(
    () => engineRef.current?.events$ || new Observable<ConversationEvent>(),
    [engineRef.current]
  );

  return {
    state,
    actions,
    events$,
    engine: engineRef.current!
  };
}