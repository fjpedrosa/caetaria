/**
 * Get Landing Analytics Use Case
 * Application layer - Business logic for retrieving landing page analytics
 */

import { LeadSource, LeadStatus } from '../../domain/entities/lead';
import { LeadFilters,LeadRepository } from '../../domain/repositories/lead-repository';

export interface LandingAnalyticsInput {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface SourceMetrics {
  source: LeadSource;
  count: number;
  percentage: number;
}

export interface StatusMetrics {
  status: LeadStatus;
  count: number;
  percentage: number;
}

export interface LandingAnalyticsOutput {
  totalLeads: number;
  newLeads: number;
  conversionRate: number;
  sourceBreakdown: SourceMetrics[];
  statusBreakdown: StatusMetrics[];
  dailyLeads: Array<{
    date: Date;
    count: number;
  }>;
  topFeatures: Array<{
    feature: string;
    count: number;
  }>;
}

export interface GetLandingAnalyticsDependencies {
  leadRepository: LeadRepository;
}

/**
 * Factory function for creating GetLandingAnalytics use case
 * Retrieves and calculates analytics metrics for the landing page performance
 */
export const createGetLandingAnalyticsUseCase = (dependencies: GetLandingAnalyticsDependencies) => {
  const { leadRepository } = dependencies;

  const execute = async (input: LandingAnalyticsInput): Promise<LandingAnalyticsOutput> => {
    const filters: LeadFilters = {};

    if (input.dateRange) {
      filters.createdAfter = input.dateRange.from;
      filters.createdBefore = input.dateRange.to;
    }

    // Get all leads within the date range
    const allLeads = await leadRepository.findMany(filters);
    const totalLeads = allLeads.length;

    // Calculate new leads (status: 'new')
    const newLeads = allLeads.filter(lead => lead.status === 'new').length;

    // Calculate conversion rate (qualified + converted / total)
    const convertedLeads = allLeads.filter(
      lead => lead.status === 'qualified' || lead.status === 'converted'
    ).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate source breakdown
    const sourceMap = new Map<LeadSource, number>();
    allLeads.forEach(lead => {
      sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
    });

    const sourceBreakdown: SourceMetrics[] = Array.from(sourceMap.entries()).map(
      ([source, count]) => ({
        source,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      })
    ).sort((a, b) => b.count - a.count);

    // Calculate status breakdown
    const statusMap = new Map<LeadStatus, number>();
    allLeads.forEach(lead => {
      statusMap.set(lead.status, (statusMap.get(lead.status) || 0) + 1);
    });

    const statusBreakdown: StatusMetrics[] = Array.from(statusMap.entries()).map(
      ([status, count]) => ({
        status,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
      })
    ).sort((a, b) => b.count - a.count);

    // Calculate daily leads (last 30 days or within date range)
    const dailyMap = new Map<string, number>();
    allLeads.forEach(lead => {
      const dateKey = lead.createdAt.toISOString().split('T')[0];
      dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
    });

    const dailyLeads = Array.from(dailyMap.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr),
        count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate top interested features
    const featureMap = new Map<string, number>();
    allLeads.forEach(lead => {
      lead.interestedFeatures?.forEach(feature => {
        featureMap.set(feature, (featureMap.get(feature) || 0) + 1);
      });
    });

    const topFeatures = Array.from(featureMap.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 features

    return {
      totalLeads,
      newLeads,
      conversionRate,
      sourceBreakdown,
      statusBreakdown,
      dailyLeads,
      topFeatures,
    };
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type GetLandingAnalyticsUseCase = ReturnType<typeof createGetLandingAnalyticsUseCase>;