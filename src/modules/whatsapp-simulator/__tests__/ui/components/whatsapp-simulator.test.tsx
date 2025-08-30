/**
 * WhatsAppSimulator Component Tests
 * Tests for the main WhatsApp simulator component with educational badges
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatsAppSimulator } from '../../../ui/components/whatsapp-simulator';
import { restaurantReservationScenario } from '../../../scenarios/restaurant-reservation-scenario';
import * as conversationFlowHook from '../../../ui/hooks/use-conversation-flow';
import * as typingIndicatorHook from '../../../ui/hooks/use-typing-indicator';
import * as flowExecutionHook from '../../../ui/hooks/use-flow-execution';

// Mock the hooks
jest.mock('../../../ui/hooks/use-conversation-flow');
jest.mock('../../../ui/hooks/use-typing-indicator');
jest.mock('../../../ui/hooks/use-flow-execution');

// Mock framer-motion for consistent testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('WhatsAppSimulator', () => {
  const mockConversationFlow = {
    state: {
      messages: [],
      currentMessageIndex: 0,
      isPlaying: false,
      isLoading: false,
      conversation: null,
    },
    actions: {
      loadConversation: jest.fn().mockResolvedValue(true),
      play: jest.fn(),
      pause: jest.fn(),
      reset: jest.fn(),
    },
    events$: {
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    },
  };

  const mockTypingIndicator = {
    state: {
      isAnyoneTyping: false,
      activeTypingUsers: [],
    },
  };

  const mockFlowExecution = {
    state: {
      activeFlow: null,
      isExecuting: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockConversationFlow);
    (typingIndicatorHook.useTypingIndicatorWithEvents as jest.Mock).mockReturnValue(mockTypingIndicator);
    (flowExecutionHook.useFlowExecutionWithEvents as jest.Mock).mockReturnValue(mockFlowExecution);
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      render(<WhatsAppSimulator />);
      
      expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('animate-spin');
    });

    it('should render WhatsApp interface after initialization', async () => {
      const { rerender } = render(<WhatsAppSimulator />);
      
      // Simulate initialization completion
      const mockInitializedFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: {
            metadata: {
              businessName: 'Test Restaurant',
            },
            messages: [
              {
                id: 'msg-1',
                sender: 'user',
                getDisplayText: () => 'Hello',
                status: 'sent',
              },
            ],
          },
          messages: [
            {
              id: 'msg-1',
              sender: 'user',
              getDisplayText: () => 'Hello',
              status: 'sent',
            },
          ],
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockInitializedFlow);
      
      rerender(<WhatsAppSimulator />);

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('en línea')).toBeInTheDocument();
      });
    });

    it('should render iPhone 14 device frame', async () => {
      const mockInitializedFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockInitializedFlow);
      
      render(<WhatsAppSimulator device="iphone14" />);

      await waitFor(() => {
        const frame = screen.getByRole('img', { 
          name: /demostración avanzada de interfaz de whatsapp/i 
        });
        expect(frame).toBeInTheDocument();
      });
    });
  });

  describe('Educational Badges', () => {
    it('should show educational badge when enabled', async () => {
      const mockFlowWithEvents = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          currentMessageIndex: 1,
        },
        events$: {
          subscribe: jest.fn((callback) => {
            // Simulate message sent event that triggers badge
            setTimeout(() => {
              callback({
                type: 'message.sent',
                payload: { messageIndex: 1 },
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithEvents);

      render(
        <WhatsAppSimulator 
          enableEducationalBadges={true}
          scenario={{
            ...restaurantReservationScenario,
            educationalBadges: [
              {
                id: 'ai',
                title: 'IA Inteligente',
                subtitle: 'Respuestas automáticas',
                triggerAtMessageIndex: 1,
                displayDuration: 3000,
                position: { top: '20px', left: '20px' },
                bgColor: 'bg-blue-500',
                color: 'text-white',
                arrowDirection: 'down',
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('IA Inteligente')).toBeInTheDocument();
        expect(screen.getByText('Respuestas automáticas')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should not show badges when disabled', async () => {
      const mockFlowWithEvents = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
        events$: {
          subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithEvents);

      render(<WhatsAppSimulator enableEducationalBadges={false} />);

      await waitFor(() => {
        expect(screen.queryByText('IA Inteligente')).not.toBeInTheDocument();
      });
    });

    it('should call onBadgeShow callback when badge is displayed', async () => {
      const onBadgeShow = jest.fn();
      
      const mockFlowWithEvents = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          currentMessageIndex: 1,
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'message.sent',
                payload: { messageIndex: 1 },
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithEvents);

      render(
        <WhatsAppSimulator 
          enableEducationalBadges={true}
          onBadgeShow={onBadgeShow}
          scenario={{
            ...restaurantReservationScenario,
            educationalBadges: [
              {
                id: 'ai',
                title: 'IA Inteligente',
                subtitle: 'Test',
                triggerAtMessageIndex: 1,
                displayDuration: 1000,
                position: {},
                bgColor: 'bg-blue-500',
                color: 'text-white',
                arrowDirection: 'down',
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(onBadgeShow).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('WhatsApp Flow Integration', () => {
    it('should show flow panel when flow is triggered', async () => {
      const mockFlowWithFlowTrigger = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          currentMessageIndex: 2,
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'message.sent',
                payload: { messageIndex: 2 },
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithFlowTrigger);

      render(
        <WhatsAppSimulator 
          scenario={{
            ...restaurantReservationScenario,
            messages: [
              ...restaurantReservationScenario.messages.slice(0, 2),
              {
                ...restaurantReservationScenario.messages[2],
                flowTrigger: true,
              },
            ],
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Reserva tu mesa')).toBeInTheDocument();
        expect(screen.getByText('¿Cuántas personas?')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should progress through flow steps automatically', async () => {
      jest.useFakeTimers();
      
      const mockFlowWithFlowTrigger = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          currentMessageIndex: 2,
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'message.sent',
                payload: { messageIndex: 2 },
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithFlowTrigger);

      render(
        <WhatsAppSimulator 
          scenario={{
            ...restaurantReservationScenario,
            messages: [
              ...restaurantReservationScenario.messages.slice(0, 2),
              {
                ...restaurantReservationScenario.messages[2],
                flowTrigger: true,
              },
            ],
          }}
        />
      );

      // Wait for flow to appear
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('¿Cuántas personas?')).toBeInTheDocument();
      });

      // Advance to date selection
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      await waitFor(() => {
        expect(screen.getByText('¿Qué día prefieres?')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should call onFlowStep callback during flow progression', async () => {
      jest.useFakeTimers();
      const onFlowStep = jest.fn();
      
      const mockFlowWithFlowTrigger = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          currentMessageIndex: 2,
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'message.sent',
                payload: { messageIndex: 2 },
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithFlowTrigger);

      render(
        <WhatsAppSimulator 
          onFlowStep={onFlowStep}
          scenario={{
            ...restaurantReservationScenario,
            messages: [
              ...restaurantReservationScenario.messages.slice(0, 2),
              {
                ...restaurantReservationScenario.messages[2],
                flowTrigger: true,
              },
            ],
          }}
        />
      );

      act(() => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(onFlowStep).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Auto-play Functionality', () => {
    it('should auto-play when autoPlay is enabled', async () => {
      const mockAutoPlayFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockAutoPlayFlow);

      render(<WhatsAppSimulator autoPlay={true} />);

      await waitFor(() => {
        expect(mockAutoPlayFlow.actions.play).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should not auto-play when autoPlay is disabled', async () => {
      const mockManualFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockManualFlow);

      render(<WhatsAppSimulator autoPlay={false} />);

      await waitFor(() => {
        expect(mockManualFlow.actions.play).not.toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Message Display', () => {
    it('should render messages correctly', async () => {
      const testMessages = [
        {
          id: 'msg-1',
          sender: 'user',
          getDisplayText: () => 'Hello there!',
          status: 'sent',
        },
        {
          id: 'msg-2',
          sender: 'business',
          getDisplayText: () => 'Hi! How can I help?',
          status: 'read',
        },
      ];

      const mockFlowWithMessages = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test Restaurant' } },
          messages: testMessages,
          currentMessageIndex: 1,
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithMessages);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        expect(screen.getByText('Hello there!')).toBeInTheDocument();
        expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument();
      });
    });

    it('should apply correct styling for user vs business messages', async () => {
      const testMessages = [
        {
          id: 'msg-1',
          sender: 'user',
          getDisplayText: () => 'User message',
          status: 'sent',
        },
        {
          id: 'msg-2',
          sender: 'business',
          getDisplayText: () => 'Business message',
          status: 'sent',
        },
      ];

      const mockFlowWithMessages = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          messages: testMessages,
          currentMessageIndex: 1,
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithMessages);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        const userMessage = screen.getByText('User message').closest('div');
        const businessMessage = screen.getByText('Business message').closest('div');

        expect(userMessage?.parentElement).toHaveClass('justify-start');
        expect(businessMessage?.parentElement).toHaveClass('justify-end');
      });
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator when someone is typing', async () => {
      const mockTypingState = {
        state: {
          isAnyoneTyping: true,
          activeTypingUsers: ['business'],
        },
      };

      (typingIndicatorHook.useTypingIndicatorWithEvents as jest.Mock).mockReturnValue(mockTypingState);

      const mockFlowWithConversation = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithConversation);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        expect(screen.getByText('escribiendo...')).toBeInTheDocument();
        // Should show typing dots in header
        expect(screen.getAllByRole('generic')).toContain(
          expect.objectContaining({
            className: expect.stringContaining('animate-pulse'),
          })
        );
      });
    });

    it('should show online status when no one is typing', async () => {
      const mockOnlineState = {
        state: {
          isAnyoneTyping: false,
          activeTypingUsers: [],
        },
      };

      (typingIndicatorHook.useTypingIndicatorWithEvents as jest.Mock).mockReturnValue(mockOnlineState);

      const mockFlowWithConversation = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithConversation);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        expect(screen.getByText('en línea')).toBeInTheDocument();
        expect(screen.queryByText('escribiendo...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Conversation Completion and Restart', () => {
    it('should handle conversation completion', async () => {
      const onComplete = jest.fn();
      
      const mockCompletionFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'conversation.completed',
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockCompletionFlow);

      render(
        <WhatsAppSimulator 
          onComplete={onComplete}
          scenario={{
            ...restaurantReservationScenario,
            timing: {
              ...restaurantReservationScenario.timing,
              restartDelay: 1000,
            },
          }}
        />
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should reset and restart automatically after completion when autoPlay is enabled', async () => {
      jest.useFakeTimers();

      const mockCompletionFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
        events$: {
          subscribe: jest.fn((callback) => {
            setTimeout(() => {
              callback({
                type: 'conversation.completed',
              });
            }, 0);
            
            return { unsubscribe: jest.fn() };
          }),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockCompletionFlow);

      render(
        <WhatsAppSimulator 
          autoPlay={true}
          scenario={{
            ...restaurantReservationScenario,
            timing: {
              ...restaurantReservationScenario.timing,
              restartDelay: 1000,
            },
          }}
        />
      );

      // Advance time to trigger restart
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockCompletionFlow.actions.reset).toHaveBeenCalled();
        expect(mockCompletionFlow.actions.play).toHaveBeenCalledTimes(2); // Initial + restart
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const mockFlowWithConversation = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test Restaurant' } },
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithConversation);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        const simulator = screen.getByRole('img', { 
          name: /demostración avanzada de interfaz de whatsapp/i 
        });
        expect(simulator).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable for interactive elements', async () => {
      const user = userEvent.setup();

      const mockFlowWithConversation = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
        },
        events$: {
          subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithConversation);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        // Tab should focus on interactive elements
        user.tab();
        // Check if focus is managed properly
        expect(document.activeElement).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle conversation loading errors gracefully', async () => {
      const mockFailedFlow = {
        ...mockConversationFlow,
        actions: {
          ...mockConversationFlow.actions,
          loadConversation: jest.fn().mockResolvedValue(false),
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFailedFlow);

      render(<WhatsAppSimulator />);

      await waitFor(() => {
        // Should still show loading or handle error gracefully
        expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();
      });
    });

    it('should handle missing conversation data', async () => {
      const mockEmptyFlow = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: null,
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockEmptyFlow);

      render(<WhatsAppSimulator />);

      expect(screen.getByText('Cargando simulador...')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many messages', async () => {
      const manyMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        sender: i % 2 === 0 ? 'user' : 'business',
        getDisplayText: () => `Message ${i}`,
        status: 'sent',
      }));

      const mockFlowWithManyMessages = {
        ...mockConversationFlow,
        state: {
          ...mockConversationFlow.state,
          conversation: { metadata: { businessName: 'Test' } },
          messages: manyMessages,
          currentMessageIndex: 99,
        },
      };

      (conversationFlowHook.useConversationFlow as jest.Mock).mockReturnValue(mockFlowWithManyMessages);

      const startTime = performance.now();
      render(<WhatsAppSimulator />);
      
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time even with many messages
      expect(renderTime).toBeLessThan(1000);
    });
  });
});