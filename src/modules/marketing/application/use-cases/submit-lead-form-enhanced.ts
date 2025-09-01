/**
 * Enhanced Submit Lead Form Use Case
 * Application layer - Enhanced lead submission with comprehensive notification system
 */

import { createLead, Lead, LeadSource } from '../../domain/entities/lead';
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from '../../domain/entities/notification';
import { LeadRepository } from '../../domain/repositories/lead-repository';
import { createEmail, Email } from '../../domain/value-objects/email';
import { createPhoneNumber, PhoneNumber } from '../../domain/value-objects/phone-number';
import { getNotificationConfig } from '../../infra/config/notification-config';
import { AnalyticsService } from '../ports/analytics-service';
import { NotificationService } from '../ports/notification-service';

import {
  createSendComprehensiveLeadNotificationUseCase,
  createSendNotificationUseCase,
} from './send-lead-notifications';

export interface EnhancedSubmitLeadFormInput {
  email: string;
  phoneNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  source: LeadSource;
  interestedFeatures?: string[];
  notes?: string;
  // Enhanced tracking data
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  // A/B testing data
  experimentId?: string;
  variant?: string;
  // Lead scoring data
  leadScore?: number;
  leadQuality?: 'low' | 'medium' | 'high';
}

export interface EnhancedSubmitLeadFormOutput {
  success: boolean;
  lead?: Lead;
  error?: string;
  isDuplicate?: boolean;
  notifications?: {
    sent: number;
    failed: number;
    channels: string[];
  };
  analytics?: {
    tracked: boolean;
    eventId?: string;
  };
}

export interface EnhancedSubmitLeadFormDependencies {
  leadRepository: LeadRepository;
  analyticsService: AnalyticsService;
  notificationService: NotificationService;
  sendNotificationUseCase: ReturnType<typeof createSendNotificationUseCase>;
}

/**
 * Enhanced factory function for creating SubmitLeadForm use case
 * Provides comprehensive notification support, enhanced tracking, and lead scoring
 */
