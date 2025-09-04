/**
 * WhatsApp Simulator Demo Page
 * Shows the implemented WhatsApp Simulator components with GIF export functionality
 */

'use client';

import React from 'react';

import { ConversationSimulator } from '@/modules/whatsapp-simulator';
import { conversationFactory } from '@/modules/whatsapp-simulator/infrastructure/factories/conversation-factory';

export default function SimulatorDemoPage() {
  const [conversation] = React.useState(() =>
    conversationFactory.createSampleConversation({
      businessName: 'Demo Restaurant',
      businessPhoneNumber: '+1234567890',
      title: 'Order Confirmation Chat',
      messageCount: 12
    })
  );

  const [exportResult, setExportResult] = React.useState<any>(null);

  const handleGifExportStart = React.useCallback(() => {
    console.log('GIF export started');
    setExportResult(null);
  }, []);

  const handleGifExportComplete = React.useCallback((result: any) => {
    console.log('GIF export completed:', result);
    setExportResult(result);
  }, []);

  const handleGifExportError = React.useCallback((error: any) => {
    console.error('GIF export failed:', error);
  }, []);

  const handleMessageSent = React.useCallback((message: any) => {
    console.log('Message sent:', message);
  }, []);

  const handleConversationComplete = React.useCallback(() => {
    console.log('Conversation completed');
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Simulator error:', error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Simulator Demo</h1>
          <p className="text-gray-600 mt-2">
            Interactive demonstration of the WhatsApp Simulator with GIF export functionality
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">🎬 Animated Conversations</h3>
            <p className="text-gray-600">
              Realistic WhatsApp conversation flow with typing indicators and message timing
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">📱 Export as GIF</h3>
            <p className="text-gray-600">
              High-quality GIF export with customizable settings for different use cases
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">⚡ Performance Optimized</h3>
            <p className="text-gray-600">
              Mobile-first design with intelligent performance monitoring and optimization
            </p>
          </div>
        </div>

        {/* Main Simulator */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-2">Interactive Demo</h2>
            <p className="text-gray-600">
              Play the conversation and export it as a GIF. Try different settings to see how they affect quality and file size.
            </p>
          </div>

          <div className="p-6">
            <ConversationSimulator
              conversation={conversation}
              enableGifExport={true}
              onGifExportStart={handleGifExportStart}
              onGifExportComplete={handleGifExportComplete}
              onGifExportError={handleGifExportError}
              onMessageSent={handleMessageSent}
              onConversationComplete={handleConversationComplete}
              onError={handleError}
              enableDebug={false}
              className="h-96"
            />
          </div>
        </div>

        {/* Export Results */}
        {exportResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg text-green-800 mb-4 flex items-center gap-2">
              🎉 GIF Export Successful!
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-green-600">File Size</div>
                <div className="font-medium">
                  {(exportResult.fileSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div>
                <div className="text-sm text-green-600">Frame Count</div>
                <div className="font-medium">{exportResult.metrics.frameCount} frames</div>
              </div>
              <div>
                <div className="text-sm text-green-600">Quality</div>
                <div className="font-medium">{Math.round(exportResult.metrics.quality * 100)}%</div>
              </div>
              <div>
                <div className="text-sm text-green-600">Export Time</div>
                <div className="font-medium">
                  {(exportResult.metrics.totalTime / 1000).toFixed(1)}s
                </div>
              </div>
            </div>

            <div className="text-sm text-green-700">
              Your GIF is ready! Use the download button in the export controls above to save it.
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium">Start the Conversation</h3>
                <p className="text-gray-600">Click the "Play" button to begin the animated conversation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium">Configure Export Settings</h3>
                <p className="text-gray-600">Click "Export GIF" to open export controls and adjust quality, duration, and other settings</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium">Export and Download</h3>
                <p className="text-gray-600">Click "Export GIF" in the controls panel and wait for processing to complete</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-medium">Share Your GIF</h3>
                <p className="text-gray-600">Download or share your animated conversation for presentations, social media, or documentation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Integration Guide</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Basic Implementation</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { ConversationSimulator } from '@/modules/whatsapp-simulator';
import { conversationFactory } from '@/modules/whatsapp-simulator/infrastructure/factories/conversation-factory';

const conversation = conversationFactory.createSampleConversation({
  businessName: 'Your Business',
  businessPhoneNumber: '+1234567890',
  title: 'Customer Support Chat',
  messageCount: 10
});

<ConversationSimulator
  conversation={conversation}
  enableGifExport={true}
  onGifExportComplete={(result) => {
    console.log('GIF ready for download:', result);
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Export Only Mode</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { ExportControls } from '@/modules/whatsapp-simulator';

<ExportControls
  targetElement={conversationRef.current}
  onExportComplete={(result) => {
    // Handle the exported GIF
    const url = URL.createObjectURL(result.blob);
    window.open(url);
  }}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Export Capabilities</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Quality: 10% - 100% (adaptive)</li>
                <li>• Frame Rate: 5 - 30 fps</li>
                <li>• Duration: 5 - 60 seconds</li>
                <li>• Scale: 0.5x - 2.0x</li>
                <li>• Smart presets for different use cases</li>
                <li>• Mobile optimization included</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Performance Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Web Workers for background processing</li>
                <li>• Memory usage monitoring & cleanup</li>
                <li>• Progressive encoding with cancel support</li>
                <li>• Adaptive quality based on device capabilities</li>
                <li>• Network-aware optimizations</li>
                <li>• Real-time progress tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}