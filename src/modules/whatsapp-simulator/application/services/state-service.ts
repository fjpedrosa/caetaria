/**
 * StateService - Functional service for playback state management
 * Pure functions for state transformations and validations
 */

import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Conversation, getCurrentMessage, getNextMessage, jumpToMessage, Message, resetConversation, playConversation } from '../../domain/entities';

// Core state type (exported from conversation-service.ts)
export interface PlaybackState {
  conversation: Conversation | null;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  hasError: boolean;
  currentMessageIndex: number;
  currentMessage: Message | null;
  nextMessage: Message | null;
  playbackSpeed: number;
  progress: {
    completionPercentage: number;
    elapsedTime: number;
    remainingTime: number;
  };
  typingStates: Map<string, boolean>;
  error?: Error;
}

// State management functions
export const createInitialState = (): PlaybackState => ({
  conversation: null,
  isPlaying: false,
  isPaused: false,
  isCompleted: false,
  hasError: false,
  currentMessageIndex: 0,
  currentMessage: null,
  nextMessage: null,
  playbackSpeed: 1.0,
  progress: {
    completionPercentage: 0,
    elapsedTime: 0,
    remainingTime: 0
  },
  typingStates: new Map()
});

// State validation functions
export const validateState = (state: PlaybackState): boolean => {
  return typeof state.isPlaying === 'boolean' &&
         typeof state.isPaused === 'boolean' &&
         typeof state.isCompleted === 'boolean' &&
         typeof state.hasError === 'boolean' &&
         typeof state.currentMessageIndex === 'number' &&
         typeof state.playbackSpeed === 'number' &&
         state.progress !== null &&
         state.typingStates instanceof Map;
};

export const validatePlaybackSpeed = (speed: number): boolean => {
  return typeof speed === 'number' && speed >= 0.1 && speed <= 5.0;
};

export const validateMessageIndex = (index: number, conversation: Conversation | null): boolean => {
  if (!conversation) return false;
  return index >= 0 && index < conversation.messages.length;
};

// State query functions
export const canPlay = (state: PlaybackState): boolean => {
  return state.conversation !== null &&
         !state.isPlaying &&
         !state.hasError &&
         !state.isCompleted;
};

export const canPause = (state: PlaybackState): boolean => {
  return state.isPlaying && !state.isPaused;
};

export const canReset = (state: PlaybackState): boolean => {
  return state.conversation !== null;
};

export const canJumpTo = (state: PlaybackState, messageIndex: number): boolean => {
  return validateMessageIndex(messageIndex, state.conversation);
};

export const isIdle = (state: PlaybackState): boolean => {
  return !state.isPlaying && !state.isPaused && !state.hasError && !state.isCompleted;
};

export const hasActiveTyping = (state: PlaybackState): boolean => {
  return Array.from(state.typingStates.values()).some(isTyping => isTyping);
};

// Progress calculation functions
export const calculateProgress = (
  currentIndex: number,
  totalMessages: number,
  elapsedTime: number = 0,
  estimatedRemainingTime: number = 0
): PlaybackState['progress'] => {
  const completionPercentage = totalMessages > 0 ? (currentIndex / totalMessages) * 100 : 0;

  return {
    completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
    elapsedTime,
    remainingTime: estimatedRemainingTime
  };
};

export const calculateEstimatedRemainingTime = (
  state: PlaybackState,
  averageMessageDuration: number = 3000
): number => {
  if (!state.conversation) return 0;

  const remainingMessages = state.conversation.messages.length - state.currentMessageIndex;
  const baseTime = remainingMessages * averageMessageDuration;

  return Math.max(0, baseTime / state.playbackSpeed);
};

// State transformation functions
export const updateWithConversation = (
  state: PlaybackState,
  conversation: Conversation
): PlaybackState => {
  console.log('[StateService] 🔄 updateWithConversation:', {
    conversationId: conversation.metadata.id,
    messageCount: conversation.messages.length,
    currentIndex: conversation.currentIndex,
    firstMessage: conversation.messages[0]?.content?.text?.substring(0, 50)
  });
  
  return {
    ...state,
    conversation,
    currentMessageIndex: conversation.currentIndex,
    currentMessage: getCurrentMessage(conversation),
    nextMessage: getNextMessage(conversation),
    playbackSpeed: conversation.settings.playbackSpeed,
    progress: calculateProgress(
      conversation.currentIndex,
      conversation.messages.length,
      state.progress.elapsedTime
    ),
    isCompleted: false,
    hasError: false,
    error: undefined
  };
};

export const updateWithPlaybackStart = (
  state: PlaybackState
): PlaybackState => {
  // Update conversation to playing status
  const updatedConversation = state.conversation ? playConversation(state.conversation) : null;
  
  return {
    ...state,
    conversation: updatedConversation,
    isPlaying: true,
    isPaused: false,
    hasError: false,
    error: undefined
  };
};

export const updateWithPlaybackPause = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  isPlaying: false,
  isPaused: true
});

export const updateWithPlaybackResume = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  isPlaying: true,
  isPaused: false
});

export const updateWithPlaybackStop = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  isPlaying: false,
  isPaused: false
});

export const updateWithCompletion = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  isPlaying: false,
  isPaused: false,
  isCompleted: true,
  progress: {
    ...state.progress,
    completionPercentage: 100
  }
});

export const updateWithError = (
  state: PlaybackState,
  error: Error
): PlaybackState => ({
  ...state,
  isPlaying: false,
  isPaused: false,
  hasError: true,
  error
});

