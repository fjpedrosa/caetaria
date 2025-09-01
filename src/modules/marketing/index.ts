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
export type { GetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';
export { createGetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';
export type { SubmitLeadFormInput, SubmitLeadFormOutput } from './application/use-cases/submit-lead-form';
export type { SubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';
export { createSubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';

// Enhanced notification system exports
export type {
  EnhancedSubmitLeadFormInput,
  EnhancedSubmitLeadFormOutput,
  EnhancedSubmitLeadFormUseCase
} from './application/use-cases/submit-lead-form-enhanced';
export { createEnhancedSubmitLeadFormUseCase } from './application/use-cases/submit-lead-form-enhanced';

// Infrastructure Layer - Adapters and services
export { createSupabaseLeadRepository } from './infra/adapters/supabase-lead-repository';
export { createEmailNotificationService } from './infra/services/email-notification-service';
export {
  createAnalyticsConfig,
  createAnalyticsService,
  createGoogleAnalyticsService,
  createMockAnalyticsService,
} from './infra/services/google-analytics-service';

// Comprehensive notification system exports
export * from './notification-system';

// UI Layer - React components
export type { LeadFormData, LeadFormProps } from './ui/components/lead-form';
export { LeadForm } from './ui/components/lead-form';

// Module Configuration - Functional Implementation
export type {
  AnalyticsConfig,
  Environment,
  LandingModuleDependencies,
  MarketingModuleConfig,
  MarketingModuleDependencies,
  NotificationConfig,
} from './marketing-module';
export {
  createConfigForEnvironment,
  // Environment-specific factories
  createDevelopmentConfig,
  // Main functional configuration
  createMarketingModuleConfig,
  createProductionConfig,
  createTestConfig,
  // Backward compatibility (deprecated)
  LandingModuleConfig,
  LandingUseCaseFactories,
  // Use case factories (new functional approach)
  MarketingUseCaseFactories,
  registerMarketingModuleDependencies,
  // Convenience setup functions
  setupMarketingModuleForDevelopment,
  setupMarketingModuleForProduction,
  setupMarketingModuleForTest,
  setupMarketingModuleWithConfig,
} from './marketing-module';