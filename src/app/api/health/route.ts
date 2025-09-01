import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health status
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        api: { status: 'ok', responseTime: 0 },
      }
    };

    // Database health check
    try {
      const dbStartTime = Date.now();
      const supabase = createClient();

      // Simple query to test database connectivity
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .limit(1)
        .single();

      const dbResponseTime = Date.now() - dbStartTime;

      health.checks.database = {
        status: error ? 'error' : 'ok',
        responseTime: dbResponseTime,
        error: error?.message
      };
    } catch (dbError) {
      health.checks.database = {
        status: 'error',
        responseTime: 0,
        error: dbError instanceof Error ? dbError.message : 'Database connection failed'
      };
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;
    health.checks.api.responseTime = totalResponseTime;

    // Determine overall status
    const overallStatus = Object.values(health.checks).every(check => check.status === 'ok')
      ? 'ok'
      : 'degraded';

    health.status = overallStatus;

    return NextResponse.json(health, {
      status: overallStatus === 'ok' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}