/**
 * Notification Domain Entities
 * Core domain entities for the notification system
 */

import { Email } from '../value-objects/email';

// Notification channel types
export enum NotificationChannel {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
  SLACK = 'slack',
  SMS = 'sms',
}

// Notification status types
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
  RETRY = 'retry',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Notification event types
export enum NotificationEventType {
  LEAD_CAPTURED = 'lead_captured',
  LEAD_QUALIFIED = 'lead_qualified',
  DEMO_SCHEDULED = 'demo_scheduled',
  WELCOME_SEQUENCE = 'welcome_sequence',
  FOLLOW_UP = 'follow_up',
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  CUSTOM = 'custom',
}

// Base notification interface
export interface BaseNotification {
  id: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

// Email notification specific data
export interface EmailNotificationData {
  to: Email;
  from?: Email;
  replyTo?: Email;
  subject: string;
  htmlBody: string;
  textBody?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  templateId?: string;
  templateData?: Record<string, any>;
}

// Webhook notification specific data
export interface WebhookNotificationData {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  payload: Record<string, any>;
  secretKey?: string;
  timeout: number;
}

// In-app notification specific data
export interface InAppNotificationData {
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  iconUrl?: string;
  isRead: boolean;
  category?: string;
}

// Slack notification specific data
export interface SlackNotificationData {
  channel: string;
  message: string;
  username?: string;
  iconEmoji?: string;
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

// SMS notification specific data
export interface SmsNotificationData {
  phoneNumber: string;
  message: string;
  senderId?: string;
}

// Complete notification entity
export interface Notification extends BaseNotification {
  data: EmailNotificationData | WebhookNotificationData | InAppNotificationData | SlackNotificationData | SmsNotificationData;
}

// Email notification entity
export interface EmailNotification extends BaseNotification {
  channel: NotificationChannel.EMAIL;
  data: EmailNotificationData;
}

// Webhook notification entity
export interface WebhookNotification extends BaseNotification {
  channel: NotificationChannel.WEBHOOK;
  data: WebhookNotificationData;
}

// In-app notification entity
export interface InAppNotification extends BaseNotification {
  channel: NotificationChannel.IN_APP;
  data: InAppNotificationData;
}

// Slack notification entity
export interface SlackNotification extends BaseNotification {
  channel: NotificationChannel.SLACK;
  data: SlackNotificationData;
}

// SMS notification entity
export interface SmsNotification extends BaseNotification {
  channel: NotificationChannel.SMS;
  data: SmsNotificationData;
}

// Notification template entity
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  subject?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification subscription entity for managing user preferences
export interface NotificationSubscription {
  id: string;
  userId: string;
  email?: Email;
  phoneNumber?: string;
  webhookUrl?: string;
  preferences: {
    [key in NotificationEventType]?: {
      [key in NotificationChannel]?: {
        enabled: boolean;
        priority: NotificationPriority;
      };
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Notification batch for bulk operations
export interface NotificationBatch {
  id: string;
  name: string;
  description?: string;
  notifications: Notification[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCount: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Type guards for notification types
export const isEmailNotification = (notification: Notification): notification is EmailNotification => {
  return notification.channel === NotificationChannel.EMAIL;
};

export const isWebhookNotification = (notification: Notification): notification is WebhookNotification => {
  return notification.channel === NotificationChannel.WEBHOOK;
};

export const isInAppNotification = (notification: Notification): notification is InAppNotification => {
  return notification.channel === NotificationChannel.IN_APP;
};

export const isSlackNotification = (notification: Notification): notification is SlackNotification => {
  return notification.channel === NotificationChannel.SLACK;
};

export const isSmsNotification = (notification: Notification): notification is SmsNotification => {
  return notification.channel === NotificationChannel.SMS;
};

// Factory functions for creating notifications
export const createEmailNotification = (
  id: string,
  eventType: NotificationEventType,
  data: EmailNotificationData,
  options?: {
    priority?: NotificationPriority;
    scheduledAt?: Date;
    maxRetries?: number;
    metadata?: Record<string, any>;
  }
): EmailNotification => {
  const now = new Date();
  return {
    id,
    channel: NotificationChannel.EMAIL,
    eventType,
    priority: options?.priority || NotificationPriority.NORMAL,
    status: NotificationStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    scheduledAt: options?.scheduledAt,
    retryCount: 0,
    maxRetries: options?.maxRetries || 3,
    metadata: options?.metadata,
  };
};

export const createWebhookNotification = (
  id: string,
  eventType: NotificationEventType,
  data: WebhookNotificationData,
  options?: {
    priority?: NotificationPriority;
    scheduledAt?: Date;
    maxRetries?: number;
    metadata?: Record<string, any>;
  }
): WebhookNotification => {
  const now = new Date();
  return {
    id,
    channel: NotificationChannel.WEBHOOK,
    eventType,
    priority: options?.priority || NotificationPriority.NORMAL,
    status: NotificationStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    scheduledAt: options?.scheduledAt,
    retryCount: 0,
    maxRetries: options?.maxRetries || 3,
    metadata: options?.metadata,
  };
};

export const createInAppNotification = (
  id: string,
  eventType: NotificationEventType,
  data: InAppNotificationData,
  options?: {
    priority?: NotificationPriority;
    scheduledAt?: Date;
    maxRetries?: number;
    metadata?: Record<string, any>;
  }
): InAppNotification => {
  const now = new Date();
  return {
    id,
    channel: NotificationChannel.IN_APP,
    eventType,
    priority: options?.priority || NotificationPriority.NORMAL,
    status: NotificationStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    scheduledAt: options?.scheduledAt,
    retryCount: 0,
    maxRetries: options?.maxRetries || 1,
    metadata: options?.metadata,
  };
};

export const createSlackNotification = (
  id: string,
  eventType: NotificationEventType,
  data: SlackNotificationData,
  options?: {
    priority?: NotificationPriority;
    scheduledAt?: Date;
    maxRetries?: number;
    metadata?: Record<string, any>;
  }
): SlackNotification => {
  const now = new Date();
  return {
    id,
    channel: NotificationChannel.SLACK,
    eventType,
    priority: options?.priority || NotificationPriority.NORMAL,
    status: NotificationStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    scheduledAt: options?.scheduledAt,
    retryCount: 0,
    maxRetries: options?.maxRetries || 3,
    metadata: options?.metadata,
  };
};

export const createSmsNotification = (
  id: string,
  eventType: NotificationEventType,
  data: SmsNotificationData,
  options?: {
    priority?: NotificationPriority;
    scheduledAt?: Date;
    maxRetries?: number;
    metadata?: Record<string, any>;
  }
): SmsNotification => {
  const now = new Date();
  return {
    id,
    channel: NotificationChannel.SMS,
    eventType,
    priority: options?.priority || NotificationPriority.NORMAL,
    status: NotificationStatus.PENDING,
    data,
    createdAt: now,
    updatedAt: now,
    scheduledAt: options?.scheduledAt,
    retryCount: 0,
    maxRetries: options?.maxRetries || 3,
    metadata: options?.metadata,
  };
};