/**
 * Message Entity - Functional approach for WhatsApp messages
 * Following Clean Architecture principles with no classes
 */

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'interactive'
  | 'template'
  | 'flow';

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export type SenderType = 'user' | 'business';

export interface MessageContent {
  text?: string;
  media?: {
    url: string;
    caption?: string;
    filename?: string;
    mimeType?: string;
  };
  interactive?: {
    type: 'button' | 'list' | 'flow';
    body: string;
    footer?: string;
    action: any; // Interactive action data
  };
  template?: {
    name: string;
    language: string;
    components: any[];
  };
  flow?: {
    flowId: string;
    flowToken: string;
    flowData?: Record<string, any>;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
}

export interface MessageTiming {
  /** When the message should be queued for sending */
  queueAt: Date;
  /** When the message should be marked as sent */
  sentAt?: Date;
  /** When the message should be marked as delivered */
  deliveredAt?: Date;
  /** When the message should be marked as read */
  readAt?: Date;
  /** Duration of typing indicator before sending */
  typingDuration: number;
  /** Delay after previous message before starting to type */
  delayBeforeTyping: number;
}

/**
 * Message State - Immutable representation
 */
export interface Message {
  readonly id: string;
  readonly type: MessageType;
  readonly sender: SenderType;
  readonly content: MessageContent;
  readonly timing: MessageTiming;
  readonly status: MessageStatus;
  readonly createdAt: Date;
  readonly isFlowTrigger?: boolean;
}

// FACTORY FUNCTIONS - Replace constructor

/**
 * Create a new message with default values
 * Single Responsibility: Only creates message instances
 */
export const createMessage = (data: {
  id: string;
  type: MessageType;
  sender: SenderType;
  content: MessageContent;
  timing: MessageTiming;
  status?: MessageStatus;
  createdAt?: Date;
  isFlowTrigger?: boolean;
}): Message => ({
  id: data.id,
  type: data.type,
  sender: data.sender,
  content: data.content,
  timing: data.timing,
  status: data.status || 'sending',
  createdAt: data.createdAt || new Date(),
  isFlowTrigger: data.isFlowTrigger
});

/**
 * Create message from JSON data
 * Single Responsibility: Only handles deserialization
 */
export const createMessageFromJSON = (data: any): Message => ({
  id: data.id,
  type: data.type,
  sender: data.sender,
  content: data.content,
  timing: {
    ...data.timing,
    queueAt: new Date(data.timing.queueAt),
    sentAt: data.timing.sentAt ? new Date(data.timing.sentAt) : undefined,
    deliveredAt: data.timing.deliveredAt ? new Date(data.timing.deliveredAt) : undefined,
    readAt: data.timing.readAt ? new Date(data.timing.readAt) : undefined
  },
  status: data.status,
  createdAt: new Date(data.createdAt),
  isFlowTrigger: data.isFlowTrigger
});

// STATUS VALIDATION FUNCTIONS - Pure functions

/**
 * Define valid status transitions for message lifecycle
 * Single Responsibility: Only defines business rules for status transitions
 */
const STATUS_TRANSITIONS: Record<MessageStatus, MessageStatus[]> = {
  sending: ['sent', 'failed'],
  sent: ['delivered', 'failed'],
  delivered: ['read'],
  read: [],
  failed: ['sending'] // Allow retry
};

/**
 * Check if status transition is valid
 * Single Responsibility: Only validates status transitions
 */
export const isValidStatusTransition = (
  fromStatus: MessageStatus,
  toStatus: MessageStatus
): boolean => {
  return STATUS_TRANSITIONS[fromStatus].includes(toStatus);
};

/**
 * Validate and update message status (returns new message)
 * Single Responsibility: Only handles status updates with validation
 */
export const updateMessageStatus = (message: Message, newStatus: MessageStatus): Message => {
  if (!isValidStatusTransition(message.status, newStatus)) {
    throw new Error(
      `Invalid status transition from ${message.status} to ${newStatus}`
    );
  }

  return {
    ...message,
    status: newStatus
  };
};

// MESSAGE QUERY FUNCTIONS - Pure functions

/**
 * Check if message triggers a flow
 * Single Responsibility: Only determines if message is a flow trigger
 */
export const isFlowTrigger = (message: Message): boolean =>
  message.type === 'flow' ||
  (message.type === 'interactive' && message.content.interactive?.type === 'flow');

/**
 * Get display text for the message based on its type
 * Single Responsibility: Only handles display text generation
 */
export const getMessageDisplayText = (message: Message): string => {
  switch (message.type) {
    case 'text':
      return message.content.text || '';
    case 'image':
      return message.content.media?.caption || '📷 Image';
    case 'audio':
      return '🎵 Audio message';
    case 'video':
      return message.content.media?.caption || '🎥 Video';
    case 'document':
      return `📄 ${message.content.media?.filename || 'Document'}`;
    case 'sticker':
      return '😀 Sticker';
    case 'location':
      return '📍 Location';
    case 'contact':
      return '👤 Contact';
    case 'interactive':
      return message.content.interactive?.body || 'Interactive message';
    case 'template':
      return `Template: ${message.content.template?.name}`;
    case 'flow':
      return 'WhatsApp Flow';
    default:
      return 'Message';
  }
};

/**
 * Calculate total animation time for message
 * Single Responsibility: Only calculates timing
 */
export const getMessageTotalAnimationTime = (message: Message): number =>
  message.timing.delayBeforeTyping + message.timing.typingDuration;

// MESSAGE MUTATION FUNCTIONS - Return new state (immutable)

/**
 * Create a copy of message with updated properties
 * Single Responsibility: Only handles message cloning with updates
 */
export const cloneMessage = (
  message: Message,
  updates: Partial<{
    status: MessageStatus;
    timing: Partial<MessageTiming>;
    content: Partial<MessageContent>;
  }>
): Message => ({
  ...message,
  content: updates.content ? { ...message.content, ...updates.content } : message.content,
  timing: updates.timing ? { ...message.timing, ...updates.timing } : message.timing,
  status: updates.status !== undefined ? updates.status : message.status
});

/**
 * Update message content (returns new message)
 * Single Responsibility: Only handles content updates
 */
export const updateMessageContent = (
  message: Message,
  contentUpdates: Partial<MessageContent>
): Message => ({
  ...message,
  content: { ...message.content, ...contentUpdates }
});

/**
 * Update message timing (returns new message)
 * Single Responsibility: Only handles timing updates
 */
export const updateMessageTiming = (
  message: Message,
  timingUpdates: Partial<MessageTiming>
): Message => ({
  ...message,
  timing: { ...message.timing, ...timingUpdates }
});

// SERIALIZATION FUNCTIONS - Pure functions

/**
 * Serialize message to JSON
 * Single Responsibility: Only handles serialization
 */
export const messageToJSON = (message: Message): Record<string, any> => ({
  id: message.id,
  type: message.type,
  sender: message.sender,
  content: message.content,
  timing: {
    ...message.timing,
    queueAt: message.timing.queueAt.toISOString(),
    sentAt: message.timing.sentAt?.toISOString(),
    deliveredAt: message.timing.deliveredAt?.toISOString(),
    readAt: message.timing.readAt?.toISOString()
  },
  status: message.status,
  createdAt: message.createdAt.toISOString()
});

// MESSAGE TYPE-SPECIFIC FUNCTIONS - Focused on single message types

/**
 * Check if message contains media content
 * Single Responsibility: Only checks for media presence
 */
export const hasMediaContent = (message: Message): boolean =>
  ['image', 'audio', 'video', 'document', 'sticker'].includes(message.type) &&
  !!message.content.media;

/**
 * Check if message is interactive
 * Single Responsibility: Only checks for interactive content
 */
export const isInteractiveMessage = (message: Message): boolean =>
  message.type === 'interactive' && !!message.content.interactive;

/**
 * Check if message is a template
 * Single Responsibility: Only checks for template content
 */
export const isTemplateMessage = (message: Message): boolean =>
  message.type === 'template' && !!message.content.template;

/**
 * Get media URL if message has media
 * Single Responsibility: Only extracts media URL
 */
export const getMediaUrl = (message: Message): string | null =>
  hasMediaContent(message) ? message.content.media?.url || null : null;

/**
 * Get message text content (works for text, media with captions, interactive)
 * Single Responsibility: Only extracts text content
 */
export const getMessageText = (message: Message): string => {
  if (message.type === 'text') {
    return message.content.text || '';
  }

  if (hasMediaContent(message)) {
    return message.content.media?.caption || '';
  }

  if (message.type === 'interactive') {
    return message.content.interactive?.body || '';
  }

  return '';
};

// MESSAGE FILTERING AND GROUPING FUNCTIONS

/**
 * Filter messages by type
 * Single Responsibility: Only filters by message type
 */
export const filterMessagesByType = (messages: Message[], type: MessageType): Message[] =>
  messages.filter(msg => msg.type === type);

/**
 * Filter messages by sender
 * Single Responsibility: Only filters by sender
 */
export const filterMessagesBySender = (messages: Message[], sender: SenderType): Message[] =>
  messages.filter(msg => msg.sender === sender);

/**
 * Filter messages by status
 * Single Responsibility: Only filters by status
 */
export const filterMessagesByStatus = (messages: Message[], status: MessageStatus): Message[] =>
  messages.filter(msg => msg.status === status);

/**
 * Group messages by sender
 * Single Responsibility: Only groups by sender
 */
export const groupMessagesBySender = (messages: Message[]): Record<SenderType, Message[]> => {
  const groups: Record<SenderType, Message[]> = { user: [], business: [] };

  messages.forEach(message => {
    groups[message.sender].push(message);
  });

  return groups;
};