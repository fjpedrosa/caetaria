/**
 * Manage Session Use Case
 * Application layer - Comprehensive session management operations
 */

import { Email } from '../../../marketing/domain/value-objects/email';
import { failure, isSuccess, Result, success } from '../../../shared/domain/value-objects/result';
import {
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStep,
  SessionAnalytics
} from '../../domain/entities/onboarding-session';
import { OnboardingRepository } from '../ports/onboarding-repository';
import { SessionManagementService } from '../services/session-management-service';

// Command interfaces for different session management operations
export interface RecoverSessionCommand {
  readonly recoveryToken: string;
}

export interface SynchronizeSessionCommand {
  readonly sessionId: OnboardingSessionId;
  readonly clientVersion: number;
  readonly deviceInfo?: SessionAnalytics['deviceInfo'];
}

export interface PauseSessionCommand {
  readonly sessionId: OnboardingSessionId;
  readonly reason?: string;
}

export interface ResumeSessionCommand {
  readonly sessionId: OnboardingSessionId;
}

export interface UpdateAbTestCommand {
  readonly sessionId: OnboardingSessionId;
  readonly testName: string;
  readonly variant: string;
}

export interface GetSessionAnalyticsCommand {
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly conversionSource?: string;
}

export interface TrackAbandonmentCommand {
  readonly abandonmentThresholdMinutes?: number;
}

export interface SessionCleanupCommand {
  // No parameters needed - uses default cleanup rules
}

// Dependencies interface
export interface ManageSessionDependencies {
  readonly onboardingRepository: OnboardingRepository;
  readonly sessionManagementService?: SessionManagementService;
}

/**
 * Factory function to create session management use cases
 */
export const createManageSessionUseCases = (deps: ManageSessionDependencies) => {
  const { onboardingRepository } = deps;
  const sessionService = deps.sessionManagementService || new SessionManagementService(onboardingRepository);

  return {
    /**
     * Recover session using recovery token
     */
    recoverSession: async (command: RecoverSessionCommand): Promise<Result<{
      session: OnboardingSession;
      wasExpired: boolean;
      wasExtended: boolean;
    }, Error>> => {
      try {
        const result = await sessionService.recoverSession(command.recoveryToken);

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error recovering session'
        ));
      }
    },

    /**
     * Synchronize session across devices
     */
    synchronizeSession: async (command: SynchronizeSessionCommand): Promise<Result<{
      synchronized: boolean;
      conflicts: string[];
      resolved: boolean;
    }, Error>> => {
      try {
        const result = await sessionService.synchronizeSession(
          command.sessionId,
          command.clientVersion,
          command.deviceInfo
        );

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error synchronizing session'
        ));
      }
    },

    /**
     * Pause session with optional reason
     */
    pauseSession: async (command: PauseSessionCommand): Promise<Result<OnboardingSession, Error>> => {
      try {
        const result = await sessionService.pauseSession(command.sessionId, command.reason);

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error pausing session'
        ));
      }
    },

    /**
     * Resume paused session
     */
    resumeSession: async (command: ResumeSessionCommand): Promise<Result<OnboardingSession, Error>> => {
      try {
        const result = await sessionService.resumeSession(command.sessionId);

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error resuming session'
        ));
      }
    },

    /**
     * Update session with A/B test variant
     */
    updateAbTestVariant: async (command: UpdateAbTestCommand): Promise<Result<OnboardingSession, Error>> => {
      try {
        const result = await sessionService.updateAbTestVariant(
          command.sessionId,
          command.testName,
          command.variant
        );

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error updating A/B test variant'
        ));
      }
    },

    /**
     * Get comprehensive session analytics
     */
    getSessionAnalytics: async (command: GetSessionAnalyticsCommand): Promise<Result<any, Error>> => {
      try {
        const result = await sessionService.getSessionAnalytics({
          startDate: command.startDate,
          endDate: command.endDate,
          conversionSource: command.conversionSource,
        });

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error getting session analytics'
        ));
      }
    },

    /**
     * Track abandoned sessions and mark them appropriately
     */
    trackAbandonment: async (command: TrackAbandonmentCommand): Promise<Result<{
      totalAbandoned: number;
      sessionsMarkedAbandoned: OnboardingSession[];
      errors: Error[];
    }, Error>> => {
      try {
        const result = await sessionService.trackAbandonedSessions(
          command.abandonmentThresholdMinutes || 30
        );

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error tracking abandoned sessions'
        ));
      }
    },

    /**
     * Perform comprehensive session cleanup
     */
    performCleanup: async (command: SessionCleanupCommand): Promise<Result<{
      expiredSessionsDeleted: number;
      abandonedSessionsMarked: number;
      errors: Error[];
    }, Error>> => {
      try {
        const result = await sessionService.performSessionCleanup();

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error performing session cleanup'
        ));
      }
    },

    /**
     * Get session summary for monitoring
     */
    getSessionSummary: async (sessionId: OnboardingSessionId): Promise<Result<any, Error>> => {
      try {
        const result = await sessionService.getSessionSummary(sessionId);

        if (!isSuccess(result)) {
          return failure(result.error);
        }

        return success(result.data);
      } catch (error) {
        return failure(new Error(
          error instanceof Error ? error.message : 'Unknown error getting session summary'
        ));
      }
    },
  };
};

// =============================================================================
// LEGACY COMPATIBILITY - For gradual migration
// =============================================================================

/**
 * @deprecated Use createManageSessionUseCases factory function instead
 * Legacy class wrapper for backward compatibility during migration
 */
export class ManageSessionUseCase {
  private useCases: ReturnType<typeof createManageSessionUseCases>;

  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly sessionManagementService?: SessionManagementService
  ) {
    this.useCases = createManageSessionUseCases({
      onboardingRepository,
      sessionManagementService,
    });
  }

  async recoverSession(command: RecoverSessionCommand) {
    return this.useCases.recoverSession(command);
  }

  async synchronizeSession(command: SynchronizeSessionCommand) {
    return this.useCases.synchronizeSession(command);
  }

  async pauseSession(command: PauseSessionCommand) {
    return this.useCases.pauseSession(command);
  }

  async resumeSession(command: ResumeSessionCommand) {
    return this.useCases.resumeSession(command);
  }

  async updateAbTestVariant(command: UpdateAbTestCommand) {
    return this.useCases.updateAbTestVariant(command);
  }

  async getSessionAnalytics(command: GetSessionAnalyticsCommand) {
    return this.useCases.getSessionAnalytics(command);
  }

  async trackAbandonment(command: TrackAbandonmentCommand) {
    return this.useCases.trackAbandonment(command);
  }

  async performCleanup(command: SessionCleanupCommand) {
    return this.useCases.performCleanup(command);
  }

  async getSessionSummary(sessionId: OnboardingSessionId) {
    return this.useCases.getSessionSummary(sessionId);
  }
}