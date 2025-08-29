'use client';

import { RefObject,useEffect, useState } from 'react';

interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Hook to detect when an element enters the viewport
 */
export function useIntersection(
  elementRef: RefObject<Element>,
  options: IntersectionOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options.threshold, options.rootMargin, options.root]);
  
  return isInView;
}