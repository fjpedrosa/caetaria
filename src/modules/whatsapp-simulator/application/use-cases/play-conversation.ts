/**
 * PlayConversation Use Case
 */

import { Observable } from 'rxjs';
import { ConversationEngine } from '../engines/conversation-engine';
import { ConversationEvent } from '../../domain/events';
import { Conversation } from '../../domain/entities';

export interface PlayConversationRequest {
  conversation: Conversation;
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
      // Load conversation into engine
      this.engine.loadConversation(request.conversation);

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