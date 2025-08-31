'use client';

/**
 * Business Info Form Component
 * Client Component - Form for collecting business information
 */

import { useState } from 'react';
import { ArrowRight, Building2, Loader2 } from 'lucide-react';
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

import { BusinessType, Industry } from '../../domain/value-objects/business-info';

const businessFormSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  businessType: z.enum(['startup', 'sme', 'enterprise', 'agency', 'non-profit', 'other']),
  industry: z.enum([
    'e-commerce', 'healthcare', 'education', 'finance', 'real-estate',
    'travel', 'food-beverage', 'technology', 'consulting', 'retail', 'other'
  ]),
  employeeCount: z
    .number()
    .min(1, 'Employee count must be at least 1')
    .max(1000000, 'Employee count seems too high'),
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

type BusinessFormData = z.infer<typeof businessFormSchema>;

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

export function BusinessInfoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      companyName: '',
      businessType: undefined,
      industry: undefined,
      employeeCount: undefined,
      website: '',
      description: '',
      expectedVolume: undefined,
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Call API to save business info
      console.log('Business info submitted:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to next step
      router.push('/onboarding/integration');
    } catch (error) {
      console.error('Error submitting business info:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Company Name *</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your company name"
                  {...field}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </FormControl>
              <FormDescription>
                Use your official business name as it appears on registration documents.
              </FormDescription>
              <FormMessage />
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
                <FormLabel>Business Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
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
                <FormLabel>Number of Employees *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 25"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  This helps us recommend the right plan for your needs.
                </FormDescription>
                <FormMessage />
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
                    type="url"
                    placeholder="https://yourcompany.com"
                    {...field}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormDescription>
                  Optional. Used for verification if available.
                </FormDescription>
                <FormMessage />
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
              <FormLabel>Expected Message Volume *</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  {volumeOptions.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                This helps us suggest the most suitable plan and configuration.
              </FormDescription>
              <FormMessage />
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
                  placeholder="Tell us about your business and how you plan to use WhatsApp..."
                  className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional. Help us understand your use case to provide better recommendations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                Saving Information...
              </>
            ) : (
              <>
                Continue to WhatsApp Integration
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
