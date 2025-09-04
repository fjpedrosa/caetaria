/**
 * ConversationSimulator - Main component that connects the engine to UI
 */

'use client';

import React, { useEffect, useRef,useState } from 'react';
import { Download, Settings } from 'lucide-react';

import { Conversation, Message } from '../../domain/entities';
import { getMessageDisplayText } from '../../domain/entities/message';
import type { ConversationSimulatorProps } from '../../domain/types';
import { useConversationFlow } from '../hooks/use-conversation-flow';
import { useFlowExecutionWithEvents } from '../hooks/use-flow-execution';
import { useTypingIndicatorWithEvents } from '../hooks/use-typing-indicator';

import { ExportControls } from './export-controls';

export function ConversationSimulator({
  conversation,
  className = '',
  onMessageSent,
  onConversationComplete,
  onError,
  enableDebug = false,
  enableGifExport = false,
  onGifExportStart,
  onGifExportComplete,
  onGifExportError
}: ConversationSimulatorProps) {
  // Main conversation flow hook
  const conversationFlow = useConversationFlow({
    enableDebug,
    autoCleanup: true
  });

  // Typing indicator integration
  const typingIndicator = useTypingIndicatorWithEvents(
    conversationFlow.events$,
    {
      showTypingIndicator: true,
      animationDuration: 1200
    }
  );

  // Flow execution integration
  const flowExecution = useFlowExecutionWithEvents(
    conversationFlow.events$,
    {
      enableMockExecution: true,
      autoCompleteFlows: true,
      enableDebug
    }
  );

  const [isInitialized, setIsInitialized] = useState(false);
  const [showExportControls, setShowExportControls] = useState(false);

  // Refs for GIF export
  const conversationRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      const success = await conversationFlow.actions.loadConversation(conversation);
      if (success) {
        setIsInitialized(true);
      } else {
        onError?.(new Error('Failed to load conversation'));
      }
    };

    initializeConversation();
  }, [conversation]);

  // Handle events
  useEffect(() => {
    if (!conversationFlow.events$) return;

    const subscription = conversationFlow.events$.subscribe(event => {
      switch (event.type) {
        case 'message.sent':
          onMessageSent?.((event.payload as any).message);
          break;
        case 'conversation.completed':
          onConversationComplete?.();
          break;
        case 'conversation.error':
          onError?.((event.payload as any).error);
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [conversationFlow.events$, onMessageSent, onConversationComplete, onError]);

  // Render controls
  const renderControls = () => (
    <div className="flex items-center gap-2 p-4 border-t">
      <button
        onClick={() => conversationFlow.actions.play()}
        disabled={conversationFlow.state.isPlaying || !isInitialized}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {conversationFlow.state.isPlaying ? 'Playing...' : 'Play'}
      </button>

      <button
        onClick={() => conversationFlow.actions.pause()}
        disabled={!conversationFlow.state.isPlaying}
        className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
      >
        Pause
      </button>

      <button
        onClick={() => conversationFlow.actions.reset()}
        disabled={!isInitialized}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        Reset
      </button>

      <div className="flex items-center gap-2 ml-4">
        <label className="text-sm">Speed:</label>
        <select
          value={conversationFlow.state.playbackSpeed}
          onChange={(e) => conversationFlow.actions.setSpeed(parseFloat(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      {/* GIF Export Button */}
      {enableGifExport && (
        <div className="flex items-center gap-2 ml-4 border-l pl-4">
          <button
            onClick={() => setShowExportControls(!showExportControls)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            title="Export as GIF"
          >
            <Download className="w-4 h-4" />
            Export GIF
          </button>
        </div>
      )}
    </div>
  );

  // Render progress bar
  const renderProgress = () => (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">
          Message {conversationFlow.state.currentMessageIndex + 1} of {conversationFlow.state.messages.length}
        </span>
        <span className="text-sm text-gray-600">
          {Math.round(conversationFlow.state.progress.completionPercentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${conversationFlow.state.progress.completionPercentage}%` }}
        />
      </div>
    </div>
  );

  // Render message
  const renderMessage = (message: Message, index: number) => {
    const isVisible = index <= conversationFlow.state.currentMessageIndex;
    const isCurrentMessage = index === conversationFlow.state.currentMessageIndex;
    const isTyping = typingIndicator.actions.isUserTyping(message.sender);

    if (!isVisible) return null;

    return (
      <div
        key={message.id}
        className={`flex ${message.sender === 'business' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`
            max-w-xs lg:max-w-md px-4 py-2 rounded-lg
            ${message.sender === 'business'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-800'
            }
            ${isCurrentMessage ? 'ring-2 ring-blue-400' : ''}
          `}
        >
          <div className="text-sm">{getMessageDisplayText(message)}</div>

          {/* Message status indicators */}
          <div className="flex justify-end items-center mt-1 text-xs opacity-75">
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.status === 'read' && <span className="text-blue-300">✓✓</span>}
            {message.status === 'failed' && '❌'}
          </div>
        </div>
      </div>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!typingIndicator.state.isAnyoneTyping) return null;

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-200 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-1">
            {typingIndicator.state.activeTypingUsers.map(sender => {
              const animation = typingIndicator.getTypingAnimation(sender);
              return (
                <div
                  key={sender}
                  className="text-sm text-gray-600"
                  style={{
                    opacity: animation.opacity,
                    transform: `scale(${animation.scale})`
                  }}
                >
                  {animation.dots}
                </div>
              );
            })}
            <span className="text-xs text-gray-500 ml-2">typing...</span>
          </div>
        </div>
      </div>
    );
  };

  // Render messages container
  const renderMessages = () => (
    <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div className="space-y-2">
        {conversationFlow.state.messages.map((message, index) =>
          renderMessage(message, index)
        )}
        {renderTypingIndicator()}
      </div>
    </div>
  );

  // Render debug panel
  const renderDebugPanel = () => {
    if (!enableDebug) return null;

    return (
      <div className="border-t p-4 bg-gray-100 text-xs">
        <h4 className="font-bold mb-2">Debug Info</h4>
        <div className="space-y-1">
          <div>Status: {conversationFlow.state.conversation?.status}</div>
          <div>Playing: {conversationFlow.state.isPlaying ? 'Yes' : 'No'}</div>
          <div>Current Index: {conversationFlow.state.currentMessageIndex}</div>
          <div>Active Flows: {flowExecution.state.activeFlows.size}</div>
          <div>Last Event: {conversationFlow.state.lastEvent?.type || 'None'}</div>
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Simulator */}
      <div ref={conversationRef} className="flex flex-col h-full border rounded-lg overflow-hidden" data-conversation-id={conversation.id}>
        {/* Header */}
        <div className="bg-green-500 text-white p-4">
          <h3 className="font-semibold">{conversation.metadata.title}</h3>
          <p className="text-sm opacity-90">
            {conversation.metadata.businessName} • {conversation.metadata.businessPhoneNumber}
          </p>
        </div>

        {/* Progress */}
        {renderProgress()}

        {/* Messages */}
        {renderMessages()}

        {/* Controls */}
        {renderControls()}

        {/* Debug Panel */}
        {renderDebugPanel()}
      </div>

      {/* Export Controls */}
      {enableGifExport && showExportControls && (
        <div className="border rounded-lg p-4 bg-white">
          <ExportControls
            targetElement={conversationRef.current}
            isVisible={showExportControls}
            onExportStart={onGifExportStart}
            onExportComplete={onGifExportComplete}
            onExportError={onGifExportError}
          />
        </div>
      )}
    </div>
  );
}