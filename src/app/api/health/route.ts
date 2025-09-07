import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Health Check API Route
 * GET /api/health
 *
 * This endpoint provides system health status and demonstrates
 * Sentry performance monitoring integration
 */
export async function GET(request: NextRequest) {
  // Start a Sentry transaction for performance monitoring
  return await Sentry.startSpan(
    {
      name: 'api.health.check',
      op: 'http.server',
      attributes: {
        'http.method': 'GET',
        'http.route': '/api/health',
      },
    },
    async (span) => {
      try {
        // Add breadcrumb for tracking
        Sentry.addBreadcrumb({
          category: 'api',
          message: 'Health check requested',
          level: 'info',
          data: {
            timestamp: new Date().toISOString(),
            user_agent: request.headers.get('user-agent'),
          },
        });

        // Simulate health checks
        const checks = await performHealthChecks();

        // Determine overall status
        const overallStatus = Object.values(checks).every(check => check.status === 'healthy')
          ? 'healthy'
          : Object.values(checks).some(check => check.status === 'unhealthy')
          ? 'unhealthy'
          : 'degraded';

        // Set span status based on health
        if (overallStatus === 'healthy') {
          span.setStatus({ code: 1, message: 'ok' });
        } else if (overallStatus === 'degraded') {
          span.setStatus({ code: 1, message: 'degraded' });

          // Log degraded status to Sentry
          Sentry.captureMessage('System health degraded', {
            level: 'warning',
            tags: {
              type: 'health-check',
              status: 'degraded',
            },
            extra: checks,
          });
        } else {
          span.setStatus({ code: 2, message: 'unhealthy' });

          // Log unhealthy status to Sentry
          Sentry.captureMessage('System health critical', {
            level: 'error',
            tags: {
              type: 'health-check',
              status: 'unhealthy',
            },
            extra: checks,
          });
        }

        // Return health status
        return NextResponse.json(
          {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV,
            checks,
          },
          {
            status: overallStatus === 'healthy' ? 200 : 503,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      } catch (error) {
        // Capture exception to Sentry
        Sentry.captureException(error, {
          tags: {
            api: 'health',
            type: 'health-check-error',
          },
        });

        // Return error response
        return NextResponse.json(
          {
            status: 'error',
            message: 'Failed to perform health check',
            error: process.env.NODE_ENV === 'development'
              ? (error as Error).message
              : 'Internal server error',
          },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * Perform various health checks
 */
async function performHealthChecks() {
  const checks: Record<string, any> = {};

  // Check Sentry connectivity
  checks.sentry = await checkSentry();

  // Check database (Supabase)
  checks.database = await checkDatabase();

  // Check memory usage
  checks.memory = checkMemory();

  // Check API response time
  checks.api = await checkApiLatency();

  return checks;
}

/**
 * Check Sentry connectivity
 */
async function checkSentry() {
  try {
    const client = Sentry.getClient();
    if (!client) {
      return {
        status: 'unhealthy',
        message: 'Sentry client not initialized',
      };
    }

    return {
      status: 'healthy',
      message: 'Sentry connected',
      dsn: client.getDsn()?.host || 'unknown',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Failed to check Sentry status',
      error: (error as Error).message,
    };
  }
}

/**
 * Check database connectivity (Supabase)
 */
async function checkDatabase() {
  try {
    // This is a placeholder - implement actual Supabase health check
    // For example, you could ping the Supabase API or run a simple query

    // Simulate database check
    const startTime = Date.now();

    // In production, replace with actual database ping
    // const { error } = await supabase.from('_health').select('1').single();

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
      message: 'Database responding',
      responseTime: `${responseTime}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      error: (error as Error).message,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory() {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);

  const heapPercentage = (used.heapUsed / used.heapTotal) * 100;

  return {
    status: heapPercentage < 70 ? 'healthy' : heapPercentage < 90 ? 'degraded' : 'unhealthy',
    message: 'Memory usage within limits',
    heapUsed: `${heapUsedMB} MB`,
    heapTotal: `${heapTotalMB} MB`,
    rss: `${rssMB} MB`,
    heapPercentage: `${heapPercentage.toFixed(2)}%`,
  };
}

/**
 * Check API latency
 */
async function checkApiLatency() {
  try {
    const startTime = Date.now();

    // Simulate API call - in production, call an actual internal endpoint
    await new Promise(resolve => setTimeout(resolve, 10));

    const latency = Date.now() - startTime;

    return {
      status: latency < 50 ? 'healthy' : latency < 200 ? 'degraded' : 'unhealthy',
      message: 'API responding normally',
      latency: `${latency}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'API latency check failed',
      error: (error as Error).message,
    };
  }
}