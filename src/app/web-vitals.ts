// Import web vitals with correct API
import { onCLS, onFCP, onINP,onLCP, onTTFB } from 'web-vitals';
// Note: FID has been replaced with INP in web-vitals v4

export function reportWebVitals() {
  try {
    onCLS((metric) => {
      sendToAnalytics(metric);
    });
    
    onFCP((metric) => {
      sendToAnalytics(metric);
    });
    
    onLCP((metric) => {
      sendToAnalytics(metric);
    });
    
    onTTFB((metric) => {
      sendToAnalytics(metric);
    });

    onINP((metric) => {
      sendToAnalytics(metric);
    });
  } catch (err) {
    console.error('Error reporting web vitals:', err);
  }
}

interface WebVital {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

function sendToAnalytics(metric: WebVital) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`);
    
    // Dispatch custom event for development dashboard
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('web-vital-update', {
        detail: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
        }
      }));
    }
  }

  // Send to analytics service
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });

  // Use sendBeacon for reliability, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', body);
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    }).catch(console.error);
  }

  // Also send to Google Analytics if available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
}