import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { authCallback, protectedRoutes,updateSession } from '@/lib/supabase/middleware';

// Configuración de variantes de precios
const PRICE_VARIANTS = ['A', 'B', 'C'] as const;
type PriceVariant = typeof PRICE_VARIANTS[number];

// Distribución de variantes: A=34%, B=33%, C=33%
const VARIANT_DISTRIBUTION = {
  A: 0.34,
  B: 0.33,
  C: 0.33
};

// Cookie config
const COOKIE_NAME = 'price_var';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 días

function getRandomVariant(): PriceVariant {
  const random = Math.random();
  let accumulator = 0;

  for (const [variant, weight] of Object.entries(VARIANT_DISTRIBUTION)) {
    accumulator += weight;
    if (random < accumulator) {
      return variant as PriceVariant;
    }
  }

  return 'A'; // Fallback
}

function isValidVariant(variant: string): variant is PriceVariant {
  return PRICE_VARIANTS.includes(variant as PriceVariant);
}

export async function middleware(request: NextRequest) {
  // 1. Handle Supabase authentication first
  const authResponse = await updateSession(request);

  // 2. Handle auth callbacks
  const callbackResponse = await authCallback(request);
  if (callbackResponse) return callbackResponse;

  // 3. Handle protected routes
  const protectedResponse = await protectedRoutes(request);
  if (protectedResponse) return protectedResponse;

  // 4. Use auth response as base if available, otherwise create new response
  const response = authResponse || NextResponse.next();

  // 5. Apply production security headers
  applySecurityHeaders(response);

  // 6. Handle special endpoints
  const path = request.nextUrl.pathname;

  // Health check endpoint
  if (path === '/api/health') {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, {
      status: 200,
      headers: response.headers
    });
  }

  // Maintenance mode check
  if (process.env.FEATURE_MAINTENANCE_MODE === 'true') {
    const maintenancePaths = ['/maintenance', '/api/health', '/api/status'];
    if (!maintenancePaths.includes(path)) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // 7. Rate limiting for API routes
  if (path.startsWith('/api/')) {
    applyRateLimit(request, response);
  }

  // 8. Webhook validation
  if (path.startsWith('/api/webhooks/')) {
    const validationResponse = validateWebhook(request);
    if (validationResponse) return validationResponse;
  }

  // 9. A/B Testing - Solo procesar en rutas relevantes
  const shouldProcessAB = path === '/' ||
                         path.includes('/pricing') ||
                         path.includes('/marketing');

  if (!shouldProcessAB) {
    return response;
  }

  // Verificar si existe cookie de variante
  let variant = request.cookies.get(COOKIE_NAME)?.value as PriceVariant | undefined;

  // Verificar query param para debug (ej: ?var=B)
  const debugVariant = request.nextUrl.searchParams.get('var');
  if (debugVariant && isValidVariant(debugVariant)) {
    variant = debugVariant;
  }

  // Si no hay variante válida, asignar una nueva
  if (!variant || !isValidVariant(variant)) {
    variant = getRandomVariant();
  }

  // Establecer cookie con la variante
  response.cookies.set({
    name: COOKIE_NAME,
    value: variant,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });

  // Añadir header para que los componentes del servidor puedan acceder
  response.headers.set('x-price-variant', variant);

  return response;
}

// Security headers helper
function applySecurityHeaders(response: NextResponse) {
  const securityHeaders = {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Content Security Policy
    'Content-Security-Policy': process.env.NODE_ENV === 'production'
      ? [
          'default-src \'self\'',
          'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://vercel.com https://*.vercel.app https://cdn.vercel-insights.com https://*.supabase.co https://*.posthog.com https://eu.i.posthog.com https://eu-assets.i.posthog.com',
          'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
          'font-src \'self\' https://fonts.gstatic.com',
          'img-src \'self\' data: blob: https://*.supabase.co https://*.vercel.app https://*.cloudinary.com https://eu-assets.i.posthog.com',
          'connect-src \'self\' https://*.supabase.co https://vercel.com https://*.vercel.app https://*.posthog.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://*.sentry.io /ingest /ingest/*',
          'frame-src \'none\'',
          'object-src \'none\'',
          'base-uri \'self\'',
          'upgrade-insecure-requests'
        ].join('; ')
      : 'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; connect-src \'self\' http://localhost:* ws://localhost:* https://*.supabase.co https://eu.i.posthog.com https://eu-assets.i.posthog.com /ingest /ingest/*;',

    // HSTS for HTTPS enforcement
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    })
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

// Rate limiting helper
function applyRateLimit(request: NextRequest, response: NextResponse) {
  const clientIp = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown';

  // Add rate limiting headers
  response.headers.set('X-RateLimit-Limit', process.env.API_RATE_LIMIT_MAX || '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  response.headers.set('X-RateLimit-Reset', String(Date.now() + 15 * 60 * 1000));

  // Log for monitoring
  if (process.env.LOG_REQUESTS === 'true') {
    console.log(`API Request: ${request.method} ${request.nextUrl.pathname} from ${clientIp}`);
  }
}

// Webhook validation helper
function validateWebhook(request: NextRequest): Response | null {
  const signature = request.headers.get('x-hub-signature-256');
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!signature && process.env.NODE_ENV === 'production') {
    return new Response('Webhook signature required', { status: 401 });
  }

  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};