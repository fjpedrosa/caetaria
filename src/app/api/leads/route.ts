/**
 * Leads API Routes
 *
 * Comprehensive lead management API with advanced features:
 * - GET /api/leads - List leads with filtering, pagination, and search
 * - POST /api/leads - Create a new lead with validation
 * - PATCH /api/leads - Batch update multiple leads
 *
 * Features:
 * - Advanced filtering (status, source, date range, search)
 * - Pagination with metadata (total count, hasMore)
 * - Sorting by multiple fields (createdAt, email, name, etc.)
 * - Input validation with Zod schemas
 * - Comprehensive error handling
 * - Analytics tracking
 * - Row Level Security support
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient, serverAuthHelpers, supabaseUtils } from '@/lib/supabase';
import {
  createLead,
  LeadId,
  LeadSource,
  LeadStatus} from '@/modules/marketing/domain/entities/lead';
import {
  LeadFilters,
  LeadSortField,
  SortOrder
} from '@/modules/marketing/domain/repositories/lead-repository';
import { createEmail } from '@/modules/marketing/domain/value-objects/email';
import { createPhoneNumber } from '@/modules/marketing/domain/value-objects/phone-number';
import {
  createSupabaseLeadRepository,
  DuplicateLeadError,
  LeadRepositoryError} from '@/modules/marketing/infrastructure/adapters/supabase-lead-repository';

// Validation schemas
const createLeadSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone_number: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  source: z.enum(['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other']),
  notes: z.string().optional().nullable(),
  interested_features: z.array(z.string()).optional().nullable(),
});

const batchUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string(),
    changes: z.object({
      email: z.string().email().optional(),
      phone_number: z.string().optional().nullable(),
      company_name: z.string().optional().nullable(),
      first_name: z.string().optional().nullable(),
      last_name: z.string().optional().nullable(),
      source: z.enum(['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other']).optional(),
      status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
      notes: z.string().optional().nullable(),
      interested_features: z.array(z.string()).optional().nullable(),
    }).partial()
  })).min(1, 'At least one update is required').max(50, 'Maximum 50 updates per batch')
});

type CreateLeadBody = z.infer<typeof createLeadSchema>;
type BatchUpdateBody = z.infer<typeof batchUpdateSchema>;

/**
 * GET /api/leads
 *
 * List leads with advanced filtering, pagination, search, and sorting
 *
 * Query Parameters:
 * - status: Filter by lead status (new, contacted, qualified, converted, lost)
 * - source: Filter by lead source (landing_page, referral, etc.)
 * - search: Search across email, name, and company
 * - created_after: Filter leads created after this date (ISO string)
 * - created_before: Filter leads created before this date (ISO string)
 * - limit: Number of results per page (default: 10, max: 100)
 * - offset: Number of results to skip (for pagination)
 * - page: Page number (alternative to offset)
 * - sort_by: Field to sort by (createdAt, email, firstName, lastName, companyName, status, source)
 * - sort_order: Sort direction (asc, desc) - default: desc
 */
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = await createClient();

    // Optional: Check authentication for protected routes
    // const user = await serverAuthHelpers.getUser(supabase);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const statusParam = searchParams.get('status') as LeadStatus | null;
    const sourceParam = searchParams.get('source') as LeadSource | null;
    const searchTerm = searchParams.get('search');
    const createdAfter = searchParams.get('created_after');
    const createdBefore = searchParams.get('created_before');

    // Pagination
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const pageParam = searchParams.get('page');

    // Sorting
    const sortByParam = searchParams.get('sort_by') as LeadSortField | null;
    const sortOrderParam = searchParams.get('sort_order') as SortOrder | null;

    // Validate and parse pagination parameters
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 100);
    const page = pageParam ? Math.max(parseInt(pageParam, 10), 1) : null;
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10), 0)
      : page ? (page - 1) * limit : 0;

    // Build filters object
    const filters: LeadFilters = {};

    if (statusParam && ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(statusParam)) {
      filters.status = statusParam;
    }

    if (sourceParam && ['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other'].includes(sourceParam)) {
      filters.source = sourceParam;
    }

    if (searchTerm?.trim()) {
      filters.searchTerm = searchTerm.trim();
    }

    if (createdAfter) {
      const afterDate = new Date(createdAfter);
      if (!isNaN(afterDate.getTime())) {
        filters.createdAfter = afterDate;
      }
    }

    if (createdBefore) {
      const beforeDate = new Date(createdBefore);
      if (!isNaN(beforeDate.getTime())) {
        filters.createdBefore = beforeDate;
      }
    }

    // Build sort options
    const sortOptions = sortByParam ? {
      field: ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'companyName', 'status', 'source'].includes(sortByParam)
        ? sortByParam
        : 'createdAt' as LeadSortField,
      order: sortOrderParam === 'asc' ? 'asc' : 'desc' as SortOrder
    } : undefined;

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Execute query with retry logic
    const result = await supabaseUtils.withRetry(async () => {
      return await leadRepository.findMany(
        filters,
        { limit, offset },
        sortOptions
      );
    });

    // Transform domain entities to API response format
    const apiData = result.data.map(lead => ({
      id: lead.id,
      email: lead.email,
      phone_number: lead.phoneNumber,
      company_name: lead.companyName,
      first_name: lead.firstName,
      last_name: lead.lastName,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      interested_features: lead.interestedFeatures,
      created_at: lead.createdAt.toISOString(),
      updated_at: lead.updatedAt.toISOString(),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Return enhanced paginated response
    return NextResponse.json({
      data: apiData,
      meta: {
        total: result.total,
        count: apiData.length,
        per_page: limit,
        current_page: currentPage,
        total_pages: totalPages,
        has_more: result.pagination?.hasMore || false,
      },
      pagination: {
        limit,
        offset,
        total: result.total,
        has_next: currentPage < totalPages,
        has_previous: currentPage > 1,
        next_offset: result.pagination?.hasMore ? offset + limit : null,
        previous_offset: currentPage > 1 ? Math.max(0, offset - limit) : null,
      },
      filters: {
        applied: filters,
        available: {
          status: ['new', 'contacted', 'qualified', 'converted', 'lost'],
          source: ['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other'],
          sort_fields: ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 'companyName', 'status', 'source'],
          sort_orders: ['asc', 'desc']
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);

    if (error instanceof LeadRepositoryError) {
      return NextResponse.json(
        {
          error: 'Repository error',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch leads',
        details: supabaseUtils.formatError(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 *
 * Create a new lead with comprehensive validation and clean architecture patterns
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createLeadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const leadData = validationResult.data;

    // Create server-side Supabase client
    const supabase = await createClient();

    // Create repository using clean architecture pattern
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Create value objects with proper validation
    const email = createEmail(leadData.email);
    let phoneNumber = undefined;

    if (leadData.phone_number?.trim()) {
      phoneNumber = createPhoneNumber(leadData.phone_number);
    }

    // Check if lead already exists
    const existingLead = await leadRepository.findByEmail(email);
    if (existingLead) {
      return NextResponse.json(
        {
          error: 'Lead already exists',
          existing_lead: {
            id: existingLead.id,
            email: existingLead.email,
            status: existingLead.status,
            created_at: existingLead.createdAt.toISOString()
          }
        },
        { status: 409 }
      );
    }

    // Create new lead entity using domain factory
    const newLead = createLead({
      email,
      phoneNumber,
      companyName: leadData.company_name?.trim() || undefined,
      firstName: leadData.first_name?.trim() || undefined,
      lastName: leadData.last_name?.trim() || undefined,
      source: leadData.source as LeadSource,
      notes: leadData.notes?.trim() || undefined,
      interestedFeatures: leadData.interested_features || [],
    });

    // Save using repository pattern
    const savedLead = await leadRepository.save(newLead);

    // Log the creation event (optional analytics)
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_name: 'lead_created',
          event_data: {
            lead_id: savedLead.id,
            source: savedLead.source,
            email: savedLead.email,
            has_phone: !!savedLead.phoneNumber,
            has_company: !!savedLead.companyName,
            has_name: !!(savedLead.firstName || savedLead.lastName),
            interested_features_count: savedLead.interestedFeatures?.length || 0,
          } as any,
          page_url: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent'),
        });
    } catch (analyticsError) {
      // Don't fail the main operation if analytics fails
      console.warn('Failed to log analytics event:', analyticsError);
    }

    // Return created lead with complete data
    return NextResponse.json(
      {
        message: 'Lead created successfully',
        data: {
          id: savedLead.id,
          email: savedLead.email,
          phone_number: savedLead.phoneNumber,
          company_name: savedLead.companyName,
          first_name: savedLead.firstName,
          last_name: savedLead.lastName,
          source: savedLead.source,
          status: savedLead.status,
          notes: savedLead.notes,
          interested_features: savedLead.interestedFeatures,
          created_at: savedLead.createdAt.toISOString(),
          updated_at: savedLead.updatedAt.toISOString(),
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating lead:', error);

    if (error instanceof DuplicateLeadError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error instanceof LeadRepositoryError) {
      return NextResponse.json(
        {
          error: 'Repository error',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Handle specific Supabase errors
    if (supabaseUtils.isUniqueViolation(error)) {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create lead',
        details: supabaseUtils.formatError(error)
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads
 *
 * Batch update multiple leads
 */
export async function PATCH(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = batchUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { updates } = validationResult.data;

    // Create server-side Supabase client
    const supabase = await createClient();

    // Optional: Check authentication for protected routes
    // const user = await serverAuthHelpers.getUser(supabase);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Transform batch updates to domain format
    const domainUpdates = updates.map(update => {
      const domainChanges: any = {};

      if (update.changes.email) {
        domainChanges.email = createEmail(update.changes.email);
      }

      if (update.changes.phone_number !== undefined) {
        domainChanges.phoneNumber = update.changes.phone_number
          ? createPhoneNumber(update.changes.phone_number)
          : null;
      }

      if (update.changes.company_name !== undefined) {
        domainChanges.companyName = update.changes.company_name?.trim() || null;
      }

      if (update.changes.first_name !== undefined) {
        domainChanges.firstName = update.changes.first_name?.trim() || null;
      }

      if (update.changes.last_name !== undefined) {
        domainChanges.lastName = update.changes.last_name?.trim() || null;
      }

      if (update.changes.source) {
        domainChanges.source = update.changes.source as LeadSource;
      }

      if (update.changes.status) {
        domainChanges.status = update.changes.status as LeadStatus;
      }

      if (update.changes.notes !== undefined) {
        domainChanges.notes = update.changes.notes?.trim() || null;
      }

      if (update.changes.interested_features !== undefined) {
        domainChanges.interestedFeatures = update.changes.interested_features || [];
      }

      return {
        id: update.id as LeadId,
        changes: domainChanges
      };
    });

    // Perform batch update
    const updatedLeads = await leadRepository.batchUpdate(domainUpdates);

    // Log analytics event
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_name: 'leads_batch_updated',
          event_data: {
            batch_size: updates.length,
            successful_updates: updatedLeads.length,
            failed_updates: updates.length - updatedLeads.length,
            updated_lead_ids: updatedLeads.map(lead => lead.id),
          } as any,
          page_url: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent'),
        });
    } catch (analyticsError) {
      console.warn('Failed to log analytics event:', analyticsError);
    }

    // Transform results to API format
    const apiData = updatedLeads.map(lead => ({
      id: lead.id,
      email: lead.email,
      phone_number: lead.phoneNumber,
      company_name: lead.companyName,
      first_name: lead.firstName,
      last_name: lead.lastName,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      interested_features: lead.interestedFeatures,
      created_at: lead.createdAt.toISOString(),
      updated_at: lead.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      message: 'Batch update completed',
      results: {
        total_requested: updates.length,
        successful: updatedLeads.length,
        failed: updates.length - updatedLeads.length,
      },
      data: apiData
    });

  } catch (error) {
    console.error('Error in batch update:', error);

    if (error instanceof LeadRepositoryError) {
      return NextResponse.json(
        {
          error: 'Repository error',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to perform batch update',
        details: supabaseUtils.formatError(error)
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}