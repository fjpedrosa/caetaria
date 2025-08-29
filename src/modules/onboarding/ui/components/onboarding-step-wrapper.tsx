/**
 * Onboarding Step Wrapper
 * Server Component - Common wrapper for onboarding steps
 */

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OnboardingStepWrapperProps {
  currentStep: string;
  title: string;
  description: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

const stepRoutes: Record<string, { prev?: string; next?: string }> = {
  'welcome': { next: '/onboarding/business' },
  'business': { prev: '/onboarding', next: '/onboarding/integration' },
  'integration': { prev: '/onboarding/business', next: '/onboarding/verification' },
  'verification': { prev: '/onboarding/integration', next: '/onboarding/bot-setup' },
  'bot-setup': { prev: '/onboarding/verification', next: '/onboarding/testing' },
  'testing': { prev: '/onboarding/bot-setup', next: '/onboarding/complete' },
  'complete': { prev: '/onboarding/testing' },
};

export function OnboardingStepWrapper({
  currentStep,
  title,
  description,
  children,
  showBackButton = true,
}: OnboardingStepWrapperProps) {
  const routes = stepRoutes[currentStep];

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          {showBackButton && routes?.prev && (
            <Link href={routes.prev}>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          )}
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
              {description}
            </p>
          </div>
          
          {showBackButton && routes?.prev && (
            <div className="w-16 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Step Content */}
      {children}
    </div>
  );
}
