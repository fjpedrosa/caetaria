import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Edge Configuration
 * This file configures Sentry for the Edge Runtime environment
 * Used for middleware and edge API routes
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDevelopment = isDevelopment && !process.env.SENTRY_ENABLED;

// Only initialize Sentry if not in local development or explicitly enabled
if (!isLocalDevelopment && SENTRY_DSN) {
  Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Performance Monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  
  // Edge-specific integrations
  integrations: [
    // HTTP integration for edge functions
    Sentry.winterCGFetchIntegration({
      breadcrumbs: true,
      tracing: true,
    }),
  ],
  
  // Error filtering for edge runtime
  beforeSend(event, hint) {
    // Add edge context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'edge',
        // Edge runtime doesn't have process.version
      },
      edge: {
        region: process.env.VERCEL_REGION || 'unknown',
        environment: process.env.VERCEL_ENV || 'unknown',
      },
    };
    
    // Filter out non-critical errors
    if (isProduction) {
      // Skip health check endpoints
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
      
      // Skip expected middleware redirects
      if (event.tags?.middleware === 'redirect') {
        return null;
      }
    }
    
    return event;
  },
  
  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb, hint) {
    // Enhance fetch breadcrumbs in edge runtime
    if (breadcrumb.category === 'fetch') {
      const url = breadcrumb.data?.url;
      if (url) {
        // Identify API type
        if (url.includes('supabase')) {
          breadcrumb.data.service = 'supabase';
        } else if (url.includes('vercel')) {
          breadcrumb.data.service = 'vercel';
        }
        
        // Mark slow requests
        const duration = breadcrumb.data?.duration;
        if (duration && duration > 3000) {
          breadcrumb.level = 'warning';
          breadcrumb.data.slow_request = true;
        }
      }
    }
    
    return breadcrumb;
  },
  
  // Debugging
  debug: isDevelopment,
  
  // Edge-specific options
  transportOptions: {
    // Edge runtime specific transport options
    fetchOptions: {
      keepalive: true,
    },
  },
  
  // Additional error filtering
  ignoreErrors: [
    // Edge runtime specific errors to ignore
    'ECONNRESET',
    'ECONNREFUSED',
    'Request aborted',
    // Next.js specific
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  // Transaction configuration for edge runtime
  beforeSendTransaction(transaction) {
    // Clean up transaction names
    if (transaction.transaction) {
      // Identify middleware transactions
      if (transaction.transaction.includes('middleware')) {
        transaction.tags = {
          ...transaction.tags,
          runtime: 'edge',
          type: 'middleware',
        };
      }
      
      // Clean dynamic segments
      transaction.transaction = transaction.transaction
        .replace(/\/[a-f0-9-]{36}/g, '/[uuid]') // Replace UUIDs
        .replace(/\/\d+/g, '/[id]') // Replace numeric IDs
        .replace(/\?.*$/, ''); // Remove query params
    }
    
    return transaction;
  },
  });
}

/**
 * Middleware-specific error handling
 */
export function withSentryMiddleware<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      {
        name: 'middleware',
        op: 'middleware',
        attributes: {
          'middleware.type': 'auth', // or other type
        },
      },
      async () => {
        try {
          return await handler(...args);
        } catch (error) {
          // Log middleware errors with context
          Sentry.captureException(error, {
            tags: {
              runtime: 'edge',
              type: 'middleware',
            },
          });
          throw error;
        }
      }
    );
  }) as T;
}

/**
 * Edge API route instrumentation
 */
export function withSentryEdgeAPI<T extends (...args: any[]) => any>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    return await Sentry.startSpan(
      {
        name: routeName,
        op: 'http.server.edge',
        attributes: {
          'http.method': (args[0] as any)?.method || 'GET',
          'http.route': routeName,
          'runtime': 'edge',
        },
      },
      async () => {
        try {
          return await handler(...args);
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              runtime: 'edge',
              route: routeName,
            },
          });
          throw error;
        }
      }
    );
  }) as T;
}

// Export for use in edge functions
export { Sentry };