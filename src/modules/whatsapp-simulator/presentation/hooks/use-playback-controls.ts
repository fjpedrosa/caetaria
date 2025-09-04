/**
 * usePlaybackControls - Hook for playback controls (play, pause, reset, jumpTo, setSpeed)
 * Replaces the complex subject-based controls from ConversationEngine
 */

import { useCallback, useMemo, useRef } from 'react';

import { ConversationConfig,PlaybackState } from '../../application/services/conversation-service';
import {
  canJumpTo,
  canPause,
  canPlay,
  canReset,
  createDebugEvent,
  createPlaybackPausedEvent,
  createPlaybackStartedEvent,
  logDebug,
  updatePlaybackStateWithError,
  updatePlaybackStateWithJump,
  updatePlaybackStateWithPlayback,
  updatePlaybackStateWithSpeed,
  validatePlaybackSpeed
} from '../../application/services/conversation-service';
import { ConversationEvent } from '../../domain/events';

export interface PlaybackControlsOptions {
  state: PlaybackState;
  updateState: (updater: (state: PlaybackState) => PlaybackState) => void;
  onEvent?: (event: ConversationEvent) => void;
  config?: ConversationConfig;
}

export interface PlaybackControlsResult {
  play: () => Promise<void>;
  pause: () => void;
  reset: () => void;
  jumpTo: (messageIndex: number) => void;
  setSpeed: (speed: number) => void;
  canPlay: boolean;
  canPause: boolean;
  canReset: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
}

