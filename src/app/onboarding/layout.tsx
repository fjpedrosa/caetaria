/**
 * Onboarding Layout
 * Server Component - Layout wrapper for onboarding pages with progress indicator
 */

import { OnboardingProgress } from '@/modules/onboarding/presentation/components/onboarding-progress';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Progress Indicator */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="container mx-auto px-4 py-6">
          <OnboardingProgress />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Help Section */}
      <div className="container mx-auto px-4 py-8 mt-12 border-t">
        <div className="text-center text-sm text-gray-600">
          <p>
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:contacto@neptunik.com" className="text-blue-600 hover:underline">
              contacto@neptunik.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
