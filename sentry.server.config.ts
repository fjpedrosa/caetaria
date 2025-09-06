import * as Sentry from '@sentry/nextjs';

// Try to import profiling integration (optional)
let ProfilingIntegration: any;
try {
  const profilingModule = require('@sentry/profiling-node');
  ProfilingIntegration = profilingModule.ProfilingIntegration;
} catch (e) {
  // Profiling not available, continue without it
  console.info('[Sentry] Profiling not available. Install @sentry/profiling-node for profiling support.');
}

/**
 * Sentry Server Configuration
 * This file configures Sentry for the Node.js server-side environment
 * Includes database query tracking, API monitoring, and optional profiling
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDevelopment = isDevelopment && !process.env.SENTRY_ENABLED;

// Only initialize Sentry if not in local development or explicitly enabled
if (!isLocalDevelopment && SENTRY_DSN) {
  // Build integrations array
  const integrations = [
  // HTTP integration for request/response tracking
  Sentry.httpIntegration({
    tracing: true,
    breadcrumbs: true,
  }),
  
  // Prisma/Database integration (if using Prisma)
  Sentry.prismaIntegration(),
  
  // Node specific integrations
  Sentry.nodeContextIntegration(),
  
  // Capture console messages
  Sentry.captureConsoleIntegration({
    levels: ['error', 'warn'],
  }),
  
  // Local variables in stack traces
  Sentry.localVariablesIntegration({
    captureAllExceptions: true,
  }),
];

// Add profiling if available
if (ProfilingIntegration) {
  integrations.push(new ProfilingIntegration());
}

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Performance Monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  
  // Profiling (only if ProfilingIntegration is available)
  profilesSampleRate: ProfilingIntegration ? (isProduction ? 0.1 : 1.0) : 0,
  
  // Server-specific integrations
  integrations,
  
  // Error filtering
  beforeSend(event, hint) {
    // Add server context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'node',
        version: process.version,
      },
      server: {
        region: process.env.VERCEL_REGION || 'unknown',
        environment: process.env.VERCEL_ENV || 'unknown',
      },
    };
    
    // Filter out non-critical errors in production
    if (isProduction) {
      const error = hint.originalException;
      
      // Skip expected API errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        // Don't report client errors (4xx) except 500
        if (statusCode >= 400 && statusCode < 500) {
          return null;
        }
      }
      
      // Skip health check endpoints
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Breadcrumb configuration
  beforeBreadcrumb(breadcrumb, hint) {
    // Enhance database breadcrumbs
    if (breadcrumb.category === 'db') {
      // Add query execution time if available
      if (hint?.event?.duration) {
        breadcrumb.data = {
          ...breadcrumb.data,
          duration_ms: hint.event.duration,
        };
      }
      
      // Mark slow queries
      const duration = breadcrumb.data?.duration_ms;
      if (duration && duration > 1000) {
        breadcrumb.level = 'warning';
        breadcrumb.data.slow_query = true;
      }
    }
    
    // Enhance HTTP breadcrumbs
    if (breadcrumb.category === 'http') {
      const statusCode = breadcrumb.data?.status_code;
      if (statusCode && statusCode >= 500) {
        breadcrumb.level = 'error';
      } else if (statusCode && statusCode >= 400) {
        breadcrumb.level = 'warning';
      }
    }
    
    return breadcrumb;
  },
  
  // Debugging
  debug: isDevelopment,
  
  // Server-specific options
  serverName: process.env.VERCEL_URL || 'neptunik-server',
  
  // Additional error filtering
  ignoreErrors: [
    // Ignore specific error messages
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EPIPE',
    // Next.js specific
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  // Transaction naming
  beforeSendTransaction(transaction) {
    // Clean up transaction names for better grouping
    if (transaction.transaction) {
      // Remove dynamic segments from API routes
      transaction.transaction = transaction.transaction
        .replace(/\/api\/[a-zA-Z0-9-_]+\/\[[\w]+\]/g, '/api/$1/[id]')
        .replace(/\?.*$/, ''); // Remove query params
    }
    
    // Add custom tags for filtering
    transaction.tags = {
      ...transaction.tags,
      runtime: 'nodejs',
      framework: 'nextjs',
    };
    
    return transaction;
  },
  
  // Spotlight for local development (optional)
  spotlight: isDevelopment ? {
    sidecarUrl: 'http://localhost:8969/stream',
  } : undefined,
  });
}

/**
 * Custom instrumentation for Supabase queries
 */
export function instrumentSupabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name: `supabase.${queryName}`,
      op: 'db.query',
      attributes: {
        'db.system': 'postgresql',
        'db.name': 'supabase',
      },
    },
    async (span) => {
      try {
        const result = await queryFn();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: 'error' });
        throw error;
      }
    }
  );
}

/**
 * Custom instrumentation for API routes
 */
export function withSentryAPI<T extends (...args: any[]) => any>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      {
        name: routeName,
        op: 'http.server',
        attributes: {
          'http.method': (args[0] as any)?.method || 'GET',
          'http.route': routeName,
        },
      },
      async () => {
        try {
          return await handler(...args);
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      }
    );
  }) as T;
}

// Export for use in API routes
export { Sentry };