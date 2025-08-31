/**
 * Performance-Optimized WhatsApp Simulator Wrapper
 * Integrates all performance optimizations and monitoring
 */

'use client';

import React, { Suspense } from 'react';

import { OptimizedMotion, useReducedMotion } from './optimized-motion';
import { usePerformanceMonitor } from '../hooks/use-performance-monitor';
import { WhatsAppSimulator, WhatsAppSimulatorProps } from './whatsapp-simulator';

interface PerformanceOptimizedSimulatorProps extends WhatsAppSimulatorProps {
  enablePerformanceMonitoring?: boolean;
  adaptiveAnimations?: boolean;
}

/**
 * High-performance wrapper for WhatsApp Simulator
 */
export const PerformanceOptimizedSimulator = React.memo<PerformanceOptimizedSimulatorProps>(
  function PerformanceOptimizedSimulator({
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    adaptiveAnimations = true,
    ...simulatorProps
  }) {
    const { metrics, optimizationHelpers } = usePerformanceMonitor('WhatsAppSimulator', {
      enableMonitoring: enablePerformanceMonitoring
    });
    
    const prefersReducedMotion = useReducedMotion();
    
    // Adaptive performance based on metrics
    const shouldOptimize = adaptiveAnimations && (
      optimizationHelpers.shouldReduceAnimations || prefersReducedMotion
    );
    
    // Performance-aware props
    const optimizedProps: WhatsAppSimulatorProps = {
      ...simulatorProps,
      enableEducationalBadges: shouldOptimize ? false : simulatorProps.enableEducationalBadges,
      className: `${simulatorProps.className || ''} ${shouldOptimize ? 'performance-optimized' : ''}`.trim()
    };
    
    return (
      <OptimizedMotion.SimulatorContainer
        className="performance-wrapper"
        role="region"
        aria-label="WhatsApp Business Simulator Demo"
      >
        <Suspense 
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando simulador optimizado...</p>
              </div>
            </div>
          }
        >
          <WhatsAppSimulator {...optimizedProps} />
        </Suspense>
        
        {/* Performance metrics display in development */}
        {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
            <div>Renders: {metrics.renderCount}</div>
            <div>Avg: {metrics.averageRenderTime.toFixed(1)}ms</div>
            <div>Grade: {optimizationHelpers.getPerformanceGrade()}</div>
            {metrics.memoryUsage && (
              <div>Memory: {(metrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB</div>
            )}
          </div>
        )}
      </OptimizedMotion.SimulatorContainer>
    );
  }
);

export default PerformanceOptimizedSimulator;