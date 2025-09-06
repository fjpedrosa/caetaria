'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Test page for Sentry integration
 * This page provides buttons to trigger different types of errors
 * and verify that they are properly captured by Sentry
 */
export default function TestSentryPage() {
  const [message, setMessage] = useState<string>('');

  // Test client-side error
  const triggerClientError = () => {
    try {
      throw new Error('Test client-side error from Neptunik');
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          type: 'test',
          source: 'client',
        },
        level: 'error',
      });
      setMessage('✅ Client error sent to Sentry');
    }
  };

  // Test client-side message
  const sendClientMessage = () => {
    Sentry.captureMessage('Test message from Neptunik client', {
      level: 'info',
      tags: {
        type: 'test',
        source: 'client',
      },
    });
    setMessage('✅ Client message sent to Sentry');
  };

  // Test unhandled error
  const triggerUnhandledError = () => {
    setMessage('💥 Triggering unhandled error in 2 seconds...');
    setTimeout(() => {
      // This will trigger the global error handler
      throw new Error('Test unhandled error from Neptunik');
    }, 2000);
  };

  // Test performance transaction
  const testPerformance = async () => {
    const transaction = Sentry.startSpan({
      name: 'test-performance',
      op: 'test',
    });

    try {
      setMessage('⏱️ Running performance test...');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      transaction.setStatus({ code: 1, message: 'ok' });
      setMessage('✅ Performance transaction sent to Sentry');
    } finally {
      transaction.end();
    }
  };

  // Test breadcrumbs
  const testBreadcrumbs = () => {
    // Add various breadcrumbs
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'User clicked test button',
      level: 'info',
    });

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'User navigated to test page',
      level: 'info',
    });

    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Test breadcrumb added',
      level: 'debug',
    });

    // Now trigger an error to see breadcrumbs
    try {
      throw new Error('Error with breadcrumbs context');
    } catch (error) {
      Sentry.captureException(error);
      setMessage('✅ Error with breadcrumbs sent to Sentry');
    }
  };

  // Test user context
  const setUserContext = () => {
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@neptunik.com',
      username: 'testuser',
    });
    setMessage('✅ User context set in Sentry');
  };

  // Test API error
  const testApiError = async () => {
    try {
      setMessage('🔄 Testing API error...');
      const response = await fetch('/api/test-error');
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          type: 'api-test',
          endpoint: '/api/test-error',
        },
      });
      setMessage('✅ API error sent to Sentry');
    }
  };

  // Check Sentry status
  const checkSentryStatus = () => {
    const client = Sentry.getClient();
    if (client) {
      const dsn = client.getDsn();
      setMessage(`✅ Sentry is initialized\nDSN: ${dsn?.host || 'unknown'}`);
    } else {
      setMessage('❌ Sentry client not found');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sentry Integration Test
          </h1>
          <p className="text-gray-600 mb-8">
            Use these buttons to test different Sentry features
          </p>

          {/* Test buttons grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={checkSentryStatus}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔍 Check Sentry Status
            </button>

            <button
              onClick={triggerClientError}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🐛 Trigger Client Error
            </button>

            <button
              onClick={sendClientMessage}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              💬 Send Client Message
            </button>

            <button
              onClick={triggerUnhandledError}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              💥 Trigger Unhandled Error
            </button>

            <button
              onClick={testPerformance}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ⏱️ Test Performance
            </button>

            <button
              onClick={testBreadcrumbs}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🍞 Test Breadcrumbs
            </button>

            <button
              onClick={setUserContext}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              👤 Set User Context
            </button>

            <button
              onClick={testApiError}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              🌐 Test API Error
            </button>
          </div>

          {/* Message display */}
          {message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {message}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Instructions:</h2>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Check Sentry Status" to verify Sentry is initialized</li>
              <li>Try different error types to test error capturing</li>
              <li>Check your Sentry dashboard at https://sentry.io</li>
              <li>View breadcrumbs and context in error details</li>
              <li>The unhandled error will crash this page (as expected)</li>
            </ol>
          </div>

          {/* Sentry Info */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Sentry Environment: {process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT}</p>
          </div>
        </div>
      </div>
    </div>
  );
}