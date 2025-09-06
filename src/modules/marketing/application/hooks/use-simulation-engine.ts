/**
 * Simulation Engine Hook
 * Core engine for managing WhatsApp conversation simulations
 */

'use client';

import { useCallback, useEffect, useMemo,useRef, useState } from 'react';

import {
  AnimationAction,
  BaseMessage,
  FlowDefinition,
  MessageSequenceItem,
  SimulationEngineOptions,
  SimulationMetrics,
  SimulationScenario,
  SimulationState,
  SimulationType} from '@/modules/marketing/domain/types/simulation.types';

/**
 * Default initial state
 */
const getInitialState = (scenario: SimulationType): SimulationState => ({
  currentScenario: scenario,
  messagePhase: 0,
  isTyping: false,
  typingEntity: null,
  flowActive: false,
  currentFlow: null,
  flowStep: null,
  collectedData: {},
  animationSpeed: 1,
  isPaused: false,
  isComplete: false
});

/**
 * Simulation Engine Hook
 * Manages the complete lifecycle of conversation simulations
 */
export const useSimulationEngine = (options: SimulationEngineOptions = {}) => {
  const {
    initialScenario = 'restaurant-reservation',
    autoPlay = true,
    loop = true,
    speed = 1,
    onScenarioComplete,
    onFlowComplete,
    onMessageShown,
    debug = false
  } = options;

  // State management
  const [state, setState] = useState<SimulationState>(getInitialState(initialScenario));
  const [scenario, setScenario] = useState<SimulationScenario | null>(null);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    messagesShown: 0,
    flowsCompleted: 0,
    totalDuration: 0,
    userInteractions: 0,
    completionRate: 0
  });

  // Refs for animation control
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const sequenceRef = useRef<MessageSequenceItem[]>([]);

  // Debug logging
  const log = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`[SimulationEngine] ${message}`, data || '');
    }
  }, [debug]);

  /**
   * Clear all active timers
   */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    log('Timers cleared');
  }, [log]);

  /**
   * Load a scenario dynamically
   */
  const loadScenario = useCallback(async (type: SimulationType) => {
    try {
      clearTimers();

      // Dynamic import of scenario
      const scenarioModule = await import(`@/modules/marketing/domain/scenarios/${type}`);
      const ScenarioClass = scenarioModule.default;
      const newScenario = new ScenarioClass();

      setScenario(newScenario);
      setState(getInitialState(type));
      setMetrics({
        messagesShown: 0,
        flowsCompleted: 0,
        totalDuration: 0,
        userInteractions: 0,
        completionRate: 0
      });

      // Generate animation sequence
      if (newScenario.generateMessageSequence) {
        sequenceRef.current = newScenario.generateMessageSequence();
      }

      startTimeRef.current = Date.now();
      log('Scenario loaded', { type, messages: newScenario.messages.length });

      // Start simulation if autoPlay is enabled
      // Use setTimeout to ensure state is updated before starting
      if (autoPlay) {
        setTimeout(() => {
          startSimulation();
        }, 100);
      }
    } catch (error) {
      console.error(`Failed to load scenario: ${type}`, error);
    }
  }, [clearTimers, log]);

  /**
   * Execute an animation action
   */
  const executeAction = useCallback((action: AnimationAction) => {
    log('Executing action', action);

    setState(prev => {
      switch (action.type) {
        case 'show-message':
          const newPhase = prev.messagePhase + 1;

          // Track metrics
          setMetrics(m => ({ ...m, messagesShown: m.messagesShown + 1 }));

          // Trigger callback
          if (scenario && action.messageId) {
            const message = scenario.messages.find(m => m.id === action.messageId);
            if (message && onMessageShown) {
              onMessageShown(message);
            }
          }

          return {
            ...prev,
            messagePhase: newPhase,
            isTyping: false,
            typingEntity: null
          };

        case 'start-typing':
          return {
            ...prev,
            isTyping: true,
            typingEntity: action.entity || null
          };

        case 'stop-typing':
          return {
            ...prev,
            isTyping: false,
            typingEntity: null
          };

        case 'show-flow':
          return {
            ...prev,
            flowActive: true,
            currentFlow: action.flowId || null,
            flowStep: scenario?.flows.find(f => f.id === action.flowId)?.steps[0]?.id || null
          };

        case 'next-flow-step':
          if (!scenario || !prev.currentFlow) return prev;

          const flow = scenario.flows.find(f => f.id === prev.currentFlow);
          if (!flow) return prev;

          const currentStepIndex = flow.steps.findIndex(s => s.id === prev.flowStep);
          const nextStep = flow.steps[currentStepIndex + 1];

          if (nextStep) {
            return { ...prev, flowStep: nextStep.id };
          } else {
            // Flow complete
            setMetrics(m => ({ ...m, flowsCompleted: m.flowsCompleted + 1 }));
            if (onFlowComplete) {
              onFlowComplete(prev.currentFlow, prev.collectedData);
            }
            return {
              ...prev,
              flowActive: false,
              currentFlow: null,
              flowStep: null
            };
          }

        case 'hide-flow':
          return {
            ...prev,
            flowActive: false,
            currentFlow: null,
            flowStep: null
          };

        case 'complete':
          const duration = Date.now() - startTimeRef.current;
          setMetrics(m => ({
            ...m,
            totalDuration: duration,
            completionRate: 100
          }));

          if (onScenarioComplete) {
            onScenarioComplete(prev.currentScenario);
          }

          if (loop) {
            // Reset for loop
            setTimeout(() => {
              setState(getInitialState(prev.currentScenario));
              startSimulation();
            }, 2000);
          }

          return { ...prev, isComplete: true };

        case 'reset':
          return getInitialState(prev.currentScenario);

        default:
          return prev;
      }
    });
  }, [scenario, onMessageShown, onFlowComplete, onScenarioComplete, loop, log]);

  /**
   * Start the simulation animation sequence
   */
  const startSimulation = useCallback(() => {
    // Use refs to get current values to avoid stale closures
    const currentScenario = scenario;
    const currentSequence = sequenceRef.current;
    const currentSpeed = state.animationSpeed || 1;
    
    if (!currentScenario || !currentSequence || currentSequence.length === 0 || state.isPaused) {
      log('Cannot start simulation', { 
        hasScenario: !!currentScenario, 
        sequenceLength: currentSequence?.length || 0,
        isPaused: state.isPaused 
      });
      return;
    }

    clearTimers();
    log('Starting simulation', { 
      scenario: currentScenario.id, 
      messages: currentScenario.messages.length,
      sequenceItems: currentSequence.length 
    });

    // Schedule all actions from sequence
    currentSequence.forEach(item => {
      const timer = setTimeout(() => {
        executeAction(item.action);
      }, item.delay / currentSpeed);

      timersRef.current.push(timer);
    });

    // Schedule completion
    const completeTimer = setTimeout(() => {
      executeAction({ type: 'complete' });
    }, (currentScenario.duration || 30000) / currentSpeed);

    timersRef.current.push(completeTimer);
  }, [scenario, state.isPaused, state.animationSpeed, clearTimers, executeAction, log]);

  /**
   * Pause the simulation
   */
  const pause = useCallback(() => {
    clearTimers();
    setState(prev => ({ ...prev, isPaused: true }));
    log('Simulation paused');
  }, [clearTimers, log]);

  /**
   * Resume the simulation
   */
  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
    startSimulation();
    log('Simulation resumed');
  }, [startSimulation, log]);

  /**
   * Reset the simulation
   */
  const reset = useCallback(() => {
    clearTimers();
    setState(getInitialState(state.currentScenario));
    setMetrics({
      messagesShown: 0,
      flowsCompleted: 0,
      totalDuration: 0,
      userInteractions: 0,
      completionRate: 0
    });
    startTimeRef.current = Date.now();

    if (autoPlay) {
      startSimulation();
    }
    log('Simulation reset');
  }, [state.currentScenario, autoPlay, clearTimers, startSimulation, log]);

  /**
   * Change animation speed
   */
  const setSpeed = useCallback((newSpeed: number) => {
    setState(prev => ({ ...prev, animationSpeed: newSpeed }));
    log('Speed changed', { speed: newSpeed });
  }, [log]);

  /**
   * Handle flow input from user
   */
  const handleFlowInput = useCallback((stepId: string, value: any) => {
    setState(prev => ({
      ...prev,
      collectedData: {
        ...prev.collectedData,
        [stepId]: value
      }
    }));

    setMetrics(m => ({ ...m, userInteractions: m.userInteractions + 1 }));

    // Auto-advance to next step
    executeAction({ type: 'next-flow-step' });
  }, [executeAction]);

  /**
   * Change to a different scenario
   */
  const changeScenario = useCallback((type: SimulationType) => {
    loadScenario(type);
  }, [loadScenario]);

  // Effects
  useEffect(() => {
    loadScenario(initialScenario);

    return () => {
      clearTimers();
    };
  }, [initialScenario, loadScenario, clearTimers]);

  // Start simulation when scenario is loaded and autoPlay is enabled
  useEffect(() => {
    if (scenario && autoPlay && !state.isPaused && !state.isComplete && sequenceRef.current.length > 0) {
      const timer = setTimeout(() => {
        // Clear any existing timers first
        clearTimers();
        
        // Schedule all actions from sequence
        const currentSpeed = state.animationSpeed || 1;
        sequenceRef.current.forEach(item => {
          const actionTimer = setTimeout(() => {
            executeAction(item.action);
          }, item.delay / currentSpeed);
          timersRef.current.push(actionTimer);
        });

        // Schedule completion
        const completeTimer = setTimeout(() => {
          executeAction({ type: 'complete' });
        }, (scenario.duration || 30000) / currentSpeed);
        timersRef.current.push(completeTimer);
        
        log('Simulation started via effect', { 
          scenario: scenario.id, 
          messages: scenario.messages.length,
          sequenceItems: sequenceRef.current.length 
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [scenario, autoPlay, state.isPaused, state.isComplete, state.animationSpeed, clearTimers, executeAction, log]);

  // Computed values
  const visibleMessages = useMemo(() => {
    if (!scenario) return [];
    return scenario.messages.slice(0, state.messagePhase);
  }, [scenario, state.messagePhase]);

  const currentFlow = useMemo(() => {
    if (!scenario || !state.currentFlow) return null;
    return scenario.flows.find(f => f.id === state.currentFlow) || null;
  }, [scenario, state.currentFlow]);

  const currentFlowStep = useMemo(() => {
    if (!currentFlow || !state.flowStep) return null;
    return currentFlow.steps.find(s => s.id === state.flowStep) || null;
  }, [currentFlow, state.flowStep]);

  const progress = useMemo(() => {
    if (!scenario) return 0;
    return (state.messagePhase / scenario.messages.length) * 100;
  }, [scenario, state.messagePhase]);

  return {
    // State
    state,
    scenario,
    metrics,

    // Control methods
    pause,
    resume,
    reset,
    setSpeed,
    changeScenario,
    handleFlowInput,

    // Computed values
    visibleMessages,
    currentFlow,
    currentFlowStep,
    progress,

    // Utilities
    isPlaying: !state.isPaused && !state.isComplete,
    canInteract: state.flowActive && !state.isPaused
  };
};

export default useSimulationEngine;