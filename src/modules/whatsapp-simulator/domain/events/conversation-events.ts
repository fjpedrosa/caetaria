/**
 * Conversation Events - Event types and payloads for the conversation engine
 */

import { Message, Conversation, ConversationStatus, ConversationProgress } from '../entities';

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
 * Event creation helpers
 */
export class ConversationEventFactory {
  private static generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createConversationStarted(
    conversationId: string,
    conversation: Conversation
  ): ConversationStartedEvent {
    return {
      id: this.generateEventId(),
      type: 'conversation.started',
      timestamp: new Date(),
      conversationId,
      payload: {
        conversation,
        settings: conversation.settings
      }
    };
  }

  static createConversationPaused(
    conversationId: string,
    currentIndex: number,
    progress: ConversationProgress
  ): ConversationPausedEvent {
    return {
      id: this.generateEventId(),
      type: 'conversation.paused',
      timestamp: new Date(),
      conversationId,
      payload: {
        currentIndex,
        progress
      }
    };
  }

  static createMessageSent(
    conversationId: string,
    message: Message,
    messageIndex: number
  ): MessageSentEvent {
    return {
      id: this.generateEventId(),
      type: 'message.sent',
      timestamp: new Date(),
      conversationId,
      payload: {
        message,
        messageIndex,
        actualSentTime: new Date()
      }
    };
  }

  static createMessageTypingStarted(
    conversationId: string,
    message: Message,
    messageIndex: number,
    typingDuration: number
  ): MessageTypingStartedEvent {
    return {
      id: this.generateEventId(),
      type: 'message.typing_started',
      timestamp: new Date(),
      conversationId,
      payload: {
        message,
        messageIndex,
        typingDuration
      }
    };
  }

  static createFlowTriggered(
    conversationId: string,
    message: Message,
    flowId: string,
    flowToken: string,
    flowData?: Record<string, any>
  ): FlowTriggeredEvent {
    return {
      id: this.generateEventId(),
      type: 'flow.triggered',
      timestamp: new Date(),
      conversationId,
      payload: {
        message,
        flowId,
        flowToken,
        flowData
      }
    };
  }

  static createError(
    conversationId: string,
    error: Error,
    currentIndex: number,
    recoverable: boolean = true
  ): ConversationErrorEvent {
    return {
      id: this.generateEventId(),
      type: 'conversation.error',
      timestamp: new Date(),
      conversationId,
      payload: {
        error,
        currentIndex,
        recoverable
      }
    };
  }

  static createDebug(
    conversationId: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: any
  ): DebugEvent {
    return {
      id: this.generateEventId(),
      type: 'debug.log',
      timestamp: new Date(),
      conversationId,
      payload: {
        level,
        message,
        data
      }
    };
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