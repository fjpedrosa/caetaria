/**
 * GIF Export Types and Interfaces
 * Comprehensive type definitions for the GIF export functionality
 */

// Type declaration for html2canvas options (to avoid external dependency)
declare namespace html2canvas {
  interface Options {
    allowTaint?: boolean;
    backgroundColor?: string | null;
    canvas?: HTMLCanvasElement;
    foreignObjectRendering?: boolean;
    height?: number;
    ignoreElements?: (element: Element) => boolean;
    imageTimeout?: number;
    logging?: boolean;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    scrollX?: number;
    scrollY?: number;
    useCORS?: boolean;
    width?: number;
    x?: number;
    y?: number;
  }
}

export interface ExportOptions {
  /** Quality setting from 0.1 (lowest) to 1.0 (highest) */
  quality: number;
  /** Frame rate in frames per second (5-30) */
  frameRate: number;
  /** Total duration in seconds (5-60) */
  duration: number;
  /** Resolution scale factor (0.5x - 2x) */
  scale: number;
  /** Delay between frames in milliseconds */
  delay?: number;
  /** Whether to include device frame */
  includeDeviceFrame?: boolean;
  /** Export format specific options */
  format?: ExportFormat;
}

export interface ExportFormat {
  /** Output format type */
  type: 'gif';
  /** Compression level (0-100) */
  compression?: number;
  /** Color palette optimization */
  optimize?: boolean;
  /** Dithering method */
  dither?: 'none' | 'floyd-steinberg' | 'ordered';
}

export interface Frame {
  /** Canvas element containing the frame data */
  canvas: HTMLCanvasElement;
  /** Frame timestamp */
  timestamp: number;
  /** Frame delay in milliseconds */
  delay: number;
  /** Frame sequence number */
  index: number;
}

export interface CaptureMetrics {
  /** Total frames captured */
  totalFrames: number;
  /** Total capture time in milliseconds */
  captureTime: number;
  /** Average time per frame */
  averageFrameTime: number;
  /** Memory usage during capture */
  memoryUsage: number;
}

export interface GifGenerationProgress {
  /** Current stage of generation */
  stage: 'initializing' | 'capturing' | 'encoding' | 'optimizing' | 'finalizing' | 'complete' | 'error';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current frame being processed */
  currentFrame?: number;
  /** Total frames to process */
  totalFrames?: number;
  /** Processing speed (frames per second) */
  processingSpeed?: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Current processing message */
  message?: string;
}

export interface GifExportResult {
  /** Generated GIF as Blob */
  blob: Blob;
  /** File size in bytes */
  fileSize: number;
  /** Generation metrics */
  metrics: {
    /** Total generation time */
    totalTime: number;
    /** Number of frames */
    frameCount: number;
    /** Final quality achieved */
    quality: number;
    /** Compression ratio */
    compressionRatio: number;
  };
  /** Export metadata */
  metadata: {
    /** Creation timestamp */
    createdAt: Date;
    /** Export options used */
    options: ExportOptions;
    /** Source conversation info */
    conversationId?: string;
  };
}

export interface GifExportError {
  /** Error type */
  type: 'capture_failed' | 'encoding_failed' | 'memory_limit' | 'timeout' | 'unknown';
  /** Error message */
  message: string;
  /** Detailed error information */
  details?: any;
  /** Recovery suggestions */
  suggestions?: string[];
  /** Whether the operation can be retried */
  retryable: boolean;
}

export interface MemoryMonitor {
  /** Current memory usage in MB */
  currentUsage: number;
  /** Peak memory usage in MB */
  peakUsage: number;
  /** Memory limit in MB */
  limit: number;
  /** Whether approaching memory limit */
  nearLimit: boolean;
}

export interface DeviceFrameConfig {
  /** Device type */
  deviceType: 'iphone-14' | 'iphone-14-pro' | 'pixel-7' | 'galaxy-s23' | 'custom';
  /** Frame dimensions */
  dimensions: {
    width: number;
    height: number;
    screenX: number;
    screenY: number;
    screenWidth: number;
    screenHeight: number;
  };
  /** Frame styling */
  style: {
    backgroundColor: string;
    borderRadius: number;
    shadow: string;
  };
}

export interface ProgressCallback {
  (progress: GifGenerationProgress): void;
}

export interface ErrorCallback {
  (error: GifExportError): void;
}

export interface SuccessCallback {
  (result: GifExportResult): void;
}

/**
 * Core GIF Export Service Interface
 */
