/**
 * Conversation Factory Adapter
 * Infrastructure layer - Implements conversation factory port
 */

import { ConversationFactory } from '../../application/ports/conversation-factory';
import type { Conversation } from '../../domain/entities';
import type { ConversationTemplate } from '../../domain/types';
import { createRestaurantReservationConversation } from '../../scenarios/restaurant-reservation-scenario';
import {
  createConversationFromTemplate
} from '../factories/conversation-factory';

export class ConversationFactoryAdapter implements ConversationFactory {
  createFromTemplate(template: ConversationTemplate): Conversation {
    return createConversationFromTemplate(template);
  }

  createRestaurantReservationConversation(): Conversation {
    return createRestaurantReservationConversation();
  }
}

// Create singleton instance
export const conversationFactory = new ConversationFactoryAdapter();