'use client';

import React from 'react';
import { Bot, Loader2, MessageSquare, Sparkles,Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'branded';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Global Loading State Component
 * Beautiful loading animations with multiple variants and accessibility features
 */
export function LoadingState({
  size = 'md',
  variant = 'branded',
  text = 'Loading...',
  className,
  fullScreen = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const containerSizeClasses = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg',
    xl: 'gap-5 text-xl'
  };

  const LoadingSpinner = () => (
    <Loader2
      className={cn('animate-spin text-emerald-600', sizeClasses[size])}
      aria-hidden="true"
    />
  );

  const LoadingDots = () => (
    <div className="flex space-x-1" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full bg-emerald-600 animate-pulse',
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4'
          )}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div
      className={cn(
        'rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse',
        sizeClasses[size]
      )}
      aria-hidden="true"
    />
  );

  const BrandedLoader = () => (
    <div className="relative" aria-hidden="true">
      {/* Outer rotating ring */}
      <div className={cn(
        'border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin',
        sizeClasses[size]
      )} />

      {/* Inner icons that fade in/out */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <MessageSquare
            className={cn(
              'absolute inset-0 text-emerald-600 opacity-0 animate-ping',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              size === 'xl' && 'w-6 h-6'
            )}
            style={{ animationDelay: '0s' }}
          />
          <Bot
            className={cn(
              'absolute inset-0 text-emerald-700 opacity-0 animate-ping',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              size === 'xl' && 'w-6 h-6'
            )}
            style={{ animationDelay: '0.5s' }}
          />
          <Sparkles
            className={cn(
              'absolute inset-0 text-emerald-500 opacity-0 animate-ping',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-3 h-3',
              size === 'lg' && 'w-4 h-4',
              size === 'xl' && 'w-6 h-6'
            )}
            style={{ animationDelay: '1s' }}
          />
        </div>
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <LoadingSpinner />;
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      case 'branded':
      default:
        return <BrandedLoader />;
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center justify-center',
        containerSizeClasses[size],
        className
      )}
      role="status"
      aria-label={text}
    >
      {renderLoader()}
      {text && (
        <span className="font-medium text-gray-700 animate-pulse">
          {text}
        </span>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

/**
 * Page Loading Component
 * Full-screen loading state with branding
 */
export function PageLoadingState({ text = 'Loading your experience...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <LoadingState size="xl" variant="branded" className="justify-center" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          WhatsApp Cloud API
        </h2>

        <p className="text-gray-600 text-lg mb-6">
          {text}
        </p>

        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>

        <p className="text-sm text-gray-500">
          Preparing your messaging platform...
        </p>
      </div>
    </div>
  );
}

/**
 * Button Loading State
 * Loading state specifically for buttons
 */
export function ButtonLoadingState({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingState
      size={size}
      variant="spinner"
      className="justify-center"
    />
  );
}