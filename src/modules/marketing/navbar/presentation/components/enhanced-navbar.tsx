'use client';

import { useCallback,useEffect, useRef, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { ChevronDown,Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { UserMenu } from '@/components/ui/user-menu';
import { RegionSelector } from '@/modules/marketing/presentation/components/region-selector';
import { ThemeToggle } from '@/modules/shared/presentation/components/theme-toggle';
import { useAuth } from '@/shared/hooks/use-auth';

import { useMultiHoverIntent } from '../../application/hooks/use-hover-intent';
import { useTriangularSafeZone } from '../../application/hooks/use-triangular-safe-zone';
import type { MegaMenuItem } from '../../domain/types/mega-menu.types';
import { megaMenuConfigs } from '../../infrastructure/data/mega-menu-config';

import { MegaMenuBackdrop } from './mega-menu/mega-menu-backdrop';
import { MegaMenuPanel } from './mega-menu/mega-menu-panel';

interface EnhancedNavbarProps {
  className?: string;
  hideOnScroll?: boolean;
  showProgress?: boolean;
}

export function EnhancedNavbar({
  className = '',
  hideOnScroll = true,
  showProgress = false,
}: EnhancedNavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  // Debug logging
  console.log('[Navbar] Auth state:', { isAuthenticated, userEmail: user?.email });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isInMegaMenu, setIsInMegaMenu] = useState(false);
  const lastScrollY = useRef(0);
  const navItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const {
    hoveredId: activeMegaMenuId,
    handleItemEnter,
    handleItemLeave,
    reset: resetHover,
    clearLeaveTimeout,
    clearAllTimeouts,
  } = useMultiHoverIntent<string>({
    enterDelay: 30,   // Even faster opening
    leaveDelay: 800,  // Much more forgiving for leaving
  });

  const { isInSafeZone, updateTriangleZone } = useTriangularSafeZone(activeMegaMenuId);
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Enhanced hover handling with safe zone
  const handleEnhancedItemEnter = useCallback((itemId: string) => {
    // Cancel any pending timeout from the previous menu
    if (activeMegaMenuId && activeMegaMenuId !== itemId) {
      clearLeaveTimeout(activeMegaMenuId);
    }

    // Direct switching without artificial delays
    handleItemEnter(itemId);

    // Update triangle zone after the menu opens
    requestAnimationFrame(() => {
      const itemElement = navItemRefs.current.get(itemId);
      const panelElement = panelRefs.current.get(itemId);
      if (itemElement && panelElement) {
        updateTriangleZone(itemElement, panelElement);
      }
    });
  }, [activeMegaMenuId, handleItemEnter, updateTriangleZone, clearLeaveTimeout]);

  const handleEnhancedItemLeave = useCallback((itemId: string) => {
    // Only trigger leave if really leaving the area
    if (!isInMegaMenu) {
      handleItemLeave(itemId);
    }
  }, [isInMegaMenu, handleItemLeave]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add scrolled class
      setIsScrolled(currentScrollY > 20);

      // Hide/show on scroll
      if (hideOnScroll) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsVisible(false);
          resetHover(); // Close menus when hiding
        } else {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, resetHover]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mega menu panel hover events
  const handleMegaMenuEnter = useCallback(() => {
    setIsInMegaMenu(true);
    // Cancel all pending timeouts when entering the panel
    clearAllTimeouts();
  }, [clearAllTimeouts]);

  const handleMegaMenuLeave = useCallback(() => {
    setIsInMegaMenu(false);
    // Reset the hover state when leaving the panel
    if (activeMegaMenuId) {
      resetHover();
    }
  }, [activeMegaMenuId, resetHover]);

  // Handle mega menu item click
  const handleMegaMenuItemClick = (item: MegaMenuItem) => {
    resetHover();
    router.push(item.href);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Handle user sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, router]);

  // Handle user navigation
  const handleUserNavigate = useCallback((path: string) => {
    router.push(path);
    resetHover();
  }, [router, resetHover]);

  // Navbar animation variants
  const navbarVariants = {
    visible: {
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    hidden: {
      y: '-100%',
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <>
      {/* Backdrop for mega menus - muy sutil */}
      <MegaMenuBackdrop
        isOpen={!!activeMegaMenuId}
        onClick={resetHover}
        blurAmount={0}
        opacity={0.05}
      />

      {/* Main navbar */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        variants={navbarVariants}
        animate={isVisible ? 'visible' : 'hidden'}
        initial="visible"
      >
        <nav
          className={`
            relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
            border-b transition-all duration-300
            ${isScrolled
              ? 'border-gray-200 dark:border-gray-800'
              : 'border-transparent'
            }
          `}
        >
          {/* Progress bar */}
          {showProgress && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}

          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-3 text-gray-900 dark:text-white no-underline hover:no-underline"
                >
                  <img
                    src="/logo-proposals/static/neptune-minimal-refined.svg"
                    alt="Neptunik"
                    className="w-10 h-10"
                  />
                  <span className="text-2xl font-bold tracking-tight no-underline">Neptunik</span>
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden lg:flex lg:items-center lg:gap-1">
                {megaMenuConfigs.map((config) => {
                  const isActive = activeMegaMenuId === config.id;

                  return (
                    <div key={config.id} className="relative">
                      <button
                        ref={(el) => {
                          if (el) navItemRefs.current.set(config.id, el);
                        }}
                        className={`
                          group inline-flex items-center gap-1 px-3 py-2 text-sm font-normal
                          ${isActive
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400'
                          }
                        `}
                        style={{
                          transition: 'color 200ms ease'
                        }}
                        onMouseEnter={() => handleEnhancedItemEnter(config.id)}
                        onMouseLeave={() => handleEnhancedItemLeave(config.id)}
                        onFocus={() => handleEnhancedItemEnter(config.id)}
                        onBlur={() => handleEnhancedItemLeave(config.id)}
                      >
                        <span className="hover:text-gray-900 dark:hover:text-white">{config.trigger}</span>
                        <ChevronDown
                          className="w-3 h-3 text-gray-400"
                          style={{
                            transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 200ms ease'
                          }}
                        />
                      </button>

                      {/* Mega menu panel */}
                      <MegaMenuPanel
                        config={config}
                        isOpen={isActive}
                        onClose={resetHover}
                        onItemClick={handleMegaMenuItemClick}
                        onMouseEnter={handleMegaMenuEnter}
                        onMouseLeave={handleMegaMenuLeave}
                        triggerRef={{ current: navItemRefs.current.get(config.id) || null }}
                        panelRef={(ref) => {
                          if (ref) {
                            panelRefs.current.set(config.id, ref);
                          } else {
                            panelRefs.current.delete(config.id);
                          }
                        }}
                      />
                    </div>
                  );
                })}

                {/* Simple links without mega menu */}
                <Link
                  href="/docs"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Docs
                </Link>
                <Link
                  href="/pricing"
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Precios
                </Link>
              </div>

              {/* CTA buttons */}
              <div className="hidden lg:flex lg:items-center lg:gap-4">
                <RegionSelector variant="navbar" />
                <ThemeToggle />
                {isAuthenticated && user ? (
                  <UserMenu
                    user={{
                      name: user.name,
                      email: user.email,
                      avatar: user.avatar
                    }}
                    onSignOut={handleSignOut}
                    onNavigate={handleUserNavigate}
                    className="ml-2"
                  />
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="group inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                    >
                      <span>Iniciar sesión</span>
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                    <Link
                      href="/signup"
                      className="group inline-flex items-center gap-1 px-4 py-2 text-sm font-medium btn-primary rounded-full transition-all duration-200"
                    >
                      <span>Comenzar gratis</span>
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)]">
                {megaMenuConfigs.map((config) => (
                  <div key={config.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {config.trigger}
                    </h3>
                    <div className="space-y-2">
                      {config.columns.flatMap(column => column.items).map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon && (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: item.iconColor }}
                            >
                              <item.icon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Mobile CTAs */}
                <div className="pt-4 space-y-3">
                  {/* Region Selector for Mobile */}
                  <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                    <RegionSelector variant="settings" />
                  </div>

                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {user.name && (
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                            )}
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block w-full px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block w-full px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block w-full px-5 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full px-5 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="block w-full px-5 py-3 text-center text-sm font-medium btn-primary rounded-lg shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Comenzar gratis →
                      </Link>
                      <Link
                        href="/login"
                        className="block w-full px-5 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}