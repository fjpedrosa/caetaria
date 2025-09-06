/**
 * Example: Optimized Mega Menu with 60fps Animations
 *
 * Demostración de mega menú con animaciones optimizadas para performance.
 * Incluye todas las optimizaciones: GPU acceleration, lazy loading,
 * debounce/throttle, y efectos visuales avanzados.
 */

'use client';

import React, { useCallback,useRef, useState } from 'react';
import {
  BarChart,
  BookOpen,
  Cloud,
  Cpu,
  Database,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  Package,
  Rocket,
  Settings,
  Shield,
  Users,
  Zap} from 'lucide-react';

import type { NavigationItem } from '../domain/types';
import { MegaMenuOptimizedContainer } from '../presentation/containers/mega-menu-optimized-container';

// Import optimized styles
import '../presentation/styles/mega-menu-optimized.css';

const navigationItems: NavigationItem[] = [
  {
    label: 'WhatsApp Bot',
    href: '/products/whatsapp-bot',
    icon: Package,
    description: 'Automatiza conversaciones con IA avanzada',
    badge: 'Nuevo'
  },
  {
    label: 'Integración Rápida',
    href: '/products/quick-integration',
    icon: Zap,
    description: 'Conecta en minutos con nuestra API'
  },
  {
    label: 'Seguridad Enterprise',
    href: '/products/security',
    icon: Shield,
    description: 'Encriptación end-to-end y compliance GDPR'
  },
  {
    label: 'IA Conversacional',
    href: '/products/ai',
    icon: Cpu,
    description: 'Procesamiento de lenguaje natural avanzado'
  },
  {
    label: 'Escalabilidad',
    href: '/products/scale',
    icon: Rocket,
    description: 'Crece sin límites con nuestra infraestructura'
  },
  {
    label: 'Multi-idioma',
    href: '/products/languages',
    icon: Globe,
    description: 'Soporte para más de 100 idiomas'
  },
  {
    label: 'Base de Datos',
    href: '/resources/database',
    icon: Database,
    description: 'Almacenamiento seguro y respaldos automáticos'
  },
  {
    label: 'Cloud Native',
    href: '/resources/cloud',
    icon: Cloud,
    description: 'Desplegado en la nube con alta disponibilidad'
  },
  {
    label: 'Privacidad',
    href: '/resources/privacy',
    icon: Lock,
    description: 'Control total sobre tus datos'
  },
  {
    label: 'Configuración',
    href: '/resources/settings',
    icon: Settings,
    description: 'Personaliza cada aspecto del bot'
  },
  {
    label: 'Analytics',
    href: '/company/analytics',
    icon: BarChart,
    description: 'Métricas en tiempo real y reportes'
  },
  {
    label: 'Equipo',
    href: '/company/team',
    icon: Users,
    description: 'Conoce a nuestro equipo de expertos'
  },
  {
    label: 'Soporte',
    href: '/company/support',
    icon: HelpCircle,
    description: 'Ayuda 24/7 con expertos dedicados'
  },
  {
    label: 'Documentación',
    href: '/docs',
    icon: FileText,
    description: 'Guías completas y referencias API',
    external: true
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: BookOpen,
    description: 'Últimas noticias y tutoriales'
  }
];

