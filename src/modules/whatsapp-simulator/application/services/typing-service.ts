/**
 * TypingService - Functional service for typing indicator management
 * Handles typing states, auto-cleanup, and related events
 */

import { EMPTY,merge, Observable, Subject, timer } from 'rxjs';
import { filter, map, switchMap,takeUntil, tap } from 'rxjs/operators';

import { Message } from '../../domain/entities';
import { ConversationEvent, MessageTypingStartedEvent, MessageTypingStoppedEvent } from '../../domain/events';

import { EventService } from './event-service';
import { clearAllTypingStates,clearTypingState, PlaybackState, updateTypingState } from './state-service';

// Types
export interface TypingServiceConfig {
  enableDebug: boolean;
  autoCleanupDelay: number;
  maxTypingDuration: number;
  enableTypingIndicators: boolean;
}

export interface TypingState {
  sender: string;
  isTyping: boolean;
  startTime: Date;
  estimatedDuration?: number;
  message?: Message;
}

export interface TypingRequest {
  sender: string;
  isTyping: boolean;
  duration?: number;
  message?: Message;
}

export interface TypingStats {
  activeSenders: string[];
  totalActiveTyping: number;
  longestTypingDuration: number;
  averageTypingDuration: number;
}

// Configuration factory
export const createTypingServiceConfig = (overrides: Partial<TypingServiceConfig> = {}): TypingServiceConfig => ({
  enableDebug: false,
  autoCleanupDelay: 5000, // 5 seconds
  maxTypingDuration: 30000, // 30 seconds max
  enableTypingIndicators: true,
  ...overrides
});

// Typing state management functions
export const createTypingStateMap = (): Map<string, TypingState> => new Map();

export const addTypingState = (
  typingStates: Map<string, TypingState>,
  request: TypingRequest
): Map<string, TypingState> => {
  const newStates = new Map(typingStates);

  if (request.isTyping) {
    newStates.set(request.sender, {
      sender: request.sender,
      isTyping: true,
      startTime: new Date(),
      estimatedDuration: request.duration,
      message: request.message
    });
  } else {
    newStates.delete(request.sender);
  }

  return newStates;
};

export const removeTypingState = (
  typingStates: Map<string, TypingState>,
  sender: string
): Map<string, TypingState> => {
  const newStates = new Map(typingStates);
  newStates.delete(sender);
  return newStates;
};

export const clearAllTypingState = (): Map<string, TypingState> => new Map();

export const getTypingState = (
  typingStates: Map<string, TypingState>,
  sender: string
): TypingState | undefined => {
  return typingStates.get(sender);
};

export const isTyping = (
  typingStates: Map<string, TypingState>,
  sender: string
): boolean => {
  const state = typingStates.get(sender);
  return state?.isTyping ?? false;
};

// Typing statistics functions
export const getTypingStats = (typingStates: Map<string, TypingState>): TypingStats => {
  const activeStates = Array.from(typingStates.values()).filter(state => state.isTyping);
  const activeSenders = activeStates.map(state => state.sender);

  const durations = activeStates
    .filter(state => state.estimatedDuration)
    .map(state => state.estimatedDuration!);

  return {
    activeSenders,
    totalActiveTyping: activeSenders.length,
    longestTypingDuration: durations.length > 0 ? Math.max(...durations) : 0,
    averageTypingDuration: durations.length > 0
      ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
      : 0
  };
};

export const getActiveTypingSenders = (typingStates: Map<string, TypingState>): string[] => {
  return Array.from(typingStates.values())
    .filter(state => state.isTyping)
    .map(state => state.sender);
};

export const hasActiveTyping = (typingStates: Map<string, TypingState>): boolean => {
  return Array.from(typingStates.values()).some(state => state.isTyping);
};

export const getTypingDuration = (
  typingStates: Map<string, TypingState>,
  sender: string
): number => {
  const state = typingStates.get(sender);
  if (!state || !state.isTyping) return 0;

  return Date.now() - state.startTime.getTime();
};

