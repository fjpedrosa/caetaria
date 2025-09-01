/**
 * Supabase Base Query for RTK Query
 *
 * Custom base query that integrates RTK Query with Supabase client.
 * Handles authentication, error handling, and provides a unified interface
 * for all database operations.
 *
 * Features:
 * - Automatic authentication handling
 * - Consistent error formatting
 * - Retry logic for transient failures
 * - Type safety with Supabase types
 * - Real-time subscription support
 */

import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// Types for our custom base query
export interface SupabaseQueryArgs {
  table: keyof Database['public']['Tables'];
  method: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  query?: (queryBuilder: any) => any;
  body?: any;
  options?: {
    count?: 'exact' | 'planned' | 'estimated';
    upsertOptions?: { onConflict?: string };
    returnData?: boolean;
  };
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
  status: number;
}

export interface SupabaseQueryResult<T = any> {
  data?: T;
  error?: SupabaseError;
  count?: number;
}

// Custom error formatter
const formatSupabaseError = (error: PostgrestError | Error): SupabaseError => {
  if ('code' in error && error.code) {
    // PostgrestError
    return {
      message: error.message,
      details: error.details || undefined,
      hint: error.hint || undefined,
      code: error.code,
      status: 400,
    };
  }

  // Generic Error
  return {
    message: error.message || 'An unknown error occurred',
    status: 500,
  };
};

// Retry configuration
const shouldRetry = (error: SupabaseError): boolean => {
  // Retry on 5xx errors or network issues
  return error.status >= 500 || error.message.includes('network');
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Supabase Base Query Function
 *
 * Integrates Supabase with RTK Query, providing:
 * - Type-safe database operations
 * - Automatic error handling
 * - Retry logic for transient failures
 * - Consistent response format
 */
export const supabaseBaseQuery: BaseQueryFn<
  SupabaseQueryArgs,
  unknown,
  SupabaseError
> = async (args, { signal }, extraOptions) => {
  const { table, method, query, body, options = {} } = args;

  try {
    let queryBuilder = supabase.from(table as any);

    // Apply the query function if provided
    if (query) {
      queryBuilder = query(queryBuilder);
    }

    // Execute the appropriate method
    let response: PostgrestResponse<any>;

    switch (method) {
      case 'select':
        response = await queryBuilder;
        break;

      case 'insert':
        const insertQuery = queryBuilder.insert(body);
        if (options.returnData !== false) {
          insertQuery.select();
        }
        response = await insertQuery;
        break;

      case 'update':
        const updateQuery = queryBuilder.update(body);
        if (options.returnData !== false) {
          updateQuery.select();
        }
        response = await updateQuery;
        break;

      case 'upsert':
        const upsertQuery = queryBuilder.upsert(body, options.upsertOptions);
        if (options.returnData !== false) {
          upsertQuery.select();
        }
        response = await upsertQuery;
        break;

      case 'delete':
        const deleteQuery = queryBuilder.delete();
        if (options.returnData !== false) {
          deleteQuery.select();
        }
        response = await deleteQuery;
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Check for errors
    if (response.error) {
      const formattedError = formatSupabaseError(response.error);

      // Implement retry logic for retryable errors
      if (shouldRetry(formattedError) && !extraOptions?.skipRetry) {
        // Wait before retry
        await delay(1000);

        // Recursive call with skipRetry flag
        return await supabaseBaseQuery(
          args,
          { signal },
          { ...extraOptions, skipRetry: true }
        );
      }

      return { error: formattedError };
    }

    // Return successful result
    const result: SupabaseQueryResult = {
      data: response.data,
    };

    // Add count if requested
    if (options.count && response.count !== null) {
      result.count = response.count;
    }

    return { data: result };

  } catch (error) {
    const formattedError = formatSupabaseError(error as Error);
    return { error: formattedError };
  }
};

/**
 * Enhanced base query with additional features
 */
export const enhancedSupabaseBaseQuery: BaseQueryFn<
  SupabaseQueryArgs | string,
  unknown,
  SupabaseError
> = async (args, api, extraOptions) => {
  // Handle string args for custom queries
  if (typeof args === 'string') {
    try {
      // This could be used for custom SQL queries or RPC calls
      // For now, we'll throw an error as this should be handled by specific endpoints
      throw new Error(`Custom query strings not implemented: ${args}`);
    } catch (error) {
      return { error: formatSupabaseError(error as Error) };
    }
  }

  // Use the standard Supabase base query for object args
  return await supabaseBaseQuery(args, api, extraOptions);
};

/**
 * Real-time subscription utilities
 */
export const createRealtimeSubscription = (
  table: keyof Database['public']['Tables'],
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: table as string,
        filter,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Batch operations utility
 */
export const createBatchOperation = async <T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> => {
  try {
    return await Promise.all(operations);
  } catch (error) {
    throw formatSupabaseError(error as Error);
  }
};