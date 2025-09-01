'use client';

import React, { useEffect,useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent,useScroll } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  ChevronDown,
  CreditCard,
  featureIcons,
  FileText,
  Globe2,
  HelpCircle,
  Menu,
  MessageCircle,
  navIcons,
  PlayCircle,
  Shield,
  Users,
  X,
  Zap} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/modules/shared/ui/components/theme-toggle';
import { Button, buttonVariants } from '@/modules/shared/ui/components/ui/button';
import { Icon, IconButton } from '@/modules/shared/ui/components/ui/icon';
// NavigationMenu temporarily disabled due to TypeScript issues
// import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/modules/shared/ui/components/ui/sheet';

interface MegaMenuSection {
  title: string;
  items: {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

const productSections: MegaMenuSection[] = [
  {
    title: 'Plataformas de Chat',
    items: [
      {
        title: 'WhatsApp Business',
        description: 'Automatiza conversaciones en WhatsApp con IA',
        href: '/productos/whatsapp',
        icon: MessageCircle,
        badge: 'Popular'
      },
      {
        title: 'Telegram Bots',
        description: 'Crea bots inteligentes para Telegram',
        href: '/productos/telegram',
        icon: Bot
      },
      {
        title: 'Instagram DMs',
        description: 'Respuesta automática en Instagram',
        href: '/productos/instagram',
        icon: Users
      }
    ]
  },
  {
    title: 'Herramientas',
    items: [
      {
        title: 'Reportes de Ventas',
        description: 'Ve cuánto vendes y qué funciona mejor',
        href: '/productos/analytics',
        icon: BarChart3
      },
      {
        title: 'Gestión de Pagos',
        description: 'Procesa pagos dentro del chat',
        href: '/productos/pagos',
        icon: CreditCard,
        badge: 'Nuevo'
      },
      {
        title: 'Conectores',
        description: 'Conecta con tu sistema actual',
        href: '/productos/api',
        icon: Zap
      }
    ]
  }
];

const solutionSections: MegaMenuSection[] = [
  {
    title: 'Por Industria',
    items: [
      {
        title: 'E-commerce',
        description: 'Automatiza ventas y atención al cliente',
        href: '/soluciones/ecommerce',
        icon: Building2
      },
      {
        title: 'Servicios',
        description: 'Gestiona citas y consultas',
        href: '/soluciones/servicios',
        icon: Users
      },
      {
        title: 'Educación',
        description: 'Soporte estudiantil automatizado',
        href: '/soluciones/educacion',
        icon: FileText
      }
    ]
  },
  {
    title: 'Casos de Uso',
    items: [
      {
        title: 'Atención al Cliente',
        description: 'Respuestas 24/7 con IA',
        href: '/soluciones/atencion-cliente',
        icon: HelpCircle,
        badge: 'Top'
      },
      {
        title: 'Ventas Automatizadas',
        description: 'Convierte leads en clientes',
        href: '/soluciones/ventas',
        icon: BarChart3
      },
      {
        title: 'Seguridad Garantizada',
        description: 'Tus datos siempre protegidos',
        href: '/soluciones/seguridad',
        icon: Shield
      }
    ]
  }
];

const MegaMenuContent: React.FC<{ sections: MegaMenuSection[] }> = ({ sections }) => (
  <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
    {sections.map((section) => (
      <div key={section.title} className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h4>
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.title} >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-start space-x-3 rounded-lg p-3 min-h-[44px] hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors touch-manipulation"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon icon={item.icon} size="small" iconClassName="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      {item.badge && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const NavigationLinks = [
  { href: '/precios', label: 'Precios' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/early-access', label: 'Acceso Anticipado' }
];

// Interface compatible with MotionNavbarV2
interface ModernNavbarProps {
  variant?: 'default' | 'transparent';
  showProgress?: boolean;
  hideOnScroll?: boolean;
  className?: string;
}

// Accessibility utilities
interface AccessibilityState {
  announcements: string[];
  focusedElement: string | null;
  skipLinkVisible: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderActive: boolean;
}

export function ModernNavbar({
  variant = 'default',
  showProgress = false,
  hideOnScroll = true,
  className
}: ModernNavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Accessibility state
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    announcements: [],
    focusedElement: null,
    skipLinkVisible: false,
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false
  });

  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);

    // Handle hideOnScroll behavior
    if (hideOnScroll) {
      if (latest > lastScrollY && latest > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(latest);
    }
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollProgress(latest);
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    // Detect accessibility preferences
    const detectAccessibilityPreferences = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: more)').matches;

      setAccessibilityState(prev => ({
        ...prev,
        reducedMotion,
        highContrast
      }));
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S to skip to main content
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          setAccessibilityState(prev => ({
            ...prev,
            announcements: [...prev.announcements, 'Navegado al contenido principal']
          }));
        }
      }

      // Alt+M to open menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        setIsOpen(!isOpen);
        setAccessibilityState(prev => ({
          ...prev,
          announcements: [...prev.announcements, isOpen ? 'Menú cerrado' : 'Menú abierto']
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    detectAccessibilityPreferences();

    // Listen for preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', detectAccessibilityPreferences);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      mediaQuery.removeEventListener('change', detectAccessibilityPreferences);
    };
  }, [isOpen]);

  const navbarVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const linkVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const staggeredLinks = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <>
      {/* Skip Navigation Links - WCAG 2.1 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg transition-all"
        onFocus={() => setAccessibilityState(prev => ({ ...prev, skipLinkVisible: true }))}
        onBlur={() => setAccessibilityState(prev => ({ ...prev, skipLinkVisible: false }))}
      >
        Saltar al contenido principal (Alt+S)
      </a>

      {/* ARIA Live Region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {accessibilityState.announcements.slice(-1)[0]}
      </div>

      {/* Scroll Progress Indicator - Only show if showProgress is true */}
      {showProgress && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-primary origin-left z-50 shadow-lg"
          style={{ scaleX: scrollProgress }}
          initial={{ scaleX: 0 }}
        />
      )}

      <motion.header
        variants={navbarVariants}
        initial="initial"
        animate={isVisible ? 'animate' : 'initial'}
        role="banner"
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg'
            : variant === 'transparent'
              ? 'bg-transparent'
              : 'bg-background/50 backdrop-blur-sm',
          !isVisible && hideOnScroll && 'transform -translate-y-full',
          accessibilityState.highContrast && 'border-2 border-foreground',
          className
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link
                href="/"
                className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-lg"
                aria-label="Caetaria - Ir al inicio"
              >
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Icon icon={MessageCircle} size="medium" iconClassName="text-primary-foreground group-hover:scale-110 transition-all" />
                </div>
                <span className="text-xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                  Caetaria
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              variants={staggeredLinks}
              animate="animate"
              className="hidden md:flex items-center space-x-1"
            >
              <div className="flex items-center space-x-4">
                <nav className="flex items-center space-x-1">
                  {/* Productos Mega Menu - Mobile optimized */}
                  <div className="relative group">
                    <Link href="/productos"
                      className="px-4 py-2 min-h-[44px] rounded-md bg-transparent hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors flex items-center gap-1 touch-manipulation"
                      aria-label="Ver productos"
                    >
                      <motion.span variants={linkVariants}>
                        Productos
                      </motion.span>
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 hidden lg:block" />
                    </Link>
                    {/* Desktop-only mega menu */}
                    <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hidden lg:block">
                      <div className="bg-background border border-border rounded-lg shadow-xl max-w-[90vw] lg:max-w-[800px]">
                        <MegaMenuContent sections={productSections} />
                      </div>
                    </div>
                  </div>

                  {/* Soluciones Mega Menu - Mobile optimized */}
                  <div className="relative group">
                    <Link href="/soluciones"
                      className="px-4 py-2 min-h-[44px] rounded-md bg-transparent hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors flex items-center gap-1 touch-manipulation"
                      aria-label="Ver soluciones"
                    >
                      <motion.span variants={linkVariants}>
                        Soluciones
                      </motion.span>
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 hidden lg:block" />
                    </Link>
                    {/* Desktop-only mega menu */}
                    <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hidden lg:block">
                      <div className="bg-background border border-border rounded-lg shadow-xl max-w-[90vw] lg:max-w-[800px]">
                        <MegaMenuContent sections={solutionSections} />
                      </div>
                    </div>
                  </div>

                  {/* Simple Links */}
                  {NavigationLinks.map((link) => (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        className="px-4 py-2 min-h-[44px] rounded-md bg-transparent hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors flex items-center touch-manipulation"
                      >
                        <motion.span
                          variants={linkVariants}
                          whileHover={{ y: -2 }}
                          className="relative"
                        >
                          {link.label}
                        </motion.span>
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={staggeredLinks}
              animate="animate"
              className="hidden md:flex items-center space-x-3"
            >
              {/* Theme Toggle */}
              <motion.div variants={linkVariants}>
                <ThemeToggle />
              </motion.div>
              <motion.div variants={linkVariants}>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'text-sm font-medium hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full'
                  )}
                >
                  Iniciar sesión
                </Link>
              </motion.div>
              <motion.div variants={linkVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/onboarding"
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'btn-primary rounded-lg shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 min-h-[44px] flex items-center'
                    )}
                    aria-label="Comenzar prueba gratuita"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    Prueba Gratis
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              setAccessibilityState(prev => ({
                ...prev,
                announcements: [...prev.announcements, open ? 'Menú móvil abierto' : 'Menú móvil cerrado']
              }));
            }}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
                  aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                  aria-expanded={isOpen}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 sm:w-96"
              >
                <SheetHeader>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col space-y-2 mt-8"
                  role="navigation"
                  aria-label="Menú móvil"
                >
                  <Link
                    href="/productos"
                    className="px-4 py-3 min-h-[48px] rounded-md hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors flex items-center font-medium touch-manipulation"
                    onClick={() => {
                      setIsOpen(false);
                      setAccessibilityState(prev => ({
                        ...prev,
                        announcements: [...prev.announcements, 'Navegando a Productos']
                      }));
                    }}
                    aria-label="Ver productos disponibles"
                  >
                    Productos
                  </Link>
                  <Link
                    href="/soluciones"
                    className="px-4 py-3 min-h-[48px] rounded-md hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors flex items-center font-medium touch-manipulation"
                    onClick={() => {
                      setIsOpen(false);
                      setAccessibilityState(prev => ({
                        ...prev,
                        announcements: [...prev.announcements, 'Navegando a Soluciones']
                      }));
                    }}
                    aria-label="Ver soluciones disponibles"
                  >
                    Soluciones
                  </Link>
                  {NavigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-4 py-3 min-h-[48px] rounded-md hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors flex items-center touch-manipulation"
                      onClick={() => {
                        setIsOpen(false);
                        setAccessibilityState(prev => ({
                          ...prev,
                          announcements: [...prev.announcements, `Navegando a ${link.label}`]
                        }));
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Theme Toggle for mobile */}
                  <div className="pt-4 flex justify-center">
                    <ThemeToggle />
                  </div>

                  <div className="pt-6 border-t border-border space-y-3" role="group" aria-label="Acciones de cuenta">
                    <Link
                      href="/login"
                      className="block px-4 py-3 min-h-[48px] rounded-md hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors flex items-center touch-manipulation"
                      onClick={() => {
                        setIsOpen(false);
                        setAccessibilityState(prev => ({
                          ...prev,
                          announcements: [...prev.announcements, 'Navegando a iniciar sesión']
                        }));
                      }}
                      aria-label="Iniciar sesión en tu cuenta"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/onboarding"
                      className="block px-4 py-3 min-h-[48px] rounded-md bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 focus:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors font-semibold flex items-center justify-center touch-manipulation"
                      onClick={() => {
                        setIsOpen(false);
                        setAccessibilityState(prev => ({
                          ...prev,
                          announcements: [...prev.announcements, 'Comenzando prueba gratuita']
                        }));
                      }}
                      aria-label="Comenzar prueba gratuita de Caetaria"
                    >
                      Prueba Gratis
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </motion.header>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}

export default ModernNavbar;