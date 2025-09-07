/**
 * Admin Layout Component
 *
 * Server Component with authentication validation.
 * Uses httpOnly cookies for secure authentication.
 *
 * SECURITY: Authentication is validated server-side.
 * Tokens are never exposed to client-side JavaScript.
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { requireAuth } from '@/lib/supabase/server-auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Neptunik',
  description: 'Administrative dashboard for monitoring and managing the onboarding platform',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  // This validates the httpOnly cookie session
  const user = await requireAuth('/auth/login?redirect=/admin');

  // Optional: Add role-based access control
  // if (user.role !== 'admin') {
  //   redirect('/unauthorized');
  // }

  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Admin-specific layout without marketing header/footer */}
      <div className="admin-header bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              {/* Client components can receive user data via props */}
            </div>
          </div>
        </div>
      </div>
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}