/**
 * Conversation Entity Tests
 * Tests for conversation state management and business logic
 */

import {
  addMessage,
  addMessages,
  advanceToNext,
  canGoBack,
  canGoForward,
  cloneConversation,
  Conversation,
  ConversationMetadata,
  ConversationSettings,
  ConversationStatus,
  conversationToJSON,
  createConversation,
  createConversationFromJSON,
  getConversationProgress,
  getCurrentMessage,
  getMessagesBySender,
  getMessagesByType,
  getMessagesUpTo,
  getNextMessage,
  getPreviousMessage,
  goToPrevious,
  hasError,  isPaused,
  isPlaying,
  jumpToMessage,
  pauseConversation,
  playConversation,
  removeMessage,
  resetConversation,
  setConversationError,
  updateConversationSettings} from '../../../domain/entities/conversation';
import { createMessage,Message, MessageTiming } from '../../../domain/entities/message';

describe('Conversation Entity', () => {
  const createTestMetadata = (overrides: Partial<ConversationMetadata> = {}): ConversationMetadata => ({
    id: 'conv-1',
    title: 'Test Conversation',
    description: 'A test conversation',
    tags: ['test', 'demo'],
    businessName: 'Test Business',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+0987654321',
    language: 'en',
    category: 'customer-service',
    estimatedDuration: 30000,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
  });

  const createTestMessage = (id: string, overrides: Partial<any> = {}): Message => {
    const timing: MessageTiming = {
      queueAt: new Date(`2024-01-01T10:0${id.slice(-1)}:00Z`),
      typingDuration: 2000,
      delayBeforeTyping: 1000,
    };

    return createMessage({
      id,
      type: 'text',
      sender: 'user',
      content: { text: `Message ${id}` },
      timing,
      ...overrides,
    });
  };

  describe('Construction', () => {
    it('should create conversation with metadata only', () => {
      const metadata = createTestMetadata();
      const conversation = createConversation(metadata);

      expect(conversation.metadata.id).toBe('conv-1');
      expect(conversation.messages).toHaveLength(0);
      expect(conversation.status).toBe('idle');
      expect(conversation.currentIndex).toBe(0);
      expect(conversation.settings.playbackSpeed).toBe(1.0);
      expect(conversation.settings.autoAdvance).toBe(true);
    });

    it('should create conversation with messages', () => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
      ];
      const conversation = createConversation(metadata, messages);

      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0].id).toBe('msg-1');
      expect(conversation.messages[1].id).toBe('msg-2');
    });

    it('should create conversation with custom settings', () => {
      const metadata = createTestMetadata();
      const settings: Partial<ConversationSettings> = {
        playbackSpeed: 2.0,
        autoAdvance: false,
        showTypingIndicators: false,
        debugMode: true,
      };
      const conversation = createConversation(metadata, [], settings);

      expect(conversation.settings.playbackSpeed).toBe(2.0);
      expect(conversation.settings.autoAdvance).toBe(false);
      expect(conversation.settings.showTypingIndicators).toBe(false);
      expect(conversation.settings.showReadReceipts).toBe(true); // default
      expect(conversation.settings.debugMode).toBe(true);
    });

    it('should validate messages during construction', () => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('duplicate-id'),
        createTestMessage('duplicate-id'), // Same ID
      ];

      expect(() => createConversation(metadata, messages)).toThrow(
        'Duplicate message ID found: duplicate-id'
      );
    });
  });

  describe('Message Management', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = createConversation(metadata);
    });

    it('should add single message', () => {
      const message = createTestMessage('msg-1');
      conversation = addMessage(conversation, message);

      expect(conversation.messages).toHaveLength(1);
      expect(conversation.messages[0]).toBe(message);
      expect(conversation.metadata.updatedAt.getTime()).toBeGreaterThan(
        new Date('2024-01-01T10:00:00Z').getTime()
      );
    });

    it('should add multiple messages', () => {
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
      ];
      conversation = addMessages(conversation, messages);

      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0].id).toBe('msg-1');
      expect(conversation.messages[1].id).toBe('msg-2');
    });

    it('should prevent adding duplicate message IDs', () => {
      const message1 = createTestMessage('msg-1');
      const message2 = createTestMessage('msg-1'); // Same ID

      conversation = addMessage(conversation, message1);

      expect(() => addMessages(conversation, [message2])).toThrow(
        'Duplicate message ID found: msg-1'
      );
    });

    it('should remove message by ID', () => {
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation = addMessages(conversation, messages);

      const updatedConversation = removeMessage(conversation, 'msg-2');
      const removed = updatedConversation.messages.length < conversation.messages.length;

      expect(removed).toBe(true);
      expect(updatedConversation.messages).toHaveLength(2);
      expect(updatedConversation.messages.find(m => m.id === 'msg-2')).toBeUndefined();
      conversation = updatedConversation;
    });

    it('should return false when removing non-existent message', () => {
      const originalLength = conversation.messages.length;
      const updatedConversation = removeMessage(conversation, 'non-existent');
      const removed = updatedConversation.messages.length < originalLength;
      expect(removed).toBe(false);
    });

    it('should adjust current index when removing messages', () => {
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation = addMessages(conversation, messages);
      conversation = jumpToMessage(conversation, 2); // Point to msg-3

      conversation = removeMessage(conversation, 'msg-3'); // Remove current message

      expect(conversation.currentIndex).toBe(1); // Adjusted to msg-2
    });

    it('should update estimated duration when adding/removing messages', () => {
      const initialDuration = conversation.metadata.estimatedDuration;

      const message = createTestMessage('msg-1', {
        timing: {
          queueAt: new Date(),
          typingDuration: 5000,
          delayBeforeTyping: 3000,
        }
      });

      conversation = addMessage(conversation, message);
      expect(conversation.metadata.estimatedDuration).toBe(8000); // 5000 + 3000

      conversation = removeMessage(conversation, 'msg-1');
      expect(conversation.metadata.estimatedDuration).toBe(0);
    });
  });

  describe('Playback Control', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation = createConversation(metadata, messages);
    });

    it('should start playback from idle', () => {
      expect(conversation.status).toBe('idle');
      conversation = playConversation(conversation);
      expect(conversation.status).toBe('playing');
      expect(isPlaying(conversation)).toBe(true);
    });

    it('should resume from completed state', () => {
      conversation = jumpToMessage(conversation, 2); // Last message (index 2)
      conversation = advanceToNext(conversation); // This should complete it
      expect(conversation.status).toBe('completed');

      conversation = playConversation(conversation);

      expect(conversation.status).toBe('playing');
      expect(conversation.currentIndex).toBe(0); // Reset to beginning
    });

    it('should pause during playback', () => {
      conversation = playConversation(conversation);
      conversation = pauseConversation(conversation);

      expect(conversation.status).toBe('paused');
      expect(isPaused(conversation)).toBe(true);
      expect(isPlaying(conversation)).toBe(false);
    });

    it('should not pause when not playing', () => {
      expect(conversation.status).toBe('idle');
      conversation = pauseConversation(conversation);
      expect(conversation.status).toBe('idle'); // Unchanged
    });

    it('should reset conversation state', () => {
      conversation = playConversation(conversation);
      conversation = jumpToMessage(conversation, 1);
      conversation = pauseConversation(conversation);

      conversation = resetConversation(conversation);

      expect(conversation.status).toBe('idle');
      expect(conversation.currentIndex).toBe(0);
      expect(isPlaying(conversation)).toBe(false);
      expect(isPaused(conversation)).toBe(false);
    });
  });

  describe('Navigation', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation = createConversation(metadata, messages);
    });

    it('should jump to valid message index', () => {
      conversation = jumpToMessage(conversation, 1);
      expect(conversation.currentIndex).toBe(1);
      expect(getCurrentMessage(conversation)?.id).toBe('msg-2');
    });

    it('should throw error for invalid jump index', () => {
      expect(() => jumpToMessage(conversation, -1)).toThrow('Invalid message index: -1');
      expect(() => jumpToMessage(conversation, 3)).toThrow('Invalid message index: 3');
    });

    it('should advance to next message', () => {
      expect(conversation.currentIndex).toBe(0);

      const newConversation = advanceToNext(conversation);
      const advanced = newConversation.currentIndex > conversation.currentIndex;

      expect(advanced).toBe(true);
      expect(newConversation.currentIndex).toBe(1);
      conversation = newConversation;
    });

    it('should complete when advancing beyond last message', () => {
      conversation = jumpToMessage(conversation, 2); // Last message

      const newConversation = advanceToNext(conversation);
      const advanced = newConversation.currentIndex > conversation.currentIndex;

      expect(advanced).toBe(false);
      expect(newConversation.status).toBe('completed');
      conversation = newConversation;
    });

    it('should go to previous message', () => {
      conversation = jumpToMessage(conversation, 2);

      const newConversation = goToPrevious(conversation);
      const went = newConversation.currentIndex < conversation.currentIndex;

      expect(went).toBe(true);
      expect(newConversation.currentIndex).toBe(1);
      conversation = newConversation;
    });

    it('should not go before first message', () => {
      expect(conversation.currentIndex).toBe(0);

      const newConversation = goToPrevious(conversation);
      const went = newConversation.currentIndex !== conversation.currentIndex;

      expect(went).toBe(false);
      expect(newConversation.currentIndex).toBe(0);
    });

    it('should provide correct navigation state', () => {
      // At beginning
      expect(canGoBack(conversation)).toBe(false);
      expect(canGoForward(conversation)).toBe(true);

      // In middle
      conversation = jumpToMessage(conversation, 1);
      expect(canGoBack(conversation)).toBe(true);
      expect(canGoForward(conversation)).toBe(true);

      // At end
      conversation = jumpToMessage(conversation, 2);
      expect(canGoBack(conversation)).toBe(true);
      expect(canGoForward(conversation)).toBe(false);
    });
  });

  describe('Message Access', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1', { sender: 'user', type: 'text' }),
        createTestMessage('msg-2', { sender: 'business', type: 'image' }),
        createTestMessage('msg-3', { sender: 'user', type: 'text' }),
      ];
      conversation = createConversation(metadata, messages);
      conversation = jumpToMessage(conversation, 1); // Point to middle message
    });

    it('should provide current message', () => {
      expect(getCurrentMessage(conversation)?.id).toBe('msg-2');
    });

    it('should provide next message', () => {
      expect(getNextMessage(conversation)?.id).toBe('msg-3');
    });

    it('should provide previous message', () => {
      expect(getPreviousMessage(conversation)?.id).toBe('msg-1');
    });

    it('should handle edge cases for message access', () => {
      conversation = jumpToMessage(conversation, 0); // First message
      expect(getPreviousMessage(conversation)).toBeNull();

      conversation = jumpToMessage(conversation, 2); // Last message
      expect(getNextMessage(conversation)).toBeNull();
    });

    it('should get messages up to current index', () => {
      const messagesUpTo = getMessagesUpTo(conversation);
      expect(messagesUpTo).toHaveLength(2); // msg-1 and msg-2
      expect(messagesUpTo[0].id).toBe('msg-1');
      expect(messagesUpTo[1].id).toBe('msg-2');
    });

    it('should get messages up to specific index', () => {
      const messagesUpTo = getMessagesUpTo(conversation, 1);
      expect(messagesUpTo).toHaveLength(1);
      expect(messagesUpTo[0].id).toBe('msg-1');
    });

    it('should get messages by sender type', () => {
      const userMessages = getMessagesBySender(conversation, 'user');
      const businessMessages = getMessagesBySender(conversation, 'business');

      expect(userMessages).toHaveLength(2);
      expect(businessMessages).toHaveLength(1);
      expect(userMessages[0].id).toBe('msg-1');
      expect(businessMessages[0].id).toBe('msg-2');
    });

    it('should get messages by type', () => {
      const textMessages = getMessagesByType(conversation, 'text');
      const imageMessages = getMessagesByType(conversation, 'image');

      expect(textMessages).toHaveLength(2);
      expect(imageMessages).toHaveLength(1);
    });
  });

  describe('Progress Tracking', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation = createConversation(metadata, messages);
    });

    it('should calculate progress correctly', () => {
      const progress = getConversationProgress(conversation);

      expect(progress.currentMessageIndex).toBe(0);
      expect(progress.totalMessages).toBe(3);
      expect(progress.completionPercentage).toBe(0);
      expect(progress.elapsedTime).toBe(0);
      expect(progress.remainingTime).toBeGreaterThan(0);
    });

    it('should update progress when advancing', () => {
      conversation = advanceToNext(conversation);
      const progress = getConversationProgress(conversation);

      expect(progress.currentMessageIndex).toBe(1);
      expect(progress.completionPercentage).toBeCloseTo(33.33, 2);
    });

    it('should handle completion progress', () => {
      conversation = jumpToMessage(conversation, 2);
      conversation = advanceToNext(conversation); // Complete
      const progress = getConversationProgress(conversation);

      expect(progress.completionPercentage).toBe(100);
    });

    it('should handle empty conversation progress', () => {
      const emptyConversation = createConversation(createTestMetadata());
      const progress = getConversationProgress(emptyConversation);

      expect(progress.completionPercentage).toBe(0);
      expect(progress.totalMessages).toBe(0);
      expect(progress.remainingTime).toBe(0);
    });
  });

  describe('Settings Management', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = createConversation(metadata);
    });

    it('should update settings', () => {
      const updates: Partial<ConversationSettings> = {
        playbackSpeed: 1.5,
        autoAdvance: false,
        enableSounds: true,
      };

      conversation = updateConversationSettings(conversation, updates);
      const settings = conversation.settings;

      expect(settings.playbackSpeed).toBe(1.5);
      expect(settings.autoAdvance).toBe(false);
      expect(settings.enableSounds).toBe(true);
      expect(settings.showTypingIndicators).toBe(true); // Unchanged
    });

    it('should return immutable settings', () => {
      const settings1 = conversation.settings;
      const settings2 = conversation.settings;

      expect(settings1).toBe(settings2); // Same object for immutable data
      expect(settings1).toEqual(settings2); // Same content
    });
  });

  describe('Error Handling', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = createConversation(metadata);
    });

    it('should set error status', () => {
      const error = new Error('Test error');
      conversation = setConversationError(conversation, error);

      expect(conversation.status).toBe('error');
      expect(hasError(conversation)).toBe(true);
    });
  });

  describe('Cloning', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [createTestMessage('msg-1')];
      const settings: Partial<ConversationSettings> = { playbackSpeed: 2.0 };
      conversation = createConversation(metadata, messages, settings);
    });

    it('should clone conversation with same data', () => {
      const cloned = cloneConversation(conversation);

      expect(cloned).not.toBe(conversation);
      expect(cloned.metadata).toBe(conversation.metadata); // Reference
      expect(cloned.messages).toBe(conversation.messages); // Reference
      expect(cloned.settings).toEqual(conversation.settings);
    });

    it('should clone with updated metadata', () => {
      const updates = {
        metadata: { title: 'Updated Title' }
      };
      const cloned = cloneConversation(conversation, updates);

      expect(cloned.metadata.title).toBe('Updated Title');
      expect(cloned.metadata.id).toBe(conversation.metadata.id);
    });

    it('should clone with different messages', () => {
      const newMessages = [createTestMessage('new-msg')];
      const updates = { messages: newMessages };
      const cloned = cloneConversation(conversation, updates);

      expect(cloned.messages).toBe(newMessages);
      expect(cloned.messages[0].id).toBe('new-msg');
      expect(conversation.messages[0].id).toBe('msg-1'); // Original unchanged
    });
  });

  describe('Serialization', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
      ];
      conversation = createConversation(metadata, messages, { playbackSpeed: 1.5 });
      conversation = playConversation(conversation);
      conversation = jumpToMessage(conversation, 1);
    });

    it('should serialize to JSON', () => {
      const json = conversationToJSON(conversation);

      expect(json.metadata.id).toBe('conv-1');
      expect(json.metadata.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(json.messages).toHaveLength(2);
      expect(json.status).toBe('playing');
      expect(json.currentIndex).toBe(1);
      expect(json.settings.playbackSpeed).toBe(1.5);
    });

    it('should deserialize from JSON', () => {
      const json = conversationToJSON(conversation);
      const deserialized = createConversationFromJSON(json);

      expect(deserialized.metadata.id).toBe(conversation.metadata.id);
      expect(deserialized.messages).toHaveLength(conversation.messages.length);
      expect(deserialized.status).toBe(conversation.status);
      expect(deserialized.currentIndex).toBe(conversation.currentIndex);
      expect(deserialized.settings.playbackSpeed).toBe(conversation.settings.playbackSpeed);
    });

    it('should handle round-trip serialization', () => {
      const json1 = conversationToJSON(conversation);
      const deserialized = createConversationFromJSON(json1);
      const json2 = conversationToJSON(deserialized);

      // Compare serialized data (excluding timestamps that might differ slightly)
      expect(json2.metadata.id).toBe(json1.metadata.id);
      expect(json2.messages).toEqual(json1.messages);
      expect(json2.status).toBe(json1.status);
      expect(json2.settings).toEqual(json1.settings);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle empty message list gracefully', () => {
      const metadata = createTestMetadata();
      const conversation = createConversation(metadata);

      expect(getCurrentMessage(conversation)).toBeNull();
      expect(getNextMessage(conversation)).toBeNull();
      expect(getPreviousMessage(conversation)).toBeNull();
      expect(() => advanceToNext(conversation)).not.toThrow();
    });

    it('should validate timing sequence warnings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1', {
          timing: {
            queueAt: new Date('2024-01-01T10:02:00Z'), // Later
            typingDuration: 2000,
            delayBeforeTyping: 1000,
          }
        }),
        createTestMessage('msg-2', {
          timing: {
            queueAt: new Date('2024-01-01T10:01:00Z'), // Earlier
            typingDuration: 2000,
            delayBeforeTyping: 1000,
          }
        }),
      ];

      // Should warn about timing inconsistency
      createConversation(metadata, messages);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Message timing inconsistency at index 1'
      );

      consoleSpy.mockRestore();
    });

    it('should handle extreme playback speeds in progress calculation', () => {
      const metadata = createTestMetadata();
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2')
      ];
      const conversation = createConversation(metadata, messages, { playbackSpeed: 0.1 });

      const progress = getConversationProgress(conversation);
      expect(progress.remainingTime).toBeGreaterThan(0);
      expect(isFinite(progress.remainingTime)).toBe(true);
    });
  });
});