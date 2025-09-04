/**
 * Supabase Lead Repository Adapter
 * Infrastructure layer - Supabase implementation of LeadRepository
 *
 * Features:
 * - Complete CRUD operations with proper error handling
 * - Pagination support for efficient data retrieval
 * - Row Level Security (RLS) integration
 * - Performance optimization with selective queries
 * - Comprehensive logging and error tracking
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database, LeadInsert, LeadUpdate } from '@/lib/supabase/types';

import { Lead, LeadId, LeadSource,LeadStatus } from '../../domain/entities/lead';
import { LeadFilters, LeadRepository, LeadSortField, PaginatedLeadResult, SortOrder } from '../../domain/repositories/lead-repository';
import { Email } from '../../domain/value-objects/email';
import { PhoneNumber } from '../../domain/value-objects/phone-number';

// Enhanced pagination interface
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

// Sort options for queries
export interface SortOptions {
  field: LeadSortField;
  order: SortOrder;
}

// Repository error types
export class LeadRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'LeadRepositoryError';
  }
}

export class LeadNotFoundError extends LeadRepositoryError {
  constructor(id: LeadId) {
    super(`Lead with ID ${id} not found`, 'LEAD_NOT_FOUND');
  }
}

export class DuplicateLeadError extends LeadRepositoryError {
  constructor(email: Email) {
    super(`Lead with email ${email} already exists`, 'DUPLICATE_LEAD');
  }
}

// Use the generated database types
type LeadRow = Database['public']['Tables']['leads']['Row'];

// Helper functions for data mapping
const leadMapper = {
  toRow: (lead: Lead): LeadInsert => ({
    id: lead.id,
    email: lead.email,
    phone_number: lead.phoneNumber,
    company_name: lead.companyName,
    first_name: lead.firstName,
    last_name: lead.lastName,
    source: lead.source,
    status: lead.status,
    created_at: lead.createdAt.toISOString(),
    updated_at: lead.updatedAt.toISOString(),
    notes: lead.notes,
    interested_features: lead.interestedFeatures,
  }),

  toDomain: (row: LeadRow): Lead => ({
    id: row.id as LeadId,
    email: row.email as Email,
    phoneNumber: row.phone_number as any, // Type would be validated when loading
    companyName: row.company_name,
    firstName: row.first_name,
    lastName: row.last_name,
    source: row.source as any,
    status: row.status as any,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    notes: row.notes,
    interestedFeatures: row.interested_features || [],
  })
};

/**
 * Factory function for creating Supabase implementation of LeadRepository
 * Handles the mapping between domain entities and database rows
 */
