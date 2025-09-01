/**
 * Send Notification Use Case
 * Application layer - Orchestrates notification sending across multiple channels
 */

import {
  createEmailNotification,
  createInAppNotification,
  createSlackNotification,
  createSmsNotification,
  createWebhookNotification,
  Notification,
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
  NotificationStatus,
} from '../../domain/entities/notification';
import { NotificationRepository } from '../../domain/repositories/notification-repository';
import { Email } from '../../domain/value-objects/email';

// Notification request interface
export interface SendNotificationRequest {
  eventType: NotificationEventType;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  channels: Array<{
    type: NotificationChannel;
    data: any;
  }>;
  metadata?: Record<string, any>;
}

// Notification result interface
export interface SendNotificationResult {
  notificationId: string;
  status: NotificationStatus;
  channelResults: Array<{
    channel: NotificationChannel;
    status: NotificationStatus;
    deliveredAt?: Date;
    errorMessage?: string;
  }>;
}

// Notification service port interfaces
export interface EmailNotificationPort {
  send(notification: any): Promise<{ id: string; status: NotificationStatus }>;
}

export interface WebhookNotificationPort {
  send(notification: any): Promise<{ id: string; status: NotificationStatus }>;
}

export interface InAppNotificationPort {
  send(notification: any): Promise<{ id: string; status: NotificationStatus }>;
}

export interface SlackNotificationPort {
  send(notification: any): Promise<{ id: string; status: NotificationStatus }>;
}

export interface SmsNotificationPort {
  send(notification: any): Promise<{ id: string; status: NotificationStatus }>;
}

// Dependencies interface
interface Dependencies {
  notificationRepository: NotificationRepository;
  emailService?: EmailNotificationPort;
  webhookService?: WebhookNotificationPort;
  inAppService?: InAppNotificationPort;
  slackService?: SlackNotificationPort;
  smsService?: SmsNotificationPort;
}

/**
 * Send notification use case implementation
 */
export const createSendNotificationUseCase = (deps: Dependencies) => {
  return async (request: SendNotificationRequest): Promise<SendNotificationResult> => {
    const { notificationRepository } = deps;
    const notificationId = generateNotificationId();
    const channelResults: SendNotificationResult['channelResults'] = [];

    try {
      // Process each channel
      for (const channelConfig of request.channels) {
        const channelResult = await processChannel(
          notificationId,
          request,
          channelConfig,
          deps
        );
        channelResults.push(channelResult);
      }

      // Determine overall status
      const hasSuccess = channelResults.some(r => r.status === NotificationStatus.DELIVERED || r.status === NotificationStatus.SENT);
      const hasFailure = channelResults.some(r => r.status === NotificationStatus.FAILED);

      let overallStatus: NotificationStatus;
      if (hasSuccess && !hasFailure) {
        overallStatus = NotificationStatus.DELIVERED;
      } else if (hasSuccess && hasFailure) {
        overallStatus = NotificationStatus.DELIVERED; // Partial success
      } else {
        overallStatus = NotificationStatus.FAILED;
      }

      return {
        notificationId,
        status: overallStatus,
        channelResults,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);

      return {
        notificationId,
        status: NotificationStatus.FAILED,
        channelResults: channelResults.length > 0 ? channelResults : [{
          channel: request.channels[0]?.type || NotificationChannel.EMAIL,
          status: NotificationStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }],
      };
    }
  };
};

/**
 * Process individual channel
 */
async function processChannel(
  notificationId: string,
  request: SendNotificationRequest,
  channelConfig: { type: NotificationChannel; data: any },
  deps: Dependencies
): Promise<{ channel: NotificationChannel; status: NotificationStatus; deliveredAt?: Date; errorMessage?: string }> {
  try {
    let notification: Notification;
    let service: any;

    // Create notification entity based on channel type
    switch (channelConfig.type) {
      case NotificationChannel.EMAIL:
        notification = createEmailNotification(
          notificationId,
          request.eventType,
          channelConfig.data,
          {
            priority: request.priority,
            scheduledAt: request.scheduledAt,
            metadata: request.metadata,
          }
        );
        service = deps.emailService;
        break;

      case NotificationChannel.WEBHOOK:
        notification = createWebhookNotification(
          notificationId,
          request.eventType,
          channelConfig.data,
          {
            priority: request.priority,
            scheduledAt: request.scheduledAt,
            metadata: request.metadata,
          }
        );
        service = deps.webhookService;
        break;

      case NotificationChannel.IN_APP:
        notification = createInAppNotification(
          notificationId,
          request.eventType,
          channelConfig.data,
          {
            priority: request.priority,
            scheduledAt: request.scheduledAt,
            metadata: request.metadata,
          }
        );
        service = deps.inAppService;
        break;

      case NotificationChannel.SLACK:
        notification = createSlackNotification(
          notificationId,
          request.eventType,
          channelConfig.data,
          {
            priority: request.priority,
            scheduledAt: request.scheduledAt,
            metadata: request.metadata,
          }
        );
        service = deps.slackService;
        break;

      case NotificationChannel.SMS:
        notification = createSmsNotification(
          notificationId,
          request.eventType,
          channelConfig.data,
          {
            priority: request.priority,
            scheduledAt: request.scheduledAt,
            metadata: request.metadata,
          }
        );
        service = deps.smsService;
        break;

      default:
        throw new Error(`Unsupported notification channel: ${channelConfig.type}`);
    }

    // Store notification in repository
    await deps.notificationRepository.create(notification);

    // Send notification if service is available and not scheduled for future
    if (service && (!request.scheduledAt || request.scheduledAt <= new Date())) {
      const result = await service.send(notification);

      // Update notification status
      await deps.notificationRepository.updateStatus(
        notificationId,
        result.status,
        { serviceId: result.id }
      );

      if (result.status === NotificationStatus.DELIVERED || result.status === NotificationStatus.SENT) {
        await deps.notificationRepository.markAsSent(notificationId);
      } else if (result.status === NotificationStatus.FAILED) {
        await deps.notificationRepository.markAsFailed(notificationId, 'Service delivery failed');
      }

      return {
        channel: channelConfig.type,
        status: result.status,
        deliveredAt: result.status === NotificationStatus.DELIVERED ? new Date() : undefined,
      };
    } else {
      // Scheduled notification or service not available
      const status = request.scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.FAILED;

      if (status === NotificationStatus.FAILED) {
        await deps.notificationRepository.markAsFailed(notificationId, 'Service not available');
      }

      return {
        channel: channelConfig.type,
        status,
        errorMessage: service ? undefined : 'Service not configured',
      };
    }
  } catch (error) {
    console.error(`Failed to process ${channelConfig.type} channel:`, error);

    // Update notification as failed
    try {
      await deps.notificationRepository.markAsFailed(
        notificationId,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (repoError) {
      console.error('Failed to update notification status:', repoError);
    }

    return {
      channel: channelConfig.type,
      status: NotificationStatus.FAILED,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}