'use client';

/**
 * Business Info Form Component
 * Presentation Layer - Pure UI component for business information form
 *
 * This component contains ONLY presentation logic:
 * - JSX rendering
 * - Form field rendering
 * - UI event handling (delegated to hook)
 *
 * ALL business logic is extracted to useBusinessInfoForm hook
 */

import { ArrowRight, Building2, Loader2 } from 'lucide-react';

import { Button } from '@/modules/shared/ui/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shared/ui/components/ui/form';
import { Input } from '@/modules/shared/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/ui/components/ui/select';
import { Textarea } from '@/modules/shared/ui/components/ui/textarea';

import { useBusinessInfoForm, type UseBusinessInfoFormOptions } from '../../application/hooks/use-business-info-form';

// =============================================================================
// COMPONENT PROPS - Pure presentation interface
// =============================================================================

export interface BusinessInfoFormProps {
  className?: string;
  onSuccess?: UseBusinessInfoFormOptions['onSuccess'];
  onError?: UseBusinessInfoFormOptions['onError'];
  defaultValues?: UseBusinessInfoFormOptions['defaultValues'];
}

// =============================================================================
// PRESENTATIONAL COMPONENT - Only JSX rendering
// =============================================================================

export function BusinessInfoForm({
  className,
  onSuccess,
  onError,
  defaultValues
}: BusinessInfoFormProps) {

  // =============================================================================
  // HOOK INTEGRATION - All business logic from hook
  // =============================================================================

  const {
    form,
    isSubmitting,
    onSubmit,
    businessTypes,
    industries,
    volumeOptions
  } = useBusinessInfoForm({
    onSuccess,
    onError,
    defaultValues
  });

  // =============================================================================
  // PURE JSX RENDERING - No business logic
  // =============================================================================

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className || ''}`}>
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
