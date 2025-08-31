/**
 * Export Controls Component
 * UI controls for configuring and managing GIF export
 */

'use client';

import React, { useEffect,useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  Monitor,
  Pause,
  Play,
  Presentation,
  RefreshCw,
  Settings,
  Share2,
  Sliders,
  Smartphone,
  Square,
  X} from 'lucide-react';

import { EXPORT_PRESETS,ExportOptions } from '../../infra/services/gif-export/types';
import {
  formatDuration,
  formatFileSize,
  useGifExport,
  useGifExportEstimation,
  useGifExportPresets} from '../hooks/use-gif-export';

export interface ExportControlsProps {
  /** Target element to export */
  targetElement: HTMLElement | null;
  /** Whether controls are visible */
  isVisible?: boolean;
  /** Callback when export starts */
  onExportStart?: () => void;
  /** Callback when export completes */
  onExportComplete?: (result: any) => void;
  /** Callback when export fails */
  onExportError?: (error: any) => void;
  /** Custom class name */
  className?: string;
}

export function ExportControls({
  targetElement,
  isVisible = true,
  onExportStart,
  onExportComplete,
  onExportError,
  className = ''
}: ExportControlsProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { state, actions } = useGifExport({
    defaultPreset: 'SOCIAL_MEDIA',
    autoOptimize: true,
    enableProgress: true
  });

  const { presets, presetNames } = useGifExportPresets();

  const estimation = useGifExportEstimation(targetElement, state.options);

  // Handle export lifecycle
  useEffect(() => {
    if (state.status === 'preparing' && onExportStart) {
      onExportStart();
    }

    if (state.status === 'complete' && state.result && onExportComplete) {
      onExportComplete(state.result);
    }

    if (state.status === 'error' && state.error && onExportError) {
      onExportError(state.error);
    }
  }, [state.status, state.result, state.error, onExportStart, onExportComplete, onExportError]);

  const handleExport = () => {
    if (!targetElement) {
      console.warn('No target element specified for export');
      return;
    }

    actions.exportGif(targetElement);
  };

  const handlePresetChange = (preset: keyof typeof EXPORT_PRESETS) => {
    actions.setPreset(preset);
  };

  const handleDownload = () => {
    const filename = `whatsapp-conversation-${Date.now()}.gif`;
    actions.downloadGif(filename);
  };

  const handleShare = async () => {
    const blobUrl = actions.getBlobUrl();
    if (!blobUrl || !state.result) return;

    if (navigator.share && navigator.canShare) {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], 'whatsapp-conversation.gif', { type: 'image/gif' });

        await navigator.share({
          title: 'WhatsApp Conversation',
          text: 'Check out this WhatsApp conversation animation',
          files: [file]
        });
      } catch (error) {
        console.warn('Native sharing failed, falling back to copy link');
        await navigator.clipboard.writeText(blobUrl);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(blobUrl);
    }
  };

  const renderPresetButtons = () => (
    <div className="grid grid-cols-2 gap-2">
      {presetNames.map((presetName) => {
        const preset = presets[presetName];
        const isActive = JSON.stringify(state.options) === JSON.stringify(preset);

        return (
          <button
            key={presetName}
            onClick={() => handlePresetChange(presetName)}
            className={`
              p-3 text-left rounded-lg border transition-colors
              ${isActive
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-1">
              {presetName === 'HIGH_QUALITY' && <Presentation className="w-4 h-4" />}
              {presetName === 'SOCIAL_MEDIA' && <Share2 className="w-4 h-4" />}
              {presetName === 'EMAIL_FRIENDLY' && <Mail className="w-4 h-4" />}
              {presetName === 'MOBILE_OPTIMIZED' && <Smartphone className="w-4 h-4" />}
              <span className="font-medium text-sm">
                {presetName.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {preset.quality * 100}% quality • {preset.frameRate}fps • {preset.duration}s
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Sliders className="w-4 h-4" />
        Advanced Settings
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quality */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Quality: {Math.round(state.options.quality * 100)}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={state.options.quality * 100}
            onChange={(e) => actions.updateOptions({ quality: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Frame Rate */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Frame Rate: {state.options.frameRate} fps
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={state.options.frameRate}
            onChange={(e) => actions.updateOptions({ frameRate: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 fps</span>
            <span>30 fps</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Duration: {state.options.duration}s
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={state.options.duration}
            onChange={(e) => actions.updateOptions({ duration: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5s</span>
            <span>60s</span>
          </div>
        </div>

        {/* Scale */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Scale: {state.options.scale}x
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={state.options.scale * 100}
            onChange={(e) => actions.updateOptions({ scale: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    if (!state.isExporting) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {state.progressDetails?.message || 'Processing...'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(state.progress)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          />
        </div>

        {state.progressDetails?.currentFrame && state.progressDetails?.totalFrames && (
          <div className="text-xs text-gray-500 text-center">
            Frame {state.progressDetails.currentFrame} of {state.progressDetails.totalFrames}
          </div>
        )}
      </div>
    );
  };

  const renderEstimation = () => (
    <div className="flex justify-between items-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
      <div>
        <div>Est. size: {formatFileSize(estimation.fileSize)}</div>
        <div>Frames: {estimation.frameCount}</div>
      </div>
      <div>
        <div>Duration: {formatDuration(estimation.duration)}</div>
        <div>Memory: {formatFileSize(estimation.memoryUsage)}</div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (state.status !== 'complete' || !state.result) return null;

    return (
      <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Export Complete!</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">File Size</div>
            <div className="font-medium">{formatFileSize(state.result.fileSize)}</div>
          </div>
          <div>
            <div className="text-gray-600">Frames</div>
            <div className="font-medium">{state.result.metrics.frameCount}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (state.status !== 'error' || !state.error) return null;

    return (
      <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Export Failed</span>
        </div>

        <div className="text-sm text-red-600">
          {state.error.message}
        </div>

        {state.error.suggestions && state.error.suggestions.length > 0 && (
          <div className="text-sm">
            <div className="font-medium text-red-700 mb-1">Suggestions:</div>
            <ul className="list-disc list-inside space-y-1 text-red-600">
              {state.error.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {state.error.retryable && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}

          <button
            onClick={actions.reset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Export as GIF</h3>
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced
        </button>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Export Preset</label>
        {renderPresetButtons()}
      </div>

      {/* Advanced Settings */}
      {showAdvancedSettings && renderAdvancedSettings()}

      {/* Estimation */}
      {targetElement && renderEstimation()}

      {/* Progress */}
      {renderProgressBar()}

      {/* Export Button */}
      {!state.isExporting && state.status !== 'complete' && state.status !== 'error' && (
        <button
          onClick={handleExport}
          disabled={!targetElement}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          Export GIF
        </button>
      )}

      {/* Cancel Button */}
      {state.isExporting && (
        <button
          onClick={actions.cancelExport}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Square className="w-5 h-5" />
          Cancel Export
        </button>
      )}

      {/* Memory Warning */}
      {state.memoryUsage.nearLimit && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            Memory usage is high. Consider reducing quality or duration.
          </span>
        </div>
      )}

      {/* Results */}
      {renderResult()}

      {/* Errors */}
      {renderError()}
    </div>
  );
}