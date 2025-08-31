/**
 * Message Entity Tests
 * Tests for core domain entity business logic and validation
 */

import {
  Message,
  MessageContent,
  MessageStatus,
  MessageTiming,
  MessageType,
  SenderType} from '../../../domain/entities/message';

describe('Message Entity', () => {
  const createTestMessage = (overrides: Partial<{
    id: string;
    type: MessageType;
    sender: SenderType;
    content: MessageContent;
    timing: MessageTiming;
    status: MessageStatus;
    createdAt: Date;
  }> = {}): Message => {
    const defaultTiming: MessageTiming = {
      queueAt: new Date('2024-01-01T10:00:00Z'),
      typingDuration: 2000,
      delayBeforeTyping: 1000,
    };

    const defaultContent: MessageContent = {
      text: 'Test message',
    };

    return new Message({
      id: 'msg-1',
      type: 'text',
      sender: 'user',
      content: defaultContent,
      timing: defaultTiming,
      status: 'sending',
      createdAt: new Date('2024-01-01T09:59:00Z'),
      ...overrides,
    });
  };

  describe('Construction', () => {
    it('should create a message with valid data', () => {
      const message = createTestMessage();

      expect(message.id).toBe('msg-1');
      expect(message.type).toBe('text');
      expect(message.sender).toBe('user');
      expect(message.status).toBe('sending');
      expect(message.content.text).toBe('Test message');
    });

    it('should default status to sending if not provided', () => {
      const message = createTestMessage({ status: undefined });
      expect(message.status).toBe('sending');
    });

    it('should use current date if createdAt not provided', () => {
      const beforeCreate = Date.now();
      const message = createTestMessage({ createdAt: undefined });
      const afterCreate = Date.now();

      expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate);
      expect(message.createdAt.getTime()).toBeLessThanOrEqual(afterCreate);
    });
  });

  describe('Status Management', () => {
    it('should allow valid status transitions', () => {
      const message = createTestMessage({ status: 'sending' });

      // sending -> sent
      expect(() => message.updateStatus('sent')).not.toThrow();
      expect(message.status).toBe('sent');

      // sent -> delivered
      expect(() => message.updateStatus('delivered')).not.toThrow();
      expect(message.status).toBe('delivered');

      // delivered -> read
      expect(() => message.updateStatus('read')).not.toThrow();
      expect(message.status).toBe('read');
    });

    it('should allow failed transition from any status', () => {
      const message1 = createTestMessage({ status: 'sending' });
      expect(() => message1.updateStatus('failed')).not.toThrow();

      const message2 = createTestMessage({ status: 'sent' });
      expect(() => message2.updateStatus('failed')).not.toThrow();
    });

    it('should allow retry from failed status', () => {
      const message = createTestMessage({ status: 'failed' });
      expect(() => message.updateStatus('sending')).not.toThrow();
      expect(message.status).toBe('sending');
    });

    it('should reject invalid status transitions', () => {
      const message = createTestMessage({ status: 'sent' });

      expect(() => message.updateStatus('sending')).toThrow(
        'Invalid status transition from sent to sending'
      );
    });

    it('should not allow changes from read status', () => {
      const message = createTestMessage({ status: 'read' });

      expect(() => message.updateStatus('delivered')).toThrow();
      expect(() => message.updateStatus('sent')).toThrow();
    });
  });

  describe('Flow Detection', () => {
    it('should identify flow type messages as flow triggers', () => {
      const flowMessage = createTestMessage({
        type: 'flow',
        content: {
          flow: {
            flowId: 'flow-123',
            flowToken: 'token-456',
          }
        }
      });

      expect(flowMessage.isFlowTrigger()).toBe(true);
    });

    it('should identify interactive flow messages as flow triggers', () => {
      const interactiveFlowMessage = createTestMessage({
        type: 'interactive',
        content: {
          interactive: {
            type: 'flow',
            body: 'Start flow',
            action: { flowId: 'flow-123' }
          }
        }
      });

      expect(interactiveFlowMessage.isFlowTrigger()).toBe(true);
    });

    it('should not identify regular messages as flow triggers', () => {
      const textMessage = createTestMessage({ type: 'text' });
      const imageMessage = createTestMessage({ type: 'image' });
      const buttonMessage = createTestMessage({
        type: 'interactive',
        content: {
          interactive: {
            type: 'button',
            body: 'Choose option',
            action: {}
          }
        }
      });

      expect(textMessage.isFlowTrigger()).toBe(false);
      expect(imageMessage.isFlowTrigger()).toBe(false);
      expect(buttonMessage.isFlowTrigger()).toBe(false);
    });
  });

  describe('Display Text Generation', () => {
    const testCases: Array<{
      type: MessageType;
      content: MessageContent;
      expected: string;
    }> = [
      {
        type: 'text',
        content: { text: 'Hello world' },
        expected: 'Hello world',
      },
      {
        type: 'text',
        content: { text: '' },
        expected: '',
      },
      {
        type: 'image',
        content: {
          media: {
            url: 'image.jpg',
            caption: 'Beautiful sunset'
          }
        },
        expected: 'Beautiful sunset',
      },
      {
        type: 'image',
        content: { media: { url: 'image.jpg' } },
        expected: '📷 Image',
      },
      {
        type: 'audio',
        content: { media: { url: 'audio.mp3' } },
        expected: '🎵 Audio message',
      },
      {
        type: 'video',
        content: {
          media: {
            url: 'video.mp4',
            caption: 'Tutorial video'
          }
        },
        expected: 'Tutorial video',
      },
      {
        type: 'video',
        content: { media: { url: 'video.mp4' } },
        expected: '🎥 Video',
      },
      {
        type: 'document',
        content: {
          media: {
            url: 'doc.pdf',
            filename: 'report.pdf'
          }
        },
        expected: '📄 report.pdf',
      },
      {
        type: 'document',
        content: { media: { url: 'doc.pdf' } },
        expected: '📄 Document',
      },
      {
        type: 'sticker',
        content: {},
        expected: '😀 Sticker',
      },
      {
        type: 'location',
        content: {
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            name: 'New York City'
          }
        },
        expected: '📍 Location',
      },
      {
        type: 'contact',
        content: {},
        expected: '👤 Contact',
      },
      {
        type: 'interactive',
        content: {
          interactive: {
            type: 'button',
            body: 'Choose your option',
            action: {}
          }
        },
        expected: 'Choose your option',
      },
      {
        type: 'interactive',
        content: {
          interactive: {
            type: 'button',
            body: '',
            action: {}
          }
        },
        expected: 'Interactive message',
      },
      {
        type: 'template',
        content: {
          template: {
            name: 'welcome_message',
            language: 'en',
            components: []
          }
        },
        expected: 'Template: welcome_message',
      },
      {
        type: 'flow',
        content: {
          flow: {
            flowId: 'flow-123',
            flowToken: 'token-456'
          }
        },
        expected: 'WhatsApp Flow',
      },
    ];

    testCases.forEach(({ type, content, expected }) => {
      it(`should generate correct display text for ${type} messages`, () => {
        const message = createTestMessage({ type, content });
        expect(message.getDisplayText()).toBe(expected);
      });
    });
  });

  describe('Timing Calculations', () => {
    it('should calculate total animation time correctly', () => {
      const message = createTestMessage({
        timing: {
          queueAt: new Date(),
          delayBeforeTyping: 1500,
          typingDuration: 2500,
        }
      });

      expect(message.getTotalAnimationTime()).toBe(4000); // 1500 + 2500
    });

    it('should handle zero timing values', () => {
      const message = createTestMessage({
        timing: {
          queueAt: new Date(),
          delayBeforeTyping: 0,
          typingDuration: 0,
        }
      });

      expect(message.getTotalAnimationTime()).toBe(0);
    });
  });

  describe('Cloning', () => {
    it('should create a copy with updated status', () => {
      const original = createTestMessage({ status: 'sending' });
      const cloned = original.clone({ status: 'sent' });

      expect(cloned).not.toBe(original);
      expect(cloned.id).toBe(original.id);
      expect(cloned.status).toBe('sent');
      expect(original.status).toBe('sending'); // Original unchanged
    });

    it('should create a copy with updated timing', () => {
      const original = createTestMessage();
      const newTiming = { delayBeforeTyping: 3000 };
      const cloned = original.clone({ timing: newTiming });

      expect(cloned.timing.delayBeforeTyping).toBe(3000);
      expect(cloned.timing.typingDuration).toBe(original.timing.typingDuration);
      expect(original.timing.delayBeforeTyping).toBe(1000); // Original unchanged
    });

    it('should create a copy with updated content', () => {
      const original = createTestMessage();
      const newContent = { text: 'Updated message' };
      const cloned = original.clone({ content: newContent });

      expect(cloned.content.text).toBe('Updated message');
      expect(original.content.text).toBe('Test message'); // Original unchanged
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const message = createTestMessage();
      const json = message.toJSON();

      expect(json.id).toBe('msg-1');
      expect(json.type).toBe('text');
      expect(json.sender).toBe('user');
      expect(json.status).toBe('sending');
      expect(json.content.text).toBe('Test message');
      expect(json.timing.queueAt).toBe('2024-01-01T10:00:00.000Z');
      expect(json.timing.typingDuration).toBe(2000);
      expect(json.createdAt).toBe('2024-01-01T09:59:00.000Z');
    });

    it('should handle optional timing fields in JSON', () => {
      const timing: MessageTiming = {
        queueAt: new Date('2024-01-01T10:00:00Z'),
        sentAt: new Date('2024-01-01T10:00:05Z'),
        deliveredAt: new Date('2024-01-01T10:00:06Z'),
        readAt: new Date('2024-01-01T10:00:10Z'),
        typingDuration: 2000,
        delayBeforeTyping: 1000,
      };

      const message = createTestMessage({ timing });
      const json = message.toJSON();

      expect(json.timing.sentAt).toBe('2024-01-01T10:00:05.000Z');
      expect(json.timing.deliveredAt).toBe('2024-01-01T10:00:06.000Z');
      expect(json.timing.readAt).toBe('2024-01-01T10:00:10.000Z');
    });

    it('should deserialize from JSON correctly', () => {
      const originalMessage = createTestMessage();
      const json = originalMessage.toJSON();
      const deserialized = Message.fromJSON(json);

      expect(deserialized.id).toBe(originalMessage.id);
      expect(deserialized.type).toBe(originalMessage.type);
      expect(deserialized.sender).toBe(originalMessage.sender);
      expect(deserialized.status).toBe(originalMessage.status);
      expect(deserialized.content.text).toBe(originalMessage.content.text);
      expect(deserialized.timing.queueAt.getTime()).toBe(originalMessage.timing.queueAt.getTime());
      expect(deserialized.createdAt.getTime()).toBe(originalMessage.createdAt.getTime());
    });

    it('should handle round-trip serialization', () => {
      const original = createTestMessage({
        type: 'interactive',
        content: {
          interactive: {
            type: 'flow',
            body: 'Start booking',
            footer: 'Restaurant booking',
            action: {
              flowId: 'booking-flow',
              parameters: { restaurant: 'test' }
            }
          }
        }
      });

      const json = original.toJSON();
      const deserialized = Message.fromJSON(json);
      const reserializedJson = deserialized.toJSON();

      expect(JSON.stringify(json)).toBe(JSON.stringify(reserializedJson));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content objects', () => {
      const message = createTestMessage({ content: {} });
      expect(message.getDisplayText()).toBe(''); // Empty text for text message with no content
    });

    it('should handle null/undefined values in content', () => {
      const message = createTestMessage({
        type: 'text',
        content: { text: undefined }
      });
      expect(message.getDisplayText()).toBe('');
    });

    it('should handle complex nested content structures', () => {
      const message = createTestMessage({
        type: 'interactive',
        content: {
          interactive: {
            type: 'flow',
            body: 'Complex flow message',
            action: {
              flowId: 'complex-flow',
              parameters: {
                nested: {
                  data: ['array', 'values'],
                  object: { key: 'value' }
                }
              }
            }
          }
        }
      });

      expect(() => message.toJSON()).not.toThrow();
      expect(() => Message.fromJSON(message.toJSON())).not.toThrow();
    });
  });
});