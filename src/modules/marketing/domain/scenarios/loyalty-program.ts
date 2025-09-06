/**
 * Loyalty Program Scenario
 * Simulation for customer loyalty and rewards via WhatsApp
 */

import { Award } from 'lucide-react';

import {
  BaseMessage,
  FlowDefinition,
  SimulationType
} from '../types/simulation.types';

import { BaseScenario } from './base-scenario';

/**
 * Loyalty Program Scenario Implementation
 */
export default class LoyaltyProgramScenario extends BaseScenario {
  id: SimulationType = 'loyalty-program';
  name = 'Programa de Fidelización';
  businessName = 'Club Premium';
  description = 'Sistema automático de puntos y recompensas';
  icon = Award as any;
  duration = 26000;

  messages: BaseMessage[] = [
    this.createMessage(
      'lp-1',
      'customer',
      'Hola! Acabo de comprar en vuestra tienda y me han dicho que tenéis un programa de puntos'
    ),
    this.createMessage(
      'lp-2',
      'bot',
      '¡Hola! 👋 ¡Bienvenido a Club Premium! 🌟\n\n¡Sí! Tenemos un programa de fidelización súper ventajoso. Con cada compra acumulas puntos que puedes canjear por descuentos y regalos exclusivos 🎁\n\n¿Tienes el ticket de compra a mano? Puedo registrar tus puntos ahora mismo'
    ),
    this.createMessage(
      'lp-3',
      'customer',
      'Sí, aquí lo tengo'
    ),
    this.createMessage(
      'lp-4',
      'bot',
      'Perfecto! Por favor, envíame una foto del ticket o dime el número que aparece en la parte inferior 📱\n\nTambién puedes escribir el importe total de la compra si lo prefieres'
    ),
    this.createMessage(
      'lp-5',
      'customer',
      'El número es TK-2024-8934 y fueron 47,50€'
    ),
    this.createMessage(
      'lp-6',
      'bot',
      '¡Excelente! Ticket localizado ✅\n\n💳 Compra: 47,50€\n🌟 Puntos ganados: 95 puntos\n(2 puntos por cada euro)\n\n¿Es tu primera vez en Club Premium? Te explico cómo funciona:\n\n• 100 puntos = 5€ descuento\n• 200 puntos = 12€ descuento\n• 500 puntos = 35€ descuento + Regalo sorpresa 🎁\n\n¿Quieres crear tu cuenta ahora? ¡Solo necesito tu nombre!'
    ),
    this.createMessage(
      'lp-7',
      'customer',
      'Sí! Soy Ana Rodríguez'
    ),
    this.createMessage(
      'lp-8',
      'bot',
      '¡Bienvenida Ana! 🎉 Tu cuenta Club Premium está activa\n\n📊 TU SALDO ACTUAL:\n• Puntos disponibles: 95 ⭐\n• Equivalente: 4,75€ en descuentos\n• Próximo nivel: 5 puntos más para tu primer descuento de 5€\n\n🎯 BENEFICIOS EXCLUSIVOS:\n• Descuentos especiales cada mes\n• Acceso anticipado a rebajas\n• Regalos en tu cumpleaños 🎂\n• Envío gratis en compras online\n\n¿Te gustaría recibir notificaciones de ofertas exclusivas?'
    ),
    this.createMessage(
      'lp-9',
      'customer',
      'Sí, me interesa'
    ),
    this.createMessage(
      'lp-10',
      'bot',
      '¡Perfecto! Te he activado las notificaciones VIP 📱\n\n🔔 Recibirás:\n• Ofertas flash exclusivas (hasta -50%)\n• Doble de puntos en días especiales\n• Cupones personalizados según tus compras\n• Recordatorio cuando tengas descuentos disponibles\n\n💡 CONSEJO: Esta semana hay puntos DOBLES en toda la sección de accesorios. ¡Aprovecha! 😊'
    ),
    this.createMessage(
      'lp-11',
      'customer',
      '¿Y cómo uso mis puntos cuando vuelva a comprar?'
    ),
    this.createMessage(
      'lp-12',
      'bot',
      '¡Súper fácil! Tienes 3 formas:\n\n1️⃣ EN TIENDA FÍSICA:\nDi que eres del Club Premium y da tu teléfono. ¡Listo!\n\n2️⃣ COMPRA ONLINE:\nTus puntos aparecen automáticamente en el checkout\n\n3️⃣ POR WHATSAPP:\nEscríbeme antes de pagar y te genero un cupón QR al instante\n\n💳 Tu código de cliente: ANA-8934\n🌟 Saldo actual: 95 puntos\n\n¡Ah! Y como bienvenida, te regalo un 10% extra en tu próxima compra. Código: BIENVENIDA10 ✨\n\n¿Alguna pregunta más?'
    ),
    this.createMessage(
      'lp-13',
      'customer',
      'No, todo claro. ¡Gracias!'
    ),
    this.createMessage(
      'lp-14',
      'bot',
      '¡De nada Ana! Me alegro de tenerte en Club Premium 🌟\n\nRecuerda:\n• Tienes 95 puntos disponibles\n• 10% descuento extra en tu próxima compra\n• Escríbeme cuando quieras consultar tu saldo o canjear puntos\n\n¡Disfruta de tus ventajas VIP! 💜'
    )
  ];

