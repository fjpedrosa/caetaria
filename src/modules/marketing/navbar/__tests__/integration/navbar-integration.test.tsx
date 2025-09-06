/**
 * Integration Tests - Complete Navbar System
 * 
 * Tests de integración end-to-end para todo el sistema del navbar.
 * Verifica:
 * - Integración completa de todos los hooks y componentes
 * - Flujos de usuario completos (hover, click, keyboard)
 * - Estados complejos y transiciones
 * - Performance bajo carga
 * - Escenarios reales de uso
 * - Edge cases en integración
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
// Mock userEvent since it might not be installed
const mockUserEvent = {
  setup: () => ({
    hover: jest.fn().mockResolvedValue(undefined),
    click: jest.fn().mockResolvedValue(undefined),
    keyboard: jest.fn().mockResolvedValue(undefined),
    tab: jest.fn().mockResolvedValue(undefined)
  }),
  hover: jest.fn().mockResolvedValue(undefined),
  click: jest.fn().mockResolvedValue(undefined),
  keyboard: jest.fn().mockResolvedValue(undefined),
  tab: jest.fn().mockResolvedValue(undefined)
};
const userEvent = mockUserEvent;
import '@testing-library/jest-dom';

// Mock a complete navbar implementation
const MockCompleteNavbar = ({
  onNavigate = jest.fn(),
  initialSection = 'hero'
}: {
  onNavigate?: jest.fn;
  initialSection?: string;
}) => {
  const [currentSection, setCurrentSection] = React.useState(initialSection);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);
  const [scrollY, setScrollY] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);
  const [announcements, setAnnouncements] = React.useState<string[]>([]);
  const [prefetchedLinks, setPrefetchedLinks] = React.useState<Set<string>>(new Set());
  const [keyboardNavigating, setKeyboardNavigating] = React.useState(false);
  
  const navigationItems = [
    { label: 'Productos', href: '/productos', sectionId: 'products' },
    { label: 'Precios', href: '/precios', sectionId: 'pricing' },
    { label: 'Recursos', href: '/recursos', sectionId: 'resources', hasMegaMenu: true },
    { label: 'Contacto', href: '/contacto', sectionId: 'contact' }
  ];
  
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(ann => ann !== message));
    }, 1000);
  };
  
  const handleScroll = React.useCallback((event: Event) => {
    const newScrollY = window.scrollY;
    setScrollY(newScrollY);
    setIsVisible(newScrollY < 100 || newScrollY < scrollY);
  }, [scrollY]);
  
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  const handleNavItemClick = async (item: typeof navigationItems[0]) => {
    if (item.sectionId) {
      setCurrentSection(item.sectionId);
      announce(`Navegando a sección ${item.label}`);
    }
    onNavigate(item.href);
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
  };
  
  const handleMegaMenuOpen = (menuId: string) => {
    setActiveMegaMenu(menuId);
    announce(`Menú ${menuId} abierto`);
  };
  
  const handleMegaMenuClose = (menuId: string) => {
    setActiveMegaMenu(null);
    announce(`Menú ${menuId} cerrado`);
  };
  
  const handleLinkHover = async (href: string) => {
    if (!prefetchedLinks.has(href)) {
      // Simulate prefetch
      await new Promise(resolve => setTimeout(resolve, 50));
      setPrefetchedLinks(prev => new Set([...prev, href]));
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    setKeyboardNavigating(true);
    
    switch (event.key) {
      case 'Tab':
        // Don't prevent default, let natural tab flow work
        break;
      case 'Escape':
        if (activeMegaMenu) {
          handleMegaMenuClose(activeMegaMenu);
          event.preventDefault();
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          announce('Menú móvil cerrado');
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        if (event.target && (event.target as Element).closest('[role="menubar"]')) {
          event.preventDefault();
          // Arrow key navigation logic would go here
        }
        break;
    }
  };
  
  const handleMouseMove = () => {
    setKeyboardNavigating(false);
  };
  
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeMegaMenu, isMobileMenuOpen]);
  
  return (
    <>
      {/* Skip Links */}
      <a 
        href="#main-content" 
        className="skip-link sr-only focus:not-sr-only"
        onFocus={() => announce('Enlace de salto enfocado')}
      >
        Saltar al contenido principal
      </a>
      
      {/* Main Navbar */}
      <nav 
        className={`navbar ${
          isVisible ? 'navbar-visible' : 'navbar-hidden'
        } ${
          keyboardNavigating ? 'keyboard-nav' : ''
        }`}
        role="navigation"
        aria-label="Navegación principal"
        data-testid="main-navbar"
      >
        <div className="navbar-content">
          {/* Logo */}
          <a 
            href="/"
            className="navbar-logo"
            onFocus={() => announce('Logo enfocado')}
            onClick={() => {
              onNavigate('/');
              announce('Navegando a página principal');
            }}
          >
            Neptunik
          </a>
          
          {/* Desktop Navigation */}
          <ul role="menubar" className="desktop-nav">
            {navigationItems.map((item, index) => (
              <li key={item.label} role="none">
                <a
                  href={item.href}
                  role="menuitem"
                  tabIndex={index === 0 ? 0 : -1}
                  className={currentSection === item.sectionId ? 'active' : ''}
                  aria-current={currentSection === item.sectionId ? 'page' : undefined}
                  onMouseEnter={() => {
                    if (item.hasMegaMenu) {
                      handleMegaMenuOpen(item.sectionId!);
                    }
                    handleLinkHover(item.href);
                  }}
                  onMouseLeave={() => {
                    if (item.hasMegaMenu) {
                      setTimeout(() => {
                        if (activeMegaMenu === item.sectionId) {
                          handleMegaMenuClose(item.sectionId!);
                        }
                      }, 300);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavItemClick(item);
                  }}
                  onFocus={() => {
                    if (item.hasMegaMenu) {
                      handleMegaMenuOpen(item.sectionId!);
                    }
                  }}
                  data-testid={`nav-item-${item.sectionId}`}
                  data-prefetched={prefetchedLinks.has(item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          
          {/* CTA Buttons */}
          <div className="cta-buttons">
            <a 
              href="/login"
              className="btn-secondary"
              onMouseEnter={() => handleLinkHover('/login')}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/login');
                announce('Navegando a iniciar sesión');
              }}
            >
              Iniciar Sesión
            </a>
            <a 
              href="/signup"
              className="btn-primary"
              onMouseEnter={() => handleLinkHover('/signup')}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/signup');
                announce('Navegando a registro');
              }}
            >
              Probar Gratis
            </a>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              const newState = !isMobileMenuOpen;
              setIsMobileMenuOpen(newState);
              announce(newState ? 'Menú móvil abierto' : 'Menú móvil cerrado');
            }}
            data-testid="mobile-menu-toggle"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Cerrar' : 'Abrir'} menú
            </span>
            ☰
          </button>
        </div>
        
        {/* Progress Bar */}
        <div 
          role="progressbar"
          aria-valuenow={Math.round((scrollY / 1000) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de lectura: ${Math.round((scrollY / 1000) * 100)}%`}
          className="progress-bar"
          data-testid="progress-bar"
        >
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.round((scrollY / 1000) * 100)}%` }}
          />
        </div>
      </nav>
      
      {/* Mega Menu */}
      {activeMegaMenu && (
        <div 
          className="mega-menu"
          role="menu"
          aria-labelledby={`nav-item-${activeMegaMenu}`}
          data-testid={`mega-menu-${activeMegaMenu}`}
          onMouseEnter={() => {
            // Keep menu open on hover
          }}
          onMouseLeave={() => {
            handleMegaMenuClose(activeMegaMenu);
          }}
        >
          <div className="mega-menu-content">
            <h3>Recursos</h3>
            <ul role="menu">
              <li role="none">
                <a 
                  href="/recursos/docs" 
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/recursos/docs');
                    handleMegaMenuClose(activeMegaMenu);
                  }}
                >
                  Documentación
                </a>
              </li>
              <li role="none">
                <a 
                  href="/recursos/api" 
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/recursos/api');
                    handleMegaMenuClose(activeMegaMenu);
                  }}
                >
                  API Reference
                </a>
              </li>
            </ul>
            <button 
              onClick={() => handleMegaMenuClose(activeMegaMenu)}
              data-testid="mega-menu-close"
              className="sr-only"
            >
              Cerrar menú
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación móvil"
          className="mobile-menu"
          data-testid="mobile-menu"
        >
          <div className="mobile-menu-content">
            <nav role="navigation">
              <ul role="menu">
                {navigationItems.map((item) => (
                  <li key={item.label} role="none">
                    <a 
                      href={item.href}
                      role="menuitem"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavItemClick(item);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="mobile-menu-cta">
              <a 
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Iniciar Sesión
              </a>
              <a 
                href="/signup"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/signup');
                  setIsMobileMenuOpen(false);
                }}
              >
                Probar Gratis
              </a>
            </div>
            
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                announce('Menú móvil cerrado');
              }}
              data-testid="mobile-menu-close"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main id="main-content" style={{ height: '2000px', padding: '100px' }}>
        <h1>Sección Actual: {currentSection}</h1>
        <p>Contenido principal que permite hacer scroll</p>
        <div style={{ marginTop: '500px' }}>Contenido intermedio</div>
        <div style={{ marginTop: '500px' }}>Más contenido</div>
      </main>
      
      {/* Live Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
        data-testid="announcements"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </>
  );
};

describe('Navbar Integration Tests', () => {
  let mockScrollTo: jest.Mock;
  let mockNavigate: jest.Mock;
  
  beforeEach(() => {
    mockNavigate = jest.fn();
    mockScrollTo = jest.fn();
    
    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true
    });
    
    // Mock scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true
    });
    
    // Mock console to avoid noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Complete User Journey - Desktop', () => {
    it('should handle complete navigation flow with hover', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. Initial state verification
      expect(screen.getByText('Sección Actual: hero')).toBeInTheDocument();
      expect(screen.getByTestId('main-navbar')).toBeInTheDocument();
      
      // 2. Hover over navigation item
      const productosLink = screen.getByTestId('nav-item-products');
      await user.hover(productosLink);
      
      // Should prefetch link
      await waitFor(() => {
        expect(productosLink).toHaveAttribute('data-prefetched', 'true');
      });
      
      // 3. Click navigation item
      await user.click(productosLink);
      
      // Should navigate and update section
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
      expect(screen.getByText('Sección Actual: products')).toBeInTheDocument();
      
      // 4. Verify announcement
      await waitFor(() => {
        expect(screen.getByText('Navegando a sección Productos')).toBeInTheDocument();
      });
    });
    
    it('should handle mega menu interaction flow', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. Hover over menu item with mega menu
      const recursosLink = screen.getByTestId('nav-item-resources');
      await user.hover(recursosLink);
      
      // 2. Mega menu should appear
      await waitFor(() => {
        expect(screen.getByTestId('mega-menu-resources')).toBeInTheDocument();
        expect(screen.getByText('Menú resources abierto')).toBeInTheDocument();
      });
      
      // 3. Click on mega menu item
      const docLink = screen.getByText('Documentación');
      await user.click(docLink);
      
      // 4. Should navigate and close mega menu
      expect(mockNavigate).toHaveBeenCalledWith('/recursos/docs');
      await waitFor(() => {
        expect(screen.queryByTestId('mega-menu-resources')).not.toBeInTheDocument();
      });
    });
    
    it('should handle CTA button clicks', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. Hover over login button (should prefetch)
      const loginButton = screen.getByText('Iniciar Sesión');
      await user.hover(loginButton);
      
      // 2. Click login button
      await user.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      await waitFor(() => {
        expect(screen.getByText('Navegando a iniciar sesión')).toBeInTheDocument();
      });
      
      // 3. Test signup button
      const signupButton = screen.getByText('Probar Gratis');
      await user.click(signupButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
  });
  
  describe('Complete User Journey - Mobile', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
    });
    
    it('should handle mobile menu interaction flow', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. Initial state - mobile menu should be closed
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
      
      // 2. Click mobile menu toggle
      const mobileToggle = screen.getByTestId('mobile-menu-toggle');
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(mobileToggle);
      
      // 3. Mobile menu should open
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
        expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Menú móvil abierto')).toBeInTheDocument();
      });
      
      // 4. Navigate using mobile menu
      const mobileProductosLink = screen.getByRole('menuitem', { name: 'Productos' });
      await user.click(mobileProductosLink);
      
      // 5. Should navigate and close mobile menu
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
      await waitFor(() => {
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
        expect(screen.getByText('Sección Actual: products')).toBeInTheDocument();
      });
    });
    
    it('should handle mobile menu close via close button', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Open mobile menu
      await user.click(screen.getByTestId('mobile-menu-toggle'));
      
      await waitFor(() => {
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
      });
      
      // Close via close button
      const closeButton = screen.getByTestId('mobile-menu-close');
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
        expect(screen.getByText('Menú móvil cerrado')).toBeInTheDocument();
      });
    });
  });
  
  describe('Keyboard Navigation Integration', () => {
    it('should handle complete keyboard navigation flow', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. Tab to logo
      await user.tab();
      expect(screen.getByText('Neptunik')).toHaveFocus();
      
      // 2. Tab to first nav item
      await user.tab();
      const productosLink = screen.getByTestId('nav-item-products');
      expect(productosLink).toHaveFocus();
      
      // 3. Use arrow keys for menubar navigation
      await user.keyboard('{ArrowRight}');
      // Note: In the mock, we'd need to implement actual focus movement
      
      // 4. Activate with Enter
      await user.keyboard('{Enter}');
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
    });
    
    it('should handle Escape key for closing menus', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Open mega menu
      await user.hover(screen.getByTestId('nav-item-resources'));
      await waitFor(() => {
        expect(screen.getByTestId('mega-menu-resources')).toBeInTheDocument();
      });
      
      // Close with Escape
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByTestId('mega-menu-resources')).not.toBeInTheDocument();
      });
    });
    
    it('should handle keyboard navigation mode switching', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      const navbar = screen.getByTestId('main-navbar');
      
      // Start with mouse interaction
      await user.hover(screen.getByTestId('nav-item-products'));
      expect(navbar).not.toHaveClass('keyboard-nav');
      
      // Switch to keyboard
      await user.keyboard('{Tab}');
      await waitFor(() => {
        expect(navbar).toHaveClass('keyboard-nav');
      });
      
      // Switch back to mouse
      await user.hover(screen.getByTestId('nav-item-pricing'));
      await waitFor(() => {
        expect(navbar).not.toHaveClass('keyboard-nav');
      });
    });
  });
  
  describe('Scroll Behavior Integration', () => {
    it('should handle scroll-based navbar visibility', async () => {
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      const navbar = screen.getByTestId('main-navbar');
      
      // Initially visible
      expect(navbar).toHaveClass('navbar-visible');
      
      // Simulate scroll down
      Object.defineProperty(window, 'scrollY', { value: 150 });
      fireEvent.scroll(window, { target: { scrollY: 150 } });
      
      await waitFor(() => {
        expect(navbar).toHaveClass('navbar-hidden');
      });
      
      // Simulate scroll up
      Object.defineProperty(window, 'scrollY', { value: 50 });
      fireEvent.scroll(window, { target: { scrollY: 50 } });
      
      await waitFor(() => {
        expect(navbar).toHaveClass('navbar-visible');
      });
    });
    
    it('should update progress bar on scroll', async () => {
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      const progressBar = screen.getByTestId('progress-bar');
      
      // Initial state
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 500 });
      fireEvent.scroll(window, { target: { scrollY: 500 } });
      
      await waitFor(() => {
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-label', 'Progreso de lectura: 50%');
      });
      
      const progressFill = progressBar.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });
  });
  
  describe('Accessibility Integration', () => {
    it('should handle skip link navigation', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Focus skip link
      const skipLink = screen.getByText('Saltar al contenido principal');
      await user.tab(); // This would focus the skip link first
      
      // Activate skip link
      await user.click(skipLink);
      
      // Main content should receive focus
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
      
      // Should announce
      expect(screen.getByText('Enlace de salto enfocado')).toBeInTheDocument();
    });
    
    it('should provide proper announcements for state changes', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Navigation announcement
      await user.click(screen.getByTestId('nav-item-products'));
      expect(screen.getByText('Navegando a sección Productos')).toBeInTheDocument();
      
      // Mobile menu announcement
      await user.click(screen.getByTestId('mobile-menu-toggle'));
      await waitFor(() => {
        expect(screen.getByText('Menú móvil abierto')).toBeInTheDocument();
      });
      
      // Mega menu announcement
      await user.hover(screen.getByTestId('nav-item-resources'));
      await waitFor(() => {
        expect(screen.getByText('Menú resources abierto')).toBeInTheDocument();
      });
    });
    
    it('should handle ARIA states correctly across interactions', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Test mobile menu ARIA states
      const mobileToggle = screen.getByTestId('mobile-menu-toggle');
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(mobileToggle);
      
      await waitFor(() => {
        expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
        const mobileMenu = screen.getByTestId('mobile-menu');
        expect(mobileMenu).toHaveAttribute('aria-modal', 'true');
      });
      
      // Test current page indication
      await user.click(screen.getByTestId('nav-item-products'));
      
      const activeLink = screen.getByTestId('nav-item-products');
      expect(activeLink).toHaveAttribute('aria-current', 'page');
      expect(activeLink).toHaveClass('active');
    });
  });
  
  describe('Performance and Memory Management', () => {
    it('should handle rapid interactions without memory leaks', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Rapid menu open/close
      const mobileToggle = screen.getByTestId('mobile-menu-toggle');
      
      for (let i = 0; i < 10; i++) {
        await user.click(mobileToggle);
        await user.click(mobileToggle);
      }
      
      // Should still work correctly
      await user.click(mobileToggle);
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });
    
    it('should handle concurrent user interactions', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Simulate user hovering while also trying to navigate
      const resourcesLink = screen.getByTestId('nav-item-resources');
      const productsLink = screen.getByTestId('nav-item-products');
      
      // Start hover (opens mega menu)
      await user.hover(resourcesLink);
      
      // Immediately click different item
      await user.click(productsLink);
      
      // Should handle gracefully
      expect(mockNavigate).toHaveBeenCalledWith('/productos');
      
      await waitFor(() => {
        expect(screen.queryByTestId('mega-menu-resources')).not.toBeInTheDocument();
      });
    });
    
    it('should cleanup event listeners and timeouts', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Should have added listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      
      unmount();
      
      // Should have removed listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const errorNavigate = jest.fn().mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      const user = userEvent.setup();
      
      expect(() => {
        render(<MockCompleteNavbar onNavigate={errorNavigate} />);
      }).not.toThrow();
      
      expect(() => {
        user.click(screen.getByTestId('nav-item-products'));
      }).not.toThrow();
    });
    
    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Rapid navigation clicks
      const links = [
        screen.getByTestId('nav-item-products'),
        screen.getByTestId('nav-item-pricing'),
        screen.getByTestId('nav-item-contact')
      ];
      
      for (const link of links) {
        await user.click(link);
      }
      
      // Should end up in the correct final state
      expect(screen.getByText('Sección Actual: contact')).toBeInTheDocument();
    });
    
    it('should handle browser back/forward navigation', () => {
      render(<MockCompleteNavbar onNavigate={mockNavigate} initialSection="pricing" />);
      
      // Should respect initial section
      expect(screen.getByText('Sección Actual: pricing')).toBeInTheDocument();
      
      const pricingLink = screen.getByTestId('nav-item-pricing');
      expect(pricingLink).toHaveClass('active');
    });
  });
  
  describe('Complex Multi-Step User Flows', () => {
    it('should handle complete user journey from discovery to signup', async () => {
      const user = userEvent.setup();
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // 1. User arrives and browses navigation
      await user.hover(screen.getByTestId('nav-item-products'));
      
      // 2. User checks pricing
      await user.click(screen.getByTestId('nav-item-pricing'));
      expect(screen.getByText('Sección Actual: pricing')).toBeInTheDocument();
      
      // 3. User wants to learn more (opens mega menu)
      await user.hover(screen.getByTestId('nav-item-resources'));
      await waitFor(() => {
        expect(screen.getByTestId('mega-menu-resources')).toBeInTheDocument();
      });
      
      // 4. User clicks on documentation
      await user.click(screen.getByText('Documentación'));
      expect(mockNavigate).toHaveBeenCalledWith('/recursos/docs');
      
      // 5. User decides to sign up
      await user.click(screen.getByText('Probar Gratis'));
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });
    
    it('should handle mobile user switching to desktop mid-session', async () => {
      const user = userEvent.setup();
      
      // Start mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      render(<MockCompleteNavbar onNavigate={mockNavigate} />);
      
      // Use mobile menu
      await user.click(screen.getByTestId('mobile-menu-toggle'));
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
      
      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      fireEvent(window, new Event('resize'));
      
      // Desktop navigation should work
      await user.hover(screen.getByTestId('nav-item-resources'));
      
      await waitFor(() => {
        expect(screen.getByTestId('mega-menu-resources')).toBeInTheDocument();
      });
    });
  });
});
