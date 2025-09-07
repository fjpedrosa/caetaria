'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/shared/hooks/use-auth';

import type { SignupContainerProps } from '../../domain/types';
import { GoogleSignInButton } from '../components/google-sign-in-button';

/**
 * Signup Container Component
 *
 * Manages the signup page logic and state, connecting the auth context
 * with the presentational components.
 */
export const SignupContainer: React.FC<SignupContainerProps> = ({
  redirectTo = '/onboarding',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, signUp, signInWithGoogle, error, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Get redirect URL from query params or use default (onboarding for new users)
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
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Terms validation
    if (!acceptTerms) {
      errors.terms = 'Debes aceptar los términos y condiciones';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSigningUp(true);
      setValidationErrors({});

      await signUp(email, password);
      setShowSuccess(true);

      // Redirect will be handled by the auth state change
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setIsSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsSigningUp(true);
      await signInWithGoogle();
      // The redirect will be handled by Supabase OAuth flow
    } catch (err) {
      console.error('Signup error:', err);
      setIsSigningUp(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Cuenta creada con éxito!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirigiendo al onboarding...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 dark:from-primary/20 dark:via-purple-500/20 dark:to-pink-500/20">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-md text-center">
              {/* Neptunik Logo */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <Image
                  src="/logo.svg"
                  alt="Neptunik Logo"
                  width={80}
                  height={80}
                  className="w-full h-full"
                  priority
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Comienza tu viaje con Neptunik
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatiza tu WhatsApp Business y mejora la experiencia de tus clientes con bots inteligentes.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                    Configuración en menos de 5 minutos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                    Sin tarjeta de crédito requerida
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                    Soporte 24/7 incluido
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back to home link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Crea tu cuenta gratis
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Google Sign Up */}
          <div className="mb-6 flex justify-center">
            <GoogleSignInButton
              onClick={handleGoogleSignUp}
              disabled={isSigningUp || loading}
              text="Continuar con Google"
              fullWidth
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                O regístrate con email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
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
                disabled={isSigningUp || loading}
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
                  placeholder="Mínimo 8 caracteres"
                  disabled={isSigningUp || loading}
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

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:ring-primary focus:border-primary ${
                    validationErrors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Repite tu contraseña"
                  disabled={isSigningUp || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={isSigningUp || loading}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Acepto los{' '}
                <Link href="/terms" className="text-primary hover:text-primary/90">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/90">
                  política de privacidad
                </Link>
              </label>
            </div>
            {validationErrors.terms && (
              <p className="text-sm text-red-500">{validationErrors.terms}</p>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-400">
                  {error.message}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSigningUp || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSigningUp ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};