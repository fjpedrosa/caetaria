/**
 * PlaybackService - Functional service for playback control operations
 * Handles play, pause, reset, jump, and speed control with pure functions
 */

import { EMPTY, merge, Observable, of,Subject, timer } from 'rxjs';
import { catchError, filter,switchMap, takeUntil, tap } from 'rxjs/operators';

import { Conversation, getConversationProgress, getCurrentMessage, getNextMessage, jumpToMessage, Message,resetConversation } from '../../domain/entities';
import { ConversationEvent, ConversationEventFactory } from '../../domain/events';

import { EventService } from './event-service';
import {
  canJumpTo,
  canPause,
  canPlay,
  canReset,
  PlaybackState,
  updateWithCompletion,
  updateWithError,
  updateWithJump,
  updateWithPlaybackPause,
  updateWithPlaybackStart,
  updateWithReset,
  updateWithSpeedChange,
  validatePlaybackSpeed} from './state-service';

// Types
export interface PlaybackConfig {
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
  fastModeEnabled: boolean;
  maxRetries: number;
}

export interface PlaybackResult {
  success: boolean;
  error?: Error;
  event?: ConversationEvent;
}

export interface PlayRequest {
  conversation?: Conversation;
  autoStart?: boolean;
}

export interface JumpRequest {
  messageIndex: number;
}

export interface SpeedRequest {
  speed: number;
}

// Configuration factory
export const createPlaybackConfig = (overrides: Partial<PlaybackConfig> = {}): PlaybackConfig => ({
  enableDebug: false,
  enablePerformanceTracking: false,
  fastModeEnabled: false,
  maxRetries: 3,
  ...overrides
});

// Validation functions
export const validatePlayRequest = (request: PlayRequest, state: PlaybackState): { valid: boolean; reason?: string } => {
  if (request.conversation && !request.conversation.messages.length) {
    return { valid: false, reason: 'Conversation has no messages' };
  }

  if (!request.conversation && !state.conversation) {
    return { valid: false, reason: 'No conversation loaded' };
  }

  if (request.autoStart && !canPlay(state)) {
    return { valid: false, reason: 'Cannot start playback in current state' };
  }

  return { valid: true };
};

export const validateJumpRequest = (request: JumpRequest, state: PlaybackState): { valid: boolean; reason?: string } => {
  if (!canJumpTo(state, request.messageIndex)) {
    return { valid: false, reason: `Invalid message index: ${request.messageIndex}` };
  }

  return { valid: true };
};

export const validateSpeedRequest = (request: SpeedRequest): { valid: boolean; reason?: string } => {
  if (!validatePlaybackSpeed(request.speed)) {
    return { valid: false, reason: `Speed must be between 0.1x and 5.0x, got ${request.speed}x` };
  }

  return { valid: true };
};

// Core playback functions
export const executePlay = async (
  request: PlayRequest,
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  const validation = validatePlayRequest(request, currentState);
  if (!validation.valid) {
    const error = new Error(validation.reason);
    updateState(state => updateWithError(state, error));
    return { success: false, error };
  }

  try {
    // Load conversation if provided
    if (request.conversation) {
      updateState(state => ({
        ...state,
        conversation: request.conversation!,
        currentMessageIndex: request.conversation!.currentIndex,
        currentMessage: getCurrentMessage(request.conversation!),
        nextMessage: getNextMessage(request.conversation!),
        playbackSpeed: request.conversation!.settings.playbackSpeed,
        isCompleted: false,
        hasError: false,
        error: undefined
      }));
    }

    // Start playback if requested
    if (request.autoStart) {
      const conversation = request.conversation || currentState.conversation;
      if (conversation && canPlay(currentState)) {
        // Note: play is not a method on the functional conversation
        // Just update the state
        updateState(updateWithPlaybackStart);

        const event = ConversationEventFactory.createConversationStarted(
          conversation.metadata.id,
          conversation
        );

        eventService.emit(event);
        return { success: true, event };
      }
    }

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    updateState(state => updateWithError(state, err));
    return { success: false, error: err };
  }
};

export const executePause = async (
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  if (!canPause(currentState)) {
    const error = new Error('Cannot pause: playback is not active');
    return { success: false, error };
  }

  try {
    const conversation = currentState.conversation!;
    // Note: pause is not a method on the functional conversation
    // Just update the state
    updateState(updateWithPlaybackPause);

    const event = ConversationEventFactory.createConversationPaused(
      conversation.metadata.id,
      conversation.currentIndex,
      getConversationProgress(conversation)
    );

    eventService.emit(event);
    return { success: true, event };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    updateState(state => updateWithError(state, err));
    return { success: false, error: err };
  }
};

export const executeReset = async (
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  if (!canReset(currentState)) {
    const error = new Error('Cannot reset: no conversation loaded');
    return { success: false, error };
  }

  try {
    const conversation = currentState.conversation!;
    // Note: reset returns a new conversation instance in functional approach
    const resetConv = resetConversation(conversation);
    updateState(state => ({ ...updateWithReset(state), conversation: resetConv }));

    const event = ConversationEventFactory.createDebug(
      conversation.metadata.id,
      'info',
      'Conversation reset'
    );

    eventService.emit(event);
    return { success: true, event };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    updateState(state => updateWithError(state, err));
    return { success: false, error: err };
  }
};

