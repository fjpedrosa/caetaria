/**
 * Accessible Navbar Example
 *
 * Ejemplo completo de implementación del navbar con accesibilidad WCAG 2.1 AA.
 * Demuestra navegación por teclado, ARIA attributes y focus management.
 */

'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  FileText,
  HelpCircle,
  Home,
  MessageCircle,
  Package,
  Settings,
  Users} from 'lucide-react';

import { useMegaMenuInteraction } from '../application/hooks/use-mega-menu-interaction';
import { useNavbarAccessibility } from '../application/hooks/use-navbar-accessibility';
import type { NavigationItem } from '../domain/types';
import { AccessibleNavbarNavigation } from '../presentation/components/accessible-navbar-navigation';
import { MegaMenuPresentationPure } from '../presentation/components/mega-menu-presentation-pure';

// Import accessibility styles
import '../presentation/styles/accessibility.css';

// Navigation items with mega menu content
const navigationItems: NavigationItem[] = [
  {
    label: 'Inicio',
    href: '/',
    icon: Home,
    sectionId: 'home'
  },
  {
    label: 'Productos',
    href: '/productos',
    icon: Package,
    badge: 'Nuevo',
    children: [
      {
        label: 'WhatsApp Business API',
        href: '/productos/whatsapp-api',
        description: 'Integración completa con WhatsApp Cloud API'
      },
      {
        label: 'Chatbots Inteligentes',
        href: '/productos/chatbots',
        description: 'IA conversacional para tu negocio'
      },
      {
        label: 'CRM Integrado',
        href: '/productos/crm',
        description: 'Gestión de clientes y conversaciones'
      },
      {
        label: 'Analytics',
        href: '/productos/analytics',
        description: 'Métricas y análisis en tiempo real',
        badge: 'Beta'
      }
    ]
  },
  {
    label: 'Precios',
    href: '/precios',
    icon: DollarSign,
    sectionId: 'pricing'
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
    children: [
      {
        label: 'Casos de Éxito',
        href: '/clientes/casos',
        description: 'Historias de nuestros clientes'
      },
      {
        label: 'Testimonios',
        href: '/clientes/testimonios',
        description: 'Lo que dicen de nosotros'
      },
      {
        label: 'Partners',
        href: '/clientes/partners',
        description: 'Nuestros socios estratégicos'
      }
    ]
  },
  {
    label: 'Recursos',
    href: '/recursos',
    icon: FileText,
    children: [
      {
        label: 'Documentación',
        href: '/recursos/docs',
        description: 'Guías y tutoriales completos'
      },
      {
        label: 'API Reference',
        href: '/recursos/api',
        description: 'Documentación técnica de la API'
      },
      {
        label: 'Blog',
        href: '/recursos/blog',
        description: 'Artículos y novedades',
        external: true
      },
      {
        label: 'Webinars',
        href: '/recursos/webinars',
        description: 'Sesiones de formación en vivo'
      }
    ]
  },
  {
    label: 'Soporte',
    href: '/soporte',
    icon: HelpCircle
  }
];

