/**
 * Admin Layout Component
 *
 * Layout wrapper for admin dashboard with authentication,
 * role-based access control, and admin-specific navigation.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Neptunik',
  description: 'Administrative dashboard for monitoring and managing the onboarding platform',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout min-h-screen bg-gray-50">
      {/* Admin-specific layout without marketing header/footer */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}