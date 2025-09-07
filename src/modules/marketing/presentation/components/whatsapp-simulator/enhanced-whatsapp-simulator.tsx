/**
 * Enhanced WhatsApp Simulator Container
 * Integrates the new WhatsApp Business API features simulator
 */

'use client';

import React, { useMemo } from 'react';

import { SimulationType } from '@/modules/marketing/domain/types/simulation.types';
import type { ConversationScenario } from '@/modules/marketing/domain/types/whatsapp-features.types';

import { scenarios } from '../../scenarios';

import { WhatsAppSimulator } from './whatsapp-simulator';

interface EnhancedWhatsAppSimulatorProps {
  simulationType: SimulationType;
  isInView?: boolean;
  className?: string;
  onSimulationComplete?: () => void;
}

/**
 * Map simulation types to scenario IDs
 */
const simulationToScenarioMap: Record<SimulationType, string> = {
  'restaurant-reservation': 'restaurant-reservation',
  'restaurant-orders': 'restaurant-orders',
  'medical-appointments': 'medical-appointments',
  'loyalty-program': 'loyalty-program'
};

export function EnhancedWhatsAppSimulator({
  simulationType,
  isInView = true,
  className = '',
  onSimulationComplete
}: EnhancedWhatsAppSimulatorProps) {
  // Get the appropriate scenario
  const scenario = useMemo(() => {
    const scenarioId = simulationToScenarioMap[simulationType];
    return scenarios[scenarioId as keyof typeof scenarios];
  }, [simulationType]);

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Cargando simulación...</div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <WhatsAppSimulator
        scenario={scenario}
        autoPlay={isInView}
        speed={1}
        onScenarioComplete={onSimulationComplete}
      />
    </div>
  );
}