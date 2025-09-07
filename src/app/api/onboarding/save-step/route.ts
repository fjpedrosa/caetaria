import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { step, data, flowId, userEmail } = body;

    // Try to get authenticated user, but don't require it
    const { data: { user } } = await supabase.auth.getUser();

    // Use authenticated user ID if available, otherwise use email as identifier
    const userId = user?.id || null;
    const email = user?.email || userEmail || `anon_${Date.now()}@temp.local`;

    if (!step || !data) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Check if user has an existing onboarding session
    // Use email for anonymous users or user_id for authenticated users
    let query = supabase
      .from('onboarding_sessions')
      .select('*');

    // If flowId is provided, use it, otherwise find any session for this user
    if (flowId) {
      query = query.eq('flow_id', flowId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('user_email', email);
    }

    const { data: existingSession } = await query.maybeSingle();

    if (existingSession) {
      // Update existing session
      const completedSteps = existingSession.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }

      const stepData = existingSession.step_data || {};
      stepData[step] = data;

      const analytics = existingSession.analytics || {};
      analytics[`${step}_completed_at`] = new Date().toISOString();
      analytics[`${step}_duration`] =
        analytics[`${step}_started_at`]
          ? Date.now() - new Date(analytics[`${step}_started_at`]).getTime()
          : 0;

      const { data: updatedSession, error: updateError } = await supabase
        .from('onboarding_sessions')
        .update({
          current_step: step,
          completed_steps: completedSteps,
          step_data: stepData,
          data: { ...existingSession.data, ...data },
          last_activity_at: new Date().toISOString(),
          analytics: analytics,
          status: 'in_progress'
        })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating onboarding session:', updateError);
        return NextResponse.json(
          { error: 'Error al guardar el progreso' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        sessionId: existingSession.id,
        data: updatedSession
      });
    } else {
      // Create new session
      const recoveryToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      // Use default flow ID if not provided
      const sessionFlowId = flowId || '32d175ce-547f-49c7-b574-29b1a79c7ad6'; // Standard Onboarding flow

      const { data: newSession, error: createError } = await supabase
        .from('onboarding_sessions')
        .insert({
          flow_id: sessionFlowId,
          user_id: userId, // Can be null for anonymous users
          user_email: email, // Always set, either from auth or anonymous
          current_step: step,
          completed_steps: [step],
          step_data: { [step]: data },
          data: data,
          status: 'in_progress',
          last_activity_at: new Date().toISOString(),
          recovery_token: recoveryToken,
          expires_at: expiresAt.toISOString(),
          analytics: {
            started_at: new Date().toISOString(),
            [`${step}_started_at`]: new Date().toISOString(),
            [`${step}_completed_at`]: new Date().toISOString()
          },
          metadata: {
            user_agent: request.headers.get('user-agent'),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating onboarding session:', createError);
        return NextResponse.json(
          { error: 'Error al iniciar el onboarding' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        sessionId: newSession.id,
        recoveryToken: recoveryToken,
        data: newSession
      });
    }
  } catch (error) {
    console.error('Onboarding save-step error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}