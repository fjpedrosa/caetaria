"use client";

/**
 * WhatsApp Integration Form Component
 * Client Component - Form for WhatsApp API configuration
 */

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Key, Loader2, TestTube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const whatsappIntegrationSchema = z.object({
  businessAccountId: z
    .string()
    .min(1, 'Business Account ID is required')
    .regex(/^\d+$/, 'Business Account ID must be numeric'),
  phoneNumberId: z
    .string()
    .min(1, 'Phone Number ID is required')
    .regex(/^\d+$/, 'Phone Number ID must be numeric'),
  appId: z
    .string()
    .min(1, 'App ID is required')
    .regex(/^\d+$/, 'App ID must be numeric'),
  accessToken: z
    .string()
    .min(50, 'Access Token appears to be invalid (too short)')
    .startsWith('EAAG', 'Access Token must start with EAAG'),
  webhookUrl: z
    .string()
    .url('Please enter a valid HTTPS URL')
    .startsWith('https://', 'Webhook URL must use HTTPS'),
  verifyToken: z
    .string()
    .min(8, 'Verify Token must be at least 8 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Verify Token can only contain letters, numbers, underscores, and hyphens'),
  isTestMode: z.boolean(),
});

type WhatsAppIntegrationData = z.infer<typeof whatsappIntegrationSchema>;

export function WhatsAppIntegrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();
  
  const form = useForm<WhatsAppIntegrationData>({
    resolver: zodResolver(whatsappIntegrationSchema),
    defaultValues: {
      businessAccountId: '',
      phoneNumberId: '',
      appId: '',
      accessToken: '',
      webhookUrl: '',
      verifyToken: '',
      isTestMode: false,
    },
  });

  const onSubmit = async (data: WhatsAppIntegrationData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Call API to save and validate WhatsApp config
      console.log('WhatsApp integration submitted:', data);
      
      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to next step
      router.push('/onboarding/verification');
    } catch (error) {
      console.error('Error submitting WhatsApp integration:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const testConnection = async () => {
    const formData = form.getValues();
    const validationResult = whatsappIntegrationSchema.safeParse(formData);
    
    if (!validationResult.success) {
      setTestResult({ success: false, message: 'Please fill all fields correctly before testing' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      // TODO: Call API to test connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate test result
      const success = Math.random() > 0.3; // 70% success rate for demo
      setTestResult({
        success,
        message: success 
          ? 'Connection successful! Your WhatsApp API configuration is valid.'
          : 'Connection failed. Please check your credentials and try again.',
      });
    } catch (error) {
      setTestResult({ success: false, message: 'Test failed due to network error' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Account ID and App ID */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="businessAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Account ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 123456789012345"
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription>
                    Found in your Facebook Business Manager under WhatsApp.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 987654321098765"
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription>
                    Located in your Facebook App dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone Number ID */}
          <FormField
            control={form.control}
            name="phoneNumberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number ID *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 123456789012345"
                    {...field}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  The ID of your WhatsApp phone number, found in the WhatsApp app settings.
                </FormDescription>
                <FormMessage />
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
                      type={showAccessToken ? 'text' : 'password'}
                      placeholder="EAAG..."
                      {...field}
                      className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                    >
                      {showAccessToken ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Your WhatsApp Business API access token. Starts with 'EAAG'.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Webhook URL and Verify Token */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL *</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://yourapp.com/webhook"
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription>
                    The HTTPS endpoint where WhatsApp will send events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="verifyToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verify Token *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your-secret-token"
                      {...field}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormDescription>
                    A secret token to verify webhook requests.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Test Mode */}
          <FormField
            control={form.control}
            name="isTestMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Enable Test Mode
                  </FormLabel>
                  <FormDescription>
                    Use sandbox environment for testing. No charges will apply.
                  </FormDescription>
                </div>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Test Results */}
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {testResult.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isTesting || isSubmitting}
              className="flex items-center"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || isTesting}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Configuring Integration...
                </>
              ) : (
                <>
                  Continue to Phone Verification
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
