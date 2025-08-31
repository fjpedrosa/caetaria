/**
 * SetPlaybackSpeed Use Case
 */

import { ConversationEngine } from '../engines/conversation-engine';

export interface SetPlaybackSpeedRequest {
  speed: number;
  conversationId?: string;
}

export interface SetPlaybackSpeedResponse {
  success: boolean;
  previousSpeed: number;
  newSpeed: number;
  error?: Error;
}

export class SetPlaybackSpeedUseCase {
  constructor(private readonly engine: ConversationEngine) {}

  async execute(request: SetPlaybackSpeedRequest): Promise<SetPlaybackSpeedResponse> {
    try {
      const currentState = this.engine.getCurrentState();
      const previousSpeed = currentState.playbackSpeed;

      // Validate speed range
      if (request.speed < 0.1 || request.speed > 5.0) {
        return {
          success: false,
          previousSpeed,
          newSpeed: previousSpeed,
          error: new Error('Playback speed must be between 0.1x and 5.0x')
        };
      }

      // Update conversation settings if conversation is loaded
      if (currentState.conversation) {
        currentState.conversation.updateSettings({
          playbackSpeed: request.speed
        });
      }

      // Set speed in engine
      this.engine.setSpeed(request.speed);

      return {
        success: true,
        previousSpeed,
        newSpeed: request.speed
      };
    } catch (error) {
      return {
        success: false,
        previousSpeed: this.engine.getCurrentState().playbackSpeed,
        newSpeed: this.engine.getCurrentState().playbackSpeed,
        error: error as Error
      };
    }
  }
}