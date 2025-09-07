import { Suspense } from 'react';
import { Metadata } from 'next';

import { LoginContainer } from '@/modules/auth/presentation/containers/login-container';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Neptunik',
  description: 'Inicia sesión en tu cuenta de Neptunik para gestionar tus bots de WhatsApp',
};

function LoginPageContent() {
  return <LoginContainer />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}