export const MegaMenuOptimizedExample: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    renderTime: 0,
    animations: 0
  });

  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement>(null);
  const companyButtonRef = useRef<HTMLButtonElement>(null);

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      const fps = Math.min(60, Math.round(1000 / renderTime));

      setPerformanceMetrics(prev => ({
        ...prev,
        fps,
        renderTime: Math.round(renderTime * 100) / 100,
        animations: prev.animations + 1
      }));
    });
  }, []);

  const handleMenuToggle = useCallback((menuId: string) => {
    setActiveMenu(prev => prev === menuId ? null : menuId);
    updatePerformanceMetrics();
  }, [updatePerformanceMetrics]);

  const handleClose = useCallback(() => {
    setActiveMenu(null);
    updatePerformanceMetrics();
  }, [updatePerformanceMetrics]);

  const handleNavigate = useCallback((href: string) => {
    console.log(`Navigating to: ${href}`);
    updatePerformanceMetrics();
  }, [updatePerformanceMetrics]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Performance Monitor */}
      <div className="fixed top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 z-[60] font-mono text-xs">
        <div className="text-green-400">FPS: {performanceMetrics.fps}</div>
        <div className="text-blue-400">Render: {performanceMetrics.renderTime}ms</div>
        <div className="text-yellow-400">Animations: {performanceMetrics.animations}</div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Neptunik
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Products Menu */}
              <div className="relative">
                <button
                  ref={productsButtonRef}
                  data-menu-trigger="products"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-out
                    hover:bg-white/10 hover:text-yellow-400
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50
                    ${activeMenu === 'products' ? 'bg-white/10 text-yellow-400' : 'text-slate-300'}
                  `}
                  onClick={() => handleMenuToggle('products')}
                  aria-expanded={activeMenu === 'products'}
                  aria-haspopup="menu"
                >
                  Productos
                </button>

                {activeMenu === 'products' && (
                  <MegaMenuOptimizedContainer
                    menuId="products"
                    navigationItems={navigationItems.slice(0, 6)}
                    triggerElement={productsButtonRef.current || undefined}
                    position="left"
                    onClose={handleClose}
                    onNavigate={handleNavigate}
                    enableDebounce={true}
                    debounceDelay={100}
                    enableThrottle={true}
                    throttleDelay={16}
                    enablePrefetch={true}
                    enablePerformanceMonitoring={true}
                    className="mega-menu-optimized mega-menu-backdrop mega-menu-shadow-progressive"
                  />
                )}
              </div>

              {/* Resources Menu */}
              <div className="relative">
                <button
                  ref={resourcesButtonRef}
                  data-menu-trigger="resources"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-out
                    hover:bg-white/10 hover:text-yellow-400
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50
                    ${activeMenu === 'resources' ? 'bg-white/10 text-yellow-400' : 'text-slate-300'}
                  `}
                  onClick={() => handleMenuToggle('resources')}
                  aria-expanded={activeMenu === 'resources'}
                  aria-haspopup="menu"
                >
                  Recursos
                </button>

                {activeMenu === 'resources' && (
                  <MegaMenuOptimizedContainer
                    menuId="resources"
                    navigationItems={navigationItems.slice(6, 10)}
                    triggerElement={resourcesButtonRef.current || undefined}
                    position="center"
                    onClose={handleClose}
                    onNavigate={handleNavigate}
                    enableDebounce={true}
                    debounceDelay={100}
                    enableThrottle={true}
                    throttleDelay={16}
                    enablePrefetch={true}
                    enablePerformanceMonitoring={true}
                    className="mega-menu-optimized mega-menu-backdrop mega-menu-shadow-progressive"
                  />
                )}
              </div>

              {/* Company Menu */}
              <div className="relative">
                <button
                  ref={companyButtonRef}
                  data-menu-trigger="company"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-out
                    hover:bg-white/10 hover:text-yellow-400
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50
                    ${activeMenu === 'company' ? 'bg-white/10 text-yellow-400' : 'text-slate-300'}
                  `}
                  onClick={() => handleMenuToggle('company')}
                  aria-expanded={activeMenu === 'company'}
                  aria-haspopup="menu"
                >
                  Empresa
                </button>

                {activeMenu === 'company' && (
                  <MegaMenuOptimizedContainer
                    menuId="company"
                    navigationItems={navigationItems.slice(10)}
                    triggerElement={companyButtonRef.current || undefined}
                    position="right"
                    onClose={handleClose}
                    onNavigate={handleNavigate}
                    enableDebounce={true}
                    debounceDelay={100}
                    enableThrottle={true}
                    throttleDelay={16}
                    enablePrefetch={true}
                    enablePerformanceMonitoring={true}
                    className="mega-menu-optimized mega-menu-backdrop mega-menu-shadow-progressive"
                  />
                )}
              </div>

              {/* CTA Button */}
              <button className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-gradient-to-r from-yellow-400 to-yellow-600
                text-slate-900 hover:from-yellow-500 hover:to-yellow-700
                transform hover:scale-105 transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50
              ">
                Empezar Gratis
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Mega Menú Optimizado con Animaciones de 60fps
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Implementación de alto rendimiento con GPU acceleration, lazy loading y efectos visuales avanzados
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Feature Cards */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">GPU Acceleration</h3>
              <p className="text-sm text-slate-400">
                Transform3d y will-change optimization para animaciones suaves a 60fps constantes
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lazy Loading</h3>
              <p className="text-sm text-slate-400">
                Contenido cargado bajo demanda con Intersection Observer para mejor performance
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Debounce & Throttle</h3>
              <p className="text-sm text-slate-400">
                Eventos optimizados para reducir cálculos innecesarios y mejorar la respuesta
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <h2 className="text-2xl font-bold mb-4">Características de Performance</h2>
            <ul className="text-left space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Animación scale(0.95) → scale(1) con cubic-bezier spring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Transform-origin dinámico basado en posición del trigger
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Backdrop blur con fallback para navegadores sin soporte
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Shadow progresivo durante la animación
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Stagger animation para items internos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Virtualización automática para listas largas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Cleanup automático de recursos al cerrar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                60fps garantizados incluso en móviles de gama baja
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};