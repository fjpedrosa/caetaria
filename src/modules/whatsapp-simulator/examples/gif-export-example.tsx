/**
 * GIF Export Example
 * Comprehensive example showing how to use the GIF export functionality
 */

'use client';

import React, { useState } from 'react';
import { 
  ConversationSimulator, 
  ExportControls,
  useGifExport,
  useGifExportPresets 
} from '../index';
import { conversationFactory } from '../infra/factories/conversation-factory';

export function GifExportExample() {
  const [conversation] = useState(() => 
    conversationFactory.createSampleConversation({
      businessName: 'Demo Restaurant',
      businessPhoneNumber: '+1234567890',
      title: 'Order Confirmation Chat',
      messageCount: 8
    })
  );

  const [showExportDemo, setShowExportDemo] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  
  const handleGifExportComplete = (result: any) => {
    console.log('GIF export completed:', result);
    setExportResult(result);
  };

  const handleGifExportError = (error: any) => {
    console.error('GIF export failed:', error);
  };

  const handleGifExportStart = () => {
    console.log('GIF export started');
    setExportResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          WhatsApp Simulator - GIF Export Demo
        </h1>
        <p className="text-lg text-gray-600">
          Export your WhatsApp conversations as high-quality animated GIFs
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">📱 Mobile Optimized</h3>
          <p className="text-gray-600">
            Automatically adjusts quality and performance for mobile devices
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">⚡ High Performance</h3>
          <p className="text-gray-600">
            Uses Web Workers and canvas optimization for smooth exports
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-2">🎯 Smart Presets</h3>
          <p className="text-gray-600">
            Pre-configured settings for social media, email, and presentations
          </p>
        </div>
      </div>

      {/* Main Demo */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-2">Interactive Demo</h2>
          <p className="text-gray-600">
            Play the conversation and export it as a GIF with customizable settings
          </p>
        </div>

        <div className="p-6">
          <ConversationSimulator
            conversation={conversation}
            enableGifExport={true}
            onGifExportStart={handleGifExportStart}
            onGifExportComplete={handleGifExportComplete}
            onGifExportError={handleGifExportError}
            className="h-96"
          />
        </div>
      </div>

      {/* Export Result */}
      {exportResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg text-green-800 mb-4">
            🎉 Export Successful!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-green-600">File Size</div>
              <div className="font-medium">{(exportResult.fileSize / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <div>
              <div className="text-sm text-green-600">Frame Count</div>
              <div className="font-medium">{exportResult.metrics.frameCount} frames</div>
            </div>
            <div>
              <div className="text-sm text-green-600">Quality</div>
              <div className="font-medium">{Math.round(exportResult.metrics.quality * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Export Controls Demo */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-2">Standalone Export Controls</h2>
          <p className="text-gray-600">
            Use the export controls independently for custom implementations
          </p>
          <button
            onClick={() => setShowExportDemo(!showExportDemo)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showExportDemo ? 'Hide' : 'Show'} Export Controls
          </button>
        </div>

        {showExportDemo && (
          <div className="p-6">
            <ExportControls
              targetElement={null} // Would be set to actual element
              isVisible={showExportDemo}
              onExportStart={() => console.log('Standalone export started')}
              onExportComplete={(result) => console.log('Standalone export completed:', result)}
              onExportError={(error) => console.error('Standalone export failed:', error)}
            />
          </div>
        )}
      </div>

      {/* Integration Guide */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Basic Usage</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { ConversationSimulator } from '@/modules/whatsapp-simulator';

<ConversationSimulator
  conversation={conversation}
  enableGifExport={true}
  onGifExportComplete={(result) => {
    console.log('GIF ready:', result.blob);
    // Download or share the GIF
  }}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Custom Export Controls</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { ExportControls, useGifExport } from '@/modules/whatsapp-simulator';

const { state, actions } = useGifExport({
  defaultPreset: 'SOCIAL_MEDIA',
  autoOptimize: true
});

<ExportControls
  targetElement={elementRef.current}
  onExportComplete={(result) => actions.downloadGif()}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium mb-2">3. Mobile Optimization</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { mobileOptimizationUtils } from '@/modules/whatsapp-simulator';

const deviceConfig = mobileOptimizationUtils.detectDeviceCapabilities();
const optimizedOptions = mobileOptimizationUtils.optimizeForMobile(
  baseOptions, 
  deviceConfig
);`}
            </pre>
          </div>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Export Options</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Quality: 0.1 - 1.0 (10% - 100%)</li>
              <li>• Frame Rate: 5 - 30 fps</li>
              <li>• Duration: 5 - 60 seconds</li>
              <li>• Scale: 0.5x - 2.0x</li>
              <li>• Output Format: GIF with optimization</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Performance Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Web Workers for background processing</li>
              <li>• Memory usage monitoring</li>
              <li>• Adaptive quality adjustment</li>
              <li>• Progress tracking with cancellation</li>
              <li>• Mobile-specific optimizations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook Usage Example Component
 */
export function HookUsageExample() {
  const { presets, presetNames } = useGifExportPresets();
  const { state, actions } = useGifExport({
    defaultPreset: 'SOCIAL_MEDIA',
    autoOptimize: true,
    enableProgress: true
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Hook Usage Example</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Available Presets</label>
          <div className="flex flex-wrap gap-2">
            {presetNames.map((preset) => (
              <button
                key={preset}
                onClick={() => actions.setPreset(preset)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Current Quality: {Math.round(state.options.quality * 100)}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={state.options.quality * 100}
            onChange={(e) => actions.updateOptions({ quality: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
        </div>

        <div className="text-sm text-gray-600">
          <div>Status: {state.status}</div>
          <div>Progress: {state.progress}%</div>
          <div>Is Exporting: {state.isExporting ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}