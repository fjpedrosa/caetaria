/**
 * useGifExport Hook
 * React hook for managing GIF export state and operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ExportOptions,
  GifExportResult,
  GifExportError,
  GifGenerationProgress,
  EXPORT_PRESETS
} from '../../infra/services/gif-export/types';
import { gifExportService } from '../../infra/services/gif-export/gif-export.service';
import { gifOptimizationUtils } from '../../infra/services/gif-export/gif-optimization.utils';

export interface UseGifExportOptions {
  /** Default export preset */
  defaultPreset?: keyof typeof EXPORT_PRESETS;
  /** Auto-optimize settings based on element */
  autoOptimize?: boolean;
  /** Maximum file size limit in bytes */
  maxFileSize?: number;
  /** Enable progress tracking */
  enableProgress?: boolean;
}

export interface GifExportState {
  /** Current export status */
  status: 'idle' | 'preparing' | 'capturing' | 'encoding' | 'optimizing' | 'complete' | 'error';
  /** Export progress (0-100) */
  progress: number;
  /** Current export options */
  options: ExportOptions;
  /** Export result when complete */
  result: GifExportResult | null;
  /** Error information if failed */
  error: GifExportError | null;
  /** Whether export is currently running */
  isExporting: boolean;
  /** Current progress details */
  progressDetails: GifGenerationProgress | null;
  /** Estimated file size */
  estimatedSize: number;
  /** Memory usage information */
  memoryUsage: {
    current: number;
    peak: number;
    limit: number;
    nearLimit: boolean;
  };
}

export interface GifExportActions {
  /** Start GIF export */
  exportGif: (element: HTMLElement, customOptions?: Partial<ExportOptions>) => Promise<void>;
  /** Cancel ongoing export */
  cancelExport: () => void;
  /** Reset export state */
  reset: () => void;
  /** Update export options */
  updateOptions: (options: Partial<ExportOptions>) => void;
  /** Set export preset */
  setPreset: (preset: keyof typeof EXPORT_PRESETS) => void;
  /** Download exported GIF */
  downloadGif: (filename?: string) => void;
  /** Get shareable blob URL */
  getBlobUrl: () => string | null;
  /** Optimize options for element */
  optimizeOptions: (element: HTMLElement) => ExportOptions;
}

