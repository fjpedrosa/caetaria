/**
 * Loading State Components for RTK Query
 *
 * Reusable loading components, skeleton screens, and loading state utilities
 * optimized for RTK Query operations.
 *
 * Features:
 * - Skeleton screens for different content types
 * - Loading spinners and progress indicators
 * - Optimistic loading states
 * - Error state fallbacks
 * - Customizable loading patterns
 * - Accessibility-compliant loading states
 */

import React, { type ReactNode } from 'react';

// Base loading component props
interface LoadingComponentProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'pulse' | 'skeleton';
  children?: ReactNode;
}

// Skeleton component props
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

/**
 * Base Skeleton Component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animated = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = animated ? 'animate-pulse' : '';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses} ${roundedClasses} ${className}`}
      style={style}
      aria-label="Loading content..."
      role="status"
    />
  );
};

/**
 * Loading Spinner Component
 */
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Lead Card Skeleton
 */
export const LeadCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="40%" height="1rem" />
        </div>
        <Skeleton width="4rem" height="1.5rem" rounded />
      </div>

      <div className="space-y-2">
        <Skeleton width="80%" height="0.875rem" />
        <Skeleton width="50%" height="0.875rem" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton width="6rem" height="0.75rem" />
        <Skeleton width="5rem" height="2rem" rounded />
      </div>
    </div>
  );
};

/**
 * Lead List Skeleton
 */
export const LeadListSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <LeadCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Dashboard Metrics Skeleton
 */
export const DashboardMetricsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton width="3rem" height="3rem" rounded />
            </div>
            <div className="text-right space-y-2">
              <Skeleton width="4rem" height="2rem" />
              <Skeleton width="6rem" height="1rem" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Analytics Chart Skeleton
 */
export const ChartSkeleton: React.FC<{
  height?: string | number;
  className?: string;
}> = ({ height = '300px', className = '' }) => {
  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="8rem" height="1.5rem" />
          <Skeleton width="6rem" height="2rem" rounded />
        </div>

        <div className="space-y-2">
          <Skeleton width="100%" height={chartHeight} />
        </div>

        <div className="flex items-center justify-center space-x-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton width="0.75rem" height="0.75rem" rounded />
              <Skeleton width="4rem" height="0.875rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Form Skeleton
 */
export const FormSkeleton: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="25%" height="1rem" />
          <Skeleton width="100%" height="2.5rem" />
        </div>
      ))}

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Skeleton width="5rem" height="2.5rem" rounded />
        <Skeleton width="6rem" height="2.5rem" rounded />
      </div>
    </div>
  );
};

/**
 * Table Skeleton
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className={index === 0 ? 'flex-1' : 'w-24'}>
              <Skeleton width="70%" height="1rem" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <div key={colIndex} className={colIndex === 0 ? 'flex-1' : 'w-24'}>
                  <Skeleton width={colIndex === 0 ? '90%' : '100%'} height="1rem" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ progress, className = '', showText = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`space-y-2 ${className}`}>
      {showText && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="bg-blue-600 transition-all duration-300 ease-out h-full"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

/**
 * Loading State Wrapper Component
 */
interface LoadingStateWrapperProps {
  isLoading: boolean;
  error?: any;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  isEmpty?: boolean;
  children: ReactNode;
  className?: string;
}

export const LoadingStateWrapper: React.FC<LoadingStateWrapperProps> = ({
  isLoading,
  error,
  loadingComponent,
  errorComponent,
  emptyComponent,
  isEmpty = false,
  children,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-gray-500">
              {typeof error === 'object' && error.message
                ? error.message
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent || (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
            <p className="text-gray-500">There's no data to display at the moment.</p>
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

/**
 * Optimistic Loading State for mutations
 */
export const OptimisticLoadingIndicator: React.FC<{
  isVisible: boolean;
  message?: string;
  className?: string;
}> = ({ isVisible, message = 'Saving...', className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${className}`}>
      <LoadingSpinner size="sm" className="border-white border-t-transparent" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

/**
 * Onboarding Step Skeleton
 */
export const OnboardingStepSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`max-w-2xl mx-auto space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton width="60%" height="2rem" className="mx-auto" />
        <Skeleton width="80%" height="1rem" className="mx-auto" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Skeleton width="25%" height="0.875rem" />
        <Skeleton width="100%" height="0.5rem" rounded />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
};

/**
 * RTK Query Loading States Hook
 * Provides standardized loading states for RTK Query operations
 */
export const useRTKQueryLoadingStates = (
  queryResult: {
    isLoading?: boolean;
    isFetching?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    error?: any;
    data?: any;
  }
) => {
  const { isLoading, isFetching, isSuccess, isError, error, data } = queryResult;

  return {
    isInitialLoading: isLoading && !data,
    isRefreshing: isFetching && !!data,
    isSuccess,
    isError,
    error,
    isEmpty: isSuccess && (!data || (Array.isArray(data) && data.length === 0)),
    hasData: isSuccess && !!data && (!Array.isArray(data) || data.length > 0),
  };
};