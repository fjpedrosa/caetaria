/**
 * Bot Setup Page
 * Server Component - Bot configuration step
 */

import { Suspense } from 'react';
import { Bot, Globe, MessageSquare, Settings } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BotConfigurationForm } from '@/modules/onboarding/ui/components/bot-configuration-form';
import { OnboardingStepWrapper } from '@/modules/onboarding/ui/components/onboarding-step-wrapper';

export default async function BotSetupPage() {
  return (
    <OnboardingStepWrapper
      currentStep="bot-setup"
      title="Configure your WhatsApp bot"
      description="Set up automated responses, business hours, and customize your bot's behavior."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span>Bot Configuration</span>
              </CardTitle>
              <CardDescription>
                Customize how your bot interacts with customers. You can always change these settings later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>}>
                <BotConfigurationForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Best Practices */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Keep welcome messages concise and friendly</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Set clear business hours to manage expectations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Include contact options for human support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Use your brand's tone and voice consistently</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Language Options */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Supported Languages</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800">
              <p className="mb-2">We support major African and international languages:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>• English</span>
                <span>• French</span>
                <span>• Portuguese</span>
                <span>• Arabic</span>
                <span>• Swahili</span>
                <span>• Amharic</span>
                <span>• Hausa</span>
                <span>• Igbo</span>
                <span>• Yoruba</span>
                <span>• Spanish</span>
              </div>
            </CardContent>
          </Card>

          {/* Commands Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Default Commands</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-3">
              <p>We'll set up these basic commands for you:</p>
              
              <div className="space-y-2">
                <div className="bg-gray-100 p-2 rounded">
                  <code className="text-xs font-mono text-blue-600">help</code>
                  <p className="text-xs mt-1">Shows available commands and options</p>
                </div>
                
                <div className="bg-gray-100 p-2 rounded">
                  <code className="text-xs font-mono text-blue-600">contact</code>
                  <p className="text-xs mt-1">Provides contact information for support</p>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                You can add more commands and customize responses in the dashboard later.
              </p>
            </CardContent>
          </Card>

          {/* Business Hours Info */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900 text-lg">Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-purple-800 space-y-2">
              <p>
                Setting business hours helps:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Manage customer expectations</li>
                <li>Show when human support is available</li>
                <li>Automatically inform about response times</li>
                <li>Improve customer satisfaction</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
