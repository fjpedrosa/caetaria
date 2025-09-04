import { Conversation } from '../domain/entities';
import { createMessageFromScenarioConfig } from '../domain/entities/message';
import {
  ConversationTemplate,
  createConversationFromScenario,
  createConversationFromTemplate,
  createScenarioConfig,
  MessageTemplate,
  ScenarioConfig
} from '../infrastructure/factories/conversation-factory';

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
 * Hero Demo Scenario - Replica exacta del hero-mobile-demo.tsx
 */
export const heroDemoScenario = {
  metadata: {
    id: 'hero-demo',
    title: 'Demo Hero Landing',
    description: 'Demostración exacta del hero con timing original',
    tags: ['hero', 'demo', 'restaurant', 'booking', 'ai', 'flow'],
    businessName: 'Tu Negocio',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'es',
    category: 'demo'
  },

  // Educational badges configuration (similar al original)
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
      triggerAtMessageIndex: 4, // After completion message
      displayDuration: 3000
    }
  ] as EducationalBadge[],

  // WhatsApp Flow configuration - EXACTO del hero original
  flowSteps: [
    {
      id: 'guests',
      title: '¿Cuántas personas?',
      content: {
        type: 'guest_selection',
        options: [1, 2, 3, 4, 5, 6, 7, 8],
        defaultValue: 4 // Del hero: setReservationData(prev => ({ ...prev, guests: 4 }))
      },
      triggerAtMessageIndex: 3,
      stepDelay: 800 // Del hero: { step: 'guests', delay: 800 }
    },
    {
      id: 'date',
      title: '¿Qué día prefieres?',
      content: {
        type: 'date_selection',
        daysAhead: 3,
        defaultValue: 1 // Del hero: tomorrow
      },
      triggerAtMessageIndex: 3,
      stepDelay: 1600 // Del hero: { step: 'date', delay: 1600 }
    },
    {
      id: 'time',
      title: '¿A qué hora?',
      content: {
        type: 'time_selection',
        options: ['18:00', '19:00', '20:00', '21:00'],
        defaultValue: '19:00' // Del hero: setReservationData(prev => ({ ...prev, time: '19:00' }))
      },
      triggerAtMessageIndex: 3,
      stepDelay: 2400 // Del hero: { step: 'time', delay: 2400 }
    },
    {
      id: 'confirmation',
      title: '¡Reserva confirmada!',
      content: {
        type: 'confirmation',
        message: 'Te hemos enviado la confirmación por WhatsApp'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 3200 // Del hero: { step: 'confirmation', delay: 3200 }
    }
  ] as FlowStep[],

  // Animation timing configuration - EXACTO del hero-mobile-demo.tsx
  timing: {
    initialDelay: 0, // El hero empieza inmediatamente cuando isInView
    messageTimings: [
      // Basado en las líneas 51-60 del hero
      { phase: 'customer1', delay: 1000 },
      { phase: 'typing1', delay: 1500 },
      { phase: 'bot1', delay: 2000 },
      { phase: 'customer2', delay: 3500 },
      { phase: 'typing2', delay: 4000 },
      { phase: 'bot2', delay: 4500 },
      { phase: 'flow', delay: 6000 },
      { phase: 'complete', delay: 10000 }
    ],
    restartDelay: 12000, // Del hero: setTimeout(..., 12000)
    flowCloseDelay: 4800 // Del hero: setTimeout(() => setShowFlow(false), 4800)
  },

  messages: [
    {
      sender: 'user',
      type: 'text',
      content: { text: '¡Hola! ¿Tienen disponible...?' }, // Línea 386 del hero
      delayBeforeTyping: 1000, // customer1: 1000ms
      typingDuration: 500
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: '¡Hola! Sí tenemos disponible. Te ayudo ahora mismo 😊' }, // Línea 406 del hero
      delayBeforeTyping: 1500, // typing1: 1500ms
      typingDuration: 500
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Perfecto, ¿cuál es el precio?' }, // Línea 433 del hero
      delayBeforeTyping: 3500, // customer2: 3500ms
      typingDuration: 500
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: '¡Perfecto! Tenemos mesa disponible para hoy. ¿Te gustaría hacer una reserva? 🍽️' }, // Línea 451 del hero
      delayBeforeTyping: 4500, // bot2: 4500ms
      typingDuration: 1000
    },
    {
      sender: 'business',
      type: 'text',
      content: {
        text: '¡Excelente! Tu reserva está confirmada. Te esperamos el {fecha} a las {tiempo}. ¡Gracias! 🎉' // Líneas 492-498 del hero
      },
      delayBeforeTyping: 10000, // complete: 10000ms
      typingDuration: 1500
    }
  ] as MessageTemplate[]
};

/**
 * Convert scenario messages to proper Message entities
 * This ensures all messages have the correct structure
 */
export const getHeroDemoMessages = () => {
  return heroDemoScenario.messages.map((msg, index) =>
    createMessageFromScenarioConfig(msg, index)
  );
};

/**
 * Factory function para crear la configuración del scenario (evita circular dependency)
 */
export const createHeroDemoScenarioConfig = (): ScenarioConfig => {
  return createScenarioConfig({
    id: 'hero-demo',
    metadata: heroDemoScenario.metadata,
    messages: heroDemoScenario.messages,
    settings: {
      playbackSpeed: 1.0,
      autoAdvance: true,
      showTypingIndicators: true,
      showReadReceipts: true
    },
    educationalBadges: heroDemoScenario.educationalBadges,
    flowSteps: heroDemoScenario.flowSteps,
    timing: heroDemoScenario.timing
  });
};

/**
 * Factory function moderna (recomendada)
 */
export const createHeroDemoConversation = (): Conversation => {
  return createConversationFromScenario(createHeroDemoScenarioConfig());
};

/**
 * Legacy factory function para compatibilidad
 */
export function createHeroDemoConversationLegacy(): Conversation {
  const template: ConversationTemplate = {
    metadata: {
      title: heroDemoScenario.metadata.title,
      description: heroDemoScenario.metadata.description,
      tags: heroDemoScenario.metadata.tags,
      businessName: heroDemoScenario.metadata.businessName,
      businessPhoneNumber: heroDemoScenario.metadata.businessPhoneNumber,
      userPhoneNumber: heroDemoScenario.metadata.userPhoneNumber,
      language: heroDemoScenario.metadata.language,
      category: heroDemoScenario.metadata.category
    },
    messages: heroDemoScenario.messages,
    settings: {
      playbackSpeed: 1.0,
      autoAdvance: true,
      showTypingIndicators: true,
      showReadReceipts: true
    }
  };

  return createConversationFromTemplate(template);
}

/**
 * Propiedades del componente WhatsApp Simulator para el hero demo
 */
export interface HeroDemoSimulatorProps {
  scenario?: typeof heroDemoScenario;
  device?: 'iphone14' | 'android' | 'desktop';
  autoPlay?: boolean;
  enableEducationalBadges?: boolean;
  enableGifExport?: boolean;
  onComplete?: () => void;
  onBadgeShow?: (badge: EducationalBadge) => void;
  onFlowStep?: (step: FlowStep) => void;
  className?: string;
  isInView?: boolean; // Para controlar cuándo empezar la animación como en el hero
}

/**
 * Export por defecto del scenario completo
 */
export default heroDemoScenario;