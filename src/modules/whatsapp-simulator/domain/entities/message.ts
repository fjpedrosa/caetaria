/**
 * Message Entity - Core domain entity representing a WhatsApp message
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

export class Message {
  public readonly id: string;
  public readonly type: MessageType;
  public readonly sender: SenderType;
  public readonly content: MessageContent;
  public readonly timing: MessageTiming;
  private _status: MessageStatus;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    type: MessageType;
    sender: SenderType;
    content: MessageContent;
    timing: MessageTiming;
    status?: MessageStatus;
    createdAt?: Date;
  }) {
    this.id = data.id;
    this.type = data.type;
    this.sender = data.sender;
    this.content = data.content;
    this.timing = data.timing;
    this._status = data.status || 'sending';
    this.createdAt = data.createdAt || new Date();
  }

  get status(): MessageStatus {
    return this._status;
  }

  /**
   * Update message status with validation
   */
  updateStatus(status: MessageStatus): void {
    const validTransitions: Record<MessageStatus, MessageStatus[]> = {
      sending: ['sent', 'failed'],
      sent: ['delivered', 'failed'],
      delivered: ['read'],
      read: [],
      failed: ['sending'] // Allow retry
    };

    if (!validTransitions[this._status].includes(status)) {
      throw new Error(
        `Invalid status transition from ${this._status} to ${status}`
      );
    }

    this._status = status;
  }

  /**
   * Check if this message triggers a flow
   */
  isFlowTrigger(): boolean {
    return this.type === 'flow' ||
           (this.type === 'interactive' && this.content.interactive?.type === 'flow');
  }

  /**
   * Get display text for the message
   */
  getDisplayText(): string {
    switch (this.type) {
      case 'text':
        return this.content.text || '';
      case 'image':
        return this.content.media?.caption || '📷 Image';
      case 'audio':
        return '🎵 Audio message';
      case 'video':
        return this.content.media?.caption || '🎥 Video';
      case 'document':
        return `📄 ${this.content.media?.filename || 'Document'}`;
      case 'sticker':
        return '😀 Sticker';
      case 'location':
        return '📍 Location';
      case 'contact':
        return '👤 Contact';
      case 'interactive':
        return this.content.interactive?.body || 'Interactive message';
      case 'template':
        return `Template: ${this.content.template?.name}`;
      case 'flow':
        return 'WhatsApp Flow';
      default:
        return 'Message';
    }
  }

  /**
   * Calculate total animation time for this message
   */
  getTotalAnimationTime(): number {
    return this.timing.delayBeforeTyping + this.timing.typingDuration;
  }

  /**
   * Create a copy of the message with updated properties
   */
  clone(updates: Partial<{
    status: MessageStatus;
    timing: Partial<MessageTiming>;
    content: Partial<MessageContent>;
  }>): Message {
    return new Message({
      id: this.id,
      type: this.type,
      sender: this.sender,
      content: updates.content ? { ...this.content, ...updates.content } : this.content,
      timing: updates.timing ? { ...this.timing, ...updates.timing } : this.timing,
      status: updates.status || this._status,
      createdAt: this.createdAt
    });
  }

  /**
   * Serialize message to JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      sender: this.sender,
      content: this.content,
      timing: {
        ...this.timing,
        queueAt: this.timing.queueAt.toISOString(),
        sentAt: this.timing.sentAt?.toISOString(),
        deliveredAt: this.timing.deliveredAt?.toISOString(),
        readAt: this.timing.readAt?.toISOString()
      },
      status: this._status,
      createdAt: this.createdAt.toISOString()
    };
  }

  /**
   * Create message from JSON data
   */
  static fromJSON(data: any): Message {
    return new Message({
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
      createdAt: new Date(data.createdAt)
    });
  }
}