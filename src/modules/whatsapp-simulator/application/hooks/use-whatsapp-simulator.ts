/**
 * WhatsApp Simulator Hook - Contains ALL the logic for WhatsApp simulation
 * Following Clean Architecture principles - NO UI logic in components
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Import existing hooks (these will need to be refactored similarly)
import { useConversationFlow } from '../../../whatsapp-simulator/ui/hooks/use-conversation-flow';
import { useFlowExecutionWithEvents } from '../../../whatsapp-simulator/ui/hooks/use-flow-execution';
import { usePerformanceMonitor } from '../../../whatsapp-simulator/ui/hooks/use-performance-monitor';
import { useTypingIndicatorWithEvents } from '../../../whatsapp-simulator/ui/hooks/use-typing-indicator';
import type { Conversation } from '../../domain/entities';
import type {
  ConversationFlowConfig,
  ConversationTemplate,
  EducationalBadge,
  FlowStepId,
  GifExportOptions,
  PerformanceMetrics,
  ReservationData,
  SimulatorActions,
  SimulatorError,
  SimulatorState,
  TypingIndicatorConfig,
  UseWhatsAppSimulatorReturn,
  WhatsAppSimulatorProps} from '../../domain/types';
// Import factories and scenarios (refactored to functional approach)
import { createConversationFromTemplate } from '../../infra/factories/conversation-factory';
import {
  createRestaurantReservationConversation,
  restaurantReservationScenario
} from '../../scenarios/restaurant-reservation-scenario';

// =============================================================================
// HOOK CONFIGURATION INTERFACE
// =============================================================================

interface UseWhatsAppSimulatorConfig extends WhatsAppSimulatorProps {
  onError?: (error: SimulatorError) => void;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enablePerformanceMonitoring?: boolean;
}

// =============================================================================
// MAIN HOOK - Contains ALL business logic
// =============================================================================

export const useWhatsAppSimulator = ({
  scenario = restaurantReservationScenario,
  device = 'iphone14',
  autoPlay = false,
  enableEducationalBadges = true,
  enableGifExport = false,
  onComplete,
  onBadgeShow,
  onFlowStep,
  onError,
  onMetricsUpdate,
  enablePerformanceMonitoring = false,
}: UseWhatsAppSimulatorConfig): UseWhatsAppSimulatorReturn => {

  // =============================================================================
  // CORE STATE MANAGEMENT - Single Responsibility
  // =============================================================================

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeBadge, setActiveBadge] = useState<EducationalBadge | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStepId>('guests');
  const [reservationData, setReservationData] = useState<ReservationData>({
    guests: 0,
    date: '',
    time: ''
  });

  // =============================================================================
  // CONFIGURATION OBJECTS - Memoized for performance
  // =============================================================================

  const flowConfig = useMemo((): ConversationFlowConfig => ({
    enableDebug: false,
    autoCleanup: true,
    playbackSpeed: 1.0,
    autoAdvance: true
  }), []);

  const typingConfig = useMemo((): TypingIndicatorConfig => ({
    showTypingIndicator: true,
    animationDuration: 1200,
  }), []);

  const executionConfig = useMemo(() => ({
    enableMockExecution: true,
    autoCompleteFlows: true
  }), []);

  // =============================================================================
  // EXTERNAL HOOKS INTEGRATION - Dependency Injection
  // =============================================================================

  const conversationFlow = useConversationFlow(flowConfig);
  const performanceMonitor = usePerformanceMonitor({
    enabled: enablePerformanceMonitoring,
    onUpdate: onMetricsUpdate
  });

  // Typing indicator integration
  const typingIndicator = useTypingIndicatorWithEvents(
    conversationFlow.events$,
    typingConfig
  );

  // Flow execution integration
  const flowExecution = useFlowExecutionWithEvents(
    conversationFlow.events$,
    executionConfig
  );

  // =============================================================================
  // SCENARIO TEMPLATE PROCESSING - Single Responsibility
  // =============================================================================

  const conversationTemplate = useMemo((): ConversationTemplate | null => {
    if (!scenario) return null;

    return {
      metadata: {
        id: scenario?.metadata?.id || 'default-scenario',
        title: scenario?.metadata?.title || 'WhatsApp Demo',
        description: scenario?.metadata?.description || 'WhatsApp Business Demo',
        tags: scenario?.metadata?.tags || ['demo'],
        businessName: scenario?.metadata?.businessName || 'Demo Business',
        businessPhoneNumber: scenario?.metadata?.businessPhoneNumber || '+1234567890',
        userPhoneNumber: scenario?.metadata?.userPhoneNumber || '+1987654321',
        language: scenario?.metadata?.language || 'es',
        category: scenario?.metadata?.category || 'demo',
        estimatedDuration: scenario?.metadata?.estimatedDuration || 30000
      },
      messages: scenario?.messages?.map((msg: any) => ({
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

  // =============================================================================
  // ERROR HANDLING - Single Responsibility
  // =============================================================================

  const handleError = useCallback((error: SimulatorError) => {
    console.error('[WhatsAppSimulator] Error:', error);
    onError?.(error);
  }, [onError]);

  // =============================================================================
  // CONVERSATION INITIALIZATION - Single Responsibility
  // =============================================================================

  const initializeConversation = useCallback(async (template: ConversationTemplate) => {
    try {
      performanceMonitor?.startOperation('initialization');

      console.log(`[WhatsAppSimulator] Initializing with scenario: ${template.metadata.id}`);

      // Clean up previous state
      setActiveBadge(null);
      setShowFlow(false);
      setFlowStep('guests');
      setReservationData({ guests: 0, date: '', time: '' });
      setIsInitialized(false);

      // Create conversation from template
      let conv: Conversation;

      try {
        conv = createConversationFromTemplate(template);
      } catch (error) {
        console.warn('[WhatsAppSimulator] Template creation failed, using fallback:', error);
        conv = createRestaurantReservationConversation();
      }

      setConversation(conv);

      // Load conversation into flow
      const success = await conversationFlow.actions.loadConversation(conv);

      if (success) {
        setIsInitialized(true);

        // Auto-play if enabled
        if (autoPlay) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              console.log(`[WhatsAppSimulator] Starting autoPlay for scenario: ${template.metadata.id}`);
              conversationFlow.actions.play();
            }, 100);
          });
        }

        performanceMonitor?.endOperation('initialization');
      } else {
        throw new Error('Failed to load conversation into flow');
      }

    } catch (error) {
      const simulatorError: SimulatorError = {
        type: 'initialization',
        message: error instanceof Error ? error.message : 'Initialization failed',
        details: error,
        timestamp: new Date(),
        recoverable: true
      };

      handleError(simulatorError);
      performanceMonitor?.endOperation('initialization', false);
    }
  }, [autoPlay, conversationFlow.actions, performanceMonitor, handleError]);

  // =============================================================================
  // BADGE MANAGEMENT - Single Responsibility
  // =============================================================================

  const showBadge = useCallback((badge: EducationalBadge) => {
    if (!enableEducationalBadges) return;

    setActiveBadge(badge);
    onBadgeShow?.(badge);

    // Auto-hide badge after duration
    if (badge.duration && badge.duration > 0) {
      setTimeout(() => {
        setActiveBadge(null);
      }, badge.duration);
    }
  }, [enableEducationalBadges, onBadgeShow]);

  const hideBadge = useCallback(() => {
    setActiveBadge(null);
  }, []);

  // =============================================================================
  // FLOW MANAGEMENT - Single Responsibility
  // =============================================================================

  const nextFlowStep = useCallback(() => {
    const steps: FlowStepId[] = ['guests', 'date', 'time', 'confirmation'];
    const currentIndex = steps.indexOf(flowStep);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setFlowStep(nextStep);

      onFlowStep?.({
        id: nextStep,
        title: nextStep.charAt(0).toUpperCase() + nextStep.slice(1),
        isActive: true,
        isCompleted: false
      });
    }
  }, [flowStep, onFlowStep]);

  const updateFlowData = useCallback((data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  }, []);

  // =============================================================================
  // GIF EXPORT - Single Responsibility
  // =============================================================================

  const [gifExportState, setGifExportState] = useState({
    isExporting: false,
    progress: 0,
    error: undefined as string | undefined,
    exportUrl: undefined as string | undefined,
    fileSize: undefined as number | undefined
  });

  const startGifExport = useCallback(async (options?: GifExportOptions) => {
    if (!enableGifExport) return;

    setGifExportState(prev => ({
      ...prev,
      isExporting: true,
      progress: 0,
      error: undefined
    }));

    try {
      // This would use the GIF export service

      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setGifExportState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGifExportState(prev => ({
        ...prev,
        isExporting: false,
        exportUrl: '/path/to/exported.gif',
        fileSize: 1024 * 1024 // 1MB placeholder
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';

      setGifExportState(prev => ({
        ...prev,
        isExporting: false,
        error: errorMessage
      }));

      handleError({
        type: 'export',
        message: errorMessage,
        details: error,
        timestamp: new Date(),
        recoverable: true
      });
    }
  }, [enableGifExport, handleError]);

  const cancelGifExport = useCallback(() => {
    setGifExportState(prev => ({
      ...prev,
      isExporting: false,
      progress: 0
    }));
  }, []);

  // =============================================================================
  // INITIALIZATION EFFECT - Single Responsibility
  // =============================================================================

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isMounted && conversationTemplate) {
        await initializeConversation(conversationTemplate);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      // Cleanup if needed
      performanceMonitor?.cleanup?.();
    };
  }, [conversationTemplate, initializeConversation, performanceMonitor]);

  // =============================================================================
  // EVENT HANDLERS - Single Responsibility
  // =============================================================================

  const onMessageClick = useCallback((index: number) => {
    if (conversationFlow.actions.jumpToMessage) {
      conversationFlow.actions.jumpToMessage(index);
    }
  }, [conversationFlow.actions]);

  const onFlowStepClick = useCallback((stepId: FlowStepId) => {
    setFlowStep(stepId);
    setShowFlow(true);
  }, []);

  const onBadgeClick = useCallback((badge: EducationalBadge) => {
    // Could trigger additional badge interactions
    console.log('[Badge clicked]', badge);
  }, []);

  // =============================================================================
  // DERIVED STATE - Computed values
  // =============================================================================

  const isPlaying = conversationFlow.state?.isPlaying ?? false;
  const isPaused = conversationFlow.state?.isPaused ?? false;
  const isCompleted = conversationFlow.state?.isCompleted ?? false;
  const currentProgress = conversationFlow.state?.progress ?? 0;

  // =============================================================================
  // STATE OBJECT ASSEMBLY - Single Responsibility
  // =============================================================================

  const state: SimulatorState = {
    conversation,
    isInitialized,
    flowExecution: {
      currentStep: flowStep,
      completedSteps: [],
      flowData: reservationData,
      isFlowActive: showFlow,
      isFlowCompleted: flowStep === 'confirmation'
    },
    activeBadge,
    showFlow,
    metrics: performanceMonitor?.metrics ?? {
      renderCount: 0,
      lastRenderTime: 0,
      animationFrameCount: 0
    },
    gifExport: gifExportState
  };

  const actions: SimulatorActions = {
    initialize: initializeConversation,
    reset: () => {
      conversationFlow.actions.reset?.();
      setIsInitialized(false);
      setActiveBadge(null);
      setShowFlow(false);
      setFlowStep('guests');
      setReservationData({ guests: 0, date: '', time: '' });
    },
    play: () => conversationFlow.actions.play?.(),
    pause: () => conversationFlow.actions.pause?.(),
    jumpTo: onMessageClick,
    nextFlowStep,
    updateFlowData,
    showBadge,
    hideBadge,
    startGifExport,
    cancelGifExport
  };

  // =============================================================================
  // PUBLIC API - Everything the component needs
  // =============================================================================

  return {
    state,
    actions,
    isPlaying,
    isPaused,
    isCompleted,
    currentProgress,
    onMessageClick,
    onFlowStepClick,
    onBadgeClick
  };
};

// =============================================================================
// HOOK TYPE EXPORT - For TypeScript support
// =============================================================================

export type UseWhatsAppSimulatorReturn = ReturnType<typeof useWhatsAppSimulator>;