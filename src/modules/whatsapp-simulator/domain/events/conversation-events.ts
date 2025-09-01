/**
 * Conversation Events - Event types and payloads for the conversation engine
 */

import { Conversation, ConversationProgress,ConversationStatus, Message } from '../entities';

export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  conversationId: string;
}

/**
 * Conversation lifecycle events
 */
export interface ConversationStartedEvent extends BaseEvent {
  type: 'conversation.started';
  payload: {
    conversation: Conversation;
    settings: Conversation['settings'];
  };
}

export interface ConversationPausedEvent extends BaseEvent {
  type: 'conversation.paused';
  payload: {
    currentIndex: number;
    progress: ConversationProgress;
  };
}

export interface ConversationResumedEvent extends BaseEvent {
  type: 'conversation.resumed';
  payload: {
    currentIndex: number;
    progress: ConversationProgress;
  };
}

export interface ConversationCompletedEvent extends BaseEvent {
  type: 'conversation.completed';
  payload: {
    finalIndex: number;
    totalDuration: number;
    progress: ConversationProgress;
  };
}

export interface ConversationResetEvent extends BaseEvent {
  type: 'conversation.reset';
  payload: {
    reason: 'user_action' | 'error' | 'replay';
  };
}

export interface ConversationErrorEvent extends BaseEvent {
  type: 'conversation.error';
  payload: {
    error: Error;
    currentIndex: number;
    recoverable: boolean;
  };
}

export interface ConversationProgressEvent extends BaseEvent {
  type: 'conversation.progress';
  payload: {
    progress: ConversationProgress;
    currentMessage?: Message;
  };
}

export interface ConversationSpeedChangedEvent extends BaseEvent {
  type: 'conversation.speed_changed';
  payload: {
    previousSpeed: number;
    newSpeed: number;
  };
}

export interface ConversationJumpedEvent extends BaseEvent {
  type: 'conversation.jumped';
  payload: {
    fromIndex: number;
    toIndex: number;
    message: Message;
  };
}

/**
 * Message lifecycle events
 */
export interface MessageQueuedEvent extends BaseEvent {
  type: 'message.queued';
  payload: {
    message: Message;
    messageIndex: number;
    estimatedSendTime: Date;
  };
}

export interface MessageTypingStartedEvent extends BaseEvent {
  type: 'message.typing_started';
  payload: {
    message: Message;
    messageIndex: number;
    typingDuration: number;
  };
}

export interface MessageTypingStoppedEvent extends BaseEvent {
  type: 'message.typing_stopped';
  payload: {
    message: Message;
    messageIndex: number;
  };
}

export interface MessageSentEvent extends BaseEvent {
  type: 'message.sent';
  payload: {
    message: Message;
    messageIndex: number;
    actualSentTime: Date;
  };
}

export interface MessageDeliveredEvent extends BaseEvent {
  type: 'message.delivered';
  payload: {
    message: Message;
    messageIndex: number;
    deliveredTime: Date;
  };
}

export interface MessageReadEvent extends BaseEvent {
  type: 'message.read';
  payload: {
    message: Message;
    messageIndex: number;
    readTime: Date;
  };
}

export interface MessageFailedEvent extends BaseEvent {
  type: 'message.failed';
  payload: {
    message: Message;
    messageIndex: number;
    error: Error;
    retryable: boolean;
  };
}

/**
 * Flow execution events
 */
export interface FlowTriggeredEvent extends BaseEvent {
  type: 'flow.triggered';
  payload: {
    message: Message;
    flowId: string;
    flowToken: string;
    flowData?: Record<string, any>;
  };
}

export interface FlowCompletedEvent extends BaseEvent {
  type: 'flow.completed';
  payload: {
    flowId: string;
    flowToken: string;
    result: Record<string, any>;
    executionTime: number;
  };
}

export interface FlowFailedEvent extends BaseEvent {
  type: 'flow.failed';
  payload: {
    flowId: string;
    flowToken: string;
    error: Error;
  };
}

/**
 * Debug and diagnostic events
 */
export interface DebugEvent extends BaseEvent {
  type: 'debug.log';
  payload: {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
  };
}

