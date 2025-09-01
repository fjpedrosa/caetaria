/**
 * Lead Management API Slice
 *
 * RTK Query API slice for managing leads with full CRUD operations,
 * optimistic updates, caching strategies, and real-time capabilities.
 *
 * Features:
 * - Complete CRUD operations (Create, Read, Update, Delete)
 * - Optimistic updates for better UX
 * - Intelligent caching with selective invalidation
 * - Pagination support
 * - Real-time updates via Supabase subscriptions
 * - Advanced filtering and searching
 * - Bulk operations
 */

import { createApi } from '@reduxjs/toolkit/query/react';

import type {
  CreateLeadForm,
  Lead,
  LeadInsert,
  LeadSource,
  LeadStatus,
  LeadUpdate,
  UpdateLeadForm,
} from '@/lib/supabase/types';

import { supabaseBaseQuery, type SupabaseQueryResult } from './supabase-base-query';

// Request/Response types
export interface LeadsListParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'email' | 'company_name';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadsListResponse {
  data: Lead[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadStatsResponse {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  recentCount: number;
  conversionRate: number;
}

// Optimistic update types
export interface OptimisticLeadUpdate {
  id: string;
  changes: Partial<Lead>;
  timestamp: number;
}

/**
 * Lead Management API Slice
 */
export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery: supabaseBaseQuery,
  tagTypes: ['Lead', 'LeadStats', 'LeadsList'],
  keepUnusedDataFor: 300, // 5 minutes
  refetchOnReconnect: true,
  refetchOnFocus: true,

  endpoints: (builder) => ({
    /**
     * Get paginated list of leads with filtering
     */
    getLeads: builder.query<LeadsListResponse, LeadsListParams>({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 20,
          status,
          source,
          search,
          sortBy = 'created_at',
          sortOrder = 'desc',
          dateFrom,
          dateTo,
        } = params;

        return {
          table: 'leads',
          method: 'select',
          query: (queryBuilder: any) => {
            let query = queryBuilder.select('*', { count: 'exact' });

            // Apply filters
            if (status) {
              query = query.eq('status', status);
            }
            if (source) {
              query = query.eq('source', source);
            }
            if (search) {
              query = query.or(
                `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%`
              );
            }
            if (dateFrom) {
              query = query.gte('created_at', dateFrom);
            }
            if (dateTo) {
              query = query.lte('created_at', dateTo);
            }

            // Apply sorting
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            const offset = (page - 1) * limit;
            return query.range(offset, offset + limit - 1);
          },
          options: { count: 'exact' },
        };
      },
      transformResponse: (response: SupabaseQueryResult<Lead[]>, meta, arg) => {
        const { page = 1, limit = 20 } = arg;
        const totalPages = Math.ceil((response.count || 0) / limit);

        return {
          data: response.data || [],
          count: response.count || 0,
          page,
          limit,
          totalPages,
        };
      },
      providesTags: (result, error, arg) => {
        const tags: any[] = [
          { type: 'LeadsList', id: 'LIST' },
          { type: 'LeadStats', id: 'STATS' },
        ];

        if (result?.data) {
          tags.push(
            ...result.data.map(({ id }) => ({ type: 'Lead' as const, id }))
          );
        }

        return tags;
      },
      // Cache for 2 minutes, refetch on stale
      keepUnusedDataFor: 120,
    }),

    /**
     * Get single lead by ID
     */
    getLead: builder.query<Lead, string>({
      query: (id) => ({
        table: 'leads',
        method: 'select',
        query: (queryBuilder: any) => queryBuilder.select('*').eq('id', id).single(),
      }),
      transformResponse: (response: SupabaseQueryResult<Lead>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),

    /**
     * Create new lead with optimistic update
     */
    createLead: builder.mutation<Lead, CreateLeadForm>({
      query: (leadData) => ({
        table: 'leads',
        method: 'insert',
        body: {
          ...leadData,
          status: leadData.status || 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
      transformResponse: (response: SupabaseQueryResult<Lead[]>) =>
        response.data?.[0] as Lead,
      invalidatesTags: [
        { type: 'LeadsList', id: 'LIST' },
        { type: 'LeadStats', id: 'STATS' },
      ],
      // Optimistic update
      onQueryStarted: async (leadData, { dispatch, queryFulfilled }) => {
        try {
          // Create optimistic lead with temporary ID
          const optimisticLead: Lead = {
            id: `temp-${Date.now()}`,
            email: leadData.email,
            phone_number: leadData.phone_number || null,
            company_name: leadData.company_name || null,
            first_name: leadData.first_name || null,
            last_name: leadData.last_name || null,
            source: leadData.source,
            status: (leadData.status || 'new') as LeadStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            notes: leadData.notes || null,
            interested_features: leadData.interested_features || null,
          };

          // Optimistically update the cache
          const patchResult = dispatch(
            leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
              draft.data.unshift(optimisticLead);
              draft.count += 1;
            })
          );

          try {
            await queryFulfilled;
          } catch {
            // Revert optimistic update on error
            patchResult.undo();
          }
        } catch (error) {
          console.error('Optimistic update failed:', error);
        }
      },
    }),

    /**
     * Update existing lead with optimistic update
     */
    updateLead: builder.mutation<Lead, { id: string; updates: UpdateLeadForm }>({
      query: ({ id, updates }) => ({
        table: 'leads',
        method: 'update',
        query: (queryBuilder: any) => queryBuilder.eq('id', id),
        body: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      }),
      transformResponse: (response: SupabaseQueryResult<Lead[]>) =>
        response.data?.[0] as Lead,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        { type: 'LeadsList', id: 'LIST' },
        { type: 'LeadStats', id: 'STATS' },
      ],
      // Optimistic update
      onQueryStarted: async ({ id, updates }, { dispatch, queryFulfilled }) => {
        try {
          // Optimistically update single lead cache
          const patchResult = dispatch(
            leadsApi.util.updateQueryData('getLead', id, (draft) => {
              Object.assign(draft, updates, { updated_at: new Date().toISOString() });
            })
          );

          // Optimistically update leads list cache
          const listPatchResult = dispatch(
            leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
              const index = draft.data.findIndex((lead) => lead.id === id);
              if (index !== -1) {
                Object.assign(draft.data[index], updates, {
                  updated_at: new Date().toISOString()
                });
              }
            })
          );

          try {
            await queryFulfilled;
          } catch {
            // Revert optimistic updates on error
            patchResult.undo();
            listPatchResult.undo();
          }
        } catch (error) {
          console.error('Optimistic update failed:', error);
        }
      },
    }),

    /**
     * Delete lead
     */
    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        table: 'leads',
        method: 'delete',
        query: (queryBuilder: any) => queryBuilder.eq('id', id),
        options: { returnData: false },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Lead', id },
        { type: 'LeadsList', id: 'LIST' },
        { type: 'LeadStats', id: 'STATS' },
      ],
      // Optimistic update
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          // Optimistically remove from lists
          const patchResult = dispatch(
            leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
              const index = draft.data.findIndex((lead) => lead.id === id);
              if (index !== -1) {
                draft.data.splice(index, 1);
                draft.count -= 1;
              }
            })
          );

          try {
            await queryFulfilled;
          } catch {
            // Revert optimistic update on error
            patchResult.undo();
          }
        } catch (error) {
          console.error('Optimistic delete failed:', error);
        }
      },
    }),

    /**
     * Get lead statistics
     */
    getLeadStats: builder.query<LeadStatsResponse, { days?: number }>({
      query: ({ days = 30 } = {}) => ({
        table: 'leads',
        method: 'select',
        query: (queryBuilder: any) => {
          const dateFrom = new Date();
          dateFrom.setDate(dateFrom.getDate() - days);

          return queryBuilder
            .select('status, source, created_at')
            .gte('created_at', dateFrom.toISOString());
        },
      }),
      transformResponse: (response: SupabaseQueryResult<Array<{
        status: LeadStatus;
        source: LeadSource;
        created_at: string;
      }>>) => {
        const leads = response.data || [];
        const total = leads.length;

        // Count by status
        const byStatus = leads.reduce((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {} as Record<LeadStatus, number>);

        // Count by source
        const bySource = leads.reduce((acc, lead) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {} as Record<LeadSource, number>);

        // Recent leads (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentCount = leads.filter(
          lead => new Date(lead.created_at) > weekAgo
        ).length;

        // Conversion rate (converted / total)
        const convertedCount = byStatus['converted'] || 0;
        const conversionRate = total > 0 ? (convertedCount / total) * 100 : 0;

        return {
          total,
          byStatus,
          bySource,
          recentCount,
          conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimals
        };
      },
      providesTags: [{ type: 'LeadStats', id: 'STATS' }],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    /**
     * Bulk update leads
     */
    bulkUpdateLeads: builder.mutation<Lead[], { ids: string[]; updates: UpdateLeadForm }>({
      queryFn: async ({ ids, updates }, { dispatch }) => {
        try {
          // Execute updates in batches to avoid overwhelming the database
          const batchSize = 10;
          const batches = [];

          for (let i = 0; i < ids.length; i += batchSize) {
            const batchIds = ids.slice(i, i + batchSize);
            batches.push(batchIds);
          }

          const results: Lead[] = [];

          for (const batchIds of batches) {
            const result = await dispatch(
              leadsApi.endpoints.updateLeads.initiate({
                ids: batchIds,
                updates,
              })
            ).unwrap();

            results.push(...(Array.isArray(result) ? result : [result]));
          }

          return { data: results };
        } catch (error) {
          return { error: { message: (error as Error).message, status: 500 } };
        }
      },
      invalidatesTags: [
        { type: 'LeadsList', id: 'LIST' },
        { type: 'LeadStats', id: 'STATS' },
      ],
    }),

    /**
     * Internal bulk update for batches
     */
    updateLeads: builder.mutation<Lead[], { ids: string[]; updates: UpdateLeadForm }>({
      query: ({ ids, updates }) => ({
        table: 'leads',
        method: 'update',
        query: (queryBuilder: any) => queryBuilder.in('id', ids),
        body: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      }),
      transformResponse: (response: SupabaseQueryResult<Lead[]>) => response.data || [],
    }),

    /**
     * Search leads with advanced filtering
     */
    searchLeads: builder.query<Lead[], { query: string; limit?: number }>({
      query: ({ query, limit = 10 }) => ({
        table: 'leads',
        method: 'select',
        query: (queryBuilder: any) =>
          queryBuilder
            .select('*')
            .or(
              `email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,company_name.ilike.%${query}%,notes.ilike.%${query}%`
            )
            .order('updated_at', { ascending: false })
            .limit(limit),
      }),
      transformResponse: (response: SupabaseQueryResult<Lead[]>) => response.data || [],
      providesTags: ['Lead'],
      // Don't cache search results for long
      keepUnusedDataFor: 60,
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadStatsQuery,
  useBulkUpdateLeadsMutation,
  useSearchLeadsQuery,
  useLazyGetLeadsQuery,
  useLazySearchLeadsQuery,
} = leadsApi;

// Export additional utilities
export const {
  util: {
    updateQueryData: updateLeadsQueryData,
    invalidateTags: invalidateLeadsTags,
    prefetch: prefetchLeads,
  },
} = leadsApi;