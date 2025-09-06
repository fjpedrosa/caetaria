/**
 * Prefetch Provider for Next.js 15
 *
 * Global provider for smart prefetch system with context management
 * and performance monitoring across the application.
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_PERF_CONSTRAINTS } from './config';
import type {
  PerfMetrics,
  PrefetchContextValue,
  SmartPrefetchHook,
  SmartPrefetchOptions} from './types';
import { useSmartPrefetch } from './use-smart-prefetch';

/**
 * Prefetch Context
 */
const PrefetchContext = createContext<PrefetchContextValue | null>(null);

/**
 * Prefetch Provider Props
 */
interface PrefetchProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Global prefetch options */
  options?: SmartPrefetchOptions;
  /** Enable performance monitoring */
  enableMonitoring?: boolean;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Prefetch Provider Component
 */
export function PrefetchProvider({
  children,
  options: initialOptions = {},
  enableMonitoring = false,
  debug = false
}: PrefetchProviderProps) {
  const [options, setOptions] = useState<SmartPrefetchOptions>({
    ...initialOptions,
    debug: debug || initialOptions.debug
  });

  const hook = useSmartPrefetch(options);
  const [performanceData, setPerformanceData] = useState<PerfMetrics | null>(null);

  /**
   * Update global options
   */
  const updateOptions = useMemo(() => (newOptions: Partial<SmartPrefetchOptions>) => {
    setOptions(prev => ({
      ...prev,
      ...newOptions
    }));
  }, []);

  /**
   * Performance monitoring
   */
  useEffect(() => {
    if (!enableMonitoring) return;

    const interval = setInterval(() => {
      const metrics = hook.getMetrics();
      setPerformanceData(metrics);

      if (debug) {
        console.log('[PrefetchProvider] Performance metrics:', metrics);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enableMonitoring, debug, hook]);

  /**
   * Global error boundary for prefetch failures
   */
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('prefetch')) {
        console.warn('[PrefetchProvider] Global prefetch error:', event.error);

        // Optionally report to analytics
        if (options.analytics) {
          // Analytics reporting logic here
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [options.analytics]);

  /**
   * Context value
   */
  const contextValue = useMemo<PrefetchContextValue>(() => ({
    hook,
    options,
    updateOptions
  }), [hook, options, updateOptions]);

  /**
   * Development tools integration
   */
  useEffect(() => {
    if (debug && typeof window !== 'undefined') {
      // Expose prefetch system to window for debugging
      (window as any).__NEPTUNIK_PREFETCH__ = {
        hook,
        options,
        performanceData,
        clearCache: () => hook.clearCache(),
        getMetrics: () => hook.getMetrics(),
        getCacheEntries: () => hook.getCacheEntries(),
        constraints: hook.constraints
      };
    }
  }, [debug, hook, options, performanceData]);

  return (
    <PrefetchContext.Provider value={contextValue}>
      {children}
      {debug && enableMonitoring && (
        <DebugPanel
          hook={hook}
          performanceData={performanceData}
          options={options}
        />
      )}
    </PrefetchContext.Provider>
  );
}

/**
 * Hook to use prefetch context
 */
export function usePrefetchContext(): PrefetchContextValue {
  const context = useContext(PrefetchContext);

  if (!context) {
    throw new Error('usePrefetchContext must be used within a PrefetchProvider');
  }

  return context;
}

/**
 * Hook to use smart prefetch (with context fallback)
 */
export function usePrefetch(): SmartPrefetchHook {
  const context = useContext(PrefetchContext);
  const fallbackHook = useSmartPrefetch();

  return context?.hook || fallbackHook;
}

/**
 * Debug Panel Component (only rendered in debug mode)
 */
interface DebugPanelProps {
  hook: SmartPrefetchHook;
  performanceData: PerfMetrics | null;
  options: SmartPrefetchOptions;
}

function DebugPanel({ hook, performanceData, options }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheEntries, setCacheEntries] = useState(hook.getCacheEntries());

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheEntries(hook.getCacheEntries());
    }, 1000);

    return () => clearInterval(interval);
  }, [hook]);

  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 10000,
          backgroundColor: '#000',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }}
        onClick={() => setIsOpen(true)}
      >
        🚀 Prefetch Debug
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 10000,
        backgroundColor: '#000',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '400px',
        maxHeight: '500px',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong>🚀 Prefetch Debug Panel</strong>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      {/* System Status */}
      <div style={{ marginBottom: '12px' }}>
        <strong>System Status:</strong>
        <div>Status: {hook.status}</div>
        <div>Ready: {hook.isReady ? '✅' : '❌'}</div>
        <div>Enabled: {options.disabled ? '❌' : '✅'}</div>
      </div>

      {/* Network Info */}
      {hook.networkInfo && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Network:</strong>
          <div>Type: {hook.networkInfo.effectiveType}</div>
          <div>Speed: {hook.networkInfo.downlink} Mbps</div>
          <div>RTT: {hook.networkInfo.rtt}ms</div>
          <div>Save Data: {hook.networkInfo.saveData ? '✅' : '❌'}</div>
        </div>
      )}

      {/* Performance Metrics */}
      {performanceData && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Metrics:</strong>
          <div>Operations: {performanceData.totalOperations}</div>
          <div>Success Rate: {
            performanceData.totalOperations > 0
              ? Math.round((performanceData.successfulOperations / performanceData.totalOperations) * 100)
              : 0
          }%</div>
          <div>Avg Time: {Math.round(performanceData.avgPrefetchTime)}ms</div>
          <div>Cache Hit: {Math.round(performanceData.cacheHitRate * 100)}%</div>
          <div>Memory: {Math.round(performanceData.memoryUsage / 1024)}KB</div>
          <div>Ops/min: {performanceData.opsPerMinute}</div>
        </div>
      )}

      {/* Cache Entries */}
      <div style={{ marginBottom: '12px' }}>
        <strong>Cache ({cacheEntries.length}):</strong>
        <div style={{ maxHeight: '150px', overflow: 'auto', fontSize: '10px' }}>
          {cacheEntries.map((entry, index) => (
            <div key={index} style={{ padding: '2px 0', borderBottom: '1px solid #333' }}>
              <div>URL: {entry.url}</div>
              <div>Age: {Math.round((Date.now() - entry.timestamp) / 1000)}s</div>
              <div>Hits: {entry.accessCount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => hook.clearCache()}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Clear Cache
        </button>
        <button
          onClick={() => hook.setEnabled(!options.disabled)}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          {options.disabled ? 'Enable' : 'Disable'}
        </button>
        <button
          onClick={() => console.log('Prefetch Debug Data:', { hook, performanceData, options })}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Log Data
        </button>
      </div>
    </div>
  );
}