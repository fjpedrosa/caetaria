/**
 * PauseConversation Use Case - Functional approach using ConversationOrchestrator
 */

import type {
  ConversationOrchestrator,
  ConversationOrchestratorResult
} from '../services';

export interface PauseConversationRequest {
  conversationId?: string;
}

export interface PauseConversationResponse {
  success: boolean;
  wasPaused: boolean;
  error?: Error;
  result?: ConversationOrchestratorResult;
}

/**
 * Pause conversation use case - Using ConversationOrchestrator
 */
export const pauseConversation = async (
  orchestrator: ConversationOrchestrator,
  request: PauseConversationRequest = {}
): Promise<PauseConversationResponse> => {
  try {
    // Check if conversation can be paused
    if (!orchestrator.canPause()) {
      return {
        success: true,
        wasPaused: false
      };
    }

    // Pause the conversation
    const pauseResult = await orchestrator.pause();

    return {
      success: pauseResult.success,
      wasPaused: pauseResult.success,
      error: pauseResult.error,
      result: pauseResult
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      wasPaused: false,
      error: err
    };
  }
};

/**
 * Check if pause operation is valid for current state
 */
export const canPauseConversation = (orchestrator: ConversationOrchestrator): boolean => {
  return orchestrator.canPause();
};

/**
 * Create a pause conversation request
 */
export const createPauseConversationRequest = (conversationId?: string): PauseConversationRequest => ({
  conversationId
});

export interface PauseConversationDependencies {
  readonly orchestrator: ConversationOrchestrator;
}

/**
 * Factory function to create pauseConversation use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function and utility functions
 */
export const createPauseConversationUseCase = (deps: PauseConversationDependencies) => {
  const { orchestrator } = deps;

  return {
    execute: async (request: PauseConversationRequest = {}): Promise<PauseConversationResponse> => {
      return await pauseConversation(orchestrator, request);
    },

    canPause: (): boolean => {
      return canPauseConversation(orchestrator);
    }
  };
};

// LEGACY COMPATIBILITY - For gradual migration

/**
 * @deprecated Use createPauseConversationUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class PauseConversationUseCase {
  constructor(private orchestrator: ConversationOrchestrator) {}

  async execute(request: PauseConversationRequest = {}): Promise<PauseConversationResponse> {
    const useCase = createPauseConversationUseCase({ orchestrator: this.orchestrator });
    return useCase.execute(request);
  }
}