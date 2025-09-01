/**
 * Send Lead Notifications Use Case
 * Application layer - Specialized use case for lead-related notifications
 */

import { getLeadFullName,Lead } from '../../domain/entities/lead';
import {
  EmailNotificationData,
  InAppNotificationData,
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
  SlackNotificationData,
  WebhookNotificationData,
} from '../../domain/entities/notification';
import { Email } from '../../domain/value-objects/email';

import { createSendNotificationUseCase, SendNotificationRequest } from './send-notification';

// Lead notification configuration
export interface LeadNotificationConfig {
  channels: {
    email?: {
      enabled: boolean;
      welcomeEmail?: {
        enabled: boolean;
        templateId?: string;
        fromEmail?: Email;
      };
      salesNotification?: {
        enabled: boolean;
        recipients: Email[];
        templateId?: string;
      };
    };
    webhook?: {
      enabled: boolean;
      endpoints: Array<{
        url: string;
        secretKey?: string;
        events: NotificationEventType[];
      }>;
    };
    inApp?: {
      enabled: boolean;
      targets: Array<{
        userId: string;
        events: NotificationEventType[];
      }>;
    };
    slack?: {
      enabled: boolean;
      channels: Array<{
        channel: string;
        events: NotificationEventType[];
      }>;
    };
  };
  priority?: NotificationPriority;
  baseUrl: string;
}

// Dependencies interface
interface Dependencies {
  sendNotificationUseCase: ReturnType<typeof createSendNotificationUseCase>;
}

/**
 * Send welcome email to new lead
 */
export const createSendWelcomeEmailUseCase = (deps: Dependencies, config: LeadNotificationConfig) => {
  return async (lead: Lead): Promise<void> => {
    if (!config.channels.email?.enabled || !config.channels.email.welcomeEmail?.enabled) {
      return;
    }

    const fullName = getLeadFullName(lead);
    const firstName = lead.firstName || fullName.split(' ')[0] || 'there';

    const emailData: EmailNotificationData = {
      to: lead.email,
      from: config.channels.email.welcomeEmail.fromEmail,
      subject: `Welcome to WhatsApp Cloud API, ${firstName}!`,
      htmlBody: generateWelcomeEmailHtml(firstName, lead, config.baseUrl),
      textBody: generateWelcomeEmailText(firstName, config.baseUrl),
      templateId: config.channels.email.welcomeEmail.templateId,
      templateData: {
        firstName,
        fullName,
        productName: 'WhatsApp Cloud API',
        baseUrl: config.baseUrl,
        interestedFeatures: lead.interestedFeatures || [],
        companyName: lead.companyName,
      },
    };

    const request: SendNotificationRequest = {
      eventType: NotificationEventType.WELCOME_SEQUENCE,
      priority: config.priority || NotificationPriority.NORMAL,
      channels: [
        {
          type: NotificationChannel.EMAIL,
          data: emailData,
        },
      ],
      metadata: {
        leadId: lead.id,
        leadEmail: lead.email,
        leadName: fullName,
      },
    };

    await deps.sendNotificationUseCase(request);
  };
};

/**
 * Send sales team notification for new lead
 */
export const createSendSalesNotificationUseCase = (deps: Dependencies, config: LeadNotificationConfig) => {
  return async (lead: Lead): Promise<void> => {
    if (!config.channels.email?.enabled || !config.channels.email.salesNotification?.enabled) {
      return;
    }

    const fullName = getLeadFullName(lead);
    const recipients = config.channels.email.salesNotification.recipients;

    // Send email to each sales team member
    for (const recipient of recipients) {
      const emailData: EmailNotificationData = {
        to: recipient,
        subject: `New Lead: ${fullName} (${lead.source})`,
        htmlBody: generateSalesNotificationHtml(lead, fullName),
        textBody: generateSalesNotificationText(lead, fullName),
        templateId: config.channels.email.salesNotification.templateId,
        templateData: {
          leadName: fullName,
          leadEmail: lead.email,
          leadPhone: lead.phoneNumber,
          leadCompany: lead.companyName,
          leadSource: lead.source,
          leadStatus: lead.status,
          interestedFeatures: lead.interestedFeatures || [],
          notes: lead.notes,
          submittedAt: lead.createdAt.toLocaleString(),
        },
      };

      const request: SendNotificationRequest = {
        eventType: NotificationEventType.LEAD_CAPTURED,
        priority: NotificationPriority.HIGH,
        channels: [
          {
            type: NotificationChannel.EMAIL,
            data: emailData,
          },
        ],
        metadata: {
          leadId: lead.id,
          recipientType: 'sales_team',
          recipient: recipient,
        },
      };

      await deps.sendNotificationUseCase(request);
    }
  };
};

/**
 * Send webhook notification for lead events
 */
