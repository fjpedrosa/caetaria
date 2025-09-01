'use client';

/**
 * Enhanced Bot Configuration Form Component
 *
 * Advanced form for configuring WhatsApp bot with RTK Query integration,
 * real-time validation, persistence, and accessibility compliance.
 */

import { useCallback, useEffect,useState } from 'react';
import { ArrowRight, Bot, Brain, Clock, Loader2, MessageSquare, Plus, Save, TestTube,Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFieldArray,useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormErrorBoundary, FormErrorMessage, FormSuccessMessage } from '@/modules/shared/ui/components/form-error-boundary';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card } from '@/modules/shared/ui/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/ui/components/ui/form';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/components/ui/select';
import { Switch } from '@/modules/shared/ui/components/ui/switch';
import { Textarea } from '@/modules/shared/ui/components/ui/textarea';
import { useFormAnalytics } from '@/modules/shared/ui/hooks/use-form-analytics';
import { useFormPersistence } from '@/modules/shared/ui/hooks/use-form-persistence';
import {
  type BotConfigurationFormData,
  botConfigurationSchema} from '@/modules/shared/ui/validation/form-schemas';
import {
  useGetOnboardingSessionQuery,
  useGetWhatsAppIntegrationQuery,
  useSubmitBotConfigurationMutation,
  useUpdateOnboardingSessionMutation
} from '@/store/api/onboarding-api';

const aiModels = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Recommended)', description: 'Fast and cost-effective' },
  { value: 'gpt-4', label: 'GPT-4', description: 'More advanced reasoning' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fast and efficient' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
];

const defaultBusinessHours = [
  { day: 'Monday', startTime: '09:00', endTime: '18:00', enabled: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '18:00', enabled: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '18:00', enabled: true },
  { day: 'Thursday', startTime: '09:00', endTime: '18:00', enabled: true },
  { day: 'Friday', startTime: '09:00', endTime: '18:00', enabled: true },
  { day: 'Saturday', startTime: '10:00', endTime: '16:00', enabled: false },
  { day: 'Sunday', startTime: '10:00', endTime: '16:00', enabled: false },
];

interface BotConfigurationFormProps {
  userId: string;
  integrationId?: string;
  onSuccess?: (data: BotConfigurationFormData) => void;
  onStepChange?: (step: string) => void;
  className?: string;
  showHeader?: boolean;
}

