/**
 * Landing Module Barrel Export
 * Clean Architecture - Module public interface
 */

// Domain Layer - Pure business logic
export type { Lead, LeadId, LeadSource, LeadStatus } from './domain/entities/lead';
export { createLead, updateLeadStatus, addLeadNotes, getLeadFullName } from './domain/entities/lead';
export type { Email } from './domain/value-objects/email';
export { createEmail, getEmailDomain } from './domain/value-objects/email';
export type { PhoneNumber } from './domain/value-objects/phone-number';
export { createPhoneNumber, formatPhoneNumber } from './domain/value-objects/phone-number';
export type { LeadRepository, LeadFilters } from './domain/repositories/lead-repository';

// Application Layer - Use cases and ports
export { SubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';
export type { SubmitLeadFormInput, SubmitLeadFormOutput } from './application/use-cases/submit-lead-form';
export { GetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';
export type { LandingAnalyticsInput, LandingAnalyticsOutput } from './application/use-cases/get-landing-analytics';
export type { AnalyticsService, AnalyticsEvent, LeadAnalyticsData } from './application/ports/analytics-service';
export type { NotificationService, EmailNotification, SlackNotification } from './application/ports/notification-service';

// Infrastructure Layer - Adapters and services
export { SupabaseLeadRepository } from './infra/adapters/supabase-lead-repository';
export { GoogleAnalyticsService, MockAnalyticsService } from './infra/services/google-analytics-service';
export { EmailNotificationService } from './infra/services/email-notification-service';

// UI Layer - React components
export { LeadForm } from './ui/components/lead-form';
export type { LeadFormData, LeadFormProps } from './ui/components/lead-form';

// Module Configuration
export type { LandingModuleConfig, LandingUseCaseFactories, LandingModuleDependencies } from './marketing-module';