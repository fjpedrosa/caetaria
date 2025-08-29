/**
 * Business Information Page
 * Server Component - Business information collection step
 */

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessInfoForm } from '@/modules/onboarding/ui/components/business-info-form';
import { Building2, Clock, Users } from 'lucide-react';
import { OnboardingStepWrapper } from '@/modules/onboarding/ui/components/onboarding-step-wrapper';

export default async function BusinessInfoPage() {
  return (
    <OnboardingStepWrapper
      currentStep="business"
      title="Tell us about your business"
      description="This helps us customize your WhatsApp bot experience for your specific needs."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Help us understand your business so we can provide the best experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>}>
                <BusinessInfoForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Why This Matters */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg">Why this matters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>
                Understanding your business helps us:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Suggest relevant bot templates</li>
                <li>Set appropriate message limits</li>
                <li>Recommend integrations</li>
                <li>Customize the user experience</li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Coming Next</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-700">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">WhatsApp Integration</h4>
                  <p className="text-gray-600">Connect your WhatsApp Business API credentials</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-gray-700">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Phone Verification</h4>
                  <p className="text-gray-600">Verify your business phone number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Pro Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Use your official business name as it appears on your registration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Employee count helps us recommend the right plan</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Website URL will be used for verification if available</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
