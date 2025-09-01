/**
 * MessageProcessingService - Functional service for message timing and flow processing
 * Handles the complex message playback stream logic from ConversationEngine
 */

import { EMPTY, merge,Observable, Subject, timer } from 'rxjs';
import { catchError, finalize,switchMap, takeUntil, tap } from 'rxjs/operators';

import { Conversation, Message } from '../../domain/entities';
import { ConversationEvent, ConversationEventFactory } from '../../domain/events';

import { EventService } from './event-service';
import { PlaybackState, updateWithCompletion,updateWithMessageAdvance } from './state-service';

// Types
export interface MessageProcessingConfig {
  enableDebug: boolean;
  enablePerformanceTracking: boolean;
  fastModeEnabled: boolean;
  maxDelayBeforeTyping: number;
  maxTypingDuration: number;
  useOptimizedTiming: boolean;
}

export interface MessageTiming {
  delayBeforeTyping: number;
  typingDuration: number;
  totalDuration: number;
}

export interface MessageProcessingContext {
  conversation: Conversation;
  currentMessage: Message;
  messageIndex: number;
  playbackSpeed: number;
  config: MessageProcessingConfig;
}

export interface MessageProcessingResult {
  success: boolean;
  completed: boolean;
  error?: Error;
  events: ConversationEvent[];
}

// Configuration factory
export const createMessageProcessingConfig = (overrides: Partial<MessageProcessingConfig> = {}): MessageProcessingConfig => ({
  enableDebug: false,
  enablePerformanceTracking: false,
  fastModeEnabled: false,
  maxDelayBeforeTyping: 500,
  maxTypingDuration: 800,
  useOptimizedTiming: true,
  ...overrides
});

// Timing calculation functions
export const calculateMessageTiming = (
  message: Message,
  playbackSpeed: number,
  config: MessageProcessingConfig
): MessageTiming => {
  const baseDelayBeforeTyping = message.timing.delayBeforeTyping / playbackSpeed;
  const baseTypingDuration = message.timing.typingDuration / playbackSpeed;

  const delayBeforeTyping = config.fastModeEnabled
    ? Math.min(baseDelayBeforeTyping, config.maxDelayBeforeTyping)
    : baseDelayBeforeTyping;

  const typingDuration = config.fastModeEnabled
    ? Math.min(baseTypingDuration, config.maxTypingDuration)
    : baseTypingDuration;

  return {
    delayBeforeTyping,
    typingDuration,
    totalDuration: delayBeforeTyping + typingDuration
  };
};

export const calculateOptimizedTiming = (
  message: Message,
  playbackSpeed: number,
  config: MessageProcessingConfig
): MessageTiming => {
  if (!config.useOptimizedTiming) {
    return calculateMessageTiming(message, playbackSpeed, config);
  }

  // Optimized timing based on message content length
  const contentLength = message.content.length;
  const baseTypingSpeed = 50; // characters per second

  const calculatedTypingDuration = Math.max(500, (contentLength / baseTypingSpeed) * 1000);
  const adjustedTypingDuration = calculatedTypingDuration / playbackSpeed;

  const delayBeforeTyping = config.fastModeEnabled
    ? Math.min(message.timing.delayBeforeTyping / playbackSpeed, config.maxDelayBeforeTyping)
    : message.timing.delayBeforeTyping / playbackSpeed;

  const typingDuration = config.fastModeEnabled
    ? Math.min(adjustedTypingDuration, config.maxTypingDuration)
    : adjustedTypingDuration;

  return {
    delayBeforeTyping,
    typingDuration,
    totalDuration: delayBeforeTyping + typingDuration
  };
};

// Message validation functions
export const validateMessageForProcessing = (message: Message): { valid: boolean; reason?: string } => {
  if (!message) {
    return { valid: false, reason: 'Message is null or undefined' };
  }

  if (!message.content || message.content.trim().length === 0) {
    return { valid: false, reason: 'Message content is empty' };
  }

  if (!message.sender || message.sender.trim().length === 0) {
    return { valid: false, reason: 'Message sender is empty' };
  }

  if (!message.timing) {
    return { valid: false, reason: 'Message timing is missing' };
  }

  return { valid: true };
};

export const validateProcessingContext = (context: MessageProcessingContext): { valid: boolean; reason?: string } => {
  if (!context.conversation) {
    return { valid: false, reason: 'Conversation is missing' };
  }

  if (!context.currentMessage) {
    return { valid: false, reason: 'Current message is missing' };
  }

  if (context.messageIndex < 0 || context.messageIndex >= context.conversation.messages.length) {
    return { valid: false, reason: 'Invalid message index' };
  }

  if (context.playbackSpeed <= 0 || context.playbackSpeed > 5) {
    return { valid: false, reason: 'Invalid playback speed' };
  }

  return validateMessageForProcessing(context.currentMessage);
};

