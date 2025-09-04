import {  Subject } from 'rxjs';
import { distinctUntilChanged ,map, shareReplay } from 'rxjs/operators';

import { Conversation } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';

import {
  createEventService,
  createEventServiceConfig,
  EventService
} from './event-service';
import {
  createMessageProcessingConfig,
  createMessageProcessingService,
  MessageProcessingService
} from './message-processing-service';
import {
  createPlaybackConfig,
  createPlaybackService,
  JumpRequest,
  PlaybackService,
  PlayRequest,
  SpeedRequest
} from './playback-service';
import {
  canJumpTo,
  canPause,
  canPlay,
  canReset,
  createInitialState,
  createStateManager,
  PlaybackState,
  StateManager,
  updateWithConversation} from './state-service';
import {
  createTypingService,
  createTypingServiceConfig,
  TypingService
} from './typing-service';

// Types
export interface OrchestratorConfig {
  maxRetries: number;
  debounceTime: number;
  throttleTime: number;
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
  optimizeTransitions: boolean;
  fastModeEnabled: boolean;
}

export interface ConversationOrchestratorState {
  playback: PlaybackState;
  isInitialized: boolean;
  hasError: boolean;
  error?: Error;
}

export interface ConversationOrchestratorResult {
  success: boolean;
  error?: Error;
  event?: ConversationEvent;
}

// Configuration factory
export const createOrchestratorConfig = (overrides: Partial<OrchestratorConfig> = {}): OrchestratorConfig => ({
  maxRetries: 3,
  debounceTime: overrides.optimizeTransitions ? 50 : 100,
  throttleTime: 16, // ~60fps
  enableDebug: false,
  enablePerformanceTracking: false,
  optimizeTransitions: true,
  fastModeEnabled: false,
  ...overrides
});

