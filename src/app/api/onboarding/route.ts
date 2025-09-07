/**
 * Onboarding API Routes
 * Main onboarding session management endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/onboarding - Start new onboarding session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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

    // Use the Standard Onboarding flow ID
    const flowId = '32d175ce-547f-49c7-b574-29b1a79c7ad6'; // Standard Onboarding flow

    // Check if session already exists for this email
    const { data: existingSession, error: checkError } = await supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('user_email', body.userEmail)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Failed to check existing sessions:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing sessions' },
        { status: 500 }
      );
    }

    if (existingSession) {
      // Return existing session
      return NextResponse.json({
        sessionId: existingSession.id,
        currentStep: existingSession.current_step || 1,
        status: existingSession.status,
        progress: Math.round(((existingSession.completed_steps?.length || 0) / 5) * 100),
        recoveryToken: existingSession.recovery_token,
        expiresAt: existingSession.expires_at,
      }, { status: 200 });
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    const recoveryToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const { data: newSession, error: createError } = await supabase
      .from('onboarding_sessions')
      .insert({
        id: sessionId,
        flow_id: flowId,
        user_email: body.userEmail,
        current_step: 1,
        completed_steps: [],
        step_data: {},
        data: {},
        status: 'started',
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        recovery_token: recoveryToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          ...deviceInfo,
          conversionSource: body.conversionSource || 'direct',
          abTestVariants: body.abTestVariants || {},
        },
        analytics: {
          started_at: new Date().toISOString(),
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create onboarding session:', createError);
      return NextResponse.json(
        { error: 'Failed to create onboarding session' },
        { status: 500 }
      );
    }

    // Return session data with recovery token
    return NextResponse.json({
      sessionId: newSession.id,
      currentStep: newSession.current_step,
      status: newSession.status,
      progress: 0,
      recoveryToken: newSession.recovery_token,
      expiresAt: newSession.expires_at,
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
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const recoveryToken = searchParams.get('recoveryToken');

    if (!email && !recoveryToken) {
      return NextResponse.json(
        { error: 'email or recoveryToken is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('onboarding_sessions')
      .select('*');

    if (recoveryToken) {
      // Recover session using recovery token
      query = query
        .eq('recovery_token', recoveryToken)
        .gte('expires_at', new Date().toISOString());
    } else if (email) {
      // Find session by email (any flow_id)
      query = query
        .eq('user_email', email);
    }

    const { data: session, error } = await query.single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update last activity
    await supabase
      .from('onboarding_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);

    return NextResponse.json({
      sessionId: session.id,
      currentStep: session.current_step,
      status: session.status,
      progress: Math.round(((session.completed_steps?.length || 0) / 5) * 100),
      completedSteps: session.completed_steps || [],
      stepData: session.step_data || {},
      recoveryToken: session.recovery_token,
      expiresAt: session.expires_at,
    });

  } catch (error) {
    console.error('Error getting onboarding session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}