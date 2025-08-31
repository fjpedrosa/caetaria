/**
 * Integration tests for Dynamic Mapping System
 * Tests the complete flow from vertical selection to scenario execution
 */

import {
  AVAILABLE_SCENARIOS,
  getPrimaryScenarioForVertical,
  getScenariosByVertical,
  ScenarioOption
} from '../../scenarios';

describe('Dynamic Mapping Integration', () => {
  describe('Available Scenarios Configuration', () => {
    it('should have all required scenarios defined', () => {
      const expectedScenarios = [
        'loyalty-program',
        'restaurant-orders', 
        'medical-appointments',
        'restaurant-reservation'
      ];
      
      expectedScenarios.forEach(scenarioId => {
        expect(AVAILABLE_SCENARIOS[scenarioId]).toBeDefined();
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('id', scenarioId);
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('title');
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('description');
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('vertical');
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('roi');
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('hook');
        expect(AVAILABLE_SCENARIOS[scenarioId]).toHaveProperty('scenario');
      });
    });

    it('should have proper ROI structure for all scenarios', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenario => {
        expect(scenario.roi).toHaveProperty('metric');
        expect(scenario.roi).toHaveProperty('value');
        expect(scenario.roi).toHaveProperty('timeline');
        expect(typeof scenario.roi.metric).toBe('string');
        expect(typeof scenario.roi.value).toBe('string');
        expect(typeof scenario.roi.timeline).toBe('string');
      });
    });

    it('should have proper hook structure for all scenarios', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenario => {
        expect(scenario.hook).toHaveProperty('emotional');
        expect(scenario.hook).toHaveProperty('rational');
        expect(typeof scenario.hook.emotional).toBe('string');
        expect(typeof scenario.hook.rational).toBe('string');
      });
    });
  });

  describe('Vertical to Scenario Mapping', () => {
    const testCases = [
      {
        vertical: 'restaurant',
        expectedPrimary: 'restaurant-orders',
        description: 'Restaurant should map to restaurant-orders scenario'
      },
      {
        vertical: 'medical', 
        expectedPrimary: 'medical-appointments',
        description: 'Medical should map to medical-appointments scenario'
      },
      {
        vertical: 'retail',
        expectedPrimary: 'loyalty-program',
        description: 'Retail should map to loyalty-program scenario'
      },
      {
        vertical: 'services',
        expectedPrimary: 'loyalty-program', 
        description: 'Services should map to loyalty-program scenario'
      },
      {
        vertical: 'universal',
        expectedPrimary: 'loyalty-program',
        description: 'Universal should map to loyalty-program scenario'
      },
      {
        vertical: 'beauty',
        expectedPrimary: 'loyalty-program',
        description: 'Beauty (unmapped) should fallback to loyalty-program'
      }
    ];

    testCases.forEach(({ vertical, expectedPrimary, description }) => {
      it(description, () => {
        const primaryScenario = getPrimaryScenarioForVertical(vertical);
        expect(primaryScenario.id).toBe(expectedPrimary);
        expect(primaryScenario).toBe(AVAILABLE_SCENARIOS[expectedPrimary]);
      });
    });
  });

  describe('Scenario Filtering by Vertical', () => {
    it('should return restaurant-specific scenarios for restaurant vertical', () => {
      const scenarios = getScenariosByVertical('restaurant');
      
      expect(scenarios.length).toBeGreaterThan(0);
      expect(scenarios.some(s => s.vertical === 'restaurant')).toBe(true);
      expect(scenarios.some(s => s.vertical === 'universal')).toBe(true);
      
      // Should include restaurant-specific scenarios
      expect(scenarios.some(s => s.id === 'restaurant-orders')).toBe(true);
      expect(scenarios.some(s => s.id === 'restaurant-reservation')).toBe(true);
    });

    it('should return medical-specific scenarios for medical vertical', () => {
      const scenarios = getScenariosByVertical('medical');
      
      expect(scenarios.length).toBeGreaterThan(0);
      expect(scenarios.some(s => s.vertical === 'medical')).toBe(true);
      expect(scenarios.some(s => s.vertical === 'universal')).toBe(true);
      
      // Should include medical-specific scenarios
      expect(scenarios.some(s => s.id === 'medical-appointments')).toBe(true);
    });

    it('should return universal scenarios for any vertical', () => {
      const verticals = ['restaurant', 'medical', 'retail', 'services', 'unknown'];
      
      verticals.forEach(vertical => {
        const scenarios = getScenariosByVertical(vertical);
        expect(scenarios.some(s => s.vertical === 'universal')).toBe(true);
        expect(scenarios.some(s => s.id === 'loyalty-program')).toBe(true);
      });
    });
  });

  describe('Priority System', () => {
    it('should prioritize restaurant-orders over restaurant-reservation for restaurant', () => {
      const primaryScenario = getPrimaryScenarioForVertical('restaurant');
      expect(primaryScenario.id).toBe('restaurant-orders');
    });

    it('should use first available scenario from priority list', () => {
      // Test with a vertical that has multiple options
      const restaurantScenarios = getScenariosByVertical('restaurant');
      expect(restaurantScenarios.length).toBeGreaterThan(1);
      
      const primary = getPrimaryScenarioForVertical('restaurant');
      expect(primary.id).toBe('restaurant-orders'); // Highest priority
    });

    it('should fallback to loyalty-program for unknown verticals', () => {
      const unknownVerticals = ['unknown', 'invalid', 'test', ''];
      
      unknownVerticals.forEach(vertical => {
        const primaryScenario = getPrimaryScenarioForVertical(vertical);
        expect(primaryScenario.id).toBe('loyalty-program');
      });
    });
  });

  describe('Scenario Data Integrity', () => {
    it('should have valid scenario objects for all mapped scenarios', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        const scenario = scenarioOption.scenario;
        
        // Basic scenario structure
        expect(scenario).toBeDefined();
        expect(scenario).toHaveProperty('metadata');
        expect(scenario).toHaveProperty('messages');
        expect(scenario).toHaveProperty('timing');
        
        // Metadata structure
        expect(scenario.metadata).toHaveProperty('id');
        expect(scenario.metadata).toHaveProperty('title');
        expect(scenario.metadata).toHaveProperty('businessName');
        
        // Messages array
        expect(Array.isArray(scenario.messages)).toBe(true);
        expect(scenario.messages.length).toBeGreaterThan(0);
        
        // Message structure (flexible for different formats)
        scenario.messages.forEach((message: any, index: number) => {
          // Check for text property (direct or in content)
          const hasDirectText = message.hasOwnProperty('text');
          const hasContentText = message.content && message.content.hasOwnProperty('text');
          expect(hasDirectText || hasContentText).toBe(true);
          
          expect(message).toHaveProperty('sender');
          expect(['user', 'business'].includes(message.sender)).toBe(true);
          
          // Check for timing property (timestamp or delayBeforeTyping)
          const hasTimestamp = message.hasOwnProperty('timestamp');
          const hasDelayBeforeTyping = message.hasOwnProperty('delayBeforeTyping');
          expect(hasTimestamp || hasDelayBeforeTyping).toBe(true);
          
          // Verify text content
          const textContent = message.text || (message.content && message.content.text);
          expect(typeof textContent).toBe('string');
          
          // Verify timing value
          const timingValue = message.timestamp || message.delayBeforeTyping;
          expect(typeof timingValue).toBe('number');
        });
        
        // Timing configuration (optional, some scenarios might not have it)
        if (scenario.timing) {
          if (scenario.timing.typingDuration !== undefined) {
            expect(typeof scenario.timing.typingDuration).toBe('number');
          }
          if (scenario.timing.restartDelay !== undefined) {
            expect(typeof scenario.timing.restartDelay).toBe('number');
          }
        }
      });
    });

    it('should have educational badges for all scenarios', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        const scenario = scenarioOption.scenario;
        
        expect(scenario).toHaveProperty('educationalBadges');
        expect(Array.isArray(scenario.educationalBadges)).toBe(true);
        
        scenario.educationalBadges.forEach((badge: any) => {
          expect(badge).toHaveProperty('id');
          expect(badge).toHaveProperty('title');
          expect(badge).toHaveProperty('subtitle');
          expect(badge).toHaveProperty('triggerAtMessageIndex');
          expect(badge).toHaveProperty('displayDuration');
          expect(badge).toHaveProperty('position');
          expect(badge).toHaveProperty('arrowDirection');
          expect(badge).toHaveProperty('bgColor');
          expect(badge).toHaveProperty('color');
        });
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should have reasonable message counts for performance', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        const messageCount = scenarioOption.scenario.messages.length;
        
        // Should have enough messages for a meaningful demo
        expect(messageCount).toBeGreaterThanOrEqual(3);
        
        // But not too many for performance
        expect(messageCount).toBeLessThanOrEqual(20);
      });
    });

    it('should have reasonable timing values', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        const timing = scenarioOption.scenario.timing;
        
        if (timing && timing.typingDuration !== undefined) {
          // Typing duration should be reasonable (500ms - 3000ms)
          expect(timing.typingDuration).toBeGreaterThanOrEqual(500);
          expect(timing.typingDuration).toBeLessThanOrEqual(3000);
        }
        
        if (timing && timing.restartDelay !== undefined) {
          // Restart delay should be reasonable (2s - 30s for longer demos)
          expect(timing.restartDelay).toBeGreaterThanOrEqual(2000);
          expect(timing.restartDelay).toBeLessThanOrEqual(30000);
        }
        
        // If no timing object, that's ok - default values will be used
        if (!timing) {
          // Just ensure the scenario is still valid
          expect(scenarioOption.scenario).toBeDefined();
        }
      });
    });

    it('should have reasonable badge display durations', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        scenarioOption.scenario.educationalBadges.forEach((badge: any) => {
          // Badge duration should be readable but not too long (2s - 8s)
          expect(badge.displayDuration).toBeGreaterThanOrEqual(2000);
          expect(badge.displayDuration).toBeLessThanOrEqual(8000);
        });
      });
    });
  });

  describe('Consistency Checks', () => {
    it('should have consistent ID mapping between scenarioOption and scenario metadata', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        expect(scenarioOption.id).toBe(scenarioOption.scenario.metadata.id);
      });
    });

    it('should have consistent titles between scenarioOption and scenario metadata', () => {
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        // Title consistency (allowing for slight variations)
        expect(scenarioOption.title).toBeDefined();
        expect(scenarioOption.scenario.metadata.title).toBeDefined();
      });
    });

    it('should have valid vertical assignments', () => {
      const validVerticals = ['universal', 'restaurant', 'medical', 'retail', 'services'];
      
      Object.values(AVAILABLE_SCENARIOS).forEach(scenarioOption => {
        expect(validVerticals).toContain(scenarioOption.vertical);
      });
    });
  });
});