// Main orchestrator class (functional approach with dependency injection)
export const createConversationOrchestrator = (config: Partial<OrchestratorConfig> = {}) => {
  const orchestratorConfig = createOrchestratorConfig(config);

  // Create specialized services
  const eventService = createEventService(
    createEventServiceConfig({
      enableDebug: orchestratorConfig.enableDebug,
      throttleTime: orchestratorConfig.throttleTime
    })
  );

  const stateManager = createStateManager(createInitialState());

  const playbackService = createPlaybackService(
    createPlaybackConfig({
      enableDebug: orchestratorConfig.enableDebug,
      enablePerformanceTracking: orchestratorConfig.enablePerformanceTracking,
      fastModeEnabled: orchestratorConfig.fastModeEnabled,
      maxRetries: orchestratorConfig.maxRetries
    })
  );

  const messageProcessingService = createMessageProcessingService(
    createMessageProcessingConfig({
      enableDebug: orchestratorConfig.enableDebug,
      enablePerformanceTracking: orchestratorConfig.enablePerformanceTracking,
      fastModeEnabled: orchestratorConfig.fastModeEnabled,
      useOptimizedTiming: orchestratorConfig.optimizeTransitions
    })
  );

  const typingService = createTypingService(
    createTypingServiceConfig({
      enableDebug: orchestratorConfig.enableDebug,
      enableTypingIndicators: true
    })
  );

  // Control subjects for lifecycle management
  const stopSubject = new Subject<void>();
  const destroySubject = new Subject<void>();

  // Initialize typing event subscriptions
  const typingCleanup = typingService.subscribeToEvents(
    eventService.events$,
    stateManager.updateState,
    typingService.config,
    stopSubject.asObservable()
  );

  // Public API methods
  const loadConversation = async (conversation: Conversation): Promise<ConversationOrchestratorResult> => {
    try {
      stateManager.updateState(state => updateWithConversation(state, conversation));

      const event = eventService.emit({
        id: `load-${Date.now()}`,
        type: 'debug.log',
        timestamp: new Date(),
        conversationId: conversation.metadata.id,
        payload: {
          level: 'info' as const,
          message: 'Conversation loaded',
          data: { messageCount: conversation.messages.length }
        }
      });

      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: err };
    }
  };

  const play = async (request: PlayRequest = { autoStart: true }): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    console.log('[ConversationOrchestrator] 🎮 Play called with state:', {
      hasConversation: !!currentState.conversation,
      messageCount: currentState.conversation?.messages?.length || 0,
      currentIndex: currentState.currentMessageIndex
    });

    const result = await playbackService.play(request, currentState, stateManager.updateState, eventService);

    if (result.success && result.event) {
      // Get the updated state after play() which has the conversation with status: 'playing'
      const updatedState = stateManager.getCurrentState();
      console.log('[ConversationOrchestrator] 🚀 Starting message processing stream with updated conversation:', {
        status: updatedState.conversation?.status,
        currentIndex: updatedState.conversation?.currentIndex,
        messageCount: updatedState.conversation?.messages?.length
      });
      
      if (updatedState.conversation) {
        // Start message processing stream with the updated conversation
        const messageStream = messageProcessingService.createPlaybackStream(
          updatedState.conversation,
          eventService,
          stateManager.updateState,
          stopSubject.asObservable()
        );

        messageStream.subscribe({
          next: (event) => eventService.emit(event),
          error: (error) => {
            stateManager.updateState(state => ({
              ...state,
              hasError: true,
              error: error instanceof Error ? error : new Error(String(error))
            }));
          },
          complete: () => {
            // Message stream completed
          }
        });
      }
    }

    return result;
  };

  const pause = async (): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    return await playbackService.pause(currentState, stateManager.updateState, eventService);
  };

  const reset = async (): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    return await playbackService.reset(currentState, stateManager.updateState, eventService);
  };

  const jumpTo = async (messageIndex: number): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    const request: JumpRequest = { messageIndex };
    return await playbackService.jump(request, currentState, stateManager.updateState, eventService);
  };

  const setSpeed = async (speed: number): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    const request: SpeedRequest = { speed };
    return await playbackService.setSpeed(request, currentState, stateManager.updateState, eventService);
  };

  // Navigation helpers
  const nextMessage = async (): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    return await playbackService.next(currentState, stateManager.updateState, eventService);
  };

  const previousMessage = async (): Promise<ConversationOrchestratorResult> => {
    const currentState = stateManager.getCurrentState();
    return await playbackService.previous(currentState, stateManager.updateState, eventService);
  };

  // State access methods (matching original ConversationEngine API)
  const getCurrentState = (): PlaybackState => {
    return stateManager.getCurrentState();
  };

  const getCurrentConversation = (): Conversation | null => {
    return stateManager.getCurrentState().conversation;
  };

  // Observable streams (matching original ConversationEngine API)
  const conversation$ = stateManager.state$.pipe(
    map(state => state.conversation),
    distinctUntilChanged(),
    shareReplay(1)
  );

  const playbackState$ = stateManager.state$.pipe(
    shareReplay(1)
  );

  const events$ = eventService.events$.pipe(
    shareReplay(1)
  );

  const messages$ = conversation$.pipe(
    map(conv => conv?.messages || []),
    distinctUntilChanged(),
    shareReplay(1)
  );

  const currentMessage$ = stateManager.currentMessage$.pipe(
    shareReplay(1)
  );

  const progress$ = stateManager.progress$.pipe(
    shareReplay(1)
  );

  const isPlaying$ = stateManager.isPlaying$.pipe(
    shareReplay(1)
  );

  const typingStates$ = stateManager.typingStates$.pipe(
    shareReplay(1)
  );

  // Lifecycle management
  const stop = (): void => {
    stopSubject.next();
  };

  const destroy = (): void => {
    // Signal stop to all ongoing operations
    stopSubject.next();
    stopSubject.complete();

    // Cleanup typing subscriptions
    typingCleanup();

    // Destroy services
    eventService.destroy();
    stateManager.destroy();

    // Signal destroy
    destroySubject.next();
    destroySubject.complete();
  };

  // Utility methods for compatibility
  const canPlayConversation = (): boolean => {
    return canPlay(stateManager.getCurrentState());
  };

  const canPauseConversation = (): boolean => {
    return canPause(stateManager.getCurrentState());
  };

  const canResetConversation = (): boolean => {
    return canReset(stateManager.getCurrentState());
  };

  const canJumpToMessage = (messageIndex: number): boolean => {
    return canJumpTo(stateManager.getCurrentState(), messageIndex);
  };

  // Debug utilities
  const getServiceStats = () => {
    const state = stateManager.getCurrentState();
    const eventStats = eventService.getState();

    return {
      state: {
        hasConversation: !!state.conversation,
        isPlaying: state.isPlaying,
        isPaused: state.isPaused,
        isCompleted: state.isCompleted,
        hasError: state.hasError,
        currentIndex: state.currentMessageIndex,
        totalMessages: state.conversation?.messages.length || 0,
        playbackSpeed: state.playbackSpeed,
        typingActiveCount: Array.from(state.typingStates.values()).filter(Boolean).length
      },
      events: {
        totalEvents: eventStats.events.length,
        lastEventType: eventStats.lastEvent?.type,
        isActive: eventStats.isActive
      },
      services: {
        playback: playbackService.config,
        messageProcessing: messageProcessingService.config,
        typing: typingService.config,
        orchestrator: orchestratorConfig
      }
    };
  };

  // Return the orchestrator interface
  return {
    // Core conversation operations
    loadConversation,
    play,
    pause,
    reset,
    jumpTo,
    setSpeed,

    // Navigation
    nextMessage,
    previousMessage,

    // State access (original ConversationEngine API compatibility)
    getCurrentState,
    getCurrentConversation,

    // Observable streams (original ConversationEngine API compatibility)
    conversation$,
    playbackState$,
    events$,
    messages$,
    currentMessage$,
    progress$,
    isPlaying$,
    typingStates$,

    // Capability checks
    canPlay: canPlayConversation,
    canPause: canPauseConversation,
    canReset: canResetConversation,
    canJumpTo: canJumpToMessage,

    // Lifecycle
    stop,
    destroy,

    // Services access (for advanced usage)
    services: {
      event: eventService,
      state: stateManager,
      playback: playbackService,
      messageProcessing: messageProcessingService,
      typing: typingService
    },

    // Debug and monitoring
    getStats: getServiceStats,
    config: orchestratorConfig
  };
};

// Type exports
export type ConversationOrchestrator = ReturnType<typeof createConversationOrchestrator>;

// Compatibility type alias (for migration from ConversationEngine)
export type ConversationEngine = ConversationOrchestrator;

// Factory function with config validation
export const createConversationEngine = (config: Partial<OrchestratorConfig> = {}): ConversationOrchestrator => {
  // Validate configuration
  if (config.debounceTime && (config.debounceTime < 0 || config.debounceTime > 1000)) {
    throw new Error('debounceTime must be between 0 and 1000ms');
  }

  if (config.throttleTime && (config.throttleTime < 1 || config.throttleTime > 100)) {
    throw new Error('throttleTime must be between 1 and 100ms');
  }

  if (config.maxRetries && (config.maxRetries < 1 || config.maxRetries > 10)) {
    throw new Error('maxRetries must be between 1 and 10');
  }

  return createConversationOrchestrator(config);
};