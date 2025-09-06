'use client';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import {
  BarChart3,
  Bot,
  Building2,
  ChevronDown,
  CreditCard,
  FileText,
  HelpCircle,
  Menu,
  MessageCircle,
  Shield,
  Users,
  Zap} from '@/lib/icons';
import { HoverLink, ImmediateLink, SmartLink } from '@/lib/prefetch/smart-link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/modules/shared/presentation/components/theme-toggle';
import { Icon } from '@/modules/shared/presentation/components/ui/icon';
// NavigationMenu temporarily disabled due to TypeScript issues
// import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/presentation/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/modules/shared/presentation/components/ui/sheet';

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

const MegaMenuContent = ({ sections }: { sections: MegaMenuSection[] }) => (
  <div className="grid w-full grid-cols-2 gap-4 p-4">
    {sections.map((section) => (
      <div key={section.title} className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider px-2">
          {section.title}
        </h4>
        <div className="space-y-1">
          {section.items.map((item) => (
            <HoverLink
              key={item.title}
              href={item.href}
              delay={200}
              priority="medium"
              className="group flex items-start gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <Icon
                icon={item.icon}
                size="small"
                iconClassName="text-gray-500 dark:text-gray-500 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  {item.badge && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      • {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </HoverLink>
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

// Throttle utility to prevent excessive updates
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function ModernNavbar({
  variant = 'default',
  showProgress = false,
  hideOnScroll = true,
  className
}: ModernNavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Accessibility state
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    announcements: [],
    focusedElement: null,
    skipLinkVisible: false,
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false
  });

  // Handle scroll events
  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrollValue = window.scrollY;
      const shouldBeScrolled = scrollValue > 50;
      setIsScrolled(shouldBeScrolled);

      // Handle hideOnScroll behavior
      if (hideOnScroll) {
        const lastY = lastScrollYRef.current;
        if (scrollValue > lastY && scrollValue > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollYRef.current = scrollValue;
      }
    }, 50);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hideOnScroll]);

  // Store isOpen in a ref to avoid recreating handleKeyDown
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

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

      // Alt+M to open menu - use ref to get current value
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const currentIsOpen = isOpenRef.current;
        setIsOpen(!currentIsOpen);
        setAccessibilityState(prev => ({
          ...prev,
          announcements: [...prev.announcements, currentIsOpen ? 'Menú cerrado' : 'Menú abierto']
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
  }, []); // Remove isOpen dependency

  return (
    <>
      {/* Skip Navigation Links - WCAG 2.1 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-gray-900 dark:focus:bg-gray-100 focus:text-white dark:focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg transition-all"
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

      <header
        role="banner"
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-colors duration-200',
          isScrolled
            ? 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'
            : variant === 'transparent'
              ? 'bg-transparent'
              : 'bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800',
          !isVisible && hideOnScroll && 'transform -translate-y-full transition-transform duration-150',
          accessibilityState.highContrast && 'border-2 border-gray-900 dark:border-gray-100',
          className
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-6"
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <ImmediateLink
                href="/"
                priority="high"
                className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-offset-2 rounded-lg no-underline"
                aria-label="Neptunik - Ir al inicio"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-gray-100 flex items-center justify-center shadow-md">
                  <Icon icon={MessageCircle} size="medium" iconClassName="text-white dark:text-gray-900" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
                  Neptunik
                </span>
              </ImmediateLink>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6">
                  {/* Productos Mega Menu - Mobile optimized */}
                  <div className="relative group">
                    <ImmediateLink href="/productos"
                      priority="high"
                      className="nav-link text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1 touch-manipulation no-underline focus:outline-none focus:text-primary dark:focus:text-primary py-2"
                      aria-label="Ver productos"
                      data-text="Productos"
                    >
                      <span>
                        Productos
                      </span>
                      <ChevronDown className="w-4 h-4 hidden lg:block" />
                    </ImmediateLink>
                    {/* Desktop-only mega menu */}
                    <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 hidden lg:block">
                      <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-2xl">
                        <MegaMenuContent sections={productSections} />
                      </div>
                    </div>
                  </div>

                  {/* Soluciones Mega Menu - Mobile optimized */}
                  <div className="relative group">
                    <ImmediateLink href="/soluciones"
                      priority="high"
                      className="nav-link text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center gap-1 touch-manipulation no-underline focus:outline-none focus:text-primary dark:focus:text-primary py-2"
                      aria-label="Ver soluciones"
                      data-text="Soluciones"
                    >
                      <span>
                        Soluciones
                      </span>
                      <ChevronDown className="w-4 h-4 hidden lg:block" />
                    </ImmediateLink>
                    {/* Desktop-only mega menu */}
                    <div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 hidden lg:block">
                      <div className="bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl max-w-2xl">
                        <MegaMenuContent sections={solutionSections} />
                      </div>
                    </div>
                  </div>

                  {/* Simple Links */}
                  {NavigationLinks.map((link) => (
                    <div key={link.href}>
                      <SmartLink
                        href={link.href}
                        prefetchStrategy={link.href === '/precios' ? 'immediate' : 'hover'}
                        priority={link.href === '/precios' ? 'high' : 'medium'}
                        className="nav-link text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200 flex items-center touch-manipulation no-underline focus:outline-none focus:text-primary dark:focus:text-primary"
                        data-text={link.label}
                      >
                        <span className="relative">
                          {link.label}
                        </span>
                      </SmartLink>
                    </div>
                  ))}
              </nav>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle */}
              <div>
                <ThemeToggle />
              </div>
              <HoverLink
                href="/login"
                priority="medium"
                delay={150}
                className="nav-link--button text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-medium no-underline transition-colors duration-200"
                data-text="Iniciar sesión"
              >
                Iniciar sesión
              </HoverLink>
              <ImmediateLink
                href="/onboarding"
                priority="high"
                highPriority={true}
                className="nav-link--button bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 no-underline"
                aria-label="Comenzar prueba gratuita"
                data-text="Comenzar Gratis"
              >
                Comenzar Gratis
              </ImmediateLink>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              setAccessibilityState(prev => ({
                ...prev,
                announcements: [...prev.announcements, open ? 'Menú móvil abierto' : 'Menú móvil cerrado']
              }));
            }}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 focus:ring-offset-2 min-h-[44px] min-w-[44px] transition-colors"
                  aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                  aria-expanded={isOpen}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
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
                  <ImmediateLink
                    href="/productos"
                    priority="high"
                    className="px-3 py-2 min-h-[44px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex items-center font-medium touch-manipulation"
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
                  </ImmediateLink>
                  <ImmediateLink
                    href="/soluciones"
                    priority="high"
                    className="px-3 py-2 min-h-[44px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex items-center font-medium touch-manipulation"
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
                  </ImmediateLink>
                  {NavigationLinks.map((link) => (
                    <SmartLink
                      key={link.href}
                      href={link.href}
                      prefetchStrategy={link.href === '/precios' ? 'immediate' : 'viewport'}
                      priority={link.href === '/precios' ? 'high' : 'medium'}
                      className="px-3 py-2 min-h-[44px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex items-center touch-manipulation"
                      onClick={() => {
                        setIsOpen(false);
                        setAccessibilityState(prev => ({
                          ...prev,
                          announcements: [...prev.announcements, `Navegando a ${link.label}`]
                        }));
                      }}
                    >
                      {link.label}
                    </SmartLink>
                  ))}

                  {/* Theme Toggle for mobile */}
                  <div className="pt-4 flex justify-center">
                    <ThemeToggle />
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3" role="group" aria-label="Acciones de cuenta">
                    <HoverLink
                      href="/login"
                      priority="medium"
                      delay={150}
                      className="w-full justify-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200 min-h-[44px] touch-manipulation flex items-center no-underline font-medium"
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
                    </HoverLink>
                    <ImmediateLink
                      href="/onboarding"
                      priority="high"
                      highPriority={true}
                      className="w-full justify-center bg-primary text-primary-foreground px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] touch-manipulation flex items-center no-underline"
                      onClick={() => {
                        setIsOpen(false);
                        setAccessibilityState(prev => ({
                          ...prev,
                          announcements: [...prev.announcements, 'Comenzando prueba gratuita']
                        }));
                      }}
                      aria-label="Comenzar prueba gratuita de Neptunik"
                    >
                      Comenzar Gratis
                    </ImmediateLink>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}

export default ModernNavbar;