export interface PerformanceEvent extends BaseEvent {
  type: 'performance.measurement';
  payload: {
    operation: string;
    duration: number;
    metadata?: Record<string, any>;
  };
}

export interface StateChangeEvent extends BaseEvent {
  type: 'state.changed';
  payload: {
    previousState: ConversationStatus;
    newState: ConversationStatus;
    reason: string;
  };
}

/**
 * Union type of all possible conversation events
 */
export type ConversationEvent =
  | ConversationStartedEvent
  | ConversationPausedEvent
  | ConversationResumedEvent
  | ConversationCompletedEvent
  | ConversationResetEvent
  | ConversationErrorEvent
  | ConversationProgressEvent
  | ConversationSpeedChangedEvent
  | ConversationJumpedEvent
  | MessageQueuedEvent
  | MessageTypingStartedEvent
  | MessageTypingStoppedEvent
  | MessageSentEvent
  | MessageDeliveredEvent
  | MessageReadEvent
  | MessageFailedEvent
  | FlowTriggeredEvent
  | FlowCompletedEvent
  | FlowFailedEvent
  | DebugEvent
  | PerformanceEvent
  | StateChangeEvent;

/**
 * Event filter predicates
 */
export type EventFilter = (event: ConversationEvent) => boolean;

export const EventFilters = {
  conversationEvents: (event: ConversationEvent): boolean =>
    event.type.startsWith('conversation.'),

  messageEvents: (event: ConversationEvent): boolean =>
    event.type.startsWith('message.'),

  flowEvents: (event: ConversationEvent): boolean =>
    event.type.startsWith('flow.'),

  errorEvents: (event: ConversationEvent): boolean =>
    event.type.includes('error') || event.type.includes('failed'),

  debugEvents: (event: ConversationEvent): boolean =>
    event.type.startsWith('debug.') || event.type.startsWith('performance.'),

  byConversationId: (conversationId: string) => (event: ConversationEvent): boolean =>
    event.conversationId === conversationId,

  byEventType: (eventType: string) => (event: ConversationEvent): boolean =>
    event.type === eventType,

  byTimeRange: (startTime: Date, endTime: Date) => (event: ConversationEvent): boolean =>
    event.timestamp >= startTime && event.timestamp <= endTime
};

/**
 * Event creation configuration interfaces
 */
export interface EventConfig {
  readonly timestamp?: Date;
  readonly customId?: string;
  readonly conversationId: string;
}

export interface ConversationEventConfig extends EventConfig {
  readonly conversation: Conversation;
}

export interface MessageEventConfig extends EventConfig {
  readonly message: Message;
  readonly messageIndex: number;
}

export interface FlowEventConfig extends EventConfig {
  readonly message: Message;
  readonly flowId: string;
  readonly flowToken: string;
  readonly flowData?: Record<string, any>;
}

export interface ErrorEventConfig extends EventConfig {
  readonly error: Error;
  readonly currentIndex: number;
  readonly recoverable?: boolean;
}

export interface DebugEventConfig extends EventConfig {
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly message: string;
  readonly data?: any;
}

export interface ProgressEventConfig extends EventConfig {
  readonly currentIndex: number;
  readonly progress: ConversationProgress;
}

export interface SpeedEventConfig extends EventConfig {
  readonly previousSpeed: number;
  readonly newSpeed: number;
}

export interface JumpEventConfig extends EventConfig {
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly message: Message;
}

export interface StateEventConfig extends EventConfig {
  readonly previousState: ConversationStatus;
  readonly newState: ConversationStatus;
  readonly reason: string;
}

export interface PerformanceEventConfig extends EventConfig {
  readonly operation: string;
  readonly duration: number;
  readonly metadata?: Record<string, any>;
}

/**
 * Pure utility functions for event creation
 */
export const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createBaseEvent = (config: EventConfig, type: string): BaseEvent => ({
  id: config.customId ?? generateEventId(),
  type,
  timestamp: config.timestamp ?? new Date(),
  conversationId: config.conversationId
});

/**
 * Pure factory functions for conversation events
 */
export const createConversationStarted = (
  config: ConversationEventConfig
): ConversationStartedEvent => ({
  ...createBaseEvent(config, 'conversation.started'),
  payload: {
    conversation: config.conversation,
    settings: config.conversation.settings
  }
});

