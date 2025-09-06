/**
 * Medical Appointments Scenario
 * Simulation for medical appointment scheduling via WhatsApp
 */

import { Stethoscope } from 'lucide-react';

import {
  BaseMessage,
  FlowDefinition,
  SimulationType
} from '../types/simulation.types';

import { BaseScenario } from './base-scenario';

/**
 * Medical Appointments Scenario Implementation
 */
export default class MedicalAppointmentsScenario extends BaseScenario {
  id: SimulationType = 'medical-appointments';
  name = 'Citas Médicas';
  businessName = 'Clínica Salud';
  description = 'Gestión inteligente de citas médicas 24/7';
  icon = Stethoscope as any;
  duration = 28000;

  messages: BaseMessage[] = [
    this.createMessage(
      'ma-1',
      'customer',
      'Buenos días, necesito pedir cita con el Dr. Martínez'
    ),
    this.createMessage(
      'ma-2',
      'bot',
      '¡Buenos días! 👋 Bienvenido a Clínica Salud\n\nClaro, te ayudo a programar tu cita con el Dr. Martínez (Medicina General) 👨‍⚕️\n\n¿Es para ti o para un familiar?'
    ),
    this.createMessage(
      'ma-3',
      'customer',
      'Es para mí'
    ),
    this.createMessage(
      'ma-4',
      'bot',
      'Perfecto. Para continuar, ¿podrías proporcionarme tu DNI o número de historia clínica?\n\n🔒 Tus datos están protegidos según RGPD'
    ),
    this.createMessage(
      'ma-5',
      'customer',
      'Mi DNI es 12345678A'
    ),
    this.createMessage(
      'ma-6',
      'bot',
      '✅ Te he identificado: María González\n\n📅 Disponibilidad del Dr. Martínez:\n\n• Mañana jueves:\n  - 10:30 ⭐ Recomendado\n  - 12:00\n  - 16:30\n\n• Viernes:\n  - 09:00\n  - 11:30\n  - 17:00\n\n¿Qué día y hora prefieres?'
    ),
    this.createMessage(
      'ma-7',
      'customer',
      'Mañana a las 10:30 me viene bien'
    ),
    this.createMessage(
      'ma-8',
      'bot',
      '¡Excelente! He reservado tu cita:\n\n📋 DETALLES DE TU CITA:\n👨‍⚕️ Dr. Martínez - Medicina General\n📅 Jueves 15 febrero\n⏰ 10:30h\n📍 Consulta 3, Planta 1\n👤 Paciente: María González\n\n¿Es una consulta de revisión o tienes algún síntoma específico? (Esto ayuda al doctor a preparar mejor tu consulta)'
    ),
    this.createMessage(
      'ma-9',
      'customer',
      'Tengo dolor de cabeza frecuente desde hace una semana'
    ),
    this.createMessage(
      'ma-10',
      'bot',
      '📝 Anotado: "Cefaleas frecuentes - 1 semana"\n\nEl Dr. Martínez revisará tu historial y estará preparado para tu consulta.\n\n💊 RECORDATORIOS:\n• Trae tu tarjeta sanitaria\n• Si tomas medicación, trae la lista\n• Llega 10 min antes para registro\n\n📱 Te enviaré:\n• Recordatorio mañana a las 8:00\n• SMS 2 horas antes de la cita\n\n¿Necesitas cancelar o modificar? Escríbeme en cualquier momento.'
    ),
    this.createMessage(
      'ma-11',
      'customer',
      'Perfecto, muchas gracias'
    ),
    this.createMessage(
      'ma-12',
      'bot',
      '¡De nada, María! 😊\n\n✅ Tu cita está confirmada\nN° Confirmación: #CS2024-1847\n\n📞 Si es urgente, llama al 900 123 456\n\n¡Que tengas un buen día y mejórate pronto! 🌟'
    )
  ];

