import * as Sentry from '@sentry/nextjs';

/**
 * Next.js 15 Instrumentation
 * This file is automatically loaded by Next.js to initialize monitoring and instrumentation
 * It replaces the need for direct imports of sentry config files
 */

/**
 * Register function called by Next.js during initialization
 * Loads the appropriate Sentry configuration based on runtime
 */
export async function register() {
  // Check if Sentry DSN is configured
  const sentryDSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDSN) {
    console.warn(
      '[Sentry] DSN not configured. Skipping Sentry initialization.',
      'Set SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN in your environment variables.'
    );
    return;
  }

  // Initialize based on runtime environment
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server/Node.js runtime
    await import('./sentry.server.config');
    console.info('[Sentry] Initialized for Node.js runtime');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime (middleware, edge API routes)
    await import('./sentry.edge.config');
    console.info('[Sentry] Initialized for Edge runtime');
  }

  // Note: Client-side initialization happens automatically
  // through Next.js's client-side bundle
}

/**
 * Error handler for request errors (new in Next.js 15)
 * This captures errors that occur during request handling
 */
export const onRequestError = Sentry.captureRequestError;

/**
 * Custom instrumentation for Web Vitals
 * Reports Core Web Vitals to Sentry for performance monitoring
 */
export function reportWebVitals(metric: any) {
  // Send Web Vitals to Sentry
  if (metric.label === 'web-vital') {
    Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: 'info',
      tags: {
        'web-vital': metric.name,
      },
      extra: {
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
      },
    });

    // Track as custom metric for dashboards
    const client = Sentry.getClient();
    if (client) {
      const measurement = `web_vital_${metric.name.toLowerCase()}`;
      Sentry.setMeasurement(measurement, metric.value, 'millisecond');
    }
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', metric.name, ':', metric.value, metric.rating);
  }
}

/**
 * Initialize custom performance monitoring
 */
if (typeof window !== 'undefined') {
  // Client-side only: Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      // Monitor long tasks (>50ms)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // Report long tasks to Sentry
            Sentry.addBreadcrumb({
              category: 'performance',
              message: 'Long Task Detected',
              level: 'warning',
              data: {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              },
            });

            // Capture as message if task is very long (>200ms)
            if (entry.duration > 200) {
              Sentry.captureMessage(`Long Task: ${entry.duration}ms`, {
                level: 'warning',
                tags: {
                  performance: 'long-task',
                },
                extra: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                },
              });
            }
          }
        }
      });

      // Start observing long tasks
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('[Sentry] Failed to set up long task monitoring:', error);
    }
  }

  // Monitor memory usage (if available)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedJSHeapSize = memory.usedJSHeapSize;
      const totalJSHeapSize = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;

      const percentUsed = (usedJSHeapSize / limit) * 100;

      // Warn if memory usage is high
      if (percentUsed > 90) {
        Sentry.captureMessage('High Memory Usage Detected', {
          level: 'warning',
          tags: {
            performance: 'memory',
          },
          extra: {
            usedJSHeapSize,
            totalJSHeapSize,
            jsHeapSizeLimit: limit,
            percentUsed,
          },
        });
      }
    }, 60000); // Check every minute
  }
}

/**
 * Export Sentry for use in other parts of the application
 */
export { Sentry };