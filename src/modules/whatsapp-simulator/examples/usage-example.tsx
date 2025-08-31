/**
 * Usage Example - Demonstrates how to use the WhatsApp Simulator
 */

'use client';

import React, { useState } from 'react';

import {
  Conversation,
  ConversationFactory,
  ConversationSimulator,
  useConversationFlow,
  useMessageTiming} from '../index';

export function WhatsAppSimulatorExample() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Get sample conversations
  const sampleConversations = ConversationFactory.getAllSampleConversations();

  // Message timing utilities
  const messageTiming = useMessageTiming({
    baseTypingSpeed: 3.5,
    enableRealisticDelays: true
  });

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = (message: any) => {
    console.log('Message sent:', message.getDisplayText());
  };

  const handleConversationComplete = () => {
    console.log('Conversation completed!');
    alert('Conversation completed! 🎉');
  };

  const handleError = (error: Error) => {
    console.error('Conversation error:', error);
    alert(`Error: ${error.message}`);
  };

  if (!selectedConversation) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">WhatsApp Conversation Simulator</h1>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Select a sample conversation to see the simulator in action:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleConversations.map((conversation) => (
              <div
                key={conversation.metadata.id}
                onClick={() => handleConversationSelect(conversation)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-2">{conversation.metadata.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{conversation.metadata.description}</p>

                <div className="text-xs text-gray-500">
                  <div>Messages: {conversation.messages.length}</div>
                  <div>Business: {conversation.metadata.businessName}</div>
                  <div>Duration: ~{Math.round(conversation.metadata.estimatedDuration / 1000)}s</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {conversation.metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              // Create custom conversation
              const customConversation = ConversationFactory.createFromTemplate({
                metadata: {
                  title: 'Custom Demo',
                  businessName: 'Demo Business',
                  businessPhoneNumber: '+1234567890',
                  userPhoneNumber: '+1987654321',
                  language: 'en',
                  tags: ['custom'],
                  category: 'demo'
                },
                messages: [
                  {
                    sender: 'user',
                    type: 'text',
                    content: { text: 'Hello! This is a custom conversation.' }
                  },
                  {
                    sender: 'business',
                    type: 'text',
                    content: { text: 'Welcome! I\'m here to help you today.' }
                  },
                  {
                    sender: 'user',
                    type: 'text',
                    content: { text: 'Great! This simulator looks amazing.' }
                  }
                ]
              });
              setSelectedConversation(customConversation);
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Create Custom Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Conversation Simulator</h1>
          <p className="text-gray-600">
            Simulating: {selectedConversation.metadata.title}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDebug}
              onChange={(e) => setShowDebug(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Debug</span>
          </label>

          <button
            onClick={() => setSelectedConversation(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Selection
          </button>
        </div>
      </div>

      {/* Simulator */}
      <div className="max-w-md mx-auto">
        <ConversationSimulator
          conversation={selectedConversation}
          onMessageSent={handleMessageSent}
          onConversationComplete={handleConversationComplete}
          onError={handleError}
          enableDebug={showDebug}
          className="h-[600px] shadow-xl"
        />
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">How to Use</h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">1</span>
            <span>Click the <strong>Play</strong> button to start the conversation simulation</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">2</span>
            <span>Watch as messages appear with realistic timing and typing indicators</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">3</span>
            <span>Use <strong>Pause</strong> to pause playback, <strong>Reset</strong> to start over</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">4</span>
            <span>Adjust playback speed using the dropdown (0.5x to 2x speed)</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">5</span>
            <span>Enable debug mode to see engine internals and event information</span>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Technical Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Engine Features</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• RxJS-powered reactive engine</li>
              <li>• Realistic typing simulation</li>
              <li>• Message status progression</li>
              <li>• Flow execution support</li>
              <li>• Event-driven architecture</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">UI Features</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Animated typing indicators</li>
              <li>• Progress tracking</li>
              <li>• Playback controls</li>
              <li>• Speed adjustment</li>
              <li>• Debug mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone hook usage example
 */
export function HookUsageExample() {
  const conversationFlow = useConversationFlow({
    enableDebug: true,
    enablePerformanceTracking: true
  });

  // Example of using the conversation flow programmatically
  const startDemo = async () => {
    const sampleConversation = ConversationFactory.createBookingConversation();

    // Load conversation
    const loaded = await conversationFlow.actions.loadConversation(sampleConversation);
    if (!loaded) {
      console.error('Failed to load conversation');
      return;
    }

    // Start playback
    const started = await conversationFlow.actions.play();
    if (!started) {
      console.error('Failed to start conversation');
      return;
    }

    console.log('Conversation started!');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Hook Usage Example</h2>

      <button
        onClick={startDemo}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Start Demo Programmatically
      </button>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Status:</strong> {conversationFlow.state.isPlaying ? 'Playing' : 'Stopped'}<br/>
          <strong>Current Message:</strong> {conversationFlow.state.currentMessageIndex + 1}/{conversationFlow.state.messages.length}<br/>
          <strong>Progress:</strong> {Math.round(conversationFlow.state.progress.completionPercentage)}%<br/>
          <strong>Last Event:</strong> {conversationFlow.state.lastEvent?.type || 'None'}
        </p>
      </div>
    </div>
  );
}