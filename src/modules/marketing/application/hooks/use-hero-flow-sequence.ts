/**
 * useHeroFlowSequence - Hook for managing WhatsApp flow sequence in hero section
 * Extracted from HeroMobileDemoV2 to follow Single Responsibility Principle
 * Handles flow step progression, data updates, and timing
 */

import { useCallback, useMemo,useState } from 'react';

// Domain types - these will be moved to domain/types.ts later
export type FlowStep = 'guests' | 'date' | 'time' | 'confirmation';

export interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

export interface FlowSequenceStep {
  step: FlowStep;
  delay: number;
  mockData?: Partial<ReservationData>;
}

export interface HeroFlowSequenceOptions {
  customSequence?: FlowSequenceStep[];
  onStepChange?: (step: FlowStep, data: ReservationData) => void;
  onFlowComplete?: (data: ReservationData) => void;
  autoCloseDelay?: number;
}

export interface HeroFlowSequenceResult {
  // Flow state
  flowStep: FlowStep;
  reservationData: ReservationData;
  isFlowActive: boolean;

  // Flow control
  startFlowSequence: () => void;
  stopFlowSequence: () => void;
  resetFlow: () => void;
  nextStep: () => void;
  previousStep: () => void;
  jumpToStep: (step: FlowStep) => void;

  // Data management
  updateReservationData: (data: Partial<ReservationData>) => void;
  resetReservationData: () => void;

  // Utilities
  getStepIndex: (step: FlowStep) => number;
  getTotalSteps: () => number;
  getStepTitle: (step: FlowStep) => string;
  isStepCompleted: (step: FlowStep) => boolean;
  getProgress: () => number;
}

// Default flow sequence
const DEFAULT_FLOW_SEQUENCE: FlowSequenceStep[] = [
  {
    step: 'guests',
    delay: 1500,
    mockData: { guests: 6 }
  },
  {
    step: 'date',
    delay: 4000,
    mockData: {
      date: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })()
    }
  },
  {
    step: 'time',
    delay: 6500,
    mockData: { time: '19:00' }
  },
  {
    step: 'confirmation',
    delay: 9000,
    mockData: {}
  }
];

// Initial reservation data
const INITIAL_RESERVATION_DATA: ReservationData = {
  guests: 0,
  date: '',
  time: ''
};

// Step titles for display
const STEP_TITLES: Record<FlowStep, string> = {
  guests: '¿Cuántas personas?',
  date: '¿Qué día prefieres?',
  time: '¿A qué hora?',
  confirmation: '¡Reserva confirmada!'
};

