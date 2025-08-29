'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
  description?: string
}

interface OnboardingStepperProps {
  currentStep: number
  completedSteps: number[]
  steps: Step[]
  className?: string
}

export function OnboardingStepper({
  currentStep,
  completedSteps,
  steps,
  className
}: OnboardingStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${((Math.max(...completedSteps, 0)) / (steps.length - 1)) * 100}%`
            }}
          />
        </div>
        
        <ol className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number)
            const isCurrent = currentStep === step.number
            const isPending = !isCompleted && !isCurrent
            
            return (
              <li key={step.number} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition-all duration-300',
                    {
                      'border-green-500 bg-green-500 text-white': isCompleted,
                      'border-blue-500 bg-blue-500 text-white shadow-lg scale-110': isCurrent,
                      'border-gray-300 text-gray-500': isPending
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-500': isPending
                      }
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="mt-1 text-xs text-gray-400 max-w-[120px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}