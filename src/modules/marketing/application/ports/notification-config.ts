/**
 * Notification Configuration Port
 * Application layer - Interface for notification configuration
 */

export interface NotificationConfig {
  email: {
    enabled: boolean;
    fromEmail: string;
    fromName: string;
    baseUrl: string;
    templates: {
      welcomeLead: string;
      salesNotification: string;
    };
  };
  webhook: {
    enabled: boolean;
    timeout: number;
    endpoints: Array<{
      url: string;
      active: boolean;
      events: string[];
      secretKey?: string;
    }>;
  };
  slack: {
    enabled: boolean;
    channels: Array<{
      channelId: string;
      active: boolean;
      events: string[];
    }>;
  };
}

/**
 * Port for getting notification configuration
 */
export interface NotificationConfigProvider {
  getConfig(): NotificationConfig;
}