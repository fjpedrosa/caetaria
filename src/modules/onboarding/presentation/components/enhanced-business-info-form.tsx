'use client';

/**
 * Enhanced Business Info Form Component
 *
 * Advanced form with RTK Query integration, persistence, analytics,
 * real-time validation, and accessibility compliance.
 */

import { useCallback, useEffect,useState } from 'react';
import { ArrowRight, Building2, CheckCircle, Loader2, Phone,Save, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

import { useFormAnalytics } from '@/lib/analytics/unified-tracking';
import { FormErrorBoundary, FormErrorMessage, FormSuccessMessage } from '@/modules/shared/presentation/components/form-error-boundary';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/presentation/components/ui/form';
import { Input } from '@/modules/shared/presentation/components/ui/input';
import { Label } from '@/modules/shared/presentation/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/presentation/components/ui/select';
import { Textarea } from '@/modules/shared/presentation/components/ui/textarea';
import { useFormPersistence } from '@/modules/shared/presentation/hooks/use-form-persistence';
import {
  type BusinessInfoFormData,
  businessInfoSchema} from '@/modules/shared/presentation/validation/form-schemas';
import {
  useGetOnboardingSessionQuery,
  useSubmitBusinessInfoMutation,
  useUpdateOnboardingSessionMutation
} from '@/store/api/onboarding-api';

import type { EnhancedBusinessInfoFormProps as BusinessInfoFormProps } from '../../domain/types';
import { BusinessType, Industry } from '../../domain/value-objects/business-info';

const businessTypes: Array<{ value: BusinessType; label: string }> = [
  { value: 'startup', label: 'Startup' },
  { value: 'sme', label: 'Small/Medium Enterprise' },
  { value: 'enterprise', label: 'Large Enterprise' },
  { value: 'agency', label: 'Agency/Consultancy' },
  { value: 'non-profit', label: 'Non-Profit Organization' },
  { value: 'other', label: 'Other' },
];

const industries: Array<{ value: Industry; label: string }> = [
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

const volumeOptions = [
  { value: 'low' as const, label: 'Low (< 1,000 messages/month)', description: 'Small scale operation' },
  { value: 'medium' as const, label: 'Medium (1,000 - 10,000 messages/month)', description: 'Growing business' },
  { value: 'high' as const, label: 'High (> 10,000 messages/month)', description: 'Large scale operation' },
];

export function BusinessInfoForm({
  userId,
  onSuccess,
  onStepChange,
  className = '',
  showHeader = true
}: BusinessInfoFormProps) {
  const router = useRouter();
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Get current session and user data
  const { data: sessionData } = useGetOnboardingSessionQuery({ userId });

  // RTK Query mutations
  const [submitBusinessInfo, {
    isLoading: isSubmitting,
    isSuccess: isSubmissionSuccessful,
    isError: isSubmissionError,
    error: submissionError
  }] = useSubmitBusinessInfoMutation();

  const [updateSession] = useUpdateOnboardingSessionMutation();

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      fullName: '',
      companyName: '',
      phoneNumber: '',
      businessType: undefined,
      industry: undefined,
      employeeCount: undefined,
      website: '',
      description: '',
      expectedVolume: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  // Form persistence
  const formPersistence = useFormPersistence(form, {
    storageKey: `business-info-${userId}`,
    ttl: 60 * 60 * 1000, // 1 hour
    onRestore: (data) => {
      toast.info('Business information restored from previous session', {
        duration: 3000,
        action: {
          label: 'Clear',
          onClick: () => formPersistence.clearPersistedData(),
        },
      });
    },
  });

  // Form analytics
  const formAnalytics = useFormAnalytics(form, {
    formId: `business-info-${userId}`,
    formName: 'Business Information Form',
    trackFieldInteractions: true,
    trackValidationErrors: true,
    trackCompletionTime: true,
  });

  const onSubmit = useCallback(async (data: BusinessInfoFormData) => {
    try {
      const result = await submitBusinessInfo({ userId, businessInfo: data }).unwrap();

      // Track successful submission
      formAnalytics.trackSubmissionAttempt(true);

      // Clear persisted data
      formPersistence.clearPersistedData();

      // Update session step
      await updateSession({
        userId,
        step: 'whatsapp_integration',
        markStepComplete: 'business_info',
        sessionData: { businessInfo: data },
      });

      // Show success notification
      toast.success('Business information saved successfully!', {
        duration: 3000,
        description: 'Proceeding to WhatsApp integration setup.',
      });

      onSuccess?.(data);
      onStepChange?.('whatsapp_integration');

      // Navigate to next step
      setTimeout(() => {
        router.push('/onboarding/integration');
      }, 1000);

    } catch (error) {
      console.error('Error submitting business info:', error);

      // Track failed submission
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formAnalytics.trackSubmissionAttempt(false, errorMessage);

      // Show error notification
      toast.error('Failed to save business information', {
        duration: 5000,
        description: 'Please check your entries and try again.',
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    }
  }, [submitBusinessInfo, userId, formAnalytics, formPersistence, onSuccess, onStepChange, router, form, updateSession]);

  // Auto-save draft periodically
  const saveDraft = useCallback(async () => {
    if (!form.formState.isDirty) return;

    const formData = form.getValues();
    formPersistence.saveFormData(formData);

    setIsDraftSaved(true);
    toast.success('Draft saved', {
      duration: 1500,
    });

    setTimeout(() => setIsDraftSaved(false), 3000);
  }, [form, formPersistence]);

  // Auto-save every 2 minutes
  useEffect(() => {
    const interval = setInterval(saveDraft, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  return (
    <FormErrorBoundary formName="Business Information Form">
      <div className={className}>
        {showHeader && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Business Information
            </h2>
            <p className="text-gray-600">
              Help us understand your business better to provide personalized recommendations.
            </p>
          </div>
        )}

        {/* Show submission error */}
        {isSubmissionError && (
          <FormErrorMessage
            error="Failed to save business information. Please try again."
            className="mb-4"
          />
        )}

        {/* Show draft saved indicator */}
        {isDraftSaved && (
          <FormSuccessMessage
            message="Draft saved automatically"
            className="mb-4"
          />
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

            {/* Full Name - Required for onboarding */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Full Name *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('fullName')}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error'}
                    />
                  </FormControl>
                  <FormDescription>
                    Your full name as it should appear in official communications.
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Company Name</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('companyName')}
                      placeholder="Enter your company name"
                      autoComplete="organization"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error'}
                    />
                  </FormControl>
                  <FormDescription>
                    Use your official business name as it appears on registration documents.
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('phoneNumber')}
                      type="tel"
                      placeholder="+1234567890"
                      autoComplete="tel"
                      inputMode="tel"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error ' + field.name + '-help'}
                    />
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    Include country code (e.g., +1 for US, +44 for UK)
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Business Type and Industry Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger aria-describedby={field.name + '-error'}>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage id={field.name + '-error'} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger aria-describedby={field.name + '-error'}>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage id={field.name + '-error'} />
                  </FormItem>
                )}
              />
            </div>

            {/* Employee Count and Website Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        {...formAnalytics.getFieldHandlers('employeeCount')}
                        type="number"
                        placeholder="e.g., 25"
                        min="1"
                        max="1000000"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        aria-describedby={field.name + '-error ' + field.name + '-help'}
                      />
                    </FormControl>
                    <FormDescription id={field.name + '-help'}>
                      This helps us recommend the right plan for your needs.
                    </FormDescription>
                    <FormMessage id={field.name + '-error'} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        {...formAnalytics.getFieldHandlers('website')}
                        type="url"
                        placeholder="https://yourcompany.com"
                        autoComplete="url"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        aria-describedby={field.name + '-error ' + field.name + '-help'}
                      />
                    </FormControl>
                    <FormDescription id={field.name + '-help'}>
                      Optional. Used for verification if available.
                    </FormDescription>
                    <FormMessage id={field.name + '-error'} />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Volume */}
            <FormField
              control={form.control}
              name="expectedVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Message Volume</FormLabel>
                  <FormControl>
                    <div className="space-y-3" role="radiogroup" aria-describedby={field.name + '-help'}>
                      {volumeOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            field.value === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          } ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => {
                              field.onChange(option.value);
                              formAnalytics.onFieldChange('expectedVolume', option.value);
                            }}
                            disabled={isSubmitting}
                            className="mt-1 text-blue-600 focus:ring-blue-500"
                            aria-describedby={field.name + '-error'}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    This helps us suggest the most suitable plan and configuration.
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      {...formAnalytics.getFieldHandlers('description')}
                      placeholder="Tell us about your business and how you plan to use WhatsApp..."
                      className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      maxLength={500}
                      aria-describedby={field.name + '-error ' + field.name + '-help'}
                    />
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    Optional. Help us understand your use case to provide better recommendations.
                    {field.value && (
                      <span className="block text-xs text-gray-400 mt-1">
                        {field.value.length}/500 characters
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              {/* Save draft button */}
              <Button
                type="button"
                variant="outline"
                onClick={saveDraft}
                disabled={isSubmitting || !form.formState.isDirty}
                className="order-2 sm:order-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="order-1 sm:order-2 flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-describedby="submit-help"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Saving Information...
                  </>
                ) : (
                  <>
                    Continue to WhatsApp Integration
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>

            <p id="submit-help" className="sr-only">
              Save your business information to proceed to the WhatsApp integration step.
            </p>
          </form>
        </Form>
      </div>
    </FormErrorBoundary>
  );
}

// Export form component wrapped with error boundary
export function BusinessInfoFormWithErrorBoundary(props: BusinessInfoFormProps) {
  return (
    <FormErrorBoundary formName="Business Information Form">
      <BusinessInfoForm {...props} />
    </FormErrorBoundary>
  );
}