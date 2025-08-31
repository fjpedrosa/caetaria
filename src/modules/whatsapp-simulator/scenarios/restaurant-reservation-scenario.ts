/**
 * Restaurant Reservation Scenario
 * Extracted from the existing hardcoded hero-mobile-demo-v2.tsx
 */

import { Conversation } from '../domain/entities';
import {
  ConversationFactory,
  ConversationTemplate,
  MessageTemplate
} from '../infra/factories/conversation-factory';

/**
 * Educational badge configuration
 */
export interface EducationalBadge {
  id: 'ai' | 'flow' | 'crm';
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  arrowDirection: 'down' | 'up' | 'left' | 'right';
  triggerAtMessageIndex: number;
  displayDuration: number; // in milliseconds
}

/**
 * WhatsApp Flow step configuration
 */
export interface FlowStep {
  id: 'guests' | 'date' | 'time' | 'confirmation';
  title: string;
  content: any;
  triggerAtMessageIndex: number;
  stepDelay: number; // delay before this step shows
}

/**
 * Restaurant reservation scenario configuration
 */
export const restaurantReservationScenario = {
  metadata: {
    id: 'restaurant-reservation',
    title: 'Reserva de Mesa',
    description: 'Demostración de reserva de restaurante con IA, Flow y CRM',
    tags: ['restaurant', 'booking', 'ai', 'flow', 'crm', 'demo'],
    businessName: 'Tu Negocio',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'es',
    category: 'hospitality'
  },

  // Educational badges configuration
  educationalBadges: [
    {
      id: 'ai',
      title: 'Respuesta con IA',
      subtitle: 'Entiende contexto natural',
      color: 'text-purple-100',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      position: { top: '30%', right: '-160px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 1, // After first bot response
      displayDuration: 2500
    },
    {
      id: 'flow',
      title: 'Proceso Mejorado',
      subtitle: 'WhatsApp Flow nativo',
      color: 'text-yellow-100',
      bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      position: { bottom: '40%', right: '-160px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 3, // After flow trigger message
      displayDuration: 3000
    },
    {
      id: 'crm',
      title: 'Integración CRM',
      subtitle: 'Datos sincronizados automáticamente',
      color: 'text-blue-100',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      position: { top: '30%', left: '-170px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 5, // After completion message
      displayDuration: 3000
    }
  ] as EducationalBadge[],

  // WhatsApp Flow configuration
  flowSteps: [
    {
      id: 'guests',
      title: '¿Cuántas personas?',
      content: {
        type: 'guest_selection',
        options: [1, 2, 3, 4, 5, 6, 7, 8],
        defaultValue: 6
      },
      triggerAtMessageIndex: 3,
      stepDelay: 1500
    },
    {
      id: 'date',
      title: '¿Qué día prefieres?',
      content: {
        type: 'date_selection',
        daysAhead: 3,
        defaultValue: 1 // tomorrow
      },
      triggerAtMessageIndex: 3,
      stepDelay: 4000
    },
    {
      id: 'time',
      title: '¿A qué hora?',
      content: {
        type: 'time_selection',
        options: ['18:00', '19:00', '20:00', '21:00'],
        defaultValue: '19:00'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 6500
    },
    {
      id: 'confirmation',
      title: '¡Reserva confirmada!',
      content: {
        type: 'confirmation',
        message: 'Te hemos enviado la confirmación por WhatsApp'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 9000
    }
  ] as FlowStep[],

  // Animation timing configuration
  timing: {
    // Exact timing from the original component
    initialDelay: 4500,
    messageTimings: [
      { phase: 'customer_typing1', delay: 4500 },
      { phase: 'customer1', delay: 5000 },
      { phase: 'message_read1', delay: 5200 },
      { phase: 'badge_ai', delay: 5800 },
      { phase: 'bot_typing1', delay: 6000 },
      { phase: 'bot1', delay: 7000 },
      { phase: 'customer_typing2', delay: 9500 },
      { phase: 'customer2', delay: 10000 },
      { phase: 'message_read2', delay: 10200 },
      { phase: 'bot_typing2', delay: 11000 },
      { phase: 'bot2', delay: 12000 },
      { phase: 'badge_flow', delay: 14000 },
      { phase: 'flow', delay: 15500 },
      { phase: 'badge_crm', delay: 21000 },
      { phase: 'complete', delay: 23000 }
    ],
    restartDelay: 30000
  },

  // Message sequence - simplified to match MessageTemplate interface
  messages: [
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Hola, ¿tienen disponible una mesa para 6 personas?' },
      delayBeforeTyping: 4500,
      typingDuration: 2000
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: '¡Claro que sí! ¿Te gustaría reservar? 😊' },
      delayBeforeTyping: 1000,
      typingDuration: 1500
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Sí' },
      delayBeforeTyping: 2500,
      typingDuration: 800
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'Perfecto, te voy a ayudar con la reserva 🍽️' },
      delayBeforeTyping: 1000,
      typingDuration: 1500
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: '¡Excelente! Tu reserva está confirmada. Te esperamos mañana a las 19:00. ¡Gracias! 🎉' },
      delayBeforeTyping: 9000,
      typingDuration: 2000
    }
  ] as MessageTemplate[]
};

/**
 * Factory function to create the restaurant reservation conversation
 */
export function createRestaurantReservationConversation(): Conversation {
  const template: ConversationTemplate = {
    metadata: {
      title: restaurantReservationScenario.metadata.title,
      description: restaurantReservationScenario.metadata.description,
      tags: restaurantReservationScenario.metadata.tags,
      businessName: restaurantReservationScenario.metadata.businessName,
      businessPhoneNumber: restaurantReservationScenario.metadata.businessPhoneNumber,
      userPhoneNumber: restaurantReservationScenario.metadata.userPhoneNumber,
      language: restaurantReservationScenario.metadata.language,
      category: restaurantReservationScenario.metadata.category
    },
    messages: restaurantReservationScenario.messages,
    settings: {
      playbackSpeed: 1.0,
      autoAdvance: true,
      showTypingIndicators: true,
      showReadReceipts: true
    }
  };

  return ConversationFactory.createFromTemplate(template);
}

/**
 * Enhanced WhatsApp Simulator component interface
 * This extends the basic ConversationSimulator with educational badges and flow support
 */
export interface WhatsAppSimulatorProps {
  scenario?: typeof restaurantReservationScenario;
  device?: 'iphone14' | 'android' | 'desktop';
  autoPlay?: boolean;
  enableEducationalBadges?: boolean;
  enableGifExport?: boolean;
  onComplete?: () => void;
  onBadgeShow?: (badge: EducationalBadge) => void;
  onFlowStep?: (step: FlowStep) => void;
  className?: string;
}
