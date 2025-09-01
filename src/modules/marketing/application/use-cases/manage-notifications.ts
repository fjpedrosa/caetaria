/**
 * Manage Notifications Use Cases
 * Application layer - CRUD operations and notification management
 */

import {
  Notification,
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
} from '../../domain/entities/notification';
import {
  NotificationAnalytics,
  NotificationFilters,
  NotificationNotFoundError,
  NotificationRepository,
  PaginatedResult,
  PaginationOptions,
} from '../../domain/repositories/notification-repository';

// Get notifications request
export interface GetNotificationsRequest {
  filters?: NotificationFilters;
  pagination?: PaginationOptions;
}

// Update notification request
export interface UpdateNotificationRequest {
  id: string;
  updates: {
    status?: NotificationStatus;
    scheduledAt?: Date;
    metadata?: Record<string, any>;
  };
}

// Retry notification request
export interface RetryNotificationRequest {
  id: string;
  maxRetries?: number;
  delay?: number; // in milliseconds
}

// Batch operations request
export interface BatchNotificationRequest {
  filters: NotificationFilters;
  operation: 'delete' | 'retry' | 'cancel' | 'reschedule';
  operationData?: {
    scheduledAt?: Date;
    maxRetries?: number;
  };
}

// Dependencies interface
interface Dependencies {
  notificationRepository: NotificationRepository;
}

/**
 * Get notifications use case
 */
export const createGetNotificationsUseCase = (deps: Dependencies) => {
  return async (request: GetNotificationsRequest = {}): Promise<PaginatedResult<Notification>> => {
    const { notificationRepository } = deps;

    const filters = request.filters || {};
    const pagination = request.pagination || { page: 1, limit: 20 };

    return await notificationRepository.findMany(filters, pagination);
  };
};

/**
 * Get notification by ID use case
 */
export const createGetNotificationByIdUseCase = (deps: Dependencies) => {
  return async (id: string): Promise<Notification> => {
    const { notificationRepository } = deps;

    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    return notification;
  };
};

/**
 * Update notification use case
 */
export const createUpdateNotificationUseCase = (deps: Dependencies) => {
  return async (request: UpdateNotificationRequest): Promise<Notification> => {
    const { notificationRepository } = deps;

    // Verify notification exists
    const existing = await notificationRepository.findById(request.id);
    if (!existing) {
      throw new NotificationNotFoundError(request.id);
    }

    // Update notification
    const updatedNotification = await notificationRepository.update(request.id, {
      ...request.updates,
      updatedAt: new Date(),
    });

    return updatedNotification;
  };
};

/**
 * Delete notification use case
 */
export const createDeleteNotificationUseCase = (deps: Dependencies) => {
  return async (id: string): Promise<void> => {
    const { notificationRepository } = deps;

    // Verify notification exists
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw new NotificationNotFoundError(id);
    }

    await notificationRepository.delete(id);
  };
};

/**
 * Retry failed notification use case
 */
export const createRetryNotificationUseCase = (deps: Dependencies) => {
  return async (request: RetryNotificationRequest): Promise<Notification> => {
    const { notificationRepository } = deps;

    // Get notification
    const notification = await notificationRepository.findById(request.id);
    if (!notification) {
      throw new NotificationNotFoundError(request.id);
    }

    // Check if notification can be retried
    if (notification.status !== NotificationStatus.FAILED) {
      throw new Error('Only failed notifications can be retried');
    }

    if (notification.retryCount >= notification.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    // Update retry count and status
    await notificationRepository.incrementRetryCount(request.id);

    const updatedNotification = await notificationRepository.updateStatus(
      request.id,
      NotificationStatus.PENDING,
      {
        retryAt: new Date(Date.now() + (request.delay || 0)),
        lastRetryReason: `Manual retry ${notification.retryCount + 1}`,
      }
    );

    // If delay is specified, reschedule the notification
    if (request.delay) {
      await notificationRepository.reschedule(
        request.id,
        new Date(Date.now() + request.delay)
      );
    }

    return await notificationRepository.findById(request.id) as Notification;
  };
};

/**
 * Cancel scheduled notification use case
 */
export const createCancelNotificationUseCase = (deps: Dependencies) => {
  return async (id: string): Promise<Notification> => {
    const { notificationRepository } = deps;

    // Get notification
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotificationNotFoundError(id);
    }

    // Check if notification can be cancelled
    if (notification.status !== NotificationStatus.SCHEDULED && notification.status !== NotificationStatus.PENDING) {
      throw new Error('Only scheduled or pending notifications can be cancelled');
    }

    // Update status
    const updatedNotification = await notificationRepository.update(id, {
      status: NotificationStatus.FAILED,
      updatedAt: new Date(),
      metadata: {
        ...notification.metadata,
        cancelledAt: new Date(),
        cancelReason: 'Manual cancellation',
      },
    });

    return updatedNotification;
  };
};

/**
 * Process scheduled notifications use case
 */
