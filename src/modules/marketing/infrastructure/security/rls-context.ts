/**
 * Row Level Security (RLS) Context Helper
 *
 * Provides utilities for managing Row Level Security in Supabase operations.
 * Handles authentication context, policy enforcement, and secure data access.
 *
 * Features:
 * - Authentication context management
 * - Policy-aware repository operations
 * - Secure multi-tenant data access
 * - Role-based access control helpers
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';

export interface RLSContext {
  user: User | null;
  isAuthenticated: boolean;
  userId: string | null;
  role: UserRole;
  organizationId?: string;
}

export type UserRole = 'anonymous' | 'authenticated' | 'admin' | 'system';

export interface SecureRepositoryOptions {
  supabase: SupabaseClient<Database>;
  context?: RLSContext;
  enforceRLS?: boolean;
}

/**
 * Get the current RLS context from a Supabase client
 */
export async function getRLSContext(
  supabase: SupabaseClient<Database>
): Promise<RLSContext> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('Error getting user for RLS context:', error);
      return createAnonymousContext();
    }

    if (!user) {
      return createAnonymousContext();
    }

    // Determine user role based on user metadata or claims
    const role = determineUserRole(user);

    // Get organization context if applicable
    const organizationId = user.user_metadata?.organization_id
      || user.app_metadata?.organization_id;

    return {
      user,
      isAuthenticated: true,
      userId: user.id,
      role,
      organizationId,
    };
  } catch (error) {
    console.error('Unexpected error getting RLS context:', error);
    return createAnonymousContext();
  }
}

/**
 * Create an anonymous RLS context
 */
function createAnonymousContext(): RLSContext {
  return {
    user: null,
    isAuthenticated: false,
    userId: null,
    role: 'anonymous',
  };
}

/**
 * Determine user role from user object
 */
function determineUserRole(user: User): UserRole {
  // Check for admin role in metadata
  if (user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin') {
    return 'admin';
  }

  // Check for system role (for service account operations)
  if (user.app_metadata?.role === 'system' || user.user_metadata?.role === 'system') {
    return 'system';
  }

  // Default to authenticated user
  return 'authenticated';
}

/**
 * Enhanced Supabase client with RLS context
 */
export class SecureSupabaseClient {
  private supabase: SupabaseClient<Database>;
  private context: RLSContext;
  private enforceRLS: boolean;

  constructor(options: SecureRepositoryOptions) {
    this.supabase = options.supabase;
    this.context = options.context || createAnonymousContext();
    this.enforceRLS = options.enforceRLS ?? true;
  }

  /**
   * Get the underlying Supabase client
   */
  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  /**
   * Get the current RLS context
   */
  getContext(): RLSContext {
    return this.context;
  }

  /**
   * Update the RLS context
   */
  async updateContext(): Promise<RLSContext> {
    this.context = await getRLSContext(this.supabase);
    return this.context;
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.context.role === role;
  }

  /**
   * Check if the current user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.context.role);
  }

  /**
   * Require authentication for an operation
   */
  requireAuth(): void {
    if (!this.context.isAuthenticated) {
      throw new RLSSecurityError('Authentication required for this operation');
    }
  }

  /**
   * Require a specific role for an operation
   */
  requireRole(role: UserRole): void {
    this.requireAuth();
    if (!this.hasRole(role)) {
      throw new RLSSecurityError(`Role '${role}' required for this operation`);
    }
  }

  /**
   * Require any of the specified roles for an operation
   */
  requireAnyRole(roles: UserRole[]): void {
    this.requireAuth();
    if (!this.hasAnyRole(roles)) {
      throw new RLSSecurityError(`One of roles [${roles.join(', ')}] required for this operation`);
    }
  }

  /**
   * Create a query builder with automatic RLS context
   */
  from<T extends keyof Database['public']['Tables']>(table: T) {
    const query = this.supabase.from(table);

    // Add RLS context headers if authentication is available
    if (this.context.isAuthenticated && this.context.userId) {
      // Note: In practice, RLS is handled automatically by Supabase
      // These headers can be used by custom policies if needed
      return query;
    }

    return query;
  }

  /**
   * Execute operation with elevated privileges (admin/system only)
   */
  async withElevatedPrivileges<T>(
    operation: () => Promise<T>,
    requiredRole: UserRole = 'admin'
  ): Promise<T> {
    this.requireRole(requiredRole);

    // In a real implementation, you might switch to a service role client
    // For now, we just verify the role and proceed
    return await operation();
  }
}

/**
 * Security error for RLS violations
 */
export class RLSSecurityError extends Error {
  constructor(message: string, public readonly code: string = 'RLS_SECURITY_ERROR') {
    super(message);
    this.name = 'RLSSecurityError';
  }
}

/**
 * Create a secure repository client with RLS context
 */
export async function createSecureSupabaseClient(
  supabase: SupabaseClient<Database>,
  options: Partial<SecureRepositoryOptions> = {}
): Promise<SecureSupabaseClient> {
  const context = options.context || await getRLSContext(supabase);

  return new SecureSupabaseClient({
    supabase,
    context,
    enforceRLS: options.enforceRLS ?? true,
  });
}

/**
 * Utility functions for common RLS patterns
 */
export const RLSUtils = {
  /**
   * Check if user can access organization data
   */
  canAccessOrganization(context: RLSContext, organizationId: string): boolean {
    // System and admin roles can access any organization
    if (context.role === 'system' || context.role === 'admin') {
      return true;
    }

    // User must be authenticated and belong to the organization
    return context.isAuthenticated && context.organizationId === organizationId;
  },

  /**
   * Check if user can perform write operations
   */
  canWrite(context: RLSContext): boolean {
    return context.isAuthenticated && context.hasAnyRole(['authenticated', 'admin', 'system']);
  },

  /**
   * Check if user can perform admin operations
   */
  canAdmin(context: RLSContext): boolean {
    return context.hasAnyRole(['admin', 'system']);
  },

  /**
   * Get user filter for queries (for manual filtering if needed)
   */
  getUserFilter(context: RLSContext): Record<string, any> | null {
    if (!context.isAuthenticated) {
      return null;
    }

    // Return user-specific filters
    const filters: Record<string, any> = {};

    if (context.userId) {
      filters.user_id = context.userId;
    }

    if (context.organizationId) {
      filters.organization_id = context.organizationId;
    }

    return Object.keys(filters).length > 0 ? filters : null;
  }
};