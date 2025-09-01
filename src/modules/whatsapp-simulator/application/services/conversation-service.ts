/**
 * Conversation Service - Functional service for conversation operations
 * Replaces the complex ConversationEngine class with pure functions
 */

import { Conversation, ConversationStatus,Message } from '../../domain/entities';
import {
  ConversationEvent,
  ConversationEventFactory,
  ConversationProgressEvent,
  MessageSentEvent,
  MessageTypingStartedEvent
} from '../../domain/events';

// Configuration types
export interface ConversationConfig {
  maxRetries: number;
  debounceTime: number;
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
  optimizeTransitions: boolean;
  fastModeEnabled: boolean;
}

export interface PlaybackState {
  conversation: Conversation | null;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  currentMessageIndex: number;
  currentMessage: Message | null;
  nextMessage: Message | null;
  playbackSpeed: number;
  progress: {
    completionPercentage: number;
    elapsedTime: number;
    remainingTime: number;
  };
  typingStates: Map<string, boolean>;
  error?: Error;
}

export interface TimingCalculation {
  delayBeforeTyping: number;
  typingDuration: number;
  totalDuration: number;
}

// Factory functions for configuration
export const createDefaultConfig = (overrides: Partial<ConversationConfig> = {}): ConversationConfig => ({
  maxRetries: 3,
  debounceTime: overrides.optimizeTransitions ? 50 : 100,
  enableDebug: false,
  enablePerformanceTracking: false,
  optimizeTransitions: true,
  fastModeEnabled: false,
  ...overrides
});

export const createInitialPlaybackState = (): PlaybackState => ({
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
  typingStates: new Map()
});

// Pure functions for conversation operations
export const validatePlaybackSpeed = (speed: number): boolean => {
  return speed >= 0.1 && speed <= 5.0;
};

export const calculateMessageTiming = (
  message: Message,
  playbackSpeed: number,
  fastMode: boolean = false
): TimingCalculation => {
  const baseDelayBeforeTyping = message.timing.delayBeforeTyping / playbackSpeed;
  const baseTypingDuration = message.timing.typingDuration / playbackSpeed;

  const delayBeforeTyping = fastMode
    ? Math.min(baseDelayBeforeTyping, 500)
    : baseDelayBeforeTyping;

  const typingDuration = fastMode
    ? Math.min(baseTypingDuration, 800)
    : baseTypingDuration;

  return {
    delayBeforeTyping,
    typingDuration,
    totalDuration: delayBeforeTyping + typingDuration
  };
};

export const calculateProgress = (
  currentIndex: number,
  totalMessages: number,
  elapsedTime: number = 0
): PlaybackState['progress'] => {
  const completionPercentage = totalMessages > 0
    ? (currentIndex / totalMessages) * 100
    : 0;

  return {
    completionPercentage,
    elapsedTime,
    remainingTime: 0 // Will be calculated by specific hooks
  };
};

export const canPlay = (state: PlaybackState): boolean => {
  return state.conversation !== null &&
         !state.isPlaying &&
         !state.hasError &&
         !state.isCompleted;
};

export const canPause = (state: PlaybackState): boolean => {
  return state.isPlaying && !state.isPaused;
};

export const canReset = (state: PlaybackState): boolean => {
  return state.conversation !== null;
};

export const canJumpTo = (state: PlaybackState, messageIndex: number): boolean => {
  if (!state.conversation) return false;
  return messageIndex >= 0 && messageIndex < state.conversation.messages.length;
};

// Event creation functions
export const createPlaybackStartedEvent = (
  conversation: Conversation
): ConversationEvent => {
  return ConversationEventFactory.createConversationStarted(
    conversation.metadata.id,
    conversation
  );
};

export const createPlaybackPausedEvent = (
  conversation: Conversation,
  currentIndex: number
): ConversationEvent => {
  return ConversationEventFactory.createConversationPaused(
    conversation.metadata.id,
    currentIndex,
    conversation.getProgress()
  );
};

export const createMessageTypingEvent = (
  conversation: Conversation,
  message: Message,
  currentIndex: number,
  typingDuration: number
): MessageTypingStartedEvent => {
  return ConversationEventFactory.createMessageTypingStarted(
    conversation.metadata.id,
    message,
    currentIndex,
    typingDuration
  );
};

export const createMessageSentEvent = (
  conversation: Conversation,
  message: Message,
  currentIndex: number
): MessageSentEvent => {
  return ConversationEventFactory.createMessageSent(
    conversation.metadata.id,
    message,
    currentIndex
  );
};

