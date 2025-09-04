/**
 * useConversationState - Hook for managing conversation state
 * Replaces BehaviorSubjects from ConversationEngine with React state
 */

import { useCallback, useMemo,useState } from 'react';

import { Conversation } from '../../domain/entities';
import {
  ConversationConfig,
  createInitialPlaybackState,
  logDebug,
  PlaybackState,
  updatePlaybackStateWithConversation,
  validateConversation} from '../../application/services/conversation-service';

export interface ConversationStateOptions {
  onStateChange?: (state: PlaybackState) => void;
  config?: Partial<ConversationConfig>;
  initialState?: Partial<PlaybackState>;
}

export interface ConversationStateResult {
  state: PlaybackState;
  loadConversation: (conversation: Conversation) => void;
  updatePlaybackState: (updater: (state: PlaybackState) => PlaybackState) => void;
  resetState: () => void;
  isReady: boolean;
}

export const useConversationState = (
  options: ConversationStateOptions = {}
): ConversationStateResult => {
  const { onStateChange, config, initialState } = options;

  // Initialize state with optional overrides
  const [state, setState] = useState<PlaybackState>(() => ({
    ...createInitialPlaybackState(),
    ...initialState
  }));

  // Load conversation into state
  const loadConversation = useCallback((conversation: Conversation) => {
    if (!validateConversation(conversation)) {
      logDebug(
        config as ConversationConfig,
        'Invalid conversation provided to loadConversation',
        { conversation }
      );
      return;
    }

    setState(prevState => {
      const newState = updatePlaybackStateWithConversation(prevState, conversation);

      logDebug(
        config as ConversationConfig,
        'Conversation loaded',
        {
          conversationId: conversation.metadata.id,
          messageCount: conversation.messages.length,
          currentIndex: conversation.currentIndex
        }
      );

      onStateChange?.(newState);
      return newState;
    });
  }, [config, onStateChange]);

  // Generic state updater
  const updatePlaybackState = useCallback((
    updater: (state: PlaybackState) => PlaybackState
  ) => {
    setState(prevState => {
      try {
        const newState = updater(prevState);

        // Validate state consistency
        if (newState.currentMessageIndex < 0) {
          logDebug(
            config as ConversationConfig,
            'Warning: negative currentMessageIndex detected',
            { newState }
          );
          newState.currentMessageIndex = 0;
        }

        onStateChange?.(newState);
        return newState;
      } catch (error) {
        logDebug(
          config as ConversationConfig,
          'Error updating playback state',
          { error, prevState }
        );
        return prevState;
      }
    });
  }, [config, onStateChange]);

  // Reset to initial state
  const resetState = useCallback(() => {
    const newState = createInitialPlaybackState();
    setState(newState);
    onStateChange?.(newState);

    logDebug(
      config as ConversationConfig,
      'State reset to initial values'
    );
  }, [config, onStateChange]);

  // Computed properties
  const isReady = useMemo(() => {
    return validateConversation(state.conversation) && !state.hasError;
  }, [state.conversation, state.hasError]);

  return {
    state,
    loadConversation,
    updatePlaybackState,
    resetState,
    isReady
  };
};

// Specialized hook for progress tracking
export interface ProgressTrackingOptions {
  updateInterval?: number;
  onProgressChange?: (progress: PlaybackState['progress']) => void;
}

export const useProgressTracking = (
  state: PlaybackState,
  options: ProgressTrackingOptions = {}
) => {
  const { updateInterval = 1000, onProgressChange } = options;

  const progress = useMemo(() => {
    if (!state.conversation) {
      return {
        completionPercentage: 0,
        elapsedTime: 0,
        remainingTime: 0
      };
    }

    const totalMessages = state.conversation.messages.length;
    const completionPercentage = totalMessages > 0
      ? (state.currentMessageIndex / totalMessages) * 100
      : 0;

    // Calculate estimated remaining time based on average message duration
    const averageMessageDuration = 3000; // 3 seconds average
    const remainingMessages = Math.max(0, totalMessages - state.currentMessageIndex);
    const remainingTime = (remainingMessages * averageMessageDuration) / state.playbackSpeed;

    const newProgress = {
      completionPercentage,
      elapsedTime: state.progress.elapsedTime,
      remainingTime
    };

    onProgressChange?.(newProgress);
    return newProgress;
  }, [
    state.conversation,
    state.currentMessageIndex,
    state.playbackSpeed,
    state.progress.elapsedTime,
    onProgressChange
  ]);

  return progress;
};

// Hook for conversation status information
export interface ConversationStatusOptions {
  onStatusChange?: (status: {
    canPlay: boolean;
    canPause: boolean;
    canReset: boolean;
    isActive: boolean;
  }) => void;
}

export const useConversationStatus = (
  state: PlaybackState,
  options: ConversationStatusOptions = {}
) => {
  const { onStatusChange } = options;

  const status = useMemo(() => {
    const canPlay = state.conversation !== null &&
                    !state.isPlaying &&
                    !state.hasError &&
                    !state.isCompleted;

    const canPause = state.isPlaying && !state.isPaused;

    const canReset = state.conversation !== null;

    const isActive = state.isPlaying || state.isPaused;

    const newStatus = { canPlay, canPause, canReset, isActive };
    onStatusChange?.(newStatus);

    return newStatus;
  }, [
    state.conversation,
    state.isPlaying,
    state.isPaused,
    state.hasError,
    state.isCompleted,
    onStatusChange
  ]);

  return status;
};

// Hook for error handling
export interface ErrorHandlingOptions {
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export const useErrorHandling = (
  state: PlaybackState,
  options: ErrorHandlingOptions = {}
) => {
  const { onError, maxRetries = 3 } = options;
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((error: Error) => {
    setRetryCount(prev => prev + 1);
    onError?.(error);
  }, [onError]);

  const canRetry = useMemo(() => {
    return state.hasError && retryCount < maxRetries;
  }, [state.hasError, retryCount, maxRetries]);

  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    hasError: state.hasError,
    error: state.error,
    retryCount,
    canRetry,
    handleError,
    resetRetries
  };
};