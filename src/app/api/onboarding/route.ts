/**
 * Onboarding API Routes
 * Main onboarding session management endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

import { createManageSessionUseCases } from '../../../modules/onboarding/application/use-cases/manage-session';
import { createStartOnboardingUseCase } from '../../../modules/onboarding/application/use-cases/start-onboarding';
import { SupabaseOnboardingRepository } from '../../../modules/onboarding/infrastructure/adapters/supabase-onboarding-repository';
import { isSuccess } from '../../../modules/shared/domain/value-objects/result';

// Initialize repository (in production, this would use dependency injection)
const onboardingRepository = new SupabaseOnboardingRepository();

/**
 * POST /api/onboarding - Start new onboarding session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    // Extract device info from request headers
    const deviceInfo = {
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
      country: request.headers.get('cf-ipcountry'),
      city: request.headers.get('cf-ipcity'),
    };

    // Create and execute use case
    const startOnboardingUseCase = createStartOnboardingUseCase({
      onboardingRepository,
    });

    const result = await startOnboardingUseCase.execute({
      userEmail: body.userEmail,
      conversionSource: body.conversionSource,
      deviceInfo,
      abTestVariants: body.abTestVariants,
    });

    if (!isSuccess(result)) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    const session = result.data;

    // Return session data with recovery token
    return NextResponse.json({
      sessionId: session.id,
      currentStep: session.currentStep,
      status: session.status,
      progress: Math.round((session.completedSteps.length / 6) * 100),
      recoveryToken: session.recoveryToken,
      expiresAt: session.expiresAt,
    }, { status: 201 });

  } catch (error) {
    console.error('Error starting onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding?email=user@example.com - Get onboarding session by email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const recoveryToken = searchParams.get('recoveryToken');

    if (!email && !recoveryToken) {
      return NextResponse.json(
        { error: 'email or recoveryToken is required' },
        { status: 400 }
      );
    }

    const sessionUseCases = createManageSessionUseCases({
      onboardingRepository,
    });

    let result;

    if (recoveryToken) {
      // Recover session using recovery token
      result = await sessionUseCases.recoverSession({ recoveryToken });

      if (isSuccess(result)) {
        const { session, wasExpired, wasExtended } = result.data;

        return NextResponse.json({
          sessionId: session.id,
          currentStep: session.currentStep,
          status: session.status,
          progress: Math.round((session.completedSteps.length / 6) * 100),
          completedSteps: session.completedSteps,
          stepData: session.stepData,
          recoveryToken: session.recoveryToken,
          expiresAt: session.expiresAt,
          wasExpired,
          wasExtended,
        });
      }
    } else if (email) {
      // Find session by email
      const emailObj = { getValue: () => email };
      result = await onboardingRepository.findByUserEmail(emailObj as any);

      if (isSuccess(result) && result.data) {
        const session = result.data;

        return NextResponse.json({
          sessionId: session.id,
          currentStep: session.currentStep,
          status: session.status,
          progress: Math.round((session.completedSteps.length / 6) * 100),
          completedSteps: session.completedSteps,
          stepData: session.stepData,
          recoveryToken: session.recoveryToken,
          expiresAt: session.expiresAt,
        });
      }
    }

    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error getting onboarding session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}