export const createProgressEvent = (
  conversation: Conversation,
  progress: PlaybackState['progress']
): ConversationProgressEvent => ({
  id: `progress-${Date.now()}`,
  type: 'conversation.progress',
  timestamp: new Date(),
  conversationId: conversation.metadata.id,
  payload: {
    progress,
    currentMessage: conversation.currentMessage
  }
});

export const createDebugEvent = (
  conversation: Conversation,
  level: 'info' | 'debug' | 'warn' | 'error',
  message: string,
  metadata?: any
): ConversationEvent => {
  return ConversationEventFactory.createDebug(
    conversation.metadata.id,
    level,
    message,
    metadata
  );
};

export const createErrorEvent = (
  conversation: Conversation,
  error: Error,
  currentIndex: number
): ConversationEvent => {
  return ConversationEventFactory.createError(
    conversation.metadata.id,
    error,
    currentIndex,
    true
  );
};

// State transformation functions
export const updatePlaybackStateWithConversation = (
  state: PlaybackState,
  conversation: Conversation
): PlaybackState => ({
  ...state,
  conversation,
  currentMessageIndex: conversation.currentIndex,
  currentMessage: conversation.currentMessage,
  nextMessage: conversation.nextMessage,
  playbackSpeed: conversation.settings.playbackSpeed,
  progress: calculateProgress(
    conversation.currentIndex,
    conversation.messages.length
  )
});

export const updatePlaybackStateWithPlayback = (
  state: PlaybackState,
  isPlaying: boolean,
  isPaused: boolean = false
): PlaybackState => ({
  ...state,
  isPlaying,
  isPaused,
  hasError: false
});

export const updatePlaybackStateWithError = (
  state: PlaybackState,
  error: Error
): PlaybackState => ({
  ...state,
  hasError: true,
  isPlaying: false,
  error
});

export const updatePlaybackStateWithCompletion = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  isPlaying: false,
  isCompleted: true
});

export const updatePlaybackStateWithJump = (
  state: PlaybackState,
  messageIndex: number
): PlaybackState => {
  if (!state.conversation || !canJumpTo(state, messageIndex)) {
    return state;
  }

  const conversation = state.conversation;
  conversation.jumpTo(messageIndex);

  return {
    ...state,
    currentMessageIndex: messageIndex,
    currentMessage: conversation.currentMessage,
    nextMessage: conversation.nextMessage,
    progress: calculateProgress(messageIndex, conversation.messages.length)
  };
};

export const updatePlaybackStateWithSpeed = (
  state: PlaybackState,
  speed: number
): PlaybackState => {
  if (!validatePlaybackSpeed(speed) || !state.conversation) {
    return state;
  }

  return {
    ...state,
    playbackSpeed: speed
  };
};

// Typing state management functions
export const setTypingState = (
  typingStates: Map<string, boolean>,
  sender: string,
  isTyping: boolean
): Map<string, boolean> => {
  const newStates = new Map(typingStates);
  newStates.set(sender, isTyping);
  return newStates;
};

export const clearAllTypingStates = (): Map<string, boolean> => new Map();

export const getActiveTypingSenders = (typingStates: Map<string, boolean>): string[] => {
  return Array.from(typingStates.entries())
    .filter(([_, isTyping]) => isTyping)
    .map(([sender]) => sender);
};

// Performance and debug utilities
export const logDebug = (
  config: ConversationConfig,
  message: string,
  data?: any
): void => {
  if (config.enableDebug) {
    console.log(`[ConversationService] ${message}`, data);
  }
};

export const measurePerformance = <T>(
  config: ConversationConfig,
  operationName: string,
  fn: () => T
): T => {
  if (!config.enablePerformanceTracking) {
    return fn();
  }

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`[ConversationService] ${operationName} took ${end - start}ms`);
  return result;
};

// Cleanup utilities
export const createCleanupFunction = (...cleanupFns: (() => void)[]): (() => void) => {
  return () => {
    cleanupFns.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.warn('[ConversationService] Cleanup error:', error);
      }
    });
  };
};

// Validation functions
export const validateConversation = (conversation: Conversation | null): conversation is Conversation => {
  return conversation !== null &&
         conversation.messages.length > 0 &&
         typeof conversation.metadata?.id === 'string';
};

export const validateMessage = (message: Message | null): message is Message => {
  return message !== null &&
         typeof message.content === 'string' &&
         message.content.length > 0 &&
         typeof message.sender === 'string';
};