/**
 * Conversation Entity - Core domain entity representing a WhatsApp conversation
 */

import { Message, SenderType } from './message';

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

export class Conversation {
  public readonly metadata: ConversationMetadata;
  private _messages: Message[];
  private _status: ConversationStatus;
  private _currentIndex: number;
  private _settings: ConversationSettings;
  private _startTime?: Date;
  private _pauseTime?: Date;
  private _totalPausedTime: number;

  constructor(
    metadata: ConversationMetadata,
    messages: Message[] = [],
    settings?: Partial<ConversationSettings>
  ) {
    this.metadata = metadata;
    this._messages = messages;
    this._status = 'idle';
    this._currentIndex = 0;
    this._totalPausedTime = 0;
    this._settings = {
      playbackSpeed: 1.0,
      autoAdvance: true,
      showTypingIndicators: true,
      showReadReceipts: true,
      enableSounds: false,
      debugMode: false,
      ...settings
    };

    this.validateMessages();
  }

  // Getters
  get messages(): readonly Message[] {
    return this._messages;
  }

  get status(): ConversationStatus {
    return this._status;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get settings(): ConversationSettings {
    return { ...this._settings };
  }

  get isPlaying(): boolean {
    return this._status === 'playing';
  }

  get isPaused(): boolean {
    return this._status === 'paused';
  }

  get isCompleted(): boolean {
    return this._status === 'completed';
  }

  get hasError(): boolean {
    return this._status === 'error';
  }

  get currentMessage(): Message | null {
    return this._messages[this._currentIndex] || null;
  }

  get nextMessage(): Message | null {
    return this._messages[this._currentIndex + 1] || null;
  }

  get previousMessage(): Message | null {
    return this._messages[this._currentIndex - 1] || null;
  }

  get canGoBack(): boolean {
    return this._currentIndex > 0;
  }

  get canGoForward(): boolean {
    return this._currentIndex < this._messages.length - 1;
  }

  /**
   * Get conversation progress information
   */
  getProgress(): ConversationProgress {
    const totalMessages = this._messages.length;
    const elapsedTime = this.calculateElapsedTime();
    const estimatedRemainingTime = this.calculateRemainingTime();

    return {
      currentMessageIndex: this._currentIndex,
      totalMessages,
      elapsedTime,
      remainingTime: Math.max(0, estimatedRemainingTime),
      completionPercentage: totalMessages > 0 ? (this._currentIndex / totalMessages) * 100 : 0
    };
  }

  /**
   * Update conversation settings
   */
  updateSettings(updates: Partial<ConversationSettings>): void {
    this._settings = { ...this._settings, ...updates };
  }

  /**
   * Add message to the conversation
   */
  addMessage(message: Message): void {
    this._messages.push(message);
    this.metadata.estimatedDuration = this.calculateEstimatedDuration();
    this.metadata.updatedAt = new Date();
  }

  /**
   * Add multiple messages to the conversation
   */
  addMessages(messages: Message[]): void {
    this._messages.push(...messages);
    this.metadata.estimatedDuration = this.calculateEstimatedDuration();
    this.metadata.updatedAt = new Date();
    this.validateMessages();
  }

  /**
   * Remove message from the conversation
   */
  removeMessage(messageId: string): boolean {
    const initialLength = this._messages.length;
    this._messages = this._messages.filter(msg => msg.id !== messageId);

    if (this._messages.length < initialLength) {
      this.metadata.estimatedDuration = this.calculateEstimatedDuration();
      this.metadata.updatedAt = new Date();

      // Adjust current index if necessary
      if (this._currentIndex >= this._messages.length) {
        this._currentIndex = Math.max(0, this._messages.length - 1);
      }

      return true;
    }

    return false;
  }

  /**
   * Start conversation playback
   */
  play(): void {
    if (this._status === 'completed') {
      this.reset();
    }

    this._status = 'playing';

    if (!this._startTime) {
      this._startTime = new Date();
    }

    if (this._pauseTime) {
      this._totalPausedTime += Date.now() - this._pauseTime.getTime();
      this._pauseTime = undefined;
    }
  }

  /**
   * Pause conversation playback
   */
  pause(): void {
    if (this._status === 'playing') {
      this._status = 'paused';
      this._pauseTime = new Date();
    }
  }

  /**
   * Stop and reset conversation
   */
  reset(): void {
    this._status = 'idle';
    this._currentIndex = 0;
    this._startTime = undefined;
    this._pauseTime = undefined;
    this._totalPausedTime = 0;
  }

  /**
   * Jump to specific message index
   */
  jumpTo(index: number): void {
    if (index >= 0 && index < this._messages.length) {
      this._currentIndex = index;
    } else {
      throw new Error(`Invalid message index: ${index}`);
    }
  }

  /**
   * Advance to next message
   */
  advanceToNext(): boolean {
    if (this.canGoForward) {
      this._currentIndex++;
      return true;
    }

    if (this._currentIndex >= this._messages.length - 1) {
      this._status = 'completed';
    }

    return false;
  }

  /**
   * Go back to previous message
   */
  goToPrevious(): boolean {
    if (this.canGoBack) {
      this._currentIndex--;
      return true;
    }
    return false;
  }

  /**
   * Set error status with message
   */
  setError(error: Error): void {
    this._status = 'error';
    console.error('Conversation error:', error);
  }

  /**
   * Get messages up to current index
   */
  getMessagesUpTo(index?: number): Message[] {
    const endIndex = index !== undefined ? index : this._currentIndex + 1;
    return this._messages.slice(0, Math.max(0, endIndex));
  }

  /**
   * Get messages by sender type
   */
  getMessagesBySender(sender: SenderType): Message[] {
    return this._messages.filter(msg => msg.sender === sender);
  }

  /**
   * Get messages by type
   */
  getMessagesByType(type: string): Message[] {
    return this._messages.filter(msg => msg.type === type);
  }

  /**
   * Calculate total estimated duration
   */
  private calculateEstimatedDuration(): number {
    return this._messages.reduce((total, message) => {
      return total + message.getTotalAnimationTime();
    }, 0);
  }

  /**
   * Calculate elapsed time considering pauses and speed
   */
  private calculateElapsedTime(): number {
    if (!this._startTime) return 0;

    const currentTime = this._pauseTime || new Date();
    const rawElapsed = currentTime.getTime() - this._startTime.getTime();

    return Math.max(0, rawElapsed - this._totalPausedTime);
  }

  /**
   * Calculate remaining time based on current progress
   */
  private calculateRemainingTime(): number {
    const remainingMessages = this._messages.slice(this._currentIndex + 1);
    const remainingDuration = remainingMessages.reduce((total, message) => {
      return total + message.getTotalAnimationTime();
    }, 0);

    return remainingDuration / this._settings.playbackSpeed;
  }

  /**
   * Validate messages for consistency
   */
  private validateMessages(): void {
    // Check for duplicate IDs
    const ids = new Set();
    for (const message of this._messages) {
      if (ids.has(message.id)) {
        throw new Error(`Duplicate message ID found: ${message.id}`);
      }
      ids.add(message.id);
    }

    // Validate timing sequences
    for (let i = 1; i < this._messages.length; i++) {
      const current = this._messages[i];
      const previous = this._messages[i - 1];

      if (current.timing.queueAt < previous.timing.queueAt) {
        console.warn(`Message timing inconsistency at index ${i}`);
      }
    }
  }

  /**
   * Create a copy of the conversation
   */
  clone(updates?: {
    metadata?: Partial<ConversationMetadata>;
    messages?: Message[];
    settings?: Partial<ConversationSettings>;
  }): Conversation {
    const newMetadata = updates?.metadata
      ? { ...this.metadata, ...updates.metadata }
      : this.metadata;

    const newMessages = updates?.messages || this._messages;
    const newSettings = updates?.settings
      ? { ...this._settings, ...updates.settings }
      : this._settings;

    return new Conversation(newMetadata, newMessages, newSettings);
  }

  /**
   * Serialize conversation to JSON
   */
  toJSON(): Record<string, any> {
    return {
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString()
      },
      messages: this._messages.map(msg => msg.toJSON()),
      status: this._status,
      currentIndex: this._currentIndex,
      settings: this._settings,
      startTime: this._startTime?.toISOString(),
      totalPausedTime: this._totalPausedTime
    };
  }

  /**
   * Create conversation from JSON data
   */
  static fromJSON(data: any): Conversation {
    const metadata = {
      ...data.metadata,
      createdAt: new Date(data.metadata.createdAt),
      updatedAt: new Date(data.metadata.updatedAt)
    };

    const messages = data.messages.map((msgData: any) => Message.fromJSON(msgData));

    const conversation = new Conversation(metadata, messages, data.settings);
    conversation._status = data.status;
    conversation._currentIndex = data.currentIndex;
    conversation._totalPausedTime = data.totalPausedTime || 0;

    if (data.startTime) {
      conversation._startTime = new Date(data.startTime);
    }

    return conversation;
  }
}