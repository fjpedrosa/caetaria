/**
 * Lead Repository Interface
 * Domain layer - Port definition for lead persistence
 */

import { Lead, LeadId, LeadSource, LeadStatus } from '../entities/lead';
import { Email } from '../value-objects/email';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface LeadRepository {
  /**
   * Save a lead (create or update)
   */
  save(lead: Lead): Promise<void>;
  
  /**
   * Find a lead by ID
   */
  findById(id: LeadId): Promise<Lead | null>;
  
  /**
   * Find a lead by email
   */
  findByEmail(email: Email): Promise<Lead | null>;
  
  /**
   * Find leads with filters
   */
  findMany(filters?: LeadFilters): Promise<Lead[]>;
  
  /**
   * Check if email already exists
   */
  exists(email: Email): Promise<boolean>;
  
  /**
   * Delete a lead
   */
  delete(id: LeadId): Promise<void>;
  
  /**
   * Get total count of leads
   */
  count(filters?: LeadFilters): Promise<number>;
}