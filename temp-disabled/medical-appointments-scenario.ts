/**
 * Medical Appointments Scenario - Cero No-Shows
 * Specific for medical clinics and dentists to show appointment management
 * Hook: "De $15K perdidos/mes a agenda 100% ocupada"
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
  id: 'ai' | 'flow' | 'crm' | 'reminders' | 'scheduling' | 'waitlist';
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
 * WhatsApp Flow step configuration for medical appointments
 */
export interface FlowStep {
  id: 'treatment-selection' | 'doctor-preference' | 'datetime-selection' | 'confirmation' | 'reminder-setup';
  title: string;
  content: any;
  triggerAtMessageIndex: number;
  stepDelay: number; // delay before this step shows
}

/**
 * Medical Appointments scenario configuration
 */
export const medicalAppointmentsScenario = {
  metadata: {
    id: 'medical-appointments',
    title: 'Cero No-Shows',
    description: 'Sistema de citas médicas con recordatorios inteligentes que elimina las faltas',
    tags: ['medical', 'appointments', 'reminders', 'scheduling', 'healthcare', 'demo'],
    businessName: 'Clínica Dental Sonrisas',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'es',
    category: 'healthcare',
    vertical: 'medical',
    roi: {
      metric: '-85% no-shows',
      value: '+$8,000/mes en citas recuperadas',
      timeline: 'desde el primer mes'
    },
    hook: {
      emotional: 'Agenda llena, sin huecos vacíos',
      rational: 'Reduce 85% las citas perdidas'
    }
  },

  // Message sequence for medical appointment demo
  messages: [
    {
      id: 'msg1',
      sender: 'user' as const,
      text: 'Buenos días! Necesito agendar una cita para limpieza dental 🦷',
      timestamp: 1000,
      status: 'sent' as const
    },
    {
      id: 'msg2',
      sender: 'business' as const,
      text: '¡Buenos días! Perfecto, te ayudo a agendar tu limpieza dental. ¿Tienes preferencia por algún doctor?',
      timestamp: 2500,
      status: 'sent' as const,
      aiTrigger: true // Show medical AI understanding
    },
    {
      id: 'msg3',
      sender: 'user' as const,
      text: 'Me da igual, el que tenga disponibilidad más pronto',
      timestamp: 4000,
      status: 'sent' as const
    },
    {
      id: 'msg4',
      sender: 'business' as const,
      text: '📅 Te muestro las citas disponibles de nuestros doctores esta semana:',
      timestamp: 5500,
      status: 'sent' as const,
      schedulingTrigger: true,
      flowTrigger: true // Trigger appointment scheduling flow
    },
    {
      id: 'msg5',
      sender: 'business' as const,
      text: '✅ ¡Perfecto! Cita agendada para mañana 15:30 con Dr. García. Te envío los detalles:',
      timestamp: 11000,
      status: 'sent' as const
    },
    {
      id: 'msg6',
      sender: 'business' as const,
      text: '📝 Cita #2845 - Limpieza dental\n🩺 Dr. García\n📅 Mañana 15:30\n📍 Consultorio 2',
      timestamp: 12500,
      status: 'sent' as const,
      remindersTrigger: true
    },
    {
      id: 'msg7',
      sender: 'business' as const,
      text: '⏰ Te enviaré recordatorios automáticos: 24h antes, 2h antes, y 30min antes de tu cita.',
      timestamp: 14000,
      status: 'sent' as const
    },
    {
      id: 'msg8',
      sender: 'user' as const,
      text: '¡Genial! Muy profesional el sistema 👏',
      timestamp: 15500,
      status: 'sent' as const
    },
    {
      id: 'msg9',
      sender: 'business' as const,
      text: '🔔 [24h después] RECORDATORIO: Mañana a las 15:30 tienes cita con Dr. García. ¿Confirmas asistencia?',
      timestamp: 17000,
      status: 'sent' as const,
      waitlistTrigger: true
    },
    {
      id: 'msg10',
      sender: 'user' as const,
      text: '✅ Confirmado, ahí estaré',
      timestamp: 18500,
      status: 'sent' as const
    },
    {
      id: 'msg11',
      sender: 'business' as const,
      text: '🙏 ¡Excelente! Tu cita está confirmada. Si surge algún imprevisto, puedes reagendar hasta 2h antes.',
      timestamp: 20000,
      status: 'sent' as const,
      crmTrigger: true,
      final: true
    }
  ] as MessageTemplate[],

  // Educational badges configuration
  educationalBadges: [
    {
      id: 'ai',
      title: 'IA Médica Especializada',
      subtitle: 'Entiende terminología y tratamientos dentales',
      color: 'text-purple-100',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      position: { top: '15%', right: '-200px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 1, // After AI understands medical request
      displayDuration: 3000
    },
    {
      id: 'scheduling',
      title: 'Agenda Inteligente',
      subtitle: 'Sincronizada con todos los doctores',
      color: 'text-blue-100',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      position: { bottom: '40%', right: '-200px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 3, // After showing calendar
      displayDuration: 3500
    },
    {
      id: 'reminders',
      title: 'Recordatorios Automáticos',
      subtitle: 'Sistema triple: 24h, 2h y 30min antes',
      color: 'text-amber-100',
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
      position: { bottom: '20%', right: '-200px' },
      arrowDirection: 'left',
      triggerAtMessageIndex: 5, // After setting up reminders
      displayDuration: 3500
    },
    {
      id: 'waitlist',
      title: 'Lista de Espera Automática',
      subtitle: 'Cancelación = notificación inmediata a lista',
      color: 'text-green-100',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      position: { top: '25%', left: '-220px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 8, // After reminder confirmation
      displayDuration: 3000
    },
    {
      id: 'crm',
      title: 'Historial Médico Digital',
      subtitle: 'Expediente actualizado automáticamente',
      color: 'text-teal-100',
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      position: { top: '5%', left: '-220px' },
      arrowDirection: 'right',
      triggerAtMessageIndex: 10, // After final confirmation
      displayDuration: 3000
    }
  ] as EducationalBadge[],

  // WhatsApp Flow configuration for appointment booking
  flowSteps: [
    {
      id: 'treatment-selection',
      title: 'Tipo de tratamiento',
      content: {
        type: 'treatment_catalog',
        categories: [
          {
            id: 'preventive',
            name: 'Preventivo',
            treatments: [
              {
                id: 'cleaning',
                name: 'Limpieza dental',
                duration: 45,
                price: 50,
                description: 'Limpieza profunda y pulido',
                selected: true
              },
              {
                id: 'checkup',
                name: 'Revisión general',
                duration: 30,
                price: 30,
                description: 'Examen completo oral'
              }
            ]
          },
          {
            id: 'restorative',
            name: 'Restaurativo',
            treatments: [
              {
                id: 'filling',
                name: 'Empaste',
                duration: 60,
                price: 80,
                description: 'Tratamiento de caries'
              }
            ]
          }
        ],
        selectedTreatment: 'cleaning'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 1500
    },
    {
      id: 'doctor-preference',
      title: 'Preferencia de doctor',
      content: {
        type: 'doctor_selection',
        doctors: [
          {
            id: 'garcia',
            name: 'Dr. García',
            specialty: 'Odontología General',
            experience: '10 años',
            rating: 4.9,
            available: true,
            photo: '👨‍⚕️',
            nextAvailable: 'Mañana 15:30'
          },
          {
            id: 'martinez',
            name: 'Dra. Martínez',
            specialty: 'Periodoncia',
            experience: '8 años',
            rating: 4.8,
            available: true,
            photo: '👩‍⚕️',
            nextAvailable: 'Jueves 10:00'
          }
        ],
        selectedDoctor: 'garcia',
        anyDoctor: true
      },
      triggerAtMessageIndex: 3,
      stepDelay: 3000
    },
    {
      id: 'datetime-selection',
      title: 'Fecha y hora disponibles',
      content: {
        type: 'calendar_booking',
        availableSlots: [
          {
            date: '2025-01-02',
            dayName: 'Mañana',
            slots: [
              { time: '09:00', available: true },
              { time: '10:30', available: false },
              { time: '15:30', available: true, recommended: true },
              { time: '17:00', available: true }
            ]
          },
          {
            date: '2025-01-03',
            dayName: 'Jueves',
            slots: [
              { time: '10:00', available: true },
              { time: '14:00', available: true },
              { time: '16:30', available: true }
            ]
          }
        ],
        selectedDate: '2025-01-02',
        selectedTime: '15:30'
      },
      triggerAtMessageIndex: 3,
      stepDelay: 4500
    },
    {
      id: 'confirmation',
      title: 'Confirmación de cita',
      content: {
        type: 'appointment_confirmation',
        appointmentId: '#2845',
        treatment: 'Limpieza dental',
        doctor: 'Dr. García',
        datetime: 'Mañana 2 Enero, 15:30',
        duration: 45,
        location: 'Consultorio 2',
        instructions: [
          'Llegar 10 minutos antes',
          'Traer identificación',
          'Cepillarse los dientes antes de la cita'
        ]
      },
      triggerAtMessageIndex: 3,
      stepDelay: 6500
    },
    {
      id: 'reminder-setup',
      title: 'Configuración de recordatorios',
      content: {
        type: 'reminder_preferences',
        reminders: [
          {
            type: '24h',
            enabled: true,
            time: '15:30 (día anterior)',
            message: 'Recordatorio de cita mañana'
          },
          {
            type: '2h',
            enabled: true,
            time: '13:30 (mismo día)',
            message: 'Tu cita es en 2 horas'
          },
          {
            type: '30min',
            enabled: true,
            time: '15:00 (mismo día)',
            message: 'Tu cita es en 30 minutos'
          }
        ],
        confirmationRequired: true,
        waitlistNotification: true
      },
      triggerAtMessageIndex: 3,
      stepDelay: 8000
    }
  ] as FlowStep[],

  // Timing configuration optimized for medical appointments
  timing: {
    messageDelay: 1500,        // Delay between messages
    typingDuration: 1400,      // How long typing indicator shows
    readDelay: 400,            // Delay before marking as read
    restartDelay: 6000,        // Delay before conversation restarts
    flowTransitionDelay: 700   // Delay between flow steps
  }
};

/**
 * Factory function to create medical appointments conversation
 */
export function createMedicalAppointmentsConversation(): Conversation {
  const template: ConversationTemplate = {
    metadata: medicalAppointmentsScenario.metadata,
    messages: medicalAppointmentsScenario.messages,
    flows: medicalAppointmentsScenario.flowSteps.map(step => ({
      id: step.id,
      title: step.title,
      steps: [], // Will be populated by the flow execution system
      triggerAtMessageIndex: step.triggerAtMessageIndex
    })),
    timing: medicalAppointmentsScenario.timing
  };

  return ConversationFactory.createFromTemplate(template);
}

/**
 * Export for use in scenario selector
 */
export default medicalAppointmentsScenario;