// Core message processing functions
export const processMessage = (
  context: MessageProcessingContext,
  eventService: EventService
): Observable<ConversationEvent> => {
  return new Observable<ConversationEvent>(subscriber => {
    const { conversation, currentMessage, messageIndex, config } = context;

    // Validate context
    const validation = validateProcessingContext(context);
    if (!validation.valid) {
      const error = new Error(validation.reason);
      subscriber.error(error);
      return;
    }

    // Calculate timing
    const timing = config.useOptimizedTiming
      ? calculateOptimizedTiming(currentMessage, context.playbackSpeed, config)
      : calculateMessageTiming(currentMessage, context.playbackSpeed, config);

    logDebug(config, `Processing message ${messageIndex}`, {
      content: currentMessage.content.substring(0, 50),
      timing
    });

    // Emit debug event for message processing start
    const debugEvent = ConversationEventFactory.createDebug(
      conversation.metadata.id,
      'debug',
      `Processing message ${messageIndex}`,
      { message: currentMessage, timing }
    );

    subscriber.next(debugEvent);

    // Start delay timer
    const delayTimer = timer(timing.delayBeforeTyping).subscribe(() => {
      if (!conversation.isPlaying) {
        logDebug(config, 'Conversation stopped during delay, aborting message processing');
        subscriber.complete();
        return;
      }

      // Emit typing started event
      const typingEvent = ConversationEventFactory.createMessageTypingStarted(
        conversation.metadata.id,
        currentMessage,
        messageIndex,
        timing.typingDuration
      );

      subscriber.next(typingEvent);

      // Start typing timer
      const typingTimer = timer(timing.typingDuration).subscribe(() => {
        if (!conversation.isPlaying) {
          logDebug(config, 'Conversation stopped during typing, aborting message processing');
          subscriber.complete();
          return;
        }

        // Update message status
        currentMessage.updateStatus('sent');

        // Emit message sent event
        const sentEvent = ConversationEventFactory.createMessageSent(
          conversation.metadata.id,
          currentMessage,
          messageIndex
        );

        subscriber.next(sentEvent);

        logDebug(config, `Message ${messageIndex} sent successfully`);
        subscriber.complete();
      });

      // Store typing timer for cleanup
      return () => typingTimer.unsubscribe();
    });

    // Return cleanup function
    return () => {
      delayTimer.unsubscribe();
    };
  });
};

export const createMessagePlaybackStream = (
  conversation: Conversation,
  config: MessageProcessingConfig,
  eventService: EventService,
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void,
  stopSignal$: Observable<void>
): Observable<ConversationEvent> => {
  return new Observable<ConversationEvent>(subscriber => {
    const processNextMessage = () => {
      const currentMessage = conversation.currentMessage;
      const messageIndex = conversation.currentIndex;

      if (!currentMessage) {
        // Conversation completed
        logDebug(config, 'No more messages, conversation completed');

        updateState(updateWithCompletion);

        const completedEvent = ConversationEventFactory.createDebug(
          conversation.metadata.id,
          'info',
          'Conversation completed'
        );

        subscriber.next(completedEvent);
        subscriber.complete();
        return;
      }

      // Create processing context
      const context: MessageProcessingContext = {
        conversation,
        currentMessage,
        messageIndex,
        playbackSpeed: conversation.settings.playbackSpeed,
        config
      };

      // Process the message
      processMessage(context, eventService).subscribe({
        next: (event) => {
          subscriber.next(event);
        },
        complete: () => {
          // Message processing completed, advance to next
          const hasNext = conversation.advanceToNext();

          updateState(updateWithMessageAdvance);

          if (hasNext && conversation.isPlaying) {
            // Schedule next message processing
            if (config.useOptimizedTiming) {
              // Use requestAnimationFrame for smoother transitions
              requestAnimationFrame(() => processNextMessage());
            } else {
              // Use setTimeout for standard timing
              setTimeout(() => processNextMessage(), 0);
            }
          } else {
            // Conversation completed or stopped
            updateState(updateWithCompletion);

            const completedEvent = ConversationEventFactory.createDebug(
              conversation.metadata.id,
              'info',
              hasNext ? 'Conversation stopped' : 'Conversation completed'
            );

            subscriber.next(completedEvent);
            subscriber.complete();
          }
        },
        error: (error) => {
          logDebug(config, `Message processing error for message ${messageIndex}:`, error);
          subscriber.error(error);
        }
      });
    };

    // Start processing
    processNextMessage();

    // Return cleanup function
    return () => {
      // Cleanup logic if needed
    };
  }).pipe(
    takeUntil(stopSignal$),
    catchError(error => {
      logDebug(config, 'Message playback stream error:', error);
      return EMPTY;
    })
  );
};

