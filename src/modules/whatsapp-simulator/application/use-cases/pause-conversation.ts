/**
 * PauseConversation Use Case
 */

import { ConversationEngine } from '../engines/conversation-engine';

export interface PauseConversationRequest {
  conversationId?: string;
}

export interface PauseConversationResponse {
  success: boolean;
  wasPaused: boolean;
  error?: Error;
}

export class PauseConversationUseCase {
  constructor(private readonly engine: ConversationEngine) {}

  async execute(request: PauseConversationRequest = {}): Promise<PauseConversationResponse> {
    try {
      const currentState = this.engine.getCurrentState();

      // Check if conversation is currently playing
      if (!currentState.isPlaying) {
        return {
          success: true,
          wasPaused: false
        };
      }

      // Pause the conversation
      this.engine.pause();

      return {
        success: true,
        wasPaused: true
      };
    } catch (error) {
      return {
        success: false,
        wasPaused: false,
        error: error as Error
      };
    }
  }
}