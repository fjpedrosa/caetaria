/**
 * Session Recovery API Routes
 * Endpoints for recovering interrupted onboarding sessions
 */

import { NextRequest, NextResponse } from 'next/server';

import { createManageSessionUseCases } from '../../../../modules/onboarding/application/use-cases/manage-session';
import { SupabaseOnboardingRepository } from '../../../../modules/onboarding/infra/adapters/supabase-onboarding-repository';
import { isSuccess } from '../../../../modules/shared/domain/value-objects/result';

// Initialize repository
const onboardingRepository = new SupabaseOnboardingRepository();
const sessionUseCases = createManageSessionUseCases({ onboardingRepository });

/**
 * POST /api/onboarding/recover - Recover session using recovery token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.recoveryToken) {
      return NextResponse.json(
        { error: 'recoveryToken is required' },
        { status: 400 }
      );
    }

    const recoveryResult = await sessionUseCases.recoverSession({
      recoveryToken: body.recoveryToken,
    });

    if (!isSuccess(recoveryResult)) {
      return NextResponse.json(
        { error: recoveryResult.error.message },
        { status: 404 }
      );
    }

    const { session, wasExpired, wasExtended } = recoveryResult.data;

    return NextResponse.json({
      sessionId: session.id,
      currentStep: session.currentStep,
      status: session.status,
      progress: Math.round((session.completedSteps.length / 6) * 100),
      completedSteps: session.completedSteps,
      stepData: session.stepData,
      recoveryToken: session.recoveryToken,
      expiresAt: session.expiresAt,
      recovery: {
        wasExpired,
        wasExtended,
        recoveredAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error recovering session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/recover?email=user@example.com - Generate recovery link
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'email parameter is required' },
        { status: 400 }
      );
    }

    // Find active session by email
    const emailObj = { getValue: () => email };
    const sessionResult = await onboardingRepository.findByUserEmail(emailObj as any);

    if (!isSuccess(sessionResult) || !sessionResult.data) {
      return NextResponse.json(
        { error: 'No active session found for this email' },
        { status: 404 }
      );
    }

    const session = sessionResult.data;

    // Only allow recovery for in-progress or paused sessions
    if (!['in-progress', 'paused'].includes(session.status)) {
      return NextResponse.json(
        { error: 'Session cannot be recovered (status: ' + session.status + ')' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      recoveryToken: session.recoveryToken,
      currentStep: session.currentStep,
      status: session.status,
      progress: Math.round((session.completedSteps.length / 6) * 100),
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
      canRecover: true,
    });

  } catch (error) {
    console.error('Error generating recovery link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}