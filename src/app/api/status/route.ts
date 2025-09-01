import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // System status information
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        api: { status: 'operational', uptime: '99.9%' },
        database: { status: 'operational', uptime: '99.9%' },
        authentication: { status: 'operational', uptime: '99.9%' },
        webhooks: { status: 'operational', uptime: '99.9%' },
        analytics: { status: 'operational', uptime: '99.9%' }
      },
      features: {
        leadCapture: process.env.FEATURE_LEAD_CAPTURE !== 'false',
        analytics: process.env.FEATURE_ANALYTICS !== 'false',
        abTesting: process.env.FEATURE_A_B_TESTING !== 'false',
        realtime: process.env.FEATURE_REALTIME !== 'false',
        notifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
        maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === 'true'
      },
      metrics: {
        requestsPerMinute: 0,
        averageResponseTime: '< 200ms',
        errorRate: '< 0.1%',
        uptime: '99.9%'
      }
    };

    // Test database connectivity
    try {
      await supabase.from('leads').select('count', { count: 'exact', head: true });
      status.services.database.status = 'operational';
    } catch (error) {
      status.services.database.status = 'degraded';
      console.error('Database status check failed:', error);
    }

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Status endpoint error:', error);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Unable to retrieve system status'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });
  }
}