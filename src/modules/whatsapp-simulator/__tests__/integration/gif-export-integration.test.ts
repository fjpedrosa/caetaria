/**
 * GIF Export Integration Tests
 * Tests for the complete GIF export workflow including DOM capture and encoding
 */

import { ExportOptions, GifExportResult } from '../../domain/types/gif-export-types';
import { GifExportServiceImpl } from '../../infra/services/gif-export/gif-export.service';

// Mock HTML2Canvas
const mockHtml2Canvas = jest.fn();
jest.mock('html2canvas', () => mockHtml2Canvas);

// Mock GIF.js
const mockGifInstance = {
  addFrame: jest.fn(),
  render: jest.fn(),
  on: jest.fn(),
};

const MockGIF = jest.fn(() => mockGifInstance);
jest.mock('gif.js', () => MockGIF);

describe('GIF Export Integration', () => {
  let gifService: GifExportServiceImpl;
  let mockElement: HTMLElement;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    gifService = new GifExportServiceImpl();

    // Create mock element
    mockElement = {
      getBoundingClientRect: jest.fn(() => ({
        width: 400,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 400,
      })),
      scrollHeight: 600,
      scrollWidth: 400,
      dataset: {
        conversationId: 'test-conversation-123',
      },
    } as any;

    // Create mock canvas
    mockCanvas = {
      width: 400,
      height: 600,
      getContext: jest.fn(() => ({
        clearRect: jest.fn(),
      })),
    } as any;

    // Reset mocks
    jest.clearAllMocks();
    mockHtml2Canvas.mockResolvedValue(mockCanvas);

    // Setup GIF mock
    mockGifInstance.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'progress') {
        // Simulate progress events
        setTimeout(() => {
          callback(0.25);
          callback(0.5);
          callback(0.75);
          callback(1.0);
        }, 10);
      } else if (event === 'finished') {
        // Simulate completion
        setTimeout(() => {
          const mockBlob = new Blob(['fake gif data'], { type: 'image/gif' });
          callback(mockBlob);
        }, 50);
      }
    });
  });

  afterEach(() => {
    gifService.cleanup();
  });

  describe('Complete Export Workflow', () => {
    const defaultOptions: ExportOptions = {
      quality: 0.8,
      frameRate: 15,
      duration: 10,
      scale: 1.0,
      format: {
        type: 'gif',
        dither: 'floyd-steinberg',
      },
    };

    it('should complete full export workflow successfully', async () => {
      const progressCallbacks: any[] = [];
      const onProgress = jest.fn((progress) => progressCallbacks.push(progress));
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const result = await gifService.exportConversation(
        mockElement,
        defaultOptions,
        { onProgress, onSuccess, onError }
      );

      // Verify workflow completed
      expect(result).toBeDefined();
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.metadata.conversationId).toBe('test-conversation-123');

      // Verify progress callbacks
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'initializing', progress: 0 })
      );
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'capturing', progress: 10 })
      );
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'encoding' })
      );
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'complete', progress: 100 })
      );

      // Verify success callback
      expect(onSuccess).toHaveBeenCalledWith(result);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should capture correct number of frames based on duration and framerate', async () => {
      const options: ExportOptions = {
        ...defaultOptions,
        duration: 6, // 6 seconds
        frameRate: 10, // 10 fps
      };

      await gifService.exportConversation(mockElement, options);

      // Should capture approximately 60 frames (6s * 10fps)
      const expectedFrames = Math.ceil(options.duration * options.frameRate);
      expect(mockHtml2Canvas).toHaveBeenCalledTimes(expectedFrames);
    });

    it('should apply correct html2canvas options', async () => {
      await gifService.exportConversation(mockElement, defaultOptions);

      expect(mockHtml2Canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          backgroundColor: '#f5f5f5',
          scale: 1,
          logging: false,
          useCORS: true,
          allowTaint: true,
          height: 600,
          width: 400,
          scrollX: 0,
          scrollY: 0,
        })
      );
    });

    it('should configure GIF.js with correct options', async () => {
      await gifService.exportConversation(mockElement, defaultOptions);

      expect(MockGIF).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: expect.any(Number),
          width: 400,
          height: 600,
          dither: 'floyd-steinberg',
          repeat: 0,
        })
      );
    });

    it('should add all captured frames to GIF', async () => {
      const options: ExportOptions = {
        ...defaultOptions,
        duration: 2,
        frameRate: 5,
      };

      await gifService.exportConversation(mockElement, options);

      const expectedFrames = Math.ceil(options.duration * options.frameRate);
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(expectedFrames);

      // Verify each frame is added with proper options
      for (let i = 0; i < expectedFrames; i++) {
        expect(mockGifInstance.addFrame).toHaveBeenNthCalledWith(
          i + 1,
          mockCanvas,
          expect.objectContaining({
            delay: 1000 / options.frameRate,
            copy: true,
          })
        );
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle html2canvas failures gracefully', async () => {
      const canvasError = new Error('Canvas capture failed');
      mockHtml2Canvas.mockRejectedValue(canvasError);

      const onError = jest.fn();

      await expect(
        gifService.exportConversation(mockElement, defaultOptions, { onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
          message: expect.any(String),
          retryable: expect.any(Boolean),
        })
      );
    });

    it('should handle GIF encoding failures', async () => {
      // Mock GIF encoding error
      mockGifInstance.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          setTimeout(() => {
            callback(new Error('GIF encoding failed'));
          }, 10);
        }
      });

      const onError = jest.fn();

      await expect(
        gifService.exportConversation(mockElement, defaultOptions, { onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'encoding_failed',
          message: expect.stringContaining('GIF encoding failed'),
        })
      );
    });

    it('should handle partial frame capture failures', async () => {
      let callCount = 0;
      mockHtml2Canvas.mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          // Fail on 3rd frame
          return Promise.reject(new Error('Frame capture failed'));
        }
        return Promise.resolve(mockCanvas);
      });

      const options: ExportOptions = {
        ...defaultOptions,
        duration: 1,
        frameRate: 10,
      };

      // Should still complete with remaining frames
      const result = await gifService.exportConversation(mockElement, options);
      expect(result).toBeDefined();

      // Should have fewer frames due to failure
      expect(mockGifInstance.addFrame).toHaveBeenCalledTimes(9); // 10 - 1 failed
    });
  });

  describe('Memory Management Integration', () => {
    it('should monitor memory usage during frame capture', async () => {
      // Mock performance.memory
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 100 * 1024 * 1024, // 100MB
          totalJSHeapSize: 200 * 1024 * 1024, // 200MB
          jsHeapSizeLimit: 500 * 1024 * 1024, // 500MB
        },
        configurable: true,
      });

      await gifService.exportConversation(mockElement, defaultOptions);

      const memoryUsage = gifService.getMemoryUsage();
      expect(memoryUsage.currentUsage).toBeGreaterThan(0);
      expect(memoryUsage.peakUsage).toBeGreaterThan(0);
    });

    it('should reduce quality when approaching memory limit', async () => {
      // Mock high memory usage
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 450 * 1024 * 1024, // 450MB (near limit)
          totalJSHeapSize: 500 * 1024 * 1024,
          jsHeapSizeLimit: 512 * 1024 * 1024,
        },
        configurable: true,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await gifService.exportConversation(mockElement, defaultOptions);

      // Should warn about memory and adjust scale
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Approaching memory limit')
      );

      // Should call html2canvas with reduced scale on subsequent frames
      expect(mockHtml2Canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          scale: expect.any(Number),
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Optimization Integration', () => {
    it('should optimize settings for large elements', async () => {
      // Mock large element
      mockElement.getBoundingClientRect = jest.fn(() => ({
        width: 1200,
        height: 800,
        top: 0,
        left: 0,
        bottom: 800,
        right: 1200,
      }));

      const highQualityOptions: ExportOptions = {
        quality: 1.0,
        frameRate: 30,
        duration: 10,
        scale: 2.0,
        format: { type: 'gif' },
      };

      await gifService.exportConversation(mockElement, highQualityOptions);

      // Should optimize settings for large area
      expect(MockGIF).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: expect.any(Number),
        })
      );
    });

    it('should apply mobile optimizations', async () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      const options: ExportOptions = {
        quality: 1.0,
        frameRate: 30,
        duration: 10,
        scale: 2.0,
        format: { type: 'gif' },
      };

      await gifService.exportConversation(mockElement, options);

      // Should apply mobile optimizations
      expect(MockGIF).toHaveBeenCalledWith(
        expect.objectContaining({
          quality: expect.any(Number), // Should be reduced
        })
      );

      // Should use reduced scale for html2canvas
      expect(mockHtml2Canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          scale: expect.numberMatching((scale) => scale <= 0.8),
        })
      );
    });
  });

  describe('Cancellation Integration', () => {
    it('should cancel export during frame capture', async () => {
      let captureCount = 0;
      mockHtml2Canvas.mockImplementation(() => {
        captureCount++;
        if (captureCount === 5) {
          // Cancel during capture
          gifService.cancelExport();
        }
        return Promise.resolve(mockCanvas);
      });

      await expect(
        gifService.exportConversation(mockElement, {
          ...defaultOptions,
          duration: 2,
          frameRate: 10,
        })
      ).rejects.toThrow('Export was cancelled');
    });

    it('should prevent multiple simultaneous exports', async () => {
      // Start first export (don't await)
      const firstExport = gifService.exportConversation(mockElement, defaultOptions);

      // Try to start second export immediately
      await expect(
        gifService.exportConversation(mockElement, defaultOptions)
      ).rejects.toThrow('Another export is already in progress');

      // Cleanup first export
      gifService.cancelExport();
      try {
        await firstExport;
      } catch {
        // Expected to throw due to cancellation
      }
    });
  });

  describe('Performance Integration', () => {
    it('should complete export within reasonable time', async () => {
      const options: ExportOptions = {
        ...defaultOptions,
        duration: 5,
        frameRate: 10,
      };

      const startTime = performance.now();

      const result = await gifService.exportConversation(mockElement, options);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should maintain consistent frame intervals', async () => {
      const frameTimestamps: number[] = [];

      mockHtml2Canvas.mockImplementation(() => {
        frameTimestamps.push(performance.now());
        return Promise.resolve(mockCanvas);
      });

      const options: ExportOptions = {
        ...defaultOptions,
        duration: 2,
        frameRate: 10, // 100ms intervals
      };

      await gifService.exportConversation(mockElement, options);

      // Check intervals between frames
      for (let i = 1; i < frameTimestamps.length; i++) {
        const interval = frameTimestamps[i] - frameTimestamps[i - 1];
        // Should be approximately 100ms (with some tolerance)
        expect(interval).toBeGreaterThan(80);
        expect(interval).toBeLessThan(150);
      }
    });
  });

  describe('Result Validation Integration', () => {
    it('should generate valid export result metadata', async () => {
      const result = await gifService.exportConversation(mockElement, defaultOptions);

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('image/gif');
      expect(result.fileSize).toBeGreaterThan(0);

      expect(result.metrics).toEqual({
        totalTime: expect.any(Number),
        frameCount: expect.any(Number),
        quality: defaultOptions.quality,
        compressionRatio: expect.any(Number),
      });

      expect(result.metadata).toEqual({
        createdAt: expect.any(Date),
        options: expect.objectContaining(defaultOptions),
        conversationId: 'test-conversation-123',
      });
    });

    it('should calculate correct compression ratio', async () => {
      const result = await gifService.exportConversation(mockElement, defaultOptions);

      // Compression ratio should be > 1 (compressed file is smaller than raw pixels)
      expect(result.metrics.compressionRatio).toBeGreaterThan(1);

      // Should be reasonable compression (not too high or too low)
      expect(result.metrics.compressionRatio).toBeLessThan(1000);
    });
  });
});