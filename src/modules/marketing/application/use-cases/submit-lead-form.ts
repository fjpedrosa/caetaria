/**
 * Submit Lead Form Use Case
 * Application layer - Business logic orchestration for lead form submission
 */

import { createLead,Lead, LeadSource } from '../../domain/entities/lead';
import { LeadRepository } from '../../domain/repositories/lead-repository';
import { createEmail,Email } from '../../domain/value-objects/email';
import { createPhoneNumber,PhoneNumber } from '../../domain/value-objects/phone-number';
import { AnalyticsService } from '../ports/analytics-service';
import { NotificationService } from '../ports/notification-service';

export interface SubmitLeadFormInput {
  email: string;
  phoneNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  source: LeadSource;
  interestedFeatures?: string[];
  notes?: string;
}

export interface SubmitLeadFormOutput {
  success: boolean;
  lead?: Lead;
  error?: string;
  isDuplicate?: boolean;
}

export interface SubmitLeadFormDependencies {
  leadRepository: LeadRepository;
  analyticsService: AnalyticsService;
  notificationService: NotificationService;
}

/**
 * Submit Lead Form Use Case
 * Handles the complete flow of lead form submission including validation,
 * duplicate checking, persistence, analytics tracking, and notifications
 */
export class SubmitLeadFormUseCase {
  constructor(private readonly deps: SubmitLeadFormDependencies) {}

  async execute(input: SubmitLeadFormInput): Promise<SubmitLeadFormOutput> {
    try {
      // 1. Validate and create value objects
      const email = createEmail(input.email);
      let phoneNumber: PhoneNumber | undefined;
      
      if (input.phoneNumber?.trim()) {
        phoneNumber = createPhoneNumber(input.phoneNumber);
      }

      // 2. Check for existing lead
      const existingLead = await this.deps.leadRepository.findByEmail(email);
      if (existingLead) {
        // Track analytics for duplicate attempt
        await this.deps.analyticsService.track({
          event: 'lead_duplicate_attempt',
          properties: {
            email: input.email,
            source: input.source,
          },
        });

        return {
          success: false,
          error: 'Email already registered',
          isDuplicate: true,
        };
      }

      // 3. Create new lead
      const lead = createLead({
        email,
        phoneNumber,
        companyName: input.companyName,
        firstName: input.firstName,
        lastName: input.lastName,
        source: input.source,
        interestedFeatures: input.interestedFeatures,
        notes: input.notes,
      });

      // 4. Save lead
      await this.deps.leadRepository.save(lead);

      // 5. Track analytics
      await this.deps.analyticsService.trackLeadConversion({
        email,
        source: input.source,
        companyName: input.companyName,
        interestedFeatures: input.interestedFeatures,
      });

      // 6. Send notifications (don't await to avoid blocking)
      Promise.all([
        this.deps.notificationService.sendWelcomeEmail(lead),
        this.deps.notificationService.notifySalesTeam(lead),
      ]).catch(error => {
        // Log error but don't fail the entire operation
        console.error('Notification error:', error);
      });

      return {
        success: true,
        lead,
      };

    } catch (error) {
      // Track error analytics
      await this.deps.analyticsService.track({
        event: 'lead_submission_error',
        properties: {
          email: input.email,
          source: input.source,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch(() => {
        // Silent fail for analytics to prevent cascade errors
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit lead',
      };
    }
  }
}