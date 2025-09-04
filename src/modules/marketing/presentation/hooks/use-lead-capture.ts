/**
 * Lead Capture Business Logic Hook
 *
 * Clean Architecture Application Layer - All business logic extracted from presentation
 * Handles: Form state, validation, submission, analytics, persistence, and UTM tracking
 */

import { useCallback,useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFormAnalytics } from '@/lib/analytics/unified-tracking';
import type { LeadCaptureFormProps } from '@/modules/marketing/domain/types';
import { useFormPersistence } from '@/modules/shared/presentation/hooks/use-form-persistence';
import {
  type LeadCaptureFormData,
  leadCaptureSchema,
  type LeadSource,
  validateEmail
} from '@/modules/shared/presentation/validation/form-schemas';
import { useCreateLeadMutation } from '@/store/api/leads-api';

// Enhanced props extending domain types
interface UseLeadCaptureProps {
  source: LeadSource;
  enablePersistence?: boolean;
  enableAnalytics?: boolean;
  onSuccess?: (data: LeadCaptureFormData) => void;
}

export interface UseLeadCaptureReturn {
  // Form state
  form: ReturnType<typeof useForm<LeadCaptureFormData>>;
  selectedFeatures: string[];
  showEmailValidation: boolean;
  emailValidationResult: { isValid: boolean; error: string | null };

  // Submission state
  isSubmitting: boolean;
  isSubmissionSuccessful: boolean;
  isSubmissionError: boolean;
  submissionError: any;

  // Handlers
  onSubmit: (data: LeadCaptureFormData) => Promise<void>;
  toggleFeature: (featureId: string) => void;
  handleEmailValidation: (email: string) => Promise<void>;

  // Persistence and analytics
  formPersistence: ReturnType<typeof useFormPersistence>;
  formAnalytics: ReturnType<typeof useFormAnalytics>;
}

/**
 * Custom hook containing all business logic for lead capture
 * Following Clean Architecture - Application Layer
 */
export const useLeadCapture = ({
  source,
  enablePersistence = true,
  enableAnalytics = true,
  onSuccess,
}: UseLeadCaptureProps): UseLeadCaptureReturn => {

  // ===============================================
  // STATE MANAGEMENT - All business state here
  // ===============================================

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showEmailValidation, setShowEmailValidation] = useState(false);
  const [emailValidationResult, setEmailValidationResult] = useState<{
    isValid: boolean;
    error: string | null
  }>({ isValid: true, error: null });

  // ===============================================
  // API INTEGRATION - RTK Query mutation
  // ===============================================

  const [createLead, {
    isLoading: isSubmitting,
    isSuccess: isSubmissionSuccessful,
    isError: isSubmissionError,
    error: submissionError
  }] = useCreateLeadMutation();

  // ===============================================
  // FORM CONFIGURATION - Validation and defaults
  // ===============================================

  const form = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      companyName: '',
      interestedFeatures: [],
      notes: '',
      source,
    },
  });

  // ===============================================
  // FORM PERSISTENCE - Local storage integration
  // ===============================================

  const formPersistence = useFormPersistence(form, {
    storageKey: `lead-capture-${source}`,
    excludeFields: ['notes'], // Exclude sensitive fields
    ttl: 30 * 60 * 1000, // 30 minutes
    autoRestore: enablePersistence,
    onRestore: (data) => {
      if (data.interestedFeatures) {
        setSelectedFeatures(data.interestedFeatures);
      }
      toast.info('Form data restored from previous session', {
        duration: 3000,
        action: {
          label: 'Clear',
          onClick: () => formPersistence.clearPersistedData(),
        },
      });
    },
  });

  // ===============================================
  // ANALYTICS INTEGRATION - Form tracking
  // ===============================================

  const formAnalytics = useFormAnalytics(form, {
    formId: `lead-capture-${source}`,
    formName: 'Lead Capture Form',
    trackFieldInteractions: enableAnalytics,
    trackValidationErrors: enableAnalytics,
    trackCompletionTime: enableAnalytics,
  });

  // ===============================================
  // BUSINESS LOGIC - Form submission
  // ===============================================

  const onSubmit = useCallback(async (data: LeadCaptureFormData) => {
    try {
      // UTM parameter extraction and enrichment
      const urlParams = new URLSearchParams(window.location.search);
      const leadData = {
        ...data,
        interestedFeatures: selectedFeatures,
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
        utmTerm: urlParams.get('utm_term') || undefined,
        utmContent: urlParams.get('utm_content') || undefined,
      };

      // API submission
      const result = await createLead(leadData).unwrap();

      // Success tracking and cleanup
      formAnalytics.trackSubmissionAttempt(true);
      formPersistence.clearPersistedData();

      // User feedback
      toast.success('Thank you! We\'ll be in touch within 24 hours.', {
        duration: 5000,
        description: 'Check your email for our welcome guide and demo booking link.',
      });

      // External success callback
      onSuccess?.(leadData);

      // Form reset with delay for better UX
      setTimeout(() => {
        form.reset();
        setSelectedFeatures([]);
      }, 2000);

    } catch (error) {
      console.error('Form submission error:', error);

      // Error tracking
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formAnalytics.trackSubmissionAttempt(false, errorMessage);

      // Error feedback with retry option
      toast.error('Failed to submit form', {
        duration: 5000,
        description: 'Please check your connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    }
  }, [createLead, selectedFeatures, formAnalytics, formPersistence, onSuccess, form]);

  // ===============================================
  // BUSINESS LOGIC - Feature selection
  // ===============================================

  const toggleFeature = useCallback((featureId: string) => {
    setSelectedFeatures(prev => {
      const newFeatures = prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId];

      // Sync with form validation
      form.setValue('interestedFeatures', newFeatures, { shouldValidate: true });

      return newFeatures;
    });
  }, [form]);

  // ===============================================
  // BUSINESS LOGIC - Email validation
  // ===============================================

  const handleEmailValidation = useCallback(async (email: string) => {
    if (!email) {
      setShowEmailValidation(false);
      return;
    }

    const validation = validateEmail(email);
    setEmailValidationResult(validation);
    setShowEmailValidation(true);
  }, []);

  // ===============================================
  // RETURN CLEAN INTERFACE
  // ===============================================

  return {
    // Form state
    form,
    selectedFeatures,
    showEmailValidation,
    emailValidationResult,

    // Submission state
    isSubmitting,
    isSubmissionSuccessful,
    isSubmissionError,
    submissionError,

    // Handlers
    onSubmit,
    toggleFeature,
    handleEmailValidation,

    // Persistence and analytics
    formPersistence,
    formAnalytics,
  };
};