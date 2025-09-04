'use client';

import React from 'react';

import { ModernNavbar } from './modern-navbar';

/**
 * Componente de demostración del ModernNavbar
 *
 * Este componente muestra todas las funcionalidades del navbar:
 * - Logo con animación hover
 * - Mega-menús interactivos con productos y soluciones
 * - Links de navegación simples
 * - Botones CTA estilizados
 * - Indicador de progreso de scroll
 * - Versión móvil responsiva
 * - Animaciones con Framer Motion
 * - Efectos de scroll (sticky y blur)
 *
 * Características técnicas:
 * - Usa shadcn/ui components (NavigationMenu, Sheet, Button)
 * - Framer Motion para animaciones fluidas
 * - Responsive design con mobile-first approach
 * - Accesibilidad completa (ARIA, keyboard navigation)
 * - Colores de marca (amarillo primary, azul secondary)
 *
 * Instrucciones de prueba:
 * 1. Hacer hover sobre el logo para ver la animación
 * 2. Navegar por los mega-menús "Productos" y "Soluciones"
 * 3. Hacer scroll para ver el efecto sticky y blur
 * 4. Ver la barra de progreso en la parte superior
 * 5. Reducir el ancho para probar el menú móvil
 * 6. Probar navegación por teclado (Tab, Enter, Escape)
 */
export function NavbarDemo() {
  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar />

      {/* Contenido de demostración para mostrar el scroll */}
      <main className="pt-16">
        <section className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Modern Navbar Demo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un navbar profesional con mega-menús, animaciones y funcionalidades avanzadas
            </p>
            <div className="flex gap-4 justify-center">
              <div className="px-4 py-2 bg-card rounded-lg border">
                <span className="text-sm font-medium">✨ Animaciones Fluidas</span>
              </div>
              <div className="px-4 py-2 bg-card rounded-lg border">
                <span className="text-sm font-medium">📱 Responsive</span>
              </div>
              <div className="px-4 py-2 bg-card rounded-lg border">
                <span className="text-sm font-medium">♿ Accesible</span>
              </div>
            </div>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center bg-muted/50">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Funcionalidades Destacadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6">
              <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">Mega-Menús</h3>
                <p className="text-muted-foreground">
                  Navegación organizada en categorías con descripciones y badges
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">Scroll Progress</h3>
                <p className="text-muted-foreground">
                  Indicador visual del progreso de lectura de la página
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">Mobile First</h3>
                <p className="text-muted-foreground">
                  Drawer animado para navegación móvil optimizada
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Tecnologías Utilizadas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-6">
              {[
                'Framer Motion',
                'Radix UI',
                'Tailwind CSS',
                'TypeScript',
                'Next.js',
                'Lucide Icons',
                'shadcn/ui',
                'React 19'
              ].map((tech) => (
                <div key={tech} className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="h-screen flex items-center justify-center bg-muted/50">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Haz scroll hacia arriba
            </h2>
            <p className="text-muted-foreground">
              Observa cómo cambia el navbar cuando haces scroll hacia arriba
            </p>
            <div className="w-6 h-10 border-2 border-primary rounded-full mx-auto">
              <div className="w-1 h-3 bg-primary rounded-full mx-auto mt-2 animate-bounce"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NavbarDemo;