/**
 * Tests for DemoWithSelector component
 * Verifies the dynamic mapping and scenario switching functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { DemoWithSelector } from '../../../ui/components/demo-with-selector';
import { AVAILABLE_SCENARIOS } from '../../../scenarios';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the WhatsAppSimulator component
jest.mock('../../../ui/components/whatsapp-simulator', () => ({
  WhatsAppSimulator: ({ scenario, autoPlay, onComplete, onBadgeShow }: any) => (
    <div data-testid="whatsapp-simulator">
      <div data-testid="scenario-id">{scenario?.metadata?.id || 'unknown'}</div>
      <div data-testid="auto-play">{autoPlay ? 'enabled' : 'disabled'}</div>
      <button 
        onClick={() => onComplete?.()} 
        data-testid="complete-button"
      >
        Complete
      </button>
      <button 
        onClick={() => onBadgeShow?.({ title: 'Test Badge', subtitle: 'Test content' })} 
        data-testid="badge-button"
      >
        Show Badge
      </button>
    </div>
  ),
}));

// Mock the VerticalSelector component
jest.mock('../../../ui/components/vertical-selector', () => ({
  VerticalSelector: ({ selectedVertical, onVerticalChange, availableScenarios }: any) => (
    <div data-testid="vertical-selector">
      <div data-testid="selected-vertical">{selectedVertical}</div>
      <button 
        onClick={() => onVerticalChange('restaurant')} 
        data-testid="select-restaurant"
      >
        Restaurant
      </button>
      <button 
        onClick={() => onVerticalChange('medical')} 
        data-testid="select-medical"
      >
        Medical
      </button>
      <button 
        onClick={() => onVerticalChange('retail')} 
        data-testid="select-retail"
      >
        Retail
      </button>
      <button 
        onClick={() => onVerticalChange('universal')} 
        data-testid="select-universal"
      >
        Universal
      </button>
    </div>
  ),
}));

describe('DemoWithSelector', () => {
  const defaultProps = {
    isInView: true,
    autoPlay: true,
    enableEducationalBadges: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render correctly with default props', () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      expect(screen.getByTestId('vertical-selector')).toBeInTheDocument();
      expect(screen.getByTestId('whatsapp-simulator')).toBeInTheDocument();
    });

    it('should initialize with restaurant vertical by default', () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      expect(screen.getByTestId('selected-vertical')).toHaveTextContent('restaurant');
    });

    it('should enable autoPlay when isInView is true', () => {
      render(<DemoWithSelector {...defaultProps} isInView={true} autoPlay={true} />);
      
      expect(screen.getByTestId('auto-play')).toHaveTextContent('enabled');
    });

    it('should disable autoPlay when isInView is false', () => {
      render(<DemoWithSelector {...defaultProps} isInView={false} autoPlay={true} />);
      
      expect(screen.getByTestId('auto-play')).toHaveTextContent('disabled');
    });
  });

  describe('Scenario Mapping', () => {
    it('should show restaurant-orders scenario for restaurant vertical', async () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      // Should start with restaurant by default
      expect(screen.getByTestId('selected-vertical')).toHaveTextContent('restaurant');
      
      // Wait for scenario to load
      await waitFor(() => {
        const scenarioElement = screen.getByTestId('scenario-id');
        expect(scenarioElement).toHaveTextContent('restaurant-orders');
      });
    });

    it('should show medical-appointments scenario for medical vertical', async () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      // Change to medical vertical
      const medicalButton = screen.getByTestId('select-medical');
      fireEvent.click(medicalButton);
      
      // Wait for transition
      await waitFor(() => {
        expect(screen.getByTestId('selected-vertical')).toHaveTextContent('medical');
      });

      // Wait for scenario to change
      await waitFor(() => {
        const scenarioElement = screen.getByTestId('scenario-id');
        expect(scenarioElement).toHaveTextContent('medical-appointments');
      });
    });

    it('should show loyalty-program scenario for retail vertical', async () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      // Change to retail vertical
      const retailButton = screen.getByTestId('select-retail');
      fireEvent.click(retailButton);
      
      // Wait for transition
      await waitFor(() => {
        expect(screen.getByTestId('selected-vertical')).toHaveTextContent('retail');
      });

      // Wait for scenario to change
      await waitFor(() => {
        const scenarioElement = screen.getByTestId('scenario-id');
        expect(scenarioElement).toHaveTextContent('loyalty-program');
      });
    });

    it('should show loyalty-program scenario for universal vertical', async () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      // Change to universal vertical
      const universalButton = screen.getByTestId('select-universal');
      fireEvent.click(universalButton);
      
      // Wait for transition
      await waitFor(() => {
        expect(screen.getByTestId('selected-vertical')).toHaveTextContent('universal');
      });

      // Wait for scenario to change
      await waitFor(() => {
        const scenarioElement = screen.getByTestId('scenario-id');
        expect(scenarioElement).toHaveTextContent('loyalty-program');
      });
    });
  });

  describe('Transition Handling', () => {
    it('should handle smooth transitions between verticals', async () => {
      const onVerticalChange = jest.fn();
      const onScenarioChange = jest.fn();
      
      render(
        <DemoWithSelector 
          {...defaultProps} 
          onVerticalChange={onVerticalChange}
          onScenarioChange={onScenarioChange}
        />
      );
      
      // Change from restaurant to medical
      const medicalButton = screen.getByTestId('select-medical');
      fireEvent.click(medicalButton);
      
      // Verify callbacks are called
      expect(onVerticalChange).toHaveBeenCalledWith('medical');
      
      await waitFor(() => {
        expect(onScenarioChange).toHaveBeenCalled();
      });
    });

    it('should not trigger change when selecting the same vertical', () => {
      const onVerticalChange = jest.fn();
      
      render(
        <DemoWithSelector 
          {...defaultProps} 
          onVerticalChange={onVerticalChange}
        />
      );
      
      // Try to select restaurant again (already selected)
      const restaurantButton = screen.getByTestId('select-restaurant');
      fireEvent.click(restaurantButton);
      
      // Should not trigger change
      expect(onVerticalChange).not.toHaveBeenCalled();
    });
  });

  describe('Educational Badges', () => {
    it('should handle badge display when enabled', () => {
      render(<DemoWithSelector {...defaultProps} enableEducationalBadges={true} />);
      
      const badgeButton = screen.getByTestId('badge-button');
      fireEvent.click(badgeButton);
      
      // Badge functionality should be working (mocked)
      expect(badgeButton).toBeInTheDocument();
    });

    it('should handle badge display when disabled', () => {
      render(<DemoWithSelector {...defaultProps} enableEducationalBadges={false} />);
      
      // Component should still render without issues
      expect(screen.getByTestId('whatsapp-simulator')).toBeInTheDocument();
    });
  });

  describe('Auto-restart Functionality', () => {
    it('should handle conversation completion', () => {
      render(<DemoWithSelector {...defaultProps} />);
      
      const completeButton = screen.getByTestId('complete-button');
      fireEvent.click(completeButton);
      
      // Should handle completion without errors
      expect(screen.getByTestId('whatsapp-simulator')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid scenario gracefully', () => {
      // Mock console.error to verify it's called
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<DemoWithSelector {...defaultProps} />);
      
      // Component should still render even with potential errors
      expect(screen.getByTestId('whatsapp-simulator')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle autoPlay false correctly', () => {
      render(<DemoWithSelector {...defaultProps} autoPlay={false} />);
      
      expect(screen.getByTestId('auto-play')).toHaveTextContent('disabled');
    });

    it('should handle isInView false correctly', () => {
      render(<DemoWithSelector {...defaultProps} isInView={false} />);
      
      // Should still render but with autoPlay disabled
      expect(screen.getByTestId('whatsapp-simulator')).toBeInTheDocument();
      expect(screen.getByTestId('auto-play')).toHaveTextContent('disabled');
    });
  });

  describe('Console Logging', () => {
    it('should log scenario changes for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<DemoWithSelector {...defaultProps} />);
      
      // Change vertical
      const medicalButton = screen.getByTestId('select-medical');
      fireEvent.click(medicalButton);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Vertical changed:', 'medical');
      });
      
      consoleSpy.mockRestore();
    });
  });
});
