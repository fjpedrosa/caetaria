/**
 * WhatsApp Simulator Scenarios - Index
 * Export all available conversation scenarios
 */

// Original restaurant reservation scenario
export * from './restaurant-reservation-scenario';

// New Phase 1 scenarios - Quick Wins
export * from './loyalty-program-scenario';
export * from './medical-appointments-scenario';
export * from './restaurant-orders-scenario';

// Scenario selector type and configuration
export interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  vertical: 'universal' | 'restaurant' | 'medical' | 'retail' | 'services';
  roi: {
    metric: string;
    value: string;
    timeline: string;
  };
  hook: {
    emotional: string;
    rational: string;
  };
  scenario: any;
}

/**
 * Available scenarios for demo selector
 */
import loyaltyProgramScenario from './loyalty-program-scenario';
import medicalAppointmentsScenario from './medical-appointments-scenario';
import restaurantOrdersScenario from './restaurant-orders-scenario';
import { restaurantReservationScenario } from './restaurant-reservation-scenario';

export const AVAILABLE_SCENARIOS: Record<string, ScenarioOption> = {
  'loyalty-program': {
    id: 'loyalty-program',
    title: 'Club VIP Automático',
    description: 'Programa de fidelización con reconocimiento visual de tickets',
    vertical: 'universal',
    roi: loyaltyProgramScenario.metadata.roi,
    hook: loyaltyProgramScenario.metadata.hook,
    scenario: loyaltyProgramScenario
  },
  'restaurant-orders': {
    id: 'restaurant-orders',
    title: 'Pedidos Sin Llamadas',
    description: 'Sistema de pedidos automático para restaurantes',
    vertical: 'restaurant',
    roi: restaurantOrdersScenario.metadata.roi,
    hook: restaurantOrdersScenario.metadata.hook,
    scenario: restaurantOrdersScenario
  },
  'medical-appointments': {
    id: 'medical-appointments',
    title: 'Cero No-Shows',
    description: 'Gestión de citas médicas con recordatorios automáticos',
    vertical: 'medical',
    roi: medicalAppointmentsScenario.metadata.roi,
    hook: medicalAppointmentsScenario.metadata.hook,
    scenario: medicalAppointmentsScenario
  },
  'restaurant-reservation': {
    id: 'restaurant-reservation',
    title: 'Reservas de Mesa',
    description: 'Sistema de reservas con WhatsApp Flows',
    vertical: 'restaurant',
    roi: {
      metric: '+40% reservas confirmadas',
      value: '0 comisiones por reserva',
      timeline: 'desde día 1'
    },
    hook: {
      emotional: 'Tu restaurante siempre lleno',
      rational: 'Nunca más pierdes una reserva por teléfono ocupado'
    },
    scenario: restaurantReservationScenario
  }
};

/**
 * Get scenario by vertical preference
 */
export function getScenariosByVertical(vertical: string): ScenarioOption[] {
  return Object.values(AVAILABLE_SCENARIOS).filter(
    scenario => scenario.vertical === vertical || scenario.vertical === 'universal'
  );
}

/**
 * Get primary scenario for each vertical
 */
export function getPrimaryScenarioForVertical(vertical: string): ScenarioOption {
  const scenarios = getScenariosByVertical(vertical);

  // Priority order for each vertical
  const priorities = {
    restaurant: ['restaurant-orders', 'restaurant-reservation'],
    medical: ['medical-appointments'],
    retail: ['loyalty-program'],
    services: ['loyalty-program'],
    universal: ['loyalty-program']
  };

  const verticalPriorities = priorities[vertical as keyof typeof priorities] || priorities.universal;

  for (const scenarioId of verticalPriorities) {
    const scenario = AVAILABLE_SCENARIOS[scenarioId];
    if (scenario) return scenario;
  }

  // Fallback to loyalty program
  return AVAILABLE_SCENARIOS['loyalty-program'];
}
