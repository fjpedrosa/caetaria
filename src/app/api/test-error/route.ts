import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Test Error API Route
 * GET /api/test-error
 * 
 * This endpoint intentionally throws an error to test Sentry integration
 */
export async function GET(request: NextRequest) {
  // Capture a test error to Sentry
  const testError = new Error('Test error from Neptunik API - Sentry is working!');
  
  // Add context to the error
  Sentry.withScope((scope) => {
    scope.setTag('test', true);
    scope.setTag('endpoint', '/api/test-error');
    scope.setLevel('error');
    scope.setContext('request', {
      url: request.url,
      method: 'GET',
      headers: Object.fromEntries(request.headers.entries()),
    });
    
    // Capture the error
    Sentry.captureException(testError);
  });

  // Also test a message
  Sentry.captureMessage('Test message from Neptunik API', {
    level: 'info',
    tags: {
      type: 'test',
      source: 'api',
    },
  });

  // Return error response
  return NextResponse.json(
    {
      error: 'Test error triggered',
      message: 'Error has been sent to Sentry',
      sentryDsn: process.env.SENTRY_DSN ? 'Configured' : 'Not configured',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * POST endpoint for testing different error types
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorType = 'standard' } = body;

    switch (errorType) {
      case 'database':
        // Simulate database error
        const dbError = new Error('Database connection failed');
        (dbError as any).code = 'ECONNREFUSED';
        (dbError as any).syscall = 'connect';
        throw dbError;

      case 'validation':
        // Simulate validation error
        const validationError = new Error('Invalid user input');
        (validationError as any).statusCode = 400;
        (validationError as any).validationErrors = {
          email: 'Invalid email format',
          password: 'Password too short',
        };
        throw validationError;

      case 'timeout':
        // Simulate timeout error
        const timeoutError = new Error('Request timeout');
        (timeoutError as any).code = 'ETIMEDOUT';
        throw timeoutError;

      case 'standard':
      default:
        // Standard error
        throw new Error('Standard test error from API');
    }
  } catch (error) {
    // Capture with additional context
    Sentry.captureException(error, {
      tags: {
        api: 'test-error',
        method: 'POST',
      },
      extra: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });

    return NextResponse.json(
      {
        error: 'Error captured',
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        sentryReported: true,
      },
      { status: 500 }
    );
  }
}