/**
 * Loyalty Program Scenario - Club VIP Automático
 * Universal case that works for any type of business
 * Hook: "Tus clientes presumiendo ser VIP de tu negocio"
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
  id: 'ai' | 'flow' | 'crm' | 'visual-ai' | 'gamification';
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
 * WhatsApp Flow step configuration for loyalty program
 */
export interface FlowStep {
  id: 'photo-upload' | 'points-calculation' | 'reward-selection' | 'confirmation';
  title: string;
  content: any;
  triggerAtMessageIndex: number;
  stepDelay: number; // delay before this step shows
}

/**
 * Loyalty Program scenario configuration
 */
export const loyaltyProgramScenario = {
  metadata: {
    id: 'loyalty-program',
    title: 'Club VIP Automático',
    description: 'Programa de fidelización automático con reconocimiento visual de tickets',
    tags: ['loyalty', 'vip', 'gamification', 'visual-ai', 'retention', 'demo'],
    businessName: 'Tu Negocio VIP',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'es',
    category: 'loyalty',
    vertical: 'universal',
    roi: {
      metric: '+200% frecuencia de compra',
      value: '+40% ticket promedio',
      timeline: 'en 30 días'
    },
    hook: {
      emotional: 'Tus clientes presumiendo ser VIP de tu negocio',
      rational: '3x frecuencia de compra en clientes leales'
    }
  },

  // Message sequence for loyalty program demo
  messages: [
    {
      id: 'msg1',
      sender: 'user' as const,
      text: '¡Hola! 📸 Aquí tienes la foto de mi ticket de compra',
      timestamp: 1000,
      status: 'sent' as const,
      hasMedia: true,
      mediaType: 'image' as const
    },
    {
      id: 'msg2',
      sender: 'business' as const,
      text: '🎉 ¡Genial! He detectado tu compra de $45. Has ganado 45 puntos VIP.',
      timestamp: 2500,
      status: 'sent' as const,
      aiTrigger: true // Show AI badge after this message
    },
    {
      id: 'msg3',
      sender: 'business' as const,
      text: '✨ ¡FELICIDADES! Con 450 puntos totales has desbloqueado el premio "Descuento 20%"',
      timestamp: 4000,
      status: 'sent' as const,
      gamificationTrigger: true
    },
    {
      id: 'msg4',
      sender: 'user' as const,
      text: '¡Wow! ¿Cómo puedo usar mi descuento?',
      timestamp: 5500,
      status: 'sent' as const
    },
    {
      id: 'msg5',
      sender: 'business' as const,
      text: '🏆 Te abro la galería de premios VIP para que elijas cómo usar tus puntos:',
      timestamp: 7000,
      status: 'sent' as const,
      flowTrigger: true // Trigger flow after this message
    },
    {
      id: 'msg6',
      sender: 'business' as const,
      text: '✅ ¡Perfecto! Tu descuento del 20% está activo. Tu nuevo status: ⭐ CLIENTE VIP GOLD ⭐',
      timestamp: 12000,
      status: 'sent' as const,
      crmTrigger: true
    },
    {
      id: 'msg7',
      sender: 'user' as const,
      text: '¡Me encanta ser VIP! 😍',
      timestamp: 13500,
      status: 'sent' as const
    },
    {
      id: 'msg8',
      sender: 'business' as const,
      text: '🎊 ¡Compártelo en tus redes! Tus amigos también pueden ser VIP. La fidelidad se premia.',
      timestamp: 15000,
      status: 'sent' as const,
      final: true
    }
  ] as MessageTemplate[],

  // Educational badges configuration
  educationalBadges: [
    {
      id: 'visual-ai',
      title: 'IA Visual Avanzada',
      subtitle: 'Reconoce tickets y calcula puntos automáticamente',
      color: 'text-purple-100',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      position: { top: '25%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 1, // After AI recognizes the ticket
      displayDuration: 3000
    },
    {
      id: 'gamification',
      title: 'Gamificación Inteligente',
      subtitle: 'Niveles VIP que motivan más compras',
      color: 'text-amber-100',
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      position: { bottom: '35%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 2, // After points and level up
      displayDuration: 3000
    },
    {
      id: 'flow',
      title: 'Galería de Premios',
      subtitle: 'Interfaz nativa de WhatsApp',
      color: 'text-green-100',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      position: { bottom: '45%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 4, // After flow trigger message
      displayDuration: 3500
    },
    {
      id: 'crm',
      title: 'CRM Integrado',
      subtitle: 'Status VIP sincronizado en tiempo real',
      color: 'text-blue-100',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      position: { top: '25%', left: '-190px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 5, // After VIP status update
      displayDuration: 3000
    }
  ] as EducationalBadge[],

  // WhatsApp Flow configuration for reward selection
  flowSteps: [
    {
      id: 'photo-upload',
      title: 'Subir foto del ticket',
      content: {
        type: 'image_upload',
        description: 'Sube la foto de tu ticket de compra',
        acceptedFormats: ['jpg', 'png', 'heic']
      },
      triggerAtMessageIndex: 4,
      stepDelay: 1500
    },
    {
      id: 'points-calculation',
      title: 'Cálculo de puntos',
      content: {
        type: 'points_display',
        currentPoints: 405,
        newPoints: 45,
        totalPoints: 450,
        calculation: '$45 compra = 45 puntos (1 punto por $1)'
      },
      triggerAtMessageIndex: 4,
      stepDelay: 3000
    },
    {
      id: 'reward-selection',
      title: 'Galería de premios VIP',
      content: {
        type: 'reward_gallery',
        availableRewards: [
          {
            id: 'discount20',
            title: 'Descuento 20%',
            points: 400,
            description: 'En tu próxima compra',
            icon: '💸',
            available: true
          },
          {
            id: 'freeProduct',
            title: 'Producto Gratis',
            points: 600,
            description: 'Elige el que más te guste',
            icon: '🎁',
            available: false
          },
          {
            id: 'vipAccess',
            title: 'Acceso VIP Events',
            points: 1000,
            description: 'Eventos exclusivos',
            icon: '🌟',
            available: false
          }
        ],
        selectedReward: 'discount20'
      },
      triggerAtMessageIndex: 4,
      stepDelay: 4500
    },
    {
      id: 'confirmation',
      title: 'Confirmación VIP',
      content: {
        type: 'vip_confirmation',
        rewardApplied: 'Descuento 20%',
        newVipLevel: 'GOLD',
        benefits: [
          'Descuentos exclusivos',
          'Acceso prioritario',
          'Puntos dobles los viernes'
        ],
        shareMessage: '¡Soy cliente VIP GOLD! 🌟'
      },
      triggerAtMessageIndex: 4,
      stepDelay: 7000
    }
  ] as FlowStep[],

  // Timing configuration for smooth flow
  timing: {
    messageDelay: 1500,        // Delay between messages
    typingDuration: 1200,      // How long typing indicator shows
    readDelay: 300,            // Delay before marking as read
    restartDelay: 4000,        // Delay before conversation restarts
    flowTransitionDelay: 500   // Delay between flow steps
  }
};

/**
 * Factory function to create loyalty program conversation
 */
export function createLoyaltyProgramConversation(): Conversation {
  const template: ConversationTemplate = {
    metadata: loyaltyProgramScenario.metadata,
    messages: loyaltyProgramScenario.messages,
    flows: loyaltyProgramScenario.flowSteps.map(step => ({
      id: step.id,
      title: step.title,
      steps: [], // Will be populated by the flow execution system
      triggerAtMessageIndex: step.triggerAtMessageIndex
    })),
    timing: loyaltyProgramScenario.timing
  };

  return ConversationFactory.createFromTemplate(template);
}

/**
 * Export for use in scenario selector
 */
export default loyaltyProgramScenario;