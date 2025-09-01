/**
 * Use Cases Simulator Component
 * Wrapper for WhatsApp Simulator used in the Use Cases section
 * Includes contextual narrative and smooth transitions
 */

'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ScenarioOption } from '@/modules/whatsapp-simulator/scenarios';
import { WhatsAppSimulator } from '@/modules/whatsapp-simulator/ui/components/whatsapp-simulator';

interface UseCasesSimulatorProps {
  scenario: ScenarioOption;
  isTransitioning: boolean;
  isInView: boolean;
}

/**
 * Loading skeleton for the simulator
 */
const SimulatorSkeleton = () => (
  <div className="w-full max-w-sm mx-auto">
    <div className="relative">
      {/* iPhone frame skeleton */}
      <div className="w-full aspect-[9/19] bg-gray-200 rounded-[2.5rem] border-8 border-gray-300 animate-pulse">
        <div className="w-full h-full bg-gray-100 rounded-[1.8rem] p-4">
          {/* Status bar */}
          <div className="h-6 bg-gray-300 rounded mb-4"></div>

          {/* Chat header */}
          <div className="h-16 bg-gray-300 rounded-lg mb-4"></div>

          {/* Messages */}
          <div className="space-y-3">
            <div className="h-10 bg-gray-300 rounded-lg w-3/4"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-1/2 ml-auto"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-2/3"></div>
            <div className="h-10 bg-gray-300 rounded-lg w-1/3 ml-auto"></div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-600 font-medium">Cargando simulación...</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Contextual narrative component
 * Shows what capability is being demonstrated
 */
const ContextualNarrative = React.memo<{ scenario: ScenarioOption }>(function ContextualNarrative({ scenario }) {
  const currentCapabilities = useMemo(() => {
    const capabilityMap: Record<string, string[]> = {
      'restaurant-orders': [
        '🤖 Atención automática 24/7',
        '📋 Recolección de pedidos',
        '💳 Procesamiento de pagos',
        '📍 Confirmación de entrega'
      ],
      'medical-appointments': [
        '📅 Gestión automática de citas',
        '⏰ Recordatorios inteligentes',
        '📋 Confirmación de asistencia',
        '🔄 Reprogramación automática'
      ],
      'loyalty-program': [
        '📸 Reconocimiento visual de tickets',
        '🏆 Asignación automática de puntos',
        '🎁 Recompensas personalizadas',
        '📊 Seguimiento de progreso'
      ],
      'restaurant-reservation': [
        '📞 Reservas automáticas',
        '✅ Confirmación instantánea',
        '👥 Gestión de capacidad',
        '⏰ Recordatorios de reserva'
      ]
    };

    return capabilityMap[scenario.id] || ['🚀 Automatización avanzada'];
  }, [scenario.id]);

  return (
    <motion.div
      key={scenario.id}
      className="bg-card border border-border rounded-xl p-6 max-w-md mx-auto lg:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-sm">AI</span>
        </div>
        <h4 className="font-semibold text-foreground">
          Funcionalidades en acción:
        </h4>
      </div>

      <div className="space-y-2">
        {currentCapabilities.map((capability, index) => (
          <motion.div
            key={capability}
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span className="text-muted-foreground">{capability}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground italic">
          "{scenario.hook.emotional}"
        </p>
      </div>
    </motion.div>
  );
});

/**
 * Use Cases Simulator Component
 */
export const UseCasesSimulator = React.memo<UseCasesSimulatorProps>(function UseCasesSimulator({
  scenario,
  isTransitioning,
  isInView
}) {
  const handleComplete = useCallback(() => {
    console.log(`[UseCasesSimulator] Demo completed: ${scenario.title}`);
  }, [scenario.title]);

  const handleBadgeShow = useCallback((badge: any) => {
    console.log(`[UseCasesSimulator] Badge shown: ${badge.title}`);
  }, []);

  return (
    <div className="space-y-8">
      {/* Simulator Header */}
      <motion.div
        className="text-center lg:text-left"
        key={`${scenario.id}-header`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full mb-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-700 font-medium text-sm">
            Simulación en tiempo real
          </span>
        </div>

        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
          {scenario.title}
        </h3>

        <p className="text-muted-foreground lg:text-lg">
          {scenario.description}
        </p>
      </motion.div>

      {/* Simulator Container */}
      <div className="relative">
        {/* Transition overlay */}
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
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-muted-foreground font-medium">
                  Cambiando demostración...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Simulator */}
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={`${scenario.id}-simulator`}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <Suspense fallback={<SimulatorSkeleton />}>
                <div className="w-full max-w-sm">
                  <WhatsAppSimulator
                    scenario={scenario.scenario}
                    device="iphone14"
                    autoPlay={isInView}
                    enableEducationalBadges={true}
                    onComplete={handleComplete}
                    onBadgeShow={handleBadgeShow}
                    className="mx-auto"
                  />
                </div>
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contextual Narrative */}
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <ContextualNarrative scenario={scenario} />
        )}
      </AnimatePresence>
    </div>
  );
});

export default UseCasesSimulator;