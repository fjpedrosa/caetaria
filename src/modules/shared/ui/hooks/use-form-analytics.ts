'use client';

import { useCallback, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Form Analytics Hook
 *
 * Comprehensive analytics tracking for form interactions including:
 * - Field focus/blur events
 * - Time spent on each field
 * - Form abandonment tracking
 * - Validation error tracking
 * - Submission success/failure rates
 * - User behavior patterns
 */

interface FormAnalyticsOptions {
  formId: string;
  formName: string;
  trackFieldInteractions?: boolean;
  trackValidationErrors?: boolean;
  trackAbandonmentTiming?: boolean;
  trackCompletionTime?: boolean;
  debounceMs?: number;
}

interface FieldInteraction {
  fieldName: string;
  action: 'focus' | 'blur' | 'change' | 'error';
  timestamp: number;
  value?: any;
  errorMessage?: string;
  timeSpent?: number;
}

interface FormSessionData {
  formId: string;
  formName: string;
  startTime: number;
  endTime?: number;
  interactions: FieldInteraction[];
  completionTime?: number;
  abandonedAt?: number;
  submissionAttempts: number;
  validationErrors: Array<{
    field: string;
    message: string;
    timestamp: number;
  }>;
  completedSuccessfully: boolean;
}

// Mock analytics service - replace with your actual analytics implementation
const analyticsService = {
  track: (event: string, properties: Record<string, any>) => {
    // Replace with actual analytics calls (PostHog, GA, etc.)
    console.log('Form Analytics:', event, properties);
  },
};

export function useFormAnalytics<TFormValues = any>(
  form: UseFormReturn<TFormValues>,
  options: FormAnalyticsOptions
) {
  const {
    formId,
    formName,
    trackFieldInteractions = true,
    trackValidationErrors = true,
    trackAbandonmentTiming = true,
    trackCompletionTime = true,
    debounceMs = 500,
  } = options;

  const sessionRef = useRef<FormSessionData>({
    formId,
    formName,
    startTime: Date.now(),
    interactions: [],
    submissionAttempts: 0,
    validationErrors: [],
    completedSuccessfully: false,
  });

  const fieldFocusTimesRef = useRef<Record<string, number>>({});
  const isInitializedRef = useRef(false);

  // Track form initialization
  useEffect(() => {
    if (!isInitializedRef.current) {
      analyticsService.track('form_started', {
        formId,
        formName,
        timestamp: sessionRef.current.startTime,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      isInitializedRef.current = true;
    }
  }, [formId, formName]);

  // Track field interactions
  const trackFieldInteraction = useCallback((
    fieldName: string,
    action: FieldInteraction['action'],
    additionalData?: Partial<FieldInteraction>
  ) => {
    if (!trackFieldInteractions) return;

    const interaction: FieldInteraction = {
      fieldName,
      action,
      timestamp: Date.now(),
      ...additionalData,
    };

    sessionRef.current.interactions.push(interaction);

    // Track specific interaction events
    analyticsService.track(`form_field_${action}`, {
      formId,
      formName,
      fieldName,
      ...additionalData,
      sessionDuration: Date.now() - sessionRef.current.startTime,
    });
  }, [formId, formName, trackFieldInteractions]);

  // Track field focus
  const onFieldFocus = useCallback((fieldName: string) => {
    fieldFocusTimesRef.current[fieldName] = Date.now();
    trackFieldInteraction(fieldName, 'focus');
  }, [trackFieldInteraction]);

  // Track field blur with time spent calculation
  const onFieldBlur = useCallback((fieldName: string, value?: any) => {
    const focusTime = fieldFocusTimesRef.current[fieldName];
    const timeSpent = focusTime ? Date.now() - focusTime : 0;
    
    trackFieldInteraction(fieldName, 'blur', {
      value,
      timeSpent,
    });

    delete fieldFocusTimesRef.current[fieldName];
  }, [trackFieldInteraction]);

  // Track field changes
  const onFieldChange = useCallback((fieldName: string, value: any) => {
    trackFieldInteraction(fieldName, 'change', { value });
  }, [trackFieldInteraction]);

  // Track validation errors
  const trackValidationError = useCallback((fieldName: string, errorMessage: string) => {
    if (!trackValidationErrors) return;

    const error = {
      field: fieldName,
      message: errorMessage,
      timestamp: Date.now(),
    };

    sessionRef.current.validationErrors.push(error);

    trackFieldInteraction(fieldName, 'error', { errorMessage });

    analyticsService.track('form_validation_error', {
      formId,
      formName,
      fieldName,
      errorMessage,
      totalErrors: sessionRef.current.validationErrors.length,
      sessionDuration: Date.now() - sessionRef.current.startTime,
    });
  }, [formId, formName, trackFieldInteractions, trackValidationErrors]);

  // Track form submission attempt
  const trackSubmissionAttempt = useCallback((isSuccessful: boolean, errorMessage?: string) => {
    sessionRef.current.submissionAttempts += 1;
    
    if (isSuccessful) {
      sessionRef.current.completedSuccessfully = true;
      sessionRef.current.endTime = Date.now();
      sessionRef.current.completionTime = sessionRef.current.endTime - sessionRef.current.startTime;

      analyticsService.track('form_submitted_success', {
        formId,
        formName,
        completionTime: sessionRef.current.completionTime,
        totalInteractions: sessionRef.current.interactions.length,
        totalErrors: sessionRef.current.validationErrors.length,
        submissionAttempts: sessionRef.current.submissionAttempts,
        fieldInteractionCounts: sessionRef.current.interactions.reduce((acc, interaction) => {
          acc[interaction.fieldName] = (acc[interaction.fieldName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      });
    } else {
      analyticsService.track('form_submission_failed', {
        formId,
        formName,
        errorMessage,
        submissionAttempts: sessionRef.current.submissionAttempts,
        sessionDuration: Date.now() - sessionRef.current.startTime,
        totalErrors: sessionRef.current.validationErrors.length,
      });
    }
  }, [formId, formName]);

  // Track form abandonment
  const trackAbandonment = useCallback(() => {
    if (!trackAbandonmentTiming || sessionRef.current.completedSuccessfully) return;

    sessionRef.current.abandonedAt = Date.now();
    
    analyticsService.track('form_abandoned', {
      formId,
      formName,
      abandonedAfter: sessionRef.current.abandonedAt - sessionRef.current.startTime,
      totalInteractions: sessionRef.current.interactions.length,
      totalErrors: sessionRef.current.validationErrors.length,
      lastInteractionField: sessionRef.current.interactions[sessionRef.current.interactions.length - 1]?.fieldName,
      submissionAttempts: sessionRef.current.submissionAttempts,
    });
  }, [formId, formName, trackAbandonmentTiming]);

  // Watch for form errors and track them
  useEffect(() => {
    const { formState } = form;
    
    if (trackValidationErrors && formState.errors) {
      Object.entries(formState.errors).forEach(([fieldName, error]) => {
        if (error?.message && typeof error.message === 'string') {
          // Only track new errors (avoid duplicates)
          const recentErrors = sessionRef.current.validationErrors
            .filter(e => e.field === fieldName && Date.now() - e.timestamp < 1000);
          
          if (recentErrors.length === 0) {
            trackValidationError(fieldName, error.message);
          }
        }
      });
    }
  }, [form.formState.errors, trackValidationErrors, trackValidationError]);

  // Track page unload (abandonment)
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackAbandonment();
    };

    if (trackAbandonmentTiming) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [trackAbandonment, trackAbandonmentTiming]);

  // Generate field event handlers
  const getFieldHandlers = useCallback((fieldName: string) => ({
    onFocus: () => onFieldFocus(fieldName),
    onBlur: (e: React.FocusEvent<any>) => onFieldBlur(fieldName, e.target.value),
    onChange: (e: React.ChangeEvent<any>) => onFieldChange(fieldName, e.target.value),
  }), [onFieldFocus, onFieldBlur, onFieldChange]);

  // Get form analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const session = sessionRef.current;
    const currentTime = Date.now();
    
    return {
      formId: session.formId,
      formName: session.formName,
      sessionDuration: currentTime - session.startTime,
      totalInteractions: session.interactions.length,
      totalValidationErrors: session.validationErrors.length,
      submissionAttempts: session.submissionAttempts,
      isCompleted: session.completedSuccessfully,
      completionTime: session.completionTime,
      mostInteractedFields: session.interactions
        .reduce((acc, interaction) => {
          acc[interaction.fieldName] = (acc[interaction.fieldName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      averageTimePerField: Object.entries(
        session.interactions
          .filter(i => i.timeSpent)
          .reduce((acc, interaction) => {
            if (!acc[interaction.fieldName]) acc[interaction.fieldName] = [];
            acc[interaction.fieldName].push(interaction.timeSpent!);
            return acc;
          }, {} as Record<string, number[]>)
      ).reduce((acc, [field, times]) => {
        acc[field] = times.reduce((sum, time) => sum + time, 0) / times.length;
        return acc;
      }, {} as Record<string, number>),
    };
  }, []);

  return {
    trackFieldInteraction,
    trackValidationError,
    trackSubmissionAttempt,
    trackAbandonment,
    getFieldHandlers,
    getAnalyticsSummary,
    onFieldFocus,
    onFieldBlur,
    onFieldChange,
  };
}

/**
 * Higher-order component to automatically add analytics to form fields
 */
export function withFormAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fieldName: string,
  analytics: ReturnType<typeof useFormAnalytics>
) {
  return function WrappedComponent(props: T) {
    const handlers = analytics.getFieldHandlers(fieldName);
    
    return (
      <Component
        {...props}
        {...handlers}
      />
    );
  };
}