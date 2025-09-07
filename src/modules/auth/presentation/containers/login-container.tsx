'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Eye, EyeOff,MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/modules/shared/presentation/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';

import type { LoginContainerProps } from '../../domain/types';
import { GoogleSignInButton } from '../components/google-sign-in-button';

/**
 * Login Container Component
 *
 * Manages the login page logic and state, connecting the auth hook
 * with the presentational components.
 */
export const LoginContainer: React.FC<LoginContainerProps> = ({
  redirectTo = '/dashboard',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, signIn, signInWithGoogle, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get redirect URL from query params or use default
  // If coming from "Comenzar Gratis", redirect will be /onboarding
  const redirect = searchParams.get('redirect') || redirectTo;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
    }
  }, [isAuthenticated, loading, redirect, router]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'El email es requerido';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Email inválido';
    }

    // Password validation
    if (!password) {
      errors.password = 'La contraseña es requerida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSigningIn(true);
      setValidationErrors({});

      await signIn(email, password);
      setShowSuccess(true);

      // Redirect will be handled by the auth state change
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      // The redirect will be handled by Supabase OAuth flow
    } catch (err) {
      console.error('Login error:', err);
      setIsSigningIn(false);
    }
  };

  // Show success message when authenticated
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ¡Inicio de sesión exitoso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirigiendo a tu dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm mx-auto">
          {/* Back to Home Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bienvenido de vuelta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          {/* Error Message */}
          {error && !isSigningIn && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </div>
          )}

          {/* Sign In Options */}
          <div className="space-y-4">
            {/* Google Sign In */}
            <GoogleSignInButton
              fullWidth
              disabled={isSigningIn || loading}
              text={isSigningIn ? 'Conectando...' : 'Continuar con Google'}
              onClick={handleGoogleSignIn}
              onError={(err) => console.error('Google sign-in error:', err)}
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-500">
                  O continúa con email
                </span>
              </div>
            </div>

            {/* Email Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${
                    validationErrors.email
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="tu@email.com"
                  disabled={isSigningIn || loading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${
                      validationErrors.password
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    placeholder="Tu contraseña"
                    disabled={isSigningIn || loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSigningIn || loading}
                className="w-full"
                size="lg"
              >
                {isSigningIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>

          {/* Terms and Privacy */}
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <Link
              href="/terms"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link
              href="/privacy"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Feature Highlight */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col justify-center px-8 lg:px-12 xl:px-16 max-w-xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Automatiza tu WhatsApp Business con IA
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Conecta con tus clientes 24/7, responde instantáneamente y escala tu negocio sin límites.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mt-8">
              {[
                'Respuestas automáticas inteligentes',
                'Integración con múltiples canales',
                'Analytics en tiempo real',
                'Soporte multiidioma',
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "Neptunik transformó completamente nuestra atención al cliente.
                Ahora respondemos 10x más rápido y nuestros clientes están más satisfechos que nunca."
              </p>
              <div className="mt-4">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  María González
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CEO, TechStartup México
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};