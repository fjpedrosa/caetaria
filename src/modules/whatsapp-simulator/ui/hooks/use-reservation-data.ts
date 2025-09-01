/**
 * useReservationData - Hook for managing reservation form data
 * Extracted from WhatsAppSimulator to follow Single Responsibility Principle
 */

import { useCallback, useMemo,useState } from 'react';

import { FlowStepId,ReservationData } from '../../domain/types';

export interface UseReservationDataOptions {
  initialData?: Partial<ReservationData>;
  onDataChange?: (data: ReservationData) => void;
  validateData?: boolean;
}

export interface ReservationDataResult {
  // Current reservation data
  data: ReservationData;

  // Update functions
  updateGuests: (guests: number) => void;
  updateDate: (date: string) => void;
  updateTime: (time: string) => void;
  updateAll: (data: Partial<ReservationData>) => void;

  // Reset function
  resetData: () => void;

  // Validation
  isValidForStep: (step: FlowStepId) => boolean;
  getValidationErrors: () => Record<keyof ReservationData, string[]>;

  // Progress tracking
  completionPercentage: number;
  nextRequiredField: keyof ReservationData | null;

  // Formatted data for display
  formattedData: {
    guestText: string;
    dateText: string;
    timeText: string;
    summaryText: string;
  };
}

const initialReservationData: ReservationData = {
  guests: 0,
  date: '',
  time: ''
};

