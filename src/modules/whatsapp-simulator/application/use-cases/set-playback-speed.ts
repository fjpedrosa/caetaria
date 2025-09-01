/**
 * SetPlaybackSpeed Use Case - Functional approach using ConversationOrchestrator
 */

import type {
  ConversationOrchestrator,
  ConversationOrchestratorResult
} from '../services';

export interface SetPlaybackSpeedRequest {
  speed: number;
  conversationId?: string;
}

export interface SetPlaybackSpeedResponse {
  success: boolean;
  previousSpeed: number;
  newSpeed: number;
  error?: Error;
  result?: ConversationOrchestratorResult;
}

/**
 * Set playback speed use case - Using ConversationOrchestrator
 */
export const setPlaybackSpeed = async (
  orchestrator: ConversationOrchestrator,
  request: SetPlaybackSpeedRequest
): Promise<SetPlaybackSpeedResponse> => {
  try {
    const currentState = orchestrator.getCurrentState();
    const previousSpeed = currentState.playbackSpeed;

    // Validate speed range
    if (request.speed < 0.1 || request.speed > 5.0) {
      const error = new Error('Playback speed must be between 0.1x and 5.0x');
      return {
        success: false,
        previousSpeed,
        newSpeed: previousSpeed,
        error
      };
    }

    // Set speed using orchestrator
    const speedResult = await orchestrator.setSpeed(request.speed);

    return {
      success: speedResult.success,
      previousSpeed,
      newSpeed: speedResult.success ? request.speed : previousSpeed,
      error: speedResult.error,
      result: speedResult
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const currentSpeed = orchestrator.getCurrentState().playbackSpeed;
    return {
      success: false,
      previousSpeed: currentSpeed,
      newSpeed: currentSpeed,
      error: err
    };
  }
};

/**
 * Validate playback speed value
 */
export const validatePlaybackSpeed = (speed: number): { valid: boolean; reason?: string } => {
  if (typeof speed !== 'number' || isNaN(speed)) {
    return { valid: false, reason: 'Speed must be a number' };
  }

  if (speed < 0.1 || speed > 5.0) {
    return { valid: false, reason: 'Speed must be between 0.1x and 5.0x' };
  }

  return { valid: true };
};

/**
 * Create a set playback speed request
 */
export const createSetPlaybackSpeedRequest = (speed: number, conversationId?: string): SetPlaybackSpeedRequest => ({
  speed,
  conversationId
});

export interface SetPlaybackSpeedDependencies {
  readonly orchestrator: ConversationOrchestrator;
}

/**
 * Factory function to create setPlaybackSpeed use case
 * @param deps Dependencies required for the use case
 * @returns Object with execute function and utility functions
 */
export const createSetPlaybackSpeedUseCase = (deps: SetPlaybackSpeedDependencies) => {
  const { orchestrator } = deps;

  return {
    execute: async (request: SetPlaybackSpeedRequest): Promise<SetPlaybackSpeedResponse> => {
      return await setPlaybackSpeed(orchestrator, request);
    },

    validateSpeed: (speed: number): { valid: boolean; reason?: string } => {
      return validatePlaybackSpeed(speed);
    },

    getCurrentSpeed: (): number => {
      return orchestrator.getCurrentState().playbackSpeed;
    }
  };
};

// LEGACY COMPATIBILITY - For gradual migration

/**
 * @deprecated Use createSetPlaybackSpeedUseCase factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class SetPlaybackSpeedUseCase {
  constructor(private orchestrator: ConversationOrchestrator) {}

  async execute(request: SetPlaybackSpeedRequest): Promise<SetPlaybackSpeedResponse> {
    const useCase = createSetPlaybackSpeedUseCase({ orchestrator: this.orchestrator });
    return useCase.execute(request);
  }
}