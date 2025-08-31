/**
 * ResetConversation Use Case
 */

import { ConversationEngine } from '../engines/conversation-engine';

export interface ResetConversationRequest {
  conversationId?: string;
}

export interface ResetConversationResponse {
  success: boolean;
  wasReset: boolean;
  error?: Error;
}

export class ResetConversationUseCase {
  constructor(private readonly engine: ConversationEngine) {}

  async execute(request: ResetConversationRequest = {}): Promise<ResetConversationResponse> {
    try {
      const currentState = this.engine.getCurrentState();

      // Check if there's a conversation loaded
      if (!currentState.conversation) {
        return {
          success: true,
          wasReset: false
        };
      }

      // Reset the conversation
      this.engine.reset();

      return {
        success: true,
        wasReset: true
      };
    } catch (error) {
      return {
        success: false,
        wasReset: false,
        error: error as Error
      };
    }
  }
}