import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Solo procesar en rutas relevantes
  const path = request.nextUrl.pathname;
  const shouldProcess = path === '/' || 
                        path.includes('/pricing') || 
                        path.includes('/marketing');
  
  if (!shouldProcess) {
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