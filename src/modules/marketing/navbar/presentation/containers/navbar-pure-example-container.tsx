/**
 * Container Example - Using Pure Components with Hooks
 *
 * Este es un ejemplo de cómo conectar los componentes puros
 * con los hooks que contienen toda la lógica.
 *
 * Principios aplicados:
 * - Separation of Concerns: Lógica en hooks, presentación en componentes
 * - Single Responsibility: Container solo conecta hooks con componentes
 * - Dependency Inversion: Componentes no conocen la fuente de los datos
 */

'use client';

import React from 'react';
import { ArrowRight,FileText, Home, MessageCircle, Settings, Users } from 'lucide-react';

import { useMegaMenuInteraction } from '../../application/hooks/use-mega-menu-interaction';
import { useNavbarPrefetch } from '../../application/hooks/use-navbar-prefetch';
import { useNavbarScroll } from '../../application/hooks/use-navbar-scroll';
// Hooks con toda la lógica
import { useNavbarState } from '../../application/hooks/use-navbar-state';
// Types del dominio
import type { NavigationItem, NavigationSection } from '../../domain/types';
// Componentes puros (solo presentación)
import {
  MegaMenuPresentationPure,
  NavbarCTAPure,
  NavbarLinkPure,
  NavbarLogoPure,
  NavbarProgressBarPure} from '../components';

// Datos de ejemplo (normalmente vendrían de props o API)
const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Características', href: '#features', sectionId: 'features' },
  { label: 'Precios', href: '#pricing', sectionId: 'pricing', badge: 'Nuevo' },
  { label: 'Testimonios', href: '#testimonials', sectionId: 'testimonials' },
  { label: 'FAQ', href: '#faq', sectionId: 'faq' }
];

const megaMenuSections: NavigationSection[] = [
  {
    title: 'Producto',
    items: [
      { label: 'WhatsApp Cloud API', href: '/product/whatsapp', icon: MessageCircle, description: 'Integración completa con WhatsApp' },
      { label: 'Bot Builder', href: '/product/bot-builder', icon: Settings, description: 'Constructor visual de bots' },
      { label: 'Analytics', href: '/product/analytics', icon: FileText, description: 'Métricas en tiempo real' }
    ]
  },
  {
    title: 'Empresa',
    items: [
      { label: 'Sobre Nosotros', href: '/about', icon: Users },
      { label: 'Blog', href: '/blog', icon: FileText, badge: '5 nuevos' },
      { label: 'Contacto', href: '/contact', external: true }
    ]
  }
];

interface NavbarPureExampleContainerProps {
  className?: string;
}

export const NavbarPureExampleContainer: React.FC<NavbarPureExampleContainerProps> = ({
  className
}) => {
  // ========== HOOKS - Toda la lógica aquí ==========

  // Estado del navbar
  const {
    isOpen: isMobileMenuOpen,
    activeSection,
    toggleMobileMenu,
    setActiveSection
  } = useNavbarState();

  // Scroll tracking
  const {
    scrollState,
    scrollProgress
  } = useNavbarScroll({
    hideOnScroll: true,
    threshold: 50
  });

  // Prefetch de rutas
  const {
    prefetchRoute,
    isPrefetching,
    handleMouseEnter,
    handleMouseLeave
  } = useNavbarPrefetch({
    enablePrefetch: true,
    prefetchDelay: 100
  });

  // Mega menu interaction
  const {
    isOpen: isMegaMenuOpen,
    position: megaMenuPosition,
    currentItem: hoveredMenuItem,
    handleItemHover,
    handleMenuLeave,
    closeMenu
  } = useMegaMenuInteraction();

  // ========== HANDLERS - Conectan eventos con lógica ==========

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('hero');
  };

  const handleNavItemClick = (item: NavigationItem) => {
    if (item.sectionId) {
      const element = document.getElementById(item.sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(item.sectionId);
      }
    } else if (item.href && !item.external) {
      prefetchRoute(item.href);
    }
  };

  const handleCTAClick = (href: string) => {
    // Aquí iría la lógica de navegación o tracking
    console.log('CTA clicked:', href);
  };

  const handleLinkMouseEnter = (href: string) => {
    handleMouseEnter(href);
  };

  const handleLinkMouseLeave = () => {
    handleMouseLeave();
  };

  // ========== RENDER - Solo conectar props ==========

  return (
    <nav className={className}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo - Componente puro */}
          <NavbarLogoPure
            text="Neptunik"
            subtitle="WhatsApp Cloud"
            icon={<MessageCircle className="w-6 h-6 text-slate-900" />}
            onClick={handleLogoClick}
            isHovered={false}
            className="flex items-center space-x-3 group"
            iconClassName="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
            textClassName="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent"
            subtitleClassName="text-xs -mt-0.5 text-slate-400"
            ariaLabel="Neptunik - Ir a inicio"
          />

          {/* Navigation Links - Componentes puros */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <NavbarLinkPure
                key={item.href}
                href={item.href}
                isActive={activeSection === item.sectionId}
                isPrefetching={isPrefetching.has(item.href)}
                variant="default"
                external={item.external}
                badge={item.badge}
                icon={item.icon && <item.icon className="w-4 h-4" />}
                onMouseEnter={() => handleLinkMouseEnter(item.href)}
                onMouseLeave={handleLinkMouseLeave}
                onClick={() => handleNavItemClick(item)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                activeClassName="bg-yellow-400/10 text-yellow-400"
                ariaLabel={item.label}
              >
                {item.label}
              </NavbarLinkPure>
            ))}
          </div>

          {/* CTAs - Componentes puros */}
          <div className="flex items-center space-x-3">
            <NavbarCTAPure
              variant="ghost"
              size="md"
              onClick={() => handleCTAClick('/signin')}
              className="hidden sm:flex"
              ariaLabel="Iniciar sesión"
            >
              Iniciar Sesión
            </NavbarCTAPure>

            <NavbarCTAPure
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => handleCTAClick('/start')}
              ariaLabel="Comenzar ahora"
            >
              Comenzar
            </NavbarCTAPure>
          </div>
        </div>
      </div>

      {/* Progress Bar - Componente puro */}
      <NavbarProgressBarPure
        progress={scrollProgress}
        visible={!scrollState.isAtTop}
        height={3}
        variant="linear"
        animated={true}
        animationDuration={150}
        showMilestones={false}
        className="absolute bottom-0 left-0 right-0"
        progressClassName="bg-gradient-to-r from-yellow-400 to-yellow-500"
        ariaLabel="Progreso de navegación"
      />

      {/* Mega Menu - Componente puro */}
      <MegaMenuPresentationPure
        isOpen={isMegaMenuOpen}
        sections={megaMenuSections}
        position={megaMenuPosition}
        alignment="left"
        animationPhase={isMegaMenuOpen ? 'entered' : 'exited'}
        hoveredItemId={hoveredMenuItem?.href}
        onItemClick={handleNavItemClick}
        onMouseEnter={() => handleItemHover(hoveredMenuItem!)}
        onMouseLeave={handleMenuLeave}
        onClose={closeMenu}
        showSectionTitles={true}
        showItemDescriptions={true}
        showItemIcons={true}
        columnsPerRow={2}
        className="mt-2"
        shadowIntensity="xl"
        ariaLabel="Menú de navegación expandido"
      />
    </nav>
  );
};

/**
 * Ejemplo de uso:
 *
 * import { NavbarPureExampleContainer } from '@/modules/marketing/navbar/presentation/containers';
 *
 * function Layout() {
 *   return (
 *     <header>
 *       <NavbarPureExampleContainer className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md" />
 *     </header>
 *   );
 * }
 */