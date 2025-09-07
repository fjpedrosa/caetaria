import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { serverAuthHelpers } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Dashboard | Neptunik',
  description: 'Gestiona tus bots de WhatsApp y analiza tu rendimiento',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await serverAuthHelpers.getUser(supabase);

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ¡Bienvenido a tu Dashboard!
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tu dashboard está en camino
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Estamos trabajando en crear la mejor experiencia para gestionar tus bots de WhatsApp.
              Pronto podrás ver estadísticas, configurar respuestas automáticas y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/onboarding"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Configurar mi bot
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { label: 'Mensajes procesados', value: '0', icon: '💬' },
            { label: 'Clientes activos', value: '0', icon: '👥' },
            { label: 'Tasa de respuesta', value: '0%', icon: '📊' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}