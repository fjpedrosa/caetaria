/**
 * Bot Testing Page
 * Server Component - Bot testing and validation step
 */

import { Suspense } from 'react';
import { AlertTriangle, CheckCircle, TestTube, Zap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingStepWrapper } from '@/modules/onboarding/ui/components/onboarding-step-wrapper';
import { TestConversation } from '@/modules/onboarding/ui/components/test-conversation';

export default async function BotTestingPage() {
  return (
    <OnboardingStepWrapper
      currentStep="testing"
      title="Test your WhatsApp bot"
      description="Send test messages to verify everything is working correctly before going live."
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Test Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5 text-blue-600" />
                <span>Test Your Bot</span>
              </CardTitle>
              <CardDescription>
                Send test messages to see how your bot responds. We'll verify webhook connectivity and message delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
              </div>}>
                <TestConversation />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Checklist */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Test Checklist</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                  <span>Webhook connectivity test</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                  <span>Send test message</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                  <span>Verify message delivery</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                  <span>Test welcome message</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-green-600 rounded flex-shrink-0"></div>
                  <span>Test bot commands</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Test */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 text-lg">What we're testing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Webhook Configuration</h4>
                  <p className="text-blue-700">Verifying your server can receive WhatsApp messages</p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Message Sending</h4>
                  <p className="text-blue-700">Testing outbound message delivery to your phone</p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Bot Responses</h4>
                  <p className="text-blue-700">Ensuring automated replies work as configured</p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Command Recognition</h4>
                  <p className="text-blue-700">Testing default commands like 'help' and 'contact'</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Testing Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Use a different phone number than your business number for testing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Try various message types: text, emojis, commands</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Test during and outside business hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Verify response times are acceptable</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900 text-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-800 space-y-2">
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Webhook errors:</strong> Check your server URL and SSL certificate</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>No messages:</strong> Verify access token and phone number ID</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Slow responses:</strong> Check your server's response time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>Wrong format:</strong> Test different phone number formats</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </OnboardingStepWrapper>
  );
}
