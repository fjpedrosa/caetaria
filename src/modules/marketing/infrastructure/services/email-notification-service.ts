/**
 * Email Notification Service Adapter
 * Infrastructure layer - Enhanced email service with template support and analytics
 */

import {
  EmailNotification as LegacyEmailNotification,
  NotificationService as LegacyNotificationService,
  SlackNotification as LegacySlackNotification
} from '../../application/ports/notification-service';
import { getLeadFullName, Lead } from '../../domain/entities/lead';
import {
  EmailNotification,
  EmailNotificationData,
  NotificationChannel,
  NotificationEventType,
  NotificationStatus,
  NotificationTemplate,
} from '../../domain/entities/notification';
import { Email } from '../../domain/value-objects/email';

// Email service client interface (could be Resend, SendGrid, etc.)
interface EmailClient {
  send(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ id: string }>;
}

// Slack client interface
interface SlackClient {
  chat: {
    postMessage(params: {
      channel: string;
      text: string;
      attachments?: any[];
    }): Promise<any>;
  };
}

/**
 * Email-based notification service implementation factory
 * Handles email notifications and integrates with Slack for team notifications
 */
export const createEmailNotificationService = (
  emailClient: EmailClient,
  config: {
    fromEmail: Email;
    salesTeamChannel?: string;
    baseUrl: string;
  },
  slackClient?: SlackClient
): NotificationService => {
  const sendEmail = async (notification: EmailNotification): Promise<void> => {
    try {
      await emailClient.send({
        from: notification.from || config.fromEmail,
        to: notification.to,
        subject: notification.subject,
        html: notification.htmlBody,
        text: notification.textBody,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateWelcomeEmailHtml = (firstName: string, lead: Lead): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to WhatsApp Cloud API</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #25D366, #128C7E); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px 20px; }
          .features { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #25D366; }
          .cta { text-align: center; margin: 30px 0; }
          .button { background: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
          .footer { background: #333; color: #ccc; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to WhatsApp Cloud API! 🚀</h1>
          <p>Hi ${firstName}, thank you for your interest in our platform</p>
        </div>
        
        <div class="content">
          <h2>You're just minutes away from revolutionizing your customer communications!</h2>
          
          <div class="features">
            <h3>🎯 What You Get:</h3>
            <ul>
              <li><strong>Instant Setup:</strong> Get your WhatsApp Business API up and running in minutes</li>
              <li><strong>Multi-channel Support:</strong> WhatsApp, Telegram, Instagram, and Facebook</li>
              <li><strong>AI-Powered Bots:</strong> Leverage multiple LLM providers for intelligent responses</li>
              <li><strong>Local Compliance:</strong> Built for African markets with GDPR/POPIA/NDPR compliance</li>
              <li><strong>Analytics & Insights:</strong> Track performance and optimize your communications</li>
            </ul>
          </div>

          ${lead.interestedFeatures && lead.interestedFeatures.length > 0 ? `
          <div class="features">
            <h3>✨ Features You're Interested In:</h3>
            <ul>
              ${lead.interestedFeatures.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="cta">
            <a href="${config.baseUrl}/demo" class="button">Schedule Your Demo</a>
          </div>

          <p>Our team will be in touch within 24 hours to help you get started. In the meantime, feel free to explore our documentation and resources.</p>
          
          <p>Best regards,<br>The WhatsApp Cloud API Team</p>
        </div>

        <div class="footer">
          <p>© 2024 WhatsApp Cloud API Platform. All rights reserved.</p>
          <p>Need help? Reply to this email or visit our <a href="${config.baseUrl}/support" style="color: #25D366;">support center</a>.</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateWelcomeEmailText = (firstName: string): string => {
    return `
      Hi ${firstName},

      Welcome to WhatsApp Cloud API! 🚀

      Thank you for your interest in our platform. You're just minutes away from revolutionizing your customer communications!

      What You Get:
      - Instant Setup: Get your WhatsApp Business API up and running in minutes
      - Multi-channel Support: WhatsApp, Telegram, Instagram, and Facebook  
      - AI-Powered Bots: Leverage multiple LLM providers for intelligent responses
      - Local Compliance: Built for African markets with GDPR/POPIA/NDPR compliance
      - Analytics & Insights: Track performance and optimize your communications

      Schedule your demo: ${config.baseUrl}/demo

      Our team will be in touch within 24 hours to help you get started.

      Best regards,
      The WhatsApp Cloud API Team

      ---
      Need help? Reply to this email or visit: ${config.baseUrl}/support
    `;
  };

  const generateSalesNotificationHtml = (lead: Lead, fullName: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Lead Generated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; }
          .details { background: white; padding: 20px; border: 1px solid #dee2e6; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #495057; }
          .value { margin-left: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🎯 New Lead Generated!</h2>
          <p>A new lead has been captured from the landing page.</p>
        </div>

        <div class="details">
          <div class="detail-row">
            <span class="label">Name:</span>
            <span class="value">${fullName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">${lead.email}</span>
          </div>
          <div class="detail-row">
            <span class="label">Phone:</span>
            <span class="value">${lead.phoneNumber || 'Not provided'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Company:</span>
            <span class="value">${lead.companyName || 'Not provided'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Source:</span>
            <span class="value">${lead.source}</span>
          </div>
          <div class="detail-row">
            <span class="label">Status:</span>
            <span class="value">${lead.status}</span>
          </div>
          ${lead.interestedFeatures && lead.interestedFeatures.length > 0 ? `
          <div class="detail-row">
            <span class="label">Interested Features:</span>
            <span class="value">${lead.interestedFeatures.join(', ')}</span>
          </div>
          ` : ''}
          ${lead.notes ? `
          <div class="detail-row">
            <span class="label">Notes:</span>
            <span class="value">${lead.notes}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="label">Submitted:</span>
            <span class="value">${lead.createdAt.toLocaleString()}</span>
          </div>
        </div>

        <p><strong>Next Steps:</strong> Follow up within 24 hours for best conversion rates.</p>
      </body>
      </html>
    `;
  };

  const generateSalesNotificationText = (lead: Lead, fullName: string): string => {
    return `
      🎯 NEW LEAD GENERATED!

      Name: ${fullName}
      Email: ${lead.email}
      Phone: ${lead.phoneNumber || 'Not provided'}
      Company: ${lead.companyName || 'Not provided'}
      Source: ${lead.source}
      Status: ${lead.status}
      ${lead.interestedFeatures && lead.interestedFeatures.length > 0 ? `Interested Features: ${lead.interestedFeatures.join(', ')}` : ''}
      ${lead.notes ? `Notes: ${lead.notes}` : ''}
      Submitted: ${lead.createdAt.toLocaleString()}

      Next Steps: Follow up within 24 hours for best conversion rates.
    `;
  };

  const sendWelcomeEmail = async (lead: Lead): Promise<void> => {
    const fullName = getLeadFullName(lead);
    const firstName = lead.firstName || fullName.split(' ')[0] || 'there';

    const htmlBody = generateWelcomeEmailHtml(firstName, lead);
    const textBody = generateWelcomeEmailText(firstName);

    await sendEmail({
      to: lead.email,
      subject: 'Welcome to WhatsApp Cloud API - Let\'s Get Started!',
      htmlBody,
      textBody,
    });
  };

  const notifySalesTeam = async (lead: Lead): Promise<void> => {
    const fullName = getLeadFullName(lead);

    // Send email notification to sales team
    const salesEmailHtml = generateSalesNotificationHtml(lead, fullName);
    const salesEmailText = generateSalesNotificationText(lead, fullName);

    await sendEmail({
      to: config.fromEmail, // Sales team email
      subject: `New Lead: ${fullName} (${lead.source})`,
      htmlBody: salesEmailHtml,
      textBody: salesEmailText,
    });

    // Send Slack notification if configured
    if (slackClient && config.salesTeamChannel) {
      await sendSlackNotification({
        channel: config.salesTeamChannel,
        message: '🎯 New lead generated!',
        attachments: [{
          title: `${fullName} - ${lead.source}`,
          color: 'good',
          fields: [
            {
              title: 'Email',
              value: lead.email,
              short: true,
            },
            {
              title: 'Company',
              value: lead.companyName || 'Not provided',
              short: true,
            },
            {
              title: 'Phone',
              value: lead.phoneNumber || 'Not provided',
              short: true,
            },
            {
              title: 'Source',
              value: lead.source,
              short: true,
            },
            {
              title: 'Interested Features',
              value: lead.interestedFeatures?.join(', ') || 'None specified',
              short: false,
            },
            ...(lead.notes ? [{
              title: 'Notes',
              value: lead.notes,
              short: false,
            }] : []),
          ],
        }],
      });
    }
  };

  const sendSlackNotification = async (notification: SlackNotification): Promise<void> => {
    if (!slackClient) {
      throw new Error('Slack client not configured');
    }

    try {
      await slackClient.chat.postMessage({
        channel: notification.channel,
        text: notification.message,
        attachments: notification.attachments,
      });
    } catch (error) {
      throw new Error(`Failed to send Slack notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    notifySalesTeam,
    sendSlackNotification,
  };
};

// Template engine interface
interface TemplateEngine {
  render(template: string, data: Record<string, any>): string;
}

// Simple template engine implementation
const createSimpleTemplateEngine = (): TemplateEngine => ({
  render: (template: string, data: Record<string, any>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  },
});

// Enhanced email service interface
export interface EnhancedEmailService {
  send(notification: EmailNotification): Promise<{ id: string; status: NotificationStatus }>;
  sendWithTemplate(templateId: string, to: Email, data: Record<string, any>): Promise<{ id: string; status: NotificationStatus }>;
  renderTemplate(template: NotificationTemplate, data: Record<string, any>): { subject: string; htmlBody: string; textBody?: string };
  validateTemplate(template: NotificationTemplate): { isValid: boolean; errors: string[] };
  getDeliveryStatus(messageId: string): Promise<NotificationStatus>;
}

/**
 * Enhanced email notification service with template support
 */
export const createEnhancedEmailService = (
  emailClient: EmailClient,
  templateEngine: TemplateEngine = createSimpleTemplateEngine(),
  config: {
    fromEmail: Email;
    baseUrl: string;
    trackingEnabled?: boolean;
  }
): EnhancedEmailService => {

  const send = async (notification: EmailNotification): Promise<{ id: string; status: NotificationStatus }> => {
    try {
      const result = await emailClient.send({
        from: notification.data.from || config.fromEmail,
        to: notification.data.to,
        subject: notification.data.subject,
        html: notification.data.htmlBody,
        text: notification.data.textBody,
      });

      return {
        id: result.id,
        status: NotificationStatus.SENT,
      };
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return {
        id: '',
        status: NotificationStatus.FAILED,
      };
    }
  };

  const sendWithTemplate = async (
    templateId: string,
    to: Email,
    data: Record<string, any>
  ): Promise<{ id: string; status: NotificationStatus }> => {
    // In a real implementation, this would fetch the template from the repository
    // For now, we'll use a mock template
    const mockTemplate: NotificationTemplate = {
      id: templateId,
      name: 'Mock Template',
      description: 'Mock template for testing',
      channel: NotificationChannel.EMAIL,
      eventType: NotificationEventType.CUSTOM,
      subject: 'Welcome to {{productName}}',
      htmlTemplate: `
        <h1>Welcome {{firstName}}!</h1>
        <p>Thank you for joining {{productName}}.</p>
      `,
      textTemplate: `
        Welcome {{firstName}}!
        Thank you for joining {{productName}}.
      `,
      variables: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const rendered = renderTemplate(mockTemplate, data);

    try {
      const result = await emailClient.send({
        from: config.fromEmail,
        to,
        subject: rendered.subject,
        html: rendered.htmlBody,
        text: rendered.textBody,
      });

      return {
        id: result.id,
        status: NotificationStatus.SENT,
      };
    } catch (error) {
      console.error('Failed to send templated email:', error);
      return {
        id: '',
        status: NotificationStatus.FAILED,
      };
    }
  };

  const renderTemplate = (
    template: NotificationTemplate,
    data: Record<string, any>
  ): { subject: string; htmlBody: string; textBody?: string } => {
    const subject = template.subject ? templateEngine.render(template.subject, data) : '';
    const htmlBody = template.htmlTemplate ? templateEngine.render(template.htmlTemplate, data) : '';
    const textBody = template.textTemplate ? templateEngine.render(template.textTemplate, data) : undefined;

    return { subject, htmlBody, textBody };
  };

  const validateTemplate = (template: NotificationTemplate): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate required fields
    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }

    if (!template.subject?.trim()) {
      errors.push('Template subject is required');
    }

    if (!template.htmlTemplate?.trim() && !template.textTemplate?.trim()) {
      errors.push('Template must have either HTML or text content');
    }

    // Validate template variables
    const subjectVars = extractTemplateVariables(template.subject || '');
    const htmlVars = extractTemplateVariables(template.htmlTemplate || '');
    const textVars = extractTemplateVariables(template.textTemplate || '');
    const allVars = [...new Set([...subjectVars, ...htmlVars, ...textVars])];

    const declaredVars = template.variables.map(v => v.name);
    const undeclaredVars = allVars.filter(v => !declaredVars.includes(v));

    if (undeclaredVars.length > 0) {
      errors.push(`Undeclared template variables: ${undeclaredVars.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const extractTemplateVariables = (template: string): string[] => {
    const matches = template.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return matches.map(match => match.replace(/[{}]/g, ''));
  };

  const getDeliveryStatus = async (messageId: string): Promise<NotificationStatus> => {
    // In a real implementation, this would check with the email provider
    // For now, return a mock status
    return NotificationStatus.DELIVERED;
  };

  return {
    send,
    sendWithTemplate,
    renderTemplate,
    validateTemplate,
    getDeliveryStatus,
  };
};