export const createSupabaseLeadRepository = (dependencies: {
  supabase: SupabaseClient<Database>
}): LeadRepository => ({
  async save(lead: Lead): Promise<Lead> {
    try {
      const row = leadMapper.toRow(lead);

      const { data, error } = await dependencies.supabase
        .from('leads')
        .upsert(row, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new DuplicateLeadError(lead.email);
        }
        throw new LeadRepositoryError(
          'Failed to save lead',
          'SAVE_ERROR',
          error
        );
      }

      if (!data) {
        throw new LeadRepositoryError(
          'No data returned from save operation',
          'NO_DATA_RETURNED'
        );
      }

      return leadMapper.toDomain(data);
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error saving lead',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async update(id: LeadId, updates: Partial<Lead>): Promise<Lead> {
    try {
      // Convert domain updates to database format
      const updateData: Partial<LeadUpdate> = {};

      if (updates.email) updateData.email = updates.email;
      if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
      if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.source) updateData.source = updates.source;
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.interestedFeatures !== undefined) updateData.interested_features = updates.interestedFeatures;

      // Always update the timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await dependencies.supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new LeadNotFoundError(id);
        }
        if (error.code === '23505') {
          throw new DuplicateLeadError(updates.email!);
        }
        throw new LeadRepositoryError(
          'Failed to update lead',
          'UPDATE_ERROR',
          error
        );
      }

      if (!data) {
        throw new LeadNotFoundError(id);
      }

      return leadMapper.toDomain(data);
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error updating lead',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async findById(id: LeadId): Promise<Lead | null> {
    try {
      const { data, error } = await dependencies.supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new LeadRepositoryError(
          'Failed to find lead by ID',
          'FIND_BY_ID_ERROR',
          error
        );
      }

      return data ? leadMapper.toDomain(data) : null;
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error finding lead by ID',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async findByEmail(email: Email): Promise<Lead | null> {
    try {
      const { data, error } = await dependencies.supabase
        .from('leads')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new LeadRepositoryError(
          'Failed to find lead by email',
          'FIND_BY_EMAIL_ERROR',
          error
        );
      }

      return data ? leadMapper.toDomain(data) : null;
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error finding lead by email',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async findMany(
    filters?: LeadFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedLeadResult> {
    try {
      let query = dependencies.supabase
        .from('leads')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.createdAfter) {
        query = query.gte('created_at', filters.createdAfter.toISOString());
      }

      if (filters?.createdBefore) {
        query = query.lte('created_at', filters.createdBefore.toISOString());
      }

      if (filters?.searchTerm) {
        query = query.or(`email.ilike.%${filters.searchTerm}%,first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
      }

      // Apply sorting
      if (sort) {
        const dbField = mapSortFieldToDb(sort.field);
        query = query.order(dbField, { ascending: sort.order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        const { limit = 10, offset = 0 } = pagination;
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new LeadRepositoryError(
          'Failed to find leads',
          'FIND_MANY_ERROR',
          error
        );
      }

      const leads = (data || []).map((row: LeadRow) => leadMapper.toDomain(row));

      return {
        data: leads,
        total: count || 0,
        pagination: pagination ? {
          limit: pagination.limit || 10,
          offset: pagination.offset || 0,
          hasMore: (count || 0) > (pagination.offset || 0) + (pagination.limit || 10)
        } : undefined
      };
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error finding leads',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async exists(email: Email): Promise<boolean> {
    try {
      const { data, error } = await dependencies.supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false;
        }
        throw new LeadRepositoryError(
          'Failed to check lead existence',
          'EXISTS_ERROR',
          error
        );
      }

      return Boolean(data);
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error checking lead existence',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async delete(id: LeadId): Promise<boolean> {
    try {
      const { data, error } = await dependencies.supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) {
        throw new LeadRepositoryError(
          'Failed to delete lead',
          'DELETE_ERROR',
          error
        );
      }

      // Return true if a row was deleted
      return Array.isArray(data) && data.length > 0;
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error deleting lead',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async count(filters?: LeadFilters): Promise<number> {
    try {
      let query = dependencies.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Apply same filters as findMany
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.createdAfter) {
        query = query.gte('created_at', filters.createdAfter.toISOString());
      }

      if (filters?.createdBefore) {
        query = query.lte('created_at', filters.createdBefore.toISOString());
      }

      if (filters?.searchTerm) {
        query = query.or(`email.ilike.%${filters.searchTerm}%,first_name.ilike.%${filters.searchTerm}%,last_name.ilike.%${filters.searchTerm}%,company_name.ilike.%${filters.searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        throw new LeadRepositoryError(
          'Failed to count leads',
          'COUNT_ERROR',
          error
        );
      }

      return count || 0;
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error counting leads',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  async batchUpdate(updates: { id: LeadId; changes: Partial<Lead> }[]): Promise<Lead[]> {
    try {
      const updatedLeads: Lead[] = [];

      // Process updates in parallel but with controlled concurrency
      const batchSize = 5;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(({ id, changes }) =>
          this.update(id, changes)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            updatedLeads.push(result.value);
          } else {
            // Log failed updates but don't fail the entire operation
            console.error(`Failed to update lead ${batch[index].id}:`, result.reason);
          }
        });
      }

      return updatedLeads;
    } catch (error) {
      throw new LeadRepositoryError(
        'Failed to perform batch update',
        'BATCH_UPDATE_ERROR',
        error
      );
    }
  },

  async getLeadsByStatusCount(): Promise<Record<LeadStatus, number>> {
    try {
      const { data, error } = await dependencies.supabase
        .from('leads')
        .select('status')
        .then(result => {
          if (result.error) throw result.error;

          // Count leads by status
          const counts = result.data.reduce((acc: Record<string, number>, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
          }, {});

          return { data: counts, error: null };
        });

      if (error) {
        throw new LeadRepositoryError(
          'Failed to get leads by status count',
          'STATUS_COUNT_ERROR',
          error
        );
      }

      // Ensure all statuses are represented
      const statusCounts: Record<LeadStatus, number> = {
        'new': 0,
        'contacted': 0,
        'qualified': 0,
        'converted': 0,
        'lost': 0,
        ...data
      };

      return statusCounts;
    } catch (error) {
      if (error instanceof LeadRepositoryError) {
        throw error;
      }
      throw new LeadRepositoryError(
        'Unexpected error getting status counts',
        'UNEXPECTED_ERROR',
        error
      );
    }
  }
});

// Helper method to map sort fields to database columns
function mapSortFieldToDb(field: LeadSortField): string {
  const fieldMap: Record<LeadSortField, string> = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'email': 'email',
    'firstName': 'first_name',
    'lastName': 'last_name',
    'companyName': 'company_name',
    'status': 'status',
    'source': 'source'
  };
  return fieldMap[field] || 'created_at';
}

// Export types at the end to avoid conflicts
export type { PaginationOptions, SortOptions };