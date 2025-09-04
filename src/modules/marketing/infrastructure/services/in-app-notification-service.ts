/**
 * In-App Notification Service
 * Infrastructure layer - Real-time in-app notification delivery
 */

import {
  InAppNotification,
  InAppNotificationData,
  NotificationPriority,
  NotificationStatus,
} from '../../domain/entities/notification';

// Real-time connection interface (could be WebSocket, Server-Sent Events, etc.)
interface RealtimeConnection {
  send(userId: string, event: string, data: any): Promise<void>;
  subscribe(userId: string, callback: (event: string, data: any) => void): Promise<void>;
  unsubscribe(userId: string): Promise<void>;
  isConnected(userId: string): Promise<boolean>;
}

// Browser notification interface for desktop notifications
interface BrowserNotificationService {
  requestPermission(): Promise<'granted' | 'denied' | 'default'>;
  show(title: string, options?: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string; icon?: string }>;
  }): Promise<void>;
  close(tag: string): Promise<void>;
}

// In-app notification display state
export interface InAppNotificationState {
  id: string;
  userId: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  isVisible: boolean;
  actionUrl?: string;
  actionText?: string;
  iconUrl?: string;
  category?: string;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
}

// Notification display options
export interface NotificationDisplayOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: boolean;
  autoCloseDelay?: number; // in milliseconds
  showDesktopNotification?: boolean;
  sound?: boolean;
  vibrate?: boolean;
  requireAction?: boolean;
}

// In-app notification service interface
export interface InAppNotificationService {
  send(notification: InAppNotification, options?: NotificationDisplayOptions): Promise<{ id: string; status: NotificationStatus }>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  dismiss(userId: string, notificationId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getNotifications(userId: string, options?: {
    limit?: number;
    offset?: number;
    includeRead?: boolean;
    category?: string;
  }): Promise<InAppNotificationState[]>;
  clearExpiredNotifications(userId: string): Promise<number>;
  subscribeToNotifications(userId: string, callback: (notification: InAppNotificationState) => void): Promise<() => void>;
  testConnection(userId: string): Promise<boolean>;
}

/**
 * Create in-app notification service
 */
export const createInAppNotificationService = (
  realtimeConnection: RealtimeConnection,
  browserNotifications?: BrowserNotificationService,
  config: {
    defaultAutoCloseDelay?: number;
    maxNotificationsPerUser?: number;
    defaultExpiryTime?: number; // in milliseconds
    enableDesktopNotifications?: boolean;
    enableSound?: boolean;
  } = {}
): InAppNotificationService => {

  // In-memory store for notifications (in production, use Redis or database)
  const notificationStore = new Map<string, InAppNotificationState[]>();
  const userSubscriptions = new Map<string, (notification: InAppNotificationState) => void>();

  const send = async (
    notification: InAppNotification,
    options: NotificationDisplayOptions = {}
  ): Promise<{ id: string; status: NotificationStatus }> => {
    try {
      const { data } = notification;

      // Create notification state
      const notificationState: InAppNotificationState = {
        id: notification.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        priority: notification.priority,
        isRead: false,
        isVisible: true,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        iconUrl: data.iconUrl,
        category: data.category,
        createdAt: notification.createdAt,
        expiresAt: config.defaultExpiryTime ?
          new Date(Date.now() + config.defaultExpiryTime) : undefined,
      };

      // Store notification
      const userNotifications = notificationStore.get(data.userId) || [];
      userNotifications.unshift(notificationState);

      // Limit notifications per user
      const maxNotifications = config.maxNotificationsPerUser || 100;
      if (userNotifications.length > maxNotifications) {
        userNotifications.splice(maxNotifications);
      }

      notificationStore.set(data.userId, userNotifications);

      // Send real-time notification
      await realtimeConnection.send(data.userId, 'notification', {
        ...notificationState,
        displayOptions: {
          position: options.position || 'top-right',
          autoClose: options.autoClose !== false,
          autoCloseDelay: options.autoCloseDelay || config.defaultAutoCloseDelay || 5000,
          sound: options.sound && config.enableSound,
          vibrate: options.vibrate,
          requireAction: options.requireAction,
        },
      });

      // Show desktop notification if enabled and permission granted
      if (
        options.showDesktopNotification &&
        config.enableDesktopNotifications &&
        browserNotifications
      ) {
        try {
          await browserNotifications.show(data.title, {
            body: data.message,
            icon: data.iconUrl,
            tag: notification.id,
            requireInteraction: options.requireAction,
            actions: data.actionUrl ? [{
              action: 'view',
              title: data.actionText || 'View',
            }] : undefined,
          });
        } catch (desktopError) {
          console.warn('Failed to show desktop notification:', desktopError);
        }
      }

      // Trigger user subscription callback
      const callback = userSubscriptions.get(data.userId);
      if (callback) {
        callback(notificationState);
      }

      return {
        id: notification.id,
        status: NotificationStatus.DELIVERED,
      };
    } catch (error) {
      console.error('Failed to send in-app notification:', error);
      return {
        id: notification.id,
        status: NotificationStatus.FAILED,
      };
    }
  };

  const markAsRead = async (userId: string, notificationId: string): Promise<void> => {
    const userNotifications = notificationStore.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();

      // Send update to client
      await realtimeConnection.send(userId, 'notification_read', {
        notificationId,
        readAt: notification.readAt,
      });
    }
  };

