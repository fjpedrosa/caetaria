/**
 * GIF Export Service
 * Main service for exporting WhatsApp conversations as animated GIFs
 */

import GIF from 'gif.js';
import html2canvas from 'html2canvas';

import {
  ErrorCallback,
  ExportOptions,
  Frame,
  GifExportError,
  GifExportResult,
  GifExportService,
  GifGenerationProgress,
  MemoryMonitor,
  ProgressCallback,
  SuccessCallback
} from '../../../domain/types/gif-export-types';

interface GifExportState {
  isExporting: boolean;
  currentOperation: AbortController | null;
  memoryMonitor: MemoryMonitor;
}

/**
 * GIF Export Service Factory
 * Creates a functional GIF export service instance
 */
export const createGifExportService = (): GifExportService => {
  const state: GifExportState = {
    isExporting: false,
    currentOperation: null,
    memoryMonitor: {
      currentUsage: 0,
      peakUsage: 0,
      limit: 512, // 512MB default limit
      nearLimit: false
    }
  };

  // Helper functions
  const createError = (
    type: GifExportError['type'],
    message: string,
    details?: any
  ): GifExportError => {
    const suggestions: string[] = [];

    switch (type) {
      case 'capture_failed':
        suggestions.push('Try reducing the scale or quality settings');
        suggestions.push('Ensure the element is visible and properly rendered');
        break;
      case 'encoding_failed':
        suggestions.push('Try reducing the number of frames or quality');
        suggestions.push('Check if there\'s enough available memory');
        break;
      case 'memory_limit':
        suggestions.push('Reduce the duration or scale of the export');
        suggestions.push('Try closing other browser tabs to free memory');
        break;
      case 'timeout':
        suggestions.push('Try reducing the duration or frame rate');
        suggestions.push('Ensure stable network connection if using external resources');
        break;
    }

    return {
      type,
      message,
      details,
      suggestions,
      retryable: type !== 'invalid_options'
    };
  };

  const handleError = (error: any): GifExportError => {
    if (error.name === 'AbortError') {
      return createError('export_cancelled', 'Export was cancelled by user');
    }

    if (error.type) {
      return error as GifExportError;
    }

    // Try to categorize unknown errors
    const message = error.message || String(error);

    if (message.includes('memory') || message.includes('heap')) {
      return createError('memory_limit', message);
    }

    if (message.includes('timeout') || message.includes('network')) {
      return createError('timeout', message);
    }

    return createError('unknown', message, error);
  };

  const validateExportOptions = (options: ExportOptions): void => {
    if (options.quality < 0.1 || options.quality > 1.0) {
      throw createError('invalid_options', 'Quality must be between 0.1 and 1.0');
    }
    if (options.frameRate < 5 || options.frameRate > 30) {
      throw createError('invalid_options', 'Frame rate must be between 5 and 30 fps');
    }
    if (options.duration < 5 || options.duration > 60) {
      throw createError('invalid_options', 'Duration must be between 5 and 60 seconds');
    }
    if (options.scale < 0.5 || options.scale > 2.0) {
      throw createError('invalid_options', 'Scale must be between 0.5 and 2.0');
    }
  };

  const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const optimizeExportOptions = (options: ExportOptions, element: HTMLElement): ExportOptions => {
    const optimized = { ...options };

    // Get element dimensions
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height * options.scale;

    // Adjust quality based on area
    if (area > 500000) { // Large area
      optimized.quality = Math.min(optimized.quality, 0.7);
      optimized.frameRate = Math.min(optimized.frameRate, 15);
    }

    // Mobile optimization
    if (isMobileDevice()) {
      optimized.quality = Math.min(optimized.quality, 0.6);
      optimized.frameRate = Math.min(optimized.frameRate, 12);
      optimized.scale = Math.min(optimized.scale, 0.8);
    }

    return optimized;
  };

  const startMemoryMonitoring = (): void => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      state.memoryMonitor.currentUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
      state.memoryMonitor.peakUsage = Math.max(state.memoryMonitor.peakUsage, state.memoryMonitor.currentUsage);
      state.memoryMonitor.nearLimit = state.memoryMonitor.currentUsage > (state.memoryMonitor.limit * 0.8);
    }
  };

  const updateMemoryUsage = (): void => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      state.memoryMonitor.currentUsage = memory.usedJSHeapSize / (1024 * 1024);
      state.memoryMonitor.peakUsage = Math.max(state.memoryMonitor.peakUsage, state.memoryMonitor.currentUsage);
      state.memoryMonitor.nearLimit = state.memoryMonitor.currentUsage > (state.memoryMonitor.limit * 0.8);
    }
  };

  const calculateCompressionRatio = (frames: Frame[], blob: Blob): number => {
    const uncompressedSize = frames.reduce((total, frame) => {
      return total + (frame.canvas.width * frame.canvas.height * 4); // 4 bytes per pixel
    }, 0);

    return uncompressedSize / blob.size;
  };

  const calculateProcessingSpeed = (progress: number, totalFrames: number): number => {
    const processedFrames = Math.floor(progress * totalFrames);
    const timeElapsed = (Date.now() - performance.now()) / 1000; // seconds
    return processedFrames / Math.max(timeElapsed, 1);
  };

  // Public API implementation
  const exportConversation = async (
    element: HTMLElement,
    options: ExportOptions,
    callbacks?: {
      onProgress?: ProgressCallback;
      onError?: ErrorCallback;
      onSuccess?: SuccessCallback;
    }
  ): Promise<GifExportResult> => {
    if (state.isExporting) {
      throw createError('export_in_progress', 'Another export is already in progress');
    }

    state.isExporting = true;
    state.currentOperation = new AbortController();

    try {
      // Initialize
      callbacks?.onProgress?.({
        stage: 'initializing',
        progress: 0,
        message: 'Preparing export...'
      });

      // Validate options
      validateExportOptions(options);

      // Calculate optimal settings if needed
      const optimizedOptions = optimizeExportOptions(options, element);

      // Capture frames
      callbacks?.onProgress?.({
        stage: 'capturing',
        progress: 10,
        message: 'Capturing frames...'
      });

      const frames = await captureFrames(
        element,
        optimizedOptions.duration,
        optimizedOptions.frameRate,
        optimizedOptions
      );

      if (state.currentOperation.signal.aborted) {
        throw createError('export_cancelled', 'Export was cancelled');
      }

      // Generate GIF
      callbacks?.onProgress?.({
        stage: 'encoding',
        progress: 60,
        message: 'Encoding GIF...',
        totalFrames: frames.length
      });

      const blob = await generateGif(frames, optimizedOptions, (progress) => {
        callbacks?.onProgress?.({
          stage: 'encoding',
          progress: 60 + (progress.progress * 0.3), // 60-90%
          currentFrame: progress.currentFrame,
          totalFrames: progress.totalFrames,
          message: `Encoding frame ${progress.currentFrame}/${progress.totalFrames}...`
        });
      });

      // Finalize
      callbacks?.onProgress?.({
        stage: 'finalizing',
        progress: 95,
        message: 'Finalizing export...'
      });

      const result: GifExportResult = {
        blob,
        fileSize: blob.size,
        metrics: {
          totalTime: Date.now() - performance.now(),
          frameCount: frames.length,
          quality: optimizedOptions.quality,
          compressionRatio: calculateCompressionRatio(frames, blob)
        },
        metadata: {
          createdAt: new Date(),
          options: optimizedOptions,
          conversationId: element.dataset.conversationId
        }
      };

      callbacks?.onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Export complete!'
      });

      callbacks?.onSuccess?.(result);
      return result;

    } catch (error) {
      const gifError = handleError(error);
      callbacks?.onError?.(gifError);
      throw gifError;
    } finally {
      state.isExporting = false;
      state.currentOperation = null;
      cleanup();
    }
  };

  const captureFrames = async (
    element: HTMLElement,
    duration: number,
    frameRate: number,
    options?: Partial<ExportOptions>
  ): Promise<Frame[]> => {
    const frames: Frame[] = [];
    const frameInterval = 1000 / frameRate; // ms between frames
    const totalFrames = Math.ceil(duration * frameRate);

    // Prepare capture options
    const captureOptions: html2canvas.Options = {
      backgroundColor: '#f5f5f5',
      scale: options?.scale || 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0
    };

    // Start memory monitoring
    startMemoryMonitoring();

    try {
      for (let i = 0; i < totalFrames; i++) {
        if (state.currentOperation?.signal.aborted) {
          break;
        }

        // Check memory usage
        if (state.memoryMonitor.nearLimit) {
          console.warn('Approaching memory limit, reducing quality');
          captureOptions.scale = Math.max(0.3, (captureOptions.scale || 1) * 0.8);
        }

        const startTime = performance.now();

        try {
          // Capture frame
          const canvas = await html2canvas(element, captureOptions);

          const frame: Frame = {
            canvas,
            timestamp: Date.now(),
            delay: frameInterval,
            index: i
          };

          frames.push(frame);

          // Update memory usage
          updateMemoryUsage();

          // Wait for next frame interval
          const elapsedTime = performance.now() - startTime;
          const waitTime = Math.max(0, frameInterval - elapsedTime);

          if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }

        } catch (frameError) {
          console.warn(`Failed to capture frame ${i}:`, frameError);
          // Continue with next frame
        }
      }

      if (frames.length === 0) {
        throw createError('capture_failed', 'No frames were captured successfully');
      }

      return frames;

    } catch (error) {
      // Cleanup captured frames
      frames.forEach(frame => {
        const ctx = frame.canvas.getContext('2d');
        ctx?.clearRect(0, 0, frame.canvas.width, frame.canvas.height);
      });
      throw error;
    }
  };

  const generateGif = async (
    frames: Frame[],
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (frames.length === 0) {
        reject(createError('encoding_failed', 'No frames to encode'));
        return;
      }

      const gif = new GIF({
        workers: Math.min(4, navigator.hardwareConcurrency || 2),
        quality: Math.round((1 - options.quality) * 20), // GIF.js uses inverted quality scale
        width: frames[0].canvas.width,
        height: frames[0].canvas.height,
        workerScript: '/gif.worker.js', // Fallback to CDN if not available
        dither: options.format?.dither || 'floyd-steinberg',
        repeat: 0, // Infinite loop
        transparent: null
      });

      // Add progress listener
      gif.on('progress', (progress: number) => {
        onProgress?.({
          stage: 'encoding',
          progress: Math.round(progress * 100),
          currentFrame: Math.floor(progress * frames.length),
          totalFrames: frames.length,
          processingSpeed: calculateProcessingSpeed(progress, frames.length)
        });
      });

      // Handle completion
      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      // Handle errors
      gif.on('error', (error: Error) => {
        reject(createError('encoding_failed', `GIF encoding failed: ${error.message}`, error));
      });

      // Add frames to GIF
      try {
        frames.forEach((frame, index) => {
          gif.addFrame(frame.canvas, {
            delay: frame.delay,
            copy: true
          });
        });

        // Start rendering
        gif.render();

      } catch (error) {
        reject(createError('encoding_failed', `Failed to add frames: ${error}`, error));
      }
    });
  };

  const getMemoryUsage = (): MemoryMonitor => {
    return { ...state.memoryMonitor };
  };

  const cancelExport = (): void => {
    if (state.currentOperation) {
      state.currentOperation.abort();
      state.isExporting = false;
    }
  };

  const cleanup = (): void => {
    state.currentOperation = null;
    state.isExporting = false;

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
  };

  // Return service interface
  return {
    exportConversation,
    captureFrames,
    generateGif,
    getMemoryUsage,
    cancelExport,
    cleanup
  };
};

/**
 * Create default GIF export service instance
 */
export const createDefaultGifExportService = (): GifExportService => {
  return createGifExportService();
};

/**
 * Singleton instance factory - for backward compatibility
 */
export const gifExportService = createGifExportService();