export function BotConfigurationForm({
  userId,
  integrationId,
  onSuccess,
  onStepChange,
  className = '',
  showHeader = true
}: BotConfigurationFormProps) {
  const router = useRouter();
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Get current session and integration data
  const { data: sessionData } = useGetOnboardingSessionQuery({ userId });
  const { data: integrationData } = useGetWhatsAppIntegrationQuery({ userId });

  // RTK Query mutations
  const [submitBotConfiguration, {
    isLoading: isSubmitting,
    isSuccess: isSubmissionSuccessful,
    isError: isSubmissionError,
    error: submissionError
  }] = useSubmitBotConfigurationMutation();

  const [updateSession] = useUpdateOnboardingSessionMutation();

  const form = useForm<BotConfigurationFormData>({
    resolver: zodResolver(botConfigurationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
      welcomeMessage: 'Hello! Welcome to our WhatsApp support. How can I help you today?',
      fallbackMessage: 'I didn\'t understand that. Could you please rephrase your question?',
      businessHours: {
        enabled: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        schedule: defaultBusinessHours,
      },
      autoReplyEnabled: true,
      aiEnabled: false,
      aiModel: 'gpt-3.5-turbo',
      aiPersonality: '',
      trainingData: [],
    },
  });

  // Training data field array
  const { fields: trainingFields, append: addTraining, remove: removeTraining } = useFieldArray({
    control: form.control,
    name: 'trainingData',
  });

  // Form persistence
  const formPersistence = useFormPersistence(form, {
    storageKey: `bot-config-${userId}`,
    ttl: 60 * 60 * 1000, // 1 hour
    excludeFields: ['trainingData'], // Exclude complex nested data
    onRestore: (data) => {
      toast.info('Bot configuration restored from previous session', {
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
    formId: `bot-config-${userId}`,
    formName: 'Bot Configuration Form',
    trackFieldInteractions: true,
    trackValidationErrors: true,
    trackCompletionTime: true,
  });

  const onSubmit = useCallback(async (data: BotConfigurationFormData) => {
    try {
      if (!integrationData?.id) {
        toast.error('WhatsApp integration not found. Please complete the previous step.');
        return;
      }

      const result = await submitBotConfiguration({
        userId,
        integrationId: integrationData.id,
        botConfig: data
      }).unwrap();

      // Track successful submission
      formAnalytics.trackSubmissionAttempt(true);

      // Clear persisted data
      formPersistence.clearPersistedData();

      // Update session step
      await updateSession({
        userId,
        step: 'testing',
        markStepComplete: 'bot_configuration',
        sessionData: { botConfig: data },
      });

      // Show success notification
      toast.success('Bot configuration saved successfully!', {
        duration: 3000,
        description: 'Proceeding to integration testing.',
      });

      onSuccess?.(data);
      onStepChange?.('testing');

      // Navigate to next step
      setTimeout(() => {
        router.push('/onboarding/testing');
      }, 1000);

    } catch (error) {
      console.error('Error submitting bot configuration:', error);

      // Track failed submission
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      formAnalytics.trackSubmissionAttempt(false, errorMessage);

      // Show error notification
      toast.error('Failed to save bot configuration', {
        duration: 5000,
        description: 'Please check your settings and try again.',
        action: {
          label: 'Retry',
          onClick: () => form.handleSubmit(onSubmit)(),
        },
      });
    }
  }, [submitBotConfiguration, userId, integrationData, formAnalytics, formPersistence, onSuccess, onStepChange, router, form, updateSession]);

  // Auto-save draft
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

  return (
    <FormErrorBoundary formName="Bot Configuration Form">
      <div className={className}>
        {showHeader && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bot Configuration
            </h2>
            <p className="text-gray-600">
              Configure your WhatsApp bot's behavior, messages, and AI capabilities.
            </p>
          </div>
        )}

        {/* Show submission error */}
        {isSubmissionError && (
          <FormErrorMessage
            error="Failed to save bot configuration. Please check your settings and try again."
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>

            {/* Basic Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Basic Configuration</span>
              </h3>

              <div className="space-y-6">
                {/* Bot Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          {...formAnalytics.getFieldHandlers('name')}
                          placeholder="My Business Assistant"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          aria-describedby={field.name + '-error'}
                        />
                      </FormControl>
                      <FormDescription>
                        A friendly name for your bot (customers won't see this)
                      </FormDescription>
                      <FormMessage id={field.name + '-error'} />
                    </FormItem>
                  )}
                />

                {/* Bot Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          {...formAnalytics.getFieldHandlers('description')}
                          placeholder="Describe what this bot does and its purpose..."
                          className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          maxLength={200}
                          aria-describedby={field.name + '-error ' + field.name + '-help'}
                        />
                      </FormControl>
                      <FormDescription id={field.name + '-help'}>
                        Optional. Internal description for your reference.
                        {field.value && (
                          <span className="block text-xs text-gray-400 mt-1">
                            {field.value.length}/200 characters
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage id={field.name + '-error'} />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Messages Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </h3>

              <div className="space-y-6">
                {/* Welcome Message */}
                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          {...formAnalytics.getFieldHandlers('welcomeMessage')}
                          placeholder="Hello! Welcome to our WhatsApp support. How can I help you today?"
                          className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          maxLength={1000}
                          aria-describedby={field.name + '-error ' + field.name + '-help'}
                        />
                      </FormControl>
                      <FormDescription id={field.name + '-help'}>
                        First message sent to new customers.
                        {field.value && (
                          <span className="block text-xs text-gray-400 mt-1">
                            {field.value.length}/1000 characters
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage id={field.name + '-error'} />
                    </FormItem>
                  )}
                />

                {/* Fallback Message */}
                <FormField
                  control={form.control}
                  name="fallbackMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          {...formAnalytics.getFieldHandlers('fallbackMessage')}
                          placeholder="I didn't understand that. Could you please rephrase your question?"
                          className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                          maxLength={500}
                          aria-describedby={field.name + '-error ' + field.name + '-help'}
                        />
                      </FormControl>
                      <FormDescription id={field.name + '-help'}>
                        Message sent when the bot doesn't understand a customer's request.
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
              </div>
            </Card>

            {/* Bot Behavior Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Bot Behavior</span>
              </h3>

              <div className="space-y-6">
                {/* Auto Reply */}
                <FormField
                  control={form.control}
                  name="autoReplyEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Reply</FormLabel>
                        <FormDescription>
                          Automatically send responses to customer messages
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

                {/* AI Integration */}
                <FormField
                  control={form.control}
                  name="aiEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center space-x-2">
                          <Brain className="w-4 h-4" />
                          <span>AI-Powered Responses</span>
                        </FormLabel>
                        <FormDescription>
                          Use AI to generate intelligent responses to customer queries
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setShowAdvancedOptions(checked);
                          }}
                          disabled={isSubmitting}
                          aria-describedby={field.name + '-help'}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* AI Model Selection - Only show if AI is enabled */}
                {form.watch('aiEnabled') && (
                  <FormField
                    control={form.control}
                    name="aiModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger aria-describedby={field.name + '-error'}>
                              <SelectValue placeholder="Select AI model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {aiModels.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                <div className="flex flex-col">
                                  <span>{model.label}</span>
                                  <span className="text-xs text-gray-500">{model.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage id={field.name + '-error'} />
                      </FormItem>
                    )}
                  />
                )}

                {/* AI Personality */}
                {form.watch('aiEnabled') && (
                  <FormField
                    control={form.control}
                    name="aiPersonality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Personality</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            {...formAnalytics.getFieldHandlers('aiPersonality')}
                            placeholder="You are a helpful and friendly customer service assistant. Always be polite and professional..."
                            className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            maxLength={500}
                            aria-describedby={field.name + '-error ' + field.name + '-help'}
                          />
                        </FormControl>
                        <FormDescription id={field.name + '-help'}>
                          Define your bot's personality and behavior guidelines.
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
                )}
              </div>
            </Card>

            {/* Training Data - Only show if AI is enabled */}
            {form.watch('aiEnabled') && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <TestTube className="w-5 h-5" />
                    <span>Training Data</span>
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTraining({ question: '', answer: '', keywords: [] })}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Training
                  </Button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Provide example questions and answers to train your AI bot for better responses.
                </p>

                <div className="space-y-4">
                  {trainingFields.map((field, index) => (
                    <Card key={field.id} className="p-4 border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Training Example {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTraining(index)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {/* Question */}
                        <FormField
                          control={form.control}
                          name={`trainingData.${index}.question`}
                          render={({ field: questionField }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Input
                                  {...questionField}
                                  placeholder="What are your business hours?"
                                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                  disabled={isSubmitting}
                                  aria-describedby={questionField.name + '-error'}
                                />
                              </FormControl>
                              <FormMessage id={questionField.name + '-error'} />
                            </FormItem>
                          )}
                        />

                        {/* Answer */}
                        <FormField
                          control={form.control}
                          name={`trainingData.${index}.answer`}
                          render={({ field: answerField }) => (
                            <FormItem>
                              <FormLabel>Answer</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...answerField}
                                  placeholder="We're open Monday to Friday, 9 AM to 6 PM EST."
                                  className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                  disabled={isSubmitting}
                                  aria-describedby={answerField.name + '-error'}
                                />
                              </FormControl>
                              <FormMessage id={answerField.name + '-error'} />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}

                  {trainingFields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No training data added yet.</p>
                      <p className="text-sm">Add examples to improve your bot's responses.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Business Hours Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Business Hours</span>
              </h3>

              <FormField
                control={form.control}
                name="businessHours.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Business Hours</FormLabel>
                      <FormDescription>
                        Only respond to messages during specified business hours
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
            </Card>

            {/* Action buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
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
                    Saving Configuration...
                  </>
                ) : (
                  <>
                    Continue to Testing
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>

            <p id="submit-help" className="sr-only">
              Save your bot configuration to proceed to the testing phase.
            </p>
          </form>
        </Form>
      </div>
    </FormErrorBoundary>
  );
}

// Export form component wrapped with error boundary
export function BotConfigurationFormWithErrorBoundary(props: BotConfigurationFormProps) {
  return (
    <FormErrorBoundary formName="Bot Configuration Form">
      <BotConfigurationForm {...props} />
    </FormErrorBoundary>
  );
}