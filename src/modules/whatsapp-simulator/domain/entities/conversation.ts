/**
 * Conversation Entity - Functional approach for WhatsApp conversation
 * Following Clean Architecture principles with no classes
 */

import { createMessageFromJSON, getMessageTotalAnimationTime, Message, messageToJSON,SenderType } from './message';

export type ConversationStatus =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'error';

export interface ConversationMetadata {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  businessName: string;
  businessPhoneNumber: string;
  userPhoneNumber: string;
  language: string;
  category?: string;
  estimatedDuration: number; // in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationProgress {
  currentMessageIndex: number;
  totalMessages: number;
  elapsedTime: number; // in milliseconds
  remainingTime: number; // in milliseconds
  completionPercentage: number;
}

export interface ConversationSettings {
  playbackSpeed: number; // 0.5x to 3x speed multiplier
  autoAdvance: boolean;
  showTypingIndicators: boolean;
  showReadReceipts: boolean;
  enableSounds: boolean;
  debugMode: boolean;
}

/**
 * Conversation State - Immutable representation
 */
export interface Conversation {
  readonly metadata: ConversationMetadata;
  readonly messages: readonly Message[];
  readonly status: ConversationStatus;
  readonly currentIndex: number;
  readonly settings: ConversationSettings;
  readonly startTime?: Date;
  readonly pauseTime?: Date;
  readonly totalPausedTime: number;
}

/**
 * Create a new conversation with default values
 * Single Responsibility: Only creates conversation instances
 */
export const createConversation = (
  metadata: ConversationMetadata,
  messages: Message[] = [],
  settings?: Partial<ConversationSettings>
): Conversation => {
  const defaultSettings: ConversationSettings = {
    playbackSpeed: 1.0,
    autoAdvance: true,
    showTypingIndicators: true,
    showReadReceipts: true,
    enableSounds: false,
    debugMode: false,
    ...settings
  };

  const conversation: Conversation = {
    metadata,
    messages,
    status: 'idle',
    currentIndex: 0,
    settings: defaultSettings,
    totalPausedTime: 0
  };

  // Validate messages on creation
  validateMessages(conversation.messages);
  return conversation;
};

/**
 * Create conversation from JSON data
 * Single Responsibility: Only handles deserialization
 */
export const createConversationFromJSON = (data: any): Conversation => {
  const metadata = {
    ...data.metadata,
    createdAt: new Date(data.metadata.createdAt),
    updatedAt: new Date(data.metadata.updatedAt)
  };

  // Using the functional API for Message deserialization
  const messages = data.messages.map((msgData: any) => createMessageFromJSON(msgData));

  return {
    metadata,
    messages,
    status: data.status,
    currentIndex: data.currentIndex,
    settings: data.settings,
    startTime: data.startTime ? new Date(data.startTime) : undefined,
    totalPausedTime: data.totalPausedTime || 0
  };
};


export const isPlaying = (conversation: Conversation): boolean =>
  conversation.status === 'playing';

export const isPaused = (conversation: Conversation): boolean =>
  conversation.status === 'paused';

export const isCompleted = (conversation: Conversation): boolean =>
  conversation.status === 'completed';

export const hasError = (conversation: Conversation): boolean =>
  conversation.status === 'error';

export const canGoBack = (conversation: Conversation): boolean =>
  conversation.currentIndex > 0;

export const canGoForward = (conversation: Conversation): boolean =>
  conversation.currentIndex < conversation.messages.length - 1;


export const getCurrentMessage = (conversation: Conversation): Message | null =>
  conversation.messages[conversation.currentIndex] || null;

export const getNextMessage = (conversation: Conversation): Message | null =>
  conversation.messages[conversation.currentIndex + 1] || null;

export const getPreviousMessage = (conversation: Conversation): Message | null =>
  conversation.messages[conversation.currentIndex - 1] || null;

export const getMessagesUpTo = (conversation: Conversation, index?: number): Message[] => {
  const endIndex = index !== undefined ? index : conversation.currentIndex + 1;
  return [...conversation.messages.slice(0, Math.max(0, endIndex))];
};

export const getMessagesBySender = (conversation: Conversation, sender: SenderType): Message[] =>
  conversation.messages.filter(msg => msg.sender === sender);

export const getMessagesByType = (conversation: Conversation, type: string): Message[] =>
  conversation.messages.filter(msg => msg.type === type);


export const getConversationProgress = (conversation: Conversation): ConversationProgress => {
  const totalMessages = conversation.messages.length;
  const elapsedTime = calculateElapsedTime(conversation);
  const remainingTime = calculateRemainingTime(conversation);

  return {
    currentMessageIndex: conversation.currentIndex,
    totalMessages,
    elapsedTime,
    remainingTime: Math.max(0, remainingTime),
    completionPercentage: totalMessages > 0 ? (conversation.currentIndex / totalMessages) * 100 : 0
  };
};

export const calculateElapsedTime = (conversation: Conversation): number => {
  if (!conversation.startTime) return 0;

  const currentTime = conversation.pauseTime || new Date();
  const rawElapsed = currentTime.getTime() - conversation.startTime.getTime();

  return Math.max(0, rawElapsed - conversation.totalPausedTime);
};

export const calculateRemainingTime = (conversation: Conversation): number => {
  const remainingMessages = conversation.messages.slice(conversation.currentIndex + 1);
  const remainingDuration = remainingMessages.reduce((total, message) => {
    return total + getMessageTotalAnimationTime(message);
  }, 0);

  return remainingDuration / conversation.settings.playbackSpeed;
};

export const calculateEstimatedDuration = (messages: readonly Message[]): number =>
  messages.reduce((total, message) => total + getMessageTotalAnimationTime(message), 0);


