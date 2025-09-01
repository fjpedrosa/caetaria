import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Gather system metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          arrayBuffers: Math.round(process.memoryUsage().arrayBuffers / 1024 / 1024)
        },
        uptime: Math.round(process.uptime()),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      database: {
        status: 'unknown',
        connections: 0,
        responseTime: 0
      },
      application: {
        requests: {
          total: 0,
          successful: 0,
          errors: 0,
          rate: 0
        },
        leads: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        }
      }
    };

    // Database metrics
    try {
      const dbStart = Date.now();

      // Get lead statistics
      const { data: leadStats, error: leadError } = await supabase
        .rpc('get_lead_statistics');

      if (!leadError && leadStats) {
        metrics.application.leads = {
          total: leadStats.total || 0,
          today: leadStats.today || 0,
          thisWeek: leadStats.this_week || 0,
          thisMonth: leadStats.this_month || 0
        };
      }

      const dbResponseTime = Date.now() - dbStart;
      metrics.database = {
        status: 'healthy',
        connections: 1, // We don't have access to connection pool info
        responseTime: dbResponseTime
      };

    } catch (dbError) {
      metrics.database.status = 'error';
      console.error('Database metrics error:', dbError);
    }

    // Only expose metrics in development or with proper authentication
    if (process.env.NODE_ENV === 'production') {
      // In production, require authentication or API key
      const authHeader = request.headers.get('authorization');
      const apiKey = request.headers.get('x-api-key');

      if (!authHeader && !apiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Metrics endpoint error:', error);

    return NextResponse.json({
      error: 'Unable to retrieve metrics',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });
  }
}