// Event processing functions
export const processTypingStartedEvent = (
  event: MessageTypingStartedEvent,
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig
): void => {
  if (!config.enableTypingIndicators) return;

  const { message, typingDuration } = event.payload;

  updateState(state => updateTypingState(state, message.sender, true));

  // Schedule auto-cleanup
  timer(typingDuration).subscribe(() => {
    updateState(state => updateTypingState(state, message.sender, false));
  });

  logDebug(config, `Typing started for ${message.sender}`, { duration: typingDuration });
};

export const processTypingStoppedEvent = (
  event: MessageTypingStoppedEvent,
  currentState: PlaybackState,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig
): void => {
  if (!config.enableTypingIndicators) return;

  const { message } = event.payload;
  updateState(state => updateTypingState(state, message.sender, false));

  logDebug(config, `Typing stopped for ${message.sender}`);
};

// Auto-cleanup functions
export const createTypingCleanup = (
  typingStates: Map<string, TypingState>,
  config: TypingServiceConfig
): (() => void) => {
  const timeoutIds: NodeJS.Timeout[] = [];

  // Set cleanup timers for all active typing states
  typingStates.forEach((state, sender) => {
    if (state.isTyping) {
      const elapsedTime = Date.now() - state.startTime.getTime();
      const remainingTime = Math.max(0, (state.estimatedDuration || config.maxTypingDuration) - elapsedTime);

      const timeoutId = setTimeout(() => {
        logDebug(config, `Auto-cleanup typing state for ${sender}`);
        // This would need to be connected to the state updater
      }, remainingTime);

      timeoutIds.push(timeoutId);
    }
  });

  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
};

export const scheduleTypingCleanup = (
  sender: string,
  duration: number,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig
): (() => void) => {
  const timeoutId = setTimeout(() => {
    updateState(state => updateTypingState(state, sender, false));
    logDebug(config, `Auto-cleanup typing for ${sender} after ${duration}ms`);
  }, duration);

  return () => clearTimeout(timeoutId);
};

// Typing validation functions
export const validateTypingRequest = (request: TypingRequest): { valid: boolean; reason?: string } => {
  if (!request.sender || request.sender.trim().length === 0) {
    return { valid: false, reason: 'Sender is required and cannot be empty' };
  }

  if (request.duration !== undefined && (request.duration < 0 || request.duration > 30000)) {
    return { valid: false, reason: 'Duration must be between 0 and 30000ms' };
  }

  return { valid: true };
};

export const validateTypingDuration = (duration: number): boolean => {
  return duration >= 0 && duration <= 30000;
};

export const shouldAutoCleanup = (
  state: TypingState,
  config: TypingServiceConfig
): boolean => {
  if (!state.isTyping) return false;

  const elapsedTime = Date.now() - state.startTime.getTime();
  const maxDuration = state.estimatedDuration || config.maxTypingDuration;

  return elapsedTime >= maxDuration;
};

// Event subscription functions
export const subscribeToTypingEvents = (
  events$: Observable<ConversationEvent>,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig,
  stopSignal$: Observable<void>
): (() => void) => {
  const subscriptions: (() => void)[] = [];

  // Subscribe to typing started events
  const typingStartedSub = events$.pipe(
    filter(event => event.type === 'message.typing_started'),
    takeUntil(stopSignal$)
  ).subscribe(event => {
    processTypingStartedEvent(
      event as MessageTypingStartedEvent,
      { typingStates: new Map() } as PlaybackState, // This needs proper state
      updateState,
      config
    );
  });

  // Subscribe to typing stopped events
  const typingStoppedSub = events$.pipe(
    filter(event => event.type === 'message.typing_stopped'),
    takeUntil(stopSignal$)
  ).subscribe(event => {
    processTypingStoppedEvent(
      event as MessageTypingStoppedEvent,
      { typingStates: new Map() } as PlaybackState, // This needs proper state
      updateState,
      config
    );
  });

  subscriptions.push(
    () => typingStartedSub.unsubscribe(),
    () => typingStoppedSub.unsubscribe()
  );

  return () => subscriptions.forEach(unsub => unsub());
};

