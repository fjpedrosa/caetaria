'use client';

/**
 * Skip Links Component - WCAG 2.1 AA Compliant
 *
 * Provides keyboard shortcuts to skip directly to main content and navigation
 * Fully accessible and compliant with WCAG 2.1 AA standards
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface SkipLinksProps {
  mainContentId?: string;
  navigationId?: string;
  footerId?: string;
  className?: string;
  showOnlyMain?: boolean; // Nueva prop para mostrar solo el skip link principal
}

/**
 * Skip links for improved keyboard navigation
 * Appears only when focused via keyboard (Tab key)
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({
  mainContentId = 'main-content',
  navigationId = 'main-navigation',
  footerId = 'footer-content',
  className,
  showOnlyMain = true // Por defecto solo muestra el principal
}) => {
  return (
    <div
      className={cn('skip-links-container', className)}
      role="navigation"
      aria-label="Enlaces de salto"
    >
      {/* Skip to main content - Primary skip link */}
      <a
        href={`#${mainContentId}`}
        className="skip-to-main"
        onClick={(e) => {
          e.preventDefault();
          const element = document.getElementById(mainContentId);
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = 'Navegado al contenido principal';
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
      >
        Saltar al contenido principal
        <span className="sr-only"> (Presiona Enter para activar)</span>
      </a>

      {/* Skip to navigation - Solo si showOnlyMain es false */}
      {!showOnlyMain && (
        <a
          href={`#${navigationId}`}
          className="skip-to-nav"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById(navigationId);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Announce to screen readers
              const announcement = document.createElement('div');
              announcement.setAttribute('role', 'status');
              announcement.setAttribute('aria-live', 'polite');
              announcement.className = 'sr-only';
              announcement.textContent = 'Navegado a la navegación principal';
              document.body.appendChild(announcement);
              setTimeout(() => document.body.removeChild(announcement), 1000);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          Saltar a navegación
          <span className="sr-only"> (Presiona Enter para activar)</span>
        </a>
      )}

      {/* Skip to footer - Solo si showOnlyMain es false */}
      {!showOnlyMain && (
        <a
          href={`#${footerId}`}
          className="skip-to-footer"
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById(footerId);
            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Announce to screen readers
              const announcement = document.createElement('div');
              announcement.setAttribute('role', 'status');
              announcement.setAttribute('aria-live', 'polite');
              announcement.className = 'sr-only';
              announcement.textContent = 'Navegado al pie de página';
              document.body.appendChild(announcement);
              setTimeout(() => document.body.removeChild(announcement), 1000);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
        >
          Saltar al pie de página
          <span className="sr-only"> (Presiona Enter para activar)</span>
        </a>
      )}

      {/* Hidden announcement region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="skip-links-announcements"
      />
    </div>
  );
};

/**
 * Hook para activar skip links programáticamente
 * Incluye atajos de teclado: Alt+S (contenido), Alt+N (navegación), Alt+F (footer)
 */
export const useSkipLinks = () => {
  const skipToMain = React.useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Anunciar a lectores de pantalla
      announceToScreenReader('Navegado al contenido principal');
    }
  }, []);

  const skipToNavigation = React.useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announceToScreenReader('Navegado a la navegación principal');
    }
  }, []);

  const skipToFooter = React.useCallback(() => {
    const footer = document.getElementById('footer-content');
    if (footer) {
      footer.focus();
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      announceToScreenReader('Navegado al pie de página');
    }
  }, []);

  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + S: Saltar al contenido principal
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        skipToMain();
      }
      // Alt + N: Saltar a navegación
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        skipToNavigation();
      }
      // Alt + F: Saltar al footer
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        skipToFooter();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [skipToMain, skipToNavigation, skipToFooter]);

  return {
    skipToMain,
    skipToNavigation,
    skipToFooter
  };
};

/**
 * Función auxiliar para anunciar cambios a lectores de pantalla
 */
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}