  flows: FlowDefinition[] = [
    {
      id: 'loyalty-flow',
      trigger: 'auto',
      triggerDelay: 12000,
      steps: [
        {
          id: 'action',
          type: 'selection',
          title: '¿Qué quieres hacer?',
          subtitle: 'Gestiona tu cuenta de puntos',
          options: [
            { id: 'register-purchase', label: '📱 Registrar ticket de compra', value: 'register' },
            { id: 'check-balance', label: '💰 Consultar mis puntos', value: 'balance' },
            { id: 'redeem-points', label: '🎁 Canjear puntos', value: 'redeem' },
            { id: 'view-rewards', label: '🏆 Ver catálogo de premios', value: 'rewards' },
            { id: 'special-offers', label: '⚡ Ofertas exclusivas', value: 'offers' },
            { id: 'birthday-gift', label: '🎂 Mi regalo de cumpleaños', value: 'birthday' }
          ]
        },
        {
          id: 'ticket-type',
          type: 'selection',
          title: '¿Cómo quieres registrar tu compra?',
          subtitle: 'Elige el método más cómodo',
          options: [
            { id: 'photo', label: '📸 Enviar foto del ticket', value: 'photo' },
            { id: 'number', label: '🔢 Escribir número de ticket', value: 'number' },
            { id: 'amount', label: '💶 Introducir importe', value: 'amount' },
            { id: 'online', label: '🌐 Compra online (automático)', value: 'online' }
          ]
        },
        {
          id: 'purchase-amount',
          type: 'input',
          title: 'Importe de tu compra',
          subtitle: 'Ganarás 2 puntos por cada euro',
          placeholder: 'Ej: 25.50',
          validation: (value: string) => {
            const amount = parseFloat(value);
            if (isNaN(amount) || amount <= 0) {
              return 'Por favor, introduce un importe válido';
            }
            return true;
          }
        },
        {
          id: 'reward-selection',
          type: 'selection',
          title: 'Elige tu recompensa',
          subtitle: 'Según tus puntos disponibles',
          options: [
            { id: '5-discount', label: '5€ descuento (100 puntos)', value: '5', disabled: false },
            { id: '12-discount', label: '12€ descuento (200 puntos)', value: '12', disabled: false },
            { id: '25-discount', label: '25€ descuento (400 puntos)', value: '25', disabled: true },
            { id: '35-gift', label: '35€ + Regalo (500 puntos)', value: '35', disabled: true },
            { id: 'free-shipping', label: 'Envío gratis (50 puntos)', value: 'shipping', disabled: false },
            { id: 'birthday-extra', label: 'Extra cumpleaños (0 puntos)', value: 'birthday', disabled: false }
          ]
        },
        {
          id: 'personal-info',
          type: 'input',
          title: 'Tu nombre completo',
          subtitle: 'Para crear tu cuenta Premium',
          placeholder: 'Ej: María García',
          validation: (value: string) => {
            if (!value || value.length < 3) {
              return 'Por favor, introduce tu nombre';
            }
            return true;
          }
        },
        {
          id: 'birthday',
          type: 'date',
          title: '¿Cuándo es tu cumpleaños?',
          subtitle: 'Te enviaremos un regalo especial 🎁',
          options: [] // Would be generated dynamically
        },
        {
          id: 'preferences',
          type: 'multi-select',
          title: '¿Qué te interesa más?',
          subtitle: 'Personalizaremos tus ofertas',
          options: [
            { id: 'fashion', label: '👗 Moda y accesorios', value: 'fashion' },
            { id: 'beauty', label: '💄 Belleza y cosmética', value: 'beauty' },
            { id: 'home', label: '🏠 Hogar y decoración', value: 'home' },
            { id: 'tech', label: '📱 Tecnología', value: 'tech' },
            { id: 'sports', label: '⚽ Deporte', value: 'sports' },
            { id: 'kids', label: '👶 Infantil', value: 'kids' }
          ]
        },
        {
          id: 'notifications',
          type: 'selection',
          title: '¿Quieres recibir ofertas VIP?',
          subtitle: 'Solo las mejores, promesa 🤞',
          options: [
            { id: 'all', label: '✅ Sí, todas las ofertas', value: 'all' },
            { id: 'weekly', label: '📅 Solo resumen semanal', value: 'weekly' },
            { id: 'important', label: '⭐ Solo las muy especiales', value: 'important' },
            { id: 'none', label: '❌ No, gracias', value: 'none' }
          ]
        },
        {
          id: 'loyalty-confirmation',
          type: 'confirmation',
          title: '¡Bienvenido a Club Premium! 🎉',
          subtitle: 'Ya eres VIP'
        }
      ]
    }
  ];
}