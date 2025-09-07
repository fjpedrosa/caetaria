/**
 * Restaurant Reservation Scenario
 * Showcases WhatsApp Flows for interactive form filling
 */

import type { ConversationScenario } from '@/modules/marketing/domain/types/whatsapp-features.types';

export const restaurantReservationScenario: ConversationScenario = {
  id: 'restaurant-reservation',
  title: 'Reserva de Restaurante',
  businessName: 'La Cocina Gourmet',
  businessType: 'Restaurante',
  description: 'Sistema de reservas automatizado usando WhatsApp Flows',
  features: ['WhatsApp Flows', 'Quick Reply Buttons', 'Message Templates'],
  duration: 30000,
  messages: [
    {
      id: '1',
      type: 'text',
      sender: 'customer',
      content: 'Hola, quiero hacer una reserva',
      timestamp: Date.now(),
      status: 'read',
      delay: 1000
    },
    {
      id: '2',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'welcome',
        type: 'marketing',
        header: {
          type: 'image',
          content: '/images/restaurant-banner.jpg'
        },
        body: '¡Hola! 👋 Bienvenido a La Cocina Gourmet\n\nNos alegra que quieras visitarnos. Nuestro restaurante ofrece una experiencia gastronómica única con los mejores ingredientes de temporada.\n\n¿Cómo te gustaría continuar?',
        footer: 'Horario: Lun-Dom 12:00-23:00',
        buttons: [
          {
            id: 'reserve',
            text: '📅 Hacer Reserva',
            icon: '📅'
          },
          {
            id: 'menu',
            text: '📋 Ver Menú',
            icon: '📋'
          },
          {
            id: 'location',
            text: '📍 Ubicación',
            icon: '📍'
          }
        ]
      }
    },
    {
      id: '3',
      type: 'text',
      sender: 'customer',
      content: 'Hacer Reserva',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '4',
      type: 'text',
      sender: 'bot',
      content: 'Perfecto! Te voy a enviar un formulario rápido para completar tu reserva. Es muy fácil y solo tomará un minuto 📝',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000
    },
    {
      id: '5',
      type: 'flow',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500,
      flow: {
        id: 'reservation-flow',
        title: 'Formulario de Reserva',
        description: 'Por favor, completa los siguientes datos para tu reserva',
        steps: [
          {
            id: 'name',
            type: 'text-input',
            label: 'Nombre completo',
            placeholder: 'Ej: Juan Pérez',
            required: true
          },
          {
            id: 'date',
            type: 'date-picker',
            label: 'Fecha de reserva',
            required: true,
            validation: {
              min: Date.now(),
              max: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días
              message: 'Solo aceptamos reservas con máximo 30 días de anticipación'
            }
          },
          {
            id: 'time',
            type: 'single-select',
            label: 'Hora preferida',
            required: true,
            options: [
              { id: '12:00', label: '12:00 PM', value: '12:00' },
              { id: '13:00', label: '1:00 PM', value: '13:00' },
              { id: '14:00', label: '2:00 PM', value: '14:00' },
              { id: '19:00', label: '7:00 PM', value: '19:00' },
              { id: '20:00', label: '8:00 PM', value: '20:00' },
              { id: '21:00', label: '9:00 PM', value: '21:00' }
            ]
          },
          {
            id: 'guests',
            type: 'number-input',
            label: 'Número de personas',
            placeholder: '2',
            required: true,
            validation: {
              min: 1,
              max: 12,
              message: 'Para grupos mayores a 12 personas, por favor contacte directamente'
            }
          },
          {
            id: 'area',
            type: 'single-select',
            label: 'Área preferida',
            required: false,
            options: [
              { id: 'interior', label: 'Interior', value: 'interior' },
              { id: 'terraza', label: 'Terraza', value: 'terraza' },
              { id: 'jardin', label: 'Jardín', value: 'jardin' },
              { id: 'privado', label: 'Salón Privado', value: 'privado' }
            ]
          },
          {
            id: 'preferences',
            type: 'multi-select',
            label: 'Preferencias especiales',
            required: false,
            options: [
              { id: 'vegetariano', label: '🥗 Menú Vegetariano', value: 'vegetariano' },
              { id: 'vegano', label: '🌱 Menú Vegano', value: 'vegano' },
              { id: 'sin-gluten', label: '🌾 Sin Gluten', value: 'sin-gluten' },
              { id: 'ninos', label: '👶 Silla para bebé', value: 'ninos' },
              { id: 'accesible', label: '♿ Acceso para silla de ruedas', value: 'accesible' }
            ]
          },
          {
            id: 'notes',
            type: 'text-input',
            label: 'Comentarios adicionales',
            placeholder: 'Ej: Celebración de cumpleaños',
            required: false
          }
        ],
        submitButton: {
          text: 'Confirmar Reserva',
          color: '#25D366'
        }
      }
    },
    {
      id: '6',
      type: 'text',
      sender: 'customer',
      content: '✅ Formulario completado:\n• Nombre: Ana García\n• Fecha: 15 de Diciembre\n• Hora: 8:00 PM\n• Personas: 4\n• Área: Terraza\n• Preferencias: Menú Vegetariano',
      timestamp: Date.now(),
      status: 'read',
      delay: 8000
    },
    {
      id: '7',
      type: 'text',
      sender: 'bot',
      content: '¡Excelente! Estoy procesando tu reserva... 🔄',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '8',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2500,
      template: {
        id: 'confirmation',
        type: 'utility',
        header: {
          type: 'text',
          content: '✅ RESERVA CONFIRMADA'
        },
        body: '¡Tu reserva ha sido confirmada con éxito!\n\n📅 **Fecha:** 15 de Diciembre, 2024\n⏰ **Hora:** 8:00 PM\n👥 **Personas:** 4\n📍 **Mesa:** Terraza\n\n**Código de reserva:** #RES2024-1215\n\nHemos tomado nota de tus preferencias vegetarianas y prepararemos opciones especiales para tu grupo.',
        footer: 'Te esperamos en Av. Principal 123, Ciudad',
        callToAction: {
          type: 'phone',
          text: '📞 Llamar al restaurante',
          value: '+34912345678'
        }
      }
    },
    {
      id: '9',
      type: 'quick-reply',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      content: '¿Te gustaría agregar algo más a tu experiencia?',
      quickReplyButtons: [
        {
          id: 'wine',
          text: '🍷 Maridaje de vinos',
          icon: '🍷'
        },
        {
          id: 'cake',
          text: '🎂 Pastel especial',
          icon: '🎂'
        },
        {
          id: 'done',
          text: '✅ Todo listo',
          icon: '✅'
        }
      ]
    },
    {
      id: '10',
      type: 'text',
      sender: 'customer',
      content: 'Todo listo',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '11',
      type: 'text',
      sender: 'bot',
      content: '¡Perfecto! 🎉\n\nTe enviaremos un recordatorio 24 horas antes de tu reserva.\n\nSi necesitas hacer cambios, puedes responder a este chat o llamarnos directamente.\n\n¡Nos vemos pronto! 👨‍🍳',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000
    },
    {
      id: '12',
      type: 'text',
      sender: 'bot',
      content: '💡 *¿Sabías que?*\n\nCon WhatsApp Flows, tus clientes pueden completar formularios complejos sin salir del chat. Esto aumenta la tasa de conversión en un 73% comparado con enlaces externos.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    }
  ]
};