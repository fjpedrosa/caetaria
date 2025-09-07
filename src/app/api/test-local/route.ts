import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use local Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing service role key' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test database connection
    const tests = {
      connection: false,
      tables: {
        leads: 0,
        onboarding_flows: 0,
        analytics_events: 0,
        experiments: 0
      },
      write_test: false
    };

    // Test 1: Count leads
    const { count: leadsCount, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (!leadsError && leadsCount !== null) {
      tests.tables.leads = leadsCount;
      tests.connection = true;
    }

    // Test 2: Count onboarding flows
    const { count: flowsCount } = await supabase
      .from('onboarding_flows')
      .select('*', { count: 'exact', head: true });

    if (flowsCount !== null) {
      tests.tables.onboarding_flows = flowsCount;
    }

    // Test 3: Count analytics events
    const { count: eventsCount } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true });

    if (eventsCount !== null) {
      tests.tables.analytics_events = eventsCount;
    }

    // Test 4: Count experiments
    const { count: experimentsCount } = await supabase
      .from('experiments')
      .select('*', { count: 'exact', head: true });

    if (experimentsCount !== null) {
      tests.tables.experiments = experimentsCount;
    }

    // Test 5: Write test
    const testEmail = `api-test-${Date.now()}@example.com`;
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        email: testEmail,
        business_name: 'API Test Business',
        business_type: 'test',
        status: 'test'
      })
      .select()
      .single();

    if (!insertError && newLead) {
      // Clean up
      await supabase
        .from('leads')
        .delete()
        .eq('id', newLead.id);

      tests.write_test = true;
    }

    // Return results
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV || 'development',
      supabase_url: supabaseUrl,
      tests,
      message: tests.connection
        ? '✅ Local Supabase is working correctly!'
        : '❌ Connection issues detected'
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}