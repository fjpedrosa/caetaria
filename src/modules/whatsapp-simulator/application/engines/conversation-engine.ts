/**
 * ConversationEngine - DEPRECATED
 * This file now exports ConversationOrchestrator for backward compatibility
 *
 * The original 649-line ConversationEngine class has been replaced with functional services:
 * - ConversationOrchestrator: Main coordination service
 * - EventService: Event management
 * - StateService: Playback state management
 * - PlaybackService: Play/pause/reset functionality
 * - MessageProcessingService: Message timing and flow
 * - TypingService: Typing indicators management
 */

// Re-export ConversationOrchestrator as ConversationEngine for compatibility
export {
  createConversationOrchestrator as ConversationEngine,
  type ConversationOrchestrator as ConversationEngineType,
  createConversationEngine,
  type OrchestratorConfig as EngineConfig,
  type PlaybackState
} from '../services/conversation-orchestrator';

// Re-export all related types for compatibility
export type {
  ConversationOrchestratorResult as ConversationEngineResult,
  EventService,
  MessageProcessingService,
  PlaybackService,
  StateManager,
  TypingService
} from '../services';

/**
 * @deprecated Use createConversationOrchestrator directly
 * This factory function creates a ConversationOrchestrator with the same interface as the old ConversationEngine
 */
export const createConversationEngine = (config: any = {}) => {
  const { createConversationOrchestrator } = require('../services/conversation-orchestrator');
  return createConversationOrchestrator(config);
};

// Legacy exports for compatibility
export default createConversationEngine;