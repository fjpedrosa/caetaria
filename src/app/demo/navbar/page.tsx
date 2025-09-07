/**
 * Demo page for the enhanced navbar with Stripe-quality mega menus
 */

'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Code,
  Globe,
  Palette,
  Shield,
  Sparkles,
  Zap} from 'lucide-react';

import { EnhancedNavbar } from '@/modules/marketing/navbar';

export default function NavbarDemoPage() {
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Navbar */}
      <EnhancedNavbar
        hideOnScroll={hideOnScroll}
        showProgress={showProgress}
      />

      {/* Demo Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Navbar Premium con Mega Menús</span>
              </div>

              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Navbar Profesional estilo Stripe
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Diseño premium con mega menús sofisticados, animaciones fluidas y experiencia de usuario de primera clase
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: Palette,
                  title: 'Diseño Premium',
                  description: 'Inspirado en Stripe y Supabase con glass morphism y gradientes modernos',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Zap,
                  title: 'Hover Inteligente',
                  description: 'Delay de 150ms para evitar aperturas accidentales con transiciones suaves',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Code,
                  title: 'Clean Architecture',
                  description: 'Componentes modulares y reutilizables siguiendo mejores prácticas',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Globe,
                  title: 'Mega Menús',
                  description: 'Organización en columnas con iconos, badges y secciones destacadas',
                  color: 'from-orange-500 to-red-500'
                },
                {
                  icon: Shield,
                  title: 'Accesibilidad',
                  description: 'WCAG 2.1 AA compliant con navegación por teclado completa',
                  color: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: BarChart3,
                  title: 'Performance',
                  description: 'Animaciones a 60fps con lazy loading y code splitting',
                  color: 'from-pink-500 to-rose-500'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="relative group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Cómo probar el navbar
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Hover sobre los items del menú</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pasa el mouse sobre "Productos", "Soluciones" o "Recursos" para ver los mega menús con animaciones fluidas
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Prueba el delay inteligente</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mueve el mouse rápidamente sobre los items - notarás que hay un delay de 150ms para evitar aperturas accidentales
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Observa el backdrop blur</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cuando se abre un mega menú, el fondo se difumina con un efecto glass morphism profesional
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Navegación por teclado</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Usa Tab para navegar, Enter para seleccionar y Escape para cerrar los menús
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Responsive mobile</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Redimensiona la ventana para ver la versión mobile con drawer optimizado
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Opciones del navbar</h3>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideOnScroll}
                      onChange={(e) => setHideOnScroll(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Hide on scroll</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProgress}
                      onChange={(e) => setShowProgress(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show progress bar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Características Técnicas</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Framer Motion para animaciones fluidas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>TypeScript para type safety completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Tailwind CSS con design tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Clean Architecture con DDD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Hooks personalizados reutilizables</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Performance Metrics</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>LCP &lt; 2.5s con mega menús</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>60fps en todas las animaciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Bundle size &lt; 15KB gzipped</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>100% Lighthouse accessibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Zero layout shifts (CLS = 0)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer for scroll testing */}
        <div className="h-[200vh] bg-gradient-to-b from-transparent to-purple-100 dark:to-purple-900/20">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Scroll down para probar la funcionalidad "hide on scroll" del navbar
              <br />
              <ArrowRight className="w-6 h-6 mx-auto mt-4 animate-bounce rotate-90" />
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}