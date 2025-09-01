/**
 * Supabase Lead Repository Tests
 *
 * Tests for the Supabase implementation of the lead repository.
 * Demonstrates unit and integration testing patterns for database operations.
 */

import { createMockResponse, createTestSupabaseClient, TEST_CONFIG } from '../../../__mocks__/supabase/setup';
import { createLeadFactory } from '../../../__mocks__/test-data/factories';
import {
  monitorSupabaseQuery,
  PERFORMANCE_THRESHOLDS,
  performanceMonitor,
  setupPerformanceMonitoring
} from '../../../__mocks__/test-utils/performance-monitor';
import { SupabaseLeadRepository } from '../../infra/adapters/supabase-lead-repository';

// =============================================================================
// TEST SETUP
// =============================================================================

describe('SupabaseLeadRepository', () => {
  let repository: SupabaseLeadRepository;
  let mockClient: ReturnType<typeof createTestSupabaseClient>;

  // Setup performance monitoring for all tests
  setupPerformanceMonitoring();

  beforeEach(() => {
    mockClient = createTestSupabaseClient('unit');
    repository = new SupabaseLeadRepository(mockClient);
  });

  // =============================================================================
  // UNIT TESTS - With Full Mocking
  // =============================================================================

  describe('Unit Tests (Mocked Database)', () => {
    describe('createLead', () => {
      it('should create a lead successfully', async () => {
        const leadData = createLeadFactory();
        const expectedLead = { id: 'lead-123', ...leadData };

        // Mock the Supabase response
        const mockQuery = mockClient.from('marketing.leads').insert(leadData);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([expectedLead])
        );

        const result = await repository.createLead(leadData);

        expect(result).toEqual(expectedLead);
        expect(mockClient.from).toHaveBeenCalledWith('marketing.leads');
        expect(mockQuery.insert).toHaveBeenCalledWith(leadData);
      });

      it('should handle creation errors gracefully', async () => {
        const leadData = createLeadFactory();

        const mockQuery = mockClient.from('marketing.leads').insert(leadData);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.error('Email already exists', 'unique_violation')
        );

        await expect(repository.createLead(leadData)).rejects.toThrow('Email already exists');
      });

      it('should complete within performance threshold', async () => {
        const leadData = createLeadFactory();

        const mockQuery = mockClient.from('marketing.leads').insert(leadData);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([{ id: 'lead-123', ...leadData }])
        );

        const measurement = await performanceMonitor.measureAsync(
          'create_lead',
          () => repository.createLead(leadData)
        );

        expect(measurement).toCompleteWithinThreshold(PERFORMANCE_THRESHOLDS.INSERT_SINGLE);
      });
    });

    describe('findLeadById', () => {
      it('should find a lead by ID', async () => {
        const leadId = 'lead-123';
        const expectedLead = createLeadFactory();

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([expectedLead])
        );

        const result = await repository.findLeadById(leadId);

        expect(result).toEqual(expectedLead);
        expect(mockQuery.eq).toHaveBeenCalledWith('id', leadId);
      });

      it('should return null when lead not found', async () => {
        const leadId = 'nonexistent-lead';

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.empty()
        );

        const result = await repository.findLeadById(leadId);

        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        const leadId = 'lead-123';

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.error('Connection timeout', 'connection_error', 500)
        );

        await expect(repository.findLeadById(leadId)).rejects.toThrow('Connection timeout');
      });
    });

    describe('findLeadByEmail', () => {
      it('should find a lead by email (case insensitive)', async () => {
        const email = 'test@example.com';
        const expectedLead = createLeadFactory({ email: email.toLowerCase() });

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('email', email.toLowerCase());
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([expectedLead])
        );

        const result = await repository.findLeadByEmail(email.toUpperCase());

        expect(result).toEqual(expectedLead);
        expect(mockQuery.eq).toHaveBeenCalledWith('email', email.toLowerCase());
      });

      it('should return null for non-existent email', async () => {
        const email = 'nonexistent@example.com';

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('email', email);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.empty()
        );

        const result = await repository.findLeadByEmail(email);

        expect(result).toBeNull();
      });
    });

    describe('updateLeadStatus', () => {
      it('should update lead status', async () => {
        const leadId = 'lead-123';
        const newStatus = 'qualified';
        const updatedLead = createLeadFactory({ id: leadId, status: newStatus });

        const mockQuery = mockClient.from('marketing.leads').update({ status: newStatus }).eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([updatedLead])
        );

        const result = await repository.updateLeadStatus(leadId, newStatus);

        expect(result).toEqual(updatedLead);
        expect(mockQuery.update).toHaveBeenCalledWith({ status: newStatus });
        expect(mockQuery.eq).toHaveBeenCalledWith('id', leadId);
      });

      it('should handle update of non-existent lead', async () => {
        const leadId = 'nonexistent-lead';
        const newStatus = 'qualified';

        const mockQuery = mockClient.from('marketing.leads').update({ status: newStatus }).eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.empty()
        );

        const result = await repository.updateLeadStatus(leadId, newStatus);

        expect(result).toBeNull();
      });
    });

    describe('getLeadsBySource', () => {
      it('should return leads filtered by source', async () => {
        const source = 'website-form';
        const expectedLeads = [
          createLeadFactory({ source: 'website-form' }),
          createLeadFactory({ source: 'website-form' }),
        ];

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('source', source);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success(expectedLeads)
        );

        const result = await repository.getLeadsBySource(source);

        expect(result).toEqual(expectedLeads);
        expect(mockQuery.eq).toHaveBeenCalledWith('source', source);
      });

      it('should handle pagination', async () => {
        const source = 'demo-request';
        const page = 2;
        const limit = 10;
        const expectedLeads = [createLeadFactory({ source })];

        const mockQuery = mockClient.from('marketing.leads').select('*').eq('source', source).range(10, 19);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success(expectedLeads)
        );

        const result = await repository.getLeadsBySource(source, { page, limit });

        expect(result).toEqual(expectedLeads);
        expect(mockQuery.range).toHaveBeenCalledWith(10, 19);
      });
    });

    describe('getLeadMetrics', () => {
      it('should return lead metrics by status', async () => {
        const expectedMetrics = {
          new: 5,
          contacted: 3,
          qualified: 2,
          converted: 1,
          lost: 1,
        };

        // Mock RPC call for metrics
        (mockClient.rpc as jest.Mock).mockResolvedValue(
          createMockResponse.success([
            { status: 'new', count: 5 },
            { status: 'contacted', count: 3 },
            { status: 'qualified', count: 2 },
            { status: 'converted', count: 1 },
            { status: 'lost', count: 1 },
          ])
        );

        const result = await repository.getLeadMetrics();

        expect(result).toEqual(expectedMetrics);
        expect(mockClient.rpc).toHaveBeenCalledWith('get_lead_metrics');
      });

      it('should handle metrics calculation errors', async () => {
        (mockClient.rpc as jest.Mock).mockResolvedValue(
          createMockResponse.error('Function not found', 'function_error')
        );

        await expect(repository.getLeadMetrics()).rejects.toThrow('Function not found');
      });
    });

    describe('deleteLead', () => {
      it('should soft delete a lead', async () => {
        const leadId = 'lead-123';

        const mockQuery = mockClient.from('marketing.leads').update({ deleted_at: expect.any(String) }).eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.success([{ id: leadId, deleted_at: new Date().toISOString() }])
        );

        const result = await repository.deleteLead(leadId);

        expect(result).toBe(true);
        expect(mockQuery.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
      });

      it('should return false for non-existent lead', async () => {
        const leadId = 'nonexistent-lead';

        const mockQuery = mockClient.from('marketing.leads').update({ deleted_at: expect.any(String) }).eq('id', leadId);
        mockQuery.then = jest.fn().mockResolvedValue(
          createMockResponse.empty()
        );

        const result = await repository.deleteLead(leadId);

        expect(result).toBe(false);
      });
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const leadId = 'lead-123';

      const mockQuery = mockClient.from('marketing.leads').select('*').eq('id', leadId);
      mockQuery.then = jest.fn().mockRejectedValue(new Error('Network timeout'));

      await expect(repository.findLeadById(leadId)).rejects.toThrow('Network timeout');
    });

    it('should handle malformed responses', async () => {
      const leadData = createLeadFactory();

      const mockQuery = mockClient.from('marketing.leads').insert(leadData);
      mockQuery.then = jest.fn().mockResolvedValue({
        data: null,
        error: null, // Malformed - should have either data or error
      });

      await expect(repository.createLead(leadData)).rejects.toThrow();
    });

    it('should validate input data', async () => {
      const invalidLeadData = {
        email: 'invalid-email', // Invalid email format
        phone_number: 'abc', // Invalid phone format
      };

      // Repository should validate before calling Supabase
      await expect(repository.createLead(invalidLeadData as any)).rejects.toThrow();
    });
  });

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  describe('Performance Tests', () => {
    it('should batch operations efficiently', async () => {
      const leadIds = ['lead-1', 'lead-2', 'lead-3'];
      const expectedLeads = leadIds.map(id => createLeadFactory({ id }));

      const mockQuery = mockClient.from('marketing.leads').select('*').in('id', leadIds);
      mockQuery.then = jest.fn().mockResolvedValue(
        createMockResponse.success(expectedLeads)
      );

      const measurement = await performanceMonitor.measureAsync(
        'batch_find_leads',
        () => repository.findLeadsByIds(leadIds)
      );

      expect(measurement).toCompleteWithinThreshold(PERFORMANCE_THRESHOLDS.SELECT_COMPLEX);
      expect(mockQuery.in).toHaveBeenCalledWith('id', leadIds);
    });

    it('should handle large result sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) =>
        createLeadFactory({ id: `lead-${i}` })
      );

      const mockQuery = mockClient.from('marketing.leads').select('*');
      mockQuery.then = jest.fn().mockResolvedValue(
        createMockResponse.success(largeDataSet)
      );

      const measurement = await performanceMonitor.measureAsync(
        'large_dataset_query',
        () => repository.getAllLeads()
      );

      // Should still complete reasonably fast even with large dataset
      expect(measurement).toCompleteWithinThreshold(PERFORMANCE_THRESHOLDS.SELECT_COMPLEX);
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty search results', async () => {
      const searchTerm = 'nonexistent';

      const mockQuery = mockClient.from('marketing.leads').select('*').ilike('company_name', `%${searchTerm}%`);
      mockQuery.then = jest.fn().mockResolvedValue(
        createMockResponse.empty()
      );

      const result = await repository.searchLeads(searchTerm);

      expect(result).toEqual([]);
    });

    it('should handle special characters in search', async () => {
      const searchTerm = 'O\'Connor & Sons';
      const expectedLeads = [createLeadFactory({ company_name: searchTerm })];

      const mockQuery = mockClient.from('marketing.leads').select('*').ilike('company_name', `%${searchTerm}%`);
      mockQuery.then = jest.fn().mockResolvedValue(
        createMockResponse.success(expectedLeads)
      );

      const result = await repository.searchLeads(searchTerm);

      expect(result).toEqual(expectedLeads);
      expect(mockQuery.ilike).toHaveBeenCalledWith('company_name', `%${searchTerm}%`);
    });

    it('should handle concurrent operations', async () => {
      const operations = [
        repository.findLeadById('lead-1'),
        repository.findLeadById('lead-2'),
        repository.findLeadById('lead-3'),
      ];

      // Mock different responses for each operation
      const mockQuery1 = mockClient.from('marketing.leads').select('*').eq('id', 'lead-1');
      const mockQuery2 = mockClient.from('marketing.leads').select('*').eq('id', 'lead-2');
      const mockQuery3 = mockClient.from('marketing.leads').select('*').eq('id', 'lead-3');

      mockQuery1.then = jest.fn().mockResolvedValue(
        createMockResponse.success([createLeadFactory({ id: 'lead-1' })])
      );
      mockQuery2.then = jest.fn().mockResolvedValue(
        createMockResponse.success([createLeadFactory({ id: 'lead-2' })])
      );
      mockQuery3.then = jest.fn().mockResolvedValue(
        createMockResponse.empty()
      );

      const results = await Promise.all(operations);

      expect(results[0]).toBeTruthy();
      expect(results[1]).toBeTruthy();
      expect(results[2]).toBeNull();
    });
  });
});

