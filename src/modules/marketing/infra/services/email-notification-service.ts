/**
 * Email Notification Service Adapter
 * Infrastructure layer - Email service implementation of NotificationService
 */

import { EmailNotification, NotificationService, SlackNotification } from '../../application/ports/notification-service';
import { getLeadFullName,Lead } from '../../domain/entities/lead';
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
 * Email-based notification service implementation
 * Handles email notifications and integrates with Slack for team notifications
 */
export class EmailNotificationService implements NotificationService {
  constructor(
    private readonly emailClient: EmailClient,
    private readonly config: {
      fromEmail: Email;
      salesTeamChannel?: string;
      baseUrl: string;
    },
    private readonly slackClient?: SlackClient
  ) {}

  async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      await this.emailClient.send({
        from: notification.from || this.config.fromEmail,
        to: notification.to,
        subject: notification.subject,
        html: notification.htmlBody,
        text: notification.textBody,
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendWelcomeEmail(lead: Lead): Promise<void> {
    const fullName = getLeadFullName(lead);
    const firstName = lead.firstName || fullName.split(' ')[0] || 'there';

    const htmlBody = this.generateWelcomeEmailHtml(firstName, lead);
    const textBody = this.generateWelcomeEmailText(firstName);

    await this.sendEmail({
      to: lead.email,
      subject: 'Welcome to WhatsApp Cloud API - Let\'s Get Started!',
      htmlBody,
      textBody,
    });
  }

  async notifySalesTeam(lead: Lead): Promise<void> {
    const fullName = getLeadFullName(lead);

    // Send email notification to sales team
    const salesEmailHtml = this.generateSalesNotificationHtml(lead, fullName);
    const salesEmailText = this.generateSalesNotificationText(lead, fullName);

    await this.sendEmail({
      to: this.config.fromEmail, // Sales team email
      subject: `New Lead: ${fullName} (${lead.source})`,
      htmlBody: salesEmailHtml,
      textBody: salesEmailText,
    });

    // Send Slack notification if configured
    if (this.slackClient && this.config.salesTeamChannel) {
      await this.sendSlackNotification({
        channel: this.config.salesTeamChannel,
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
  }

  async sendSlackNotification(notification: SlackNotification): Promise<void> {
    if (!this.slackClient) {
      throw new Error('Slack client not configured');
    }

    try {
      await this.slackClient.chat.postMessage({
        channel: notification.channel,
        text: notification.message,
        attachments: notification.attachments,
      });
    } catch (error) {
      throw new Error(`Failed to send Slack notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateWelcomeEmailHtml(firstName: string, lead: Lead): string {
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
            <a href="${this.config.baseUrl}/demo" class="button">Schedule Your Demo</a>
          </div>

          <p>Our team will be in touch within 24 hours to help you get started. In the meantime, feel free to explore our documentation and resources.</p>
          
          <p>Best regards,<br>The WhatsApp Cloud API Team</p>
        </div>

        <div class="footer">
          <p>© 2024 WhatsApp Cloud API Platform. All rights reserved.</p>
          <p>Need help? Reply to this email or visit our <a href="${this.config.baseUrl}/support" style="color: #25D366;">support center</a>.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(firstName: string): string {
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

      Schedule your demo: ${this.config.baseUrl}/demo

      Our team will be in touch within 24 hours to help you get started.

      Best regards,
      The WhatsApp Cloud API Team

      ---
      Need help? Reply to this email or visit: ${this.config.baseUrl}/support
    `;
  }

  private generateSalesNotificationHtml(lead: Lead, fullName: string): string {
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

  private generateSalesNotificationText(lead: Lead, fullName: string): string {
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
}