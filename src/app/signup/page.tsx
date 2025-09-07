import { Suspense } from 'react';
import { Metadata } from 'next';

import { SignupContainer } from '@/modules/auth/presentation/containers/signup-container';

export const metadata: Metadata = {
  title: 'Crear Cuenta | Neptunik',
  description: 'Crea tu cuenta gratuita en Neptunik y comienza a automatizar tu WhatsApp Business',
};

function SignupPageContent() {
  return <SignupContainer />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}