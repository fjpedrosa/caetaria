/**
 * Landing Module Configuration
 * Module-level dependency registration and configuration
 */

import { 
  DependencyContainer, 
  ModuleConfig, 
  DEPENDENCY_TOKENS,
  createUseCaseFactory 
} from '../shared/application/interfaces/dependency-container';

import { LeadRepository } from './domain/repositories/lead-repository';
import { AnalyticsService } from './application/ports/analytics-service';
import { NotificationService } from './application/ports/notification-service';

import { SubmitLeadFormUseCase } from './application/use-cases/submit-lead-form';
import { GetLandingAnalyticsUseCase } from './application/use-cases/get-landing-analytics';

import { SupabaseLeadRepository } from './infra/adapters/supabase-lead-repository';
import { GoogleAnalyticsService, MockAnalyticsService } from './infra/services/google-analytics-service';
import { EmailNotificationService } from './infra/services/email-notification-service';

/**
 * Landing Module Configuration
 * Registers all dependencies for the landing module
 */
export class LandingModuleConfig implements ModuleConfig {
  constructor(
    private readonly environment: 'development' | 'production' | 'test' = 'development'
  ) {}

  registerDependencies(container: DependencyContainer): void {
    // Register repositories
    container.registerFactory(DEPENDENCY_TOKENS.LEAD_REPOSITORY, (container) => {
      const supabaseClient = container.resolve(DEPENDENCY_TOKENS.SUPABASE_CLIENT) as any;
      return new SupabaseLeadRepository(supabaseClient);
    });

    // Register services
    this.registerAnalyticsService(container);
    this.registerNotificationService(container);

    // Register use cases
    container.registerFactory(DEPENDENCY_TOKENS.SUBMIT_LEAD_FORM_USE_CASE, (container) => {
      return new SubmitLeadFormUseCase({
        leadRepository: container.resolve<LeadRepository>(DEPENDENCY_TOKENS.LEAD_REPOSITORY),
        analyticsService: container.resolve<AnalyticsService>(DEPENDENCY_TOKENS.ANALYTICS_SERVICE),
        notificationService: container.resolve<NotificationService>(DEPENDENCY_TOKENS.NOTIFICATION_SERVICE),
      });
    });

    container.registerFactory(DEPENDENCY_TOKENS.GET_LANDING_ANALYTICS_USE_CASE, (container) => {
      return new GetLandingAnalyticsUseCase({
        leadRepository: container.resolve<LeadRepository>(DEPENDENCY_TOKENS.LEAD_REPOSITORY),
      });
    });
  }

  private registerAnalyticsService(container: DependencyContainer): void {
    if (this.environment === 'test') {
      container.register(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, new MockAnalyticsService());
    } else if (this.environment === 'development') {
      container.register(
        DEPENDENCY_TOKENS.ANALYTICS_SERVICE, 
        new MockAnalyticsService()
      );
    } else {
      container.registerFactory(DEPENDENCY_TOKENS.ANALYTICS_SERVICE, () => {
        const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (!measurementId) {
          console.warn('GA_MEASUREMENT_ID not configured, using mock analytics');
          return new MockAnalyticsService();
        }
        return new GoogleAnalyticsService(measurementId, false);
      });
    }
  }

  private registerNotificationService(container: DependencyContainer): void {
    container.registerFactory(DEPENDENCY_TOKENS.NOTIFICATION_SERVICE, (container) => {
      const emailClient = container.resolve(DEPENDENCY_TOKENS.EMAIL_CLIENT);
      const slackClient = container.has(DEPENDENCY_TOKENS.SLACK_CLIENT) 
        ? container.resolve(DEPENDENCY_TOKENS.SLACK_CLIENT)
        : undefined;
      
      const config = container.resolve(DEPENDENCY_TOKENS.CONFIG) as any;
      
      return new EmailNotificationService(
        emailClient as any,
        {
          fromEmail: config.fromEmail || 'hello@whatsappcloud.com',
          salesTeamChannel: config.slackSalesChannel,
          baseUrl: config.baseUrl || 'https://whatsappcloud.com',
        },
        slackClient as any
      );
    });
  }
}

/**
 * Landing Module Use Case Factories
 * Provides type-safe factories for creating use cases
 */
export const LandingUseCaseFactories = {
  submitLeadForm: createUseCaseFactory<SubmitLeadFormUseCase>((container) => 
    container.resolve(DEPENDENCY_TOKENS.SUBMIT_LEAD_FORM_USE_CASE)
  ),
  
  getLandingAnalytics: createUseCaseFactory<GetLandingAnalyticsUseCase>((container) =>
    container.resolve(DEPENDENCY_TOKENS.GET_LANDING_ANALYTICS_USE_CASE)
  ),
};

/**
 * Type definitions for external dependencies
 */
export interface LandingModuleDependencies {
  supabaseClient: any; // Supabase client
  emailClient: any; // Email service client
  slackClient?: any; // Optional Slack client
  config: {
    fromEmail: string;
    slackSalesChannel?: string;
    baseUrl: string;
    gaTrackingId?: string;
  };
}