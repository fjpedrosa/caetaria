'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variants = {
    default: 'animate-pulse bg-gray-200',
    shimmer: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer',
    pulse: 'animate-pulse-gentle bg-gradient-to-r from-brand-yellow-100 to-brand-blue-100',
    wave: 'bg-gray-200 animate-wave'
  };
  
  return (
    <div
      className={cn('rounded-lg', variants[variant], className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <motion.div 
      className={cn('rounded-xl border bg-white p-6 shadow-sm', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Skeleton variant="shimmer" className="h-6 w-20 mb-4" />
      <Skeleton variant="shimmer" className="h-8 w-full mb-2" />
      <Skeleton variant="shimmer" className="h-4 w-3/4 mb-4" />
      <Skeleton variant="shimmer" className="h-4 w-1/2" />
    </motion.div>
  );
}

export function HeroSkeleton() {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-brand-yellow-50 to-brand-blue-50 flex items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-brand-yellow-200 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-72 h-72 bg-brand-blue-200 rounded-full mix-blend-multiply filter blur-xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Skeleton variant="shimmer" className="h-16 w-3/4 mx-auto mb-6" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Skeleton variant="shimmer" className="h-6 w-2/3 mx-auto mb-8" />
        </motion.div>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Skeleton variant="pulse" className="h-14 w-40 rounded-full" />
          <Skeleton variant="pulse" className="h-14 w-40 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}
// Success/Error States
interface FeedbackStateProps {
  type: 'success' | 'error' | 'loading';
  title: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function FeedbackState({ type, title, message, onRetry, className }: FeedbackStateProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700'
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700'
    },
    loading: {
      icon: Loader2,
      iconColor: 'text-brand-blue-500',
      bgColor: 'bg-brand-blue-50 border-brand-blue-200',
      titleColor: 'text-brand-blue-900',
      messageColor: 'text-brand-blue-700'
    }
  }[type];

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'rounded-2xl border-2 p-8 text-center max-w-md mx-auto',
          config.bgColor,
          className
        )}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 150 }}
      >
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
        >
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-lg', config.iconColor)}>
            <Icon 
              className={cn('w-8 h-8', {
                'animate-spin': type === 'loading'
              })} 
            />
          </div>
        </motion.div>
        
        <motion.h3
          className={cn('text-xl font-bold mb-2', config.titleColor)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {title}
        </motion.h3>
        
        {message && (
          <motion.p
            className={cn('mb-6', config.messageColor)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {message}
          </motion.p>
        )}
        
        {type === 'error' && onRetry && (
          <motion.button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced Loading Dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-brand-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Shimmer Loading Card
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 p-6 relative overflow-hidden', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
        animate={{ x: [-100, 400] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="space-y-3 relative">
        <div className="h-4 bg-gray-300 rounded w-1/4" />
        <div className="h-6 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
    </motion.div>
  );
}
