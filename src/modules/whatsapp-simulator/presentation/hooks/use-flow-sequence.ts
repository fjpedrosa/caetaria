/**
 * Hook for managing flow sequence in WhatsApp Simulator
 * Extracts flow sequence logic following Clean Architecture principles
 */

import { useCallback, useState } from 'react';

import type {
  FlowSequenceConfig,
  FlowStepData,
  FlowStepId,
  ReservationData,
  UseFlowSequenceReturn} from '../../domain/types';

import { reservationDataHelpers,useReservationData } from './use-reservation-data';

/**
 * Custom hook for managing WhatsApp Flow sequence
 * Handles step progression, data updates, and timing
 */
export const useFlowSequence = (config: FlowSequenceConfig = {}): UseFlowSequenceReturn => {
  const [showFlow, setShowFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStepId>('guests');

  // Use reservation data hook for state management
  const {
    data: reservationData,
    updateAll: updateReservationData,
    resetData: resetReservationData
  } = useReservationData();

  // Start automated flow sequence with proper timing and cleanup
  const startFlowSequence = useCallback(() => {
    const sequence = [
      { step: 'guests' as FlowStepId, delay: 1500 },
      { step: 'date' as FlowStepId, delay: 4000 },
      { step: 'time' as FlowStepId, delay: 6500 },
      { step: 'confirmation' as FlowStepId, delay: 9000 },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    sequence.forEach(({ step, delay }) => {
      const timeoutId = setTimeout(() => {
        setFlowStep(step);

        // Notify parent component about flow step
        const stepData = config.scenario?.flowSteps?.find(s => s.id === step);
        if (stepData) {
          config.onFlowStep?.(stepData);
        }

        // Update reservation data with mock data for each step
        const mockData = reservationDataHelpers.generateMockData(step);
        updateReservationData(mockData);
      }, delay);

      timeouts.push(timeoutId);
    });

    // Close flow after confirmation
    const closeTimeout = setTimeout(() => {
      setShowFlow(false);
    }, 10500);
    timeouts.push(closeTimeout);

    // Return cleanup function
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [config.scenario?.flowSteps, config.onFlowStep, updateReservationData]);

  // Reset flow to initial state
  const resetFlow = useCallback(() => {
    setShowFlow(false);
    setFlowStep('guests');
    resetReservationData();
  }, [resetReservationData]);

  // Check if flow is complete
  const isFlowComplete = reservationDataHelpers.isComplete(reservationData, 'confirmation') && flowStep === 'confirmation';

  return {
    showFlow,
    flowStep,
    reservationData,
    setFlowStep,
    setShowFlow,
    startFlowSequence,
    updateReservationData,
    resetFlow,
    isFlowComplete
  };
};

/**
 * Flow sequence utilities and helpers
 */
export const flowSequenceHelpers = {
  // Get step number for display
  getStepNumber: (step: FlowStepId): number => {
    const stepMap: Record<FlowStepId, number> = {
      guests: 1,
      date: 2,
      time: 3,
      confirmation: 4
    };
    return stepMap[step] || 1;
  },

  // Get total number of steps
  getTotalSteps: (): number => 4,

  // Get step title for display
  getStepTitle: (step: FlowStepId): string => {
    const titleMap: Record<FlowStepId, string> = {
      guests: '¿Cuántas personas?',
      date: '¿Qué día prefieres?',
      time: '¿A qué hora?',
      confirmation: '¡Reserva confirmada!'
    };
    return titleMap[step] || 'Paso desconocido';
  },

  // Check if step is completed
  isStepCompleted: (step: FlowStepId, data: ReservationData): boolean => {
    switch (step) {
      case 'guests':
        return data.guests > 0;
      case 'date':
        return data.date !== '';
      case 'time':
        return data.time !== '';
      case 'confirmation':
        return reservationDataHelpers.isComplete(data, 'confirmation');
      default:
        return false;
    }
  },

  // Get next step in sequence
  getNextStep: (currentStep: FlowStepId): FlowStepId | null => {
    const stepSequence: FlowStepId[] = ['guests', 'date', 'time', 'confirmation'];
    const currentIndex = stepSequence.indexOf(currentStep);

    if (currentIndex >= 0 && currentIndex < stepSequence.length - 1) {
      return stepSequence[currentIndex + 1];
    }

    return null;
  },

  // Get previous step in sequence
  getPreviousStep: (currentStep: FlowStepId): FlowStepId | null => {
    const stepSequence: FlowStepId[] = ['guests', 'date', 'time', 'confirmation'];
    const currentIndex = stepSequence.indexOf(currentStep);

    if (currentIndex > 0) {
      return stepSequence[currentIndex - 1];
    }

    return null;
  },

  // Get progress percentage
  getProgressPercentage: (step: FlowStepId): number => {
    const stepNumber = flowSequenceHelpers.getStepNumber(step);
    const totalSteps = flowSequenceHelpers.getTotalSteps();
    return Math.round((stepNumber / totalSteps) * 100);
  },

  // Get step indicator status
  getStepIndicatorStatus: (targetStep: FlowStepId, currentStep: FlowStepId, data: ReservationData) => {
    const targetStepNumber = flowSequenceHelpers.getStepNumber(targetStep);
    const currentStepNumber = flowSequenceHelpers.getStepNumber(currentStep);

    if (targetStepNumber < currentStepNumber) {
      return 'completed';
    } else if (targetStepNumber === currentStepNumber) {
      return 'active';
    } else {
      return 'pending';
    }
  }
};