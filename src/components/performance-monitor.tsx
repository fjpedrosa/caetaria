'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/app/web-vitals';

export function PerformanceMonitor() {
  useEffect(() => {
    // Report web vitals on mount
    reportWebVitals();
  }, []);

  // This component renders nothing but handles performance monitoring
  return null;
}