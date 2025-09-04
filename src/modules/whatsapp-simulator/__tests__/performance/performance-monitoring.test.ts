/**
 * Performance Monitoring Tests
 * Tests for performance characteristics and optimizations
 */

import { performance } from 'perf_hooks';

import { createConversationEngine } from '../../application/engines/conversation-engine';
import { createConversation,createMessage } from '../../domain/entities';

// Mock Web APIs for performance testing
global.performance = performance as any;

describe('WhatsApp Simulator Performance', () => {
  let originalRequestAnimationFrame: typeof requestAnimationFrame;
  let originalCancelAnimationFrame: typeof cancelAnimationFrame;
  let rafCallbacks: Function[] = [];
  let rafId = 0;

  beforeAll(() => {
    // Mock requestAnimationFrame for consistent timing
    originalRequestAnimationFrame = global.requestAnimationFrame;
    originalCancelAnimationFrame = global.cancelAnimationFrame;

    global.requestAnimationFrame = jest.fn((callback: Function) => {
      const id = ++rafId;
      rafCallbacks.push(() => callback(performance.now()));
      return id;
    });

    global.cancelAnimationFrame = jest.fn((id: number) => {
      // Simple mock implementation
    });
  });

  afterAll(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    jest.clearAllMocks();
  });

  describe('Component Loading Performance', () => {
    it('should load main simulator component efficiently', async () => {
      const startTime = performance.now();

      // Dynamically import the component to measure load time
      const { WhatsAppSimulator } = await import('../../presentation/components/whatsapp-simulator');

      const loadTime = performance.now() - startTime;

      // Component should load quickly (under 50ms)
      expect(loadTime).toBeLessThan(50);
      expect(WhatsAppSimulator).toBeDefined();
    });

    it('should lazy-load heavy dependencies', async () => {
      const startTime = performance.now();

      // Test lazy loading of GIF export functionality
      const gifExportModule = await import('../../infrastructure/services/gif-export');

      const loadTime = performance.now() - startTime;

      // Should load reasonably fast even with heavy dependencies
      expect(loadTime).toBeLessThan(100);
      expect(gifExportModule.gifExportService).toBeDefined();
    });

    it('should efficiently import core entities', async () => {
      const startTime = performance.now();

      const entitiesModule = await import('../../domain/entities');

      const loadTime = performance.now() - startTime;

      // Core entities should load very quickly
      expect(loadTime).toBeLessThan(10);
      expect(entitiesModule.Message).toBeDefined();
      expect(entitiesModule.Conversation).toBeDefined();
    });
  });

  describe('Animation Performance', () => {
    it('should maintain efficient animation frame usage', () => {
      // Simulate multiple animation requests
      const callbacks = [];

      for (let i = 0; i < 100; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        requestAnimationFrame(callback);
      }

      // Execute all queued animation frames
      rafCallbacks.forEach(cb => cb());

      // Verify RAF was called efficiently
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(100);

      // All callbacks should be executable
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should optimize animation timing calculations', () => {
      const startTime = performance.now();

      // Simulate timing calculations like those used in the simulator
      const messageTimings = [];

      for (let i = 0; i < 1000; i++) {
        const delayBeforeTyping = 1000;
        const typingDuration = 2000;
        const totalTime = delayBeforeTyping + typingDuration;

        messageTimings.push({
          index: i,
          delay: delayBeforeTyping,
          duration: typingDuration,
          total: totalTime,
        });
      }

      const calculationTime = performance.now() - startTime;

      // Should calculate timings quickly even for many messages
      expect(calculationTime).toBeLessThan(10);
      expect(messageTimings).toHaveLength(1000);
    });

    it('should handle frame rate throttling efficiently', () => {
      const frameRates = [15, 24, 30, 60];

      frameRates.forEach(targetFPS => {
        const frameInterval = 1000 / targetFPS;
        const startTime = performance.now();

        // Simulate frame rate calculations
        const frames = [];
        let lastFrameTime = 0;

        for (let i = 0; i < 100; i++) {
          const currentTime = i * frameInterval;
          if (currentTime - lastFrameTime >= frameInterval) {
            frames.push({
              time: currentTime,
              interval: currentTime - lastFrameTime,
            });
            lastFrameTime = currentTime;
          }
        }

        const calculationTime = performance.now() - startTime;

        // Should maintain consistent timing calculations
        expect(calculationTime).toBeLessThan(5);
        expect(frames.length).toBeGreaterThan(0);

        // Verify frame intervals are consistent
        frames.slice(1).forEach((frame, index) => {
          const expectedInterval = frameInterval;
          const actualInterval = frame.interval;
          expect(Math.abs(actualInterval - expectedInterval)).toBeLessThan(1);
        });
      });
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should efficiently manage message state', () => {
      // Simulate large conversation with many messages
      const { Message } = require('../../domain/entities/message');

      const messages = [];
      const startMemory = process.memoryUsage().heapUsed;

      // Create many messages to test memory usage
      for (let i = 0; i < 1000; i++) {
        const message = createMessage({
          id: `msg-${i}`,
          type: 'text',
          sender: i % 2 === 0 ? 'user' : 'business',
          content: { text: `Message ${i}` },
          timing: {
            queueAt: new Date(),
            delayBeforeTyping: 1000,
            typingDuration: 2000,
          },
        });
        messages.push(message);
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      const bytesPerMessage = memoryIncrease / messages.length;

      // Each message should use reasonable memory (less than 1KB per message)
      expect(bytesPerMessage).toBeLessThan(1024);

      // Cleanup
      messages.length = 0;
    });

    it('should properly cleanup resources in conversation engine', () => {
      const { ConversationEngine } = require('../../application/engines/conversation-engine');

      const engines = [];
      const startMemory = process.memoryUsage().heapUsed;

      // Create and destroy multiple engines
      for (let i = 0; i < 10; i++) {
        const engine = createConversationEngine();
        engines.push(engine);

        // Use the engine briefly
        engine.getCurrentState();

        // Destroy it
        engine.destroy();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be minimal after cleanup
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB total
    });

    it('should optimize DOM manipulation for large conversations', () => {
      // Mock DOM operations
      const mockElements = [];
      let operationCount = 0;

      const mockDOMOperations = {
        createElement: jest.fn(() => {
          operationCount++;
          const element = { children: [], appendChild: jest.fn() };
          mockElements.push(element);
          return element;
        }),

        appendChild: jest.fn(() => {
          operationCount++;
        }),

        removeChild: jest.fn(() => {
          operationCount++;
        })
      };

      const startTime = performance.now();

      // Simulate rendering many messages
      for (let i = 0; i < 100; i++) {
        const messageElement = mockDOMOperations.createElement();
        mockDOMOperations.appendChild();

        // Simulate some messages being removed (virtualization)
        if (i > 20) {
          mockDOMOperations.removeChild();
        }
      }

      const renderTime = performance.now() - startTime;

      // DOM operations should be efficient
      expect(renderTime).toBeLessThan(50);
      expect(operationCount).toBeLessThan(500); // Reasonable number of operations
    });
  });

  describe('Bundle Size and Code Splitting', () => {
    it('should keep core bundle size reasonable', async () => {
      // Test that main components don't pull in unnecessary dependencies
      const coreModules = [
        '../../domain/entities',
        '../../presentation/hooks/use-conversation-flow',
        '../../presentation/components/whatsapp-simulator',
      ];

      const importSizes = [];

      for (const modulePath of coreModules) {
        const startTime = performance.now();
        const module = await import(modulePath);
        const loadTime = performance.now() - startTime;

        importSizes.push({
          module: modulePath,
          loadTime,
          exports: Object.keys(module).length,
        });
      }

      // All core modules should load quickly
      importSizes.forEach(({ loadTime, module }) => {
        expect(loadTime).toBeLessThan(100);
      });

      // Should have reasonable number of exports (not overly complex)
      const totalExports = importSizes.reduce((sum, { exports }) => sum + exports, 0);
      expect(totalExports).toBeLessThan(50);
    });

    it('should properly isolate heavy dependencies', async () => {
      // GIF export should be separate from main bundle
      const lightModules = [
        '../../domain/entities',
        '../../application/use-cases',
      ];

      const heavyModules = [
        '../../infrastructure/services/gif-export',
      ];

      const lightLoadTimes = [];
      for (const modulePath of lightModules) {
        const startTime = performance.now();
        await import(modulePath);
        const loadTime = performance.now() - startTime;
        lightLoadTimes.push(loadTime);
      }

      const heavyLoadTimes = [];
      for (const modulePath of heavyModules) {
        const startTime = performance.now();
        await import(modulePath);
        const loadTime = performance.now() - startTime;
        heavyLoadTimes.push(loadTime);
      }

      // Light modules should load much faster than heavy ones
      const avgLightLoad = lightLoadTimes.reduce((a, b) => a + b, 0) / lightLoadTimes.length;
      const avgHeavyLoad = heavyLoadTimes.reduce((a, b) => a + b, 0) / heavyLoadTimes.length;

      expect(avgLightLoad).toBeLessThan(avgHeavyLoad);
    });
  });

  describe('Real-time Performance', () => {
    it('should maintain consistent performance during playback', async () => {
      jest.useFakeTimers();

      const { ConversationEngine } = require('../../application/engines/conversation-engine');
      const { Conversation, Message } = require('../../domain/entities');

      // Create test conversation
      const messages = Array.from({ length: 50 }, (_, i) => createMessage({
        id: `msg-${i}`,
        type: 'text',
        sender: i % 2 === 0 ? 'user' : 'business',
        content: { text: `Message ${i}` },
        timing: {
          queueAt: new Date(Date.now() + i * 1000),
          delayBeforeTyping: 500,
          typingDuration: 1000,
        },
      }));

      const conversation = createConversation(
        {
          id: 'perf-test',
          title: 'Performance Test',
          tags: [],
          businessName: 'Test',
          businessPhoneNumber: '+1234567890',
          userPhoneNumber: '+0987654321',
          language: 'en',
          estimatedDuration: 60000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        messages
      );

      const engine = createConversationEngine({ enableDebug: false });

      // Measure performance during playback
      const performanceMarks = [];

      engine.loadConversation(conversation);

      const playbackStart = performance.now();
      engine.play();

      // Simulate time progression and measure performance
      for (let i = 0; i < 10; i++) {
        const markStart = performance.now();
        jest.advanceTimersByTime(1000);
        const markEnd = performance.now();

        performanceMarks.push(markEnd - markStart);
      }

      const averageFrameTime = performanceMarks.reduce((a, b) => a + b, 0) / performanceMarks.length;

      // Should maintain consistent performance (under 16ms per frame for 60fps)
      expect(averageFrameTime).toBeLessThan(16);

      engine.destroy();
      jest.useRealTimers();
    });

    it('should handle concurrent operations efficiently', async () => {
      const { ConversationEngine } = require('../../application/engines/conversation-engine');

      const engines = [];
      const operations = [];

      const startTime = performance.now();

      // Create multiple engines and perform concurrent operations
      for (let i = 0; i < 5; i++) {
        const engine = createConversationEngine({ enableDebug: false });
        engines.push(engine);

        // Queue various operations
        operations.push(
          Promise.resolve().then(() => engine.getCurrentState()),
          Promise.resolve().then(() => engine.setSpeed(1.5)),
          Promise.resolve().then(() => engine.getCurrentState())
        );
      }

      await Promise.all(operations);

      const operationTime = performance.now() - startTime;

      // All concurrent operations should complete quickly
      expect(operationTime).toBeLessThan(100);

      // Cleanup
      engines.forEach(engine => engine.destroy());
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance regressions in entity operations', () => {
      const { Message } = require('../../domain/entities/message');

      // Benchmark message operations
      const iterations = 1000;
      const operations = [
        () => createMessage({
          id: 'test',
          type: 'text',
          sender: 'user',
          content: { text: 'test' },
          timing: {
            queueAt: new Date(),
            delayBeforeTyping: 1000,
            typingDuration: 2000,
          },
        }),
        (msg: any) => msg.updateStatus('sent'),
        (msg: any) => msg.getDisplayText(),
        (msg: any) => msg.getTotalAnimationTime(),
        (msg: any) => msg.toJSON(),
      ];

      const benchmarks = operations.map((operation, index) => {
        const messages = [];
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          if (index === 0) {
            // Creation
            const msg = operation();
            messages.push(msg);
          } else {
            // Other operations need a message instance
            if (messages.length === 0) {
              messages.push(createMessage({
                id: `test-${i}`,
                type: 'text',
                sender: 'user',
                content: { text: `test ${i}` },
                timing: {
                  queueAt: new Date(),
                  delayBeforeTyping: 1000,
                  typingDuration: 2000,
                },
              }));
            }
            operation(messages[0]);
          }
        }

        const endTime = performance.now();
        return {
          operation: index,
          totalTime: endTime - startTime,
          avgTime: (endTime - startTime) / iterations,
        };
      });

      // Performance thresholds (adjust based on acceptable performance)
      const maxAvgTimes = [
        0.1, // Message creation: 0.1ms
        0.05, // Status update: 0.05ms
        0.05, // Get display text: 0.05ms
        0.05, // Get animation time: 0.05ms
        0.1, // JSON serialization: 0.1ms
      ];

      benchmarks.forEach((benchmark, index) => {
        expect(benchmark.avgTime).toBeLessThan(maxAvgTimes[index]);
      });
    });

    it('should maintain acceptable performance under load', () => {
      const { ConversationEngine } = require('../../application/engines/conversation-engine');

      // Create engine and stress test it
      const engine = createConversationEngine({ enableDebug: false });

      const startTime = performance.now();

      // Perform many rapid operations
      for (let i = 0; i < 1000; i++) {
        engine.getCurrentState();
        engine.setSpeed(1.0 + (i % 10) * 0.1);
        engine.jumpTo(i % 10);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle load without significant performance degradation
      expect(totalTime).toBeLessThan(500); // Under 500ms for 1000 operations

      engine.destroy();
    });
  });
});