export const useReservationData = (
  options: UseReservationDataOptions = {}
): ReservationDataResult => {
  const {
    initialData = {},
    onDataChange,
    validateData = true
  } = options;

  // Initialize state with provided initial data
  const [data, setData] = useState<ReservationData>(() => ({
    ...initialReservationData,
    ...initialData
  }));

  // Update guests count
  const updateGuests = useCallback((guests: number) => {
    if (guests < 0 || guests > 20) return; // Reasonable limits

    setData(prevData => {
      const newData = { ...prevData, guests };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  // Update date
  const updateDate = useCallback((date: string) => {
    if (!isValidDate(date)) return;

    setData(prevData => {
      const newData = { ...prevData, date };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  // Update time
  const updateTime = useCallback((time: string) => {
    if (!isValidTime(time)) return;

    setData(prevData => {
      const newData = { ...prevData, time };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  // Update multiple fields at once
  const updateAll = useCallback((updates: Partial<ReservationData>) => {
    setData(prevData => {
      const newData = { ...prevData, ...updates };
      onDataChange?.(newData);
      return newData;
    });
  }, [onDataChange]);

  // Reset to initial state
  const resetData = useCallback(() => {
    const resetData = {
      ...initialReservationData,
      ...initialData
    };
    setData(resetData);
    onDataChange?.(resetData);
  }, [initialData, onDataChange]);

  // Validation for specific flow steps
  const isValidForStep = useCallback((step: FlowStepId): boolean => {
    if (!validateData) return true;

    switch (step) {
      case 'guests':
        return data.guests > 0 && data.guests <= 20;
      case 'date':
        return isValidDate(data.date) && isFutureDate(data.date);
      case 'time':
        return isValidTime(data.time);
      case 'confirmation':
        return data.guests > 0 &&
               isValidDate(data.date) &&
               isFutureDate(data.date) &&
               isValidTime(data.time);
      default:
        return false;
    }
  }, [data, validateData]);

  // Get detailed validation errors
  const getValidationErrors = useCallback((): Record<keyof ReservationData, string[]> => {
    const errors: Record<keyof ReservationData, string[]> = {
      guests: [],
      date: [],
      time: []
    };

    if (!validateData) return errors;

    // Validate guests
    if (data.guests <= 0) {
      errors.guests.push('At least 1 guest is required');
    }
    if (data.guests > 20) {
      errors.guests.push('Maximum 20 guests allowed');
    }

    // Validate date
    if (!data.date) {
      errors.date.push('Date is required');
    } else if (!isValidDate(data.date)) {
      errors.date.push('Invalid date format');
    } else if (!isFutureDate(data.date)) {
      errors.date.push('Date must be in the future');
    }

    // Validate time
    if (!data.time) {
      errors.time.push('Time is required');
    } else if (!isValidTime(data.time)) {
      errors.time.push('Invalid time format');
    }

    return errors;
  }, [data, validateData]);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    let completed = 0;
    const total = 3;

    if (data.guests > 0) completed++;
    if (isValidDate(data.date) && isFutureDate(data.date)) completed++;
    if (isValidTime(data.time)) completed++;

    return (completed / total) * 100;
  }, [data]);

  // Get next required field
  const nextRequiredField = useMemo((): keyof ReservationData | null => {
    if (data.guests <= 0) return 'guests';
    if (!isValidDate(data.date) || !isFutureDate(data.date)) return 'date';
    if (!isValidTime(data.time)) return 'time';
    return null;
  }, [data]);

  // Formatted data for display
  const formattedData = useMemo(() => {
    const guestText = data.guests > 0
      ? `${data.guests} ${data.guests === 1 ? 'guest' : 'guests'}`
      : 'No guests selected';

    const dateText = data.date
      ? formatDisplayDate(data.date)
      : 'No date selected';

    const timeText = data.time
      ? formatDisplayTime(data.time)
      : 'No time selected';

    const summaryText = data.guests > 0 && data.date && data.time
      ? `${guestText} on ${dateText} at ${timeText}`
      : 'Incomplete reservation';

    return {
      guestText,
      dateText,
      timeText,
      summaryText
    };
  }, [data]);

  return {
    data,
    updateGuests,
    updateDate,
    updateTime,
    updateAll,
    resetData,
    isValidForStep,
    getValidationErrors,
    completionPercentage,
    nextRequiredField,
    formattedData
  };
};

// Utility functions for validation and formatting
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

const isFutureDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

const isValidTime = (timeString: string): boolean => {
  if (!timeString) return false;
  return timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) !== null;
};

const formatDisplayDate = (dateString: string): string => {
  if (!isValidDate(dateString)) return dateString;

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDisplayTime = (timeString: string): string => {
  if (!isValidTime(timeString)) return timeString;

  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';

  return `${hour12}:${minutes} ${ampm}`;
};

// Hook for automatically generating reservation data for demos
export interface AutoReservationOptions {
  guestRange?: [number, number];
  daysInFuture?: number;
  timeRange?: [string, string]; // ['09:00', '22:00']
  generateRandomly?: boolean;
}

export const useAutoReservation = (options: AutoReservationOptions = {}) => {
  const {
    guestRange = [2, 8],
    daysInFuture = 1,
    timeRange = ['18:00', '21:00'],
    generateRandomly = false
  } = options;

  const generateReservationData = useCallback((): ReservationData => {
    // Generate guests
    const [minGuests, maxGuests] = guestRange;
    const guests = generateRandomly
      ? Math.floor(Math.random() * (maxGuests - minGuests + 1)) + minGuests
      : Math.floor((minGuests + maxGuests) / 2);

    // Generate date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysInFuture);
    const date = futureDate.toISOString().split('T')[0];

    // Generate time
    const [startTime, endTime] = timeRange;
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const hour = generateRandomly
      ? Math.floor(Math.random() * (endHour - startHour + 1)) + startHour
      : Math.floor((startHour + endHour) / 2);
    const minute = generateRandomly ? Math.floor(Math.random() * 4) * 15 : 0; // 0, 15, 30, or 45
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    return { guests, date, time };
  }, [guestRange, daysInFuture, timeRange, generateRandomly]);

  return { generateReservationData };
};

// ============================================================================
// HERO-COMPATIBLE HELPERS - Specific helpers for hero-demo compatibility
// ============================================================================

/**
 * Hero-compatible helpers that match the exact behavior of hero-mobile-demo.tsx
 * These helpers ensure FlowPanel renders identically to the hero when heroCompatible=true
 *
 * Key Differences from default helpers:
 * - getAvailableDates: Returns exactly 3 dates (today, tomorrow, day after)
 * - getAvailableTimeSlots: Returns exactly ['18:00', '19:00', '20:00', '21:00']
 * - formatDate: Uses Spanish locale 'es-ES' with specific format
 */
export const heroCompatibleHelpers = {
  /**
   * Get available dates for hero demo - exactly 3 dates like hero-mobile-demo.tsx lines 162-167
   */
  getAvailableDates: (): Date[] => {
    const today = new Date();
    return Array.from({ length: 3 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  },

  /**
   * Get available time slots for hero demo - exactly like hero-mobile-demo.tsx line 208
   */
  getAvailableTimeSlots: (): string[] => {
    return ['18:00', '19:00', '20:00', '21:00'];
  },

  /**
   * Format date for hero demo - Spanish format like hero-mobile-demo.tsx lines 193-197 and 241-245
   */
  formatDate: (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }
};

// ============================================================================
// RESERVATION DATA HELPERS - Utility functions for reservation components
// ============================================================================

/**
 * Helper functions for reservation data manipulation and validation
 * Exported as an object to maintain functional programming approach
 */
export const reservationDataHelpers = {
  /**
   * Validate a date string
   */
  isValidDate,

  /**
   * Check if date is in the future
   */
  isFutureDate,

  /**
   * Validate time format
   */
  isValidTime,

  /**
   * Format date for display
   */
  formatDisplayDate,

  /**
   * Format date using Spanish locale (alias for compatibility)
   */
  formatDate: (dateStr: string): string => {
    if (!isValidDate(dateStr)) return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  },

  /**
   * Format time for display
   */
  formatDisplayTime,

  /**
   * Get available dates for reservation (next 30 days)
   */
  getAvailableDates: (): string[] => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  },

  /**
   * Get available time slots for reservation
   */
  getAvailableTimeSlots: (): string[] => {
    const slots: string[] = [];
    // Generate slots from 9:00 AM to 10:00 PM every 30 minutes
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  },

  /**
   * Check if reservation data is complete for a step
   */
  isComplete: (data: ReservationData, step: FlowStepId): boolean => {
    switch (step) {
      case 'guests':
        return data.guests > 0 && data.guests <= 20;
      case 'date':
        return isValidDate(data.date) && isFutureDate(data.date);
      case 'time':
        return isValidTime(data.time);
      case 'confirmation':
        return data.guests > 0 &&
               isValidDate(data.date) &&
               isFutureDate(data.date) &&
               isValidTime(data.time);
      default:
        return false;
    }
  },

  /**
   * Generate mock reservation data for demo purposes
   */
  generateMockData: (step: FlowStepId): Partial<ReservationData> => {
    const mockData: Partial<ReservationData> = {};

    switch (step) {
      case 'guests':
        mockData.guests = Math.floor(Math.random() * 6) + 2; // 2-8 guests
        break;
      case 'date':
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-15 days in future
        mockData.date = futureDate.toISOString().split('T')[0];
        break;
      case 'time':
        const hour = Math.floor(Math.random() * 5) + 18; // 18:00 - 22:00
        const minute = Math.random() > 0.5 ? '00' : '30';
        mockData.time = `${hour}:${minute}`;
        break;
      case 'confirmation':
        // Complete mock data
        const confirmationDate = new Date();
        confirmationDate.setDate(confirmationDate.getDate() + Math.floor(Math.random() * 7) + 1);
        const confirmationHour = Math.floor(Math.random() * 5) + 18;
        const confirmationMinute = Math.random() > 0.5 ? '00' : '30';

        mockData.guests = Math.floor(Math.random() * 6) + 2;
        mockData.date = confirmationDate.toISOString().split('T')[0];
        mockData.time = `${confirmationHour}:${confirmationMinute}`;
        break;
    }

    return mockData;
  },

  /**
   * Get formatted summary text for reservation
   */
  getSummaryText: (data: ReservationData): string => {
    if (data.guests > 0 && data.date && data.time) {
      const guestText = data.guests === 1 ? '1 guest' : `${data.guests} guests`;
      const dateText = formatDisplayDate(data.date);
      const timeText = formatDisplayTime(data.time);
      return `${guestText} on ${dateText} at ${timeText}`;
    }
    return 'Incomplete reservation';
  },

  /**
   * Get validation message for a field
   */
  getValidationMessage: (field: keyof ReservationData, data: ReservationData): string => {
    switch (field) {
      case 'guests':
        if (data.guests <= 0) return 'Please select number of guests';
        if (data.guests > 20) return 'Maximum 20 guests allowed';
        return '';
      case 'date':
        if (!data.date) return 'Please select a date';
        if (!isValidDate(data.date)) return 'Please select a valid date';
        if (!isFutureDate(data.date)) return 'Please select a future date';
        return '';
      case 'time':
        if (!data.time) return 'Please select a time';
        if (!isValidTime(data.time)) return 'Please select a valid time';
        return '';
      default:
        return '';
    }
  },

  /**
   * Get step completion percentage
   */
  getCompletionPercentage: (data: ReservationData): number => {
    let completed = 0;
    const total = 3;

    if (data.guests > 0) completed++;
    if (isValidDate(data.date) && isFutureDate(data.date)) completed++;
    if (isValidTime(data.time)) completed++;

    return Math.round((completed / total) * 100);
  },

  /**
   * Get next required field
   */
  getNextRequiredField: (data: ReservationData): keyof ReservationData | null => {
    if (data.guests <= 0) return 'guests';
    if (!isValidDate(data.date) || !isFutureDate(data.date)) return 'date';
    if (!isValidTime(data.time)) return 'time';
    return null;
  },

  /**
   * Generate realistic demo data with variety
   */
  generateDemoVariations: (): ReservationData[] => {
    const variations: ReservationData[] = [];
    const guestCounts = [2, 4, 6, 8];
    const timeSlots = ['18:00', '19:30', '20:00', '21:00'];

    for (let i = 0; i < 4; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i + 1);

      variations.push({
        guests: guestCounts[i],
        date: futureDate.toISOString().split('T')[0],
        time: timeSlots[i]
      });
    }

    return variations;
  }
};