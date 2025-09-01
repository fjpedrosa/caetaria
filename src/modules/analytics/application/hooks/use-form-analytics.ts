'use client';

import { useCallback, useRef, useState } from 'react';

import { EventProperties } from '../../domain/entities/event';
import { FormAnalyticsData } from '../../domain/types';
import { createEventType, EVENT_TYPES, EventTypeEnum } from '../../domain/value-objects/event-type';

/**
 * Form Analytics Tracking Hook
 *
 * Specialized hook for comprehensive form interaction tracking
 * Handles field interactions, validation errors, completion time, and abandonment
 */

interface FieldInteraction {
  fieldName: string;
  interactionType: 'focus' | 'blur' | 'change' | 'error';
  timestamp: number;
  value?: string;
  errorMessage?: string;
}

interface FormTrackingState {
  formName: string;
  startTime: number | null;
  completionTime: number | null;
  fieldInteractions: FieldInteraction[];
  fieldErrors: Record<string, string[]>;
  fieldValues: Record<string, any>;
  visitedFields: Set<string>;
  completedFields: Set<string>;
  isFormStarted: boolean;
  isFormCompleted: boolean;
  isFormAbandoned: boolean;
  abandonmentReason?: string;
}

interface FormAnalyticsConfig {
  formName: string;
  trackFieldInteractions?: boolean;
  trackValidationErrors?: boolean;
  trackCompletionTime?: boolean;
  trackFieldValues?: boolean;
  sensitiveFields?: string[];
  abandonmentTimeoutMs?: number;
}

interface FormAnalyticsHookReturn {
  // Core form tracking functions
  trackFormStart: () => Promise<void>;
  trackFormSubmit: (formData?: Record<string, any>) => Promise<void>;
  trackFormAbandonment: (reason?: string) => Promise<void>;
  trackFieldFocus: (fieldName: string) => Promise<void>;
  trackFieldBlur: (fieldName: string, value?: string) => Promise<void>;
  trackFieldChange: (fieldName: string, value?: string) => Promise<void>;
  trackFieldError: (fieldName: string, errorMessage: string) => Promise<void>;
  trackFieldValidation: (fieldName: string, isValid: boolean, errorMessage?: string) => Promise<void>;

  // State accessors
  formState: FormTrackingState;

  // Analytics data
  getFormAnalytics: () => FormAnalyticsData;
  getCompletionRate: () => number;
  getFieldEngagementScore: () => Record<string, number>;

  // Reset
  resetForm: () => void;
}

