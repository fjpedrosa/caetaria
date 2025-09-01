/**
 * Individual Session Management API Routes
 * Endpoints for managing specific onboarding sessions
 */

import { NextRequest, NextResponse } from 'next/server';

import { createManageSessionUseCases } from '../../../../../modules/onboarding/application/use-cases/manage-session';
import { SupabaseOnboardingRepository } from '../../../../../modules/onboarding/infra/adapters/supabase-onboarding-repository';
import { isSuccess } from '../../../../../modules/shared/domain/value-objects/result';

// Initialize repository
const onboardingRepository = new SupabaseOnboardingRepository();
const sessionUseCases = createManageSessionUseCases({ onboardingRepository });

interface RouteParams {
  params: {
    sessionId: string;
  };
}

/**
 * GET /api/onboarding/sessions/[sessionId] - Get session details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;

    const result = await sessionUseCases.getSessionSummary(sessionId as any);

    if (!isSuccess(result)) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('Error getting session details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/sessions/[sessionId] - Update session
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;
    const body = await request.json();

    // Extract device info for synchronization
    const deviceInfo = {
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
      country: request.headers.get('cf-ipcountry'),
      city: request.headers.get('cf-ipcity'),
    };

    // Handle synchronization request
    if (body.action === 'sync') {
      const syncResult = await sessionUseCases.synchronizeSession({
        sessionId: sessionId as any,
        clientVersion: body.clientVersion || 1,
        deviceInfo,
      });

      if (!isSuccess(syncResult)) {
        return NextResponse.json(
          { error: syncResult.error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        synchronized: syncResult.data.synchronized,
        conflicts: syncResult.data.conflicts,
        resolved: syncResult.data.resolved,
      });
    }

    // Handle pause request
    if (body.action === 'pause') {
      const pauseResult = await sessionUseCases.pauseSession({
        sessionId: sessionId as any,
        reason: body.reason,
      });

      if (!isSuccess(pauseResult)) {
        return NextResponse.json(
          { error: pauseResult.error.message },
          { status: 400 }
        );
      }

      const session = pauseResult.data;
      return NextResponse.json({
        sessionId: session.id,
        status: session.status,
        currentStep: session.currentStep,
        lastActivityAt: session.lastActivityAt,
      });
    }

    // Handle resume request
    if (body.action === 'resume') {
      const resumeResult = await sessionUseCases.resumeSession({
        sessionId: sessionId as any,
      });

      if (!isSuccess(resumeResult)) {
        return NextResponse.json(
          { error: resumeResult.error.message },
          { status: 400 }
        );
      }

      const session = resumeResult.data;
      return NextResponse.json({
        sessionId: session.id,
        status: session.status,
        currentStep: session.currentStep,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
      });
    }

    // Handle A/B test variant update
    if (body.action === 'abtest') {
      if (!body.testName || !body.variant) {
        return NextResponse.json(
          { error: 'testName and variant are required for abtest action' },
          { status: 400 }
        );
      }

      const abtestResult = await sessionUseCases.updateAbTestVariant({
        sessionId: sessionId as any,
        testName: body.testName,
        variant: body.variant,
      });

      if (!isSuccess(abtestResult)) {
        return NextResponse.json(
          { error: abtestResult.error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        sessionId: abtestResult.data.id,
        abTestVariants: abtestResult.data.analytics.abTestVariants,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: sync, pause, resume, abtest' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/onboarding/sessions/[sessionId] - Delete session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;

    const result = await onboardingRepository.delete(sessionId as any);

    if (!isSuccess(result)) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ deleted: true });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}