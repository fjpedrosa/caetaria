import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';

// Sentry configuration for production monitoring
const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,

    // Performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay for debugging
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enhanced error tracking
    beforeSend(event, hint) {
      // Filter out development errors in production
      if (SENTRY_ENVIRONMENT === 'production') {
        // Skip localhost errors
        if (event.request?.url?.includes('localhost')) {
          return null;
        }

        // Skip known non-critical errors
        const error = hint.originalException;
        if (error instanceof Error) {
          // Skip network errors that are user-related
          if (error.message.includes('Network request failed') ||
              error.message.includes('Failed to fetch') ||
              error.message.includes('Load failed')) {
            return null;
          }

          // Skip browser extension errors
          if (error.stack?.includes('extension://') ||
              error.stack?.includes('moz-extension://')) {
            return null;
          }
        }
      }

      return event;
    },

    // Enhanced context
    beforeBreadcrumb(breadcrumb, hint) {
      // Enhanced logging for API calls
      if (breadcrumb.category === 'fetch') {
        breadcrumb.data = {
          ...breadcrumb.data,
          timestamp: new Date().toISOString(),
        };
      }

      return breadcrumb;
    },

    // Integration configuration
    integrations: [
      new BrowserTracing({
        // Enhanced route tracking
        routingInstrumentation: Sentry.routingInstrumentation,

        // Track Core Web Vitals
        enableLongAnimationFrame: true,
        enableInp: true,

        // Custom transaction names
        beforeNavigate: (context) => ({
          ...context,
          name: `${context.location.pathname}${context.location.search}`,
        }),
      }),

      // Session replay for debugging
      new Sentry.Replay({
        maskAllText: SENTRY_ENVIRONMENT === 'production',
        blockAllMedia: SENTRY_ENVIRONMENT === 'production',
        maskAllInputs: true,
      }),
    ],

    // Tag all events with deployment info
    initialScope: {
      tags: {
        component: 'frontend',
        deployment: process.env.VERCEL_ENV || 'unknown',
        region: process.env.VERCEL_REGION || 'unknown',
      },
    },
  });

  // Set user context if available
  if (typeof window !== 'undefined') {
    // Get user info from local storage or other source
    try {
      const userContext = {
        id: 'anonymous',
        ip_address: '{{auto}}',
      };

      Sentry.setUser(userContext);
    } catch (error) {
      console.warn('Failed to set Sentry user context:', error);
    }
  }
}

// Custom error reporting functions
export const captureException = (error: Error, context?: Record<string, any>) => {
  return Sentry.captureException(error, {
    tags: {
      component: 'application',
      ...context?.tags,
    },
    extra: context?.extra || {},
    level: 'error',
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  return Sentry.captureMessage(message, {
    level,
    tags: {
      component: 'application',
      ...context?.tags,
    },
    extra: context?.extra || {},
  });
};

// Business metric tracking
export const trackBusinessEvent = (eventName: string, data: Record<string, any> = {}) => {
  Sentry.addBreadcrumb({
    category: 'business',
    message: eventName,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
    level: 'info',
  });

  // Also send as custom event
  Sentry.captureMessage(`Business Event: ${eventName}`, {
    level: 'info',
    tags: {
      event_type: 'business',
      event_name: eventName,
    },
    extra: data,
  });
};

// Performance monitoring helpers
export const measurePerformance = <T>(name: string, fn: () => T | Promise<T>): T | Promise<T> => {
  const transaction = Sentry.startTransaction({
    name,
    op: 'custom',
  });

  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((res) => {
          transaction.setStatus('ok');
          return res;
        })
        .catch((error) => {
          transaction.setStatus('internal_error');
          throw error;
        })
        .finally(() => {
          transaction.finish();
        });
    } else {
      transaction.setStatus('ok');
      transaction.finish();
      return result;
    }
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    throw error;
  }
};

// Database query monitoring
export const trackDatabaseQuery = (query: string, duration: number, success: boolean) => {
  Sentry.addBreadcrumb({
    category: 'database',
    message: 'Database Query',
    data: {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration_ms: duration,
      success,
    },
    level: success ? 'info' : 'error',
  });

  if (duration > 1000) { // Log slow queries
    Sentry.captureMessage('Slow Database Query', {
      level: 'warning',
      tags: {
        component: 'database',
        query_type: 'slow',
      },
      extra: {
        query,
        duration_ms: duration,
      },
    });
  }
};

// API endpoint monitoring
export const trackApiCall = (endpoint: string, method: string, statusCode: number, duration: number) => {
  const success = statusCode < 400;

  Sentry.addBreadcrumb({
    category: 'http',
    message: `${method} ${endpoint}`,
    data: {
      url: endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
    },
    level: success ? 'info' : 'error',
  });

  if (!success) {
    Sentry.captureMessage(`API Error: ${method} ${endpoint}`, {
      level: statusCode >= 500 ? 'error' : 'warning',
      tags: {
        component: 'api',
        endpoint,
        method,
        status_code: statusCode.toString(),
      },
      extra: {
        duration_ms: duration,
      },
    });
  }
};

// User action tracking
export const trackUserAction = (action: string, data: Record<string, any> = {}) => {
  Sentry.addBreadcrumb({
    category: 'user',
    message: action,
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
    level: 'info',
  });
};

// Feature flag tracking
export const trackFeatureFlag = (flagName: string, value: boolean, context: Record<string, any> = {}) => {
  Sentry.setTag(`feature.${flagName}`, value.toString());

  Sentry.addBreadcrumb({
    category: 'feature',
    message: `Feature Flag: ${flagName}`,
    data: {
      flag_name: flagName,
      flag_value: value,
      ...context,
    },
    level: 'info',
  });
};

// Environment health check
export const reportHealthCheck = (component: string, status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, any>) => {
  const level = status === 'healthy' ? 'info' : status === 'degraded' ? 'warning' : 'error';

  Sentry.captureMessage(`Health Check: ${component}`, {
    level,
    tags: {
      component: 'health',
      service: component,
      status,
    },
    extra: details || {},
  });
};

export { Sentry };