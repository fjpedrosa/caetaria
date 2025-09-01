/**
 * Onboarding Analytics API Routes
 * Endpoints for session analytics and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

import { createManageSessionUseCases } from '../../../../modules/onboarding/application/use-cases/manage-session';
import { SupabaseOnboardingRepository } from '../../../../modules/onboarding/infra/adapters/supabase-onboarding-repository';
import { isSuccess } from '../../../../modules/shared/domain/value-objects/result';

// Initialize repository
const onboardingRepository = new SupabaseOnboardingRepository();
const sessionUseCases = createManageSessionUseCases({ onboardingRepository });

/**
 * GET /api/onboarding/analytics - Get comprehensive onboarding analytics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const conversionSource = searchParams.get('conversionSource') || undefined;

    // Validate and parse dates
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startDate format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
    }

    if (endDateParam) {
      endDate = new Date(endDateParam);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endDate format. Use ISO 8601 format.' },
          { status: 400 }
        );
      }
    }

    // Get analytics data
    const analyticsResult = await sessionUseCases.getSessionAnalytics({
      startDate,
      endDate,
      conversionSource,
    });

    if (!isSuccess(analyticsResult)) {
      return NextResponse.json(
        { error: analyticsResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(analyticsResult.data);

  } catch (error) {
    console.error('Error getting onboarding analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}