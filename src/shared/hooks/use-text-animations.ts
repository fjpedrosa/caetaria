/**
 * Hook para animaciones de texto sin layout shift
 * Previene saltos al cambiar font-weight y gestiona subrayados animados
 */
'use client';

import { useCallback, useEffect, useRef } from 'react';

interface TextAnimationOptions {
  enableUnderline?: boolean;
  fontWeightChange?: boolean;
  duration?: number;
  easing?: string;
}

interface TextAnimationControls {
  // Método principal para configurar un elemento de texto
  setupTextAnimation: (
    element: HTMLElement,
    options?: TextAnimationOptions
  ) => () => void; // Return cleanup function

  // Controles específicos
  enableUnderlineAnimation: (element: HTMLElement) => void;
  enableFontWeightTransition: (element: HTMLElement, text: string) => void;

  // Utilidades
  measureTextWidth: (text: string, font: string) => number;
  preloadFontWeight: (element: HTMLElement, weight: number) => void;
}

/**
 * Mide el ancho del texto para prevenir layout shift
 */
function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
}

/**
 * Extrae propiedades de font del elemento
 */
function getFontProperties(element: HTMLElement): string {
  const style = window.getComputedStyle(element);
  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

export function useTextAnimations(): TextAnimationControls {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef(new Set<HTMLElement>());

  // Configuración principal de animación de texto
  const setupTextAnimation = useCallback((
    element: HTMLElement,
    options: TextAnimationOptions = {}
  ) => {
    const {
      enableUnderline = true,
      fontWeightChange = true,
      duration = 300,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
    } = options;

    const text = element.textContent || element.innerText || '';

    // Configurar font-weight transition sin layout shift
    if (fontWeightChange) {
      enableFontWeightTransition(element, text);
    }

    // Configurar subrayado animado
    if (enableUnderline) {
      enableUnderlineAnimation(element);
    }

    // Agregar clases CSS
    element.classList.add('nav-link');

    // Store text for CSS pseudo-element
    element.setAttribute('data-text', text);

    // Agregar a set para cleanup
    elementsRef.current.add(element);

    // Return cleanup function
    return () => {
      element.classList.remove('nav-link');
      element.removeAttribute('data-text');
      element.style.removeProperty('--text-width-normal');
      element.style.removeProperty('--text-width-bold');
      element.style.removeProperty('--text-width-max');
      element.style.removeProperty('min-width');
      element.style.removeProperty('will-change');
      elementsRef.current.delete(element);
    };
  }, []);

  // Configurar animación de subrayado
  const enableUnderlineAnimation = useCallback((element: HTMLElement) => {
    // El subrayado se maneja principalmente via CSS en navbar-animations.css
    // Este método optimiza el performance con will-change

    const handleMouseEnter = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // CSS ya maneja reduced motion
      }
      // Activar will-change solo durante la animación
      element.style.willChange = 'transform';
    };

    const handleMouseLeave = () => {
      // Limpiar will-change después de la animación
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, 300); // Duración de la animación
    };

    const handleFocus = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      element.style.willChange = 'transform';
    };

    const handleBlur = () => {
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, 300);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Return cleanup
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Configurar transición de font-weight sin layout shift
  const enableFontWeightTransition = useCallback((element: HTMLElement, text: string) => {
    const font = getFontProperties(element);
    const baseFont = font.replace(/^\d+/, '400'); // font-weight normal
    const boldFont = font.replace(/^\d+/, '500'); // font-weight medium

    // Medir anchos con mayor precisión
    const normalWidth = measureTextWidth(text, baseFont);
    const boldWidth = measureTextWidth(text, boldFont);

    // Calcular el ancho máximo para evitar layout shift
    const maxWidth = Math.max(normalWidth, boldWidth);

    // Configurar CSS custom properties
    element.style.setProperty('--text-width-normal', `${normalWidth}px`);
    element.style.setProperty('--text-width-bold', `${boldWidth}px`);
    element.style.setProperty('--text-width-max', `${maxWidth}px`);

    // Aplicar min-width para prevenir saltos
    // Solo si la diferencia es significativa (más de 2px)
    if (boldWidth - normalWidth > 2) {
      element.style.minWidth = `${maxWidth}px`;
    }

    // El pseudo-elemento ya está configurado en CSS
    // Esto asegura que el espacio esté reservado para el texto bold
  }, []);

  // Precargar font-weight para evitar FOUT
  const preloadFontWeight = useCallback((element: HTMLElement, weight: number) => {
    const style = window.getComputedStyle(element);
    const fontFamily = style.fontFamily;

    // Crear elemento invisible para precargar
    const preloader = document.createElement('div');
    preloader.style.position = 'absolute';
    preloader.style.visibility = 'hidden';
    preloader.style.fontFamily = fontFamily;
    preloader.style.fontWeight = weight.toString();
    preloader.textContent = 'preload';

    document.body.appendChild(preloader);

    // Remover después de un frame
    requestAnimationFrame(() => {
      document.body.removeChild(preloader);
    });
  }, []);

  // Intersection Observer para optimizar animaciones fuera de viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            // Elemento visible, activar animaciones
            element.style.removeProperty('pointer-events');
          } else {
            // Elemento no visible, desactivar eventos para performance
            element.style.pointerEvents = 'none';
          }
        });
      },
      {
        rootMargin: '50px', // Activar un poco antes de ser visible
        threshold: 0
      }
    );

    // Observar elementos existentes
    elementsRef.current.forEach(element => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      elementsRef.current.forEach(element => {
        element.classList.remove('nav-link');
        element.removeAttribute('data-text');
        element.style.removeProperty('--text-width-normal');
        element.style.removeProperty('--text-width-bold');
        element.style.removeProperty('--text-width-max');
        element.style.removeProperty('min-width');
        element.style.removeProperty('will-change');
      });

      elementsRef.current.clear();
      observerRef.current?.disconnect();
    };
  }, []);

  return {
    setupTextAnimation,
    enableUnderlineAnimation,
    enableFontWeightTransition,
    measureTextWidth,
    preloadFontWeight
  };
}