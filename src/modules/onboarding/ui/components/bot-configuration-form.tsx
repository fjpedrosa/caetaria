'use client';

/**
 * Bot Configuration Form Component
 * Client Component - Form for configuring bot responses and behavior
 */

import { useState } from 'react';
import { ArrowRight, Bot, Clock, Globe, Loader2, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { getSupportedLanguages } from '../../domain/value-objects/whatsapp-config';

const botConfigSchema = z.object({
  name: z
    .string()
    .min(2, 'Bot name must be at least 2 characters')
    .max(50, 'Bot name must be less than 50 characters'),
  welcomeMessage: z
    .string()
    .min(10, 'Welcome message must be at least 10 characters')
    .max(300, 'Welcome message must be less than 300 characters'),
  languageCode: z.string(),
  businessHoursEnabled: z.boolean(),
  timezone: z.string(),
  // Business hours for each day
  mondayEnabled: z.boolean(),
  mondayOpen: z.string(),
  mondayClose: z.string(),
  tuesdayEnabled: z.boolean(),
  tuesdayOpen: z.string(),
  tuesdayClose: z.string(),
  wednesdayEnabled: z.boolean(),
  wednesdayOpen: z.string(),
  wednesdayClose: z.string(),
  thursdayEnabled: z.boolean(),
  thursdayOpen: z.string(),
  thursdayClose: z.string(),
  fridayEnabled: z.boolean(),
  fridayOpen: z.string(),
  fridayClose: z.string(),
  saturdayEnabled: z.boolean(),
  saturdayOpen: z.string(),
  saturdayClose: z.string(),
  sundayEnabled: z.boolean(),
  sundayOpen: z.string(),
  sundayClose: z.string(),
  closedMessage: z
    .string()
    .max(200, 'Closed message must be less than 200 characters')
    .optional(),
});

type BotConfigData = z.infer<typeof botConfigSchema>;

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
  { value: 'Africa/Lagos', label: 'Lagos (GMT+1)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (GMT+3)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+2)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (GMT+1)' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (GMT+3)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
];

const timeSlots = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

export function BotConfigurationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBusinessHours, setShowBusinessHours] = useState(false);
  const router = useRouter();
  const supportedLanguages = getSupportedLanguages();

  const form = useForm<BotConfigData>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      name: '',
      welcomeMessage: '',
      languageCode: 'en',
      businessHoursEnabled: false,
      timezone: 'UTC',
      mondayEnabled: true,
      mondayOpen: '09:00',
      mondayClose: '17:00',
      tuesdayEnabled: true,
      tuesdayOpen: '09:00',
      tuesdayClose: '17:00',
      wednesdayEnabled: true,
      wednesdayOpen: '09:00',
      wednesdayClose: '17:00',
      thursdayEnabled: true,
      thursdayOpen: '09:00',
      thursdayClose: '17:00',
      fridayEnabled: true,
      fridayOpen: '09:00',
      fridayClose: '17:00',
      saturdayEnabled: false,
      saturdayOpen: '09:00',
      saturdayClose: '17:00',
      sundayEnabled: false,
      sundayOpen: '09:00',
      sundayClose: '17:00',
      closedMessage: '',
    },
  });

  const onSubmit = async (data: BotConfigData) => {
    setIsSubmitting(true);

    try {
      // TODO: Call API to save bot configuration
      console.log('Bot configuration submitted:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to next step
      router.push('/onboarding/testing');
    } catch (error) {
      console.error('Error submitting bot configuration:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWelcomeMessage = () => {
    const botName = form.getValues('name');
    if (!botName) {
      form.setError('name', { message: 'Please enter a bot name first' });
      return;
    }

    const messages = [
      `Hello! Welcome to ${botName}. How can I help you today?`,
      `Hi there! I'm ${botName}, your virtual assistant. What can I do for you?`,
      `Welcome! I'm ${botName}. I'm here to help with your questions and needs.`,
      `Greetings! This is ${botName}. How may I assist you today?`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    form.setValue('welcomeMessage', randomMessage);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Configuration */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Basic Configuration</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Set up your bot's identity and initial behavior.
            </p>
          </div>

          {/* Bot Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bot Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., CustomerBot, SupportAssistant, MyBusinessBot"
                    {...field}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  Choose a friendly name for your bot that represents your business.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Welcome Message */}
          <FormField
            control={form.control}
            name="welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Welcome Message *</span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateWelcomeMessage}
                    className="text-xs"
                  >
                    Generate Suggestion
                  </Button>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Hello! Welcome to our business. How can I help you today?"
                    className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormDescription>
                    This is the first message customers will receive when they contact you.
                  </FormDescription>
                  <span className="text-xs text-gray-500">
                    {field.value?.length || 0}/300
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Language */}
          <FormField
            control={form.control}
            name="languageCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Language</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedLanguages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The primary language for your bot's responses.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business Hours */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Business Hours</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Set when your business is available for customer support.
              </p>
            </div>
            <FormField
              control={form.control}
              name="businessHoursEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        setShowBusinessHours(e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Enable business hours
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          {form.watch('businessHoursEnabled') && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Days and Hours */}
              <div className="space-y-3">
                <Label>Operating Hours</Label>
                <div className="space-y-2">
                  {daysOfWeek.map((day) => {
                    const enabledField = `${day.key}Enabled` as keyof BotConfigData;
                    const openField = `${day.key}Open` as keyof BotConfigData;
                    const closeField = `${day.key}Close` as keyof BotConfigData;
                    const isEnabled = form.watch(enabledField as any);

                    return (
                      <div key={day.key} className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 w-24">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => form.setValue(enabledField as any, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{day.label}</span>
                        </div>

                        {isEnabled && (
                          <div className="flex items-center space-x-2">
                            <select
                              value={form.watch(openField as any)}
                              onChange={(e) => form.setValue(openField as any, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <span className="text-sm text-gray-500">to</span>
                            <select
                              value={form.watch(closeField as any)}
                              onChange={(e) => form.setValue(closeField as any, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              {timeSlots.map((time) => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Closed Message */}
              <FormField
                control={form.control}
                name="closedMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message When Closed</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="We're currently closed. Our business hours are Monday-Friday 9:00-17:00. We'll get back to you soon!"
                        className="min-h-[80px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be sent when customers contact you outside business hours.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configuring Bot...
              </>
            ) : (
              <>
                Continue to Testing
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
