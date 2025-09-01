/**
 * Supabase Onboarding Repository Adapter
 * Infrastructure layer - Supabase implementation of onboarding data persistence
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Email } from '../../../marketing/domain/value-objects/email';
import { failure, Result, success } from '../../../shared/domain/value-objects/result';
import { OnboardingRepository } from '../../application/ports/onboarding-repository';
import {
  OnboardingSession,
  OnboardingSessionId,
  OnboardingStatus,
  OnboardingStep,
  SessionAnalytics
} from '../../domain/entities/onboarding-session';

// Database table structure
interface OnboardingSessionRecord {
  id: string;
  user_email: string;
  current_step: string;
  status: string;
  completed_steps: string[];
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
  step_data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  analytics: SessionAnalytics;
  recovery_token: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseOnboardingRepository implements OnboardingRepository {
  private supabase: SupabaseClient;
  private tableName = 'onboarding_sessions';

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    // Use environment variables or provided parameters
    const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and key are required');
    }

    this.supabase = createClient(url, key);
  }

  async save(session: OnboardingSession): Promise<Result<OnboardingSession, Error>> {
    try {
      const record = this.sessionToRecord(session);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([record])
        .select()
        .single();

      if (error) {
        return failure(new Error(`Failed to save onboarding session: ${error.message}`));
      }

      const savedSession = this.recordToSession(data);
      return success(savedSession);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error saving session'
      ));
    }
  }

  async findById(id: OnboardingSessionId): Promise<Result<OnboardingSession | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return success(null);
        }
        return failure(new Error(`Failed to find session: ${error.message}`));
      }

      const session = this.recordToSession(data);
      return success(session);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding session'
      ));
    }
  }

  async findByUserEmail(email: Email): Promise<Result<OnboardingSession | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_email', email.getValue())
        .eq('status', 'in-progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(`Failed to find session by email: ${error.message}`));
      }

      const session = this.recordToSession(data);
      return success(session);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding session by email'
      ));
    }
  }

  async findByRecoveryToken(token: string): Promise<Result<OnboardingSession | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('recovery_token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(`Failed to find session by token: ${error.message}`));
      }

      const session = this.recordToSession(data);
      return success(session);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding session by token'
      ));
    }
  }

  async update(session: OnboardingSession): Promise<Result<OnboardingSession, Error>> {
    try {
      const record = this.sessionToRecord(session);
      record.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(record)
        .eq('id', session.id)
        .select()
        .single();

      if (error) {
        return failure(new Error(`Failed to update session: ${error.message}`));
      }

      const updatedSession = this.recordToSession(data);
      return success(updatedSession);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error updating session'
      ));
    }
  }

  async delete(id: OnboardingSessionId): Promise<Result<boolean, Error>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        return failure(new Error(`Failed to delete session: ${error.message}`));
      }

      return success(true);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error deleting session'
      ));
    }
  }

  async findByStatus(status: OnboardingStatus): Promise<Result<OnboardingSession[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return failure(new Error(`Failed to find sessions by status: ${error.message}`));
      }

      const sessions = data.map(record => this.recordToSession(record));
      return success(sessions);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding sessions by status'
      ));
    }
  }

  async findAbandonedSessions(olderThanMinutes: number): Promise<Result<OnboardingSession[], Error>> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - olderThanMinutes);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'in-progress')
        .lt('last_activity_at', cutoffTime.toISOString())
        .order('last_activity_at', { ascending: true });

      if (error) {
        return failure(new Error(`Failed to find abandoned sessions: ${error.message}`));
      }

      const sessions = data.map(record => this.recordToSession(record));
      return success(sessions);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding abandoned sessions'
      ));
    }
  }

  async findExpiredSessions(): Promise<Result<OnboardingSession[], Error>> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .lt('expires_at', now)
        .in('status', ['in-progress', 'paused'])
        .order('expires_at', { ascending: true });

      if (error) {
        return failure(new Error(`Failed to find expired sessions: ${error.message}`));
      }

      const sessions = data.map(record => this.recordToSession(record));
      return success(sessions);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding expired sessions'
      ));
    }
  }

  async findSessionsInDateRange(startDate: Date, endDate: Date): Promise<Result<OnboardingSession[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        return failure(new Error(`Failed to find sessions in date range: ${error.message}`));
      }

      const sessions = data.map(record => this.recordToSession(record));
      return success(sessions);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error finding sessions in date range'
      ));
    }
  }

  async getAnalyticsSummary(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: OnboardingStatus[];
    conversionSource?: string;
  }): Promise<Result<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    averageCompletionTime: number;
    conversionRate: number;
    stepDropoffRates: Record<string, number>;
    commonAbandonmentReasons: Record<string, number>;
    conversionSourceBreakdown: Record<string, number>;
  }, Error>> {
    try {
      // Build query with filters
      let query = this.supabase.from(this.tableName).select('*');

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.status) {
        query = query.in('status', filters.status);
      }
      if (filters?.conversionSource) {
        query = query.eq('analytics->>conversionSource', filters.conversionSource);
      }

      const { data, error } = await query;

      if (error) {
        return failure(new Error(`Failed to get analytics summary: ${error.message}`));
      }

      const sessions = data.map(record => this.recordToSession(record));
      const analytics = this.calculateAnalytics(sessions);

      return success(analytics);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error getting analytics summary'
      ));
    }
  }

  async cleanupExpiredSessions(): Promise<Result<number, Error>> {
    try {
      const now = new Date().toISOString();

      const { count, error } = await this.supabase
        .from(this.tableName)
        .delete({ count: 'exact' })
        .lt('expires_at', now);

      if (error) {
        return failure(new Error(`Failed to cleanup expired sessions: ${error.message}`));
      }

      return success(count || 0);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error cleaning up expired sessions'
      ));
    }
  }

  async getActiveSessionCount(): Promise<Result<number, Error>> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in-progress');

      if (error) {
        return failure(new Error(`Failed to get active session count: ${error.message}`));
      }

      return success(count || 0);
    } catch (error) {
      return failure(new Error(
        error instanceof Error ? error.message : 'Unknown error getting active session count'
      ));
    }
  }

  // Helper methods for data transformation
  private sessionToRecord(session: OnboardingSession): Omit<OnboardingSessionRecord, 'created_at' | 'updated_at'> {
    return {
      id: session.id,
      user_email: session.userEmail.getValue(),
      current_step: session.currentStep,
      status: session.status,
      completed_steps: session.completedSteps,
      started_at: session.startedAt.toISOString(),
      last_activity_at: session.lastActivityAt.toISOString(),
      completed_at: session.completedAt?.toISOString() || null,
      step_data: session.stepData,
      metadata: session.metadata || {},
      analytics: session.analytics,
      recovery_token: session.recoveryToken || null,
      expires_at: session.expiresAt.toISOString(),
    };
  }

  private recordToSession(record: OnboardingSessionRecord): OnboardingSession {
    const email = { getValue: () => record.user_email } as Email;

    return {
      id: record.id as OnboardingSessionId,
      userEmail: email,
      currentStep: record.current_step as OnboardingStep,
      status: record.status as OnboardingStatus,
      completedSteps: record.completed_steps as OnboardingStep[],
      startedAt: new Date(record.started_at),
      lastActivityAt: new Date(record.last_activity_at),
      completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
      stepData: record.step_data,
      metadata: record.metadata,
      analytics: record.analytics,
      recoveryToken: record.recovery_token || undefined,
      expiresAt: new Date(record.expires_at),
    };
  }

  private calculateAnalytics(sessions: OnboardingSession[]) {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const abandonedSessions = sessions.filter(s => s.status === 'abandoned').length;

    // Calculate average completion time for completed sessions
    const completedSessionDurations = sessions
      .filter(s => s.status === 'completed' && s.completedAt)
      .map(s => (s.completedAt!.getTime() - s.startedAt.getTime()) / (1000 * 60)); // minutes

    const averageCompletionTime = completedSessionDurations.length > 0
      ? completedSessionDurations.reduce((a, b) => a + b, 0) / completedSessionDurations.length
      : 0;

    const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate step dropoff rates
    const stepDropoffRates: Record<string, number> = {};
    const steps = ['welcome', 'business', 'integration', 'verification', 'bot-setup', 'testing'];

    steps.forEach((step, index) => {
      const sessionsAtStep = sessions.filter(s =>
        s.completedSteps.length > index || s.currentStep === step
      ).length;

      const dropoffRate = totalSessions > 0 ? ((totalSessions - sessionsAtStep) / totalSessions) * 100 : 0;
      stepDropoffRates[step] = dropoffRate;
    });

    // Common abandonment reasons
    const commonAbandonmentReasons: Record<string, number> = {};
    sessions
      .filter(s => s.status === 'abandoned' && s.analytics.abandonmentReason)
      .forEach(s => {
        const reason = s.analytics.abandonmentReason!;
        commonAbandonmentReasons[reason] = (commonAbandonmentReasons[reason] || 0) + 1;
      });

    // Conversion source breakdown
    const conversionSourceBreakdown: Record<string, number> = {};
    sessions.forEach(s => {
      const source = s.analytics.conversionSource || 'unknown';
      conversionSourceBreakdown[source] = (conversionSourceBreakdown[source] || 0) + 1;
    });

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      averageCompletionTime,
      conversionRate,
      stepDropoffRates,
      commonAbandonmentReasons,
      conversionSourceBreakdown,
    };
  }
}