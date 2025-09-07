import * as Sentry from '@sentry/nextjs';

/**
 * Sentry Client Configuration
 * This file configures Sentry for the browser/client-side environment
 * Region: Germany (de.sentry.io) for GDPR compliance
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDevelopment = isDevelopment && !process.env.SENTRY_ENABLED;

// Only initialize Sentry if not in local development or explicitly enabled
if (!isLocalDevelopment && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Performance Monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  
  // Session Replay
  replaysSessionSampleRate: isProduction ? 0.01 : 0.1, // 1% in production, 10% in development
  replaysOnErrorSampleRate: 1.0, // Always record when there's an error
  
  // Integrations
  integrations: [
    // Browser Tracing for performance monitoring
    Sentry.browserTracingIntegration({
      // Track navigation changes in Next.js App Router
      enableInp: true, // Enable Interaction to Next Paint
      enableLongAnimationFrame: true, // Track long animation frames
    }),
    
    // Session Replay with GDPR privacy settings
    Sentry.replayIntegration({
      // Privacy settings for GDPR compliance
      maskAllText: isProduction, // Mask text in production
      blockAllMedia: isProduction, // Block media in production
      maskAllInputs: true, // Always mask input fields
      
      // Performance settings
      networkDetailAllowUrls: [
        'https://api.neptunik.com',
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ].filter(Boolean) as string[],
      
      // Sampling
      beforeSendRecording: (recording) => {
        // Additional privacy filtering if needed
        return recording;
      },
    }),
    
    // Capture console errors
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors in production
    if (isProduction) {
      // Skip localhost errors
      if (event.request?.url?.includes('localhost')) {
        return null;
      }
      
      // Skip known non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip network errors that are user-related
        const networkErrors = [
          'Network request failed',
          'Failed to fetch',
          'Load failed',
          'NetworkError',
          'AbortError',
        ];
        
        if (networkErrors.some(msg => error.message.includes(msg))) {
          // Log to console but don't send to Sentry
          console.warn('[Sentry] Filtered network error:', error.message);
          return null;
        }
        
        // Skip browser extension errors
        if (
          error.stack?.includes('extension://') ||
          error.stack?.includes('moz-extension://')
        ) {
          return null;
        }
        
        // Skip third-party script errors
        if (error.stack?.includes('gtag') || error.stack?.includes('analytics')) {
          return null;
        }
      }
      
      // Filter out non-error events in production
      if (!event.exception && !event.message) {
        return null;
      }
    }
    
    // Add user context if available
    if (typeof window !== 'undefined') {
      const user = getUserContext(); // Custom function to get user data
      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      }
    }
    
    return event;
  },
  
  // Breadcrumb filtering
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }
    
    // Enhance navigation breadcrumbs
    if (breadcrumb.category === 'navigation') {
      breadcrumb.data = {
        ...breadcrumb.data,
        timestamp: new Date().toISOString(),
      };
    }
    
    // Add more context to fetch breadcrumbs
    if (breadcrumb.category === 'fetch') {
      const url = breadcrumb.data?.url;
      if (url) {
        // Mark internal vs external API calls
        breadcrumb.data.api_type = url.includes(window.location.hostname) 
          ? 'internal' 
          : 'external';
      }
    }
    
    return breadcrumb;
  },
  
  // Transport options
  transportOptions: {
    // Use fetch keepalive for better reliability
    fetchOptions: {
      keepalive: true,
    },
  },
  
  // Debugging
  debug: isDevelopment,
  
  // Additional options
  ignoreErrors: [
    // Ignore specific error messages
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    // Next.js specific
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  // Allow URLs for tracing
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/neptunik\.com/,
    /^https:\/\/.*\.neptunik\.com/,
    /^https:\/\/.*\.supabase\.co/,
  ],
  
  // Session tracking
  autoSessionTracking: true,
  
  // Release health
  enableTracing: true,
  });
}

/**
 * Helper function to get user context
 * This should be customized based on your auth implementation
 */
function getUserContext() {
  // Check for Supabase user
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('supabase.auth.token');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return {
          id: parsed.user?.id,
          email: parsed.user?.email,
          username: parsed.user?.user_metadata?.username,
        };
      }
    } catch (error) {
      // Silent fail - user not logged in
    }
  }
  return null;
}

// Export for use in other parts of the application
export { Sentry };

// Required hook for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
