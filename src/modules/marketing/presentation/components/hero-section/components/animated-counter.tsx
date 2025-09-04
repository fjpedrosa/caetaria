'use client';

import { useEffect, useRef,useState } from 'react';

import type { AnimatedCounterComponentProps } from '@/modules/marketing/domain/types';

/**
 * Isolated client component for animated number counting
 * Optimized to minimize client-side JavaScript impact
 * Falls back to static number for SSR/SEO
 */
export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  decimals = 0,
  className = ''
}: AnimatedCounterComponentProps) {
  const [count, setCount] = useState(end); // Start with end value for SSR
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!elementRef.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Start from 0 for animation
    setCount(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentCount = end * easeOut;
      setCount(decimals > 0 ?
        parseFloat(currentCount.toFixed(decimals)) :
        Math.floor(currentCount)
      );

      if (progress >= 1) {
        clearInterval(timer);
        setCount(end); // Ensure we end on exact value
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [end, duration, decimals, isVisible]);

  const displayValue = decimals > 0 ?
    count.toFixed(decimals) :
    count.toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {displayValue}{suffix}
    </span>
  );
}