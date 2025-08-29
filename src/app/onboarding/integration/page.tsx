/**
 * WhatsApp Integration Page
 * Server Component - WhatsApp API integration setup
 */

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppIntegrationForm } from '@/modules/onboarding/ui/components/whatsapp-integration-form';
import { MessageCircle, Shield, ExternalLink, AlertCircle } from 'lucide-react';
import { OnboardingStepWrapper } from '@/modules/onboarding/ui/components/onboarding-step-wrapper';
import Link from 'next/link';

export default async function WhatsAppIntegrationPage() {
  return (
    <OnboardingStepWrapper
      currentStep="integration"
      title="Connect WhatsApp Business API"
      description="Enter your WhatsApp Business API credentials to enable bot functionality."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>WhatsApp API Configuration</span>
              </CardTitle>
              <CardDescription>
                Enter your WhatsApp Business API credentials. Don't have them yet? We can help you get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>}>
                <WhatsAppIntegrationForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Need Help Getting Started */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 text-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Need WhatsApp API?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-3">
              <p>
                Don't have WhatsApp Business API credentials yet? We can help you get set up.
              </p>
              <Link 
                href="#"
                className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium"
              >
                Get WhatsApp API Access
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Your Data is Secure</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <ul className="space-y-1 list-disc list-inside">
                <li>All credentials are encrypted at rest</li>
                <li>We use industry-standard security practices</li>
                <li>Your tokens are never logged or exposed</li>
                <li>SOC 2 Type II compliant infrastructure</li>
              </ul>
            </CardContent>
          </Card>

          {/* Where to Find Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg">Where to find this info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Facebook Developers Console</h4>
                <p>Log in to developers.facebook.com and navigate to your WhatsApp app</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Business Manager</h4>
                <p>Find your Business Account ID in WhatsApp Manager settings</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Phone Number ID</h4>
                <p>Located in the WhatsApp app dashboard under phone numbers</p>
              </div>
              
              <Link 
                href="#"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View Setup Guide
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </CardContent>
          </Card>

          {/* Test Mode Info */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg">Test Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-2">
              <p>
                Enable test mode to:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Test with sandbox phone numbers</li>
                <li>Avoid charges during development</li>
                <li>Simulate webhook events</li>
                <li>Debug message flows safely</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
