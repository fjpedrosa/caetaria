'use client';

/**
 * Enhanced WhatsApp Integration Form Component
 *
 * Advanced form with RTK Query integration, real-time validation,
 * accessibility compliance, and comprehensive error handling.
 */

import { useCallback, useEffect,useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle, Eye, EyeOff, Key, Link, Loader2, Settings,Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormErrorBoundary, FormErrorMessage, FormSuccessMessage } from '@/modules/shared/ui/components/form-error-boundary';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/ui/components/ui/form';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Switch } from '@/modules/shared/ui/components/ui/switch';
import { useFormAnalytics } from '@/modules/shared/ui/hooks/use-form-analytics';
import { useFormPersistence } from '@/modules/shared/ui/hooks/use-form-persistence';
import {
  validatePhoneNumber,
  type WhatsAppIntegrationFormData,
  whatsappIntegrationSchema} from '@/modules/shared/ui/validation/form-schemas';
import {
  useGetOnboardingSessionQuery,
  useSubmitWhatsAppIntegrationMutation,
  useTestWhatsAppIntegrationMutation,
  useUpdateOnboardingSessionMutation
} from '@/store/api/onboarding-api';

interface WhatsAppIntegrationFormProps {
  userId: string;
  onSuccess?: (data: WhatsAppIntegrationFormData) => void;
  onStepChange?: (step: string) => void;
  className?: string;
  showHeader?: boolean;
}

