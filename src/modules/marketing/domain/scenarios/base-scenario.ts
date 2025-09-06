/**
 * Base Scenario Abstract Implementation
 * Foundation for all WhatsApp simulation scenarios
 */

import { LucideIcon } from 'lucide-react';

import {
  AnimationAction,
  BaseMessage,
  FlowDefinition,
  MessageSequenceItem,
  SimulationScenario,
  SimulationType} from '../types/simulation.types';

/**
 * Abstract base class for simulation scenarios
 * Provides common functionality and structure
 */
export abstract class BaseScenario implements SimulationScenario {
  abstract id: SimulationType;
  abstract name: string;
  abstract businessName: string;
  abstract description: string;
  abstract icon: LucideIcon;
  abstract messages: BaseMessage[];
  abstract flows: FlowDefinition[];

  duration: number = 30000; // Default 30 seconds
  loop: boolean = true;

  /**
   * Generate message sequence for animation timeline
   */
  generateMessageSequence(): MessageSequenceItem[] {
    const sequence: MessageSequenceItem[] = [];
    let currentDelay = 1000; // Start after 1 second

    this.messages.forEach((message, index) => {
      // Start typing animation
      if (message.type === 'bot') {
        sequence.push({
          phase: index * 2,
          delay: currentDelay,
          action: {
            type: 'start-typing',
            entity: 'bot'
          }
        });
        currentDelay += 1500; // Typing duration
      }

      // Show message
      sequence.push({
        phase: index * 2 + 1,
        delay: currentDelay,
        action: {
          type: 'show-message',
          messageId: message.id
        }
      });

      // Stop typing if it was bot
      if (message.type === 'bot') {
        sequence.push({
          phase: index * 2 + 2,
          delay: currentDelay + 100,
          action: {
            type: 'stop-typing',
            entity: 'bot'
          }
        });
      }

      // Add delay before next message
      currentDelay += this.getMessageDelay(message, index);
    });

    // Add flow triggers if any
    this.flows.forEach((flow, flowIndex) => {
      if (flow.trigger === 'timer' || flow.trigger === 'auto') {
        const flowDelay = flow.triggerDelay || currentDelay + 2000;
        sequence.push({
          phase: this.messages.length * 2 + flowIndex + 1,
          delay: flowDelay,
          action: {
            type: 'show-flow',
            flowId: flow.id
          }
        });
      }
    });

    return sequence;
  }

  /**
   * Calculate delay before next message based on content
   */
  protected getMessageDelay(message: BaseMessage, index: number): number {
    // Base delay
    let delay = 1500;

    // Add more delay for longer messages (reading time)
    const wordCount = message.content.split(' ').length;
    delay += Math.min(wordCount * 100, 3000); // Max 3 seconds

    // Add more delay between customer and bot messages
    if (index < this.messages.length - 1) {
      const nextMessage = this.messages[index + 1];
      if (message.type !== nextMessage.type) {
        delay += 1000; // Extra second for conversation switch
      }
    }

    return delay;
  }

  /**
   * Create a message with proper structure
   */
  protected createMessage(
    id: string,
    type: 'customer' | 'bot',
    content: string,
    metadata?: Record<string, unknown>
  ): BaseMessage {
    return {
      id,
      type,
      content,
      timestamp: new Date(),
      isRead: type === 'customer',
      metadata
    };
  }

  /**
   * Format time for WhatsApp display
   */
  protected formatTime(date: Date = new Date()): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Generate time slots for appointment scenarios
   */
  protected generateTimeSlots(
    startHour: number = 9,
    endHour: number = 20,
    interval: number = 30
  ): Array<{ id: string; label: string; value: string }> {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: `time-${timeStr}`,
          label: timeStr,
          value: timeStr
        });
      }
    }
    return slots;
  }

  /**
   * Generate date options for the next N days
   */
  protected generateDateOptions(days: number = 7): Array<{ id: string; label: string; value: string }> {
    const options = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      options.push({
        id: `date-${dateStr}`,
        label: i === 0 ? `Hoy - ${label}` : label,
        value: dateStr
      });
    }

    return options;
  }

  /**
   * Validate Spanish phone number
   */
  protected validatePhoneNumber(phone: string): boolean | string {
    const cleaned = phone.replace(/\s+/g, '');
    const regex = /^(\+34|0034|34)?[6789]\d{8}$/;

    if (!regex.test(cleaned)) {
      return 'Por favor, introduce un número de teléfono válido';
    }
    return true;
  }

  /**
   * Validate email address
   */
  protected validateEmail(email: string): boolean | string {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      return 'Por favor, introduce un email válido';
    }
    return true;
  }
}