/**
 * PlayConversation Use Case - Functional approach using ConversationOrchestrator
 */

import { Conversation } from '../../domain/entities';
import type {
  ConversationOrchestrator,
  ConversationOrchestratorResult,
  PlaybackState} from '../services';

export interface PlayConversationRequest {
  conversation?: Conversation;
  autoStart?: boolean;
}

export interface PlayConversationResponse {
  success: boolean;
  error?: Error;
  result?: ConversationOrchestratorResult;
}

/**
 * Play conversation use case - Using ConversationOrchestrator
 */
export const playConversation = async (
  orchestrator: ConversationOrchestrator,
  request: PlayConversationRequest
): Promise<PlayConversationResponse> => {
  try {
    // Validate request first
    const validation = validatePlayConversationRequest(request);
    if (!validation.isValid) {
      const error = new Error(`Invalid request: ${validation.errors.join(', ')}`);
      return { success: false, error };
    }

    // Load conversation if provided
    if (request.conversation) {
      const currentConversation = orchestrator.getCurrentConversation();

      // Only load if it's a different conversation or no conversation is loaded
      if (!currentConversation || currentConversation.metadata.id !== request.conversation.metadata.id) {
        const loadResult = await orchestrator.loadConversation(request.conversation);
        if (!loadResult.success) {
          return { success: false, error: loadResult.error, result: loadResult };
        }
      }
    }

    // Start playback if requested (default is true)
    if (request.autoStart !== false && orchestrator.canPlay()) {
      const playResult = await orchestrator.play({ autoStart: true });
      return {
        success: playResult.success,
        error: playResult.error,
        result: playResult
      };
    }

    // Just loading without starting
    return { success: true };

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err };
  }
};

/**
 * Validate play conversation request
 */
export const validatePlayConversationRequest = (request: PlayConversationRequest): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Conversation validation if provided
  if (request.conversation) {
    if (!request.conversation.metadata?.id) {
      errors.push('Conversation must have a valid ID');
    }
    if (!request.conversation.messages || request.conversation.messages.length === 0) {
      errors.push('Conversation must have at least one message');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a play conversation request with defaults
 */
export const createPlayConversationRequest = (
  conversation?: Conversation,
  autoStart = true
): PlayConversationRequest => ({
  conversation,
  autoStart
});

export interface PlayConversationDependencies {
  readonly orchestrator: ConversationOrchestrator;
}

/**
 * Factory function to create playConversation use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function and utility functions
 */
export const createPlayConversationUseCase = (deps: PlayConversationDependencies) => {
  const { orchestrator } = deps;

  return {
    execute: async (request: PlayConversationRequest): Promise<PlayConversationResponse> => {
      return await playConversation(orchestrator, request);
    },

    canPlay: (): boolean => {
      return orchestrator.canPlay();
    },

    validateRequest: (request: PlayConversationRequest): { isValid: boolean; errors: string[] } => {
      return validatePlayConversationRequest(request);
    }
  };
};

// LEGACY COMPATIBILITY - For gradual migration

/**
 * @deprecated Use createPlayConversationUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class PlayConversationUseCase {
  constructor(private orchestrator: ConversationOrchestrator) {}

  async execute(request: PlayConversationRequest): Promise<PlayConversationResponse> {
    const useCase = createPlayConversationUseCase({ orchestrator: this.orchestrator });
    return useCase.execute(request);
  }
}