export const createConversationPaused = (
  config: ProgressEventConfig
): ConversationPausedEvent => ({
  ...createBaseEvent(config, 'conversation.paused'),
  payload: {
    currentIndex: config.currentIndex,
    progress: config.progress
  }
});

export const createConversationResumed = (
  config: ProgressEventConfig
): ConversationResumedEvent => ({
  ...createBaseEvent(config, 'conversation.resumed'),
  payload: {
    currentIndex: config.currentIndex,
    progress: config.progress
  }
});

export const createConversationCompleted = (
  config: ProgressEventConfig & { finalIndex: number; totalDuration: number }
): ConversationCompletedEvent => ({
  ...createBaseEvent(config, 'conversation.completed'),
  payload: {
    finalIndex: config.finalIndex,
    totalDuration: config.totalDuration,
    progress: config.progress
  }
});

export const createConversationReset = (
  config: EventConfig & { reason: 'user_action' | 'error' | 'replay' }
): ConversationResetEvent => ({
  ...createBaseEvent(config, 'conversation.reset'),
  payload: {
    reason: config.reason
  }
});

export const createConversationError = (
  config: ErrorEventConfig
): ConversationErrorEvent => ({
  ...createBaseEvent(config, 'conversation.error'),
  payload: {
    error: config.error,
    currentIndex: config.currentIndex,
    recoverable: config.recoverable ?? true
  }
});

export const createConversationProgress = (
  config: ProgressEventConfig & { currentMessage?: Message }
): ConversationProgressEvent => ({
  ...createBaseEvent(config, 'conversation.progress'),
  payload: {
    progress: config.progress,
    currentMessage: config.currentMessage
  }
});

export const createConversationSpeedChanged = (
  config: SpeedEventConfig
): ConversationSpeedChangedEvent => ({
  ...createBaseEvent(config, 'conversation.speed_changed'),
  payload: {
    previousSpeed: config.previousSpeed,
    newSpeed: config.newSpeed
  }
});

export const createConversationJumped = (
  config: JumpEventConfig
): ConversationJumpedEvent => ({
  ...createBaseEvent(config, 'conversation.jumped'),
  payload: {
    fromIndex: config.fromIndex,
    toIndex: config.toIndex,
    message: config.message
  }
});

/**
 * Pure factory functions for message events
 */
export const createMessageQueued = (
  config: MessageEventConfig & { estimatedSendTime: Date }
): MessageQueuedEvent => ({
  ...createBaseEvent(config, 'message.queued'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    estimatedSendTime: config.estimatedSendTime
  }
});

export const createMessageTypingStarted = (
  config: MessageEventConfig & { typingDuration: number }
): MessageTypingStartedEvent => ({
  ...createBaseEvent(config, 'message.typing_started'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    typingDuration: config.typingDuration
  }
});

export const createMessageTypingStopped = (
  config: MessageEventConfig
): MessageTypingStoppedEvent => ({
  ...createBaseEvent(config, 'message.typing_stopped'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex
  }
});

export const createMessageSent = (
  config: MessageEventConfig & { actualSentTime?: Date }
): MessageSentEvent => ({
  ...createBaseEvent(config, 'message.sent'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    actualSentTime: config.actualSentTime ?? new Date()
  }
});

export const createMessageDelivered = (
  config: MessageEventConfig & { deliveredTime?: Date }
): MessageDeliveredEvent => ({
  ...createBaseEvent(config, 'message.delivered'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    deliveredTime: config.deliveredTime ?? new Date()
  }
});

export const createMessageRead = (
  config: MessageEventConfig & { readTime?: Date }
): MessageReadEvent => ({
  ...createBaseEvent(config, 'message.read'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    readTime: config.readTime ?? new Date()
  }
});

export const createMessageFailed = (
  config: MessageEventConfig & { error: Error; retryable?: boolean }
): MessageFailedEvent => ({
  ...createBaseEvent(config, 'message.failed'),
  payload: {
    message: config.message,
    messageIndex: config.messageIndex,
    error: config.error,
    retryable: config.retryable ?? true
  }
});

