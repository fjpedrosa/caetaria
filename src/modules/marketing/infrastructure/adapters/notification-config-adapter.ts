/**
 * Notification Configuration Adapter
 * Infrastructure layer - Implements notification config port
 */

import { NotificationConfig, NotificationConfigProvider } from '../../application/ports/notification-config';
import { getNotificationConfig } from '../config/notification-config';

export class NotificationConfigAdapter implements NotificationConfigProvider {
  getConfig(): NotificationConfig {
    const fullConfig = getNotificationConfig();

    // Transform infrastructure config to application config format
    return {
      email: {
        enabled: fullConfig.email.enabled,
        fromEmail: fullConfig.email.fromEmail,
        fromName: fullConfig.email.fromName,
        baseUrl: fullConfig.email.baseUrl,
        templates: {
          welcomeLead: fullConfig.email.templates.welcomeLead,
          salesNotification: fullConfig.email.templates.salesNotification,
        },
      },
      webhook: {
        enabled: fullConfig.webhook.enabled,
        timeout: fullConfig.webhook.timeout,
        endpoints: fullConfig.webhook.endpoints.map(endpoint => ({
          url: endpoint.url,
          active: endpoint.active,
          events: endpoint.events.map(event => event.toString()),
          secretKey: endpoint.secretKey,
        })),
      },
      slack: {
        enabled: fullConfig.slack.enabled,
        channels: fullConfig.slack.channels.map(channel => ({
          channelId: channel.channelId,
          active: channel.active,
          events: channel.events.map(event => event.toString()),
        })),
      },
    };
  }
}

// Create singleton instance
export const notificationConfigProvider = new NotificationConfigAdapter();