export const createProcessScheduledNotificationsUseCase = (deps: Dependencies) => {
  return async (): Promise<{ processed: number; failed: number }> => {
    const { notificationRepository } = deps;

    // Find notifications scheduled for now or earlier
    const scheduledNotifications = await notificationRepository.findScheduled(new Date());

    let processed = 0;
    let failed = 0;

    for (const notification of scheduledNotifications) {
      try {
        // Update status to pending for processing
        await notificationRepository.updateStatus(
          notification.id,
          NotificationStatus.PENDING,
          { processedAt: new Date() }
        );
        processed++;
      } catch (error) {
        console.error(`Failed to process scheduled notification ${notification.id}:`, error);

        try {
          await notificationRepository.markAsFailed(
            notification.id,
            `Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        } catch (markFailedError) {
          console.error('Failed to mark notification as failed:', markFailedError);
        }

        failed++;
      }
    }

    return { processed, failed };
  };
};

/**
 * Process retry notifications use case
 */
export const createProcessRetryNotificationsUseCase = (deps: Dependencies) => {
  return async (): Promise<{ processed: number; failed: number }> => {
    const { notificationRepository } = deps;

    // Find notifications that need retry
    const retryNotifications = await notificationRepository.findPendingRetries(10); // Max 10 retries

    let processed = 0;
    let failed = 0;

    for (const notification of retryNotifications) {
      try {
        if (notification.retryCount < notification.maxRetries) {
          await notificationRepository.updateStatus(
            notification.id,
            NotificationStatus.PENDING,
            { retryProcessedAt: new Date() }
          );
          processed++;
        } else {
          await notificationRepository.markAsFailed(
            notification.id,
            'Maximum retry attempts exceeded'
          );
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process retry notification ${notification.id}:`, error);
        failed++;
      }
    }

    return { processed, failed };
  };
};

/**
 * Batch operations use case
 */
export const createBatchNotificationOperationsUseCase = (deps: Dependencies) => {
  return async (request: BatchNotificationRequest): Promise<{ affected: number; errors: string[] }> => {
    const { notificationRepository } = deps;
    const errors: string[] = [];

    try {
      switch (request.operation) {
        case 'delete':
          const deletedCount = await notificationRepository.deleteMany(request.filters);
          return { affected: deletedCount, errors };

        case 'cancel':
          const cancelledCount = await notificationRepository.updateMany(
            request.filters,
            {
              status: NotificationStatus.FAILED,
              updatedAt: new Date(),
              metadata: { cancelledAt: new Date(), cancelReason: 'Batch cancellation' },
            }
          );
          return { affected: cancelledCount, errors };

        case 'reschedule':
          if (!request.operationData?.scheduledAt) {
            throw new Error('scheduledAt is required for reschedule operation');
          }

          const rescheduledCount = await notificationRepository.updateMany(
            request.filters,
            {
              scheduledAt: request.operationData.scheduledAt,
              status: NotificationStatus.SCHEDULED,
              updatedAt: new Date(),
            }
          );
          return { affected: rescheduledCount, errors };

        case 'retry':
          // For retry, we need to handle each notification individually
          const retryFilters = { ...request.filters, status: [NotificationStatus.FAILED] };
          const failedNotifications = await notificationRepository.findMany(retryFilters);

          let retryCount = 0;
          for (const notification of failedNotifications.data) {
            if (notification.retryCount < notification.maxRetries) {
              try {
                await notificationRepository.incrementRetryCount(notification.id);
                await notificationRepository.updateStatus(
                  notification.id,
                  NotificationStatus.PENDING,
                  { batchRetryAt: new Date() }
                );
                retryCount++;
              } catch (error) {
                errors.push(`Failed to retry notification ${notification.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          }
          return { affected: retryCount, errors };

        default:
          throw new Error(`Unsupported batch operation: ${request.operation}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return { affected: 0, errors };
    }
  };
};

/**
 * Get notification analytics use case
 */
export const createGetNotificationAnalyticsUseCase = (deps: Dependencies) => {
  return async (
    filters: NotificationFilters,
    dateRange: { from: Date; to: Date }
  ): Promise<NotificationAnalytics> => {
    const { notificationRepository } = deps;

    return await notificationRepository.getAnalytics(filters, dateRange);
  };
};

/**
 * Get delivery statistics use case
 */
export const createGetDeliveryStatsUseCase = (deps: Dependencies) => {
  return async (dateRange: { from: Date; to: Date }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    successRate: number;
  }> => {
    const { notificationRepository } = deps;

    return await notificationRepository.getDeliveryStats(dateRange);
  };
};

/**
 * Cleanup old notifications use case
 */
export const createCleanupNotificationsUseCase = (deps: Dependencies) => {
  return async (olderThan: Date): Promise<{ deleted: number }> => {
    const { notificationRepository } = deps;

    const filters: NotificationFilters = {
      createdBefore: olderThan,
      status: [NotificationStatus.DELIVERED, NotificationStatus.FAILED],
    };

    const deletedCount = await notificationRepository.deleteMany(filters);

    return { deleted: deletedCount };
  };
};