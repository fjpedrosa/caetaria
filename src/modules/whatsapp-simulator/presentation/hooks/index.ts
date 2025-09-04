/**
 * Application Hooks - Clean exports for functional conversation architecture
 * Replaces the ConversationEngine class with composable custom hooks
 */

// Core state management hook
export {
  type ConversationStateOptions,
  type ConversationStateResult,
  type ConversationStatusOptions,
  type ErrorHandlingOptions,
  type ProgressTrackingOptions,
  useConversationState,
  useConversationStatus,
  useErrorHandling,
  useProgressTracking} from './use-conversation-state';

// Playback controls hook
export {
  type PlaybackControlsOptions,
  type PlaybackControlsResult,
  type SpeedControlOptions,
  usePlaybackControls,
  useSpeedControl} from './use-playback-controls';

// Message flow management hook
export {
  type MessageFlowOptions,
  type MessageFlowResult,
  type PerformanceMonitorOptions,
  useMessageFlow,
  useMessageFlowPerformance} from './use-message-flow';

// Event system hook
export {
  type ConversationEventsOptions,
  type ConversationEventsResult,
  type EventLoggingOptions,
  type EventMetricsOptions,
  type EventSubscription,
  useConversationEvents,
  useEventLogging,
  useEventMetrics} from './use-conversation-events';

// Typing indicators hook
export {
  type TypingAnimationOptions,
  type TypingIndicatorsOptions,
  type TypingIndicatorsResult,
  type TypingStatsOptions,
  useTypingAnimation,
  useTypingIndicators,
  useTypingStats} from './use-typing-indicators';

// Re-export service functions for convenience
export {
  // Utility functions
  calculateMessageTiming,
  calculateProgress,
  canJumpTo,
  canPause,
  canPlay,
  canReset,
  clearAllTypingStates,
  // Types
  type ConversationConfig,
  createCleanupFunction,
  createDebugEvent,
  // Configuration
  createDefaultConfig,
  createErrorEvent,
  createInitialPlaybackState,
  createMessageSentEvent,
  createMessageTypingEvent,
  createPlaybackPausedEvent,
  // Event creation functions
  createPlaybackStartedEvent,
  createProgressEvent,
  getActiveTypingSenders,
  logDebug,
  measurePerformance,
  type PlaybackState,
  // Typing state functions
  setTypingState,
  type TimingCalculation,
  updatePlaybackStateWithCompletion,
  // State transformation functions
  updatePlaybackStateWithConversation,
  updatePlaybackStateWithError,
  updatePlaybackStateWithJump,
  updatePlaybackStateWithPlayback,
  updatePlaybackStateWithSpeed,
  validateConversation,
  validateMessage,
  // Validation functions
  validatePlaybackSpeed} from '../../application/services/conversation-service';