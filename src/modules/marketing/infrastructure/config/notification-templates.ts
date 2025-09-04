/**
 * Notification Templates Configuration
 * Infrastructure layer - Pre-built notification templates and configuration
 */

import {
  NotificationChannel,
  NotificationEventType,
  NotificationTemplate,
} from '../../domain/entities/notification';

/**
 * Email templates for different notification events
 */
export const EMAIL_TEMPLATES: Record<string, NotificationTemplate> = {
  // Welcome sequence templates
  WELCOME_LEAD: {
    id: 'email_welcome_lead',
    name: 'Welcome Email - New Lead',
    description: 'Welcome email sent to new leads who submitted the contact form',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.WELCOME_SEQUENCE,
    subject: 'Welcome to {{productName}}, {{firstName}}! 🚀',
    htmlTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to {{productName}}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 0;
            background-color: #f8f9fa;
          }
          .container { background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { 
            background: linear-gradient(135deg, #25D366, #128C7E); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 30px; }
          .features { 
            background: #f8f9fa; 
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 8px; 
            border-left: 4px solid #25D366; 
          }
          .features h3 { margin: 0 0 15px 0; color: #25D366; font-size: 18px; }
          .features ul { margin: 0; padding-left: 20px; }
          .features li { margin-bottom: 8px; }
          .cta { text-align: center; margin: 35px 0; }
          .button { 
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block; 
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
          }
          .button:hover { transform: translateY(-2px); }
          .footer { 
            background: #f8f9fa; 
            padding: 25px; 
            text-align: center; 
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
          }
          .footer a { color: #25D366; text-decoration: none; }
          .interested-features {
            background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to {{productName}}! 🚀</h1>
            <p>Hi {{firstName}}, thank you for your interest in our platform</p>
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
                <li><strong>24/7 Support:</strong> Our expert team is here to help you succeed</li>
              </ul>
            </div>

            {{#if interestedFeatures}}
            <div class="interested-features">
              <h3>✨ Features You're Most Interested In:</h3>
              <ul>
                {{#each interestedFeatures}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            {{/if}}

            <div class="cta">
              <a href="{{baseUrl}}/demo?utm_source=welcome_email&utm_medium=email&utm_campaign=welcome_sequence" class="button">
                Schedule Your Free Demo
              </a>
            </div>

            <p>Our team will be in touch within 24 hours to help you get started. In the meantime, feel free to explore our documentation and resources.</p>
            
            <p>Ready to get started immediately? <a href="{{baseUrl}}/onboarding" style="color: #25D366;">Begin your setup now</a></p>
            
            <p>Best regards,<br><strong>The {{productName}} Team</strong></p>
          </div>

          <div class="footer">
            <p>© 2024 {{productName}} Platform. All rights reserved.</p>
            <p>Need help? Reply to this email or visit our <a href="{{baseUrl}}/support">support center</a></p>
            <p>You're receiving this because you signed up for {{productName}}. <a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textTemplate: `
      Hi {{firstName}},

      Welcome to {{productName}}! 🚀

      Thank you for your interest in our platform. You're just minutes away from revolutionizing your customer communications!

      What You Get:
      ✓ Instant Setup: Get your WhatsApp Business API up and running in minutes
      ✓ Multi-channel Support: WhatsApp, Telegram, Instagram, and Facebook  
      ✓ AI-Powered Bots: Leverage multiple LLM providers for intelligent responses
      ✓ Local Compliance: Built for African markets with GDPR/POPIA/NDPR compliance
      ✓ Analytics & Insights: Track performance and optimize your communications
      ✓ 24/7 Support: Our expert team is here to help you succeed

      {{#if interestedFeatures}}
      Features You're Most Interested In:
      {{#each interestedFeatures}}
      • {{this}}
      {{/each}}
      {{/if}}

      🎯 Next Steps:
      1. Schedule your demo: {{baseUrl}}/demo
      2. Or start setup now: {{baseUrl}}/onboarding

      Our team will be in touch within 24 hours to help you get started.

      Best regards,
      The {{productName}} Team

      ---
      Need help? Reply to this email or visit: {{baseUrl}}/support
      Unsubscribe: {{unsubscribeUrl}}
    `,
    variables: [
      { name: 'firstName', type: 'string', required: true, description: 'Lead first name' },
      { name: 'fullName', type: 'string', required: true, description: 'Lead full name' },
      { name: 'productName', type: 'string', required: true, defaultValue: 'WhatsApp Cloud API', description: 'Product name' },
      { name: 'baseUrl', type: 'string', required: true, description: 'Base website URL' },
      { name: 'interestedFeatures', type: 'array', required: false, description: 'Features the lead is interested in' },
      { name: 'companyName', type: 'string', required: false, description: 'Lead company name' },
      { name: 'unsubscribeUrl', type: 'string', required: false, description: 'Unsubscribe URL' },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Sales team notification template
  SALES_LEAD_NOTIFICATION: {
    id: 'email_sales_lead_notification',
    name: 'Sales Team - New Lead Notification',
    description: 'Email notification sent to sales team when a new lead is captured',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.LEAD_CAPTURED,
    subject: '🎯 New Lead: {{leadName}} from {{leadSource}}',
    htmlTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Lead Generated</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 8px 8px 0 0; }
          .header h2 { margin: 0 0 10px 0; font-size: 24px; }
          .details { background: white; padding: 25px; border: 1px solid #dee2e6; border-radius: 0 0 8px 8px; }
          .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .detail-item { padding: 15px; background: #f8f9fa; border-radius: 6px; }
          .label { font-weight: 600; color: #495057; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { margin-top: 5px; font-size: 14px; font-weight: 500; }
          .priority-high { border-left: 4px solid #dc3545; }
          .priority-medium { border-left: 4px solid #ffc107; }
          .priority-low { border-left: 4px solid #28a745; }
          .action-items { background: #e7f3ff; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .interested-features { background: #f0f8ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🎯 New Lead Generated!</h2>
          <p>A new {{leadQuality}} priority lead has been captured from {{leadSource}}</p>
        </div>

        <div class="details">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="label">Lead Name</div>
              <div class="value">{{leadName}}</div>
            </div>
            <div class="detail-item">
              <div class="label">Email</div>
              <div class="value">{{leadEmail}}</div>
            </div>
            <div class="detail-item">
              <div class="label">Phone</div>
              <div class="value">{{leadPhone}}</div>
            </div>
            <div class="detail-item">
              <div class="label">Company</div>
              <div class="value">{{leadCompany}}</div>
            </div>
            <div class="detail-item">
              <div class="label">Source</div>
              <div class="value">{{leadSource}}</div>
            </div>
            <div class="detail-item">
              <div class="label">Status</div>
              <div class="value">{{leadStatus}}</div>
            </div>
          </div>

          {{#if interestedFeatures}}
          <div class="interested-features">
            <div class="label">Interested Features</div>
            <div class="value">{{join interestedFeatures ', '}}</div>
          </div>
          {{/if}}

          {{#if notes}}
          <div class="interested-features">
            <div class="label">Lead Notes</div>
            <div class="value">{{notes}}</div>
          </div>
          {{/if}}

          <div class="action-items">
            <h3>📋 Next Steps</h3>
            <ul>
              <li><strong>Follow up within 2 hours</strong> for best conversion rates</li>
              <li>Review their interested features and prepare a tailored demo</li>
              <li>Check if they qualify for our enterprise pricing tier</li>
              <li>Schedule a discovery call to understand their specific needs</li>
            </ul>
          </div>

          <p><strong>Submitted:</strong> {{submittedAt}}</p>
          <p><strong>Lead Score:</strong> {{leadScore}}/100</p>
        </div>
      </body>
      </html>
    `,
    textTemplate: `
      🎯 NEW LEAD GENERATED!

      A new {{leadQuality}} priority lead has been captured from {{leadSource}}

      Lead Details:
      Name: {{leadName}}
      Email: {{leadEmail}}
      Phone: {{leadPhone}}
      Company: {{leadCompany}}
      Source: {{leadSource}}
      Status: {{leadStatus}}
      
      {{#if interestedFeatures}}
      Interested Features: {{join interestedFeatures ', '}}
      {{/if}}
      
      {{#if notes}}
      Notes: {{notes}}
      {{/if}}
      
      Submitted: {{submittedAt}}
      Lead Score: {{leadScore}}/100

      📋 Next Steps:
      • Follow up within 2 hours for best conversion rates
      • Review their interested features and prepare a tailored demo
      • Check if they qualify for our enterprise pricing tier
      • Schedule a discovery call to understand their specific needs
    `,
    variables: [
      { name: 'leadName', type: 'string', required: true, description: 'Full name of the lead' },
      { name: 'leadEmail', type: 'string', required: true, description: 'Lead email address' },
      { name: 'leadPhone', type: 'string', required: false, description: 'Lead phone number' },
      { name: 'leadCompany', type: 'string', required: false, description: 'Lead company name' },
      { name: 'leadSource', type: 'string', required: true, description: 'Source where lead came from' },
      { name: 'leadStatus', type: 'string', required: true, description: 'Current lead status' },
      { name: 'leadQuality', type: 'string', required: false, defaultValue: 'medium', description: 'Lead quality/priority' },
      { name: 'leadScore', type: 'number', required: false, defaultValue: 75, description: 'Lead scoring (0-100)' },
      { name: 'interestedFeatures', type: 'array', required: false, description: 'Features the lead is interested in' },
      { name: 'notes', type: 'string', required: false, description: 'Additional notes about the lead' },
      { name: 'submittedAt', type: 'string', required: true, description: 'When the lead was submitted' },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Demo scheduled template
  DEMO_SCHEDULED: {
    id: 'email_demo_scheduled',
    name: 'Demo Scheduled - Confirmation',
    description: 'Confirmation email when a demo is scheduled',
    channel: NotificationChannel.EMAIL,
    eventType: NotificationEventType.DEMO_SCHEDULED,
    subject: '📅 Demo Confirmed: {{demoDate}} at {{demoTime}}',
    htmlTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Demo Scheduled</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; }
          .container { background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .demo-details { background: #f0f8ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196F3; }
          .preparation { background: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .calendar-link { text-align: center; margin: 25px 0; }
          .button { background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Demo Scheduled!</h1>
            <p>Your personalized {{productName}} demo is confirmed</p>
          </div>
          
          <div class="content">
            <p>Hi {{firstName}},</p>
            
            <p>Great news! Your demo has been successfully scheduled. We're excited to show you how {{productName}} can transform your customer communications.</p>
            
            <div class="demo-details">
              <h3>Demo Details</h3>
              <p><strong>Date:</strong> {{demoDate}}</p>
              <p><strong>Time:</strong> {{demoTime}} ({{timezone}})</p>
              <p><strong>Duration:</strong> 30 minutes</p>
              <p><strong>Meeting Link:</strong> <a href="{{meetingUrl}}">{{meetingUrl}}</a></p>
              <p><strong>Meeting ID:</strong> {{meetingId}}</p>
            </div>

            <div class="calendar-link">
              <a href="{{calendarUrl}}" class="button">Add to Calendar</a>
            </div>

            <div class="preparation">
              <h3>How to Prepare</h3>
              <ul>
                <li>Think about your current customer communication challenges</li>
                <li>Consider your monthly message volume and channels</li>
                <li>Prepare questions about specific features you're interested in</li>
                <li>Have your team join if they'll be involved in the decision</li>
              </ul>
            </div>

            <p>If you need to reschedule, please <a href="{{rescheduleUrl}}">click here</a> or reply to this email.</p>
            
            <p>Looking forward to speaking with you!</p>
            
            <p>Best regards,<br><strong>{{salesRepName}}</strong><br>{{salesRepTitle}}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textTemplate: `
      📅 DEMO SCHEDULED!

      Hi {{firstName}},

      Your personalized {{productName}} demo is confirmed for:
      
      Date: {{demoDate}}
      Time: {{demoTime}} ({{timezone}})
      Duration: 30 minutes
      Meeting Link: {{meetingUrl}}
      Meeting ID: {{meetingId}}

      Add to Calendar: {{calendarUrl}}

      How to Prepare:
      • Think about your current customer communication challenges
      • Consider your monthly message volume and channels  
      • Prepare questions about specific features you're interested in
      • Have your team join if they'll be involved in the decision

      Need to reschedule? {{rescheduleUrl}}

      Looking forward to speaking with you!

      Best regards,
      {{salesRepName}}
      {{salesRepTitle}}
    `,
    variables: [
      { name: 'firstName', type: 'string', required: true, description: 'Lead first name' },
      { name: 'productName', type: 'string', required: true, defaultValue: 'WhatsApp Cloud API', description: 'Product name' },
      { name: 'demoDate', type: 'string', required: true, description: 'Demo date' },
      { name: 'demoTime', type: 'string', required: true, description: 'Demo time' },
      { name: 'timezone', type: 'string', required: true, description: 'Timezone' },
      { name: 'meetingUrl', type: 'string', required: true, description: 'Video meeting URL' },
      { name: 'meetingId', type: 'string', required: false, description: 'Meeting ID' },
      { name: 'calendarUrl', type: 'string', required: false, description: 'Add to calendar URL' },
      { name: 'rescheduleUrl', type: 'string', required: false, description: 'Reschedule URL' },
      { name: 'salesRepName', type: 'string', required: true, description: 'Sales representative name' },
      { name: 'salesRepTitle', type: 'string', required: false, defaultValue: 'Solutions Consultant', description: 'Sales rep title' },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Slack templates for different notification events
 */
export const SLACK_TEMPLATES: Record<string, NotificationTemplate> = {
  LEAD_CAPTURED_SLACK: {
    id: 'slack_lead_captured',
    name: 'Slack - New Lead Notification',
    description: 'Slack notification when a new lead is captured',
    channel: NotificationChannel.SLACK,
    eventType: NotificationEventType.LEAD_CAPTURED,
    subject: '', // Not used for Slack
    htmlTemplate: '', // Not used for Slack
    textTemplate: '🎯 New {{leadQuality}} priority lead: *{{leadName}}* from {{leadSource}}',
    variables: [
      { name: 'leadName', type: 'string', required: true, description: 'Full name of the lead' },
      { name: 'leadSource', type: 'string', required: true, description: 'Source where lead came from' },
      { name: 'leadQuality', type: 'string', required: false, defaultValue: 'medium', description: 'Lead quality/priority' },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Webhook payload templates
 */
export const WEBHOOK_TEMPLATES: Record<string, any> = {
  LEAD_CAPTURED: {
    event: 'lead.captured',
    timestamp: '{{timestamp}}',
    data: {
      lead: {
        id: '{{leadId}}',
        email: '{{leadEmail}}',
        firstName: '{{leadFirstName}}',
        lastName: '{{leadLastName}}',
        fullName: '{{leadName}}',
        phoneNumber: '{{leadPhone}}',
        companyName: '{{leadCompany}}',
        source: '{{leadSource}}',
        status: '{{leadStatus}}',
        interestedFeatures: '{{interestedFeatures}}',
        notes: '{{notes}}',
        createdAt: '{{submittedAt}}',
        metadata: {
          userAgent: '{{userAgent}}',
          ipAddress: '{{ipAddress}}',
          referrer: '{{referrer}}',
        },
      },
    },
    source: {
      name: 'WhatsApp Cloud API Platform',
      version: '1.0.0',
    },
  },
};

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG = {
  retryDelays: [5000, 15000, 60000, 300000], // 5s, 15s, 1m, 5m
  maxRetries: 3,
  emailDefaults: {
    fromName: 'WhatsApp Cloud API Team',
    fromEmail: 'noreply@whatsapp-cloud-api.com',
    replyTo: 'support@whatsapp-cloud-api.com',
  },
  webhookDefaults: {
    timeout: 30000,
    userAgent: 'WhatsApp-Cloud-API-Webhook/1.0',
  },
  slackDefaults: {
    username: 'WhatsApp Cloud API',
    iconEmoji: ':rocket:',
  },
  analytics: {
    retentionDays: 365,
    enableTracking: true,
  },
};

/**
 * Get template by ID and channel
 */
export const getTemplate = (id: string, channel: NotificationChannel): NotificationTemplate | null => {
  switch (channel) {
    case NotificationChannel.EMAIL:
      return EMAIL_TEMPLATES[id] || null;
    case NotificationChannel.SLACK:
      return SLACK_TEMPLATES[id] || null;
    default:
      return null;
  }
};

/**
 * Get all templates for a specific channel
 */
export const getTemplatesByChannel = (channel: NotificationChannel): NotificationTemplate[] => {
  switch (channel) {
    case NotificationChannel.EMAIL:
      return Object.values(EMAIL_TEMPLATES);
    case NotificationChannel.SLACK:
      return Object.values(SLACK_TEMPLATES);
    default:
      return [];
  }
};

/**
 * Get all templates for a specific event type
 */
export const getTemplatesByEventType = (eventType: NotificationEventType): NotificationTemplate[] => {
  return [
    ...Object.values(EMAIL_TEMPLATES),
    ...Object.values(SLACK_TEMPLATES),
  ].filter(template => template.eventType === eventType);
};