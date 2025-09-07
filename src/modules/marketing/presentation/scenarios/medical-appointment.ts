/**
 * Medical Appointment Scenario
 * Showcases WhatsApp Message Templates with Quick Reply Buttons
 */

import type { ConversationScenario } from '@/modules/marketing/domain/types/whatsapp-features.types';

export const medicalAppointmentScenario: ConversationScenario = {
  id: 'medical-appointments',
  title: 'Citas Médicas',
  businessName: 'Clínica Salud Plus',
  businessType: 'Centro Médico',
  description: 'Sistema de citas médicas con plantillas de mensajes y respuestas rápidas',
  features: ['Message Templates', 'Quick Reply Buttons', 'List Messages', 'WhatsApp Flows'],
  duration: 32000,
  messages: [
    {
      id: '1',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1000,
      template: {
        id: 'appointment-reminder',
        type: 'utility',
        header: {
          type: 'image',
          content: '/images/clinic-logo.jpg'
        },
        body: '🏥 **Clínica Salud Plus**\n\nHola María García,\n\nTe recordamos tu cita médica:\n\n📅 **Fecha:** Mañana, 16 de Diciembre\n⏰ **Hora:** 10:30 AM\n👨‍⚕️ **Doctor:** Dr. Rodríguez - Medicina General\n📍 **Consultorio:** 205, Segundo piso\n\n⚠️ **Importante:**\n• Llegar 15 minutos antes\n• Traer documentación médica previa\n• Ayunas de 8 horas para análisis',
        footer: 'Si no puedes asistir, avísanos con 24h de anticipación',
        buttons: [
          {
            id: 'confirm',
            text: '✅ Confirmar asistencia',
            icon: '✅'
          },
          {
            id: 'reschedule',
            text: '📅 Cambiar fecha',
            icon: '📅'
          },
          {
            id: 'cancel',
            text: '❌ Cancelar cita',
            icon: '❌'
          }
        ]
      }
    },
    {
      id: '2',
      type: 'text',
      sender: 'customer',
      content: 'Confirmar asistencia',
      timestamp: Date.now(),
      status: 'read',
      delay: 3000
    },
    {
      id: '3',
      type: 'text',
      sender: 'bot',
      content: '¡Perfecto! ✅ Tu cita ha sido confirmada.\n\nTe enviaremos un recordatorio adicional 2 horas antes de tu cita.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '4',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'pre-appointment',
        type: 'utility',
        header: {
          type: 'document',
          content: 'Formulario_Pre-Consulta.pdf'
        },
        body: '📋 **Preparación para tu cita**\n\nPara agilizar tu consulta, por favor completa este breve cuestionario sobre tu estado de salud actual.',
        footer: 'Tus datos están protegidos según LOPD',
        buttons: [
          {
            id: 'fill-form',
            text: '📝 Completar ahora',
            icon: '📝'
          },
          {
            id: 'later',
            text: '⏰ Más tarde',
            icon: '⏰'
          }
        ]
      }
    },
    {
      id: '5',
      type: 'text',
      sender: 'customer',
      content: 'Completar ahora',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '6',
      type: 'flow',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500,
      flow: {
        id: 'health-questionnaire',
        title: 'Cuestionario Pre-Consulta',
        description: 'Información para tu médico',
        steps: [
          {
            id: 'symptoms',
            type: 'multi-select',
            label: '¿Qué síntomas presentas?',
            required: true,
            options: [
              { id: 'fever', label: '🌡️ Fiebre', value: 'fever' },
              { id: 'headache', label: '🤕 Dolor de cabeza', value: 'headache' },
              { id: 'cough', label: '😷 Tos', value: 'cough' },
              { id: 'fatigue', label: '😴 Fatiga', value: 'fatigue' },
              { id: 'pain', label: '💢 Dolor muscular', value: 'pain' },
              { id: 'other', label: '📝 Otros', value: 'other' }
            ]
          },
          {
            id: 'duration',
            type: 'single-select',
            label: '¿Desde cuándo?',
            required: true,
            options: [
              { id: '1-2days', label: '1-2 días', value: '1-2days' },
              { id: '3-5days', label: '3-5 días', value: '3-5days' },
              { id: 'week', label: 'Una semana', value: 'week' },
              { id: 'more', label: 'Más de una semana', value: 'more' }
            ]
          },
          {
            id: 'medications',
            type: 'text-input',
            label: 'Medicamentos actuales',
            placeholder: 'Lista de medicamentos que tomas',
            required: false
          },
          {
            id: 'allergies',
            type: 'text-input',
            label: 'Alergias conocidas',
            placeholder: 'Medicamentos, alimentos, etc.',
            required: false
          },
          {
            id: 'emergency-contact',
            type: 'text-input',
            label: 'Contacto de emergencia',
            placeholder: 'Nombre y teléfono',
            required: true
          }
        ],
        submitButton: {
          text: 'Enviar información',
          color: '#25D366'
        }
      }
    },
    {
      id: '7',
      type: 'text',
      sender: 'customer',
      content: '✅ Formulario completado',
      timestamp: Date.now(),
      status: 'read',
      delay: 5000
    },
    {
      id: '8',
      type: 'text',
      sender: 'bot',
      content: 'Gracias por completar el cuestionario. El Dr. Rodríguez revisará tu información antes de la consulta. 📋✨',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500
    },
    {
      id: '9',
      type: 'text',
      sender: 'bot',
      content: '--- Día de la cita (simulación) ---',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000
    },
    {
      id: '10',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      template: {
        id: 'day-reminder',
        type: 'utility',
        header: {
          type: 'text',
          content: '⏰ RECORDATORIO DE CITA'
        },
        body: 'Tu cita es en **2 horas**\n\n📍 Clínica Salud Plus\n🏢 Av. Salud 123, Madrid\n👨‍⚕️ Dr. Rodríguez - Consultorio 205\n\n¿Necesitas ayuda para llegar?',
        buttons: [
          {
            id: 'location',
            text: '📍 Ver ubicación',
            icon: '📍'
          },
          {
            id: 'parking',
            text: '🚗 Info parking',
            icon: '🚗'
          },
          {
            id: 'ok',
            text: '👍 Todo claro',
            icon: '👍'
          }
        ]
      }
    },
    {
      id: '11',
      type: 'text',
      sender: 'customer',
      content: 'Todo claro',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '12',
      type: 'text',
      sender: 'bot',
      content: '--- Después de la consulta ---',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000
    },
    {
      id: '13',
      type: 'template',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 1500,
      template: {
        id: 'post-consultation',
        type: 'utility',
        header: {
          type: 'document',
          content: 'Receta_Médica_16122024.pdf'
        },
        body: '💊 **Resumen de tu consulta**\n\n**Diagnóstico:** Gripe estacional\n\n**Tratamiento prescrito:**\n• Paracetamol 500mg - Cada 8 horas\n• Ibuprofeno 400mg - Si hay dolor\n• Mucho líquido y reposo\n\n**Próxima revisión:** 23 de Diciembre\n\n📎 Adjunto encontrarás tu receta médica digital y las indicaciones detalladas.',
        footer: 'Mejórate pronto 💙',
        callToAction: {
          type: 'phone',
          text: '📞 Llamar si empeora',
          value: '+34911234567'
        }
      }
    },
    {
      id: '14',
      type: 'quick-reply',
      sender: 'bot',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000,
      content: '¿Cómo calificarías tu experiencia en la clínica?',
      quickReplyButtons: [
        {
          id: 'excellent',
          text: '⭐⭐⭐⭐⭐ Excelente',
          icon: '⭐'
        },
        {
          id: 'good',
          text: '⭐⭐⭐⭐ Buena',
          icon: '⭐'
        },
        {
          id: 'regular',
          text: '⭐⭐⭐ Regular',
          icon: '⭐'
        }
      ]
    },
    {
      id: '15',
      type: 'text',
      sender: 'customer',
      content: 'Excelente',
      timestamp: Date.now(),
      status: 'read',
      delay: 2500
    },
    {
      id: '16',
      type: 'text',
      sender: 'bot',
      content: '¡Muchas gracias por tu valoración! 🌟\n\nNos alegra saber que tuviste una excelente experiencia. Tu salud es nuestra prioridad.\n\nRecuerda que puedes agendar tu próxima cita directamente por este chat cuando lo necesites.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 2000
    },
    {
      id: '17',
      type: 'text',
      sender: 'bot',
      content: '💡 *¿Sabías que?*\n\nLas Plantillas de Mensajes de WhatsApp están pre-aprobadas y garantizan la entrega de información crítica como recordatorios médicos. Reducen el 40% de las citas perdidas y mejoran la satisfacción del paciente en un 85%.',
      timestamp: Date.now(),
      status: 'delivered',
      delay: 3000
    }
  ]
};