/**
 * Página de prueba para verificar las microanimaciones de enlaces
 * Esta página puede ser eliminada después de verificar las animaciones
 */
'use client';

import { AnimatedLink } from '@/shared/components/ui/animated-link';

export default function TestAnimationsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Título */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Test de Microanimaciones</h1>
          <p className="text-muted-foreground">
            Prueba las animaciones optimizadas de enlaces con underline animado y transición de font-weight
          </p>
        </div>

        {/* Enlaces normales con underline */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Enlaces Normales (con underline)</h2>
          <div className="flex flex-wrap gap-6">
            <AnimatedLink href="#" variant="default">
              Home
            </AnimatedLink>
            <AnimatedLink href="#" variant="default">
              Products
            </AnimatedLink>
            <AnimatedLink href="#" variant="default">
              About Us
            </AnimatedLink>
            <AnimatedLink href="#" variant="default">
              Contact
            </AnimatedLink>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✅ Underline animado de izquierda a derecha (scaleX: 0→1)<br />
            ✅ Font-weight transition (400→500) sin layout shift<br />
            ✅ Sin movimiento vertical
          </p>
        </section>

        {/* Enlaces tipo botón */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Enlaces Tipo Botón</h2>
          <div className="flex flex-wrap gap-6">
            <AnimatedLink href="#" variant="button">
              Sign In
            </AnimatedLink>
            <AnimatedLink href="#" variant="button">
              Dashboard
            </AnimatedLink>
            <AnimatedLink href="#" variant="button">
              Settings
            </AnimatedLink>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✅ Background color transition<br />
            ✅ Font-weight transition (400→500)<br />
            ✅ Sin underline<br />
            ✅ Sin movimiento vertical
          </p>
        </section>

        {/* Botones CTA */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Botones CTA</h2>
          <div className="flex flex-wrap gap-6">
            <AnimatedLink href="#" variant="cta-primary">
              Get Started
            </AnimatedLink>
            <AnimatedLink href="#" variant="cta-secondary">
              Learn More
            </AnimatedLink>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✅ Scale animation on click (0.98)<br />
            ✅ Box-shadow y brightness en hover<br />
            ✅ Sin movimiento vertical<br />
            ✅ Sin underline
          </p>
        </section>

        {/* Enlaces externos */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Enlaces Externos</h2>
          <div className="flex flex-wrap gap-6">
            <AnimatedLink href="https://google.com" variant="default" external>
              Google (External)
            </AnimatedLink>
            <AnimatedLink href="https://github.com" variant="default" external>
              GitHub (External)
            </AnimatedLink>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✅ Mismas animaciones que enlaces internos<br />
            ✅ Se abren en nueva pestaña<br />
            ✅ rel="noopener noreferrer" para seguridad
          </p>
        </section>

        {/* Performance notes */}
        <section className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">🚀 Optimizaciones de Performance</h3>
          <ul className="space-y-1 text-sm">
            <li>• GPU acceleration con transform: scaleX() en lugar de width</li>
            <li>• will-change activado solo durante hover/focus</li>
            <li>• Pseudo-elemento invisible pre-renderiza texto bold</li>
            <li>• Transform-origin: left center para animación natural</li>
            <li>• Duración optimizada: 300ms con cubic-bezier(0.4, 0, 0.2, 1)</li>
            <li>• Respeta prefers-reduced-motion</li>
            <li>• 60fps garantizados con CSS transforms</li>
          </ul>
        </section>

        {/* Accessibility notes */}
        <section className="mt-6 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">♿ Accesibilidad</h3>
          <ul className="space-y-1 text-sm">
            <li>• Focus visible con ring outline</li>
            <li>• Keyboard navigation completa</li>
            <li>• Touch targets mínimo 44px</li>
            <li>• Contraste WCAG AAA</li>
            <li>• Animaciones deshabilitadas con prefers-reduced-motion</li>
          </ul>
        </section>
      </div>
    </div>
  );
}