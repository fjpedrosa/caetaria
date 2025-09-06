/**
 * Restaurant Reservation Scenario
 * Simulation for restaurant table booking via WhatsApp
 */

import { UtensilsCrossed } from 'lucide-react';

import {
  BaseMessage,
  FlowDefinition,
  SimulationType
} from '../types/simulation.types';

import { BaseScenario } from './base-scenario';

/**
 * Restaurant Reservation Scenario Implementation
 */
export default class RestaurantReservationScenario extends BaseScenario {
  id: SimulationType = 'restaurant-reservation';
  name = 'Reserva de Mesa';
  businessName = 'Terraza Nueva';
  description = 'Gestión automatizada de reservas de mesa 24/7';
  icon = UtensilsCrossed as any;
  duration = 25000;

  messages: BaseMessage[] = [
    this.createMessage(
      'rr-1',
      'customer',
      'Hola! ¿Tienen mesa disponible para esta noche? Somos 4 personas'
    ),
    this.createMessage(
      'rr-2',
      'bot',
      '¡Hola! 👋 Bienvenido a Terraza Nueva\n\n¡Sí tenemos disponibilidad para esta noche! Me encantaré de ayudarte con tu reserva 😊\n\n¿Para qué hora te gustaría reservar?'
    ),
    this.createMessage(
      'rr-3',
      'customer',
      'Perfecto! Sobre las 21:00 estaría bien'
    ),
    this.createMessage(
      'rr-4',
      'bot',
      'Excelente, mesa para 4 personas a las 21:00 ✅\n\nPara confirmar tu reserva, ¿podrías indicarme tu nombre?'
    ),
    this.createMessage(
      'rr-5',
      'customer',
      'Soy Carlos García'
    ),
    this.createMessage(
      'rr-6',
      'bot',
      '¡Perfecto Carlos! Tu reserva está casi lista.\n\n📅 Resumen de tu reserva:\n• Fecha: Hoy\n• Hora: 21:00\n• Personas: 4\n• Nombre: Carlos García\n\n¿Te gustaría añadir alguna petición especial? (mesa en terraza, celebración, alergias...)'
    ),
    this.createMessage(
      'rr-7',
      'customer',
      'Si es posible en la terraza sería genial'
    ),
    this.createMessage(
      'rr-8',
      'bot',
      '¡Anotado! Mesa en la terraza 🌙\n\n✅ Tu reserva está confirmada. Te he enviado la confirmación con todos los detalles.\n\n⏰ Te enviaré un recordatorio 2 horas antes.\n\n¿Necesitas indicaciones para llegar o ver nuestra carta?'
    ),
    this.createMessage(
      'rr-9',
      'customer',
      'La carta estaría bien para ir viendo'
    ),
    this.createMessage(
      'rr-10',
      'bot',
      '¡Por supuesto! Te envío nuestra carta actualizada 📱\n\n[📄 Carta Terraza Nueva.pdf]\n\nTambién puedes ver nuestros platos del día y especialidades en www.terrazanueva.es/carta\n\n¡Te esperamos esta noche! Si necesitas modificar o cancelar, solo escríbeme. ¡Hasta luego! 👨‍🍳'
    )
  ];

  flows: FlowDefinition[] = [
    {
      id: 'reservation-flow',
      trigger: 'button',
      triggerDelay: 2000,
      steps: [
        {
          id: 'guests',
          type: 'selection',
          title: '¿Cuántas personas sois?',
          subtitle: 'Capacidad máxima: 12 personas',
          options: Array.from({ length: 12 }, (_, i) => ({
            id: `guests-${i + 1}`,
            label: i === 0 ? '1 persona' : `${i + 1} personas`,
            value: i + 1,
            icon: '👤'
          }))
        },
        {
          id: 'date',
          type: 'selection',
          title: 'Selecciona el día',
          subtitle: 'Disponibilidad en tiempo real',
          options: this.generateDateOptions(7)
        },
        {
          id: 'time',
          type: 'selection',
          title: '¿A qué hora prefieres?',
          subtitle: 'Horario de 13:00 a 23:30',
          options: [
            { id: 'lunch-early', label: '13:00 - 14:00', value: '13:00', icon: '☀️' },
            { id: 'lunch-late', label: '14:00 - 15:00', value: '14:00', icon: '☀️' },
            { id: 'dinner-early', label: '20:00 - 21:00', value: '20:00', icon: '🌙' },
            { id: 'dinner-mid', label: '21:00 - 22:00', value: '21:00', icon: '🌙' },
            { id: 'dinner-late', label: '22:00 - 23:00', value: '22:00', icon: '🌙' }
          ]
        },
        {
          id: 'special-requests',
          type: 'multi-select',
          title: '¿Alguna petición especial?',
          subtitle: 'Puedes seleccionar varias',
          options: [
            { id: 'terrace', label: 'Mesa en terraza', value: 'terrace', icon: '🌿' },
            { id: 'quiet', label: 'Zona tranquila', value: 'quiet', icon: '🤫' },
            { id: 'highchair', label: 'Trona para bebé', value: 'highchair', icon: '👶' },
            { id: 'wheelchair', label: 'Acceso silla de ruedas', value: 'wheelchair', icon: '♿' },
            { id: 'birthday', label: 'Es un cumpleaños', value: 'birthday', icon: '🎂' },
            { id: 'anniversary', label: 'Aniversario', value: 'anniversary', icon: '💕' }
          ]
        },
        {
          id: 'contact',
          type: 'input',
          title: 'Tu nombre para la reserva',
          placeholder: 'Ej: María García',
          validation: (value: string) => {
            if (!value || value.length < 2) {
              return 'Por favor, introduce tu nombre';
            }
            return true;
          }
        },
        {
          id: 'phone',
          type: 'input',
          title: 'Teléfono de contacto',
          subtitle: 'Para confirmaciones',
          placeholder: 'Ej: 600 123 456',
          validation: this.validatePhoneNumber
        },
        {
          id: 'confirmation',
          type: 'confirmation',
          title: '¡Reserva confirmada! 🎉',
          subtitle: 'Te esperamos'
        }
      ]
    }
  ];

  /**
   * Override to customize message sequence for this scenario
   */
  generateMessageSequence() {
    const sequence = super.generateMessageSequence();

    // Add custom flow trigger after message 6
    sequence.push({
      phase: 12,
      delay: 15000,
      action: {
        type: 'show-flow',
        flowId: 'reservation-flow'
      }
    });

    return sequence;
  }
}