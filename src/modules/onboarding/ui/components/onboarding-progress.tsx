"use client";

/**
 * Onboarding Progress Component
 * Client Component - Step tracking and progress visualization
 */

import { CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface Step {
  id: string;
  name: string;
  href: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    href: '/onboarding',
    description: 'Get started',
  },
  {
    id: 'business',
    name: 'Business Info',
    href: '/onboarding/business',
    description: 'Tell us about your company',
  },
  {
    id: 'integration',
    name: 'WhatsApp API',
    href: '/onboarding/integration',
    description: 'Connect your API',
  },
  {
    id: 'verification',
    name: 'Verification',
    href: '/onboarding/verification',
    description: 'Verify your phone',
  },
  {
    id: 'bot-setup',
    name: 'Bot Setup',
    href: '/onboarding/bot-setup',
    description: 'Configure responses',
  },
  {
    id: 'testing',
    name: 'Testing',
    href: '/onboarding/testing',
    description: 'Test your bot',
  },
  {
    id: 'complete',
    name: 'Complete',
    href: '/onboarding/complete',
    description: 'All done!',
  },
];

function getStepStatus(stepId: string, currentPath: string): 'complete' | 'current' | 'upcoming' {
  const currentStep = steps.find(step => currentPath === step.href || 
    (currentPath.startsWith(step.href) && step.href !== '/onboarding'));
  const currentIndex = currentStep ? steps.indexOf(currentStep) : -1;
  const stepIndex = steps.findIndex(step => step.id === stepId);
  
  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

export function OnboardingProgress() {
  const pathname = usePathname();
  
  // Don't show progress on welcome or complete pages
  if (pathname === '/onboarding' || pathname === '/onboarding/complete') {
    return null;
  }

  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {steps.slice(1, -1).map((step, stepIdx) => {
          const status = getStepStatus(step.id, pathname);
          const isClickable = status === 'complete' || status === 'current';
          
          return (
            <li key={step.name} className="flex items-center flex-1">
              <div className="flex items-center">
                {isClickable ? (
                  <Link href={step.href} className="group">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200",
                          status === 'complete'
                            ? "bg-green-600 border-green-600 text-white group-hover:bg-green-700 group-hover:border-green-700"
                            : status === 'current'
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 text-gray-500"
                        )}
                      >
                        {status === 'complete' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{stepIdx + 1}</span>
                        )}
                      </div>
                      <div className="ml-3 min-w-0 hidden sm:block">
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors duration-200",
                            status === 'complete' || status === 'current'
                              ? "text-gray-900 group-hover:text-blue-600"
                              : "text-gray-500"
                          )}
                        >
                          {step.name}
                        </p>
                        <p
                          className={cn(
                            "text-xs transition-colors duration-200",
                            status === 'complete' || status === 'current'
                              ? "text-gray-600 group-hover:text-blue-500"
                              : "text-gray-400"
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2",
                        "border-gray-300 text-gray-500"
                      )}
                    >
                      <span className="text-sm font-medium">{stepIdx + 1}</span>
                    </div>
                    <div className="ml-3 min-w-0 hidden sm:block">
                      <p className="text-sm font-medium text-gray-500">
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {stepIdx !== steps.slice(1, -1).length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 ml-6 mr-6 transition-colors duration-200",
                    getStepStatus(steps[stepIdx + 2]?.id, pathname) !== 'upcoming'
                      ? "bg-green-200"
                      : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Mobile Progress Bar */}
      <div className="mt-6 sm:hidden">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(
                steps.slice(1, -1).filter(
                  step => getStepStatus(step.id, pathname) === 'complete'
                ).length / steps.slice(1, -1).length
              ) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs text-gray-500">
            {steps.slice(1, -1).filter(
              step => getStepStatus(step.id, pathname) !== 'upcoming'
            ).length} of {steps.slice(1, -1).length}
          </span>
        </div>
      </div>
    </nav>
  );
}
