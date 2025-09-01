/**
 * Main WhatsApp Simulator Hook
 * Orchestrates all simulator logic following Clean Architecture principles
 * Extracts ALL logic from the 985-line component into clean, functional hooks
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Conversation } from '../../domain/entities';
// Domain imports
import type {
  ConversationTemplate,
  ExecutionConfig,
  FlowConfig,
  TypingConfig,
  WhatsAppSimulatorProps} from '../../domain/types';
// Infrastructure imports
import { createConversationFromTemplate } from '../../infra/factories/conversation-factory';
import {
  createRestaurantReservationConversation,
  restaurantReservationScenario
} from '../../scenarios/restaurant-reservation-scenario';

// Existing hooks imports
import { useConversationFlow } from './use-conversation-flow';
// New specialized hooks imports
import { useEducationalBadges } from './use-educational-badges';
import { useFlowExecutionWithEvents } from './use-flow-execution';
import { useFlowSequence } from './use-flow-sequence';
import { useTypingIndicatorWithEvents } from './use-typing-indicator';

interface UseWhatsAppSimulatorReturn {
  // Core state
  conversation: Conversation | null;
  isInitialized: boolean;

  // Badge management
  activeBadge: any;

  // Flow management
  showFlow: boolean;
  flowStep: any;
  reservationData: any;

  // Actions
  initializeConversation: () => Promise<void>;

  // Hooks for component consumption
  conversationFlow: any;
  typingIndicator: any;
  flowExecution: any;

  // Event handlers
  handleDataChange: (data: any) => void;
}

/**
 * Main WhatsApp Simulator Hook
 * Orchestrates all simulator functionality in a clean, functional way
 */
