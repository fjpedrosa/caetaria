/**
 * JumpToMessage Use Case
 */

import { ConversationEngine } from '../engines/conversation-engine';

export interface JumpToMessageRequest {
  messageIndex: number;
  conversationId?: string;
}

export interface JumpToMessageResponse {
  success: boolean;
  jumped: boolean;
  currentIndex: number;
  error?: Error;
}

export class JumpToMessageUseCase {
  constructor(private readonly engine: ConversationEngine) {}

  async execute(request: JumpToMessageRequest): Promise<JumpToMessageResponse> {
    try {
      const currentState = this.engine.getCurrentState();
      
      // Check if there's a conversation loaded
      if (!currentState.conversation) {
        return {
          success: false,
          jumped: false,
          currentIndex: 0,
          error: new Error('No conversation loaded')
        };
      }

      const { messageIndex } = request;
      const totalMessages = currentState.conversation.messages.length;

      // Validate message index
      if (messageIndex < 0 || messageIndex >= totalMessages) {
        return {
          success: false,
          jumped: false,
          currentIndex: currentState.currentMessageIndex,
          error: new Error(`Invalid message index: ${messageIndex}. Must be between 0 and ${totalMessages - 1}`)
        };
      }

      // Jump to the specified message
      this.engine.jumpTo(messageIndex);

      return {
        success: true,
        jumped: true,
        currentIndex: messageIndex
      };
    } catch (error) {
      return {
        success: false,
        jumped: false,
        currentIndex: this.engine.getCurrentState().currentMessageIndex,
        error: error as Error
      };
    }
  }
}