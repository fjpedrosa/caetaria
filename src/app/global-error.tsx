'use client';

import { useEffect } from 'react';
import NextError from 'next/error';
import * as Sentry from '@sentry/nextjs';

/**
 * Global Error Boundary for Next.js App Router
 * This component catches all unhandled errors in the application
 * and reports them to Sentry while showing a user-friendly error page
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        type: 'global-error-boundary',
        digest: error.digest,
      },
      level: 'error',
    });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Global Error]:', error);
    }
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-xl w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                ¡Ups! Algo salió mal
              </h1>

              <p className="text-gray-600 text-center mb-6">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado
                y estamos trabajando para solucionarlo.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm font-mono text-gray-700 mb-2">
                    <strong>Error:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500">
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Intentar de nuevo
                </button>

                <button
                  onClick={() => {
                    // Track user feedback
                    Sentry.captureMessage('User requested homepage from error', {
                      level: 'info',
                      tags: {
                        action: 'error-recovery',
                        from: 'global-error',
                      },
                    });
                    window.location.href = '/';
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Ir al inicio
                </button>
              </div>

              {/* Support Link */}
              <div className="mt-6 text-center">
                <a
                  href="mailto:soporte@neptunik.com"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  onClick={() => {
                    // Track support request
                    Sentry.captureMessage('User clicked support from error', {
                      level: 'info',
                      tags: {
                        action: 'support-request',
                        from: 'global-error',
                        error_digest: error.digest,
                      },
                    });
                  }}
                >
                  ¿Necesitas ayuda? Contacta con soporte
                </a>
              </div>

              {/* Error ID for support */}
              {error.digest && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    ID del error: {error.digest}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}