// =============================================================================
// INTEGRATION TESTS - Real Database (when TEST_LEVEL=integration)
// =============================================================================

if (TEST_CONFIG.TEST_LEVEL === 'integration') {
  describe('SupabaseLeadRepository Integration Tests', () => {
    let repository: SupabaseLeadRepository;
    let realClient: ReturnType<typeof createTestSupabaseClient>;

    beforeAll(async () => {
      realClient = createTestSupabaseClient('integration');
      repository = new SupabaseLeadRepository(realClient);

      // Verify database connection
      const { error } = await realClient.from('marketing.leads').select('id').limit(1);
      if (error) {
        throw new Error(`Integration test database not available: ${error.message}`);
      }
    });

    describe('Real Database Operations', () => {
      it('should perform full CRUD cycle', async () => {
        // Create
        const leadData = createLeadFactory();
        const createdLead = await monitorSupabaseQuery(
          'create_lead_integration',
          repository.createLead(leadData),
          PERFORMANCE_THRESHOLDS.INSERT_SINGLE
        );

        expect(createdLead.id).toBeDefined();
        expect(createdLead.email).toBe(leadData.email);

        // Read
        const foundLead = await monitorSupabaseQuery(
          'find_lead_integration',
          repository.findLeadById(createdLead.id),
          PERFORMANCE_THRESHOLDS.SELECT_SIMPLE
        );

        expect(foundLead).toEqual(createdLead);

        // Update
        const updatedLead = await monitorSupabaseQuery(
          'update_lead_integration',
          repository.updateLeadStatus(createdLead.id, 'qualified'),
          PERFORMANCE_THRESHOLDS.UPDATE_SINGLE
        );

        expect(updatedLead?.status).toBe('qualified');

        // Delete (soft delete)
        const deleteResult = await monitorSupabaseQuery(
          'delete_lead_integration',
          repository.deleteLead(createdLead.id),
          PERFORMANCE_THRESHOLDS.DELETE_SINGLE
        );

        expect(deleteResult).toBe(true);

        // Verify soft delete
        const deletedLead = await repository.findLeadById(createdLead.id);
        expect(deletedLead?.deleted_at).toBeTruthy();
      });

      it('should enforce database constraints', async () => {
        const leadData = createLeadFactory();

        // Create lead
        const createdLead = await repository.createLead(leadData);
        expect(createdLead.id).toBeDefined();

        // Try to create duplicate (should fail due to unique email constraint)
        await expect(repository.createLead(leadData)).rejects.toThrow();
      });

      it('should handle concurrent writes safely', async () => {
        const baseLeadData = createLeadFactory();

        // Create concurrent update operations
        const operations = Array.from({ length: 5 }, async (_, i) => {
          const leadData = createLeadFactory({
            email: `concurrent_${i}_${baseLeadData.email}`,
          });
          return repository.createLead(leadData);
        });

        const results = await Promise.allSettled(operations);
        const successful = results.filter(r => r.status === 'fulfilled');

        expect(successful.length).toBe(5);
      });
    });
  });
}