  flows: FlowDefinition[] = [
    {
      id: 'appointment-flow',
      trigger: 'auto',
      triggerDelay: 10000,
      steps: [
        {
          id: 'specialty',
          type: 'selection',
          title: '¿Qué especialidad necesitas?',
          subtitle: 'Selecciona el tipo de consulta',
          options: [
            { id: 'general', label: '👨‍⚕️ Medicina General', value: 'general' },
            { id: 'pediatrics', label: '👶 Pediatría', value: 'pediatrics' },
            { id: 'gynecology', label: '👩‍⚕️ Ginecología', value: 'gynecology' },
            { id: 'cardiology', label: '❤️ Cardiología', value: 'cardiology' },
            { id: 'dermatology', label: '🩺 Dermatología', value: 'dermatology' },
            { id: 'traumatology', label: '🦴 Traumatología', value: 'traumatology' },
            { id: 'psychology', label: '🧠 Psicología', value: 'psychology' },
            { id: 'dentistry', label: '🦷 Odontología', value: 'dentistry' }
          ]
        },
        {
          id: 'urgency',
          type: 'selection',
          title: '¿Cuál es la urgencia?',
          subtitle: 'Esto nos ayuda a priorizar',
          options: [
            { id: 'urgent', label: '🔴 Urgente (hoy/mañana)', value: 'urgent' },
            { id: 'soon', label: '🟡 Esta semana', value: 'soon' },
            { id: 'routine', label: '🟢 Revisión rutinaria', value: 'routine' },
            { id: 'followup', label: '🔄 Seguimiento', value: 'followup' }
          ]
        },
        {
          id: 'doctor',
          type: 'selection',
          title: 'Doctores disponibles',
          subtitle: 'Elige tu preferencia',
          options: [
            { id: 'dr-martinez', label: 'Dr. Martínez - ⭐4.9 (Mañanas)', value: 'dr-martinez' },
            { id: 'dra-lopez', label: 'Dra. López - ⭐4.8 (Tardes)', value: 'dra-lopez' },
            { id: 'dr-garcia', label: 'Dr. García - ⭐4.7 (Flexible)', value: 'dr-garcia' },
            { id: 'any', label: 'Cualquier doctor disponible', value: 'any' }
          ]
        },
        {
          id: 'date-selection',
          type: 'selection',
          title: 'Fechas disponibles',
          subtitle: 'Próximos días con citas libres',
          options: this.generateDateOptions(14).map(opt => ({
            ...opt,
            label: opt.label + (opt.value === new Date().toISOString().split('T')[0] ? ' ⚡' : '')
          }))
        },
        {
          id: 'time-slot',
          type: 'selection',
          title: 'Horarios disponibles',
          subtitle: 'Elige tu hora preferida',
          options: [
            { id: 'morning-1', label: '09:00 - Primera hora', value: '09:00' },
            { id: 'morning-2', label: '10:00', value: '10:00' },
            { id: 'morning-3', label: '11:00', value: '11:00' },
            { id: 'morning-4', label: '12:00', value: '12:00' },
            { id: 'afternoon-1', label: '16:00 - Tarde', value: '16:00' },
            { id: 'afternoon-2', label: '17:00', value: '17:00' },
            { id: 'afternoon-3', label: '18:00', value: '18:00' },
            { id: 'afternoon-4', label: '19:00 - Última hora', value: '19:00' }
          ]
        },
        {
          id: 'patient-id',
          type: 'input',
          title: 'Tu DNI o N° Historia',
          subtitle: 'Para identificarte en el sistema',
          placeholder: 'Ej: 12345678A',
          validation: (value: string) => {
            if (!value || value.length < 8) {
              return 'Por favor, introduce un DNI válido';
            }
            return true;
          }
        },
        {
          id: 'symptoms',
          type: 'input',
          title: 'Describe brevemente tus síntomas',
          subtitle: 'Opcional - Ayuda al doctor a preparar la consulta',
          placeholder: 'Ej: Dolor de cabeza desde hace 3 días',
          required: false
        },
        {
          id: 'reminders',
          type: 'multi-select',
          title: '¿Qué recordatorios quieres?',
          subtitle: 'Te avisaremos por WhatsApp',
          options: [
            { id: 'day-before', label: '📅 Un día antes', value: 'day-before' },
            { id: '2h-before', label: '⏰ 2 horas antes', value: '2h-before' },
            { id: 'morning-of', label: '☀️ La mañana de la cita', value: 'morning-of' },
            { id: 'medication', label: '💊 Recordar traer medicación', value: 'medication' }
          ]
        },
        {
          id: 'appointment-confirmation',
          type: 'confirmation',
          title: 'Cita confirmada ✅',
          subtitle: 'Te esperamos'
        }
      ]
    }
  ];
}