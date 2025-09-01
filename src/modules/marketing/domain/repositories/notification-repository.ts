/**
 * Notification Repository Interface
 * Domain layer - Interface for notification data persistence
 */

import {
  Notification,
  NotificationBatch,
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
  NotificationSubscription,
  NotificationTemplate,
} from '../entities/notification';

// Query filters for notifications
export interface NotificationFilters {
  status?: NotificationStatus[];
  channel?: NotificationChannel[];
  eventType?: NotificationEventType[];
  priority?: NotificationPriority[];
  createdAfter?: Date;
  createdBefore?: Date;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Repository result with pagination
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Analytics data for notifications
export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  successRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    successRate: number;
  }>;
  byEventType: Record<NotificationEventType, {
    sent: number;
    delivered: number;
    failed: number;
    successRate: number;
  }>;
  byPriority: Record<NotificationPriority, {
    sent: number;
    delivered: number;
    failed: number;
    successRate: number;
  }>;
  timeSeriesData: Array<{
    date: Date;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

/**
 * Repository interface for notification persistence
 */
export interface NotificationRepository {
  // CRUD operations for notifications
  create(notification: Notification): Promise<Notification>;
  update(id: string, updates: Partial<Notification>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findMany(filters: NotificationFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Notification>>;
  delete(id: string): Promise<void>;
  deleteMany(filters: NotificationFilters): Promise<number>;

  // Status management
  updateStatus(id: string, status: NotificationStatus, metadata?: Record<string, any>): Promise<void>;
  markAsSent(id: string, sentAt?: Date): Promise<void>;
  markAsDelivered(id: string, deliveredAt?: Date): Promise<void>;
  markAsFailed(id: string, failureReason: string): Promise<void>;
  incrementRetryCount(id: string): Promise<void>;

  // Scheduled notifications
  findScheduled(before: Date): Promise<Notification[]>;
  findPendingRetries(maxRetries: number): Promise<Notification[]>;
  reschedule(id: string, scheduledAt: Date): Promise<void>;

  // Bulk operations
  createMany(notifications: Notification[]): Promise<Notification[]>;
  updateMany(filters: NotificationFilters, updates: Partial<Notification>): Promise<number>;

  // Analytics and reporting
  getAnalytics(filters: NotificationFilters, dateRange: { from: Date; to: Date }): Promise<NotificationAnalytics>;
  getDeliveryStats(dateRange: { from: Date; to: Date }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    successRate: number;
  }>;
  getChannelStats(): Promise<Record<NotificationChannel, number>>;
  getEventTypeStats(): Promise<Record<NotificationEventType, number>>;
}

/**
 * Repository interface for notification templates
 */
export interface NotificationTemplateRepository {
  create(template: NotificationTemplate): Promise<NotificationTemplate>;
  update(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
  findById(id: string): Promise<NotificationTemplate | null>;
  findByEventTypeAndChannel(eventType: NotificationEventType, channel: NotificationChannel): Promise<NotificationTemplate | null>;
  findMany(filters: {
    isActive?: boolean;
    channel?: NotificationChannel;
    eventType?: NotificationEventType;
  }): Promise<NotificationTemplate[]>;
  delete(id: string): Promise<void>;
  activate(id: string): Promise<void>;
  deactivate(id: string): Promise<void>;
}

/**
 * Repository interface for notification subscriptions
 */
export interface NotificationSubscriptionRepository {
  create(subscription: NotificationSubscription): Promise<NotificationSubscription>;
  update(id: string, updates: Partial<NotificationSubscription>): Promise<NotificationSubscription>;
  findById(id: string): Promise<NotificationSubscription | null>;
  findByUserId(userId: string): Promise<NotificationSubscription | null>;
  findMany(filters: { userId?: string }): Promise<NotificationSubscription[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;

  // Preference management
  updatePreferences(
    userId: string,
    eventType: NotificationEventType,
    channel: NotificationChannel,
    preferences: { enabled: boolean; priority: NotificationPriority }
  ): Promise<void>;
  getPreferences(
    userId: string,
    eventType: NotificationEventType,
    channel: NotificationChannel
  ): Promise<{ enabled: boolean; priority: NotificationPriority } | null>;
}

/**
 * Repository interface for notification batches
 */
export interface NotificationBatchRepository {
  create(batch: NotificationBatch): Promise<NotificationBatch>;
  update(id: string, updates: Partial<NotificationBatch>): Promise<NotificationBatch>;
  findById(id: string): Promise<NotificationBatch | null>;
  findMany(filters: { status?: NotificationBatch['status'] }): Promise<NotificationBatch[]>;
  delete(id: string): Promise<void>;
  updateStats(id: string, stats: { successCount: number; failureCount: number }): Promise<void>;
  markAsCompleted(id: string): Promise<void>;
  markAsFailed(id: string, reason: string): Promise<void>;
}

// Error types for repository operations
export class NotificationRepositoryError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NotificationRepositoryError';
  }
}

export class NotificationNotFoundError extends NotificationRepositoryError {
  constructor(id: string) {
    super(`Notification not found: ${id}`, 'NOTIFICATION_NOT_FOUND');
  }
}

export class NotificationTemplateNotFoundError extends NotificationRepositoryError {
  constructor(id: string) {
    super(`Notification template not found: ${id}`, 'TEMPLATE_NOT_FOUND');
  }
}

export class NotificationSubscriptionNotFoundError extends NotificationRepositoryError {
  constructor(id: string) {
    super(`Notification subscription not found: ${id}`, 'SUBSCRIPTION_NOT_FOUND');
  }
}

export class NotificationBatchNotFoundError extends NotificationRepositoryError {
  constructor(id: string) {
    super(`Notification batch not found: ${id}`, 'BATCH_NOT_FOUND');
  }
}