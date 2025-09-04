/**
 * Conversation Factory Port
 * Application layer - Interface for creating conversations from templates
 */

import type { Conversation } from '../../domain/entities';
import type { ConversationTemplate } from '../../domain/types';

/**
 * Port for conversation creation from templates
 */
export interface ConversationFactory {
  createFromTemplate(template: ConversationTemplate): Conversation;
  createRestaurantReservationConversation(): Conversation;
}