/**
 * Landing Module Barrel Export
 * Clean Architecture - Module public interface
 */

// Domain Layer - Pure business logic
export type { Lead, LeadId, LeadSource, LeadStatus } from './domain/entities/lead';
export { addLeadNotes, createLead, getLeadFullName,updateLeadStatus } from './domain/entities/lead';
export type { LeadFilters,LeadRepository } from './domain/repositories/lead-repository';
export type { Email } from './domain/value-objects/email';
export { createEmail, getEmailDomain } from './domain/value-objects/email';
export type { PhoneNumber } from './domain/value-objects/phone-number';
export { createPhoneNumber, formatPhoneNumber } from './domain/value-objects/phone-number';

// Application Layer - Use cases and ports
export type { AnalyticsEvent, AnalyticsService, LeadAnalyticsData } from './application/ports/analytics-service';
export type { EmailNotification, NotificationService, SlackNotification } from './application/ports/notification-service';
export type { LandingAnalyticsInput, LandingAnalyticsOutput } from './application/use-cases/get-landing-analytics';
export { GetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';
export type { SubmitLeadFormInput, SubmitLeadFormOutput } from './application/use-cases/submit-lead-form';
export { SubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';

// Infrastructure Layer - Adapters and services
export { SupabaseLeadRepository } from './infra/adapters/supabase-lead-repository';
export { EmailNotificationService } from './infra/services/email-notification-service';
export { GoogleAnalyticsService, MockAnalyticsService } from './infra/services/google-analytics-service';

// UI Layer - React components
export type { LeadFormData, LeadFormProps } from './ui/components/lead-form';
export { LeadForm } from './ui/components/lead-form';

// Module Configuration
export type { LandingModuleConfig, LandingModuleDependencies,LandingUseCaseFactories } from './marketing-module';