export function useGifExport(hookOptions: UseGifExportOptions = {}): {
  state: GifExportState;
  actions: GifExportActions;
} {
  const {
    defaultPreset = 'SOCIAL_MEDIA',
    autoOptimize = true,
    maxFileSize,
    enableProgress = true
  } = hookOptions;

  // State
  const [state, setState] = useState<GifExportState>({
    status: 'idle',
    progress: 0,
    options: EXPORT_PRESETS[defaultPreset],
    result: null,
    error: null,
    isExporting: false,
    progressDetails: null,
    estimatedSize: 0,
    memoryUsage: {
      current: 0,
      peak: 0,
      limit: 512,
      nearLimit: false
    }
  });

  // Refs
  const blobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    if (!enableProgress) return;

    const interval = setInterval(() => {
      const memoryUsage = gifExportService.getMemoryUsage();
      setState(prev => ({
        ...prev,
        memoryUsage
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [enableProgress]);

  // Actions
  const exportGif = useCallback(async (
    element: HTMLElement,
    customOptions: Partial<ExportOptions> = {}
  ) => {
    try {
      // Prevent multiple exports
      if (state.isExporting) {
        throw new Error('Export already in progress');
      }

      // Reset state
      setState(prev => ({
        ...prev,
        status: 'preparing',
        isExporting: true,
        progress: 0,
        result: null,
        error: null,
        progressDetails: null
      }));

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Prepare options
      let exportOptions = { ...state.options, ...customOptions };

      // Auto-optimize if enabled
      if (autoOptimize) {
        const optimizedOptions = gifOptimizationUtils.calculateOptimalSettings(
          element,
          {
            maxFileSize,
            targetQuality: exportOptions.quality
          }
        );
        exportOptions = { ...optimizedOptions, ...customOptions };
      }

      // Update state with final options
      setState(prev => ({
        ...prev,
        options: exportOptions
      }));

      // Start export
      const result = await gifExportService.exportConversation(
        element,
        exportOptions,
        {
          onProgress: enableProgress ? (progress) => {
            setState(prev => ({
              ...prev,
              status: progress.stage as GifExportState['status'],
              progress: progress.progress,
              progressDetails: progress
            }));
          } : undefined,

          onError: (error) => {
            setState(prev => ({
              ...prev,
              status: 'error',
              error,
              isExporting: false
            }));
          },

          onSuccess: (result) => {
            // Revoke previous blob URL
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
            }

            // Create new blob URL
            blobUrlRef.current = URL.createObjectURL(result.blob);

            setState(prev => ({
              ...prev,
              status: 'complete',
              progress: 100,
              result,
              isExporting: false,
              estimatedSize: result.fileSize
            }));
          }
        }
      );

    } catch (error) {
      const gifError: GifExportError = error instanceof Error ? {
        type: 'unknown',
        message: error.message,
        retryable: true
      } : error as GifExportError;

      setState(prev => ({
        ...prev,
        status: 'error',
        error: gifError,
        isExporting: false
      }));
    }
  }, [state.options, state.isExporting, autoOptimize, maxFileSize, enableProgress]);

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    gifExportService.cancelExport();
    
    setState(prev => ({
      ...prev,
      status: 'idle',
      isExporting: false,
      progress: 0,
      progressDetails: null
    }));
  }, []);

  const reset = useCallback(() => {
    // Cancel any ongoing export
    cancelExport();

    // Revoke blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Reset state
    setState({
      status: 'idle',
      progress: 0,
      options: EXPORT_PRESETS[defaultPreset],
      result: null,
      error: null,
      isExporting: false,
      progressDetails: null,
      estimatedSize: 0,
      memoryUsage: {
        current: 0,
        peak: 0,
        limit: 512,
        nearLimit: false
      }
    });
  }, [defaultPreset, cancelExport]);

  const updateOptions = useCallback((options: Partial<ExportOptions>) => {
    setState(prev => ({
      ...prev,
      options: { ...prev.options, ...options }
    }));
  }, []);

  const setPreset = useCallback((preset: keyof typeof EXPORT_PRESETS) => {
    setState(prev => ({
      ...prev,
      options: EXPORT_PRESETS[preset]
    }));
  }, []);

  const downloadGif = useCallback((filename = 'whatsapp-conversation.gif') => {
    if (!state.result || !blobUrlRef.current) {
      console.warn('No GIF available for download');
      return;
    }

    const link = document.createElement('a');
    link.href = blobUrlRef.current;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.result]);

  const getBlobUrl = useCallback(() => {
    return blobUrlRef.current;
  }, []);

  const optimizeOptions = useCallback((element: HTMLElement) => {
    return gifOptimizationUtils.calculateOptimalSettings(
      element,
      {
        maxFileSize,
        targetQuality: state.options.quality
      }
    );
  }, [state.options.quality, maxFileSize]);

  return {
    state,
    actions: {
      exportGif,
      cancelExport,
      reset,
      updateOptions,
      setPreset,
      downloadGif,
      getBlobUrl,
      optimizeOptions
    }
  };
}

/**
 * Hook for getting export presets
 */
export function useGifExportPresets() {
  return {
    presets: EXPORT_PRESETS,
    presetNames: Object.keys(EXPORT_PRESETS) as Array<keyof typeof EXPORT_PRESETS>
  };
}

/**
 * Hook for estimating export metrics
 */
export function useGifExportEstimation(element: HTMLElement | null, options: ExportOptions) {
  const [estimation, setEstimation] = useState<{
    fileSize: number;
    duration: number;
    frameCount: number;
    memoryUsage: number;
  }>({
    fileSize: 0,
    duration: 0,
    frameCount: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    if (!element) return;

    const calculateEstimation = () => {
      const rect = element.getBoundingClientRect();
      const pixelCount = rect.width * rect.height * (options.scale || 1) ** 2;
      const frameCount = options.duration * options.frameRate;
      
      // Rough file size estimation
      const avgBytesPerPixel = options.quality * 0.5;
      const estimatedFileSize = pixelCount * avgBytesPerPixel * frameCount;
      
      // Memory usage estimation (uncompressed frames in memory)
      const memoryUsage = pixelCount * 4 * Math.min(frameCount, 10); // Assume max 10 frames in memory

      setEstimation({
        fileSize: estimatedFileSize,
        duration: options.duration,
        frameCount,
        memoryUsage
      });
    };

    calculateEstimation();
  }, [element, options]);

  return estimation;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}