/**
 * Pure factory functions for flow events
 */
export const createFlowTriggered = (
  config: FlowEventConfig
): FlowTriggeredEvent => ({
  ...createBaseEvent(config, 'flow.triggered'),
  payload: {
    message: config.message,
    flowId: config.flowId,
    flowToken: config.flowToken,
    flowData: config.flowData
  }
});

export const createFlowCompleted = (
  config: EventConfig & {
    flowId: string;
    flowToken: string;
    result: Record<string, any>;
    executionTime: number;
  }
): FlowCompletedEvent => ({
  ...createBaseEvent(config, 'flow.completed'),
  payload: {
    flowId: config.flowId,
    flowToken: config.flowToken,
    result: config.result,
    executionTime: config.executionTime
  }
});

export const createFlowFailed = (
  config: EventConfig & {
    flowId: string;
    flowToken: string;
    error: Error;
  }
): FlowFailedEvent => ({
  ...createBaseEvent(config, 'flow.failed'),
  payload: {
    flowId: config.flowId,
    flowToken: config.flowToken,
    error: config.error
  }
});

/**
 * Pure factory functions for debug and diagnostic events
 */
export const createDebug = (
  config: DebugEventConfig
): DebugEvent => ({
  ...createBaseEvent(config, 'debug.log'),
  payload: {
    level: config.level,
    message: config.message,
    data: config.data
  }
});

export const createPerformance = (
  config: PerformanceEventConfig
): PerformanceEvent => ({
  ...createBaseEvent(config, 'performance.measurement'),
  payload: {
    operation: config.operation,
    duration: config.duration,
    metadata: config.metadata
  }
});

export const createStateChanged = (
  config: StateEventConfig
): StateChangeEvent => ({
  ...createBaseEvent(config, 'state.changed'),
  payload: {
    previousState: config.previousState,
    newState: config.newState,
    reason: config.reason
  }
});

/**
 * Functional composition utilities for event creation
 */
export interface EventBuilder<T extends ConversationEvent> {
  readonly build: () => T;
  readonly withTimestamp: (timestamp: Date) => EventBuilder<T>;
  readonly withCustomId: (id: string) => EventBuilder<T>;
}

export const createEventBuilder = <T extends ConversationEvent>(
  factory: () => T
): EventBuilder<T> => {
  let timestamp: Date | undefined;
  let customId: string | undefined;

  const build = (): T => {
    const event = factory();
    return {
      ...event,
      ...(timestamp && { timestamp }),
      ...(customId && { id: customId })
    };
  };

  const withTimestamp = (ts: Date): EventBuilder<T> => {
    timestamp = ts;
    return { build, withTimestamp, withCustomId };
  };

  const withCustomId = (id: string): EventBuilder<T> => {
    customId = id;
    return { build, withTimestamp, withCustomId };
  };

  return { build, withTimestamp, withCustomId };
};

/**
 * Event creation utilities with builder pattern support
 */
