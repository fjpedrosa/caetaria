/**
 * JumpToMessage Use Case - Functional approach using ConversationOrchestrator
 */

import type {
  ConversationOrchestrator,
  ConversationOrchestratorResult
} from '../services';

export interface JumpToMessageRequest {
  messageIndex: number;
  conversationId?: string;
}

export interface JumpToMessageResponse {
  success: boolean;
  jumped: boolean;
  currentIndex: number;
  error?: Error;
  result?: ConversationOrchestratorResult;
}

/**
 * Jump to message use case - Using ConversationOrchestrator
 */
export const jumpToMessage = async (
  orchestrator: ConversationOrchestrator,
  request: JumpToMessageRequest
): Promise<JumpToMessageResponse> => {
  try {
    const { messageIndex } = request;

    // Validate request
    if (typeof messageIndex !== 'number' || messageIndex < 0) {
      const error = new Error('Invalid message index');
      return {
        success: false,
        jumped: false,
        currentIndex: orchestrator.getCurrentState().currentMessageIndex,
        error
      };
    }

    // Check if jump is valid
    if (!orchestrator.canJumpTo(messageIndex)) {
      const error = new Error(`Cannot jump to message index ${messageIndex}`);
      return {
        success: false,
        jumped: false,
        currentIndex: orchestrator.getCurrentState().currentMessageIndex,
        error
      };
    }

    // Jump to message
    const jumpResult = await orchestrator.jumpTo(messageIndex);

    return {
      success: jumpResult.success,
      jumped: jumpResult.success,
      currentIndex: orchestrator.getCurrentState().currentMessageIndex,
      error: jumpResult.error,
      result: jumpResult
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      jumped: false,
      currentIndex: orchestrator.getCurrentState().currentMessageIndex,
      error: err
    };
  }
};

/**
 * Check if jump operation is valid
 */
export const canJumpToMessage = (orchestrator: ConversationOrchestrator, messageIndex: number): boolean => {
  return orchestrator.canJumpTo(messageIndex);
};

/**
 * Create a jump to message request
 */
export const createJumpToMessageRequest = (messageIndex: number, conversationId?: string): JumpToMessageRequest => ({
  messageIndex,
  conversationId
});

export interface JumpToMessageDependencies {
  readonly orchestrator: ConversationOrchestrator;
}

/**
 * Factory function to create jumpToMessage use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function and utility functions
 */
export const createJumpToMessageUseCase = (deps: JumpToMessageDependencies) => {
  const { orchestrator } = deps;

  return {
    execute: async (request: JumpToMessageRequest): Promise<JumpToMessageResponse> => {
      return await jumpToMessage(orchestrator, request);
    },

    canJumpTo: (messageIndex: number): boolean => {
      return canJumpToMessage(orchestrator, messageIndex);
    }
  };
};

// LEGACY COMPATIBILITY - For gradual migration

/**
 * @deprecated Use createJumpToMessageUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class JumpToMessageUseCase {
  constructor(private orchestrator: ConversationOrchestrator) {}

  async execute(request: JumpToMessageRequest): Promise<JumpToMessageResponse> {
    const useCase = createJumpToMessageUseCase({ orchestrator: this.orchestrator });
    return useCase.execute(request);
  }
}