export default function AccessibleNavbarExample() {
  const [activeItem, setActiveItem] = useState('/');
  const [hoveredItem, setHoveredItem] = useState<NavigationItem | null>(null);

  // Accessibility hook
  const {
    announceToScreenReader,
    trapFocus,
    releaseFocus,
    showSkipLinks,
    getAriaProps
  } = useNavbarAccessibility({
    config: {
      enableSkipLinks: true,
      enableKeyboardShortcuts: true,
      enableFocusTrap: true,
      enableAriaLive: true,
      minTouchTarget: 44
    }
  });

  // Mega menu interaction hook
  const {
    activeMenu,
    isOpen,
    openMenu,
    closeMenu,
    handleKeyDown: handleMegaMenuKeyDown,
    registerMenu,
    isMenuOpen,
    isMenuPending
  } = useMegaMenuInteraction({
    config: {
      hoverDelay: { enter: 100, exit: 300, keyboard: 0 },
      triangleSafeZone: { enabled: true },
      accessibility: {
        announceChanges: true,
        focusFirstItem: true
      }
    },
    onMenuOpen: (menuId) => {
      announceToScreenReader(`Menú ${menuId} abierto. Use las teclas de flecha para navegar.`);
    },
    onMenuClose: (menuId) => {
      announceToScreenReader(`Menú ${menuId} cerrado.`);
    }
  });

  // Handle navigation item click
  const handleItemClick = (item: NavigationItem) => {
    setActiveItem(item.href);

    if (item.children && item.children.length > 0) {
      // Toggle mega menu
      if (isMenuOpen(item.href)) {
        closeMenu(item.href);
      } else {
        openMenu(item.href, false, true);
      }
    } else {
      // Navigate to page
      announceToScreenReader(`Navegando a ${item.label}`);
      // In real app, use router.push(item.href)
    }
  };

  // Handle item hover
  const handleItemHover = (item: NavigationItem | null) => {
    setHoveredItem(item);

    if (item && item.children && item.children.length > 0) {
      openMenu(item.href);
    } else if (!item) {
      // Close menu when leaving navbar
      if (activeMenu) {
        closeMenu(activeMenu);
      }
    }
  };

  // Prepare mega menu sections
  const getMegaMenuSections = (items: NavigationItem[]) => {
    return [{
      title: 'Principal',
      items: items.slice(0, Math.ceil(items.length / 2))
    }, {
      title: 'Adicional',
      items: items.slice(Math.ceil(items.length / 2))
    }];
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Accessibility announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
      <div aria-live="assertive" aria-atomic="true" className="sr-only" />

      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/30">
        <div className="container mx-auto px-4">
          {/* Keyboard shortcuts help */}
          <div className="sr-only" role="region" aria-label="Keyboard shortcuts">
            <h2>Atajos de teclado disponibles:</h2>
            <ul>
              <li>Alt + S: Saltar al contenido principal</li>
              <li>Alt + M: Abrir menú móvil</li>
              <li>Flechas: Navegar entre elementos</li>
              <li>Enter/Espacio: Activar elemento</li>
              <li>Escape: Cerrar menú</li>
              <li>Home: Ir al primer elemento</li>
              <li>End: Ir al último elemento</li>
            </ul>
          </div>

          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center space-x-2 text-xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg px-2 py-1"
              aria-label="Neptunik - Ir a inicio"
            >
              <MessageCircle className="w-8 h-8 text-yellow-400" aria-hidden="true" />
              <span>Neptunik</span>
            </a>

            {/* Main Navigation */}
            <AccessibleNavbarNavigation
              items={navigationItems}
              activeItem={activeItem}
              onItemClick={handleItemClick}
              onItemHover={handleItemHover}
              className="hidden lg:flex"
              orientation="horizontal"
              enableSkipLink={true}
            />

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg"
                aria-label="Configuración de cuenta"
              >
                <Settings className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Configuración</span>
              </button>

              <button
                className="px-6 py-2 bg-yellow-400 text-slate-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
                aria-label="Comenzar prueba gratuita"
              >
                Empezar Gratis
              </button>
            </div>
          </div>

          {/* Mega Menus */}
          {navigationItems.map((item) => {
            if (!item.children || item.children.length === 0) return null;

            return (
              <MegaMenuPresentationPure
                key={item.href}
                isOpen={isMenuOpen(item.href)}
                isPending={isMenuPending(item.href)}
                sections={getMegaMenuSections(item.children)}
                position={{ x: 0, y: 64 }}
                alignment="left"
                width="600px"
                animationPhase={isMenuOpen(item.href) ? 'entered' : 'exited'}
                hoveredItemId={hoveredItem?.href}
                onItemClick={(subItem) => {
                  announceToScreenReader(`Navegando a ${subItem.label}`);
                  closeMenu(item.href);
                }}
                onClose={() => closeMenu(item.href)}
                showSectionTitles={true}
                showItemDescriptions={true}
                showItemIcons={true}
                className="mt-2"
                ariaLabel={`Menú desplegable de ${item.label}`}
              />
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="container mx-auto px-4 py-16"
        tabIndex={-1}
        role="main"
        aria-label="Contenido principal"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            Navbar Accesible - Demostración WCAG 2.1 AA
          </h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-2xl font-semibold mb-4">
                Características de Accesibilidad Implementadas
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    🎯 Navegación por Teclado Completa
                  </h3>
                  <ul className="text-sm space-y-1 text-slate-300">
                    <li>• Arrow keys para navegar</li>
                    <li>• Tab/Shift+Tab con focus trap</li>
                    <li>• Home/End para primer/último item</li>
                    <li>• Escape para cerrar menús</li>
                    <li>• Enter/Space para activar</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    ♿ ARIA Attributes
                  </h3>
                  <ul className="text-sm space-y-1 text-slate-300">
                    <li>• aria-expanded en triggers</li>
                    <li>• aria-haspopup="menu"</li>
                    <li>• aria-controls y aria-labelledby</li>
                    <li>• role="menu" y role="menuitem"</li>
                    <li>• aria-orientation para dirección</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    👁️ Visual Feedback
                  </h3>
                  <ul className="text-sm space-y-1 text-slate-300">
                    <li>• Focus rings de 3px mínimo</li>
                    <li>• Contraste 8.2:1 en CTAs</li>
                    <li>• Estados focus-visible</li>
                    <li>• Sin delays en teclado</li>
                    <li>• Roving tabindex</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-yellow-400 mb-2">
                    📱 Touch & Motion
                  </h3>
                  <ul className="text-sm space-y-1 text-slate-300">
                    <li>• Touch targets de 44px mínimo</li>
                    <li>• Soporte prefers-reduced-motion</li>
                    <li>• Soporte high contrast mode</li>
                    <li>• Skip to main content link</li>
                    <li>• Screen reader announcements</li>
                  </ul>
                </div>
              </div>
            </section>

            <section aria-labelledby="usage-heading" className="mt-8">
              <h2 id="usage-heading" className="text-2xl font-semibold mb-4">
                Instrucciones de Uso
              </h2>

              <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                <p className="text-slate-300">
                  Este navbar implementa navegación completa por teclado siguiendo los estándares WCAG 2.1 AA:
                </p>

                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Presiona <kbd className="px-2 py-1 bg-slate-700 rounded">Tab</kbd> para navegar entre elementos</li>
                  <li>Usa las <kbd className="px-2 py-1 bg-slate-700 rounded">Flechas</kbd> para moverte entre items del menú</li>
                  <li>Presiona <kbd className="px-2 py-1 bg-slate-700 rounded">Enter</kbd> o <kbd className="px-2 py-1 bg-slate-700 rounded">Espacio</kbd> para abrir menús</li>
                  <li>Usa <kbd className="px-2 py-1 bg-slate-700 rounded">Escape</kbd> para cerrar el menú actual</li>
                  <li>Presiona <kbd className="px-2 py-1 bg-slate-700 rounded">Home</kbd> o <kbd className="px-2 py-1 bg-slate-700 rounded">End</kbd> para ir al primer/último elemento</li>
                </ol>

                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded">
                  <p className="text-sm text-yellow-400">
                    💡 <strong>Tip:</strong> El sistema detecta automáticamente si estás usando teclado o mouse
                    y ajusta los estilos de focus acordemente.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}