export function WhatsAppIntegrationForm({
  userId,
  onSuccess,
  onStepChange,
  className = '',
  showHeader = true
}: WhatsAppIntegrationFormProps) {
  const router = useRouter();
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Get current session
  const { data: sessionData } = useGetOnboardingSessionQuery({ userId });

  // RTK Query mutations
  const [submitWhatsAppIntegration, {
    isLoading: isSubmitting,
    isSuccess: isSubmissionSuccessful,
    isError: isSubmissionError,
    error: submissionError
  }] = useSubmitWhatsAppIntegrationMutation();

  const [testIntegration] = useTestWhatsAppIntegrationMutation();
  const [updateSession] = useUpdateOnboardingSessionMutation();

  const form = useForm<WhatsAppIntegrationFormData>({
    resolver: zodResolver(whatsappIntegrationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      phoneNumber: '',
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: '',
      webhookVerifyToken: '',
      webhookUrl: '',
      testMode: true,
    },
  });

  // Form persistence
  const formPersistence = useFormPersistence(form, {
    storageKey: `whatsapp-integration-${userId}`,
    excludeFields: ['accessToken', 'webhookVerifyToken'], // Exclude sensitive fields
    ttl: 60 * 60 * 1000, // 1 hour
    onRestore: (data) => {
      toast.info('WhatsApp integration data restored', {
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
    formId: `whatsapp-integration-${userId}`,
    formName: 'WhatsApp Integration Form',
    trackFieldInteractions: true,
    trackValidationErrors: true,
    trackCompletionTime: true,
  });

  // Test connection
  const testConnection = useCallback(async () => {
    const formValues = form.getValues();

    // Validate required fields
    const validation = await form.trigger(['phoneNumber', 'phoneNumberId', 'businessAccountId', 'accessToken']);
    if (!validation) {
      toast.error('Please fill in all required fields before testing');
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const result = await testIntegration({
        userId,
        testType: 'webhook',
        testData: formValues,
      }).unwrap();

      setConnectionTestResult(result);

      if (result.success) {
        toast.success('Connection test successful!', {
          duration: 3000,
          description: result.message,
        });
      } else {
        toast.error('Connection test failed', {
          duration: 5000,
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setConnectionTestResult({
        success: false,
        message: errorMessage,
      });

      toast.error('Connection test failed', {
        duration: 5000,
        description: errorMessage,
      });
    } finally {
      setIsTestingConnection(false);
    }
  }, [form, testIntegration, userId]);

  const onSubmit = useCallback(async (data: WhatsAppIntegrationFormData) => {
    try {
      const result = await submitWhatsAppIntegration({ userId, integrationData: data }).unwrap();

      // Track successful submission
      formAnalytics.trackSubmissionAttempt(true);

      // Clear persisted data
      formPersistence.clearPersistedData();

      // Update session step
      await updateSession({
        userId,
        step: 'bot_configuration',
        markStepComplete: 'whatsapp_integration',
        sessionData: { integrationData: data },
      });

      // Show success notification
      toast.success('WhatsApp integration configured successfully!', {
        duration: 3000,
        description: 'Proceeding to bot configuration.',
      });

      onSuccess?.(data);
      onStepChange?.('bot_configuration');

      // Navigate to next step
      setTimeout(() => {
        router.push('/onboarding/bot-setup');
      }, 1000);

    } catch (error) {
      console.error('Error submitting WhatsApp integration:', error);

      // Track failed submission
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formAnalytics.trackSubmissionAttempt(false, errorMessage);

      // Show error notification
      toast.error('Failed to save WhatsApp integration', {
        duration: 5000,
        description: 'Please check your configuration and try again.',
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    }
  }, [submitWhatsAppIntegration, userId, formAnalytics, formPersistence, onSuccess, onStepChange, router, form, updateSession]);

  // Real-time phone validation
  const [phoneValidationResult, setPhoneValidationResult] = useState<{ isValid: boolean; error: string | null }>({ isValid: true, error: null });
  const [showPhoneValidation, setShowPhoneValidation] = useState(false);

  const handlePhoneValidation = useCallback((phone: string) => {
    if (!phone) {
      setShowPhoneValidation(false);
      return;
    }

    const validation = validatePhoneNumber(phone);
    setPhoneValidationResult(validation);
    setShowPhoneValidation(true);
  }, []);

  return (
    <FormErrorBoundary formName="WhatsApp Integration Form">
      <div className={className}>
        {showHeader && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              WhatsApp Integration
            </h2>
            <p className="text-gray-600">
              Configure your WhatsApp Business API credentials to enable automated messaging.
            </p>
          </div>
        )}

        {/* Show submission error */}
        {isSubmissionError && (
          <FormErrorMessage
            error="Failed to save WhatsApp integration. Please check your credentials and try again."
            className="mb-4"
          />
        )}

        {/* Connection test result */}
        {connectionTestResult && (
          <Card className={`p-4 mb-6 border-l-4 ${
            connectionTestResult.success
              ? 'border-l-green-500 bg-green-50'
              : 'border-l-red-500 bg-red-50'
          }`}>
            <div className="flex items-start space-x-3">
              {connectionTestResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h4 className={`font-medium ${
                  connectionTestResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {connectionTestResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
                </h4>
                <p className={`text-sm ${
                  connectionTestResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {connectionTestResult.message}
                </p>
                {connectionTestResult.details && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(connectionTestResult.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>WhatsApp Phone Number *</span>
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
                      onBlur={(e) => {
                        field.onBlur();
                        handlePhoneValidation(e.target.value);
                      }}
                    />
                  </FormControl>
                  {showPhoneValidation && phoneValidationResult.isValid && field.value && (
                    <FormSuccessMessage
                      message="Valid phone number format"
                      className="text-xs mt-1"
                    />
                  )}
                  <FormDescription id={field.name + '-help'}>
                    The phone number registered with WhatsApp Business API (include country code)
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Phone Number ID */}
            <FormField
              control={form.control}
              name="phoneNumberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('phoneNumberId')}
                      placeholder="123456789012345"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error ' + field.name + '-help'}
                    />
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    The Phone Number ID from your WhatsApp Business API dashboard
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Business Account ID */}
            <FormField
              control={form.control}
              name="businessAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('businessAccountId')}
                      placeholder="987654321098765"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error ' + field.name + '-help'}
                    />
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    Your WhatsApp Business Account ID from Meta Business Manager
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Access Token */}
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Access Token *</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        {...formAnalytics.getFieldHandlers('accessToken')}
                        type={showAccessToken ? 'text' : 'password'}
                        placeholder="EAAxxxxxxxxxxxxx..."
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        aria-describedby={field.name + '-error ' + field.name + '-help'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label={showAccessToken ? 'Hide access token' : 'Show access token'}
                      >
                        {showAccessToken ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    Your permanent access token from Meta for Developers. Keep this secure!
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Webhook Verify Token */}
            <FormField
              control={form.control}
              name="webhookVerifyToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Verify Token *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        {...formAnalytics.getFieldHandlers('webhookVerifyToken')}
                        type={showVerifyToken ? 'text' : 'password'}
                        placeholder="your-secure-verify-token"
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        aria-describedby={field.name + '-error ' + field.name + '-help'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowVerifyToken(!showVerifyToken)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label={showVerifyToken ? 'Hide verify token' : 'Show verify token'}
                      >
                        {showVerifyToken ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    A secure token you define for webhook verification
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Webhook URL */}
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span>Webhook URL</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      {...formAnalytics.getFieldHandlers('webhookUrl')}
                      type="url"
                      placeholder="https://your-domain.com/webhook/whatsapp"
                      autoComplete="url"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-error ' + field.name + '-help'}
                    />
                  </FormControl>
                  <FormDescription id={field.name + '-help'}>
                    Optional. We'll configure this automatically if not provided
                  </FormDescription>
                  <FormMessage id={field.name + '-error'} />
                </FormItem>
              )}
            />

            {/* Test Mode Switch */}
            <FormField
              control={form.control}
              name="testMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Test Mode</span>
                    </FormLabel>
                    <FormDescription>
                      Enable test mode for safe testing without affecting production messages
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      aria-describedby={field.name + '-help'}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Test connection button */}
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isSubmitting || isTestingConnection}
                className="w-full sm:w-auto"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {/* Submit button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-describedby="submit-help"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Saving Integration...
                  </>
                ) : (
                  <>
                    Continue to Bot Configuration
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>

            <p id="submit-help" className="sr-only">
              Save your WhatsApp integration settings to proceed to bot configuration.
            </p>

            {/* Help section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Don't have your WhatsApp Business API credentials yet? Follow our setup guide:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <a href="/docs/whatsapp-setup" className="underline hover:no-underline" target="_blank">WhatsApp Business API Setup Guide</a></li>
                <li>• <a href="/docs/webhook-config" className="underline hover:no-underline" target="_blank">Webhook Configuration</a></li>
                <li>• <a href="/support" className="underline hover:no-underline" target="_blank">Contact Support</a></li>
              </ul>
            </div>
          </form>
        </Form>
      </div>
    </FormErrorBoundary>
  );
}

// Export form component wrapped with error boundary
export function WhatsAppIntegrationFormWithErrorBoundary(props: WhatsAppIntegrationFormProps) {
  return (
    <FormErrorBoundary formName="WhatsApp Integration Form">
      <WhatsAppIntegrationForm {...props} />
    </FormErrorBoundary>
  );
}