// Flow control functions
export const createMessageFlowController = (config: MessageProcessingConfig) => {
  const pauseSubject = new Subject<void>();
  const resumeSubject = new Subject<void>();
  const stopSubject = new Subject<void>();

  return {
    pause: () => pauseSubject.next(),
    resume: () => resumeSubject.next(),
    stop: () => stopSubject.next(),

    pause$: pauseSubject.asObservable(),
    resume$: resumeSubject.asObservable(),
    stop$: stopSubject.asObservable(),

    destroy: () => {
      pauseSubject.complete();
      resumeSubject.complete();
      stopSubject.complete();
    }
  };
};

// Performance monitoring functions
export const measureMessageProcessingTime = (
  messageIndex: number,
  config: MessageProcessingConfig,
  operation: () => void
): void => {
  if (!config.enablePerformanceTracking) {
    operation();
    return;
  }

  const start = performance.now();
  operation();
  const duration = performance.now() - start;

  console.log(`[MessageProcessing] Message ${messageIndex} processed in ${duration.toFixed(2)}ms`);
};

export const trackMessageThroughput = (
  config: MessageProcessingConfig,
  startTime: number,
  messageCount: number
): void => {
  if (!config.enablePerformanceTracking) return;

  const duration = performance.now() - startTime;
  const messagesPerSecond = (messageCount / duration) * 1000;

  console.log(`[MessageProcessing] Throughput: ${messagesPerSecond.toFixed(2)} messages/second`);
};

// Utility functions
export const estimatePlaybackDuration = (
  messages: Message[],
  playbackSpeed: number,
  config: MessageProcessingConfig
): number => {
  return messages.reduce((total, message) => {
    const timing = calculateMessageTiming(message, playbackSpeed, config);
    return total + timing.totalDuration;
  }, 0);
};

export const estimateTimeToMessage = (
  messages: Message[],
  targetIndex: number,
  playbackSpeed: number,
  config: MessageProcessingConfig
): number => {
  const messagesToProcess = messages.slice(0, Math.max(0, targetIndex));
  return estimatePlaybackDuration(messagesToProcess, playbackSpeed, config);
};

// Debug utilities
export const logDebug = (
  config: MessageProcessingConfig,
  message: string,
  data?: any
): void => {
  if (config.enableDebug) {
    console.log(`[MessageProcessingService] ${message}`, data);
  }
};

export const logPerformance = (
  config: MessageProcessingConfig,
  operation: string,
  duration: number,
  metadata?: any
): void => {
  if (config.enablePerformanceTracking) {
    console.log(`[MessageProcessingService] ${operation} took ${duration.toFixed(2)}ms`, metadata);
  }
};

// Factory function
export const createMessageProcessingService = (
  config: Partial<MessageProcessingConfig> = {}
) => {
  const serviceConfig = createMessageProcessingConfig(config);

  return {
    // Core processing
    processMessage: (context: MessageProcessingContext, eventService: EventService) =>
      processMessage(context, eventService),

    createPlaybackStream: (
      conversation: Conversation,
      eventService: EventService,
      updateState: any,
      stopSignal$: Observable<void>
    ) => createMessagePlaybackStream(conversation, serviceConfig, eventService, updateState, stopSignal$),

    // Flow control
    createFlowController: () => createMessageFlowController(serviceConfig),

    // Timing calculations
    calculateTiming: (message: Message, playbackSpeed: number) =>
      calculateMessageTiming(message, playbackSpeed, serviceConfig),

    calculateOptimizedTiming: (message: Message, playbackSpeed: number) =>
      calculateOptimizedTiming(message, playbackSpeed, serviceConfig),

    // Estimations
    estimateDuration: (messages: Message[], playbackSpeed: number) =>
      estimatePlaybackDuration(messages, playbackSpeed, serviceConfig),

    estimateTimeToMessage: (messages: Message[], targetIndex: number, playbackSpeed: number) =>
      estimateTimeToMessage(messages, targetIndex, playbackSpeed, serviceConfig),

    // Validation
    validateMessage: validateMessageForProcessing,
    validateContext: validateProcessingContext,

    // Performance
    measureProcessingTime: (messageIndex: number, operation: () => void) =>
      measureMessageProcessingTime(messageIndex, serviceConfig, operation),

    // Configuration
    config: serviceConfig
  };
};

// Type exports
export type MessageProcessingService = ReturnType<typeof createMessageProcessingService>;