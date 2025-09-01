/**
 * Onboarding Complete Page
 * Server Component - Completion and dashboard redirect
 */

import { ArrowRight, BarChart3, CheckCircle, MessageSquare, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import { OnboardingComplete } from '@/modules/onboarding/ui/components/onboarding-complete';
import { Button } from '@/modules/shared/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/ui/components/ui/card';

const nextStepsFeatures = [
  {
    icon: MessageSquare,
    title: 'Customize Responses',
    description: 'Create custom automated responses and conversation flows',
    href: '/dashboard/bot-builder',
  },
  {
    icon: Users,
    title: 'Invite Team Members',
    description: 'Add team members to manage conversations and analytics',
    href: '/dashboard/team',
  },
  {
    icon: BarChart3,
    title: 'View Analytics',
    description: 'Monitor conversation metrics and customer engagement',
    href: '/dashboard/analytics',
  },
];

export default async function OnboardingCompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">
                Congratulations!
              </h1>
              <p className="text-xl text-gray-600">
                Your WhatsApp bot is now ready to serve your customers
              </p>
            </div>

            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Setup completed successfully
            </div>
          </div>

          {/* Completion Summary */}
          <OnboardingComplete />

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">What's next?</CardTitle>
              <CardDescription className="text-center">
                Here are some recommended next steps to get the most out of your WhatsApp bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {nextStepsFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="group">
                      <Link href={feature.href}>
                        <Card className="h-full border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer">
                          <CardHeader className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {feature.description}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Setup Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 text-lg">Your Setup Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-green-800">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Business information configured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>WhatsApp API integrated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Phone number verified</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Bot responses configured</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Webhook connectivity tested</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Test messages sent successfully</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-6">
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-blue-800">
                <p className="mb-2">
                  <strong>Need help?</strong> Our support team is here to assist you.
                </p>
                <div className="space-x-4">
                  <Link href="#" className="text-blue-600 hover:underline font-medium">
                    View Documentation
                  </Link>
                  <span className="text-blue-400">•</span>
                  <Link href="#" className="text-blue-600 hover:underline font-medium">
                    Contact Support
                  </Link>
                  <span className="text-blue-400">•</span>
                  <Link href="#" className="text-blue-600 hover:underline font-medium">
                    Join Community
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
