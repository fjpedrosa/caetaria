'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { GoogleSignInButtonProps } from '../../domain/types';

export interface GoogleSignInButtonComponentProps extends GoogleSignInButtonProps {
  onClick?: () => void | Promise<void>;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonComponentProps> = ({
  onClick,
  onSuccess,
  onError,
  disabled = false,
  fullWidth = false,
  text = 'Continuar con Google',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);

      if (onClick) {
        await onClick();
      }
    } catch (error: any) {
      setIsLoading(false);
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative flex items-center justify-center gap-3 px-4 py-3',
        'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300',
        'border border-gray-300 dark:border-gray-700',
        'rounded-lg font-medium text-sm',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'focus:ring-blue-500 dark:focus:ring-blue-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-all duration-200',
        fullWidth && 'w-full',
        isLoading && 'cursor-wait'
      )}
      aria-label="Sign in with Google"
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Conectando...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>{text}</span>
        </>
      )}
    </button>
  );
};