'use client';

import { useEffect, useRef, useState } from 'react';

interface UseSeamlessTransitionsOptions {
  threshold?: number; // 0-1, cuándo activar la transición
  rootMargin?: string; // Margen adicional para el observer
  smoothBlending?: boolean; // Activar blending suave entre secciones
}

export const useSeamlessTransitions = ({
  threshold = 0.1,
  rootMargin = '-10% 0px',
  smoothBlending = true
}: UseSeamlessTransitionsOptions = {}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [blendAmount, setBlendAmount] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);

          if (smoothBlending) {
            // Calcular el porcentaje de visibilidad para transiciones suaves
            const ratio = entry.intersectionRatio;
            setBlendAmount(ratio);
          }
        });
      },
      {
        threshold: Array.from({ length: 20 }, (_, i) => i / 20), // Múltiples thresholds para suavidad
        rootMargin
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, smoothBlending]);

  return {
    sectionRef,
    isVisible,
    blendAmount,
    transitionStyles: {
      opacity: smoothBlending ? 0.3 + (blendAmount * 0.7) : 1,
      transform: `translateY(${smoothBlending ? (1 - blendAmount) * 20 : 0}px)`,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  };
};