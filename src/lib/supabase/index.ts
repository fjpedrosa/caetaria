/**
 * Supabase Integration Index
 *
 * Central export file for all Supabase-related utilities and clients.
 * Provides convenient imports and standardized client initialization.
 *
 * Usage:
 * ```ts
 * // Browser client
 * import { supabase } from '@/lib/supabase';
 *
 * // Server client
 * import { createClient } from '@/lib/supabase';
 *
 * // Repository factory
 * import { createSupabaseLeadRepository } from '@/lib/supabase';
 * ```
 */

// Re-export all client utilities
export {
  authHelpers,
  getSafeSupabaseClient,
  isBrowser,
  supabase,
  type SupabaseClient,
} from './client';
export {
  authCallback,
  middlewareConfig,
  protectedRoutes,
  updateSession,
} from './middleware';
export {
  type AdminSupabaseClient,
  createAdminClient,
  createClient,
  serverAuthHelpers,
  type ServerSupabaseClient,
} from './server';

// Re-export types for easy access
export type {
  AnalyticsEvent,
  AnalyticsEventInsert,
  AuthSession,
  AuthUser,
  BotConfiguration,
  BotStatus,
  CreateLeadForm,
  Database,
  IntegrationStatus,
  Lead,
  LeadInsert,
  LeadSource,
  LeadStatus,
  LeadUpdate,
  UpdateLeadForm,
  UserProfile,
  WhatsAppIntegration,
} from './types';

// Repository factories
export { createSupabaseLeadRepository } from '../../modules/marketing/infra/adapters/supabase-lead-repository';

// React hooks for client-side usage
export {
  useAuth,
  useSupabaseDelete,
  useSupabaseInsert,
  useSupabaseQuery,
  useSupabaseSubscription,
  useSupabaseUpdate,
} from './hooks';

/**
 * Common Supabase utilities for error handling and data validation
 */
export const supabaseUtils = {
  /**
   * Check if error is a "not found" error
   */
  isNotFound: (error: any): boolean => {
    return error?.code === 'PGRST116';
  },

  /**
   * Check if error is a unique constraint violation
   */
  isUniqueViolation: (error: any): boolean => {
    return error?.code === '23505';
  },

  /**
   * Check if error is a foreign key constraint violation
   */
  isForeignKeyViolation: (error: any): boolean => {
    return error?.code === '23503';
  },

  /**
   * Format Supabase error for user display
   */
  formatError: (error: any): string => {
    if (supabaseUtils.isNotFound(error)) {
      return 'Resource not found';
    }

    if (supabaseUtils.isUniqueViolation(error)) {
      return 'This item already exists';
    }

    if (supabaseUtils.isForeignKeyViolation(error)) {
      return 'Cannot perform this action due to existing dependencies';
    }

    return error?.message || 'An unexpected error occurred';
  },

  /**
   * Retry logic for transient errors
   */
  withRetry: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            throw error;
          }
        }

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
};

/**
 * Development utilities for testing and debugging
 */
export const devUtils = {
  /**
   * Test database connection
   */
  testConnection: async () => {
    try {
      const { createClient } = await import('./server');
      const supabase = await createClient();

      // Simple query to test connection
      const { data, error } = await supabase
        .from('leads')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }

      console.log('Database connection test passed. Lead count:', data);
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  },

  /**
   * Check environment configuration
   */
  checkConfig: () => {
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    const missing = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.warn('Missing Supabase configuration:', missing);
      return false;
    }

    console.log('Supabase configuration looks good ✅');
    return true;
  }
};

/**
 * Constants for common database operations
 */
export const SUPABASE_CONSTANTS = {
  // Table names
  TABLES: {
    LEADS: 'leads',
    ANALYTICS_EVENTS: 'analytics_events',
    USER_PROFILES: 'user_profiles',
    WHATSAPP_INTEGRATIONS: 'whatsapp_integrations',
    BOT_CONFIGURATIONS: 'bot_configurations',
  },

  // Common error codes
  ERROR_CODES: {
    NOT_FOUND: 'PGRST116',
    UNIQUE_VIOLATION: '23505',
    FOREIGN_KEY_VIOLATION: '23503',
    PERMISSION_DENIED: '42501',
  },

  // Auth constants
  AUTH: {
    STORAGE_KEY: 'caetaria-auth-token',
    COOKIE_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
  },
} as const;