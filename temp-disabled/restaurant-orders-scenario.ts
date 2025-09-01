/**
 * Restaurant Orders Scenario - Pedidos Sin Llamadas
 * Specific for restaurants to show order taking without phone calls
 * Hook: "Recupera el 40% de ventas perdidas en hora pico"
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
  id: 'ai' | 'flow' | 'crm' | 'catalog' | 'upselling' | 'payment';
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
 * WhatsApp Flow step configuration for restaurant orders
 */
export interface FlowStep {
  id: 'menu-selection' | 'customization' | 'cart-review' | 'checkout' | 'confirmation';
  title: string;
  content: any;
  triggerAtMessageIndex: number;
  stepDelay: number; // delay before this step shows
}

/**
 * Restaurant Orders scenario configuration
 */
export const restaurantOrdersScenario = {
  metadata: {
    id: 'restaurant-orders',
    title: 'Pedidos Sin Llamadas',
    description: 'Sistema de pedidos automático para restaurantes sin necesidad de atender llamadas',
    tags: ['restaurant', 'orders', 'catalog', 'payment', 'automation', 'demo'],
    businessName: 'Pizzería Don Mario',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'es',
    category: 'restaurant',
    vertical: 'restaurant',
    roi: {
      metric: '+40% pedidos diarios',
      value: '+25% ticket promedio',
      timeline: 'desde día 1'
    },
    hook: {
      emotional: 'Tu cocina cocinando, no atendiendo llamadas',
      rational: 'Recupera el 40% de ventas perdidas en hora pico'
    }
  },

  // Message sequence for restaurant order demo
  messages: [
    {
      id: 'msg1',
      sender: 'user' as const,
      text: '¡Hola! Quiero pedir una pizza para delivery 🍕',
      timestamp: 1000,
      status: 'sent' as const
    },
    {
      id: 'msg2',
      sender: 'business' as const,
      text: '¡Perfecto! 😊 Te ayudo con tu pedido. ¿Te muestro nuestro menú digital?',
      timestamp: 2500,
      status: 'sent' as const,
      aiTrigger: true // Show AI understanding badge
    },
    {
      id: 'msg3',
      sender: 'user' as const,
      text: 'Sí, por favor',
      timestamp: 4000,
      status: 'sent' as const
    },
    {
      id: 'msg4',
      sender: 'business' as const,
      text: '🍕 Aquí tienes nuestro catálogo completo con fotos y precios actualizados:',
      timestamp: 5500,
      status: 'sent' as const,
      catalogTrigger: true,
      flowTrigger: true // Trigger menu flow
    },
    {
      id: 'msg5',
      sender: 'business' as const,
      text: '🛒 ¡Excelente elección! Pizza Familiar + Bebida = $25. ¿Te gustaría agregar algo más?',
      timestamp: 10000,
      status: 'sent' as const,
      upsellingTrigger: true
    },
    {
      id: 'msg6',
      sender: 'user' as const,
      text: 'Sí, unas papas fritas 🍟',
      timestamp: 11500,
      status: 'sent' as const
    },
    {
      id: 'msg7',
      sender: 'business' as const,
      text: '🎉 Perfecto! Total: $32. Te mando el link de pago seguro. Tiempo estimado: 35 min.',
      timestamp: 13000,
      status: 'sent' as const,
      paymentTrigger: true
    },
    {
      id: 'msg8',
      sender: 'business' as const,
      text: '✅ ¡Pago confirmado! Tu pedido #1247 está en preparación. Te avisamos cuando salga 🚗',
      timestamp: 16000,
      status: 'sent' as const,
      crmTrigger: true
    },
    {
      id: 'msg9',
      sender: 'user' as const,
      text: '¡Genial! Súper fácil 👏',
      timestamp: 17500,
      status: 'sent' as const
    },
    {
      id: 'msg10',
      sender: 'business' as const,
      text: '🙏 ¡Gracias por elegir Don Mario! Tu próximo pedido tiene 10% descuento automático.',
      timestamp: 19000,
      status: 'sent' as const,
      final: true
    }
  ] as MessageTemplate[],

  // Educational badges configuration
  educationalBadges: [
    {
      id: 'ai',
      title: 'IA Gastronómica',
      subtitle: 'Entiende pedidos en lenguaje natural',
      color: 'text-purple-100',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      position: { top: '20%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 1, // After AI understands the order request
      displayDuration: 3000
    },
    {
      id: 'catalog',
      title: 'Catálogo Dinámico',
      subtitle: 'Precios y disponibilidad en tiempo real',
      color: 'text-orange-100',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      position: { bottom: '45%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 3, // After showing catalog
      displayDuration: 3500
    },
    {
      id: 'upselling',
      title: 'Upselling Inteligente',
      subtitle: 'Sugerencias que aumentan el ticket +25%',
      color: 'text-green-100',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      position: { bottom: '25%', right: '-180px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 4, // After upselling suggestion
      displayDuration: 3000
    },
    {
      id: 'payment',
      title: 'Pagos Integrados',
      subtitle: 'Checkout seguro sin salir de WhatsApp',
      color: 'text-blue-100',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      position: { top: '30%', left: '-190px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 6, // After payment processing
      displayDuration: 3000
    },
    {
      id: 'crm',
      title: 'Seguimiento Automático',
      subtitle: 'Cliente informado en cada paso',
      color: 'text-teal-100',
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      position: { top: '15%', left: '-190px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 7, // After order confirmation
      displayDuration: 3000
    }
  ] as EducationalBadge[],

  // WhatsApp Flow configuration for menu ordering
  flowSteps: [
    {
      id: 'menu-selection',
      title: 'Selección del menú',
      content: {
        type: 'product_catalog',
        categories: [
          {
            id: 'pizzas',
            name: 'Pizzas',
            products: [
              {
                id: 'margherita',
                name: 'Pizza Margherita',
                price: 18,
                description: 'Clásica con albahaca fresca',
                image: '🍕',
                available: true
              },
              {
                id: 'familiar',
                name: 'Pizza Familiar',
                price: 22,
                description: 'Grande para compartir',
                image: '🍕',
                available: true,
                popular: true
              }
            ]
          },
          {
            id: 'bebidas',
            name: 'Bebidas',
            products: [
              {
                id: 'coca-cola',
                name: 'Coca-Cola 1.5L',
                price: 3,
                description: 'Refresco familiar',
                image: '🥤',
                available: true
              }
            ]
          }
        ],
        selectedItems: ['familiar', 'coca-cola']
      },
      triggerAtMessageIndex: 3,
      stepDelay: 1500
    },
    {
      id: 'customization',
      title: 'Personalización',
      content: {
        type: 'product_customization',
        product: 'Pizza Familiar',
        options: [
          {
            type: 'size',
            label: 'Tamaño',
            selected: 'familiar',
            options: ['mediana', 'familiar', 'gigante']
          },
          {
            type: 'extras',
            label: 'Extras',
            selected: ['extra-queso'],
            options: ['extra-queso', 'aceitunas', 'champiñones']
          }
        ]
      },
      triggerAtMessageIndex: 3,
      stepDelay: 3000
    },
    {
      id: 'cart-review',
      title: 'Revisión del carrito',
      content: {
        type: 'cart_summary',
        items: [
          {
            name: 'Pizza Familiar con extra queso',
            quantity: 1,
            price: 25
          },
          {
            name: 'Coca-Cola 1.5L',
            quantity: 1,
            price: 3
          }
        ],
        subtotal: 28,
        delivery: 2,
        total: 30,
        estimatedTime: '35-40 min'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 4500
    },
    {
      id: 'checkout',
      title: 'Método de pago',
      content: {
        type: 'payment_selection',
        methods: [
          {
            id: 'card',
            name: 'Tarjeta de crédito/débito',
            icon: '💳',
            selected: true
          },
          {
            id: 'cash',
            name: 'Efectivo en entrega',
            icon: '💵',
            selected: false
          }
        ],
        total: 30,
        currency: 'USD'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 6000
    },
    {
      id: 'confirmation',
      title: 'Confirmación del pedido',
      content: {
        type: 'order_confirmation',
        orderNumber: '#1247',
        estimatedTime: '35 minutos',
        total: 30,
        paymentMethod: 'Tarjeta terminada en 4532',
        status: 'En preparación',
        trackingAvailable: true
      },
      triggerAtMessageIndex: 3,
      stepDelay: 8000
    }
  ] as FlowStep[],

  // Timing configuration optimized for restaurant flow
  timing: {
    messageDelay: 1500,        // Delay between messages
    typingDuration: 1200,      // How long typing indicator shows
    readDelay: 300,            // Delay before marking as read
    restartDelay: 5000,        // Delay before conversation restarts
    flowTransitionDelay: 800   // Delay between flow steps
  }
};

/**
 * Factory function to create restaurant orders conversation
 */
export function createRestaurantOrdersConversation(): Conversation {
  const template: ConversationTemplate = {
    metadata: restaurantOrdersScenario.metadata,
    messages: restaurantOrdersScenario.messages,
    flows: restaurantOrdersScenario.flowSteps.map(step => ({
      id: step.id,
      title: step.title,
      steps: [], // Will be populated by the flow execution system
      triggerAtMessageIndex: step.triggerAtMessageIndex
    })),
    timing: restaurantOrdersScenario.timing
  };

  return ConversationFactory.createFromTemplate(template);
}

/**
 * Export for use in scenario selector
 */
export default restaurantOrdersScenario;