  const markAllAsRead = async (userId: string): Promise<void> => {
    const userNotifications = notificationStore.get(userId) || [];
    const now = new Date();

    const updatedIds: string[] = [];
    userNotifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = now;
        updatedIds.push(notification.id);
      }
    });

    if (updatedIds.length > 0) {
      await realtimeConnection.send(userId, 'notifications_read_all', {
        notificationIds: updatedIds,
        readAt: now,
      });
    }
  };

  const dismiss = async (userId: string, notificationId: string): Promise<void> => {
    const userNotifications = notificationStore.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);

    if (notification) {
      notification.isVisible = false;
      notification.dismissedAt = new Date();

      // Send update to client
      await realtimeConnection.send(userId, 'notification_dismissed', {
        notificationId,
        dismissedAt: notification.dismissedAt,
      });
    }
  };

  const getUnreadCount = async (userId: string): Promise<number> => {
    const userNotifications = notificationStore.get(userId) || [];
    return userNotifications.filter(n => !n.isRead && n.isVisible).length;
  };

  const getNotifications = async (
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      includeRead?: boolean;
      category?: string;
    } = {}
  ): Promise<InAppNotificationState[]> => {
    const userNotifications = notificationStore.get(userId) || [];

    const filtered = userNotifications.filter(notification => {
      if (!options.includeRead && notification.isRead) {
        return false;
      }
      if (options.category && notification.category !== options.category) {
        return false;
      }
      if (!notification.isVisible) {
        return false;
      }
      return true;
    });

    const offset = options.offset || 0;
    const limit = options.limit || 50;

    return filtered.slice(offset, offset + limit);
  };

  const clearExpiredNotifications = async (userId: string): Promise<number> => {
    const userNotifications = notificationStore.get(userId) || [];
    const now = new Date();
    let removedCount = 0;

    const filteredNotifications = userNotifications.filter(notification => {
      if (notification.expiresAt && notification.expiresAt < now) {
        removedCount++;
        return false;
      }
      return true;
    });

    if (removedCount > 0) {
      notificationStore.set(userId, filteredNotifications);
    }

    return removedCount;
  };

  const subscribeToNotifications = async (
    userId: string,
    callback: (notification: InAppNotificationState) => void
  ): Promise<() => void> => {
    userSubscriptions.set(userId, callback);

    // Subscribe to real-time connection
    await realtimeConnection.subscribe(userId, (event, data) => {
      if (event === 'notification') {
        callback(data);
      }
    });

    // Return unsubscribe function
    return () => {
      userSubscriptions.delete(userId);
      realtimeConnection.unsubscribe(userId);
    };
  };

  const testConnection = async (userId: string): Promise<boolean> => {
    try {
      await realtimeConnection.send(userId, 'ping', { timestamp: Date.now() });
      return await realtimeConnection.isConnected(userId);
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  return {
    send,
    markAsRead,
    markAllAsRead,
    dismiss,
    getUnreadCount,
    getNotifications,
    clearExpiredNotifications,
    subscribeToNotifications,
    testConnection,
  };
};

/**
 * WebSocket-based realtime connection implementation
 */
export const createWebSocketRealtimeConnection = (
  wsUrl: string,
  options: {
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
  } = {}
): RealtimeConnection => {
  const connections = new Map<string, WebSocket>();
  const subscriptions = new Map<string, (event: string, data: any) => void>();

  const getConnection = async (userId: string): Promise<WebSocket> => {
    const existingConnection = connections.get(userId);
    if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
      return existingConnection;
    }

    // Create new WebSocket connection
    const ws = new WebSocket(`${wsUrl}?userId=${encodeURIComponent(userId)}`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        connections.set(userId, ws);
        resolve(ws);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const callback = subscriptions.get(userId);
          if (callback) {
            callback(message.event, message.data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        connections.delete(userId);
      };
    });
  };

  return {
    send: async (userId: string, event: string, data: any) => {
      try {
        const ws = await getConnection(userId);
        ws.send(JSON.stringify({ event, data }));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        throw error;
      }
    },

    subscribe: async (userId: string, callback: (event: string, data: any) => void) => {
      subscriptions.set(userId, callback);
      // Ensure connection is established
      await getConnection(userId);
    },

    unsubscribe: async (userId: string) => {
      subscriptions.delete(userId);
      const ws = connections.get(userId);
      if (ws) {
        ws.close();
        connections.delete(userId);
      }
    },

    isConnected: async (userId: string) => {
      const ws = connections.get(userId);
      return ws ? ws.readyState === WebSocket.OPEN : false;
    },
  };
};

/**
 * Browser notification service implementation
 */
export const createBrowserNotificationService = (): BrowserNotificationService => ({
  requestPermission: async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  },

  show: async (title: string, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      throw new Error('Desktop notifications not available or permission denied');
    }

    new Notification(title, options);
  },

  close: async (tag: string) => {
    // Browser doesn't provide direct access to close notifications by tag
    // This would need to be handled by storing notification references
    console.warn('Closing notification by tag not directly supported by browser API');
  },
});