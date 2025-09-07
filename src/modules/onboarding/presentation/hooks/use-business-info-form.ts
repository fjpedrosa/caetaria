'use client';

/**
 * Business Info Form Hook
 * Application Layer - Contains ALL business logic for business info form
 */

import { useCallback, useEffect,useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  type BusinessInfoData,
  type BusinessType,
  type Industry,
  type VolumeLevel
} from '../../domain/types';

// =============================================================================
// VALIDATION SCHEMA - Business rules
// =============================================================================

export const businessFormSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  businessType: z.enum(['startup', 'sme', 'enterprise', 'agency', 'non-profit', 'other']),
  industry: z.enum([
    'e-commerce', 'healthcare', 'education', 'finance', 'real-estate',
    'travel', 'food-beverage', 'technology', 'consulting', 'retail', 'other'
  ]),
  employeeRange: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  expectedVolume: z.enum(['low', 'medium', 'high']),
});

export type BusinessFormData = z.infer<typeof businessFormSchema>;

// =============================================================================
// STATIC DATA - Domain constants
// =============================================================================

export const businessTypes: Array<{ value: BusinessType; label: string }> = [
  { value: 'startup', label: 'Startup' },
  { value: 'sme', label: 'Small/Medium Enterprise' },
  { value: 'enterprise', label: 'Large Enterprise' },
  { value: 'agency', label: 'Agency/Consultancy' },
  { value: 'non-profit', label: 'Non-Profit Organization' },
  { value: 'other', label: 'Other' },
];

