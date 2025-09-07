/**
 * WhatsApp Business API Scenarios
 * Export all conversation scenarios
 */

export { loyaltyProgramScenario } from './loyalty-program';
export { medicalAppointmentScenario } from './medical-appointment';
export { restaurantOrderScenario } from './restaurant-order';
export { restaurantReservationScenario } from './restaurant-reservation';

import { loyaltyProgramScenario } from './loyalty-program';
import { medicalAppointmentScenario } from './medical-appointment';
import { restaurantOrderScenario } from './restaurant-order';
import { restaurantReservationScenario } from './restaurant-reservation';

export const scenarios = {
  'restaurant-reservation': restaurantReservationScenario,
  'restaurant-orders': restaurantOrderScenario,
  'medical-appointments': medicalAppointmentScenario,
  'loyalty-program': loyaltyProgramScenario
};

export type ScenarioId = keyof typeof scenarios;