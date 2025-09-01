'use client';

import { forwardRef, InputHTMLAttributes, ReactNode,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { AlertCircle,Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  icon?: ReactNode;
  error?: string;
  success?: boolean;
  helperText?: string;
}

/**
 * Floating Input Component
 *
 * Advanced input field with floating label animation,
 * validation states, icons, and smooth transitions.
 */
export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({
    label,
    icon,
    error,
    success,
    helperText,
    className,
    disabled,
    type = 'text',
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value !== '');
      props.onChange?.(e);
    };

    const isFloated = isFocused || hasValue || type === 'date' || type === 'time';
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className="relative">
        <div className="relative">
          {/* Input Field */}
          <input
            ref={ref}
            type={type}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'peer w-full px-4 pb-2 pt-6 text-sm bg-white border rounded-lg transition-all duration-300 outline-none focus:outline-none',
              // Icon spacing
              icon ? 'pl-11' : 'pl-4',
              // Border colors
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : hasSuccess
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
              // Disabled state
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              // Shake animation for errors
              hasError && 'animate-pulse',
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          <motion.label
            className={cn(
              'absolute left-4 text-gray-500 pointer-events-none transition-all duration-300',
              icon && 'left-11',
              isFloated
                ? 'top-2 text-xs font-medium'
                : 'top-4 text-sm',
              hasError && 'text-red-500',
              hasSuccess && 'text-green-600',
              isFocused && !hasError && !hasSuccess && 'text-blue-600'
            )}
            animate={{
              y: isFloated ? -8 : 0,
              scale: isFloated ? 0.85 : 1,
              color: hasError ? '#ef4444' : hasSuccess ? '#059669' : isFocused ? '#2563eb' : '#6b7280'
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {label}
            {props.required && (
              <motion.span
                className="text-red-500 ml-1"
                animate={{ scale: isFloated ? 1 : 0.9 }}
                transition={{ duration: 0.2 }}
              >
                *
              </motion.span>
            )}
          </motion.label>

          {/* Icon */}
          {icon && (
            <motion.div
              className={cn(
                'absolute left-3 top-4 text-gray-400 transition-colors duration-300',
                hasError && 'text-red-400',
                hasSuccess && 'text-green-500',
                isFocused && !hasError && !hasSuccess && 'text-blue-500'
              )}
              animate={{
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Success/Error Icons */}
          <AnimatePresence>
            {(hasError || hasSuccess) && (
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: 90 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute right-3 top-4"
              >
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus Ring Animation */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-lg pointer-events-none',
              hasError
                ? 'bg-red-100'
                : hasSuccess
                ? 'bg-green-100'
                : 'bg-blue-100'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isFocused ? 0.1 : 0,
              scale: isFocused ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 px-1"
            >
              <motion.p
                className={cn(
                  'text-xs',
                  hasError ? 'text-red-500' : 'text-gray-500'
                )}
                animate={hasError ? {
                  x: [0, -2, 2, -2, 0],
                } : {}}
                transition={{ duration: 0.4 }}
              >
                {error || helperText}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

/**
 * Floating Textarea Component
 *
 * Extended textarea with floating label functionality.
 */
interface FloatingTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({
    label,
    error,
    success,
    helperText,
    className,
    disabled,
    value,
    rows = 4,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value !== '');
      props.onChange?.(e);
    };

    const isFloated = isFocused || hasValue;
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className="relative">
        <div className="relative">
          {/* Textarea Field */}
          <textarea
            ref={ref}
            rows={rows}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'peer w-full px-4 pb-2 pt-6 text-sm bg-white border rounded-lg transition-all duration-300 outline-none focus:outline-none resize-none',
              // Border colors
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : hasSuccess
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
              // Disabled state
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          <motion.label
            className={cn(
              'absolute left-4 text-gray-500 pointer-events-none transition-all duration-300',
              isFloated
                ? 'top-2 text-xs font-medium'
                : 'top-4 text-sm',
              hasError && 'text-red-500',
              hasSuccess && 'text-green-600',
              isFocused && !hasError && !hasSuccess && 'text-blue-600'
            )}
            animate={{
              y: isFloated ? -8 : 0,
              scale: isFloated ? 0.85 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </motion.label>

          {/* Success/Error Icons */}
          <AnimatePresence>
            {(hasError || hasSuccess) && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute right-3 top-4"
              >
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 px-1"
            >
              <motion.p
                className={cn(
                  'text-xs',
                  hasError ? 'text-red-500' : 'text-gray-500'
                )}
                animate={hasError ? {
                  x: [0, -2, 2, -2, 0],
                } : {}}
                transition={{ duration: 0.4 }}
              >
                {error || helperText}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';