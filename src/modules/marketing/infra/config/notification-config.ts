/**
 * Notification Configuration Module
 * Infrastructure layer - Environment-based notification configuration
 */

import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '../../domain/entities/notification';
import { Email } from '../../domain/value-objects/email';

// Environment configuration interface
export interface NotificationEnvironmentConfig {
  email: {
    enabled: boolean;
    provider: 'resend' | 'sendgrid' | 'postmark' | 'mock';
    fromEmail: Email;
    fromName: string;
    replyToEmail?: Email;
    apiKey?: string;
    baseUrl: string;
    unsubscribeUrl: string;
    templates: {
      welcomeLead: string;
      salesNotification: string;
      demoScheduled: string;
    };
  };
  webhook: {
    enabled: boolean;
    timeout: number;
    maxRetries: number;
    retryDelays: number[];
    userAgent: string;
    endpoints: Array<{
      name: string;
      url: string;
      secretKey?: string;
      events: NotificationEventType[];
      active: boolean;
    }>;
  };
  slack: {
    enabled: boolean;
    botToken?: string;
    channels: Array<{
      name: string;
      channelId: string;
      events: NotificationEventType[];
      active: boolean;
    }>;
    defaults: {
      username: string;
      iconEmoji: string;
    };
  };
  inApp: {
    enabled: boolean;
    websocketUrl?: string;
    defaults: {
      autoClose: boolean;
      autoCloseDelay: number;
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    };
  };
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'messagebird' | 'mock';
    apiKey?: string;
    accountSid?: string;
    fromNumber?: string;
  };
  general: {
    defaultPriority: NotificationPriority;
    enableAnalytics: boolean;
    analyticsRetentionDays: number;
    enableRetries: boolean;
    maxGlobalRetries: number;
    batchProcessingEnabled: boolean;
    batchSize: number;
    rateLimiting: {
      enabled: boolean;
      emailPerMinute: number;
      webhookPerMinute: number;
      slackPerMinute: number;
    };
  };
}

/**
 * Development environment configuration
 */
export const DEVELOPMENT_CONFIG: NotificationEnvironmentConfig = {
  email: {
    enabled: true,
    provider: 'mock',
    fromEmail: 'dev@whatsapp-cloud-api.localhost' as Email,
    fromName: 'WhatsApp Cloud API (Dev)',
    baseUrl: 'http://localhost:3000',
    unsubscribeUrl: 'http://localhost:3000/unsubscribe',
    templates: {
      welcomeLead: 'email_welcome_lead',
      salesNotification: 'email_sales_lead_notification',
      demoScheduled: 'email_demo_scheduled',
    },
  },
  webhook: {
    enabled: true,
    timeout: 10000,
    maxRetries: 2,
    retryDelays: [1000, 5000],
    userAgent: 'WhatsApp-Cloud-API-Dev/1.0',
    endpoints: [
      {
        name: 'Development Webhook',
        url: 'https://webhook.site/unique-dev-id',
        events: [NotificationEventType.LEAD_CAPTURED],
        active: true,
      },
    ],
  },
  slack: {
    enabled: false, // Disabled in development to avoid spam
    channels: [],
    defaults: {
      username: 'WhatsApp Cloud API (Dev)',
      iconEmoji: ':construction:',
    },
  },
  inApp: {
    enabled: true,
    websocketUrl: 'ws://localhost:3000/ws',
    defaults: {
      autoClose: false, // Keep notifications open in dev
      autoCloseDelay: 10000,
      position: 'top-right',
    },
  },
  sms: {
    enabled: false,
    provider: 'mock',
  },
  general: {
    defaultPriority: NotificationPriority.NORMAL,
    enableAnalytics: true,
    analyticsRetentionDays: 30,
    enableRetries: true,
    maxGlobalRetries: 2,
    batchProcessingEnabled: false,
    batchSize: 10,
    rateLimiting: {
      enabled: false,
      emailPerMinute: 100,
      webhookPerMinute: 50,
      slackPerMinute: 20,
    },
  },
};

/**
 * Production environment configuration
 */
export const PRODUCTION_CONFIG: NotificationEnvironmentConfig = {
  email: {
    enabled: true,
    provider: 'resend',
    fromEmail: process.env.NOTIFICATION_FROM_EMAIL as Email || 'noreply@whatsapp-cloud-api.com' as Email,
    fromName: 'WhatsApp Cloud API Team',
    replyToEmail: process.env.NOTIFICATION_REPLY_TO_EMAIL as Email,
    apiKey: process.env.EMAIL_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://whatsapp-cloud-api.com',
    unsubscribeUrl: process.env.UNSUBSCRIBE_URL || 'https://whatsapp-cloud-api.com/unsubscribe',
    templates: {
      welcomeLead: 'email_welcome_lead',
      salesNotification: 'email_sales_lead_notification',
      demoScheduled: 'email_demo_scheduled',
    },
  },
  webhook: {
    enabled: true,
    timeout: 30000,
    maxRetries: 3,
    retryDelays: [5000, 15000, 60000],
    userAgent: 'WhatsApp-Cloud-API/1.0',
    endpoints: JSON.parse(process.env.WEBHOOK_ENDPOINTS || '[]'),
  },
  slack: {
    enabled: Boolean(process.env.SLACK_BOT_TOKEN),
    botToken: process.env.SLACK_BOT_TOKEN,
    channels: JSON.parse(process.env.SLACK_CHANNELS || '[]'),
    defaults: {
      username: 'WhatsApp Cloud API',
      iconEmoji: ':rocket:',
    },
  },
  inApp: {
    enabled: true,
    websocketUrl: process.env.WEBSOCKET_URL,
    defaults: {
      autoClose: true,
      autoCloseDelay: 5000,
      position: 'top-right',
    },
  },
  sms: {
    enabled: Boolean(process.env.SMS_API_KEY),
    provider: (process.env.SMS_PROVIDER as 'twilio' | 'messagebird') || 'twilio',
    apiKey: process.env.SMS_API_KEY,
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    fromNumber: process.env.SMS_FROM_NUMBER,
  },
  general: {
    defaultPriority: NotificationPriority.NORMAL,
    enableAnalytics: true,
    analyticsRetentionDays: 365,
    enableRetries: true,
    maxGlobalRetries: 3,
    batchProcessingEnabled: true,
    batchSize: 50,
    rateLimiting: {
      enabled: true,
      emailPerMinute: 300,
      webhookPerMinute: 100,
      slackPerMinute: 60,
    },
  },
};

