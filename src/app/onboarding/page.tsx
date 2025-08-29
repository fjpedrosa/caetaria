import { Suspense } from 'react'
import { OnboardingWizard } from '@/modules/onboarding/ui/components/onboarding-wizard'

export const dynamic = 'force-dynamic'

function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Cargando onboarding...</p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingWizard />
    </Suspense>
  )
}
