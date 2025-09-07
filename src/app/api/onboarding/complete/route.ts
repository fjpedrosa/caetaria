import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { sessionId, userEmail, flowId = '32d175ce-547f-49c7-b574-29b1a79c7ad6' } = body;

    // Try to get authenticated user, but don't require it
    const { data: { user } } = await supabase.auth.getUser();

    // Use authenticated user ID if available, otherwise use email as identifier
    const userId = user?.id || null;
    const email = user?.email || userEmail || `anon_${Date.now()}@temp.local`;

    if (!sessionId && !email) {
      return NextResponse.json(
        { error: 'Se requiere sessionId o email' },
        { status: 400 }
      );
    }

    // Find the session
    let query = supabase
      .from('onboarding_sessions')
      .select('*')
      .eq('flow_id', flowId);

    if (sessionId) {
      query = query.eq('id', sessionId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('user_email', email);
    }

    const { data: existingSession, error: findError } = await query.single();

    if (findError || !existingSession) {
      console.error('Session not found:', findError);
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Update session to completed
    const { data: updatedSession, error: updateError } = await supabase
      .from('onboarding_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        analytics: {
          ...existingSession.analytics,
          completed_at: new Date().toISOString(),
          total_duration: existingSession.analytics?.started_at
            ? Date.now() - new Date(existingSession.analytics.started_at).getTime()
            : 0
        }
      })
      .eq('id', existingSession.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error completing onboarding session:', updateError);
      return NextResponse.json(
        { error: 'Error al completar el onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: existingSession.id,
      data: updatedSession,
      betaAccess: true
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}