export const EventCreators = {
  // Conversation events
  conversationStarted: (config: ConversationEventConfig) =>
    createEventBuilder(() => createConversationStarted(config)),

  conversationPaused: (config: ProgressEventConfig) =>
    createEventBuilder(() => createConversationPaused(config)),

  conversationResumed: (config: ProgressEventConfig) =>
    createEventBuilder(() => createConversationResumed(config)),

  conversationCompleted: (config: ProgressEventConfig & { finalIndex: number; totalDuration: number }) =>
    createEventBuilder(() => createConversationCompleted(config)),

  conversationReset: (config: EventConfig & { reason: 'user_action' | 'error' | 'replay' }) =>
    createEventBuilder(() => createConversationReset(config)),

  conversationError: (config: ErrorEventConfig) =>
    createEventBuilder(() => createConversationError(config)),

  conversationProgress: (config: ProgressEventConfig & { currentMessage?: Message }) =>
    createEventBuilder(() => createConversationProgress(config)),

  conversationSpeedChanged: (config: SpeedEventConfig) =>
    createEventBuilder(() => createConversationSpeedChanged(config)),

  conversationJumped: (config: JumpEventConfig) =>
    createEventBuilder(() => createConversationJumped(config)),

  // Message events
  messageQueued: (config: MessageEventConfig & { estimatedSendTime: Date }) =>
    createEventBuilder(() => createMessageQueued(config)),

  messageTypingStarted: (config: MessageEventConfig & { typingDuration: number }) =>
    createEventBuilder(() => createMessageTypingStarted(config)),

  messageTypingStopped: (config: MessageEventConfig) =>
    createEventBuilder(() => createMessageTypingStopped(config)),

  messageSent: (config: MessageEventConfig & { actualSentTime?: Date }) =>
    createEventBuilder(() => createMessageSent(config)),

  messageDelivered: (config: MessageEventConfig & { deliveredTime?: Date }) =>
    createEventBuilder(() => createMessageDelivered(config)),

  messageRead: (config: MessageEventConfig & { readTime?: Date }) =>
    createEventBuilder(() => createMessageRead(config)),

  messageFailed: (config: MessageEventConfig & { error: Error; retryable?: boolean }) =>
    createEventBuilder(() => createMessageFailed(config)),

  // Flow events
  flowTriggered: (config: FlowEventConfig) =>
    createEventBuilder(() => createFlowTriggered(config)),

  flowCompleted: (config: EventConfig & {
    flowId: string;
    flowToken: string;
    result: Record<string, any>;
    executionTime: number;
  }) =>
    createEventBuilder(() => createFlowCompleted(config)),

  flowFailed: (config: EventConfig & {
    flowId: string;
    flowToken: string;
    error: Error;
  }) =>
    createEventBuilder(() => createFlowFailed(config)),

  // Debug and diagnostic events
  debug: (config: DebugEventConfig) =>
    createEventBuilder(() => createDebug(config)),

  performance: (config: PerformanceEventConfig) =>
    createEventBuilder(() => createPerformance(config)),

  stateChanged: (config: StateEventConfig) =>
    createEventBuilder(() => createStateChanged(config))
} as const;

/**
 * @deprecated Use functional event creators instead. This class is kept for backward compatibility.
 * Migrate to:
 * - createConversationStarted() instead of ConversationEventFactory.createConversationStarted()
 * - createMessageSent() instead of ConversationEventFactory.createMessageSent()
 * - etc.
 */
export class ConversationEventFactory {
  private static generateEventId(): string {
    return generateEventId();
  }

  static createConversationStarted(
    conversationId: string,
    conversation: Conversation
  ): ConversationStartedEvent {
    return createConversationStarted({ conversationId, conversation });
  }

  static createConversationPaused(
    conversationId: string,
    currentIndex: number,
    progress: ConversationProgress
  ): ConversationPausedEvent {
    return createConversationPaused({ conversationId, currentIndex, progress });
  }

  static createMessageSent(
    conversationId: string,
    message: Message,
    messageIndex: number
  ): MessageSentEvent {
    return createMessageSent({
      conversationId,
      message,
      messageIndex,
      actualSentTime: new Date()
    });
  }

  static createMessageTypingStarted(
    conversationId: string,
    message: Message,
    messageIndex: number,
    typingDuration: number
  ): MessageTypingStartedEvent {
    return createMessageTypingStarted({
      conversationId,
      message,
      messageIndex,
      typingDuration
    });
  }

  static createFlowTriggered(
    conversationId: string,
    message: Message,
    flowId: string,
    flowToken: string,
    flowData?: Record<string, any>
  ): FlowTriggeredEvent {
    return createFlowTriggered({
      conversationId,
      message,
      flowId,
      flowToken,
      flowData
    });
  }

  static createError(
    conversationId: string,
    error: Error,
    currentIndex: number,
    recoverable: boolean = true
  ): ConversationErrorEvent {
    return createConversationError({
      conversationId,
      error,
      currentIndex,
      recoverable
    });
  }

  static createDebug(
    conversationId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  ): DebugEvent {
    return createDebug({
      conversationId,
      level,
      message,
      data
    });
  }
}

/**
 * Event handler types
 */
export type ConversationEventHandler = (event: ConversationEvent) => void;
export type AsyncConversationEventHandler = (event: ConversationEvent) => Promise<void>;

/**
 * Event subscription interface
 */
export interface EventSubscription {
  unsubscribe(): void;
}