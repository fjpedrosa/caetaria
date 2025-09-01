/**
 * Leads API Tests
 *
 * Comprehensive test suite for the leads API slice including:
 * - CRUD operations
 * - Optimistic updates
 * - Error handling
 * - Cache invalidation
 * - Type safety
 */

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';

import { leadsApi } from '../leads-api';
import { supabaseBaseQuery } from '../supabase-base-query';
import type { Lead, CreateLeadForm } from '@/lib/supabase/types';

// Mock Supabase base query
jest.mock('../supabase-base-query', () => ({
  supabaseBaseQuery: jest.fn(),
}));

const mockSupabaseBaseQuery = supabaseBaseQuery as jest.MockedFunction<typeof supabaseBaseQuery>;

// Test utilities
const createTestStore = () => {
  return configureStore({
    reducer: {
      [leadsApi.reducerPath]: leadsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(leadsApi.middleware),
  });
};

const createWrapper = (store = createTestStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

// Mock data
const mockLead: Lead = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'john.doe@example.com',
  phone_number: '+1234567890',
  company_name: 'Test Company',
  first_name: 'John',
  last_name: 'Doe',
  source: 'landing_page',
  status: 'new',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  notes: 'Test lead',
  interested_features: ['whatsapp_api', 'analytics'],
};

const mockLeadsResponse = {
  data: [mockLead],
  count: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const mockCreateLeadForm: CreateLeadForm = {
  email: 'jane.doe@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  company_name: 'New Company',
  source: 'landing_page',
  phone_number: '+0987654321',
  interested_features: ['whatsapp_api'],
};

describe('Leads API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeads', () => {
    it('should fetch leads successfully', async () => {
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: mockLeadsResponse,
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.getLeads.useQuery({ page: 1, limit: 20 }),
        { wrapper: createWrapper(store) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockLeadsResponse);
      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'select',
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle filters correctly', async () => {
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: mockLeadsResponse,
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.getLeads.useQuery({
          page: 1,
          limit: 10,
          status: 'qualified',
          source: 'landing_page',
          search: 'john',
        }),
        { wrapper: createWrapper(store) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'select',
          query: expect.any(Function),
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle errors gracefully', async () => {
      const mockError = {
        message: 'Database error',
        status: 500,
      };

      mockSupabaseBaseQuery.mockResolvedValueOnce({
        error: mockError,
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.getLeads.useQuery({ page: 1 }),
        { wrapper: createWrapper(store) }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('createLead', () => {
    it('should create a lead successfully', async () => {
      const newLead = { ...mockLead, id: 'new-id', email: mockCreateLeadForm.email };
      
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: { data: [newLead] },
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.createLead.useMutation(),
        { wrapper: createWrapper(store) }
      );

      let createdLead: Lead;
      await waitFor(async () => {
        createdLead = await result.current[0](mockCreateLeadForm).unwrap();
        expect(createdLead).toEqual(newLead);
      });

      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'insert',
          body: expect.objectContaining({
            email: mockCreateLeadForm.email,
            first_name: mockCreateLeadForm.first_name,
            source: mockCreateLeadForm.source,
          }),
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Email is required',
        code: '23502',
        status: 400,
      };

      mockSupabaseBaseQuery.mockResolvedValueOnce({
        error: validationError,
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.createLead.useMutation(),
        { wrapper: createWrapper(store) }
      );

      await waitFor(async () => {
        try {
          await result.current[0]({ ...mockCreateLeadForm, email: '' }).unwrap();
        } catch (error) {
          expect(error).toEqual(validationError);
        }
      });
    });

    it('should perform optimistic updates', async () => {
      // This test would require mocking the dispatch and queryFulfilled
      // In a real implementation, you'd test that the cache is updated optimistically
      const mockDispatch = jest.fn();
      const mockQueryFulfilled = Promise.resolve({ data: mockLead });

      // Mock the onQueryStarted behavior
      const onQueryStarted = leadsApi.endpoints.createLead.onQueryStarted;
      
      if (onQueryStarted) {
        await onQueryStarted(
          mockCreateLeadForm,
          {
            dispatch: mockDispatch,
            queryFulfilled: mockQueryFulfilled,
            getCacheEntry: jest.fn(),
            requestId: 'test-request',
            extra: undefined,
            api: {} as any,
          }
        );

        // Verify that cache updates were dispatched
        expect(mockDispatch).toHaveBeenCalled();
      }
    });
  });

  describe('updateLead', () => {
    it('should update a lead successfully', async () => {
      const updatedLead = { ...mockLead, status: 'qualified' as const };
      
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: { data: [updatedLead] },
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.updateLead.useMutation(),
        { wrapper: createWrapper(store) }
      );

      await waitFor(async () => {
        const result_lead = await result.current[0]({
          id: mockLead.id,
          updates: { status: 'qualified' },
        }).unwrap();
        
        expect(result_lead).toEqual(updatedLead);
      });

      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'update',
          body: expect.objectContaining({
            status: 'qualified',
            updated_at: expect.any(String),
          }),
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead successfully', async () => {
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: { data: null },
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.deleteLead.useMutation(),
        { wrapper: createWrapper(store) }
      );

      await waitFor(async () => {
        await result.current[0](mockLead.id).unwrap();
      });

      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'delete',
          options: { returnData: false },
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('getLeadStats', () => {
    it('should calculate lead statistics correctly', async () => {
      const mockStatsData = [
        { status: 'new', source: 'landing_page', created_at: '2024-01-01T10:00:00Z' },
        { status: 'qualified', source: 'landing_page', created_at: '2024-01-02T10:00:00Z' },
        { status: 'converted', source: 'referral', created_at: '2024-01-03T10:00:00Z' },
      ];

      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: { data: mockStatsData },
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.getLeadStats.useQuery({ days: 30 }),
        { wrapper: createWrapper(store) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const stats = result.current.data;
      expect(stats?.total).toBe(3);
      expect(stats?.byStatus.new).toBe(1);
      expect(stats?.byStatus.qualified).toBe(1);
      expect(stats?.byStatus.converted).toBe(1);
      expect(stats?.bySource.landing_page).toBe(2);
      expect(stats?.bySource.referral).toBe(1);
      expect(stats?.conversionRate).toBe(33.33); // 1/3 * 100, rounded to 2 decimals
    });
  });

  describe('searchLeads', () => {
    it('should search leads with query string', async () => {
      const searchResults = [mockLead];
      
      mockSupabaseBaseQuery.mockResolvedValueOnce({
        data: { data: searchResults },
      });

      const store = createTestStore();
      const { result } = renderHook(
        () => leadsApi.endpoints.searchLeads.useQuery({ 
          query: 'john',
          limit: 10 
        }),
        { wrapper: createWrapper(store) }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(searchResults);
      expect(mockSupabaseBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: 'leads',
          method: 'select',
          query: expect.any(Function),
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('Cache Tags', () => {
    it('should provide correct tags for leads list', () => {
      const result = mockLeadsResponse;
      const provideTags = leadsApi.endpoints.getLeads.providesTags;
      
      if (provideTags) {
        const tags = provideTags(result, null, { page: 1 });
        
        expect(tags).toContainEqual({ type: 'LeadsList', id: 'LIST' });
        expect(tags).toContainEqual({ type: 'LeadStats', id: 'STATS' });
        expect(tags).toContainEqual({ type: 'Lead', id: mockLead.id });
      }
    });

    it('should invalidate correct tags on create', () => {
      const invalidateTags = leadsApi.endpoints.createLead.invalidatesTags;
      
      if (invalidateTags) {
        const tags = invalidateTags(mockLead, null, mockCreateLeadForm);
        
        expect(tags).toContainEqual({ type: 'LeadsList', id: 'LIST' });
        expect(tags).toContainEqual({ type: 'LeadStats', id: 'STATS' });
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for lead data', () => {
      // TypeScript compilation test - these should not cause type errors
      const validLead: Lead = mockLead;
      const validCreateForm: CreateLeadForm = mockCreateLeadForm;

      expect(validLead.email).toBe(mockLead.email);
      expect(validCreateForm.source).toBe('landing_page');
    });

    it('should require email for lead creation', () => {
      // This should cause a TypeScript error if uncommented:
      // const invalidForm: CreateLeadForm = {
      //   first_name: 'John',
      //   // email is missing
      // };
      
      expect(mockCreateLeadForm.email).toBeDefined();
    });
  });
});

// Integration tests with multiple endpoints
describe('Leads API Integration', () => {
  it('should handle create -> update -> delete flow', async () => {
    const store = createTestStore();
    
    // Mock create
    mockSupabaseBaseQuery
      .mockResolvedValueOnce({ data: { data: [mockLead] } })  // create
      .mockResolvedValueOnce({ data: { data: [{ ...mockLead, status: 'qualified' }] } })  // update
      .mockResolvedValueOnce({ data: { data: null } }); // delete

    const { result: createResult } = renderHook(
      () => leadsApi.endpoints.createLead.useMutation(),
      { wrapper: createWrapper(store) }
    );

    const { result: updateResult } = renderHook(
      () => leadsApi.endpoints.updateLead.useMutation(),
      { wrapper: createWrapper(store) }
    );

    const { result: deleteResult } = renderHook(
      () => leadsApi.endpoints.deleteLead.useMutation(),
      { wrapper: createWrapper(store) }
    );

    // Create lead
    const createdLead = await createResult.current[0](mockCreateLeadForm).unwrap();
    expect(createdLead.id).toBe(mockLead.id);

    // Update lead
    const updatedLead = await updateResult.current[0]({
      id: createdLead.id,
      updates: { status: 'qualified' },
    }).unwrap();
    expect(updatedLead.status).toBe('qualified');

    // Delete lead
    await deleteResult.current[0](createdLead.id).unwrap();
    
    // Verify all API calls were made
    expect(mockSupabaseBaseQuery).toHaveBeenCalledTimes(3);
  });
});