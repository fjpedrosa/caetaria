/**
 * Supabase Lead Repository Adapter
 * Infrastructure layer - Supabase implementation of LeadRepository
 */

import { Lead, LeadId } from '../../domain/entities/lead';
import { LeadFilters,LeadRepository } from '../../domain/repositories/lead-repository';
import { Email } from '../../domain/value-objects/email';

// Supabase client would be injected
interface SupabaseClient {
  from: (table: string) => any;
}

// Database row type
interface LeadRow {
  id: string;
  email: string;
  phone_number?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  interested_features?: string[];
}

/**
 * Supabase implementation of LeadRepository
 * Handles the mapping between domain entities and database rows
 */
export class SupabaseLeadRepository implements LeadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(lead: Lead): Promise<void> {
    const row: LeadRow = this.toRow(lead);

    const { error } = await this.supabase
      .from('leads')
      .upsert(row);

    if (error) {
      throw new Error(`Failed to save lead: ${error.message}`);
    }
  }

  async findById(id: LeadId): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find lead by ID: ${error.message}`);
    }

    return data ? this.toDomain(data) : null;
  }

  async findByEmail(email: Email): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to find lead by email: ${error.message}`);
    }

    return data ? this.toDomain(data) : null;
  }

  async findMany(filters?: LeadFilters): Promise<Lead[]> {
    let query = this.supabase.from('leads').select('*');

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

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find leads: ${error.message}`);
    }

    return (data || []).map((row: LeadRow) => this.toDomain(row));
  }

  async exists(email: Email): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return false;
      }
      throw new Error(`Failed to check lead existence: ${error.message}`);
    }

    return Boolean(data);
  }

  async delete(id: LeadId): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  async count(filters?: LeadFilters): Promise<number> {
    let query = this.supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

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

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count leads: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Convert domain entity to database row
   */
  private toRow(lead: Lead): LeadRow {
    return {
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
    };
  }

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: LeadRow): Lead {
    return {
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
    };
  }
}