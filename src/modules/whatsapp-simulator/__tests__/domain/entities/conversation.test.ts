/**
 * Conversation Entity Tests
 * Tests for conversation state management and business logic
 */

import {
  Conversation,
  ConversationMetadata,
  ConversationSettings,
  ConversationStatus
} from '../../../domain/entities/conversation';
import { Message, MessageTiming } from '../../../domain/entities/message';

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

    return new Message({
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
      const conversation = new Conversation(metadata);

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
      const conversation = new Conversation(metadata, messages);

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
      const conversation = new Conversation(metadata, [], settings);

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

      expect(() => new Conversation(metadata, messages)).toThrow(
        'Duplicate message ID found: duplicate-id'
      );
    });
  });

  describe('Message Management', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = new Conversation(metadata);
    });

    it('should add single message', () => {
      const message = createTestMessage('msg-1');
      conversation.addMessage(message);

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
      conversation.addMessages(messages);

      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages[0].id).toBe('msg-1');
      expect(conversation.messages[1].id).toBe('msg-2');
    });

    it('should prevent adding duplicate message IDs', () => {
      const message1 = createTestMessage('msg-1');
      const message2 = createTestMessage('msg-1'); // Same ID

      conversation.addMessage(message1);

      expect(() => conversation.addMessages([message2])).toThrow(
        'Duplicate message ID found: msg-1'
      );
    });

    it('should remove message by ID', () => {
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation.addMessages(messages);

      const removed = conversation.removeMessage('msg-2');

      expect(removed).toBe(true);
      expect(conversation.messages).toHaveLength(2);
      expect(conversation.messages.find(m => m.id === 'msg-2')).toBeUndefined();
    });

    it('should return false when removing non-existent message', () => {
      const removed = conversation.removeMessage('non-existent');
      expect(removed).toBe(false);
    });

    it('should adjust current index when removing messages', () => {
      const messages = [
        createTestMessage('msg-1'),
        createTestMessage('msg-2'),
        createTestMessage('msg-3'),
      ];
      conversation.addMessages(messages);
      conversation.jumpTo(2); // Point to msg-3

      conversation.removeMessage('msg-3'); // Remove current message

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

      conversation.addMessage(message);
      expect(conversation.metadata.estimatedDuration).toBe(8000); // 5000 + 3000

      conversation.removeMessage('msg-1');
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
      conversation = new Conversation(metadata, messages);
    });

    it('should start playback from idle', () => {
      expect(conversation.status).toBe('idle');
      conversation.play();
      expect(conversation.status).toBe('playing');
      expect(conversation.isPlaying).toBe(true);
    });

    it('should resume from completed state', () => {
      conversation.jumpTo(3); // Beyond last message
      // Simulate completion
      (conversation as any)._status = 'completed';

      conversation.play();

      expect(conversation.status).toBe('playing');
      expect(conversation.currentIndex).toBe(0); // Reset to beginning
    });

    it('should pause during playback', () => {
      conversation.play();
      conversation.pause();

      expect(conversation.status).toBe('paused');
      expect(conversation.isPaused).toBe(true);
      expect(conversation.isPlaying).toBe(false);
    });

    it('should not pause when not playing', () => {
      expect(conversation.status).toBe('idle');
      conversation.pause();
      expect(conversation.status).toBe('idle'); // Unchanged
    });

    it('should reset conversation state', () => {
      conversation.play();
      conversation.jumpTo(1);
      conversation.pause();

      conversation.reset();

      expect(conversation.status).toBe('idle');
      expect(conversation.currentIndex).toBe(0);
      expect(conversation.isPlaying).toBe(false);
      expect(conversation.isPaused).toBe(false);
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
      conversation = new Conversation(metadata, messages);
    });

    it('should jump to valid message index', () => {
      conversation.jumpTo(1);
      expect(conversation.currentIndex).toBe(1);
      expect(conversation.currentMessage?.id).toBe('msg-2');
    });

    it('should throw error for invalid jump index', () => {
      expect(() => conversation.jumpTo(-1)).toThrow('Invalid message index: -1');
      expect(() => conversation.jumpTo(3)).toThrow('Invalid message index: 3');
    });

    it('should advance to next message', () => {
      expect(conversation.currentIndex).toBe(0);

      const advanced = conversation.advanceToNext();

      expect(advanced).toBe(true);
      expect(conversation.currentIndex).toBe(1);
    });

    it('should complete when advancing beyond last message', () => {
      conversation.jumpTo(2); // Last message

      const advanced = conversation.advanceToNext();

      expect(advanced).toBe(false);
      expect(conversation.status).toBe('completed');
    });

    it('should go to previous message', () => {
      conversation.jumpTo(2);

      const went = conversation.goToPrevious();

      expect(went).toBe(true);
      expect(conversation.currentIndex).toBe(1);
    });

    it('should not go before first message', () => {
      expect(conversation.currentIndex).toBe(0);

      const went = conversation.goToPrevious();

      expect(went).toBe(false);
      expect(conversation.currentIndex).toBe(0);
    });

    it('should provide correct navigation state', () => {
      // At beginning
      expect(conversation.canGoBack).toBe(false);
      expect(conversation.canGoForward).toBe(true);

      // In middle
      conversation.jumpTo(1);
      expect(conversation.canGoBack).toBe(true);
      expect(conversation.canGoForward).toBe(true);

      // At end
      conversation.jumpTo(2);
      expect(conversation.canGoBack).toBe(true);
      expect(conversation.canGoForward).toBe(false);
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
      conversation = new Conversation(metadata, messages);
      conversation.jumpTo(1); // Point to middle message
    });

    it('should provide current message', () => {
      expect(conversation.currentMessage?.id).toBe('msg-2');
    });

    it('should provide next message', () => {
      expect(conversation.nextMessage?.id).toBe('msg-3');
    });

    it('should provide previous message', () => {
      expect(conversation.previousMessage?.id).toBe('msg-1');
    });

    it('should handle edge cases for message access', () => {
      conversation.jumpTo(0); // First message
      expect(conversation.previousMessage).toBeNull();

      conversation.jumpTo(2); // Last message
      expect(conversation.nextMessage).toBeNull();
    });

    it('should get messages up to current index', () => {
      const messagesUpTo = conversation.getMessagesUpTo();
      expect(messagesUpTo).toHaveLength(2); // msg-1 and msg-2
      expect(messagesUpTo[0].id).toBe('msg-1');
      expect(messagesUpTo[1].id).toBe('msg-2');
    });

    it('should get messages up to specific index', () => {
      const messagesUpTo = conversation.getMessagesUpTo(1);
      expect(messagesUpTo).toHaveLength(1);
      expect(messagesUpTo[0].id).toBe('msg-1');
    });

    it('should get messages by sender type', () => {
      const userMessages = conversation.getMessagesBySender('user');
      const businessMessages = conversation.getMessagesBySender('business');

      expect(userMessages).toHaveLength(2);
      expect(businessMessages).toHaveLength(1);
      expect(userMessages[0].id).toBe('msg-1');
      expect(businessMessages[0].id).toBe('msg-2');
    });

    it('should get messages by type', () => {
      const textMessages = conversation.getMessagesByType('text');
      const imageMessages = conversation.getMessagesByType('image');

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
      conversation = new Conversation(metadata, messages);
    });

    it('should calculate progress correctly', () => {
      const progress = conversation.getProgress();

      expect(progress.currentMessageIndex).toBe(0);
      expect(progress.totalMessages).toBe(3);
      expect(progress.completionPercentage).toBe(0);
      expect(progress.elapsedTime).toBe(0);
      expect(progress.remainingTime).toBeGreaterThan(0);
    });

    it('should update progress when advancing', () => {
      conversation.advanceToNext();
      const progress = conversation.getProgress();

      expect(progress.currentMessageIndex).toBe(1);
      expect(progress.completionPercentage).toBeCloseTo(33.33, 2);
    });

    it('should handle completion progress', () => {
      conversation.jumpTo(2);
      conversation.advanceToNext(); // Complete
      const progress = conversation.getProgress();

      expect(progress.completionPercentage).toBe(100);
    });

    it('should handle empty conversation progress', () => {
      const emptyConversation = new Conversation(createTestMetadata());
      const progress = emptyConversation.getProgress();

      expect(progress.completionPercentage).toBe(0);
      expect(progress.totalMessages).toBe(0);
      expect(progress.remainingTime).toBe(0);
    });
  });

  describe('Settings Management', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = new Conversation(metadata);
    });

    it('should update settings', () => {
      const updates: Partial<ConversationSettings> = {
        playbackSpeed: 1.5,
        autoAdvance: false,
        enableSounds: true,
      };

      conversation.updateSettings(updates);
      const settings = conversation.settings;

      expect(settings.playbackSpeed).toBe(1.5);
      expect(settings.autoAdvance).toBe(false);
      expect(settings.enableSounds).toBe(true);
      expect(settings.showTypingIndicators).toBe(true); // Unchanged
    });

    it('should return immutable settings', () => {
      const settings1 = conversation.settings;
      const settings2 = conversation.settings;

      expect(settings1).not.toBe(settings2); // Different objects
      expect(settings1).toEqual(settings2); // Same content
    });
  });

  describe('Error Handling', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      conversation = new Conversation(metadata);
    });

    it('should set error status', () => {
      const error = new Error('Test error');
      conversation.setError(error);

      expect(conversation.status).toBe('error');
      expect(conversation.hasError).toBe(true);
    });
  });

  describe('Cloning', () => {
    let conversation: Conversation;

    beforeEach(() => {
      const metadata = createTestMetadata();
      const messages = [createTestMessage('msg-1')];
      const settings: Partial<ConversationSettings> = { playbackSpeed: 2.0 };
      conversation = new Conversation(metadata, messages, settings);
    });

    it('should clone conversation with same data', () => {
      const cloned = conversation.clone();

      expect(cloned).not.toBe(conversation);
      expect(cloned.metadata).toBe(conversation.metadata); // Reference
      expect(cloned.messages).toBe(conversation.messages); // Reference
      expect(cloned.settings).toEqual(conversation.settings);
    });

    it('should clone with updated metadata', () => {
      const updates = {
        metadata: { title: 'Updated Title' }
      };
      const cloned = conversation.clone(updates);

      expect(cloned.metadata.title).toBe('Updated Title');
      expect(cloned.metadata.id).toBe(conversation.metadata.id);
    });

    it('should clone with different messages', () => {
      const newMessages = [createTestMessage('new-msg')];
      const updates = { messages: newMessages };
      const cloned = conversation.clone(updates);

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
      conversation = new Conversation(metadata, messages, { playbackSpeed: 1.5 });
      conversation.play();
      conversation.jumpTo(1);
    });

    it('should serialize to JSON', () => {
      const json = conversation.toJSON();

      expect(json.metadata.id).toBe('conv-1');
      expect(json.metadata.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(json.messages).toHaveLength(2);
      expect(json.status).toBe('playing');
      expect(json.currentIndex).toBe(1);
      expect(json.settings.playbackSpeed).toBe(1.5);
    });

    it('should deserialize from JSON', () => {
      const json = conversation.toJSON();
      const deserialized = Conversation.fromJSON(json);

      expect(deserialized.metadata.id).toBe(conversation.metadata.id);
      expect(deserialized.messages).toHaveLength(conversation.messages.length);
      expect(deserialized.status).toBe(conversation.status);
      expect(deserialized.currentIndex).toBe(conversation.currentIndex);
      expect(deserialized.settings.playbackSpeed).toBe(conversation.settings.playbackSpeed);
    });

    it('should handle round-trip serialization', () => {
      const json1 = conversation.toJSON();
      const deserialized = Conversation.fromJSON(json1);
      const json2 = deserialized.toJSON();

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
      const conversation = new Conversation(metadata);

      expect(conversation.currentMessage).toBeNull();
      expect(conversation.nextMessage).toBeNull();
      expect(conversation.previousMessage).toBeNull();
      expect(() => conversation.advanceToNext()).not.toThrow();
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
      new Conversation(metadata, messages);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Message timing inconsistency at index 1'
      );

      consoleSpy.mockRestore();
    });

    it('should handle extreme playback speeds in progress calculation', () => {
      const metadata = createTestMetadata();
      const messages = [createTestMessage('msg-1')];
      const conversation = new Conversation(metadata, messages, { playbackSpeed: 0.1 });

      const progress = conversation.getProgress();
      expect(progress.remainingTime).toBeGreaterThan(0);
      expect(isFinite(progress.remainingTime)).toBe(true);
    });
  });
});