export const usePlaybackControls = (
  options: PlaybackControlsOptions
): PlaybackControlsResult => {
  const { state, updateState, onEvent, config } = options;
  const isProcessingRef = useRef(false);

  // Play control
  const play = useCallback(async () => {
    if (!canPlay(state) || isProcessingRef.current) {
      logDebug(config, 'Cannot start playback', {
        canPlayState: canPlay(state),
        isProcessing: isProcessingRef.current,
        state: { ...state, typingStates: undefined } // Exclude Map for logging
      });
      return;
    }

    if (!state.conversation) {
      const error = new Error('No conversation loaded');
      updateState(prevState => updatePlaybackStateWithError(prevState, error));
      onEvent?.(createDebugEvent(
        state.conversation!,
        'error',
        'Play failed: No conversation loaded'
      ));
      return;
    }

    try {
      isProcessingRef.current = true;

      logDebug(config, 'Starting playback', {
        conversationId: state.conversation.metadata.id,
        currentIndex: state.currentMessageIndex
      });

      // Update state to playing
      updateState(prevState => updatePlaybackStateWithPlayback(prevState, true, false));

      // Start conversation playback on domain entity
      state.conversation.play();

      // Emit playback started event
      onEvent?.(createPlaybackStartedEvent(state.conversation));

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Play error', { error: err.message });
      updateState(prevState => updatePlaybackStateWithError(prevState, err));
      onEvent?.(createDebugEvent(
        state.conversation!,
        'error',
        `Play failed: ${err.message}`,
        { error: err }
      ));
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, updateState, onEvent, config]);

  // Pause control
  const pause = useCallback(() => {
    if (!canPause(state) || !state.conversation) {
      logDebug(config, 'Cannot pause playback', {
        canPauseState: canPause(state),
        hasConversation: !!state.conversation
      });
      return;
    }

    try {
      logDebug(config, 'Pausing playback', {
        conversationId: state.conversation.metadata.id,
        currentIndex: state.currentMessageIndex
      });

      // Pause conversation playback on domain entity
      state.conversation.pause();

      // Update state
      updateState(prevState => updatePlaybackStateWithPlayback(prevState, false, true));

      // Emit paused event
      onEvent?.(createPlaybackPausedEvent(
        state.conversation,
        state.currentMessageIndex
      ));

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Pause error', { error: err.message });
      updateState(prevState => updatePlaybackStateWithError(prevState, err));
    }
  }, [state, updateState, onEvent, config]);

  // Reset control
  const reset = useCallback(() => {
    if (!canReset(state) || !state.conversation) {
      logDebug(config, 'Cannot reset conversation', {
        canResetState: canReset(state),
        hasConversation: !!state.conversation
      });
      return;
    }

    try {
      logDebug(config, 'Resetting conversation', {
        conversationId: state.conversation.metadata.id
      });

      // Reset conversation on domain entity
      state.conversation.reset();

      // Update state - reset to beginning but keep conversation
      updateState(prevState => ({
        ...prevState,
        isPlaying: false,
        isPaused: false,
        isCompleted: false,
        hasError: false,
        currentMessageIndex: 0,
        currentMessage: state.conversation!.currentMessage,
        nextMessage: state.conversation!.nextMessage,
        progress: {
          completionPercentage: 0,
          elapsedTime: 0,
          remainingTime: 0
        },
        typingStates: new Map(),
        error: undefined
      }));

      // Emit debug event
      onEvent?.(createDebugEvent(
        state.conversation,
        'info',
        'Conversation reset to beginning'
      ));

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Reset error', { error: err.message });
      updateState(prevState => updatePlaybackStateWithError(prevState, err));
    }
  }, [state, updateState, onEvent, config]);

  // Jump to specific message
  const jumpTo = useCallback((messageIndex: number) => {
    if (!canJumpTo(state, messageIndex)) {
      logDebug(config, 'Cannot jump to message index', {
        messageIndex,
        currentIndex: state.currentMessageIndex,
        totalMessages: state.conversation?.messages.length || 0
      });
      return;
    }

    try {
      const previousIndex = state.currentMessageIndex;

      logDebug(config, 'Jumping to message', {
        from: previousIndex,
        to: messageIndex,
        conversationId: state.conversation!.metadata.id
      });

      // Update state using service function
      updateState(prevState => updatePlaybackStateWithJump(prevState, messageIndex));

      // Emit debug event
      if (state.conversation?.currentMessage) {
        onEvent?.(createDebugEvent(
          state.conversation,
          'info',
          `Jumped from message ${previousIndex} to ${messageIndex}`,
          {
            message: state.conversation.currentMessage,
            previousIndex,
            newIndex: messageIndex
          }
        ));
      }

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Jump error', { error: err.message, messageIndex });
      updateState(prevState => updatePlaybackStateWithError(prevState, err));
    }
  }, [state, updateState, onEvent, config]);

  // Set playback speed
  const setSpeed = useCallback((speed: number) => {
    if (!validatePlaybackSpeed(speed)) {
      const error = new Error(`Invalid playback speed: ${speed}. Must be between 0.1x and 5.0x`);
      logDebug(config, 'Invalid speed', { speed, error: error.message });
      updateState(prevState => updatePlaybackStateWithError(prevState, error));
      return;
    }

    try {
      logDebug(config, 'Setting playback speed', {
        oldSpeed: state.playbackSpeed,
        newSpeed: speed,
        conversationId: state.conversation?.metadata.id
      });

      // Update conversation speed if available
      if (state.conversation) {
        state.conversation.settings.playbackSpeed = speed;
      }

      // Update state
      updateState(prevState => updatePlaybackStateWithSpeed(prevState, speed));

      // Emit debug event
      if (state.conversation) {
        onEvent?.(createDebugEvent(
          state.conversation,
          'info',
          `Playback speed changed to ${speed}x`,
          { speed, previousSpeed: state.playbackSpeed }
        ));
      }

    } catch (error) {
      const err = error as Error;
      logDebug(config, 'Set speed error', { error: err.message, speed });
      updateState(prevState => updatePlaybackStateWithError(prevState, err));
    }
  }, [state, updateState, onEvent, config]);

  // Computed properties for UI
  const controlsState = useMemo(() => ({
    canPlay: canPlay(state),
    canPause: canPause(state),
    canReset: canReset(state),
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    playbackSpeed: state.playbackSpeed
  }), [state]);

  return {
    play,
    pause,
    reset,
    jumpTo,
    setSpeed,
    ...controlsState
  };
};

// Specialized hook for speed control
export interface SpeedControlOptions {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
  presetSpeeds?: number[];
}

export const useSpeedControl = (options: SpeedControlOptions) => {
  const {
    currentSpeed,
    onSpeedChange,
    presetSpeeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
  } = options;

  const increaseSpeed = useCallback(() => {
    const currentIndex = presetSpeeds.findIndex(speed => speed >= currentSpeed);
    const nextIndex = Math.min(currentIndex + 1, presetSpeeds.length - 1);
    if (nextIndex > currentIndex) {
      onSpeedChange(presetSpeeds[nextIndex]);
    }
  }, [currentSpeed, presetSpeeds, onSpeedChange]);

  const decreaseSpeed = useCallback(() => {
    const currentIndex = presetSpeeds.findIndex(speed => speed >= currentSpeed);
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex < currentIndex) {
      onSpeedChange(presetSpeeds[prevIndex]);
    }
  }, [currentSpeed, presetSpeeds, onSpeedChange]);

  const setToPreset = useCallback((presetIndex: number) => {
    if (presetIndex >= 0 && presetIndex < presetSpeeds.length) {
      onSpeedChange(presetSpeeds[presetIndex]);
    }
  }, [presetSpeeds, onSpeedChange]);

  const resetToNormal = useCallback(() => {
    onSpeedChange(1.0);
  }, [onSpeedChange]);

  const canIncrease = useMemo(() => {
    const currentIndex = presetSpeeds.findIndex(speed => speed >= currentSpeed);
    return currentIndex < presetSpeeds.length - 1;
  }, [currentSpeed, presetSpeeds]);

  const canDecrease = useMemo(() => {
    const currentIndex = presetSpeeds.findIndex(speed => speed >= currentSpeed);
    return currentIndex > 0;
  }, [currentSpeed, presetSpeeds]);

  const speedLabel = useMemo(() => {
    return `${currentSpeed}x`;
  }, [currentSpeed]);

  return {
    currentSpeed,
    increaseSpeed,
    decreaseSpeed,
    setToPreset,
    resetToNormal,
    canIncrease,
    canDecrease,
    speedLabel,
    presetSpeeds
  };
};