// Manual typing control functions
export const startTyping = (
  sender: string,
  duration: number,
  message: Message | undefined,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  eventService: EventService,
  config: TypingServiceConfig
): { success: boolean; cleanup?: () => void; error?: Error } => {
  const request: TypingRequest = { sender, isTyping: true, duration, message };
  const validation = validateTypingRequest(request);

  if (!validation.valid) {
    return { success: false, error: new Error(validation.reason) };
  }

  try {
    // Update state
    updateState(state => updateTypingState(state, sender, true));

    // Schedule cleanup
    const cleanup = scheduleTypingCleanup(sender, duration, updateState, config);

    logDebug(config, `Started typing for ${sender}`, { duration });

    return { success: true, cleanup };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const stopTyping = (
  sender: string,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig
): { success: boolean; error?: Error } => {
  try {
    updateState(state => updateTypingState(state, sender, false));
    logDebug(config, `Stopped typing for ${sender}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const stopAllTyping = (
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  config: TypingServiceConfig
): { success: boolean; error?: Error } => {
  try {
    updateState(clearAllTypingStates);
    logDebug(config, 'Stopped all typing indicators');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// Utility functions
export const formatTypingDuration = (durationMs: number): string => {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  } else {
    return `${(durationMs / 60000).toFixed(1)}m`;
  }
};

export const estimateTypingDuration = (message: Message): number => {
  // Estimate based on content length and average typing speed
  const contentLength = message.content.length;
  const averageTypingSpeed = 50; // characters per second
  const baseTime = (contentLength / averageTypingSpeed) * 1000;

  // Add some variance and minimum duration
  return Math.max(500, baseTime + Math.random() * 1000);
};

export const createTypingIndicatorText = (activeSenders: string[]): string => {
  if (activeSenders.length === 0) return '';
  if (activeSenders.length === 1) return `${activeSenders[0]} is typing...`;
  if (activeSenders.length === 2) return `${activeSenders[0]} and ${activeSenders[1]} are typing...`;
  return `${activeSenders[0]} and ${activeSenders.length - 1} others are typing...`;
};

// Debug functions
export const logDebug = (
  config: TypingServiceConfig,
  message: string,
  data?: any
): void => {
  if (config.enableDebug) {
    console.log(`[TypingService] ${message}`, data);
  }
};

export const logTypingStats = (
  typingStates: Map<string, TypingState>,
  config: TypingServiceConfig
): void => {
  if (config.enableDebug) {
    const stats = getTypingStats(typingStates);
    console.log('[TypingService] Current stats:', stats);
  }
};

// Factory function
export const createTypingService = (
  config: Partial<TypingServiceConfig> = {}
) => {
  const serviceConfig = createTypingServiceConfig(config);

  return {
    // State management
    createStateMap: createTypingStateMap,
    addState: (states: Map<string, TypingState>, request: TypingRequest) =>
      addTypingState(states, request),
    removeState: (states: Map<string, TypingState>, sender: string) =>
      removeTypingState(states, sender),
    clearAll: clearAllTypingState,

    // Queries
    isTyping: (states: Map<string, TypingState>, sender: string) => isTyping(states, sender),
    getState: (states: Map<string, TypingState>, sender: string) => getTypingState(states, sender),
    getStats: (states: Map<string, TypingState>) => getTypingStats(states),
    getActiveSenders: (states: Map<string, TypingState>) => getActiveTypingSenders(states),
    hasActive: (states: Map<string, TypingState>) => hasActiveTyping(states),
    getDuration: (states: Map<string, TypingState>, sender: string) => getTypingDuration(states, sender),

    // Event processing
    processTypingStarted: processTypingStartedEvent,
    processTypingStopped: processTypingStoppedEvent,
    subscribeToEvents: subscribeToTypingEvents,

    // Manual control
    startTyping: (sender: string, duration: number, message: Message | undefined, updateState: any, eventService: EventService) =>
      startTyping(sender, duration, message, updateState, eventService, serviceConfig),
    stopTyping: (sender: string, updateState: any) =>
      stopTyping(sender, updateState, serviceConfig),
    stopAll: (updateState: any) =>
      stopAllTyping(updateState, serviceConfig),

    // Utilities
    validateRequest: validateTypingRequest,
    validateDuration: validateTypingDuration,
    formatDuration: formatTypingDuration,
    estimateDuration: estimateTypingDuration,
    createIndicatorText: createTypingIndicatorText,

    // Configuration
    config: serviceConfig
  };
};

// Type exports
export type TypingService = ReturnType<typeof createTypingService>;