export const useWhatsAppSimulator = ({
  scenario = restaurantReservationScenario,
  autoPlay = false,
  isInView,
  enableEducationalBadges = true,
  onComplete,
  onBadgeShow,
  onFlowStep
}: Partial<WhatsAppSimulatorProps> = {}): UseWhatsAppSimulatorReturn => {

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const flowConfig = useMemo((): FlowConfig => ({
    enableDebug: false,
    autoCleanup: true
  }), []);

  const typingConfig = useMemo((): TypingConfig => ({
    showTypingIndicator: true,
    animationDuration: 1200
  }), []);

  const executionConfig = useMemo((): ExecutionConfig => ({
    enableMockExecution: true,
    autoCompleteFlows: true
  }), []);

  const conversationFlow = useConversationFlow(flowConfig);

  const typingIndicator = useTypingIndicatorWithEvents(
    conversationFlow.events$,
    typingConfig
  );

  const flowExecution = useFlowExecutionWithEvents(
    conversationFlow.events$,
    executionConfig
  );

  const { activeBadge, handleBadgeDisplay, clearBadge } = useEducationalBadges(onBadgeShow);

  const {
    showFlow,
    flowStep,
    reservationData,
    setFlowStep,
    setShowFlow,
    startFlowSequence,
    updateReservationData,
    resetFlow
  } = useFlowSequence({
    scenario,
    onFlowStep
  });
  const conversationTemplate = useMemo((): ConversationTemplate | null => {
    if (!scenario) return null;

    return {
      metadata: {
        id: scenario?.metadata?.id || 'restaurant-reservation',
        title: scenario?.metadata?.title || 'WhatsApp Demo',
        description: scenario?.metadata?.description || 'WhatsApp Business Demo',
        tags: scenario?.metadata?.tags || ['demo'],
        businessName: scenario?.metadata?.businessName || 'Demo Business',
        businessPhoneNumber: scenario?.metadata?.businessPhoneNumber || '+1234567890',
        userPhoneNumber: scenario?.metadata?.userPhoneNumber || '+1987654321',
        language: scenario?.metadata?.language || 'es',
        category: scenario?.metadata?.category || 'demo'
      },
      messages: scenario?.messages?.map(msg => ({
        sender: msg.sender,
        type: 'text' as const,
        content: msg.content,
        delayBeforeTyping: msg.delayBeforeTyping || 1000,
        typingDuration: msg.typingDuration || 1200
      })) || [],
      settings: {
        playbackSpeed: 1.0,
        autoAdvance: true,
        showTypingIndicators: true,
        showReadReceipts: true
      }
    };
  }, [scenario]);

  const initializeConversation = useCallback(async () => {
    const scenarioId = scenario?.metadata?.id || 'restaurant-reservation';
    console.log('[WhatsAppSimulator] Starting initialization for scenario:', scenarioId);
    console.log('[WhatsAppSimulator] Scenario object:', scenario);
    console.log('[WhatsAppSimulator] Conversation template:', conversationTemplate);

    clearBadge();
    resetFlow();
    setIsInitialized(false);

    let conv: Conversation;

    try {
      if (conversationTemplate) {
        console.log('[WhatsAppSimulator] Creating conversation from template...');
        conv = createConversationFromTemplate(conversationTemplate);
        console.log('[WhatsAppSimulator] Conversation created successfully:', conv);
      } else {
        console.log('[WhatsAppSimulator] No conversation template available');
        throw new Error('No conversation template available');
      }
    } catch (error) {
      console.error(`[WhatsAppSimulator] Error creating conversation for scenario ${scenarioId}:`, error);
      console.log('[WhatsAppSimulator] Falling back to default restaurant conversation');
      conv = createRestaurantReservationConversation();
    }

    setConversation(conv);
    console.log('[WhatsAppSimulator] Conversation state set, now loading into engine...');

    const success = await conversationFlow.actions.loadConversation(conv);
    console.log('[WhatsAppSimulator] Load conversation result:', success);

    if (success) {
      console.log('[WhatsAppSimulator] Initialization successful! Setting isInitialized to true');
      setIsInitialized(true);

      if (autoPlay) {
        console.log('[WhatsAppSimulator] Auto-play enabled, starting conversation...');
        requestAnimationFrame(() => {
          setTimeout(() => {
            conversationFlow.actions.play();
          }, 100);
        });
      }
    } else {
      console.error('[WhatsAppSimulator] Failed to load conversation into engine');
    }
  }, [
    scenario,
    autoPlay,
    conversationFlow.actions,
    conversationTemplate,
    clearBadge,
    resetFlow
  ]);

  useEffect(() => {
    if (isInitialized || !conversationFlow.isReady) {
      console.log('[WhatsAppSimulator] Skip init - initialized:', isInitialized, 'ready:', conversationFlow.isReady);
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      console.log('[WhatsAppSimulator] Starting initialization...');

      if (!isMounted) return;

      const scenarioId = scenario?.metadata?.id || 'restaurant-reservation';
      console.log('[WhatsAppSimulator] Initializing for scenario:', scenarioId);

      clearBadge();
      resetFlow();
      let conv: Conversation;
      try {
        if (conversationTemplate) {
          console.log('[WhatsAppSimulator] Creating conversation from template...');
          conv = createConversationFromTemplate(conversationTemplate);
        } else {
          throw new Error('No conversation template available');
        }
      } catch (error) {
        console.error('[WhatsAppSimulator] Error creating conversation:', error);
        conv = createRestaurantReservationConversation();
      }

      if (!isMounted) return;

      setConversation(conv);
      console.log('[WhatsAppSimulator] Loading conversation into engine...');

      const success = await conversationFlow.actions.loadConversation(conv);
      console.log('[WhatsAppSimulator] Load result:', success);

      if (!isMounted) return;

      if (success) {
        console.log('[WhatsAppSimulator] Setting isInitialized to true');
        setIsInitialized(true);

        if (autoPlay) {
          console.log('[WhatsAppSimulator] Starting auto-play...');
          setTimeout(() => {
            if (isMounted) {
              conversationFlow.actions.play();
            }
          }, 100);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [
    conversationFlow.isReady,
    conversationFlow.actions,
    isInitialized,
    scenario,
    conversationTemplate,
    clearBadge,
    resetFlow,
    autoPlay
  ]);
  useEffect(() => {
    if (!enableEducationalBadges || !conversationFlow.events$) return;

    const subscription = conversationFlow.events$.subscribe(event => {
      if (event.type === 'message.sent') {
        const messageIndex = conversationFlow.state.currentMessageIndex;
        const badge = scenario.educationalBadges?.find(
          b => b.triggerAtMessageIndex === messageIndex
        );

        if (badge) {
          setTimeout(() => {
            handleBadgeDisplay(badge);
          }, 200);
        }

        if (messageIndex === 3) {
          setTimeout(() => {
            setShowFlow(true);
            startFlowSequence();
          }, 800);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [
    conversationFlow.events$,
    enableEducationalBadges,
    scenario,
    handleBadgeDisplay,
    startFlowSequence,
    setShowFlow
  ]);
  useEffect(() => {
    if (!conversationFlow.events$) return;

    const subscription = conversationFlow.events$.subscribe(event => {
      if (event.type === 'conversation.completed') {
        onComplete?.();

        setTimeout(() => {
          if (isInView) {
            conversationFlow.actions.reset();
            resetFlow();
            clearBadge();

            setTimeout(() => {
              conversationFlow.actions.play();
            }, 1000);
          }
        }, scenario.timing?.restartDelay || 12000);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    conversationFlow.events$,
    onComplete,
    isInView,
    scenario,
    resetFlow,
    clearBadge
  ]);

  const handleDataChange = useCallback((data: any) => {
    updateReservationData(data);
  }, [updateReservationData]);

  return {
    conversation,
    isInitialized,
    activeBadge,
    showFlow,
    flowStep,
    reservationData,
    initializeConversation,
    conversationFlow,
    typingIndicator,
    flowExecution,
    handleDataChange
  };
};