export interface GifExportService {
  /**
   * Export a conversation as an animated GIF
   */
  exportConversation(
    element: HTMLElement,
    options: ExportOptions,
    callbacks?: {
      onProgress?: ProgressCallback;
      onError?: ErrorCallback;
      onSuccess?: SuccessCallback;
    }
  ): Promise<GifExportResult>;

  /**
   * Capture frames from a DOM element during animation
   */
  captureFrames(
    element: HTMLElement,
    duration: number,
    frameRate: number,
    options?: Partial<ExportOptions>
  ): Promise<Frame[]>;

  /**
   * Generate GIF from captured frames
   */
  generateGif(
    frames: Frame[],
    options: ExportOptions,
    onProgress?: ProgressCallback
  ): Promise<Blob>;

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryMonitor;

  /**
   * Cancel ongoing export operation
   */
  cancelExport(): void;

  /**
   * Cleanup resources
   */
  cleanup(): void;
}

/**
 * Capture Utilities Interface
 */
export interface CaptureUtils {
  /**
   * Capture a single frame from DOM element
   */
  captureFrame(
    element: HTMLElement,
    options: html2canvas.Options
  ): Promise<HTMLCanvasElement>;

  /**
   * Optimize canvas for GIF encoding
   */
  optimizeCanvas(
    canvas: HTMLCanvasElement,
    quality: number
  ): HTMLCanvasElement;

  /**
   * Add device frame to canvas
   */
  addDeviceFrame(
    canvas: HTMLCanvasElement,
    config: DeviceFrameConfig
  ): HTMLCanvasElement;

  /**
   * Scale canvas to target dimensions
   */
  scaleCanvas(
    canvas: HTMLCanvasElement,
    scale: number
  ): HTMLCanvasElement;
}

/**
 * Optimization Utilities Interface
 */
export interface OptimizationUtils {
  /**
   * Calculate optimal settings based on content
   */
  calculateOptimalSettings(
    element: HTMLElement,
    constraints: {
      maxFileSize?: number;
      maxDuration?: number;
      targetQuality?: number;
    }
  ): ExportOptions;

  /**
   * Compress GIF blob
   */
  compressGif(
    blob: Blob,
    compressionLevel: number
  ): Promise<Blob>;

  /**
   * Analyze frame differences for optimization
   */
  analyzeFrames(frames: Frame[]): {
    duplicateFrames: number[];
    optimalFrameRate: number;
    recommendedQuality: number;
  };

  /**
   * Optimize color palette
   */
  optimizeColorPalette(
    frames: Frame[],
    maxColors: number
  ): Frame[];
}

/**
 * Export presets for common use cases
 */
export const EXPORT_PRESETS = {
  /** High quality for presentations */
  HIGH_QUALITY: {
    quality: 0.9,
    frameRate: 24,
    duration: 30,
    scale: 1.0,
    format: { type: 'gif' as const, compression: 20, optimize: true, dither: 'floyd-steinberg' as const }
  },
  /** Medium quality for social media */
  SOCIAL_MEDIA: {
    quality: 0.7,
    frameRate: 15,
    duration: 15,
    scale: 0.8,
    format: { type: 'gif' as const, compression: 40, optimize: true, dither: 'ordered' as const }
  },
  /** Low quality for email */
  EMAIL_FRIENDLY: {
    quality: 0.5,
    frameRate: 10,
    duration: 10,
    scale: 0.6,
    format: { type: 'gif' as const, compression: 60, optimize: true, dither: 'none' as const }
  },
  /** Mobile optimized */
  MOBILE_OPTIMIZED: {
    quality: 0.6,
    frameRate: 12,
    duration: 20,
    scale: 0.7,
    format: { type: 'gif' as const, compression: 50, optimize: true, dither: 'ordered' as const }
  }
} as const;

/**
 * Device frame presets
 */
export const DEVICE_FRAMES = {
  IPHONE_14: {
    deviceType: 'iphone-14' as const,
    dimensions: {
      width: 375,
      height: 812,
      screenX: 0,
      screenY: 47,
      screenWidth: 375,
      screenHeight: 734
    },
    style: {
      backgroundColor: '#000000',
      borderRadius: 40,
      shadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    }
  },
  PIXEL_7: {
    deviceType: 'pixel-7' as const,
    dimensions: {
      width: 393,
      height: 851,
      screenX: 0,
      screenY: 0,
      screenWidth: 393,
      screenHeight: 851
    },
    style: {
      backgroundColor: '#1a1a1a',
      borderRadius: 28,
      shadow: '0 15px 50px rgba(0, 0, 0, 0.25)'
    }
  }
} as const;