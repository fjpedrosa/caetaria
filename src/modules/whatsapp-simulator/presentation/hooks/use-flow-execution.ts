/**
 * useFlowExecution - Manage WhatsApp Flow interactions
 */

import { useCallback, useEffect,useRef, useState } from 'react';
import { Observable } from 'rxjs';

import { Message } from '../../domain/entities';
import { ConversationEvent } from '../../domain/events';
import type {
  FlowExecutionActions,
  FlowExecutionConfig,
  FlowExecutionReturn,
  FlowExecutionState,
  FlowState} from '../../domain/types';

const DEFAULT_CONFIG: FlowExecutionConfig = {
  enableMockExecution: true,
  mockExecutionDelay: 2000, // 2 seconds
  autoCompleteFlows: true,
  mockFlowResponses: {},
  maxExecutionTime: 30000, // 30 seconds
  enableDebug: false
};

// Default mock flow responses
const DEFAULT_MOCK_RESPONSES: Record<string, Record<string, any>> = {
  'booking_flow': {
    'booking_id': 'BK12345',
    'service': 'Premium Consultation',
    'date': '2024-02-15',
    'time': '14:00',
    'status': 'confirmed',
    'total_amount': 150
  },
  'support_flow': {
    'ticket_id': 'TK67890',
    'category': 'Technical Support',
    'priority': 'medium',
    'status': 'created',
    'assigned_agent': 'Sarah Johnson'
  },
  'feedback_flow': {
    'feedback_id': 'FB11111',
    'rating': 5,
    'category': 'service_quality',
    'comment': 'Excellent service, very satisfied!',
    'would_recommend': true
  },
  'catalog_flow': {
    'items_selected': ['item_1', 'item_3', 'item_7'],
    'total_items': 3,
    'estimated_total': 299.99,
    'currency': 'USD',
    'next_action': 'proceed_to_cart'
  }
};

