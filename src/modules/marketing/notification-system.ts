/**
 * Marketing Notification System Module
 * Main module export for the comprehensive notification system
 */

// Domain exports
export * from './domain/entities/notification';
export * from './domain/repositories/notification-repository';

// Application layer exports
export * from './application/use-cases/manage-notifications';
export * from './application/use-cases/send-lead-notifications';
export * from './application/use-cases/send-notification';
export * from './application/use-cases/submit-lead-form-enhanced';

// Infrastructure exports
export * from './infrastructure/config/notification-config';
export * from './infrastructure/config/notification-templates';
export * from './infrastructure/services/email-notification-service';
export * from './infrastructure/services/in-app-notification-service';
export * from './infrastructure/services/webhook-notification-service';

// Legacy compatibility
export * from './application/ports/notification-service';

/**
 * Notification System Factory
 * Creates a fully configured notification system with all dependencies
 */
import { createSendNotificationUseCase } from './application/use-cases/send-notification';
import { NotificationRepository } from './domain/repositories/notification-repository';
import { getNotificationConfig } from './infrastructure/config/notification-config';
import { EMAIL_TEMPLATES, SLACK_TEMPLATES } from './infrastructure/config/notification-templates';
import { createEnhancedEmailService } from './infrastructure/services/email-notification-service';
import { createInAppNotificationService, createWebSocketRealtimeConnection } from './infrastructure/services/in-app-notification-service';
import { createFetchHttpClient,createWebhookService } from './infrastructure/services/webhook-notification-service';

export interface NotificationSystemDependencies {
  notificationRepository: NotificationRepository;
  emailClient?: any; // External email client (Resend, SendGrid, etc.)
  webhookHttpClient?: any; // HTTP client for webhooks
  realtimeConnection?: any; // WebSocket or SSE connection for in-app notifications
  slackClient?: any; // Slack client
}

export interface NotificationSystemServices {
  sendNotification: ReturnType<typeof createSendNotificationUseCase>;
  emailService: ReturnType<typeof createEnhancedEmailService>;
  webhookService: ReturnType<typeof createWebhookService>;
  inAppService: ReturnType<typeof createInAppNotificationService>;
}

/**
 * Create a fully configured notification system
 */
export const createNotificationSystem = (deps: NotificationSystemDependencies): NotificationSystemServices => {
  const config = getNotificationConfig();

  // Create email service
  const emailService = deps.emailClient ?
    createEnhancedEmailService(
      deps.emailClient,
      undefined, // Use default template engine
      {
        fromEmail: config.email.fromEmail,
        baseUrl: config.email.baseUrl,
        trackingEnabled: config.general.enableAnalytics,
      }
    ) : null;

  // Create webhook service
  const webhookService = createWebhookService(
    deps.webhookHttpClient || createFetchHttpClient(),
    {
      userAgent: config.webhook.userAgent,
      defaultTimeout: config.webhook.timeout,
      enableRetries: config.general.enableRetries,
    }
  );

  // Create in-app notification service
  const inAppService = deps.realtimeConnection ?
    createInAppNotificationService(
      deps.realtimeConnection,
      undefined, // No browser notifications service for server-side
      {
        defaultAutoCloseDelay: config.inApp.defaults.autoCloseDelay,
        maxNotificationsPerUser: 100,
        defaultExpiryTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        enableSound: false, // Server-side, no sound
      }
    ) : null;

  // Create main notification use case
  const sendNotification = createSendNotificationUseCase({
    notificationRepository: deps.notificationRepository,
    emailService,
    webhookService,
    inAppService,
    slackService: deps.slackClient, // Pass through Slack client
    smsService: null, // SMS service not implemented yet
  });

  return {
    sendNotification,
    emailService: emailService!,
    webhookService,
    inAppService: inAppService!,
  };
};

/**
 * Notification system configuration validation
 */
export const validateNotificationSystemConfig = () => {
  const config = getNotificationConfig();

  const errors: string[] = [];

  // Check required email configuration
  if (config.email.enabled) {
    if (!config.email.fromEmail) {
      errors.push('Email fromEmail is required when email notifications are enabled');
    }
    if (!config.email.baseUrl) {
      errors.push('Email baseUrl is required for template links');
    }
  }

  // Check webhook endpoints
  if (config.webhook.enabled) {
    if (config.webhook.endpoints.length === 0) {
      errors.push('At least one webhook endpoint is required when webhooks are enabled');
    }

    config.webhook.endpoints.forEach((endpoint, index) => {
      if (!endpoint.url) {
        errors.push(`Webhook endpoint ${index} is missing URL`);
      }
      if (!endpoint.name) {
        errors.push(`Webhook endpoint ${index} is missing name`);
      }
    });
  }

  // Check Slack configuration
  if (config.slack.enabled && !config.slack.botToken) {
    errors.push('Slack bot token is required when Slack notifications are enabled');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get available notification templates
 */
export const getAvailableTemplates = () => {
  return {
    email: Object.keys(EMAIL_TEMPLATES),
    slack: Object.keys(SLACK_TEMPLATES),
  };
};

/**
 * Test notification system connectivity
 */
export const testNotificationSystem = async (services: NotificationSystemServices) => {
  const results = {
    email: false,
    webhook: false,
    inApp: false,
  };

  try {
    // Test email service (mock send)
    if (services.emailService) {
      const testTemplate = EMAIL_TEMPLATES.WELCOME_LEAD;
      const rendered = services.emailService.renderTemplate(testTemplate, {
        firstName: 'Test',
        productName: 'Test Product',
        baseUrl: 'https://example.com',
      });
      results.email = rendered.subject.includes('Test');
    }
  } catch (error) {
    console.error('Email service test failed:', error);
  }

  try {
    // Test webhook service
    if (services.webhookService) {
      const testResult = await services.webhookService.testWebhookEndpoint(
        'https://httpbin.org/post'
      );
      results.webhook = testResult.isValid;
    }
  } catch (error) {
    console.error('Webhook service test failed:', error);
  }

  try {
    // Test in-app service
    if (services.inAppService) {
      const connectionTest = await services.inAppService.testConnection('test-user');
      results.inApp = connectionTest;
    }
  } catch (error) {
    console.error('In-app service test failed:', error);
  }

  return results;
};

/**
 * Default notification configuration for quick setup
 */
export const DEFAULT_LEAD_NOTIFICATION_CONFIG = {
  channels: {
    email: {
      enabled: true,
      welcomeEmail: {
        enabled: true,
        templateId: 'email_welcome_lead',
      },
      salesNotification: {
        enabled: true,
        recipients: ['sales@company.com' as any], // Replace with actual email
        templateId: 'email_sales_lead_notification',
      },
    },
    webhook: {
      enabled: true,
      endpoints: [
        {
          url: process.env.WEBHOOK_URL || 'https://your-webhook-endpoint.com/notifications',
          secretKey: process.env.WEBHOOK_SECRET,
          events: ['lead_captured', 'demo_scheduled', 'payment_success'],
        },
      ],
    },
    slack: {
      enabled: Boolean(process.env.SLACK_BOT_TOKEN),
      channels: [
        {
          channel: process.env.SLACK_SALES_CHANNEL || '#sales',
          events: ['lead_captured', 'demo_scheduled'],
        },
      ],
    },
    inApp: {
      enabled: true,
      targets: [], // Will be populated based on user roles
    },
  },
  priority: 'normal' as const,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};