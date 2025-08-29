/**
 * Notification Service Port  
 * Application layer - Interface for sending notifications
 */

import { Lead } from '../../domain/entities/lead';
import { Email } from '../../domain/value-objects/email';

export interface EmailNotification {
  to: Email;
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: Email;
}

export interface SlackNotification {
  channel: string;
  message: string;
  attachments?: Array<{
    title?: string;
    text?: string;
    color?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
  }>;
}

export interface NotificationService {
  /**
   * Send email notification
   */
  sendEmail(notification: EmailNotification): Promise<void>;
  
  /**
   * Send welcome email to new lead
   */
  sendWelcomeEmail(lead: Lead): Promise<void>;
  
  /**
   * Send lead notification to sales team
   */
  notifySalesTeam(lead: Lead): Promise<void>;
  
  /**
   * Send Slack notification
   */
  sendSlackNotification(notification: SlackNotification): Promise<void>;
}