export const executeJump = async (
  request: JumpRequest,
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  const validation = validateJumpRequest(request, currentState);
  if (!validation.valid) {
    const error = new Error(validation.reason);
    return { success: false, error };
  }

  try {
    const conversation = currentState.conversation!;
    const previousIndex = conversation.currentIndex;

    // Note: jumpTo returns a new conversation instance in functional approach
    const jumpedConv = jumpToMessage(conversation, request.messageIndex);
    updateState(state => ({ ...updateWithJump(state, request.messageIndex), conversation: jumpedConv }));

    const event = ConversationEventFactory.createDebug(
      jumpedConv.metadata.id,
      'info',
      `Jumped from message ${previousIndex} to ${request.messageIndex}`,
      { message: getCurrentMessage(jumpedConv) }
    );

    eventService.emit(event);
    return { success: true, event };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    updateState(state => updateWithError(state, err));
    return { success: false, error: err };
  }
};

export const executeSpeedChange = async (
  request: SpeedRequest,
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  const validation = validateSpeedRequest(request);
  if (!validation.valid) {
    const error = new Error(validation.reason);
    return { success: false, error };
  }

  try {
    const previousSpeed = currentState.playbackSpeed;
    updateState(state => updateWithSpeedChange(state, request.speed));

    if (currentState.conversation) {
      const event = {
        id: `speed-change-${Date.now()}`,
        type: 'conversation.speed_changed' as const,
        timestamp: new Date(),
        conversationId: currentState.conversation.metadata.id,
        payload: {
          previousSpeed,
          newSpeed: request.speed
        }
      };

      eventService.emit(event);
      return { success: true, event };
    }

    return { success: true };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    updateState(state => updateWithError(state, err));
    return { success: false, error: err };
  }
};

// Navigation helper functions
export const executeNext = async (
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  if (!currentState.conversation) {
    return { success: false, error: new Error('No conversation loaded') };
  }

  const nextIndex = currentState.currentMessageIndex + 1;
  if (nextIndex >= currentState.conversation.messages.length) {
    return { success: false, error: new Error('Already at last message') };
  }

  return executeJump({ messageIndex: nextIndex }, currentState, updateState, eventService);
};

export const executePrevious = async (
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService
): Promise<PlaybackResult> => {
  if (!currentState.conversation) {
    return { success: false, error: new Error('No conversation loaded') };
  }

  const previousIndex = currentState.currentMessageIndex - 1;
  if (previousIndex < 0) {
    return { success: false, error: new Error('Already at first message') };
  }

  return executeJump({ messageIndex: previousIndex }, currentState, updateState, eventService);
};

// Utility functions
export const calculatePlaybackDuration = (conversation: Conversation, playbackSpeed: number): number => {
  const totalDuration = conversation.messages.reduce((total, message) => {
    return total + message.timing.delayBeforeTyping + message.timing.typingDuration;
  }, 0);

  return totalDuration / playbackSpeed;
};

export const calculateTimeToMessage = (
  conversation: Conversation,
  targetIndex: number,
  playbackSpeed: number
): number => {
  const messages = conversation.messages.slice(0, Math.max(0, targetIndex));
  const duration = messages.reduce((total, message) => {
    return total + message.timing.delayBeforeTyping + message.timing.typingDuration;
  }, 0);

  return duration / playbackSpeed;
};

export const getPlaybackProgress = (state: PlaybackState): number => {
  return state.progress.completionPercentage;
};

export const isPlaybackActive = (state: PlaybackState): boolean => {
  return state.isPlaying && !state.isPaused;
};

export const canAdvanceToNext = (state: PlaybackState): boolean => {
  if (!state.conversation) return false;
  return state.currentMessageIndex < state.conversation.messages.length - 1;
};

export const canGoToPrevious = (state: PlaybackState): boolean => {
  return state.currentMessageIndex > 0;
};

// Debug and logging functions
export const logPlaybackAction = (
  action: string,
  config: PlaybackConfig,
  data?: any
): void => {
  if (config.enableDebug) {
    console.log(`[PlaybackService] ${action}:`, data);
  }
};

export const measurePlaybackPerformance = <T>(
  operationName: string,
  config: PlaybackConfig,
  operation: () => T
): T => {
  if (!config.enablePerformanceTracking) {
    return operation();
  }

  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;

  console.log(`[PlaybackService] ${operationName} completed in ${duration.toFixed(2)}ms`);
  return result;
};

// Factory function for creating playback service
export const createPlaybackService = (
  config: Partial<PlaybackConfig> = {}
) => {
  const serviceConfig = createPlaybackConfig(config);

  return {
    // Core operations
    play: (request: PlayRequest, state: PlaybackState, updateState: any, eventService: EventService) =>
      executePlay(request, state, updateState, eventService),

    pause: (state: PlaybackState, updateState: any, eventService: EventService) =>
      executePause(state, updateState, eventService),

    reset: (state: PlaybackState, updateState: any, eventService: EventService) =>
      executeReset(state, updateState, eventService),

    jump: (request: JumpRequest, state: PlaybackState, updateState: any, eventService: EventService) =>
      executeJump(request, state, updateState, eventService),

    setSpeed: (request: SpeedRequest, state: PlaybackState, updateState: any, eventService: EventService) =>
      executeSpeedChange(request, state, updateState, eventService),

    // Navigation helpers
    next: (state: PlaybackState, updateState: any, eventService: EventService) =>
      executeNext(state, updateState, eventService),

    previous: (state: PlaybackState, updateState: any, eventService: EventService) =>
      executePrevious(state, updateState, eventService),

    // Utility functions
    calculateDuration: calculatePlaybackDuration,
    calculateTimeToMessage,
    getProgress: getPlaybackProgress,
    isActive: isPlaybackActive,
    canAdvance: canAdvanceToNext,
    canGoBack: canGoToPrevious,

    // Configuration
    config: serviceConfig
  };
};

// Type exports
export type PlaybackService = ReturnType<typeof createPlaybackService>;