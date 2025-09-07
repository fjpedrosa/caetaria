import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Try to get authenticated user, but don't require it
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get('flowId') || 'default';
    const recoveryToken = searchParams.get('recoveryToken');
    const userEmail = searchParams.get('email');

    let query = supabase
      .from('onboarding_sessions')
      .select('*');

    if (recoveryToken) {
      // Recovery by token
      query = query
        .eq('recovery_token', recoveryToken)
        .gte('expires_at', new Date().toISOString());
    } else if (user?.id) {
      // Get authenticated user's session
      query = query
        .eq('user_id', user.id)
        .eq('flow_id', flowId);
    } else if (userEmail) {
      // Get anonymous user's session by email
      query = query
        .eq('user_email', userEmail)
        .eq('flow_id', flowId);
    } else {
      // No identifier provided
      return NextResponse.json(
        { error: 'No se proporcionó identificador de sesión' },
        { status: 400 }
      );
    }

    const { data: session, error } = await query.single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Update last activity
    await supabase
      .from('onboarding_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id);

    return NextResponse.json({
      success: true,
      session: session
    });
  } catch (error) {
    console.error('Onboarding get-session error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}