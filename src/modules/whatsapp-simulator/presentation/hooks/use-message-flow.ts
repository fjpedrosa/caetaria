/**
 * useMessageFlow - Hook for message flow orchestration without RxJS complexity
 * Replaces the complex Observable-based message playback with simple timers
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { Message } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';
import {
  calculateMessageTiming,
  ConversationConfig,
  createDebugEvent,
  createErrorEvent,
  createMessageSentEvent,
  createMessageTypingEvent,
  logDebug,
  PlaybackState,
  updatePlaybackStateWithCompletion} from '../../application/services/conversation-service';

export interface MessageFlowOptions {
  state: PlaybackState;
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void;
  onEvent?: (event: ConversationEvent) => void;
  config?: ConversationConfig;
}

export interface MessageFlowResult {
  currentMessage: Message | null;
  isProcessingMessage: boolean;
  messageProgress: {
    phase: 'waiting' | 'typing' | 'sent' | 'completed';
    timeRemaining: number;
    totalTime: number;
  };
}

export const useMessageFlow = (options: MessageFlowOptions): MessageFlowResult => {
  const { state, updateState, onEvent, config } = options;

  // Refs for cleanup
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Local state for progress tracking
  const [messageProgress, setMessageProgress] = useState<MessageFlowResult['messageProgress']>({
    phase: 'waiting',
    timeRemaining: 0,
    totalTime: 0
  });

  // Cleanup function for timers
  const cleanup = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
    setMessageProgress({
      phase: 'waiting',
      timeRemaining: 0,
      totalTime: 0
    });
  }, []);

  // Process next message function
  const processNextMessage = useCallback(async () => {
    if (!state.conversation || !state.isPlaying || isProcessingRef.current) {
      return;
    }

    const currentMessage = state.conversation.currentMessage;

    if (!currentMessage) {
      // Conversation completed
      logDebug(config, 'No more messages, conversation completed', {
        conversationId: state.conversation.metadata.id,
        totalMessages: state.conversation.messages.length
      });

      updateState(prevState => updatePlaybackStateWithCompletion(prevState));

      onEvent?.(createDebugEvent(
        state.conversation,
        'info',
        'Conversation completed - all messages processed'
      ));

      cleanup();
      return;
    }

    isProcessingRef.current = true;

    try {
      // Calculate timing for this message
      const timing = calculateMessageTiming(
        currentMessage,
        state.playbackSpeed,
        config?.fastModeEnabled || false
      );

      logDebug(config, 'Processing message', {
        messageIndex: state.currentMessageIndex,
        messageContent: currentMessage.content.substring(0, 50) + '...',
        timing,
        sender: currentMessage.sender
      });

      // Update progress state
      setMessageProgress({
        phase: 'waiting',
        timeRemaining: timing.totalDuration,
        totalTime: timing.totalDuration
      });

      // Emit debug event for message start
      onEvent?.(createDebugEvent(
        state.conversation,
        'debug',
        `Starting message ${state.currentMessageIndex}`,
        { message: currentMessage, timing }
      ));

      // Phase 1: Delay before typing
      if (timing.delayBeforeTyping > 0) {
        logDebug(config, 'Starting delay before typing', {
          delay: timing.delayBeforeTyping,
          messageIndex: state.currentMessageIndex
        });

        typingTimerRef.current = setTimeout(() => {
          if (!state.isPlaying || !state.conversation) {
            cleanup();
            isProcessingRef.current = false;
            return;
          }

          // Phase 2: Start typing indicator
          logDebug(config, 'Starting typing phase', {
            duration: timing.typingDuration,
            messageIndex: state.currentMessageIndex
          });

          setMessageProgress({
            phase: 'typing',
            timeRemaining: timing.typingDuration,
            totalTime: timing.totalDuration
          });

          // Emit typing started event
          onEvent?.(createMessageTypingEvent(
            state.conversation,
            currentMessage,
            state.currentMessageIndex,
            timing.typingDuration
          ));

          // Phase 3: Send message after typing duration
          sendTimerRef.current = setTimeout(() => {
            if (!state.isPlaying || !state.conversation) {
              cleanup();
              isProcessingRef.current = false;
              return;
            }

            logDebug(config, 'Sending message', {
              messageIndex: state.currentMessageIndex,
              sender: currentMessage.sender
            });

            // Update message status
            currentMessage.updateStatus('sent');

            setMessageProgress({
              phase: 'sent',
              timeRemaining: 0,
              totalTime: timing.totalDuration
            });

            // Emit message sent event
            onEvent?.(createMessageSentEvent(
              state.conversation,
              currentMessage,
              state.currentMessageIndex
            ));

            // Advance to next message
            const hasNext = state.conversation.advanceToNext();

            // Update state with new conversation position
            updateState(prevState => ({
              ...prevState,
              currentMessageIndex: state.conversation!.currentIndex,
              currentMessage: state.conversation!.currentMessage,
              nextMessage: state.conversation!.nextMessage,
              progress: {
                ...prevState.progress,
                completionPercentage: (state.conversation!.currentIndex / state.conversation!.messages.length) * 100
              }
            }));

            isProcessingRef.current = false;

            if (hasNext && state.isPlaying) {
              // Continue with next message using requestAnimationFrame for smooth transitions
              requestAnimationFrame(() => {
                processNextMessage();
              });
            } else {
              // Conversation completed
              setMessageProgress({
                phase: 'completed',
                timeRemaining: 0,
                totalTime: timing.totalDuration
              });
              cleanup();
            }

          }, timing.typingDuration);

        }, timing.delayBeforeTyping);
      } else {
        // Skip delay, go directly to typing
        processNextMessage();
      }

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Message processing error', {
        error: err.message,
        messageIndex: state.currentMessageIndex
      });

      if (state.conversation) {
        onEvent?.(createErrorEvent(
          state.conversation,
          err,
          state.currentMessageIndex
        ));
      }

      cleanup();
      isProcessingRef.current = false;
    }
  }, [state, updateState, onEvent, config, cleanup]);

  // Effect to start/stop message processing based on playback state
  useEffect(() => {
    if (state.isPlaying && state.conversation && !isProcessingRef.current) {
      logDebug(config, 'Starting message flow', {
        conversationId: state.conversation.metadata.id,
        currentIndex: state.currentMessageIndex,
        totalMessages: state.conversation.messages.length
      });

      processNextMessage();
    } else if (!state.isPlaying) {
      logDebug(config, 'Stopping message flow', {
        isPlaying: state.isPlaying,
        hasConversation: !!state.conversation
      });

      cleanup();
      isProcessingRef.current = false;
    }

    return () => {
      cleanup();
      isProcessingRef.current = false;
    };
  }, [state.isPlaying, state.conversation?.metadata.id, processNextMessage, cleanup, config]);

  // Effect to cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      isProcessingRef.current = false;
    };
  }, [cleanup]);

  return {
    currentMessage: state.currentMessage,
    isProcessingMessage: isProcessingRef.current,
    messageProgress
  };
};

// Hook for performance monitoring of message flow
export interface PerformanceMonitorOptions {
  onPerformanceReport?: (report: {
    messagesProcessed: number;
    averageProcessingTime: number;
    totalTime: number;
    errors: number;
  }) => void;
  reportInterval?: number;
}

export const useMessageFlowPerformance = (
  state: PlaybackState,
  options: PerformanceMonitorOptions = {}
) => {
  const { onPerformanceReport, reportInterval = 5000 } = options;
  const [stats, setStats] = useState({
    messagesProcessed: 0,
    totalProcessingTime: 0,
    errors: 0,
    startTime: Date.now()
  });

  // Update stats when message changes
  useEffect(() => {
    if (state.currentMessage && state.isPlaying) {
      setStats(prev => ({
        ...prev,
        messagesProcessed: prev.messagesProcessed + 1
      }));
    }
  }, [state.currentMessageIndex, state.isPlaying]);

  // Update error count
  useEffect(() => {
    if (state.hasError) {
      setStats(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  }, [state.hasError]);

  // Report performance periodically
  useEffect(() => {
    if (!onPerformanceReport) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const totalTime = now - stats.startTime;
      const averageProcessingTime = stats.messagesProcessed > 0
        ? stats.totalProcessingTime / stats.messagesProcessed
        : 0;

      onPerformanceReport({
        messagesProcessed: stats.messagesProcessed,
        averageProcessingTime,
        totalTime,
        errors: stats.errors
      });
    }, reportInterval);

    return () => clearInterval(interval);
  }, [stats, onPerformanceReport, reportInterval]);

  const resetStats = useCallback(() => {
    setStats({
      messagesProcessed: 0,
      totalProcessingTime: 0,
      errors: 0,
      startTime: Date.now()
    });
  }, []);

  return {
    stats: {
      ...stats,
      averageProcessingTime: stats.messagesProcessed > 0
        ? stats.totalProcessingTime / stats.messagesProcessed
        : 0
    },
    resetStats
  };
};