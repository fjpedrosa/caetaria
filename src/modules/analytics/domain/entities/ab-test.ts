import { Event, createEvent } from './event';
import { EVENT_TYPES } from '../value-objects/event-type';

export interface ABTestConfig {
  id: string;
  name: string;
  variants: ABTestVariant[];
  conversionGoals: string[];
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'paused';
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  description?: string;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  conversionRate: number;
  pValue: number;
  statisticalSignificance: 'high' | 'medium' | 'low' | 'inconclusive';
}

export const createABTestViewEvent = (config: ABTestConfig, selectedVariant: ABTestVariant): Event => {
  return createEvent({
    type: EVENT_TYPES.AB_TEST_VARIANT_VIEWED,
    name: `AB Test: ${config.name} - Variant Viewed`,
    properties: {
      test_id: config.id,
      variant_id: selectedVariant.id,
      variant_name: selectedVariant.name,
      variant_weight: selectedVariant.weight,
    },
    metadata: {
      timestamp: new Date(),
    },
  });
};

export const createABTestConversionEvent = (config: ABTestConfig, selectedVariant: ABTestVariant): Event => {
  return createEvent({
    type: EVENT_TYPES.AB_TEST_CONVERSION,
    name: `AB Test: ${config.name} - Conversion`,
    properties: {
      test_id: config.id,
      variant_id: selectedVariant.id,
      variant_name: selectedVariant.name,
    },
    metadata: {
      timestamp: new Date(),
    },
  });
};

export const calculateABTestResult = (events: Event[], config: ABTestConfig): ABTestResult[] {
  const variantEvents = events.filter(
    event => event.type === EVENT_TYPES.AB_TEST_VARIANT_VIEWED || 
             event.type === EVENT_TYPES.AB_TEST_CONVERSION
  );

  const variantResults = config.variants.map(variant => {
    const viewEvents = variantEvents.filter(
      event => event.properties.variant_id === variant.id && 
               event.type === EVENT_TYPES.AB_TEST_VARIANT_VIEWED
    );

    const conversionEvents = variantEvents.filter(
      event => event.properties.variant_id === variant.id && 
               event.type === EVENT_TYPES.AB_TEST_CONVERSION
    );

    const conversionRate = viewEvents.length > 0 
      ? (conversionEvents.length / viewEvents.length) * 100 
      : 0;

    // Simplified p-value calculation (requires more advanced statistical methods)
    const pValue = calculatePValue(viewEvents.length, conversionEvents.length);

    return {
      testId: config.id,
      variantId: variant.id,
      conversionRate,
      pValue,
      statisticalSignificance: determineStatisticalSignificance(pValue),
    };
  });

  return variantResults;
}

const calculatePValue = (totalViews: number, conversions: number): number => {
  // Simplified p-value estimation
  // In a real-world scenario, use more advanced statistical methods
  return conversions / totalViews;
};

const determineStatisticalSignificance = (pValue: number): ABTestResult['statisticalSignificance'] => {
  if (pValue <= 0.01) return 'high';
  if (pValue <= 0.05) return 'medium';
  if (pValue <= 0.1) return 'low';
  return 'inconclusive';
};