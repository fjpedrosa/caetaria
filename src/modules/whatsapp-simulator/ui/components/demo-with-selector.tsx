/**
 * Demo with Vertical Selector Component
 * Combines vertical selection with WhatsApp Simulator demos
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  AVAILABLE_SCENARIOS,
  getPrimaryScenarioForVertical,
  ScenarioOption} from '../../scenarios';

import { VerticalSelector } from './vertical-selector';
import { WhatsAppSimulator, WhatsAppSimulatorProps } from './whatsapp-simulator';

interface DemoWithSelectorProps {
  isInView: boolean;
  enableEducationalBadges?: boolean;
  autoPlay?: boolean;
  device?: 'iphone14' | 'android';
  className?: string;
  onScenarioChange?: (scenario: ScenarioOption) => void;
  onVerticalChange?: (vertical: string) => void;
}

export const DemoWithSelector = React.memo<DemoWithSelectorProps>(function DemoWithSelector({
  isInView,
  enableEducationalBadges = true,
  autoPlay = true,
  device = 'iphone14',
  className = '',
  onScenarioChange,
  onVerticalChange
}) {
  const [selectedVertical, setSelectedVertical] = useState<string>('restaurant');
  const [currentScenario, setCurrentScenario] = useState<ScenarioOption>(
    getPrimaryScenarioForVertical('restaurant')
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Optimized vertical selection change with reduced transition time
  const handleVerticalChange = useCallback((vertical: string) => {
    if (vertical === selectedVertical) return;

    setIsTransitioning(true);
    setSelectedVertical(vertical);
    onVerticalChange?.(vertical);

    // Get the best scenario for this vertical
    const newScenario = getPrimaryScenarioForVertical(vertical);

    // Optimized transition with requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        setCurrentScenario(newScenario);
        onScenarioChange?.(newScenario);
        setIsTransitioning(false);
      }, 150); // Reduced from 300ms to 150ms
    });
  }, [selectedVertical, onVerticalChange, onScenarioChange]);

  // Memoized initial scenario to prevent recalculation
  const initialScenario = useMemo(() => {
    return getPrimaryScenarioForVertical(selectedVertical);
  }, [selectedVertical]);
  
  // Initialize with default scenario - optimized
  useEffect(() => {
    setCurrentScenario(initialScenario);
    onScenarioChange?.(initialScenario);
    console.log('[DemoWithSelector] Initialized with scenario:', initialScenario.title);
    console.log('[DemoWithSelector] AutoPlay enabled:', autoPlay, 'IsInView:', isInView);
  }, [initialScenario, onScenarioChange, autoPlay, isInView]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Vertical Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <VerticalSelector
          selectedVertical={selectedVertical}
          onVerticalChange={handleVerticalChange}
          availableScenarios={AVAILABLE_SCENARIOS}
        />
      </motion.div>

      {/* Demo Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="relative"
      >
        {/* Demo Header */}
        <AnimatePresence mode="wait">
          {currentScenario && (
            <motion.div
              key={`${currentScenario.id}-header`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-700 font-medium text-sm">
                  Demo en vivo
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentScenario.title}
              </h3>

              <p className="text-gray-600 text-sm mb-3">
                {currentScenario.description}
              </p>

              {/* ROI Highlight */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  <span className="font-semibold">📈</span>
                  <span className="font-medium">{currentScenario.roi.metric}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                  <span className="font-semibold">💰</span>
                  <span className="font-medium">{currentScenario.roi.value}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                  <span className="font-semibold">⏱️</span>
                  <span className="font-medium">{currentScenario.roi.timeline}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Simulator Container */}
        <div className="relative">
          {/* Optimized transition overlay */}
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
              >
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">Cargando...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optimized WhatsApp Simulator */}
          <AnimatePresence mode="wait">
            {currentScenario && !isTransitioning && (
              <motion.div
                key={`${currentScenario.id}-simulator`}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <WhatsAppSimulator
                  scenario={currentScenario.scenario}
                  device={device}
                  autoPlay={autoPlay !== false ? (isInView !== false) : false}
                  enableEducationalBadges={enableEducationalBadges}
                  onComplete={useCallback(() => {
                    console.log(`[DemoWithSelector] Demo completed: ${currentScenario.title}`);
                  }, [currentScenario.title])}
                  onBadgeShow={useCallback((badge) => {
                    console.log(`[DemoWithSelector] Badge shown: ${badge.title}`);
                  }, [])}
                  className="mx-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demo Footer - Hook Message */}
        <AnimatePresence mode="wait">
          {currentScenario && (
            <motion.div
              key={`${currentScenario.id}-footer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center mt-6"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <span className="font-semibold text-green-900 text-sm">
                    ¿Por qué funciona?
                  </span>
                </div>
                <p className="text-green-800 text-sm leading-relaxed">
                  {currentScenario.hook.emotional}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
});

export default DemoWithSelector;