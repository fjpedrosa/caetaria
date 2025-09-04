/**
 * Individual Lead API Routes
 *
 * Handles CRUD operations for specific leads:
 * - GET /api/leads/[id] - Retrieve specific lead
 * - PUT /api/leads/[id] - Update specific lead
 * - DELETE /api/leads/[id] - Delete specific lead
 *
 * Features:
 * - Proper error handling with status codes
 * - Input validation using Zod schemas
 * - Clean Architecture integration
 * - Analytics tracking for important operations
 * - Row Level Security support
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient, serverAuthHelpers, supabaseUtils } from '@/lib/supabase';
import { LeadId, LeadSource, LeadStatus } from '@/modules/marketing/domain/entities/lead';
import { createEmail } from '@/modules/marketing/domain/value-objects/email';
import { createPhoneNumber } from '@/modules/marketing/domain/value-objects/phone-number';
import {
  createSupabaseLeadRepository,
  DuplicateLeadError,
  LeadNotFoundError,
  LeadRepositoryError} from '@/modules/marketing/infrastructure/adapters/supabase-lead-repository';

// Validation schemas
const updateLeadSchema = z.object({
  email: z.string().email().optional(),
  phone_number: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  source: z.enum(['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  notes: z.string().optional().nullable(),
  interested_features: z.array(z.string()).optional().nullable(),
});

type UpdateLeadBody = z.infer<typeof updateLeadSchema>;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/leads/[id]
 *
 * Retrieve a specific lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createClient();

    // Optional: Check authentication for protected routes
    // const user = await serverAuthHelpers.getUser(supabase);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Find lead by ID
    const lead = await leadRepository.findById(id as LeadId);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Return lead data (sanitized for API response)
    return NextResponse.json({
      data: {
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
      }
    });

  } catch (error) {
    console.error('Error fetching lead:', error);

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
        error: 'Failed to fetch lead',
        details: supabaseUtils.formatError(error)
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 *
 * Update a specific lead
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateLeadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Create server-side Supabase client
    const supabase = await createClient();

    // Optional: Check authentication for protected routes
    // const user = await serverAuthHelpers.getUser(supabase);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Build domain update object
    const domainUpdates: any = {};

    if (updateData.email) {
      domainUpdates.email = createEmail(updateData.email);
    }

    if (updateData.phone_number !== undefined) {
      domainUpdates.phoneNumber = updateData.phone_number
        ? createPhoneNumber(updateData.phone_number)
        : null;
    }

    if (updateData.company_name !== undefined) {
      domainUpdates.companyName = updateData.company_name?.trim() || null;
    }

    if (updateData.first_name !== undefined) {
      domainUpdates.firstName = updateData.first_name?.trim() || null;
    }

    if (updateData.last_name !== undefined) {
      domainUpdates.lastName = updateData.last_name?.trim() || null;
    }

    if (updateData.source) {
      domainUpdates.source = updateData.source as LeadSource;
    }

    if (updateData.status) {
      domainUpdates.status = updateData.status as LeadStatus;
    }

    if (updateData.notes !== undefined) {
      domainUpdates.notes = updateData.notes?.trim() || null;
    }

    if (updateData.interested_features !== undefined) {
      domainUpdates.interestedFeatures = updateData.interested_features || [];
    }

    // Update lead
    const updatedLead = await leadRepository.update(id as LeadId, domainUpdates);

    // Log analytics event
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_name: 'lead_updated',
          event_data: {
            lead_id: updatedLead.id,
            updated_fields: Object.keys(domainUpdates),
            status: updatedLead.status,
          } as any,
          page_url: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent'),
        });
    } catch (analyticsError) {
      console.warn('Failed to log analytics event:', analyticsError);
    }

    return NextResponse.json({
      message: 'Lead updated successfully',
      data: {
        id: updatedLead.id,
        email: updatedLead.email,
        phone_number: updatedLead.phoneNumber,
        company_name: updatedLead.companyName,
        first_name: updatedLead.firstName,
        last_name: updatedLead.lastName,
        source: updatedLead.source,
        status: updatedLead.status,
        notes: updatedLead.notes,
        interested_features: updatedLead.interestedFeatures,
        created_at: updatedLead.createdAt.toISOString(),
        updated_at: updatedLead.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error updating lead:', error);

    if (error instanceof LeadNotFoundError) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json(
      {
        error: 'Failed to update lead',
        details: supabaseUtils.formatError(error)
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 *
 * Delete a specific lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createClient();

    // Optional: Check authentication for protected routes
    // const user = await serverAuthHelpers.getUser(supabase);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Get lead before deletion for analytics
    const leadToDelete = await leadRepository.findById(id as LeadId);

    // Delete lead
    const wasDeleted = await leadRepository.delete(id as LeadId);

    if (!wasDeleted) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Log analytics event
    if (leadToDelete) {
      try {
        await supabase
          .from('analytics_events')
          .insert({
            event_name: 'lead_deleted',
            event_data: {
              lead_id: leadToDelete.id,
              email: leadToDelete.email,
              status: leadToDelete.status,
              source: leadToDelete.source,
            } as any,
            page_url: request.headers.get('referer'),
            user_agent: request.headers.get('user-agent'),
          });
      } catch (analyticsError) {
        console.warn('Failed to log analytics event:', analyticsError);
      }
    }

    return NextResponse.json({
      message: 'Lead deleted successfully',
      deleted: true
    });

  } catch (error) {
    console.error('Error deleting lead:', error);

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
        error: 'Failed to delete lead',
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}