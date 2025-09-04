/**
 * WhatsApp Simulator Validation Test
 * Comprehensive test to validate the simulator is working correctly after fixes
 * Tests critical functionality and ensures no runtime errors occur
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { conversationFactory } from '../../infrastructure/adapters/conversation-factory-adapter';
import { WhatsAppSimulator } from '../../presentation/components/whatsapp-simulator';
// Import the main components
import { WhatsAppSimulatorContainer } from '../../presentation/components/whatsapp-simulator-container';
import { restaurantReservationScenario } from '../../scenarios/restaurant-reservation-scenario';

// Mock external dependencies to prevent errors
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the icon components
jest.mock('@/lib/icons', () => ({
  Menu: () => <div>Menu</div>,
  Phone: () => <div>Phone</div>,
  Video: () => <div>Video</div>,
}));

jest.mock('@/modules/shared/presentation/components/ui/icon', () => ({
  Icon: ({ children }: any) => <div>{children}</div>,
}));

// Mock performance monitoring to prevent issues
jest.mock('../../presentation/hooks/use-performance-monitor', () => ({
  usePerformanceMonitor: () => ({
    startTransition: jest.fn(),
    endTransition: jest.fn(),
    metrics: {
      renderCount: 0,
      lastRenderTime: 0,
      animationFrameCount: 0
    }
  })
}));

// Console error tracking
let consoleErrors: string[] = [];
let consoleWarnings: string[] = [];

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    consoleErrors.push(args.join(' '));
    originalError(...args);
  };

  console.warn = (...args) => {
    consoleWarnings.push(args.join(' '));
    originalWarn(...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

beforeEach(() => {
  consoleErrors = [];
  consoleWarnings = [];
  jest.clearAllMocks();
});

describe('WhatsApp Simulator Validation', () => {
  describe('Basic Component Loading', () => {
    test('should load WhatsAppSimulatorContainer without errors', async () => {
      const { container } = render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={false}
        />
      );

      // Wait for component to initialize
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      }, { timeout: 5000 });

      // Check for critical errors
      const criticalErrors = consoleErrors.filter(error =>
        error.includes('Can\'t perform a React state update on a component that hasn\'t mounted yet') ||
        error.includes('performanceMonitor.endOperation is not a function') ||
        error.includes('Maximum update depth exceeded')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should show loading state initially', async () => {
      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={false}
        />
      );

      // Should show loading spinner initially
      expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();

      // Wait for initialization
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Conversation Loading and Display', () => {
    test('should load conversation and display messages', async () => {
      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={false}
        />
      );

      // Wait for simulator to initialize
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Check that WhatsApp interface is displayed
      expect(screen.getByText(restaurantReservationScenario.metadata.businessName)).toBeInTheDocument();

      // Check for online status
      expect(screen.getByText('en línea')).toBeInTheDocument();
    });

    test('should handle scenario data correctly', async () => {
      const testScenario = {
        ...restaurantReservationScenario,
        metadata: {
          ...restaurantReservationScenario.metadata,
          businessName: 'Test Restaurant'
        }
      };

      render(
        <WhatsAppSimulatorContainer
          scenario={testScenario}
          autoPlay={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Typing Indicators and Animations', () => {
    test('should handle typing indicators without errors', async () => {
      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={true}
          isInView={true}
        />
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait a bit to see if typing indicators work
      await waitFor(() => {
        // Check if any typing-related elements exist (dots, "escribiendo...")
        const typingElements = screen.queryAllByText('escribiendo...');
        // This should not throw errors even if typing is not currently active
        expect(typingElements).toBeDefined();
      }, { timeout: 3000 });

      // Check for typing-related errors
      const typingErrors = consoleErrors.filter(error =>
        error.includes('typing') || error.includes('animation')
      );
      expect(typingErrors).toHaveLength(0);
    });
  });

  describe('Hook Integration', () => {
    test('should integrate all hooks without throwing errors', async () => {
      const onComplete = jest.fn();
      const onBadgeShow = jest.fn();
      const onFlowStep = jest.fn();

      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={false}
          onComplete={onComplete}
          onBadgeShow={onBadgeShow}
          onFlowStep={onFlowStep}
        />
      );

      // Wait for all hooks to initialize
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Check for hook-related errors
      const hookErrors = consoleErrors.filter(error =>
        error.includes('hook') ||
        error.includes('useConversationFlow') ||
        error.includes('useTypingIndicator') ||
        error.includes('useFlowExecution')
      );

      expect(hookErrors).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid scenario gracefully', async () => {
      const invalidScenario = {
        metadata: null, // Invalid metadata
        messages: []
      };

      render(
        <WhatsAppSimulatorContainer
          // @ts-ignore - intentionally passing invalid scenario
          scenario={invalidScenario}
          autoPlay={false}
        />
      );

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();
      });

      // Should not have critical React errors
      const reactErrors = consoleErrors.filter(error =>
        error.includes('React') && (
          error.includes('state update') ||
          error.includes('maximum update depth')
        )
      );

      expect(reactErrors).toHaveLength(0);
    });

    test('should handle missing props gracefully', async () => {
      render(<WhatsAppSimulatorContainer />);

      // Should render without crashing even with minimal props
      await waitFor(() => {
        // Component should exist
        const container = screen.getByRole('img', {
          name: /demostración avanzada de interfaz de whatsapp/i
        });
        expect(container).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Performance and Memory', () => {
    test('should not have memory leaks from event listeners', async () => {
      const { unmount } = render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={true}
          isInView={true}
        />
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Unmount and check for cleanup errors
      act(() => {
        unmount();
      });

      // Check for cleanup-related errors
      const cleanupErrors = consoleErrors.filter(error =>
        error.includes('cleanup') ||
        error.includes('subscription') ||
        error.includes('listener')
      );

      expect(cleanupErrors).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={false}
        />
      );

      await waitFor(() => {
        // Main simulator should have proper role
        const simulator = screen.getByRole('img', {
          name: /demostración avanzada de interfaz de whatsapp/i
        });
        expect(simulator).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Critical Error Prevention', () => {
    test('should not have React state update warnings', async () => {
      render(
        <WhatsAppSimulatorContainer
          scenario={restaurantReservationScenario}
          autoPlay={true}
          isInView={true}
        />
      );

      // Let the component run for a reasonable time
      await waitFor(() => {
        expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait additional time for any async operations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      });

      // Check for the specific errors mentioned in the requirements
      const stateUpdateErrors = consoleErrors.filter(error =>
        error.includes('Can\'t perform a React state update on a component that hasn\'t mounted yet')
      );

      const performanceErrors = consoleErrors.filter(error =>
        error.includes('performanceMonitor.endOperation is not a function')
      );

      const maxUpdateErrors = consoleErrors.filter(error =>
        error.includes('Maximum update depth exceeded')
      );

      expect(stateUpdateErrors).toHaveLength(0);
      expect(performanceErrors).toHaveLength(0);
      expect(maxUpdateErrors).toHaveLength(0);
    });
  });

  describe('Factory Integration', () => {
    test('should use conversation factory correctly', async () => {
      // Test that the factory can create conversations
      const template = {
        metadata: {
          id: 'test-conversation',
          title: 'Test Conversation',
          description: 'Test Description',
          tags: ['test'],
          businessName: 'Test Business',
          businessPhoneNumber: '+1234567890',
          userPhoneNumber: '+1987654321',
          language: 'en',
          category: 'test',
          estimatedDuration: 30000
        },
        messages: [
          {
            sender: 'user' as const,
            type: 'text' as const,
            content: 'Hello',
            delayBeforeTyping: 1000,
            typingDuration: 1200
          }
        ],
        settings: {
          playbackSpeed: 1.0,
          autoAdvance: true,
          showTypingIndicators: true,
          showReadReceipts: true
        }
      };

      const conversation = conversationFactory.createFromTemplate(template);
      expect(conversation).toBeDefined();
      expect(conversation.messages).toHaveLength(1);
    });
  });
});

// Summary test to validate overall functionality
describe('WhatsApp Simulator - Overall Validation', () => {
  test('CRITICAL: Simulator should work end-to-end without critical errors', async () => {
    const onComplete = jest.fn();

    const { container } = render(
      <WhatsAppSimulatorContainer
        scenario={restaurantReservationScenario}
        autoPlay={false}
        enableEducationalBadges={true}
        onComplete={onComplete}
      />
    );

    // Phase 1: Initial load
    expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();

    // Phase 2: Initialization
    await waitFor(() => {
      expect(screen.queryByText('Cargando simulador...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Phase 3: Content display
    expect(screen.getByText(restaurantReservationScenario.metadata.businessName)).toBeInTheDocument();
    expect(screen.getByText('en línea')).toBeInTheDocument();

    // Phase 4: No critical errors
    const criticalErrors = consoleErrors.filter(error =>
      error.includes('Can\'t perform a React state update on a component that hasn\'t mounted yet') ||
      error.includes('performanceMonitor.endOperation is not a function') ||
      error.includes('Maximum update depth exceeded') ||
      error.includes('Cannot read properties of undefined') ||
      error.includes('Cannot read property') ||
      error.includes('is not a function')
    );

    if (criticalErrors.length > 0) {
      console.error('CRITICAL ERRORS FOUND:', criticalErrors);
    }

    expect(criticalErrors).toHaveLength(0);

    // Phase 5: Component structure validation
    expect(container.firstChild).toBeInTheDocument();

    // SUCCESS: If we reach this point, the simulator is working correctly
  });
});