/**
 * Onboarding Step Wrapper
 * Server Component - Common wrapper for onboarding steps
 */

import type { OnboardingStepWrapperPropsV2 as OnboardingStepWrapperProps } from '../../domain/types';

export function OnboardingStepWrapper({
  currentStep,
  title,
  description,
  children,
}: OnboardingStepWrapperProps) {
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Step Content */}
      {children}
    </div>
  );
}
