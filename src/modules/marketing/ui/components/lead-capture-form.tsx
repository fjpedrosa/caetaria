'use client';

import { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { 
  AlertCircle,
  Building,
  CheckCircle, 
  Loader2, 
  Mail,
  MessageSquare,
  Phone,
  Send, 
  Sparkles,
  User,
  Users} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { LeadSource } from '../../domain/entities/lead';

// Form validation schema
const leadCaptureSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().max(50, 'Last name is too long').optional(),
  phoneNumber: z.string()
    .optional()
    .refine((phone) => !phone || phone.startsWith('+'), {
      message: 'Phone number must include country code (e.g., +1234567890)'
    }),
  companyName: z.string().max(100, 'Company name is too long').optional(),
  interestedFeatures: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

type FormData = z.infer<typeof leadCaptureSchema>;

interface LeadCaptureFormProps {
  source: LeadSource;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'modal';
  onSuccess?: (data: FormData) => void;
}

const FEATURE_OPTIONS = [
  { id: 'whatsapp-api', label: 'WhatsApp Business API', icon: MessageSquare },
  { id: 'multi-channel', label: 'Multi-channel Support', icon: Users },
  { id: 'ai-chatbots', label: 'AI-powered Chatbots', icon: Sparkles },
  { id: 'analytics', label: 'Advanced Analytics', icon: Users },
];

/**
 * Lead Capture Form Component - Client Component
 * 
 * Advanced form with validation, RTK Query integration,
 * and multiple layout variants for different use cases.
 */
export function LeadCaptureForm({ 
  source,
  title = "Get Started with WhatsApp Cloud API",
  description = "Join thousands of businesses transforming customer communication",
  className = "",
  variant = 'default',
  onSuccess
}: LeadCaptureFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      companyName: '',
      interestedFeatures: [],
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitStatus('loading');
    
    try {
      // TODO: Replace with RTK Query mutation
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          source,
          interestedFeatures: selectedFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitStatus('success');
      onSuccess?.(data);
      
      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setSelectedFeatures([]);
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Success state - Mobile optimized
  if (submitStatus === 'success') {
    return (
      <Card className={`p-6 sm:p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 border-green-200 ${className}`}>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          We've received your information and will be in touch within 24 hours.
        </p>
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-200">
          <p className="text-xs sm:text-sm text-gray-700">
            ✨ <strong>Next steps:</strong> Check your email for our welcome guide 
            and calendar link to schedule your personalized demo.
          </p>
        </div>
      </Card>
    );
  }

  const cardClassName = variant === 'inline' 
    ? `p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-white/20 ${className}` 
    : `p-6 sm:p-8 bg-white shadow-xl border-0 ${className}`;

  return (
    <Card className={cardClassName}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
            🚀 Free Trial Available
          </Badge>
          {variant === 'default' && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Trusted by</div>
              <div className="font-bold text-green-600">10,000+ businesses</div>
            </div>
          )}
        </div>
        
        <h2 className={`font-bold text-gray-900 mb-2 ${
          variant === 'inline' ? 'text-xl' : 'text-2xl lg:text-3xl'
        }`}>
          {title}
        </h2>
        
        <p className={`text-gray-600 ${
          variant === 'inline' ? 'text-sm' : 'text-lg'
        }`}>
          {description}
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields - Mobile optimized single column */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">First Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John"
                      autoComplete="given-name"
                      inputMode="text"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[48px] text-base"
                      disabled={submitStatus === 'loading'}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      autoComplete="family-name"
                      inputMode="text"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[48px] text-base"
                      disabled={submitStatus === 'loading'}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Email - Mobile optimized */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Business Email *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@company.com"
                    autoComplete="email"
                    inputMode="email"
                    enterKeyHint="next"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[48px] text-base"
                    disabled={submitStatus === 'loading'}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Phone & Company - Mobile optimized single column */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1234567890"
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[48px] text-base"
                      disabled={submitStatus === 'loading'}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Company Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Acme Corp"
                      autoComplete="organization"
                      inputMode="text"
                      enterKeyHint="done"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[48px] text-base"
                      disabled={submitStatus === 'loading'}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Interested Features - Mobile optimized */}
          {variant === 'default' && (
            <div>
              <Label className="text-gray-700 font-semibold mb-3 block">
                What are you most interested in?
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {FEATURE_OPTIONS.map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = selectedFeatures.includes(feature.id);
                  
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      className={`flex items-center space-x-3 p-4 min-h-[56px] rounded-lg border-2 transition-all duration-200 text-left touch-manipulation ${
                        isSelected
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      disabled={submitStatus === 'loading'}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isSelected ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <span className="font-medium text-sm sm:text-base flex-1">{feature.label}</span>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button - Mobile optimized */}
          <Button
            type="submit"
            disabled={submitStatus === 'loading'}
            className={`w-full min-h-[52px] py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-200 touch-manipulation bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 active:from-green-800 active:to-blue-800 text-white shadow-lg hover:shadow-xl focus:shadow-xl`}
          >
            {submitStatus === 'loading' ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Creating Your Account...
              </>
            ) : submitStatus === 'error' ? (
              <>
                <AlertCircle className="mr-2 w-5 h-5" />
                Try Again
              </>
            ) : (
              <>
                <Send className="mr-2 w-5 h-5" />
                Start Free Trial
              </>
            )}
          </Button>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">
              ✅ 14-day free trial • ✅ No credit card required • ✅ Cancel anytime
            </p>
            <p className="text-xs text-gray-400">
              By submitting this form, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline">Terms of Service</a>{' '}
              and <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </form>
      </Form>
    </Card>
  );
}