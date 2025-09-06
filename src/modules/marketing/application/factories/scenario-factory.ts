/**
 * Scenario Factory
 * Lazy loads simulation scenarios for performance optimization
 */

import { BaseScenario } from '@/modules/marketing/domain/scenarios/base-scenario';
import { SimulationType } from '@/modules/marketing/domain/types/simulation.types';

// Lazy load scenarios to reduce initial bundle size
const scenarioLoaders: Record<SimulationType, () => Promise<{ default: new () => BaseScenario }>> = {
  'restaurant-reservation': () => import('@/modules/marketing/domain/scenarios/restaurant-reservation'),
  'restaurant-orders': () => import('@/modules/marketing/domain/scenarios/restaurant-orders'),
  'medical-appointments': () => import('@/modules/marketing/domain/scenarios/medical-appointments'),
  'loyalty-program': () => import('@/modules/marketing/domain/scenarios/loyalty-program')
};

// Cache for loaded scenarios
const scenarioCache = new Map<SimulationType, BaseScenario>();

/**
 * Creates or retrieves a cached scenario instance
 * @param type The type of scenario to create
 * @returns Promise resolving to scenario instance
 */
export async function createScenario(type: SimulationType): Promise<BaseScenario> {
  // Return cached instance if available
  if (scenarioCache.has(type)) {
    return scenarioCache.get(type)!;
  }

  // Load and instantiate the scenario
  const loader = scenarioLoaders[type];
  if (!loader) {
    throw new Error(`Unknown scenario type: ${type}`);
  }

  try {
    const module = await loader();
    const ScenarioClass = module.default;
    const instance = new ScenarioClass();

    // Cache the instance
    scenarioCache.set(type, instance);

    return instance;
  } catch (error) {
    console.error(`Failed to load scenario ${type}:`, error);
    throw new Error(`Failed to load scenario: ${type}`);
  }
}

/**
 * Preloads a scenario for faster access
 * @param type The scenario type to preload
 */
export async function preloadScenario(type: SimulationType): Promise<void> {
  await createScenario(type);
}

/**
 * Preloads all scenarios (useful for production builds)
 */
export async function preloadAllScenarios(): Promise<void> {
  const types = Object.keys(scenarioLoaders) as SimulationType[];
  await Promise.all(types.map(preloadScenario));
}

/**
 * Clears the scenario cache
 */
export function clearScenarioCache(): void {
  scenarioCache.clear();
}