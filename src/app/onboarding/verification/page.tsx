/**
 * Phone Verification Page
 * Server Component - Phone number verification step
 */

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneVerificationForm } from '@/modules/onboarding/ui/components/phone-verification-form';
import { Shield, Phone, Clock, CheckCircle } from 'lucide-react';
import { OnboardingStepWrapper } from '@/modules/onboarding/ui/components/onboarding-step-wrapper';

export default async function PhoneVerificationPage() {
  return (
    <OnboardingStepWrapper
      currentStep="verification"
      title="Verify your business phone number"
      description="We'll send a verification code to confirm you own this phone number."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span>Phone Number Verification</span>
              </CardTitle>
              <CardDescription>
                Enter the phone number associated with your WhatsApp Business account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>}>
                <PhoneVerificationForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Process */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verification Process</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Enter phone number</p>
                  <p className="text-blue-700">Provide your business phone number</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Receive code</p>
                  <p className="text-blue-700">We'll send a 6-digit code via WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Enter code</p>
                  <p className="text-blue-700">Input the code to complete verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Why Verification?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-2">
              <p>
                Phone verification ensures:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>You own the business phone number</li>
                <li>Compliance with WhatsApp policies</li>
                <li>Prevention of unauthorized access</li>
                <li>Improved deliverability rates</li>
              </ul>
            </CardContent>
          </Card>

          {/* Timing Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Timing & Limits</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Code Expiry</h4>
                <p>Verification codes expire after 10 minutes</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Retry Limit</h4>
                <p>You can request a new code up to 5 times per hour</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Delivery Time</h4>
                <p>Codes typically arrive within 30 seconds</p>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 text-lg">Not receiving codes?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Check your WhatsApp is connected to the internet</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Verify the phone number format is correct</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Wait a few minutes before requesting again</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Contact support if issues persist</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