const useFormAnalytics = (
  trackEventFn: (type: any, name: string, properties?: EventProperties) => Promise<void>,
  config: FormAnalyticsConfig
): FormAnalyticsHookReturn => {
  const {
    formName,
    trackFieldInteractions = true,
    trackValidationErrors = true,
    trackCompletionTime = true,
    trackFieldValues = false,
    sensitiveFields = ['password', 'ssn', 'credit_card'],
    abandonmentTimeoutMs = 300000, // 5 minutes
  } = config;

  const [formState, setFormState] = useState<FormTrackingState>(() => ({
    formName,
    startTime: null,
    completionTime: null,
    fieldInteractions: [],
    fieldErrors: {},
    fieldValues: {},
    visitedFields: new Set<string>(),
    completedFields: new Set<string>(),
    isFormStarted: false,
    isFormCompleted: false,
    isFormAbandoned: false,
  }));

  const abandonmentTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Check if field is sensitive
  const isSensitiveField = useCallback((fieldName: string): boolean => {
    return sensitiveFields.some(sensitive =>
      fieldName.toLowerCase().includes(sensitive.toLowerCase())
    );
  }, [sensitiveFields]);

  // Helper: Add field interaction
  const addFieldInteraction = useCallback((interaction: FieldInteraction) => {
    if (!trackFieldInteractions) return;

    setFormState(prev => ({
      ...prev,
      fieldInteractions: [...prev.fieldInteractions, interaction],
    }));
  }, [trackFieldInteractions]);

  // Helper: Reset abandonment timer
  const resetAbandonmentTimer = useCallback(() => {
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    if (!formState.isFormCompleted && !formState.isFormAbandoned && abandonmentTimeoutMs > 0) {
      abandonmentTimerRef.current = setTimeout(() => {
        trackFormAbandonment('timeout');
      }, abandonmentTimeoutMs);
    }
  }, [formState.isFormCompleted, formState.isFormAbandoned, abandonmentTimeoutMs]);

  // Track form start
  const trackFormStart = useCallback(async (): Promise<void> => {
    const startTime = Date.now();

    setFormState(prev => ({
      ...prev,
      startTime,
      isFormStarted: true,
    }));

    resetAbandonmentTimer();

    const properties: EventProperties = {
      form_name: formName,
      timestamp: new Date().toISOString(),
      session_start_time: startTime,
    };

    const formStartType = createEventType('form_start');
    await trackEventFn(formStartType, 'Form Start', properties);
  }, [formName, trackEventFn, resetAbandonmentTimer]);

  // Track form submission
  const trackFormSubmit = useCallback(async (formData?: Record<string, any>): Promise<void> => {
    const completionTime = formState.startTime ? Date.now() - formState.startTime : 0;

    setFormState(prev => ({
      ...prev,
      completionTime,
      isFormCompleted: true,
      fieldValues: formData || prev.fieldValues,
    }));

    // Clear abandonment timer
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    const formAnalytics = getFormAnalytics();
    const properties: EventProperties = {
      form_name: formName,
      timestamp: new Date().toISOString(),
      ...formAnalytics,
    };

    // Add completion time if tracking is enabled
    if (trackCompletionTime) {
      properties.completion_time_ms = completionTime;
      properties.completion_time_seconds = Math.round(completionTime / 1000);
    }

    // Add field interaction data
    if (trackFieldInteractions) {
      properties.total_interactions = formState.fieldInteractions.length;
      properties.visited_fields_count = formState.visitedFields.size;
      properties.completed_fields_count = formState.completedFields.size;
    }

    // Add validation error data
    if (trackValidationErrors) {
      properties.validation_errors_count = Object.keys(formState.fieldErrors).length;
      properties.fields_with_errors = Object.keys(formState.fieldErrors);
    }

    // Add non-sensitive field values if tracking is enabled
    if (trackFieldValues && formData) {
      const safeFieldData: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (!isSensitiveField(key)) {
          if (typeof value === 'string') {
            safeFieldData[`field_${key}_length`] = value.length;
            safeFieldData[`field_${key}_filled`] = value.length > 0;
          } else {
            safeFieldData[`field_${key}_type`] = typeof value;
          }
        }
      });
      Object.assign(properties, safeFieldData);
    }

    await trackEventFn(EVENT_TYPES.FORM_SUBMIT, 'Form Submit', properties);
  }, [formName, formState.startTime, formState.fieldInteractions.length, formState.visitedFields.size, formState.completedFields.size, formState.fieldErrors, trackEventFn, trackCompletionTime, trackFieldInteractions, trackValidationErrors, trackFieldValues, isSensitiveField, getFormAnalytics]);

  // Track form abandonment
  const trackFormAbandonment = useCallback(async (reason?: string): Promise<void> => {
    if (formState.isFormCompleted || formState.isFormAbandoned) return;

    const abandonmentTime = formState.startTime ? Date.now() - formState.startTime : 0;

    setFormState(prev => ({
      ...prev,
      isFormAbandoned: true,
      abandonmentReason: reason || 'unknown',
    }));

    const properties: EventProperties = {
      form_name: formName,
      timestamp: new Date().toISOString(),
      abandonment_reason: reason || 'unknown',
      time_before_abandonment_ms: abandonmentTime,
      time_before_abandonment_seconds: Math.round(abandonmentTime / 1000),
      visited_fields_count: formState.visitedFields.size,
      completed_fields_count: formState.completedFields.size,
      total_interactions: formState.fieldInteractions.length,
      last_interaction_field: formState.fieldInteractions[formState.fieldInteractions.length - 1]?.fieldName,
    };

    const formAbandonType = createEventType('form_abandon');
    await trackEventFn(formAbandonType, 'Form Abandonment', properties);
  }, [formName, formState.isFormCompleted, formState.isFormAbandoned, formState.startTime, formState.visitedFields.size, formState.completedFields.size, formState.fieldInteractions, trackEventFn]);

  // Track field focus
  const trackFieldFocus = useCallback(async (fieldName: string): Promise<void> => {
    setFormState(prev => ({
      ...prev,
      visitedFields: new Set([...prev.visitedFields, fieldName]),
    }));

    addFieldInteraction({
      fieldName,
      interactionType: 'focus',
      timestamp: Date.now(),
    });

    resetAbandonmentTimer();

    if (trackFieldInteractions) {
      const properties: EventProperties = {
        form_name: formName,
        field_name: fieldName,
        interaction_type: 'focus',
        timestamp: new Date().toISOString(),
      };

      const fieldFocusType = createEventType('field_focus');
      await trackEventFn(fieldFocusType, 'Field Focus', properties);
    }
  }, [formName, trackFieldInteractions, trackEventFn, addFieldInteraction, resetAbandonmentTimer]);

  // Track field blur
  const trackFieldBlur = useCallback(async (fieldName: string, value?: string): Promise<void> => {
    const hasValue = value !== undefined && value !== '';

    setFormState(prev => ({
      ...prev,
      completedFields: hasValue ?
        new Set([...prev.completedFields, fieldName]) :
        new Set([...prev.completedFields].filter(f => f !== fieldName)),
      fieldValues: {
        ...prev.fieldValues,
        [fieldName]: value,
      },
    }));

    addFieldInteraction({
      fieldName,
      interactionType: 'blur',
      timestamp: Date.now(),
      value: isSensitiveField(fieldName) ? '[REDACTED]' : value,
    });

    resetAbandonmentTimer();

    if (trackFieldInteractions) {
      const properties: EventProperties = {
        form_name: formName,
        field_name: fieldName,
        interaction_type: 'blur',
        timestamp: new Date().toISOString(),
        field_completed: hasValue,
      };

      // Add value length for non-sensitive fields
      if (!isSensitiveField(fieldName) && value) {
        properties.field_value_length = value.length;
      }

      const fieldBlurType = createEventType('field_blur');
      await trackEventFn(fieldBlurType, 'Field Blur', properties);
    }
  }, [formName, trackFieldInteractions, trackEventFn, addFieldInteraction, resetAbandonmentTimer, isSensitiveField]);

  // Track field change
  const trackFieldChange = useCallback(async (fieldName: string, value?: string): Promise<void> => {
    addFieldInteraction({
      fieldName,
      interactionType: 'change',
      timestamp: Date.now(),
      value: isSensitiveField(fieldName) ? '[REDACTED]' : value,
    });

    resetAbandonmentTimer();
  }, [addFieldInteraction, resetAbandonmentTimer, isSensitiveField]);

  // Track field error
  const trackFieldError = useCallback(async (fieldName: string, errorMessage: string): Promise<void> => {
    setFormState(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [fieldName]: [...(prev.fieldErrors[fieldName] || []), errorMessage],
      },
    }));

    addFieldInteraction({
      fieldName,
      interactionType: 'error',
      timestamp: Date.now(),
      errorMessage,
    });

    if (trackValidationErrors) {
      const properties: EventProperties = {
        form_name: formName,
        field_name: fieldName,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
      };

      const fieldErrorType = createEventType('field_error');
      await trackEventFn(fieldErrorType, 'Field Validation Error', properties);
    }
  }, [formName, trackValidationErrors, trackEventFn, addFieldInteraction]);

  // Track field validation
  const trackFieldValidation = useCallback(async (
    fieldName: string,
    isValid: boolean,
    errorMessage?: string
  ): Promise<void> => {
    if (!isValid && errorMessage) {
      await trackFieldError(fieldName, errorMessage);
    } else if (isValid) {
      // Clear errors for this field if validation passes
      setFormState(prev => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [fieldName]: [],
        },
      }));
    }
  }, [trackFieldError]);

  // Get form analytics data
  const getFormAnalytics = useCallback((): FormAnalyticsData => {
    return {
      form_name: formName,
      form_fields: formState.visitedFields.size,
      completion_time: formState.completionTime,
      field_errors: formState.fieldErrors,
      ...formState.fieldValues,
    };
  }, [formName, formState.visitedFields.size, formState.completionTime, formState.fieldErrors, formState.fieldValues]);

  // Get completion rate
  const getCompletionRate = useCallback((): number => {
    if (formState.visitedFields.size === 0) return 0;
    return (formState.completedFields.size / formState.visitedFields.size) * 100;
  }, [formState.visitedFields.size, formState.completedFields.size]);

  // Get field engagement score
  const getFieldEngagementScore = useCallback((): Record<string, number> => {
    const scores: Record<string, number> = {};

    formState.visitedFields.forEach(fieldName => {
      const fieldInteractions = formState.fieldInteractions.filter(
        interaction => interaction.fieldName === fieldName
      );
      scores[fieldName] = fieldInteractions.length;
    });

    return scores;
  }, [formState.visitedFields, formState.fieldInteractions]);

  // Reset form state
  const resetForm = useCallback(() => {
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    setFormState({
      formName,
      startTime: null,
      completionTime: null,
      fieldInteractions: [],
      fieldErrors: {},
      fieldValues: {},
      visitedFields: new Set<string>(),
      completedFields: new Set<string>(),
      isFormStarted: false,
      isFormCompleted: false,
      isFormAbandoned: false,
    });
  }, [formName]);

  return {
    // Core form tracking functions
    trackFormStart,
    trackFormSubmit,
    trackFormAbandonment,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackFieldError,
    trackFieldValidation,

    // State accessors
    formState,

    // Analytics data
    getFormAnalytics,
    getCompletionRate,
    getFieldEngagementScore,

    // Reset
    resetForm,
  };
};

export default useFormAnalytics;