/**
 * Test environment configuration
 */
export const TEST_CONFIG: NotificationEnvironmentConfig = {
  ...DEVELOPMENT_CONFIG,
  email: {
    ...DEVELOPMENT_CONFIG.email,
    enabled: false, // No actual emails in tests
  },
  webhook: {
    ...DEVELOPMENT_CONFIG.webhook,
    enabled: false, // No actual webhooks in tests
  },
  slack: {
    ...DEVELOPMENT_CONFIG.slack,
    enabled: false,
  },
  inApp: {
    ...DEVELOPMENT_CONFIG.inApp,
    enabled: false,
  },
  sms: {
    ...DEVELOPMENT_CONFIG.sms,
    enabled: false,
  },
  general: {
    ...DEVELOPMENT_CONFIG.general,
    enableAnalytics: false,
    enableRetries: false,
  },
};

/**
 * Get configuration based on environment
 */
export const getNotificationConfig = (): NotificationEnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'test':
      return TEST_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
};

/**
 * Event-specific configuration
 */
export const EVENT_NOTIFICATION_CONFIG = {
  [NotificationEventType.LEAD_CAPTURED]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.WEBHOOK, NotificationChannel.SLACK],
    priority: NotificationPriority.HIGH,
    retryEnabled: true,
    maxRetries: 3,
    templates: {
      [NotificationChannel.EMAIL]: ['email_welcome_lead', 'email_sales_lead_notification'],
      [NotificationChannel.SLACK]: ['slack_lead_captured'],
    },
  },
  [NotificationEventType.WELCOME_SEQUENCE]: {
    channels: [NotificationChannel.EMAIL],
    priority: NotificationPriority.NORMAL,
    retryEnabled: true,
    maxRetries: 2,
    templates: {
      [NotificationChannel.EMAIL]: ['email_welcome_lead'],
    },
  },
  [NotificationEventType.DEMO_SCHEDULED]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
    priority: NotificationPriority.HIGH,
    retryEnabled: true,
    maxRetries: 3,
    templates: {
      [NotificationChannel.EMAIL]: ['email_demo_scheduled'],
    },
  },
  [NotificationEventType.ONBOARDING_STARTED]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    priority: NotificationPriority.NORMAL,
    retryEnabled: true,
    maxRetries: 2,
  },
  [NotificationEventType.ONBOARDING_COMPLETED]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
    priority: NotificationPriority.NORMAL,
    retryEnabled: true,
    maxRetries: 2,
  },
  [NotificationEventType.PAYMENT_SUCCESS]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
    priority: NotificationPriority.HIGH,
    retryEnabled: true,
    maxRetries: 5,
  },
  [NotificationEventType.PAYMENT_FAILED]: {
    channels: [NotificationChannel.EMAIL, NotificationChannel.SLACK],
    priority: NotificationPriority.URGENT,
    retryEnabled: true,
    maxRetries: 3,
  },
};

/**
 * Channel-specific rate limits (requests per minute)
 */
export const CHANNEL_RATE_LIMITS = {
  [NotificationChannel.EMAIL]: {
    development: 100,
    production: 300,
    test: 10,
  },
  [NotificationChannel.WEBHOOK]: {
    development: 50,
    production: 100,
    test: 10,
  },
  [NotificationChannel.SLACK]: {
    development: 20,
    production: 60,
    test: 5,
  },
  [NotificationChannel.IN_APP]: {
    development: 200,
    production: 500,
    test: 20,
  },
  [NotificationChannel.SMS]: {
    development: 10,
    production: 100,
    test: 5,
  },
};

/**
 * Validate configuration
 */
export const validateNotificationConfig = (config: NotificationEnvironmentConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate email configuration
  if (config.email.enabled) {
    if (!config.email.fromEmail) {
      errors.push('Email fromEmail is required when email is enabled');
    }
    if (!config.email.fromName) {
      errors.push('Email fromName is required when email is enabled');
    }
    if (config.email.provider !== 'mock' && !config.email.apiKey) {
      errors.push('Email apiKey is required for non-mock providers');
    }
  }

  // Validate webhook configuration
  if (config.webhook.enabled) {
    config.webhook.endpoints.forEach((endpoint, index) => {
      if (!endpoint.url) {
        errors.push(`Webhook endpoint ${index} is missing URL`);
      }
      if (!endpoint.name) {
        errors.push(`Webhook endpoint ${index} is missing name`);
      }
    });
  }

  // Validate Slack configuration
  if (config.slack.enabled && !config.slack.botToken) {
    errors.push('Slack botToken is required when Slack is enabled');
  }

  // Validate SMS configuration
  if (config.sms.enabled) {
    if (config.sms.provider !== 'mock' && !config.sms.apiKey) {
      errors.push('SMS apiKey is required for non-mock providers');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};