/**
 * Onboarding Layout
 * Server Component - Layout wrapper for onboarding pages with progress indicator
 */

import { OnboardingProgress } from '@/modules/onboarding/ui/components/onboarding-progress';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WC</span>
              </div>
              <span className="font-semibold text-gray-900">WhatsApp Cloud</span>
            </div>
            <div className="text-sm text-gray-600">
              Setup Assistant
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
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

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Need help? Contact our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                support team
              </a>
            </div>
            <div>
              <a href="#" className="hover:underline">
                Documentation
              </a>
              {' '}•{' '}
              <a href="#" className="hover:underline">
                API Reference
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