export const playConversation = (conversation: Conversation): Conversation => {
  const now = new Date();

  if (conversation.status === 'completed') {
    return resetConversation(conversation);
  }

  let newTotalPausedTime = conversation.totalPausedTime;
  if (conversation.pauseTime) {
    newTotalPausedTime += now.getTime() - conversation.pauseTime.getTime();
  }

  return {
    ...conversation,
    status: 'playing',
    startTime: conversation.startTime || now,
    pauseTime: undefined,
    totalPausedTime: newTotalPausedTime
  };
};

export const pauseConversation = (conversation: Conversation): Conversation => {
  if (conversation.status !== 'playing') {
    return conversation;
  }

  return {
    ...conversation,
    status: 'paused',
    pauseTime: new Date()
  };
};

export const resetConversation = (conversation: Conversation): Conversation => ({
  ...conversation,
  status: 'idle',
  currentIndex: 0,
  startTime: undefined,
  pauseTime: undefined,
  totalPausedTime: 0
});

export const jumpToMessage = (conversation: Conversation, index: number): Conversation => {
  if (index < 0 || index >= conversation.messages.length) {
    throw new Error(`Invalid message index: ${index}`);
  }

  return {
    ...conversation,
    currentIndex: index
  };
};

export const advanceToNext = (conversation: Conversation): Conversation => {
  if (!canGoForward(conversation)) {
    return {
      ...conversation,
      status: 'completed'
    };
  }

  return {
    ...conversation,
    currentIndex: conversation.currentIndex + 1
  };
};

export const goToPrevious = (conversation: Conversation): Conversation => {
  if (!canGoBack(conversation)) {
    return conversation;
  }

  return {
    ...conversation,
    currentIndex: conversation.currentIndex - 1
  };
};

export const setConversationError = (conversation: Conversation, error: Error): Conversation => {
  console.error('Conversation error:', error);
  return {
    ...conversation,
    status: 'error'
  };
};

export const updateConversationSettings = (
  conversation: Conversation,
  updates: Partial<ConversationSettings>
): Conversation => ({
  ...conversation,
  settings: { ...conversation.settings, ...updates }
});

export const addMessage = (conversation: Conversation, message: Message): Conversation => {
  const newMessages = [...conversation.messages, message];
  const newEstimatedDuration = calculateEstimatedDuration(newMessages);

  return {
    ...conversation,
    messages: newMessages,
    metadata: {
      ...conversation.metadata,
      estimatedDuration: newEstimatedDuration,
      updatedAt: new Date()
    }
  };
};

export const addMessages = (conversation: Conversation, messages: Message[]): Conversation => {
  const newMessages = [...conversation.messages, ...messages];
  validateMessages(newMessages);

  const newEstimatedDuration = calculateEstimatedDuration(newMessages);

  return {
    ...conversation,
    messages: newMessages,
    metadata: {
      ...conversation.metadata,
      estimatedDuration: newEstimatedDuration,
      updatedAt: new Date()
    }
  };
};

export const removeMessage = (conversation: Conversation, messageId: string): Conversation => {
  const initialLength = conversation.messages.length;
  const newMessages = conversation.messages.filter(msg => msg.id !== messageId);

  if (newMessages.length === initialLength) {
    return conversation; // No change
  }

  const newEstimatedDuration = calculateEstimatedDuration(newMessages);
  let newCurrentIndex = conversation.currentIndex;

  // Adjust current index if necessary
  if (newCurrentIndex >= newMessages.length) {
    newCurrentIndex = Math.max(0, newMessages.length - 1);
  }

  return {
    ...conversation,
    messages: newMessages,
    currentIndex: newCurrentIndex,
    metadata: {
      ...conversation.metadata,
      estimatedDuration: newEstimatedDuration,
      updatedAt: new Date()
    }
  };
};

export const cloneConversation = (
  conversation: Conversation,
  updates?: {
    metadata?: Partial<ConversationMetadata>;
    messages?: Message[];
    settings?: Partial<ConversationSettings>;
  }
): Conversation => {
  const newMetadata = updates?.metadata
    ? { ...conversation.metadata, ...updates.metadata }
    : conversation.metadata;

  const newMessages = updates?.messages || conversation.messages;
  const newSettings = updates?.settings
    ? { ...conversation.settings, ...updates.settings }
    : conversation.settings;

  return {
    ...conversation,
    metadata: newMetadata,
    messages: newMessages,
    settings: newSettings
  };
};


export const conversationToJSON = (conversation: Conversation): Record<string, any> => ({
  metadata: {
    ...conversation.metadata,
    createdAt: conversation.metadata.createdAt.toISOString(),
    updatedAt: conversation.metadata.updatedAt.toISOString()
  },
  messages: conversation.messages.map(msg => messageToJSON(msg)),
  status: conversation.status,
  currentIndex: conversation.currentIndex,
  settings: conversation.settings,
  startTime: conversation.startTime?.toISOString(),
  totalPausedTime: conversation.totalPausedTime
});


export const validateMessages = (messages: readonly Message[]): void => {
  // Check for duplicate IDs
  const ids = new Set();
  for (const message of messages) {
    if (ids.has(message.id)) {
      throw new Error(`Duplicate message ID found: ${message.id}`);
    }
    ids.add(message.id);
  }

  // Validate timing sequences
  for (let i = 1; i < messages.length; i++) {
    const current = messages[i];
    const previous = messages[i - 1];

    if (current.timing.queueAt < previous.timing.queueAt) {
      console.warn(`Message timing inconsistency at index ${i}`);
    }
  }
};