export const updateWithReset = (
  state: PlaybackState
): PlaybackState => {
  if (!state.conversation) return state;

  const resetConv = resetConversation(state.conversation);
  return {
    ...createInitialState(),
    conversation: resetConv,
    currentMessageIndex: 0,
    currentMessage: getCurrentMessage(resetConv),
    nextMessage: getNextMessage(resetConv),
    playbackSpeed: state.conversation.settings.playbackSpeed
  };
};

export const updateWithJump = (
  state: PlaybackState,
  messageIndex: number
): PlaybackState => {
  if (!canJumpTo(state, messageIndex)) return state;

  const conversation = jumpToMessage(state.conversation!, messageIndex);

  return {
    ...state,
    conversation,
    currentMessageIndex: messageIndex,
    currentMessage: getCurrentMessage(conversation),
    nextMessage: getNextMessage(conversation),
    progress: calculateProgress(
      messageIndex,
      conversation.messages.length,
      state.progress.elapsedTime
    ),
    isCompleted: messageIndex >= conversation.messages.length - 1
  };
};

export const updateWithSpeedChange = (
  state: PlaybackState,
  speed: number
): PlaybackState => {
  if (!validatePlaybackSpeed(speed)) return state;

  const updatedState = {
    ...state,
    playbackSpeed: speed
  };

  // Update conversation settings if present
  if (state.conversation) {
    state.conversation.settings.playbackSpeed = speed;
  }

  return updatedState;
};

export const updateWithMessageAdvance = (
  state: PlaybackState
): PlaybackState => {
  if (!state.conversation) return state;

  // Increment the index manually for now
  const newIndex = state.conversation.currentIndex + 1;
  const hasAdvanced = newIndex < state.conversation.messages.length;
  
  console.log('[StateService] ⏩ updateWithMessageAdvance:', {
    oldIndex: state.conversation.currentIndex,
    newIndex,
    totalMessages: state.conversation.messages.length,
    hasAdvanced,
    nextMessage: state.conversation.messages[newIndex]?.content?.text?.substring(0, 30)
  });

  // Create new conversation state with updated index
  const updatedConv = { ...state.conversation, currentIndex: newIndex };

  return {
    ...state,
    conversation: updatedConv,
    currentMessageIndex: newIndex,
    currentMessage: getCurrentMessage(updatedConv),
    nextMessage: getNextMessage(updatedConv),
    progress: calculateProgress(
      newIndex,
      state.conversation.messages.length,
      state.progress.elapsedTime
    ),
    isCompleted: !hasAdvanced // If can't advance, we're completed
  };
};

// Typing state functions
export const updateTypingState = (
  state: PlaybackState,
  sender: string,
  isTyping: boolean
): PlaybackState => {
  const newTypingStates = new Map(state.typingStates);
  newTypingStates.set(sender, isTyping);

  return {
    ...state,
    typingStates: newTypingStates
  };
};

export const clearTypingState = (
  state: PlaybackState,
  sender: string
): PlaybackState => {
  const newTypingStates = new Map(state.typingStates);
  newTypingStates.delete(sender);

  return {
    ...state,
    typingStates: newTypingStates
  };
};

export const clearAllTypingStates = (
  state: PlaybackState
): PlaybackState => ({
  ...state,
  typingStates: new Map()
});

// State observation functions
export const createStateManager = (initialState: PlaybackState = createInitialState()) => {
  const stateSubject = new BehaviorSubject<PlaybackState>(initialState);

  return {
    // State access
    getCurrentState: () => stateSubject.value,
    state$: stateSubject.asObservable(),

    // State updates
    updateState: (updater: (state: PlaybackState) => PlaybackState) => {
      const currentState = stateSubject.value;
      const newState = updater(currentState);

      if (validateState(newState)) {
        stateSubject.next(newState);
      } else {
        console.warn('[StateService] Invalid state update rejected:', newState);
      }
    },

    // Direct state setters
    setState: (newState: PlaybackState) => {
      if (validateState(newState)) {
        stateSubject.next(newState);
      }
    },

    // Specialized observables
    isPlaying$: stateSubject.pipe(
      map(state => state.isPlaying),
      distinctUntilChanged()
    ),

    currentMessage$: stateSubject.pipe(
      map(state => state.currentMessage),
      distinctUntilChanged()
    ),

    progress$: stateSubject.pipe(
      map(state => state.progress),
      distinctUntilChanged((prev, curr) =>
        prev.completionPercentage === curr.completionPercentage
      )
    ),

    typingStates$: stateSubject.pipe(
      map(state => state.typingStates),
      distinctUntilChanged()
    ),

    hasError$: stateSubject.pipe(
      map(state => state.hasError),
      distinctUntilChanged()
    ),

    // Lifecycle
    destroy: () => {
      stateSubject.complete();
    }
  };
};

// State comparison functions
export const stateEquals = (state1: PlaybackState, state2: PlaybackState): boolean => {
  return state1.isPlaying === state2.isPlaying &&
         state1.isPaused === state2.isPaused &&
         state1.isCompleted === state2.isCompleted &&
         state1.hasError === state2.hasError &&
         state1.currentMessageIndex === state2.currentMessageIndex &&
         state1.playbackSpeed === state2.playbackSpeed &&
         state1.conversation?.metadata.id === state2.conversation?.metadata.id;
};

export const progressEquals = (
  progress1: PlaybackState['progress'],
  progress2: PlaybackState['progress']
): boolean => {
  return progress1.completionPercentage === progress2.completionPercentage &&
         progress1.elapsedTime === progress2.elapsedTime &&
         progress1.remainingTime === progress2.remainingTime;
};

// Type exports
export type StateManager = ReturnType<typeof createStateManager>;