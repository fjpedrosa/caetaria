/**
 * PlayConversation Use Case
 */

import { Observable } from 'rxjs';

import { Conversation } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';
import { ConversationEngine } from '../engines/conversation-engine';

export interface PlayConversationRequest {
  conversation?: Conversation;
  autoStart?: boolean;
}

export interface PlayConversationResponse {
  success: boolean;
  events$: Observable<ConversationEvent>;
  error?: Error;
}

export class PlayConversationUseCase {
  constructor(private readonly engine: ConversationEngine) {}

  async execute(request: PlayConversationRequest): Promise<PlayConversationResponse> {
    try {
      // Only load conversation if provided and different from current
      if (request.conversation) {
        const currentConversation = this.engine.getCurrentConversation();
        
        // Only load if it's a different conversation or no conversation is loaded
        if (!currentConversation || currentConversation.metadata.id !== request.conversation.metadata.id) {
          this.engine.loadConversation(request.conversation);
        }
      }

      // Start playback if requested
      let events$: Observable<ConversationEvent>;

      if (request.autoStart !== false) {
        events$ = this.engine.play();
      } else {
        events$ = this.engine.events$;
      }

      return {
        success: true,
        events$
      };
    } catch (error) {
      return {
        success: false,
        events$: this.engine.events$,
        error: error as Error
      };
    }
  }
}