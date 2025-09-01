/**
 * Onboarding Complete Component
 * Server Component - Displays completion summary and status
 */

import { Bot, CheckCircle, Clock, MessageSquare, Shield,Users } from 'lucide-react';

import { Badge } from '@/modules/shared/ui/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/ui/components/ui/card';

// This would typically come from the onboarding session data
const completionData = {
  businessInfo: {
    completed: true,
    companyName: 'Sample Business',
    industry: 'Technology',
    employeeCount: 25,
  },
  whatsappIntegration: {
    completed: true,
    phoneNumber: '+1 (555) 123-4567',
    isTestMode: true,
  },
  phoneVerification: {
    completed: true,
    verifiedAt: new Date(),
  },
  botConfiguration: {
    completed: true,
    botName: 'CustomerBot',
    language: 'English',
    businessHoursEnabled: true,
  },
  testing: {
    completed: true,
    testsPassed: 5,
    totalTests: 5,
    lastTestAt: new Date(),
  },
};

const completionStats = [
  {
    icon: Users,
    label: 'Business Profile',
    value: 'Configured',
    description: `${completionData.businessInfo.companyName} • ${completionData.businessInfo.employeeCount} employees`,
    status: 'complete' as const,
  },
  {
    icon: MessageSquare,
    label: 'WhatsApp API',
    value: 'Connected',
    description: `${completionData.whatsappIntegration.phoneNumber} • ${completionData.whatsappIntegration.isTestMode ? 'Test Mode' : 'Live Mode'}`,
    status: 'complete' as const,
  },
  {
    icon: Shield,
    label: 'Phone Verification',
    value: 'Verified',
    description: `Verified ${formatRelativeTime(completionData.phoneVerification.verifiedAt)}`,
    status: 'complete' as const,
  },
  {
    icon: Bot,
    label: 'Bot Setup',
    value: 'Ready',
    description: `${completionData.botConfiguration.botName} • ${completionData.botConfiguration.language}`,
    status: 'complete' as const,
  },
  {
    icon: CheckCircle,
    label: 'Testing',
    value: `${completionData.testing.testsPassed}/${completionData.testing.totalTests}`,
    description: `All tests passed • ${formatRelativeTime(completionData.testing.lastTestAt)}`,
    status: 'complete' as const,
  },
];

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function OnboardingComplete() {
  return (
    <div className="space-y-6">
      {/* Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Setup Complete</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completionStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stat.status === 'complete'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {stat.label}
                      </h3>
                      <Badge
                        variant={stat.status === 'complete' ? 'default' : 'secondary'}
                        className={stat.status === 'complete' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {stat.value}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>What happens next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-700">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Your bot is now live</h4>
                <p className="text-sm text-gray-600">
                  Customers can start messaging your WhatsApp number and receive automated responses.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-700">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Monitor conversations</h4>
                <p className="text-sm text-gray-600">
                  Use the dashboard to view incoming messages, conversation history, and analytics.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-700">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Customize and optimize</h4>
                <p className="text-sm text-gray-600">
                  Refine your bot responses, add new commands, and optimize based on usage patterns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">5</div>
            <p className="text-sm text-gray-600">Setup Steps</p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="text-xs text-gray-500">Verified</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <p className="text-sm text-gray-600">Default Commands</p>
            <p className="text-xs text-gray-500">Configured</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <p className="text-sm text-gray-600">Tests Passed</p>
            <p className="text-xs text-gray-500">Ready to go</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
