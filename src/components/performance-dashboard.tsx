'use client';

import { useEffect,useState } from 'react';

interface PerformanceMetrics {
  lcp?: { value: number; rating: string };
  fid?: { value: number; rating: string };
  cls?: { value: number; rating: string };
  fcp?: { value: number; rating: string };
  ttfb?: { value: number; rating: string };
  inp?: { value: number; rating: string };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      // Listen for web vitals updates
      const handleMetricUpdate = (event: CustomEvent) => {
        const { name, value, rating } = event.detail;
        setMetrics(prev => ({
          ...prev,
          [name.toLowerCase()]: { value, rating }
        }));
      };

      // Add event listener for custom metrics
      window.addEventListener('web-vital-update', handleMetricUpdate as EventListener);

      return () => {
        window.removeEventListener('web-vital-update', handleMetricUpdate as EventListener);
      };
    }
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatMetric = (value: number, unit: string = 'ms'): string => {
    return `${Math.round(value)}${unit}`;
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const metricDefinitions = {
    lcp: { name: 'Largest Contentful Paint', threshold: { good: 2500, poor: 4000 } },
    fid: { name: 'First Input Delay', threshold: { good: 100, poor: 300 } },
    cls: { name: 'Cumulative Layout Shift', threshold: { good: 0.1, poor: 0.25 } },
    fcp: { name: 'First Contentful Paint', threshold: { good: 1800, poor: 3000 } },
    ttfb: { name: 'Time to First Byte', threshold: { good: 800, poor: 1800 } },
    inp: { name: 'Interaction to Next Paint', threshold: { good: 200, poor: 500 } },
  };

  if (!isVisible && Object.keys(metrics).length === 0) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm ${!isVisible ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(metricDefinitions).map(([key, def]) => {
          const metric = metrics[key as keyof PerformanceMetrics];
          const hasValue = metric && typeof metric.value === 'number';

          return (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 truncate mr-2" title={def.name}>
                {key.toUpperCase()}
              </span>
              {hasValue ? (
                <span className={`text-xs px-2 py-1 rounded-full ${getRatingColor(metric.rating)}`}>
                  {key === 'cls'
                    ? formatMetric(metric.value, '')
                    : formatMetric(metric.value)
                  }
                </span>
              ) : (
                <span className="text-xs text-gray-400">Measuring...</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Good
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            Needs Work
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Poor
          </span>
        </div>
      </div>
    </div>
  );
}