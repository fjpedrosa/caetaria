/**
 * WhatsApp Simulator Hook - Contains ALL the logic for WhatsApp simulation
 * Following Clean Architecture principles - NO UI logic in components
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Import factories and scenarios (refactored to functional approach)
import { ConversationFactory } from '../../application/ports/conversation-factory';
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
import { conversationFactory } from '../../infrastructure/adapters/conversation-factory-adapter';
import {
  restaurantReservationScenario
} from '../../scenarios/restaurant-reservation-scenario';

// Import existing hooks (these will need to be refactored similarly)
import { useConversationFlow } from './use-conversation-flow';
import { useFlowExecutionWithEvents } from './use-flow-execution';
import { usePerformanceMonitor } from './use-performance-monitor';
import { useTypingIndicatorWithEvents } from './use-typing-indicator';

// =============================================================================
// HOOK CONFIGURATION INTERFACE
// =============================================================================

interface UseWhatsAppSimulatorConfig extends WhatsAppSimulatorProps {
  isInView?: boolean; // Add support for visibility-based control
  onError?: (error: SimulatorError) => void;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enablePerformanceMonitoring?: boolean;
  // Dependency injection for clean architecture
  conversationFactory?: ConversationFactory;
}

// =============================================================================
// MAIN HOOK - Contains ALL business logic
// =============================================================================

export const useWhatsAppSimulator = ({
  scenario = restaurantReservationScenario,
  device = 'iphone14',
  autoPlay = false,
  isInView = true, // Changed default to true for proper autoplay
  enableEducationalBadges = true,
  enableGifExport = false,
  onComplete,
  onBadgeShow,
  onFlowStep,
  onError,
  onMetricsUpdate,
  enablePerformanceMonitoring = false, // Disabled by default to prevent performance issues
  conversationFactory: injectedFactory,
}: UseWhatsAppSimulatorConfig): UseWhatsAppSimulatorReturn => {
  console.log('[WhatsAppSimulator Hook] 🎯🎯🎯 HOOK STARTING - v5', {
    hasScenario: !!scenario,
    scenarioId: scenario?.metadata?.id,
    autoPlay,
    isInView
  });

  // Use injected factory or default implementation
  const factory = injectedFactory || conversationFactory;

  // =============================================================================
  // STABLE REFS - Prevent unnecessary re-renders
  // =============================================================================
  const callbacksRef = useRef({
    onError,
    onComplete,
    onBadgeShow,
    onFlowStep,
    onMetricsUpdate
  });

  // Update refs without causing re-renders
  useEffect(() => {
    callbacksRef.current = {
      onError,
      onComplete,
      onBadgeShow,
      onFlowStep,
      onMetricsUpdate
    };
  }, [onError, onComplete, onBadgeShow, onFlowStep, onMetricsUpdate]);

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

  // Track initialization to prevent redundant calls
  const hasInitializedRef = useRef(false);
  const previousTemplateIdRef = useRef<string | null>(null);

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

  // IMPORTANT: Hooks must be called unconditionally at the top level
  console.log('[WhatsAppSimulator Hook] 🔥 About to call useConversationFlow - v3');
  const conversationFlow = useConversationFlow(flowConfig);
  console.log('[WhatsAppSimulator Hook] useConversationFlow succeeded');

  // Performance monitoring with simplified configuration to prevent re-renders
  const performanceMonitor = usePerformanceMonitor(
    'WhatsAppSimulator',
    { enableMonitoring: enablePerformanceMonitoring }
  );

  // Debug logging for hooks
  console.log('[WhatsAppSimulator Hook] conversationFlow:', {
    exists: !!conversationFlow,
    hasState: !!conversationFlow?.state,
    hasActions: !!conversationFlow?.actions,
    hasEvents: !!conversationFlow?.events$
  });

  // Typing indicator integration
  const typingIndicator = useTypingIndicatorWithEvents(
    conversationFlow.events$,
    typingConfig
  );

  console.log('[WhatsAppSimulator Hook] typingIndicator:', {
    exists: !!typingIndicator
  });

  // Flow execution integration
  const flowExecution = useFlowExecutionWithEvents(
    conversationFlow.events$,
    executionConfig
  );

  console.log('[WhatsAppSimulator Hook] flowExecution:', {
    exists: !!flowExecution
  });

  // =============================================================================
  // SCENARIO TEMPLATE PROCESSING - Single Responsibility
  // =============================================================================

  const conversationTemplate = useMemo((): ConversationTemplate | null => {
    if (!scenario) {
      console.log('[WhatsAppSimulator] No scenario provided');
      return null;
    }

    console.log('[WhatsAppSimulator] Creating template from scenario:', scenario.metadata?.id);

    // Return null if scenario doesn't have proper metadata
    if (!scenario.metadata || !scenario.messages) {
      console.log('[WhatsAppSimulator] Invalid scenario structure');
      return null;
    }

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
  // DIRECT INITIALIZATION - Since useEffect is not working in SSR
  // =============================================================================

  console.log('[WhatsAppSimulator Hook] 🔍 Checking direct init conditions:', {
    isReady: conversationFlow?.isReady,
    hasTemplate: !!conversationTemplate,
    hasInitializedRef: hasInitializedRef.current,
    isInitialized,
    autoPlay,
    isInView
  });

  // =============================================================================
  // IMPORTANT: All initialization logic has been moved to useEffect below
  // to prevent React state updates during render phase
  // =============================================================================

  // Track previous isInView value to detect changes (used in useEffect)
  const hasStartedAutoPlayRef = useRef(false);

  // =============================================================================
  // ERROR HANDLING - Single Responsibility
  // =============================================================================

  const handleError = useCallback((error: SimulatorError) => {
    console.error('[WhatsAppSimulator] Error:', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      recoverable: error.recoverable,
      details: error.details
    });
    callbacksRef.current.onError?.(error);
  }, []); // No dependencies - uses stable ref

  // =============================================================================
  // CONVERSATION INITIALIZATION - Single Responsibility
  // =============================================================================

  const initializeConversation = useCallback(async (template: ConversationTemplate, shouldAutoPlay: boolean = false) => {
    try {
      console.log(`[WhatsAppSimulator] initializeConversation called with scenario: ${template.metadata.id}`);
      performanceMonitor?.startTransition();

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
        conv = factory.createFromTemplate(template);
      } catch (error) {
        console.warn('[WhatsAppSimulator] Template creation failed, using fallback:', error);
        conv = factory.createRestaurantReservationConversation();
      }

      setConversation(conv);

      // Load conversation into flow
      const success = await conversationFlow.actions.loadConversation(conv);

      if (success) {
        setIsInitialized(true);

        // Auto-play if enabled
        if (shouldAutoPlay) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              console.log(`[WhatsAppSimulator] Starting autoPlay for scenario: ${template.metadata.id}`);
              conversationFlow.actions.play();
            }, 100);
          });
        }

        performanceMonitor?.endTransition();
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
      performanceMonitor?.endTransition();
    }
  }, [conversationFlow.actions, performanceMonitor, handleError, factory]); // Stable dependencies

  // =============================================================================
  // BADGE MANAGEMENT - Single Responsibility
  // =============================================================================

  const showBadge = useCallback((badge: EducationalBadge) => {
    if (!enableEducationalBadges) return;

    setActiveBadge(badge);
    callbacksRef.current.onBadgeShow?.(badge);

    // Auto-hide badge after duration
    if (badge.duration && badge.duration > 0) {
      setTimeout(() => {
        setActiveBadge(null);
      }, badge.duration);
    }
  }, [enableEducationalBadges]);

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

      callbacksRef.current.onFlowStep?.({
        id: nextStep,
        title: nextStep.charAt(0).toUpperCase() + nextStep.slice(1),
        isActive: true,
        isCompleted: false
      });
    }
  }, [flowStep]);

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
  // IMPROVED INITIALIZATION - Works with synchronous orchestrator
  // =============================================================================

  // Track previous isInView state for reactive updates
  const prevIsInViewRef = useRef<boolean | undefined>(isInView);

  // =============================================================================
  // DIRECT INITIALIZATION - When template is ready
  // =============================================================================

  // Initialize immediately when template and flow are ready
  if (conversationTemplate && conversationFlow?.isReady && !hasInitializedRef.current) {
    const templateId = conversationTemplate.metadata.id;

    console.log(`[WhatsAppSimulator Hook] 🚀 Direct initialization for template: ${templateId}`);
    hasInitializedRef.current = true;
    previousTemplateIdRef.current = templateId;

    // Create conversation synchronously
    try {
      const conv = factory.createFromTemplate(conversationTemplate);
      console.log('[WhatsAppSimulator Hook] ✅ Conversation created:', {
        messageCount: conv?.messages?.length || 0
      });

      // Set conversation state
      setConversation(conv);

      // OPCIÓN 1: Set initialized immediately after creating conversation
      // Don't wait for the async load to complete
      setIsInitialized(true);
      console.log('[WhatsAppSimulator Hook] ✅ Set isInitialized to true');

      // Load conversation into flow asynchronously (fire and forget for UI purposes)
      conversationFlow.actions.loadConversation(conv).then(success => {
        console.log('[WhatsAppSimulator Hook] 📊 Load result:', success);

        if (success) {
          // Auto-play if enabled and either:
          // 1. isInView is explicitly true, OR
          // 2. autoPlay is true and isInView is not explicitly false (handles undefined case)
          const shouldStartAutoPlay = autoPlay && (isInView === true || (isInView !== false));
          
          if (shouldStartAutoPlay) {
            setTimeout(() => {
              console.log('[WhatsAppSimulator Hook] ▶️ Starting autoPlay (autoPlay:', autoPlay, ', isInView:', isInView, ')');
              conversationFlow.actions.play();
            }, 500);
          } else {
            console.log('[WhatsAppSimulator Hook] ⏸️ Not starting autoPlay (autoPlay:', autoPlay, ', isInView:', isInView, ')');
          }
        } else {
          console.error('[WhatsAppSimulator Hook] ❌ Failed to load conversation');
          // UI is already showing, no need to update isInitialized
        }
      }).catch(error => {
        console.error('[WhatsAppSimulator Hook] ❌ Load error:', error);
        // UI is already showing, no need to update isInitialized
      });
    } catch (error) {
      console.error('[WhatsAppSimulator Hook] ❌ Creation error:', error);
      // Use fallback
      try {
        const fallback = factory.createRestaurantReservationConversation();
        setConversation(fallback);
        setIsInitialized(true);
      } catch (fallbackError) {
        console.error('[WhatsAppSimulator Hook] ❌ Fallback failed:', fallbackError);
        setIsInitialized(true);
      }
    }
  }

  // =============================================================================
  // TEMPLATE CHANGE EFFECT - Handle scenario changes
  // =============================================================================

  useEffect(() => {
    if (!conversationTemplate || !conversationFlow?.isReady) {
      return;
    }

    const templateId = conversationTemplate.metadata.id;

    // Check if template changed
    if (previousTemplateIdRef.current && previousTemplateIdRef.current !== templateId) {
      console.log(`[WhatsAppSimulator Hook] 📝 Template changed to: ${templateId}`);

      // Reset initialization
      hasInitializedRef.current = false;
      setIsInitialized(false);
      setConversation(null);

      // Will be re-initialized on next render
    }
  }, [conversationTemplate?.metadata?.id, conversationFlow?.isReady]);

  // =============================================================================
  // REACTIVE AUTOPLAY EFFECT - Handle isInView changes after initialization
  // =============================================================================

  useEffect(() => {
    // Skip if not initialized or not ready
    if (!isInitialized || !conversationFlow?.isReady) {
      console.log('[WhatsAppSimulator Hook] 🔄 Skipping reactive effect (not ready)', {
        isInitialized,
        isReady: conversationFlow?.isReady
      });
      return;
    }

    // Detect isInView changes
    const isInViewChanged = prevIsInViewRef.current !== isInView;

    if (isInViewChanged) {
      console.log('[WhatsAppSimulator Hook] 👁️ isInView changed:', {
        previous: prevIsInViewRef.current,
        current: isInView,
        autoPlay,
        hasStartedAutoPlay: hasStartedAutoPlayRef.current,
        isPlaying: conversationFlow.state.isPlaying
      });

      prevIsInViewRef.current = isInView;

      // Start autoplay when coming into view (can happen multiple times if user scrolls)
      if (autoPlay && isInView && !conversationFlow.state.isPlaying) {
        // Reset the flag if we're not playing - allows restart on scroll back
        hasStartedAutoPlayRef.current = false;

        if (!hasStartedAutoPlayRef.current) {
          hasStartedAutoPlayRef.current = true;

          // Small delay to ensure smooth transition
          setTimeout(() => {
            console.log('[WhatsAppSimulator Hook] ▶️ Starting play from reactive effect');
            conversationFlow.actions.play();
          }, 100);
        }
      } else if (!isInView && conversationFlow.state.isPlaying) {
        // Optional: pause when out of view (uncomment if desired)
        // console.log('[WhatsAppSimulator Hook] ⏸️ Pausing (out of view)');
        // conversationFlow.actions.pause();
      }
    }
  }, [isInitialized, isInView, autoPlay, conversationFlow?.isReady, conversationFlow?.state?.isPlaying, conversationFlow?.actions]);

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

  // Handle auto-restart when animation completes (12 second cycle like original)
  useEffect(() => {
    if (isCompleted && autoPlay && isInView) {
      console.log('[WhatsAppSimulator Hook] 🔄 Animation completed, scheduling restart');

      // Schedule restart after 2 seconds (gives time to see completion)
      // Original hero restarts at 12 seconds total, animation is ~10s
      const restartTimer = setTimeout(() => {
        if (isInView) {  // Double-check still in view before restarting
          console.log('[WhatsAppSimulator Hook] 🔄 Restarting animation cycle');
          conversationFlow.actions.reset();

          // Small delay before playing again
          setTimeout(() => {
            conversationFlow.actions.play();
          }, 100);
        }
      }, 2000);  // 2 second delay after completion

      return () => clearTimeout(restartTimer);
    }
  }, [isCompleted, isInView, autoPlay, conversationFlow.actions]);

  // =============================================================================
  // CLEANUP EFFECT - Memory management
  // =============================================================================

  useEffect(() => {
    return () => {
      // Clean up on unmount
      console.log('[WhatsAppSimulator Hook] Cleaning up...');
      if (conversationFlow?.actions?.cleanup) {
        conversationFlow.actions.cleanup();
      }
    };
  }, [conversationFlow?.actions]);

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
    initialize: (template: ConversationTemplate) => initializeConversation(template, autoPlay && isInView),
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

  // CRITICAL DEBUG: Add messages logging
  useEffect(() => {
    console.log('🚨 [useWhatsAppSimulator] CRITICAL STATE CHECK:', {
      timestamp: new Date().toISOString(),
      messagesInConversationFlowState: conversationFlow.state?.messages?.length || 0,
      messagesPreview: conversationFlow.state?.messages?.slice(0, 2)?.map(m => ({
        sender: m.sender,
        content: m.content?.substring(0, 30)
      })),
      conversationInFlowState: !!conversationFlow.state?.conversation,
      conversationMessages: conversationFlow.state?.conversation?.messages?.length || 0,
      localConversationMessages: conversation?.messages?.length || 0,
      currentMessageIndex: conversationFlow.state?.currentMessageIndex,
      isPlaying: conversationFlow.state?.isPlaying
    });
  }, [conversationFlow.state, conversation]);

  const result = {
    state,
    actions,
    isPlaying,
    isPaused,
    isCompleted,
    currentProgress,
    onMessageClick,
    onFlowStepClick,
    onBadgeClick,
    // Additional properties needed by the container
    conversationFlow,
    typingIndicator,
    flowExecution
  };

  console.log('[WhatsAppSimulator Hook] Returning:', {
    hasState: !!result.state,
    hasActions: !!result.actions,
    hasConversationFlow: !!result.conversationFlow,
    hasTypingIndicator: !!result.typingIndicator,
    hasFlowExecution: !!result.flowExecution,
    stateIsInitialized: result.state?.isInitialized,
    messagesInFlow: result.conversationFlow?.state?.messages?.length || 0
  });

  return result;
};

// =============================================================================
// HOOK TYPE EXPORT - For TypeScript support
// =============================================================================

export type UseWhatsAppSimulatorReturn = ReturnType<typeof useWhatsAppSimulator>;