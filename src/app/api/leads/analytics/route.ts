/**
 * Lead Analytics API Routes
 *
 * Provides analytics and reporting endpoints for leads:
 * - GET /api/leads/analytics - Get lead analytics and reports
 *
 * Features:
 * - Status distribution reports
 * - Source attribution analytics
 * - Time-based trend analysis
 * - Lead quality metrics
 * - Performance insights
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient, serverAuthHelpers, supabaseUtils } from '@/lib/supabase';
import { LeadSource, LeadStatus } from '@/modules/marketing/domain/entities/lead';
import { LeadFilters } from '@/modules/marketing/domain/repositories/lead-repository';
import {
  createSupabaseLeadRepository,
  LeadRepositoryError
} from '@/modules/marketing/infrastructure/adapters/supabase-lead-repository';

/**
 * GET /api/leads/analytics
 *
 * Get comprehensive lead analytics and insights
 *
 * Query Parameters:
 * - period: Time period for analysis (7d, 30d, 90d, 1y, all) - default: 30d
 * - source: Filter by specific source
 * - include: Comma-separated list of metrics to include (status_distribution, source_attribution, trends, quality_metrics)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const sourceFilter = searchParams.get('source') as LeadSource | null;
    const includeParam = searchParams.get('include') || 'status_distribution,source_attribution,trends,quality_metrics';
    const includeMetrics = includeParam.split(',').map(m => m.trim());

    // Calculate date range based on period
    const dateRangeFilter: Pick<LeadFilters, 'createdAfter' | 'createdBefore'> = {};
    const now = new Date();

    switch (period) {
      case '7d':
        dateRangeFilter.createdAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateRangeFilter.createdAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateRangeFilter.createdAfter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateRangeFilter.createdAfter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        // No date filter for all time
        break;
      default:
        dateRangeFilter.createdAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Create repository
    const leadRepository = createSupabaseLeadRepository({ supabase });

    // Build analytics response
    const analytics: any = {
      period,
      generated_at: now.toISOString(),
      filters: {
        period,
        source: sourceFilter || null,
      }
    };

    // Base filters for all queries
    const baseFilters: LeadFilters = {
      ...dateRangeFilter,
      ...(sourceFilter ? { source: sourceFilter } : {})
    };

    // Execute analytics queries based on requested metrics
    const analyticsPromises: Promise<void>[] = [];

    // 1. Status Distribution
    if (includeMetrics.includes('status_distribution')) {
      analyticsPromises.push(
        (async () => {
          try {
            const statusCounts = await leadRepository.getLeadsByStatusCount();
            const totalLeads = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

            analytics.status_distribution = {
              counts: statusCounts,
              percentages: Object.entries(statusCounts).reduce((acc, [status, count]) => ({
                ...acc,
                [status]: totalLeads > 0 ? Math.round((count / totalLeads) * 100 * 100) / 100 : 0
              }), {} as Record<LeadStatus, number>),
              total: totalLeads
            };
          } catch (error) {
            console.error('Error getting status distribution:', error);
            analytics.status_distribution = { error: 'Failed to calculate status distribution' };
          }
        })()
      );
    }

    // 2. Source Attribution
    if (includeMetrics.includes('source_attribution')) {
      analyticsPromises.push(
        (async () => {
          try {
            const sources = ['landing_page', 'referral', 'social_media', 'email', 'advertisement', 'other'] as LeadSource[];
            const sourceCounts: Record<LeadSource, number> = {} as Record<LeadSource, number>;
            let totalSourceLeads = 0;

            for (const source of sources) {
              const count = await leadRepository.count({
                ...baseFilters,
                source
              });
              sourceCounts[source] = count;
              totalSourceLeads += count;
            }

            analytics.source_attribution = {
              counts: sourceCounts,
              percentages: Object.entries(sourceCounts).reduce((acc, [source, count]) => ({
                ...acc,
                [source]: totalSourceLeads > 0 ? Math.round((count / totalSourceLeads) * 100 * 100) / 100 : 0
              }), {} as Record<LeadSource, number>),
              total: totalSourceLeads,
              top_sources: Object.entries(sourceCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([source, count]) => ({ source, count, percentage: totalSourceLeads > 0 ? Math.round((count / totalSourceLeads) * 100 * 100) / 100 : 0 }))
            };
          } catch (error) {
            console.error('Error getting source attribution:', error);
            analytics.source_attribution = { error: 'Failed to calculate source attribution' };
          }
        })()
      );
    }

    // 3. Time-based Trends (simplified daily aggregation for last 30 days)
    if (includeMetrics.includes('trends')) {
      analyticsPromises.push(
        (async () => {
          try {
            // Get leads for trend analysis (last 30 days regardless of period filter)
            const trendPeriod = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const trendLeads = await leadRepository.findMany({
              ...baseFilters,
              createdAfter: trendPeriod
            });

            // Group by day
            const dailyData: Record<string, number> = {};
            trendLeads.data.forEach(lead => {
              const day = lead.createdAt.toISOString().split('T')[0];
              dailyData[day] = (dailyData[day] || 0) + 1;
            });

            // Fill missing days with 0
            const trendData = [];
            for (let i = 29; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              const day = date.toISOString().split('T')[0];
              trendData.push({
                date: day,
                leads_count: dailyData[day] || 0
              });
            }

            analytics.trends = {
              period: '30d',
              daily_data: trendData,
              total_period: trendData.reduce((sum, day) => sum + day.leads_count, 0),
              average_daily: Math.round((trendData.reduce((sum, day) => sum + day.leads_count, 0) / 30) * 100) / 100,
              peak_day: trendData.reduce((peak, day) =>
                day.leads_count > peak.leads_count ? day : peak,
                { date: '', leads_count: 0 }
              )
            };
          } catch (error) {
            console.error('Error getting trends:', error);
            analytics.trends = { error: 'Failed to calculate trends' };
          }
        })()
      );
    }

    // 4. Quality Metrics
    if (includeMetrics.includes('quality_metrics')) {
      analyticsPromises.push(
        (async () => {
          try {
            const allLeads = await leadRepository.findMany(baseFilters);
            const leads = allLeads.data;

            if (leads.length === 0) {
              analytics.quality_metrics = {
                total_leads: 0,
                completeness: { average_score: 0, details: {} },
                engagement: { qualified_rate: 0, conversion_rate: 0 }
              };
              return;
            }

            // Calculate completeness scores
            const completenessScores = leads.map(lead => {
              let score = 0;
              const maxScore = 5; // email (required) + 4 optional fields

              // Required field
              if (lead.email) score += 1;

              // Optional fields
              if (lead.phoneNumber) score += 1;
              if (lead.firstName || lead.lastName) score += 1;
              if (lead.companyName) score += 1;
              if (lead.interestedFeatures && lead.interestedFeatures.length > 0) score += 1;

              return (score / maxScore) * 100;
            });

            const averageCompleteness = Math.round((completenessScores.reduce((sum, score) => sum + score, 0) / leads.length) * 100) / 100;

            // Field completion rates
            const fieldCompletionRates = {
              email: 100, // Always required
              phone: Math.round((leads.filter(l => l.phoneNumber).length / leads.length) * 100),
              name: Math.round((leads.filter(l => l.firstName || l.lastName).length / leads.length) * 100),
              company: Math.round((leads.filter(l => l.companyName).length / leads.length) * 100),
              interested_features: Math.round((leads.filter(l => l.interestedFeatures && l.interestedFeatures.length > 0).length / leads.length) * 100)
            };

            // Engagement metrics
            const qualifiedLeads = leads.filter(l => ['qualified', 'converted'].includes(l.status)).length;
            const convertedLeads = leads.filter(l => l.status === 'converted').length;

            analytics.quality_metrics = {
              total_leads: leads.length,
              completeness: {
                average_score: averageCompleteness,
                field_completion_rates: fieldCompletionRates,
                highly_complete: leads.filter(l => {
                  const score = completenessScores[leads.indexOf(l)];
                  return score >= 80;
                }).length
              },
              engagement: {
                qualified_rate: Math.round((qualifiedLeads / leads.length) * 100 * 100) / 100,
                conversion_rate: Math.round((convertedLeads / leads.length) * 100 * 100) / 100,
                qualified_count: qualifiedLeads,
                converted_count: convertedLeads
              }
            };
          } catch (error) {
            console.error('Error getting quality metrics:', error);
            analytics.quality_metrics = { error: 'Failed to calculate quality metrics' };
          }
        })()
      );
    }

    // Wait for all analytics queries to complete
    await Promise.all(analyticsPromises);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error generating lead analytics:', error);

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
        error: 'Failed to generate analytics',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}