export const industries: Array<{ value: Industry; label: string }> = [
  { value: 'e-commerce', label: 'E-commerce & Online Retail' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'education', label: 'Education & Training' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'technology', label: 'Technology & Software' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
  { value: 'retail', label: 'Retail & Consumer Goods' },
  { value: 'other', label: 'Other' },
];

export const employeeRanges: Array<{ value: string; label: string; description?: string }> = [
  { value: '1-10', label: '1-10 empleados', description: 'Pequeña empresa o startup' },
  { value: '11-50', label: '11-50 empleados', description: 'Empresa en crecimiento' },
  { value: '51-200', label: '51-200 empleados', description: 'Empresa mediana' },
  { value: '201-500', label: '201-500 empleados', description: 'Empresa grande' },
  { value: '500+', label: 'Más de 500 empleados', description: 'Corporación' },
];

export const volumeOptions: Array<{ value: VolumeLevel; label: string; description: string }> = [
  { value: 'low', label: 'Bajo (< 1,000 mensajes/mes)', description: 'Operación pequeña' },
  { value: 'medium', label: 'Medio (1,000 - 10,000 mensajes/mes)', description: 'Negocio en crecimiento' },
  { value: 'high', label: 'Alto (> 10,000 mensajes/mes)', description: 'Operación a gran escala' },
];

// =============================================================================
// HOOK INTERFACE - What the hook returns to the component
// =============================================================================

export interface UseBusinessInfoFormReturn {
  // Form instance and state
  form: ReturnType<typeof useForm<BusinessFormData>>;
  isSubmitting: boolean;

  // Handlers
  onSubmit: (data: BusinessFormData) => Promise<void>;

  // Static data for rendering
  businessTypes: typeof businessTypes;
  industries: typeof industries;
  employeeRanges: typeof employeeRanges;
  volumeOptions: typeof volumeOptions;
}

// =============================================================================
// HOOK OPTIONS - Configuration for the hook
// =============================================================================

export interface UseBusinessInfoFormOptions {
  onSuccess?: (data: BusinessFormData) => void;
  onError?: (error: unknown) => void;
  defaultValues?: Partial<BusinessFormData>;
}

// =============================================================================
// MAIN HOOK - All business logic extracted from component
// =============================================================================

export function useBusinessInfoForm(
  options: UseBusinessInfoFormOptions = {}
): UseBusinessInfoFormReturn {

  // =============================================================================
  // STATE MANAGEMENT - All useState logic
  // =============================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // DEPENDENCIES - External services
  // =============================================================================

  const router = useRouter();

  // =============================================================================
  // FORM CONFIGURATION - React Hook Form setup
  // =============================================================================

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      companyName: '',
      businessType: undefined,
      industry: undefined,
      employeeRange: undefined,
      website: '',
      description: '',
      expectedVolume: undefined,
      ...options.defaultValues,
    },
  });

  // =============================================================================
  // AUTO-SAVE FUNCTIONALITY - Save on field changes with debounce
  // =============================================================================

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(async (data: BusinessFormData) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout for debounced save (2 seconds)
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const transformedData = transformFormDataToBusinessInfo(data);

        const response = await fetch('/api/onboarding/save-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'business-info',
            data: transformedData,
            flowId: 'default'
          }),
        });

        if (response.ok) {
          setLastSaved(new Date());
          console.log('Auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 second debounce
  }, []);

  // Watch form changes and trigger auto-save
  useEffect(() => {
    const subscription = form.watch((data) => {
      // Only auto-save if form has some data
      if (data.companyName || data.businessType) {
        autoSave(data as BusinessFormData);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form, autoSave]);

  // =============================================================================
  // BUSINESS LOGIC - Form submission and API integration
  // =============================================================================

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true);

    try {
      // Log submission for debugging
      console.log('Business info submitted:', data);

      // Transform data to domain model
      const transformedData = transformFormDataToBusinessInfo(data);

      // Call real API endpoint to save step data
      const response = await fetch('/api/onboarding/save-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'business-info',
          data: transformedData,
          flowId: 'default'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar los datos');
      }

      const result = await response.json();
      console.log('Data saved successfully:', result);

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }

      // Navigate to next step - Router navigation logic
      router.push('/onboarding/integration');

    } catch (error) {
      console.error('Error submitting business info:', error);

      // Call error callback if provided
      if (options.onError) {
        options.onError(error);
      }

      // Could add toast notification here
      // toast.error('Failed to save business information. Please try again.');

    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // HOOK RETURN - Clean interface for component
  // =============================================================================

  return {
    // Form management
    form,
    isSubmitting,

    // Auto-save status
    isSaving,
    lastSaved,

    // Event handlers
    onSubmit,

    // Static data for rendering
    businessTypes,
    industries,
    employeeRanges,
    volumeOptions,
  };
}

// =============================================================================
// HELPER FUNCTIONS - Business logic utilities
// =============================================================================

/**
 * Validates if a business form is ready for submission
 */
export function isBusinessFormValid(data: Partial<BusinessFormData>): boolean {
  try {
    businessFormSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Transforms form data to business domain model
 */
export function transformFormDataToBusinessInfo(data: BusinessFormData): BusinessInfoData {
  return {
    companyName: data.companyName,
    businessType: data.businessType,
    industry: data.industry,
    employeeRange: data.employeeRange,
    website: data.website || undefined,
    description: data.description || undefined,
    expectedVolume: data.expectedVolume,
  };
}

/**
 * Calculates recommended plan based on business info
 */
export function calculateRecommendedPlan(data: BusinessFormData): {
  planType: 'starter' | 'pro' | 'enterprise';
  reasoning: string;
} {
  // Business logic for plan recommendation
  const { businessType, employeeRange, expectedVolume } = data;

  // Map employee range to size category
  const isLargeCompany = employeeRange === '201-500' || employeeRange === '500+';
  const isMediumCompany = employeeRange === '11-50' || employeeRange === '51-200';

  if (businessType === 'enterprise' || isLargeCompany || expectedVolume === 'high') {
    return {
      planType: 'enterprise',
      reasoning: 'High volume or large organization detected'
    };
  }

  if (businessType === 'sme' || isMediumCompany || expectedVolume === 'medium') {
    return {
      planType: 'pro',
      reasoning: 'Medium volume or growing business detected'
    };
  }

  return {
    planType: 'starter',
    reasoning: 'Perfect for small businesses and startups'
  };
}

/**
 * Gets industry-specific recommendations
 */
export function getIndustryRecommendations(industry: Industry): {
  features: string[];
  templates: string[];
} {
  const recommendations = {
    'e-commerce': {
      features: ['Order tracking', 'Abandoned cart recovery', 'Product catalog'],
      templates: ['Order confirmation', 'Shipping updates', 'Support responses']
    },
    'healthcare': {
      features: ['Appointment reminders', 'HIPAA compliance', 'Secure messaging'],
      templates: ['Appointment confirmation', 'Health tips', 'Prescription reminders']
    },
    'education': {
      features: ['Class notifications', 'Assignment reminders', 'Parent communication'],
      templates: ['Class updates', 'Event notifications', 'Grade reports']
    },
    'finance': {
      features: ['Transaction alerts', 'Account updates', 'Compliance messaging'],
      templates: ['Payment confirmations', 'Balance updates', 'Security alerts']
    },
    'real-estate': {
      features: ['Property alerts', 'Viewing scheduling', 'Client follow-up'],
      templates: ['New listings', 'Viewing confirmations', 'Market updates']
    },
    'travel': {
      features: ['Booking confirmations', 'Travel updates', 'Customer support'],
      templates: ['Booking confirmations', 'Flight updates', 'Travel tips']
    },
    'food-beverage': {
      features: ['Order tracking', 'Menu updates', 'Loyalty programs'],
      templates: ['Order confirmations', 'Special offers', 'Table reservations']
    },
    'technology': {
      features: ['Product updates', 'Support tickets', 'User onboarding'],
      templates: ['Release notes', 'Support responses', 'Onboarding guides']
    },
    'consulting': {
      features: ['Meeting scheduling', 'Project updates', 'Client communication'],
      templates: ['Meeting confirmations', 'Project milestones', 'Invoice notifications']
    },
    'retail': {
      features: ['Inventory updates', 'Promotions', 'Customer service'],
      templates: ['Sales notifications', 'Product launches', 'Store updates']
    },
    'other': {
      features: ['Custom workflows', 'Flexible templates', 'API integration'],
      templates: ['Welcome messages', 'Support responses', 'Notifications']
    }
  };

  return recommendations[industry] || recommendations.other;
}