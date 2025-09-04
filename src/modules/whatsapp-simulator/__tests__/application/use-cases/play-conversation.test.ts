/**
 * PlayConversationUseCase Tests
 * Tests for conversation playback orchestration
 */

import { firstValueFrom, take } from 'rxjs';

import { ConversationEngine } from '../../../application/engines/conversation-engine';
import { createPlayConversationUseCase, PlayConversationUseCase } from '../../../application/use-cases/play-conversation';
import { Conversation, createConversation, createMessage,Message } from '../../../domain/entities';
import { ConversationEventFactory } from '../../../domain/events';

// Mock the ConversationEngine
jest.mock('../../../application/engines/conversation-engine');

describe('PlayConversationUseCase', () => {
  let useCase: ReturnType<typeof createPlayConversationUseCase>;
  let mockEngine: jest.Mocked<ConversationEngine>;
  let testConversation: Conversation;

  beforeEach(() => {
    // Create mock engine
    mockEngine = {
      loadConversation: jest.fn(),
      play: jest.fn(),
      events$: {
        pipe: jest.fn(),
        subscribe: jest.fn(),
      },
      pause: jest.fn(),
      reset: jest.fn(),
      jumpTo: jest.fn(),
      setSpeed: jest.fn(),
      stop: jest.fn(),
      getCurrentState: jest.fn(),
      getCurrentConversation: jest.fn(),
      destroy: jest.fn(),
      conversation$: { pipe: jest.fn() },
      playbackState$: { pipe: jest.fn() },
      messages$: { pipe: jest.fn() },
      currentMessage$: { pipe: jest.fn() },
      progress$: { pipe: jest.fn() },
      isPlaying$: { pipe: jest.fn() },
      typingStates$: { pipe: jest.fn() },
    } as any;

    // Create use case with mock engine using factory
    useCase = createPlayConversationUseCase({ orchestrator: mockEngine });

    // Create test conversation
    const metadata = {
      id: 'test-conv-1',
      title: 'Test Conversation',
      tags: ['test'],
      businessName: 'Test Business',
      businessPhoneNumber: '+1234567890',
      userPhoneNumber: '+0987654321',
      language: 'en',
      estimatedDuration: 30000,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    };

    const messages = [
      createMessage({
        id: 'msg-1',
        type: 'text',
        sender: 'user',
        content: { text: 'Hello' },
        timing: {
          queueAt: new Date('2024-01-01T10:00:00Z'),
          typingDuration: 1000,
          delayBeforeTyping: 500,
        },
      }),
      createMessage({
        id: 'msg-2',
        type: 'text',
        sender: 'business',
        content: { text: 'Hi there! How can I help you?' },
        timing: {
          queueAt: new Date('2024-01-01T10:00:05Z'),
          typingDuration: 2000,
          delayBeforeTyping: 1000,
        },
      }),
    ];

    testConversation = createConversation(metadata, messages);
  });

  describe('Basic Execution', () => {
    it('should load conversation into engine', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      } as any;

      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(mockEngine.loadConversation).toHaveBeenCalledWith(testConversation);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should start playback by default', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      } as any;

      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(mockEngine.play).toHaveBeenCalled();
      expect(result.events$).toBe(mockEvents$);
    });

    it('should not start playback when autoStart is false', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      } as any;

      mockEngine.events$ = mockEvents$;

      const request = {
        conversation: testConversation,
        autoStart: false
      };
      const result = await useCase.execute(request);

      expect(mockEngine.play).not.toHaveBeenCalled();
      expect(result.events$).toBe(mockEngine.events$);
    });

    it('should handle autoStart explicitly set to true', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      } as any;

      mockEngine.play.mockReturnValue(mockEvents$);

      const request = {
        conversation: testConversation,
        autoStart: true
      };
      const result = await useCase.execute(request);

      expect(mockEngine.play).toHaveBeenCalled();
      expect(result.events$).toBe(mockEvents$);
    });
  });

  describe('Error Handling', () => {
    it('should handle engine loading errors', async () => {
      const error = new Error('Failed to load conversation');
      mockEngine.loadConversation.mockImplementation(() => {
        throw error;
      });

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.events$ = mockEvents$;

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.events$).toBe(mockEngine.events$);
    });

    it('should handle engine playback errors', async () => {
      const error = new Error('Playback failed');
      mockEngine.loadConversation.mockImplementation(() => {});
      mockEngine.play.mockImplementation(() => {
        throw error;
      });

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.events$ = mockEvents$;

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.events$).toBe(mockEngine.events$);
    });

    it('should handle unexpected error types', async () => {
      // Simulate non-Error throw
      mockEngine.loadConversation.mockImplementation(() => {
        throw 'String error';
      });

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.events$ = mockEvents$;

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('String error');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle conversation with no messages', async () => {
      const emptyConversation = createConversation({
        id: 'empty-conv',
        title: 'Empty Conversation',
        tags: [],
        businessName: 'Test Business',
        businessPhoneNumber: '+1234567890',
        userPhoneNumber: '+0987654321',
        language: 'en',
        estimatedDuration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: emptyConversation };
      const result = await useCase.execute(request);

      expect(mockEngine.loadConversation).toHaveBeenCalledWith(emptyConversation);
      expect(result.success).toBe(true);
    });

    it('should handle conversation with complex message types', async () => {
      const complexMessages = [
        createMessage({
          id: 'interactive-msg',
          type: 'interactive',
          sender: 'business',
          content: {
            interactive: {
              type: 'button',
              body: 'Choose an option',
              action: {
                buttons: [
                  { id: 'btn1', title: 'Option 1' },
                  { id: 'btn2', title: 'Option 2' }
                ]
              }
            }
          },
          timing: {
            queueAt: new Date(),
            typingDuration: 1500,
            delayBeforeTyping: 500,
          },
        }),
        createMessage({
          id: 'flow-msg',
          type: 'flow',
          sender: 'business',
          content: {
            flow: {
              flowId: 'booking-flow',
              flowToken: 'token-123',
              flowData: { restaurant: 'Test Restaurant' }
            }
          },
          timing: {
            queueAt: new Date(),
            typingDuration: 2000,
            delayBeforeTyping: 1000,
          },
        }),
      ];

      const complexConversation = createConversation(
        testConversation.metadata,
        complexMessages
      );

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: complexConversation };
      const result = await useCase.execute(request);

      expect(mockEngine.loadConversation).toHaveBeenCalledWith(complexConversation);
      expect(result.success).toBe(true);
    });

    it('should handle conversation with custom settings', async () => {
      const customSettings = {
        playbackSpeed: 2.0,
        autoAdvance: false,
        showTypingIndicators: false,
        debugMode: true,
      };

      const customConversation = createConversation(
        testConversation.metadata,
        testConversation.messages,
        customSettings
      );

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: customConversation };
      const result = await useCase.execute(request);

      expect(mockEngine.loadConversation).toHaveBeenCalledWith(customConversation);
      expect(result.success).toBe(true);
    });
  });

  describe('Observable Behavior', () => {
    it('should return proper observable for events', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
        [Symbol.observable]: () => mockEvents$,
      } as any;

      mockEngine.play.mockReturnValue(mockEvents$);

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      expect(result.events$).toBe(mockEvents$);
      expect(typeof result.events$.pipe).toBe('function');
      expect(typeof result.events$.subscribe).toBe('function');
    });

    it('should provide engine events stream when not auto-starting', async () => {
      const mockEvents$ = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
        [Symbol.observable]: () => mockEvents$,
      } as any;

      mockEngine.events$ = mockEvents$;

      const request = {
        conversation: testConversation,
        autoStart: false
      };
      const result = await useCase.execute(request);

      expect(result.events$).toBe(mockEngine.events$);
    });
  });

  describe('Performance Considerations', () => {
    it('should complete execution quickly for simple conversations', async () => {
      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.play.mockReturnValue(mockEvents$);

      const startTime = performance.now();

      const request = { conversation: testConversation };
      const result = await useCase.execute(request);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10); // Should execute in under 10ms
      expect(result.success).toBe(true);
    });

    it('should handle large conversations efficiently', async () => {
      // Create conversation with many messages
      const largeMessages = Array.from({ length: 100 }, (_, i) =>
        createMessage({
          id: `msg-${i}`,
          type: 'text',
          sender: i % 2 === 0 ? 'user' : 'business',
          content: { text: `Message ${i}` },
          timing: {
            queueAt: new Date(Date.now() + i * 1000),
            typingDuration: 1000,
            delayBeforeTyping: 500,
          },
        })
      );

      const largeConversation = createConversation(
        testConversation.metadata,
        largeMessages
      );

      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.play.mockReturnValue(mockEvents$);

      const startTime = performance.now();

      const request = { conversation: largeConversation };
      const result = await useCase.execute(request);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // Should still be fast
      expect(result.success).toBe(true);
      expect(mockEngine.loadConversation).toHaveBeenCalledWith(largeConversation);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined conversations', async () => {
      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.events$ = mockEvents$;

      // Test with null
      const nullRequest = { conversation: null as any };
      let result = await useCase.execute(nullRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Test with undefined
      const undefinedRequest = { conversation: undefined as any };
      result = await useCase.execute(undefinedRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle autoStart with various falsy values', async () => {
      const mockEvents$ = { pipe: jest.fn() } as any;
      mockEngine.events$ = mockEvents$;

      const falsyValues = [false, 0, '', null, undefined];

      for (const falsyValue of falsyValues) {
        mockEngine.play.mockClear();

        const request = {
          conversation: testConversation,
          autoStart: falsyValue as any
        };
        await useCase.execute(request);

        if (falsyValue === false) {
          expect(mockEngine.play).not.toHaveBeenCalled();
        } else {
          // All other falsy values should still trigger autoStart
          expect(mockEngine.play).toHaveBeenCalled();
        }
      }
    });
  });
});