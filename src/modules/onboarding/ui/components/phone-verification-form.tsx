"use client";

/**
 * Phone Verification Form Component
 * Client Component - Form for phone number verification with OTP
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowRight, Phone, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  countryCode: z
    .string()
    .length(2, 'Country code must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
});

const otpSchema = z.object({
  verificationCode: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

type PhoneData = z.infer<typeof phoneSchema>;
type OtpData = z.infer<typeof otpSchema>;

const countryCodes = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
];

export function PhoneVerificationForm() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[1]); // Default to Nigeria
  const router = useRouter();
  
  const phoneForm = useForm<PhoneData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: '',
      countryCode: 'NG',
    },
  });
  
  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const sendVerificationCode = async (data: PhoneData) => {
    setIsLoading(true);
    
    try {
      // TODO: Call API to send verification code
      console.log('Sending verification code to:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPhoneNumber(`${selectedCountry.dialCode} ${data.phoneNumber}`);
      setStep('otp');
      
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (data: OtpData) => {
    setIsLoading(true);
    
    try {
      // TODO: Call API to verify code
      console.log('Verifying code:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to next step
      router.push('/onboarding/bot-setup');
    } catch (error) {
      console.error('Error verifying code:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (countdown > 0) return;
    
    const phoneData = phoneForm.getValues();
    await sendVerificationCode(phoneData);
  };

  if (step === 'phone') {
    return (
      <Form {...phoneForm}>
        <form onSubmit={phoneForm.handleSubmit(sendVerificationCode)} className="space-y-6">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    phoneForm.setValue('countryCode', country.code);
                  }}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                    selectedCountry.code === country.code
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.dialCode}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <FormField
            control={phoneForm.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number *</span>
                </FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 text-sm text-gray-600">
                      {selectedCountry.flag} {selectedCountry.dialCode}
                    </div>
                    <Input
                      placeholder="Enter your phone number"
                      {...field}
                      className="rounded-l-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter your WhatsApp Business phone number without the country code.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Verification code sent</h3>
          <p className="text-sm text-gray-600">
            We sent a 6-digit code to <strong>{phoneNumber}</strong>
          </p>
        </div>
      </div>

      {/* OTP Form */}
      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(verifyCode)} className="space-y-6">
          <FormField
            control={otpForm.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    {...field}
                    className="text-center text-2xl tracking-widest transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter the 6-digit code you received via WhatsApp.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Resend Code */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Resend code in {countdown}s</span>
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={resendCode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Didn't receive the code? Resend
              </Button>
            )}
          </div>

          {/* Submit Button */}
          <div className="space-y-4">
            <Button
              type="submit"
              disabled={isLoading || otpForm.watch('verificationCode').length !== 6}
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify and Continue
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('phone');
                otpForm.reset();
              }}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
