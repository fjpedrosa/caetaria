/**
 * ResetConversation Use Case - Functional approach using ConversationOrchestrator
 */

import type {
  ConversationOrchestrator,
  ConversationOrchestratorResult
} from '../services';

export interface ResetConversationRequest {
  conversationId?: string;
}

export interface ResetConversationResponse {
  success: boolean;
  wasReset: boolean;
  error?: Error;
  result?: ConversationOrchestratorResult;
}

/**
 * Reset conversation use case - Using ConversationOrchestrator
 */
export const resetConversation = async (
  orchestrator: ConversationOrchestrator,
  request: ResetConversationRequest = {}
): Promise<ResetConversationResponse> => {
  try {
    // Check if there's a conversation loaded
    if (!orchestrator.canReset()) {
      return {
        success: true,
        wasReset: false
      };
    }

    // Reset the conversation
    const resetResult = await orchestrator.reset();

    return {
      success: resetResult.success,
      wasReset: resetResult.success,
      error: resetResult.error,
      result: resetResult
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      wasReset: false,
      error: err
    };
  }
};

/**
 * Check if reset operation is valid for current state
 */
export const canResetConversation = (orchestrator: ConversationOrchestrator): boolean => {
  return orchestrator.canReset();
};

/**
 * Create a reset conversation request
 */
export const createResetConversationRequest = (conversationId?: string): ResetConversationRequest => ({
  conversationId
});

export interface ResetConversationDependencies {
  readonly orchestrator: ConversationOrchestrator;
}

/**
 * Factory function to create resetConversation use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function and utility functions
 */
export const createResetConversationUseCase = (deps: ResetConversationDependencies) => {
  const { orchestrator } = deps;

  return {
    execute: async (request: ResetConversationRequest = {}): Promise<ResetConversationResponse> => {
      return await resetConversation(orchestrator, request);
    },

    canReset: (): boolean => {
      return canResetConversation(orchestrator);
    }
  };
};

// LEGACY COMPATIBILITY - For gradual migration

/**
 * @deprecated Use createResetConversationUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class ResetConversationUseCase {
  constructor(private orchestrator: ConversationOrchestrator) {}

  async execute(request: ResetConversationRequest = {}): Promise<ResetConversationResponse> {
    const useCase = createResetConversationUseCase({ orchestrator: this.orchestrator });
    return useCase.execute(request);
  }
}