export const createSendLeadWebhookUseCase = (deps: Dependencies, config: LeadNotificationConfig) => {
  return async (lead: Lead, eventType: NotificationEventType): Promise<void> => {
    if (!config.channels.webhook?.enabled) {
      return;
    }

    const fullName = getLeadFullName(lead);

    // Send to each configured webhook endpoint
    for (const endpoint of config.channels.webhook.endpoints) {
      if (!endpoint.events.includes(eventType)) {
        continue;
      }

      const webhookData: WebhookNotificationData = {
        url: endpoint.url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Event-Type': eventType,
          'X-Source': 'whatsapp-cloud-api',
        },
        payload: {
          event: eventType,
          timestamp: new Date().toISOString(),
          data: {
            lead: {
              id: lead.id,
              email: lead.email,
              firstName: lead.firstName,
              lastName: lead.lastName,
              fullName,
              phoneNumber: lead.phoneNumber,
              companyName: lead.companyName,
              source: lead.source,
              status: lead.status,
              interestedFeatures: lead.interestedFeatures,
              notes: lead.notes,
              createdAt: lead.createdAt.toISOString(),
              updatedAt: lead.updatedAt.toISOString(),
            },
          },
          source: {
            name: 'WhatsApp Cloud API',
            version: '1.0.0',
          },
        },
        secretKey: endpoint.secretKey,
        timeout: 30000,
      };

      const request: SendNotificationRequest = {
        eventType,
        priority: config.priority || NotificationPriority.NORMAL,
        channels: [
          {
            type: NotificationChannel.WEBHOOK,
            data: webhookData,
          },
        ],
        metadata: {
          leadId: lead.id,
          webhookUrl: endpoint.url,
        },
      };

      await deps.sendNotificationUseCase(request);
    }
  };
};

/**
 * Send Slack notification for lead events
 */
export const createSendLeadSlackNotificationUseCase = (deps: Dependencies, config: LeadNotificationConfig) => {
  return async (lead: Lead, eventType: NotificationEventType): Promise<void> => {
    if (!config.channels.slack?.enabled) {
      return;
    }

    const fullName = getLeadFullName(lead);

    // Send to each configured Slack channel
    for (const channelConfig of config.channels.slack.channels) {
      if (!channelConfig.events.includes(eventType)) {
        continue;
      }

      const slackData: SlackNotificationData = {
        channel: channelConfig.channel,
        message: getSlackMessage(eventType, fullName, lead.source),
        attachments: [{
          title: `${fullName} - ${lead.source}`,
          color: getSlackColor(eventType),
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
            ...(lead.interestedFeatures && lead.interestedFeatures.length > 0 ? [{
              title: 'Interested Features',
              value: lead.interestedFeatures.join(', '),
              short: false,
            }] : []),
            ...(lead.notes ? [{
              title: 'Notes',
              value: lead.notes,
              short: false,
            }] : []),
          ],
        }],
      };

      const request: SendNotificationRequest = {
        eventType,
        priority: config.priority || NotificationPriority.NORMAL,
        channels: [
          {
            type: NotificationChannel.SLACK,
            data: slackData,
          },
        ],
        metadata: {
          leadId: lead.id,
          slackChannel: channelConfig.channel,
        },
      };

      await deps.sendNotificationUseCase(request);
    }
  };
};

/**
 * Send comprehensive lead notification (all enabled channels)
 */
export const createSendComprehensiveLeadNotificationUseCase = (deps: Dependencies, config: LeadNotificationConfig) => {
  const sendWelcomeEmail = createSendWelcomeEmailUseCase(deps, config);
  const sendSalesNotification = createSendSalesNotificationUseCase(deps, config);
  const sendWebhookNotification = createSendLeadWebhookUseCase(deps, config);
  const sendSlackNotification = createSendLeadSlackNotificationUseCase(deps, config);

  return async (lead: Lead): Promise<void> => {
    // Send all notifications in parallel
    await Promise.allSettled([
      // Welcome email to lead
      sendWelcomeEmail(lead),

      // Sales team notification
      sendSalesNotification(lead),

      // Webhook notifications
      sendWebhookNotification(lead, NotificationEventType.LEAD_CAPTURED),

      // Slack notifications
      sendSlackNotification(lead, NotificationEventType.LEAD_CAPTURED),
    ]);
  };
};

// Helper functions for email content generation
function generateWelcomeEmailHtml(firstName: string, lead: Lead, baseUrl: string): string {
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
          <a href="${baseUrl}/demo" class="button">Schedule Your Demo</a>
        </div>

        <p>Our team will be in touch within 24 hours to help you get started. In the meantime, feel free to explore our documentation and resources.</p>
        
        <p>Best regards,<br>The WhatsApp Cloud API Team</p>
      </div>

      <div class="footer">
        <p>© 2024 WhatsApp Cloud API Platform. All rights reserved.</p>
        <p>Need help? Reply to this email or visit our <a href="${baseUrl}/support" style="color: #25D366;">support center</a>.</p>
      </div>
    </body>
    </html>
  `;
}

function generateWelcomeEmailText(firstName: string, baseUrl: string): string {
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

    Schedule your demo: ${baseUrl}/demo

    Our team will be in touch within 24 hours to help you get started.

    Best regards,
    The WhatsApp Cloud API Team

    ---
    Need help? Reply to this email or visit: ${baseUrl}/support
  `;
}

function generateSalesNotificationHtml(lead: Lead, fullName: string): string {
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
}

function generateSalesNotificationText(lead: Lead, fullName: string): string {
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
}

function getSlackMessage(eventType: NotificationEventType, fullName: string, source: string): string {
  switch (eventType) {
    case NotificationEventType.LEAD_CAPTURED:
      return `🎯 New lead generated: ${fullName} from ${source}`;
    case NotificationEventType.LEAD_QUALIFIED:
      return `✅ Lead qualified: ${fullName}`;
    case NotificationEventType.DEMO_SCHEDULED:
      return `📅 Demo scheduled with ${fullName}`;
    default:
      return `📢 Lead event: ${fullName}`;
  }
}

function getSlackColor(eventType: NotificationEventType): string {
  switch (eventType) {
    case NotificationEventType.LEAD_CAPTURED:
      return 'good';
    case NotificationEventType.LEAD_QUALIFIED:
      return '#36a64f';
    case NotificationEventType.DEMO_SCHEDULED:
      return '#2196F3';
    default:
      return '#cccccc';
  }
}