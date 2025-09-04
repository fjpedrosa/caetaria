/**
 * Onboarding Management API Routes
 * Administrative endpoints for session management and cleanup
 */

import { NextRequest, NextResponse } from 'next/server';

import { createManageSessionUseCases } from '../../../../modules/onboarding/application/use-cases/manage-session';
import { SupabaseOnboardingRepository } from '../../../../modules/onboarding/infrastructure/adapters/supabase-onboarding-repository';
import { isSuccess } from '../../../../modules/shared/domain/value-objects/result';

// Initialize repository
const onboardingRepository = new SupabaseOnboardingRepository();
const sessionUseCases = createManageSessionUseCases({ onboardingRepository });

/**
 * POST /api/onboarding/management - Perform management operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'cleanup':
        return await handleCleanup();

      case 'track-abandonment':
        return await handleTrackAbandonment(body);

      case 'get-active-count':
        return await handleGetActiveCount();

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: cleanup, track-abandonment, get-active-count' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in onboarding management:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle session cleanup operation
 */
async function handleCleanup() {
  const cleanupResult = await sessionUseCases.performCleanup({});

  if (!isSuccess(cleanupResult)) {
    return NextResponse.json(
      { error: cleanupResult.error.message },
      { status: 500 }
    );
  }

  const { expiredSessionsDeleted, abandonedSessionsMarked, errors } = cleanupResult.data;

  return NextResponse.json({
    success: true,
    expiredSessionsDeleted,
    abandonedSessionsMarked,
    errors: errors.map(e => e.message),
    totalCleaned: expiredSessionsDeleted + abandonedSessionsMarked,
  });
}

/**
 * Handle abandonment tracking
 */
async function handleTrackAbandonment(body: any) {
  const abandonmentThresholdMinutes = body.abandonmentThresholdMinutes || 30;

  if (typeof abandonmentThresholdMinutes !== 'number' || abandonmentThresholdMinutes < 1) {
    return NextResponse.json(
      { error: 'abandonmentThresholdMinutes must be a positive number' },
      { status: 400 }
    );
  }

  const trackingResult = await sessionUseCases.trackAbandonment({
    abandonmentThresholdMinutes,
  });

  if (!isSuccess(trackingResult)) {
    return NextResponse.json(
      { error: trackingResult.error.message },
      { status: 500 }
    );
  }

  const { totalAbandoned, sessionsMarkedAbandoned, errors } = trackingResult.data;

  return NextResponse.json({
    success: true,
    totalAbandoned,
    sessionsMarkedAbandoned: sessionsMarkedAbandoned.length,
    errors: errors.map(e => e.message),
    sessionIds: sessionsMarkedAbandoned.map(s => s.id),
  });
}

/**
 * Handle getting active session count
 */
async function handleGetActiveCount() {
  const countResult = await onboardingRepository.getActiveSessionCount();

  if (!isSuccess(countResult)) {
    return NextResponse.json(
      { error: countResult.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    activeSessionCount: countResult.data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /api/onboarding/management?status=... - Get sessions by status for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    if (!status) {
      return NextResponse.json(
        { error: 'status parameter is required' },
        { status: 400 }
      );
    }

    if (!['in-progress', 'paused', 'completed', 'abandoned'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: in-progress, paused, completed, abandoned' },
        { status: 400 }
      );
    }

    const sessionsResult = await onboardingRepository.findByStatus(status as any);

    if (!isSuccess(sessionsResult)) {
      return NextResponse.json(
        { error: sessionsResult.error.message },
        { status: 500 }
      );
    }

    const sessions = sessionsResult.data;

    // Return summary information (not full session data for privacy)
    const sessionSummaries = sessions.map(session => ({
      sessionId: session.id,
      userEmail: session.userEmail.getValue(),
      status: session.status,
      currentStep: session.currentStep,
      progress: Math.round((session.completedSteps.length / 6) * 100),
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
      completedAt: session.completedAt,
      conversionSource: session.analytics.conversionSource,
      deviceInfo: {
        country: session.analytics.deviceInfo?.country,
        userAgent: session.analytics.deviceInfo?.userAgent?.substring(0, 50) + '...',
      },
    }));

    return NextResponse.json({
      status,
      count: sessions.length,
      sessions: sessionSummaries,
    });

  } catch (error) {
    console.error('Error getting sessions by status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}