/**
 * Application Services - Functional services replacing class-based architecture
 * Export all conversation orchestration services
 */

// Main orchestrator (replaces ConversationEngine)
export {
  type ConversationEngine,
  type ConversationOrchestrator,
  type ConversationOrchestratorResult,
  type ConversationOrchestratorState,
  createConversationEngine,
  createConversationOrchestrator,
  createOrchestratorConfig,
  type OrchestratorConfig} from './conversation-orchestrator';

// Event management service
export {
  combineEventStreams,
  createEventCleanup,
  createEventEmitter,
  createEventService,
  createEventServiceConfig,
  createFilteredEventStream,
  type EventService,
  type EventServiceConfig,
  type EventServiceState,
  type EventSubscription,
  filterEventsByConversation,
  filterEventsByPattern,
  filterEventsByTimeRange,
  filterEventsByType,
  subscribeToConversationEvents,
  subscribeToErrorEvents,
  subscribeToEvents,
  subscribeToMessageEvents,
  validateEvent,
  validateEventConversation,
  validateEventType} from './event-service';

// State management service
export {
  calculateEstimatedRemainingTime,
  calculateProgress,
  canJumpTo,
  canPause,
  canPlay,
  canReset,
  clearAllTypingStates,
  clearTypingState,
  createInitialState,
  createStateManager,
  isIdle,
  type PlaybackState,
  progressEquals,
  stateEquals,
  type StateManager,
  updateTypingState,
  updateWithCompletion,
  updateWithConversation,
  updateWithError,
  updateWithJump,
  updateWithMessageAdvance,
  updateWithPlaybackPause,
  updateWithPlaybackResume,
  updateWithPlaybackStart,
  updateWithPlaybackStop,
  updateWithReset,
  updateWithSpeedChange,
  validateMessageIndex,
  validatePlaybackSpeed,
  validateState} from './state-service';

// Playback control service
export {
  calculatePlaybackDuration,
  calculateTimeToMessage,
  canAdvanceToNext,
  canGoToPrevious,
  createPlaybackConfig,
  createPlaybackService,
  executeJump,
  executeNext,
  executePause,
  executePlay,
  executePrevious,
  executeReset,
  executeSpeedChange,
  getPlaybackProgress,
  isPlaybackActive,
  type JumpRequest,
  logPlaybackAction,
  measurePlaybackPerformance,
  type PlaybackConfig,
  type PlaybackResult,
  type PlaybackService,
  type PlayRequest,
  type SpeedRequest,
  validateJumpRequest,
  validatePlayRequest,
  validateSpeedRequest} from './playback-service';

// Message processing service
export {
  calculateMessageTiming,
  calculateOptimizedTiming,
  createMessageFlowController,
  createMessagePlaybackStream,
  createMessageProcessingConfig,
  createMessageProcessingService,
  estimatePlaybackDuration,
  estimateTimeToMessage,
  logDebug as logMessageProcessingDebug,
  logPerformance as logMessageProcessingPerformance,
  measureMessageProcessingTime,
  type MessageProcessingConfig,
  type MessageProcessingContext,
  type MessageProcessingResult,
  type MessageProcessingService,
  type MessageTiming,
  processMessage,
  trackMessageThroughput,
  validateMessageForProcessing,
  validateProcessingContext} from './message-processing-service';

// Typing indicators service
export {
  addTypingState,
  clearAllTypingState,
  createTypingIndicatorText,
  createTypingService,
  createTypingServiceConfig,
  createTypingStateMap,
  estimateTypingDuration,
  formatTypingDuration,
  getActiveTypingSenders,
  getTypingDuration,
  getTypingState,
  getTypingStats,
  hasActiveTyping,
  isTyping,
  processTypingStartedEvent,
  processTypingStoppedEvent,
  removeTypingState,
  startTyping,
  stopAllTyping,
  stopTyping,
  subscribeToTypingEvents,
  type TypingRequest,
  type TypingService,
  type TypingServiceConfig,
  type TypingState,
  type TypingStats,
  validateTypingDuration,
  validateTypingRequest} from './typing-service';

// Re-export conversation-service for backward compatibility
export * from './conversation-service';