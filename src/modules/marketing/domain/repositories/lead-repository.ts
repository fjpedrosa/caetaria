/**
 * Lead Repository Interface
 * Domain layer - Port definition for lead persistence
 *
 * Features:
 * - Complete CRUD operations
 * - Advanced filtering and search capabilities
 * - Pagination support for efficient data retrieval
 * - Batch operations for performance optimization
 * - Analytics and reporting methods
 */

import { Lead, LeadId, LeadSource, LeadStatus } from '../entities/lead';
import { Email } from '../value-objects/email';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string; // Search across email, name, company
}

export type LeadSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'companyName'
  | 'status'
  | 'source';

export type SortOrder = 'asc' | 'desc';

export interface PaginatedLeadResult {
  data: Lead[];
  total: number;
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface LeadRepository {
  /**
   * Save a lead (create or update)
   * @returns The saved lead with updated timestamps
   */
  save(lead: Lead): Promise<Lead>;

  /**
   * Update an existing lead with partial data
   * @param id - Lead ID to update
   * @param updates - Partial lead data to update
   * @returns The updated lead
   * @throws LeadNotFoundError if lead doesn't exist
   */
  update(id: LeadId, updates: Partial<Lead>): Promise<Lead>;

  /**
   * Find a lead by ID
   * @returns Lead if found, null otherwise
   */
  findById(id: LeadId): Promise<Lead | null>;

  /**
   * Find a lead by email
   * @returns Lead if found, null otherwise
   */
  findByEmail(email: Email): Promise<Lead | null>;

  /**
   * Find leads with filters, pagination, and sorting
   * @param filters - Optional filters to apply
   * @param pagination - Optional pagination options
   * @param sort - Optional sorting configuration
   * @returns Paginated result with leads and metadata
   */
  findMany(
    filters?: LeadFilters,
    pagination?: { limit?: number; offset?: number },
    sort?: { field: LeadSortField; order: SortOrder }
  ): Promise<PaginatedLeadResult>;

  /**
   * Check if email already exists
   * @returns true if email exists, false otherwise
   */
  exists(email: Email): Promise<boolean>;

  /**
   * Delete a lead by ID
   * @param id - Lead ID to delete
   * @returns true if lead was deleted, false if not found
   */
  delete(id: LeadId): Promise<boolean>;

  /**
   * Get total count of leads matching filters
   * @param filters - Optional filters to apply
   * @returns Total count of matching leads
   */
  count(filters?: LeadFilters): Promise<number>;

  /**
   * Batch update multiple leads
   * @param updates - Array of lead updates
   * @returns Array of successfully updated leads
   */
  batchUpdate(updates: { id: LeadId; changes: Partial<Lead> }[]): Promise<Lead[]>;

  /**
   * Get count of leads by status for analytics
   * @returns Object with status counts
   */
  getLeadsByStatusCount(): Promise<Record<LeadStatus, number>>;
}