export const createEnhancedSubmitLeadFormUseCase = (dependencies: EnhancedSubmitLeadFormDependencies) => {
  const { leadRepository, analyticsService, notificationService, sendNotificationUseCase } = dependencies;
  const notificationConfig = getNotificationConfig();

  const execute = async (input: EnhancedSubmitLeadFormInput): Promise<EnhancedSubmitLeadFormOutput> => {
    try {
      // 1. Validate and create value objects
      const email = createEmail(input.email);
      let phoneNumber: PhoneNumber | undefined;

      if (input.phoneNumber?.trim()) {
        phoneNumber = createPhoneNumber(input.phoneNumber);
      }

      // 2. Check for existing lead
      const existingLead = await leadRepository.findByEmail(email);
      if (existingLead) {
        // Enhanced analytics tracking for duplicates
        await analyticsService.track({
          event: 'lead_duplicate_attempt',
          properties: {
            email: input.email,
            source: input.source,
            originalLeadId: existingLead.id,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
            referrer: input.referrer,
            utm: {
              source: input.utmSource,
              medium: input.utmMedium,
              campaign: input.utmCampaign,
              term: input.utmTerm,
              content: input.utmContent,
            },
          },
        });

        return {
          success: false,
          error: 'Email already registered',
          isDuplicate: true,
          analytics: { tracked: true },
        };
      }

      // 3. Calculate lead score based on input data
      const leadScore = calculateLeadScore(input);
      const leadQuality = determineLeadQuality(leadScore);

      // 4. Create new lead with enhanced metadata
      const lead = createLead({
        email,
        phoneNumber,
        companyName: input.companyName,
        firstName: input.firstName,
        lastName: input.lastName,
        source: input.source,
        interestedFeatures: input.interestedFeatures,
        notes: input.notes,
        metadata: {
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          referrer: input.referrer,
          utm: {
            source: input.utmSource,
            medium: input.utmMedium,
            campaign: input.utmCampaign,
            term: input.utmTerm,
            content: input.utmContent,
          },
          experiment: input.experimentId ? {
            id: input.experimentId,
            variant: input.variant,
          } : undefined,
          leadScore,
          leadQuality: input.leadQuality || leadQuality,
          submissionTimestamp: new Date().toISOString(),
        },
      });

      // 5. Save lead
      await leadRepository.save(lead);

      // 6. Enhanced analytics tracking
      const analyticsResult = await analyticsService.trackLeadConversion({
        email,
        source: input.source,
        companyName: input.companyName,
        interestedFeatures: input.interestedFeatures,
        leadScore,
        leadQuality: input.leadQuality || leadQuality,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        referrer: input.referrer,
        utm: {
          source: input.utmSource,
          medium: input.utmMedium,
          campaign: input.utmCampaign,
          term: input.utmTerm,
          content: input.utmContent,
        },
        experiment: input.experimentId ? {
          id: input.experimentId,
          variant: input.variant,
        } : undefined,
      });

      // 7. Enhanced notification sending
      const notificationResults = await sendEnhancedNotifications(
        lead,
        leadScore,
        input.leadQuality || leadQuality,
        sendNotificationUseCase,
        notificationConfig
      );

      return {
        success: true,
        lead,
        notifications: notificationResults,
        analytics: {
          tracked: true,
          eventId: analyticsResult?.eventId,
        },
      };

    } catch (error) {
      // Enhanced error tracking
      await analyticsService.track({
        event: 'lead_submission_error',
        properties: {
          email: input.email,
          source: input.source,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          referrer: input.referrer,
          utm: {
            source: input.utmSource,
            medium: input.utmMedium,
            campaign: input.utmCampaign,
            term: input.utmTerm,
            content: input.utmContent,
          },
        },
      }).catch(() => {
        // Silent fail for analytics to prevent cascade errors
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit lead',
        analytics: { tracked: true },
      };
    }
  };

  return {
    execute,
  };
};

/**
 * Calculate lead score based on input data
 */
function calculateLeadScore(input: EnhancedSubmitLeadFormInput): number {
  let score = 50; // Base score

  // Company name provided
  if (input.companyName?.trim()) {
    score += 15;
  }

  // Phone number provided
  if (input.phoneNumber?.trim()) {
    score += 10;
  }

  // Full name provided
  if (input.firstName?.trim() && input.lastName?.trim()) {
    score += 10;
  } else if (input.firstName?.trim() || input.lastName?.trim()) {
    score += 5;
  }

  // Interested features provided
  if (input.interestedFeatures && input.interestedFeatures.length > 0) {
    score += Math.min(input.interestedFeatures.length * 5, 15);
  }

  // Notes provided (shows engagement)
  if (input.notes?.trim()) {
    score += 10;
  }

  // Source-based scoring
  switch (input.source) {
    case 'organic_search':
    case 'direct':
      score += 15; // High intent
      break;
    case 'referral':
      score += 12;
      break;
    case 'social_media':
      score += 8;
      break;
    case 'paid_ads':
      score += 5;
      break;
  }

  // UTM campaign scoring
  if (input.utmCampaign?.includes('enterprise')) {
    score += 10;
  }
  if (input.utmMedium === 'email') {
    score += 8;
  }

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Determine lead quality based on score
 */
function determineLeadQuality(score: number): 'low' | 'medium' | 'high' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/**
 * Send enhanced notifications with comprehensive channel support
 */
async function sendEnhancedNotifications(
  lead: Lead,
  leadScore: number,
  leadQuality: 'low' | 'medium' | 'high',
  sendNotificationUseCase: ReturnType<typeof createSendNotificationUseCase>,
  config: any
): Promise<{ sent: number; failed: number; channels: string[] }> {
  const notificationResults = {
    sent: 0,
    failed: 0,
    channels: [] as string[],
  };

  const notifications = [];

  // Welcome email to lead
  if (config.email.enabled) {
    notifications.push({
      eventType: NotificationEventType.WELCOME_SEQUENCE,
      priority: NotificationPriority.NORMAL,
      channels: [{
        type: NotificationChannel.EMAIL,
        data: {
          to: lead.email,
          from: config.email.fromEmail,
          subject: `Welcome to ${config.email.fromName}!`,
          htmlBody: generateWelcomeEmailContent(lead, config),
          textBody: generateWelcomeEmailTextContent(lead, config),
          templateId: config.email.templates.welcomeLead,
          templateData: {
            firstName: lead.firstName || lead.email.split('@')[0],
            fullName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
            productName: config.email.fromName,
            baseUrl: config.email.baseUrl,
            interestedFeatures: lead.interestedFeatures || [],
            companyName: lead.companyName,
          },
        },
      }],
      metadata: {
        leadId: lead.id,
        leadEmail: lead.email,
        leadScore,
        leadQuality,
      },
    });
  }

  // Sales team notification (high-priority email)
  if (config.email.enabled) {
    notifications.push({
      eventType: NotificationEventType.LEAD_CAPTURED,
      priority: leadQuality === 'high' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      channels: [{
        type: NotificationChannel.EMAIL,
        data: {
          to: config.email.fromEmail, // Sales team email
          subject: `🎯 New ${leadQuality} priority lead: ${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
          htmlBody: generateSalesNotificationContent(lead, leadScore, leadQuality),
          templateId: config.email.templates.salesNotification,
          templateData: {
            leadName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
            leadEmail: lead.email,
            leadPhone: lead.phoneNumber,
            leadCompany: lead.companyName,
            leadSource: lead.source,
            leadStatus: lead.status,
            leadQuality,
            leadScore,
            interestedFeatures: lead.interestedFeatures || [],
            notes: lead.notes,
            submittedAt: lead.createdAt.toLocaleString(),
          },
        },
      }],
    });
  }

  // Webhook notifications
  if (config.webhook.enabled && config.webhook.endpoints.length > 0) {
    config.webhook.endpoints
      .filter((endpoint: any) => endpoint.active && endpoint.events.includes(NotificationEventType.LEAD_CAPTURED))
      .forEach((endpoint: any) => {
        notifications.push({
          eventType: NotificationEventType.LEAD_CAPTURED,
          priority: leadQuality === 'high' ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
          channels: [{
            type: NotificationChannel.WEBHOOK,
            data: {
              url: endpoint.url,
              method: 'POST' as const,
              headers: {
                'Content-Type': 'application/json',
                'X-Event-Type': NotificationEventType.LEAD_CAPTURED,
                'X-Lead-Quality': leadQuality,
                'X-Lead-Score': leadScore.toString(),
              },
              payload: {
                event: 'lead.captured',
                timestamp: new Date().toISOString(),
                data: {
                  lead: {
                    id: lead.id,
                    email: lead.email,
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    phoneNumber: lead.phoneNumber,
                    companyName: lead.companyName,
                    source: lead.source,
                    status: lead.status,
                    interestedFeatures: lead.interestedFeatures,
                    notes: lead.notes,
                    createdAt: lead.createdAt.toISOString(),
                    metadata: lead.metadata,
                  },
                  scoring: {
                    score: leadScore,
                    quality: leadQuality,
                  },
                },
                source: {
                  name: 'WhatsApp Cloud API Platform',
                  version: '1.0.0',
                },
              },
              secretKey: endpoint.secretKey,
              timeout: config.webhook.timeout,
            },
          }],
        });
      });
  }

  // Slack notifications for high-quality leads
  if (config.slack.enabled && leadQuality === 'high' && config.slack.channels.length > 0) {
    config.slack.channels
      .filter((channel: any) => channel.active && channel.events.includes(NotificationEventType.LEAD_CAPTURED))
      .forEach((channel: any) => {
        notifications.push({
          eventType: NotificationEventType.LEAD_CAPTURED,
          priority: NotificationPriority.HIGH,
          channels: [{
            type: NotificationChannel.SLACK,
            data: {
              channel: channel.channelId,
              message: `🎯 High-priority lead: *${lead.firstName || ''} ${lead.lastName || ''}* from ${lead.source}`,
              attachments: [{
                title: `${lead.firstName || ''} ${lead.lastName || ''} - ${lead.source}`,
                color: 'good',
                fields: [
                  { title: 'Email', value: lead.email, short: true },
                  { title: 'Company', value: lead.companyName || 'Not provided', short: true },
                  { title: 'Phone', value: lead.phoneNumber || 'Not provided', short: true },
                  { title: 'Lead Score', value: `${leadScore}/100`, short: true },
                  { title: 'Quality', value: leadQuality.toUpperCase(), short: true },
                  { title: 'Source', value: lead.source, short: true },
                  ...(lead.interestedFeatures && lead.interestedFeatures.length > 0 ? [{
                    title: 'Interested Features',
                    value: lead.interestedFeatures.join(', '),
                    short: false,
                  }] : []),
                  ...(lead.notes ? [{
                    title: 'Notes',
                    value: lead.notes,
                    short: false,
                  }] : []),
                ],
              }],
            },
          }],
        });
      });
  }

  // Send all notifications in parallel
  const results = await Promise.allSettled(
    notifications.map(notification => sendNotificationUseCase(notification))
  );

  // Process results
  results.forEach((result, index) => {
    const channel = notifications[index].channels[0].type;
    notificationResults.channels.push(channel);

    if (result.status === 'fulfilled') {
      if (result.value.status === 'delivered' || result.value.status === 'sent') {
        notificationResults.sent++;
      } else {
        notificationResults.failed++;
      }
    } else {
      notificationResults.failed++;
      console.error(`Notification failed for channel ${channel}:`, result.reason);
    }
  });

  return notificationResults;
}

// Helper functions for generating email content
function generateWelcomeEmailContent(lead: Lead, config: any): string {
  const firstName = lead.firstName || lead.email.split('@')[0];
  return `
    <h1>Welcome, ${firstName}!</h1>
    <p>Thank you for your interest in our WhatsApp Cloud API platform.</p>
    <!-- Full HTML template would be here -->
  `;
}

function generateWelcomeEmailTextContent(lead: Lead, config: any): string {
  const firstName = lead.firstName || lead.email.split('@')[0];
  return `Welcome, ${firstName}!\n\nThank you for your interest in our WhatsApp Cloud API platform.`;
}

function generateSalesNotificationContent(lead: Lead, leadScore: number, leadQuality: string): string {
  const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
  return `
    <h2>New ${leadQuality} priority lead captured!</h2>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Lead Score:</strong> ${leadScore}/100</p>
    <!-- Full HTML template would be here -->
  `;
}

// Export type for the enhanced use case factory
export type EnhancedSubmitLeadFormUseCase = ReturnType<typeof createEnhancedSubmitLeadFormUseCase>;