export function useFlowExecution(
  config: Partial<FlowExecutionConfig> = {}
): FlowExecutionReturn {
  const fullConfig = {
    ...DEFAULT_CONFIG,
    mockFlowResponses: { ...DEFAULT_MOCK_RESPONSES, ...config.mockFlowResponses },
    ...config
  };

  const [activeFlows, setActiveFlows] = useState<Map<string, FlowState>>(new Map());
  const [flowHistory, setFlowHistory] = useState<FlowState[]>([]);
  const [lastCompletedFlow, setLastCompletedFlow] = useState<FlowState | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);

  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mockResponsesRef = useRef(fullConfig.mockFlowResponses);

  // Update mock responses when config changes
  useEffect(() => {
    mockResponsesRef.current = fullConfig.mockFlowResponses;
  }, [fullConfig.mockFlowResponses]);

  const triggerFlow = useCallback(
    async (message: Message, flowData?: Record<string, any>): Promise<boolean> => {
      try {
        if (!message.isFlowTrigger()) {
          throw new Error('Message is not a flow trigger');
        }

        const flowId = message.content.flow?.flowId ||
                      message.content.interactive?.action?.flow_id ||
                      'unknown_flow';

        const flowToken = message.content.flow?.flowToken ||
                         message.content.interactive?.action?.flow_token ||
                         generateFlowToken();

        if (fullConfig.enableDebug) {
          console.log(`[FlowExecution] Triggering flow: ${flowId} with token: ${flowToken}`);
        }

        const flowState: FlowState = {
          flowId,
          flowToken,
          isActive: true,
          isCompleted: false,
          hasError: false,
          data: { ...message.content.flow?.flowData, ...flowData },
          startTime: new Date()
        };

        setActiveFlows(prev => new Map(prev).set(flowToken, flowState));
        setLastError(null);

        // Set timeout for max execution time
        const timeout = setTimeout(() => {
          cancelFlow(flowToken, 'Execution timeout');
        }, fullConfig.maxExecutionTime);

        timeoutsRef.current.set(flowToken, timeout);

        // Auto-complete flow if enabled (for demo/testing purposes)
        if (fullConfig.autoCompleteFlows && fullConfig.enableMockExecution) {
          setTimeout(() => {
            const mockResponse = mockResponsesRef.current[flowId] || {
              status: 'completed',
              message: 'Flow completed successfully'
            };
            completeFlow(flowToken, mockResponse);
          }, fullConfig.mockExecutionDelay);
        }

        return true;
      } catch (error) {
        setLastError(error as Error);
        if (fullConfig.enableDebug) {
          console.error('[FlowExecution] Error triggering flow:', error);
        }
        return false;
      }
    },
    [fullConfig.enableDebug, fullConfig.autoCompleteFlows, fullConfig.enableMockExecution, fullConfig.mockExecutionDelay, fullConfig.maxExecutionTime]
  );

  const completeFlow = useCallback(
    async (flowToken: string, result: Record<string, any>): Promise<boolean> => {
      try {
        const flowState = activeFlows.get(flowToken);
        if (!flowState) {
          throw new Error(`Flow with token ${flowToken} not found`);
        }

        const completedFlow: FlowState = {
          ...flowState,
          isActive: false,
          isCompleted: true,
          result,
          endTime: new Date(),
          executionTime: new Date().getTime() - (flowState.startTime?.getTime() || 0)
        };

        if (fullConfig.enableDebug) {
          console.log(`[FlowExecution] Completing flow: ${flowState.flowId} (${completedFlow.executionTime}ms)`);
        }

        // Clear timeout
        const timeout = timeoutsRef.current.get(flowToken);
        if (timeout) {
          clearTimeout(timeout);
          timeoutsRef.current.delete(flowToken);
        }

        // Update state
        setActiveFlows(prev => {
          const newMap = new Map(prev);
          newMap.delete(flowToken);
          return newMap;
        });

        setFlowHistory(prev => [...prev, completedFlow]);
        setLastCompletedFlow(completedFlow);
        setLastError(null);

        return true;
      } catch (error) {
        setLastError(error as Error);
        if (fullConfig.enableDebug) {
          console.error('[FlowExecution] Error completing flow:', error);
        }
        return false;
      }
    },
    [activeFlows, fullConfig.enableDebug]
  );

  const cancelFlow = useCallback(
    async (flowToken: string, reason: string = 'Cancelled'): Promise<boolean> => {
      try {
        const flowState = activeFlows.get(flowToken);
        if (!flowState) {
          return false; // Flow already completed or doesn't exist
        }

        const cancelledFlow: FlowState = {
          ...flowState,
          isActive: false,
          isCompleted: false,
          hasError: true,
          error: new Error(`Flow cancelled: ${reason}`),
          endTime: new Date(),
          executionTime: new Date().getTime() - (flowState.startTime?.getTime() || 0)
        };

        if (fullConfig.enableDebug) {
          console.log(`[FlowExecution] Cancelling flow: ${flowState.flowId} - ${reason}`);
        }

        // Clear timeout
        const timeout = timeoutsRef.current.get(flowToken);
        if (timeout) {
          clearTimeout(timeout);
          timeoutsRef.current.delete(flowToken);
        }

        // Update state
        setActiveFlows(prev => {
          const newMap = new Map(prev);
          newMap.delete(flowToken);
          return newMap;
        });

        setFlowHistory(prev => [...prev, cancelledFlow]);
        setLastError(cancelledFlow.error!);

        return true;
      } catch (error) {
        setLastError(error as Error);
        if (fullConfig.enableDebug) {
          console.error('[FlowExecution] Error cancelling flow:', error);
        }
        return false;
      }
    },
    [activeFlows, fullConfig.enableDebug]
  );

  const getFlowState = useCallback(
    (flowToken: string): FlowState | null => {
      return activeFlows.get(flowToken) || null;
    },
    [activeFlows]
  );

  const getActiveFlows = useCallback(
    (): FlowState[] => {
      return Array.from(activeFlows.values());
    },
    [activeFlows]
  );

  const clearFlowHistory = useCallback(() => {
    setFlowHistory([]);
    setLastCompletedFlow(null);
    setLastError(null);
  }, []);

  const setMockFlowResponse = useCallback(
    (flowId: string, response: Record<string, any>) => {
      mockResponsesRef.current = {
        ...mockResponsesRef.current,
        [flowId]: response
      };
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Array.from(timeoutsRef.current.values()).forEach(timeout => {
        clearTimeout(timeout);
      });
      timeoutsRef.current.clear();
    };
  }, []);

  const state: FlowExecutionState = {
    activeFlows,
    flowHistory,
    isAnyFlowActive: activeFlows.size > 0,
    lastCompletedFlow,
    lastError
  };

  const actions: FlowExecutionActions = {
    triggerFlow,
    completeFlow,
    cancelFlow,
    getFlowState,
    getActiveFlows,
    clearFlowHistory,
    setMockFlowResponse
  };

  return {
    state,
    actions
  };
}

/**
 * Hook to integrate flow execution with conversation events
 */
export function useFlowExecutionWithEvents(
  events$: Observable<ConversationEvent>,
  config?: Partial<FlowExecutionConfig>
): FlowExecutionReturn {
  const flowExecution = useFlowExecution(config);

  useEffect(() => {
    if (!events$) return;

    const subscription = events$.subscribe((event: ConversationEvent) => {
      switch (event.type) {
        case 'flow.triggered':
          // Handle flow triggered events
          if (config?.enableDebug) {
            console.log('[FlowExecutionWithEvents] Flow triggered:', event);
          }
          break;
        case 'flow.completed':
          if (config?.enableDebug) {
            console.log('[FlowExecutionWithEvents] Flow completed:', event);
          }
          break;
        case 'flow.failed':
          if (config?.enableDebug) {
            console.error('[FlowExecutionWithEvents] Flow failed:', event);
          }
          break;
        case 'conversation.reset':
          // Cancel all active flows when conversation resets
          flowExecution.actions.getActiveFlows().forEach(flow => {
            flowExecution.actions.cancelFlow(flow.flowToken, 'Conversation reset');
          });
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [events$, flowExecution.actions, config?.enableDebug]);

  return flowExecution;
}

/**
 * Generate a unique flow token
 */
function generateFlowToken(): string {
  return `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}