export const useHeroFlowSequence = (
  options: HeroFlowSequenceOptions = {}
): HeroFlowSequenceResult => {
  const {
    customSequence = DEFAULT_FLOW_SEQUENCE,
    onStepChange,
    onFlowComplete,
    autoCloseDelay = 10500
  } = options;

  // Flow state
  const [flowStep, setFlowStep] = useState<FlowStep>('guests');
  const [reservationData, setReservationData] = useState<ReservationData>(INITIAL_RESERVATION_DATA);
  const [isFlowActive, setIsFlowActive] = useState(false);

  // Timer management
  const [flowTimers, setFlowTimers] = useState<NodeJS.Timeout[]>([]);

  // Clear all flow timers
  const clearFlowTimers = useCallback(() => {
    flowTimers.forEach(clearTimeout);
    setFlowTimers([]);
  }, [flowTimers]);

  // Update reservation data
  const updateReservationData = useCallback((data: Partial<ReservationData>) => {
    setReservationData(prev => {
      const newData = { ...prev, ...data };
      onStepChange?.(flowStep, newData);
      return newData;
    });
  }, [flowStep, onStepChange]);

  // Reset reservation data
  const resetReservationData = useCallback(() => {
    setReservationData(INITIAL_RESERVATION_DATA);
  }, []);

  // Process flow step
  const processFlowStep = useCallback((step: FlowStep, mockData?: Partial<ReservationData>) => {
    setFlowStep(step);

    if (mockData) {
      updateReservationData(mockData);
    }

    // Notify step change
    onStepChange?.(step, reservationData);

    // Check if flow is complete
    if (step === 'confirmation') {
      onFlowComplete?.(reservationData);
    }
  }, [reservationData, updateReservationData, onStepChange, onFlowComplete]);

  // Start flow sequence with automated step progression
  const startFlowSequence = useCallback(() => {
    if (isFlowActive) return;

    setIsFlowActive(true);
    clearFlowTimers();

    const newTimers: NodeJS.Timeout[] = [];

    customSequence.forEach(({ step, delay, mockData }) => {
      const timer = setTimeout(() => {
        processFlowStep(step, mockData);
      }, delay);
      newTimers.push(timer);
    });

    // Auto-close flow after completion
    const closeTimer = setTimeout(() => {
      setIsFlowActive(false);
    }, autoCloseDelay);
    newTimers.push(closeTimer);

    setFlowTimers(newTimers);
  }, [
    isFlowActive,
    customSequence,
    processFlowStep,
    autoCloseDelay,
    clearFlowTimers
  ]);

  // Stop flow sequence
  const stopFlowSequence = useCallback(() => {
    setIsFlowActive(false);
    clearFlowTimers();
  }, [clearFlowTimers]);

  // Reset flow to initial state
  const resetFlow = useCallback(() => {
    setFlowStep('guests');
    resetReservationData();
    setIsFlowActive(false);
    clearFlowTimers();
  }, [resetReservationData, clearFlowTimers]);

  // Step navigation utilities
  const stepOrder: FlowStep[] = ['guests', 'date', 'time', 'confirmation'];

  const getStepIndex = useCallback((step: FlowStep): number => {
    return stepOrder.indexOf(step);
  }, []);

  const getTotalSteps = useCallback((): number => {
    return stepOrder.length;
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = getStepIndex(flowStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStepValue = stepOrder[currentIndex + 1];
      setFlowStep(nextStepValue);
      onStepChange?.(nextStepValue, reservationData);
    }
  }, [flowStep, reservationData, getStepIndex, onStepChange]);

  const previousStep = useCallback(() => {
    const currentIndex = getStepIndex(flowStep);
    if (currentIndex > 0) {
      const prevStepValue = stepOrder[currentIndex - 1];
      setFlowStep(prevStepValue);
      onStepChange?.(prevStepValue, reservationData);
    }
  }, [flowStep, reservationData, getStepIndex, onStepChange]);

  const jumpToStep = useCallback((step: FlowStep) => {
    if (stepOrder.includes(step)) {
      setFlowStep(step);
      onStepChange?.(step, reservationData);
    }
  }, [reservationData, onStepChange]);

  // Get step title
  const getStepTitle = useCallback((step: FlowStep): string => {
    return STEP_TITLES[step] || 'Paso desconocido';
  }, []);

  // Check if step is completed (has required data)
  const isStepCompleted = useCallback((step: FlowStep): boolean => {
    switch (step) {
      case 'guests':
        return reservationData.guests > 0;
      case 'date':
        return reservationData.date !== '';
      case 'time':
        return reservationData.time !== '';
      case 'confirmation':
        return reservationData.guests > 0 &&
               reservationData.date !== '' &&
               reservationData.time !== '';
      default:
        return false;
    }
  }, [reservationData]);

  // Calculate progress percentage
  const getProgress = useCallback((): number => {
    const currentIndex = getStepIndex(flowStep);
    const totalSteps = getTotalSteps();
    return Math.round(((currentIndex + 1) / totalSteps) * 100);
  }, [flowStep, getStepIndex, getTotalSteps]);

  // Cleanup timers on unmount
  useState(() => {
    return () => {
      clearFlowTimers();
    };
  });

  return {
    // Flow state
    flowStep,
    reservationData,
    isFlowActive,

    // Flow control
    startFlowSequence,
    stopFlowSequence,
    resetFlow,
    nextStep,
    previousStep,
    jumpToStep,

    // Data management
    updateReservationData,
    resetReservationData,

    // Utilities
    getStepIndex,
    getTotalSteps,
    getStepTitle,
    isStepCompleted,
    getProgress
  };
};

// Utility functions for flow sequence management
export const heroFlowSequenceHelpers = {
  // Create custom flow sequence
  createFlowSequence: (
    steps: Partial<FlowSequenceStep>[],
    baseDelay: number = 1000
  ): FlowSequenceStep[] => {
    const stepOrder: FlowStep[] = ['guests', 'date', 'time', 'confirmation'];

    return stepOrder.map((step, index) => ({
      step,
      delay: baseDelay * (index + 1),
      mockData: {},
      ...steps[index]
    }));
  },

  // Generate mock reservation data
  generateMockData: (step: FlowStep): Partial<ReservationData> => {
    switch (step) {
      case 'guests':
        return { guests: Math.floor(Math.random() * 8) + 2 }; // 2-10 guests
      case 'date':
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days ahead
        return { date: date.toISOString().split('T')[0] };
      case 'time':
        const hours = [18, 19, 20, 21]; // Common dinner times
        const randomHour = hours[Math.floor(Math.random() * hours.length)];
        const minutes = ['00', '30'][Math.floor(Math.random() * 2)];
        return { time: `${randomHour}:${minutes}` };
      default:
        return {};
    }
  },

  // Validate reservation data
  validateReservationData: (data: ReservationData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (data.guests <= 0) {
      errors.push('Debe seleccionar al menos 1 persona');
    }

    if (data.guests > 20) {
      errors.push('Máximo 20 personas permitidas');
    }

    if (!data.date) {
      errors.push('Debe seleccionar una fecha');
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push('La fecha debe ser futura');
      }
    }

    if (!data.time) {
      errors.push('Debe seleccionar una hora');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format reservation data for display
  formatReservationData: (data: ReservationData): string => {
    const { guests, date, time } = data;

    if (!guests || !date || !time) {
      return 'Reserva incompleta';
    }

    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const guestText = guests === 1 ? '1 persona' : `${guests} personas`;

    return `${guestText} el ${formattedDate} a las ${time}`;
  },

  // Get step icon
  getStepIcon: (step: FlowStep): string => {
    const icons: Record<FlowStep, string> = {
      guests: '👥',
      date: '📅',
      time: '⏰',
      confirmation: '✅'
    };

    return icons[step] || '❓';
  },

  // Check if all steps are completed
  isFlowComplete: (data: ReservationData): boolean => {
    return data.guests > 0 && data.date !== '' && data.time !== '';
  }
};