import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { Event, getEventProperty } from '../../domain/entities/event';
import { Metric } from '../../domain/entities/metric';
import { EventType, EventTypeInterface } from '../../domain/value-objects/event-type';
import { MetricValue } from '../../domain/value-objects/metric-value';
import { AnalyticsRepository, MetricsRepository, ReportingRepository } from '../ports/analytics-repository';

export interface GenerateReportRequest {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate: Date;
  includeMetrics?: string[];
  includeEvents?: (EventType | EventTypeInterface)[];
  includeSummary?: boolean;
  includeCharts?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export interface ReportSection {
  title: string;
  description: string;
  data: any;
  chartConfig?: {
    type: 'line' | 'bar' | 'pie' | 'area';
    dataKey: string;
    xAxisKey?: string;
    yAxisKey?: string;
  };
}

export interface GenerateReportResponse {
  reportId: string;
  reportType: GenerateReportRequest['reportType'];
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  sections: ReportSection[];
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    topEvents: Array<{ type: string; count: number }>;
    keyMetrics: Array<{ name: string; value: string; change?: string }>;
  };
  metadata: {
    executionTime: number;
    dataPoints: number;
    filters: Omit<GenerateReportRequest, 'reportType'>;
  };
}

// Factory function for creating GenerateReport use case
export const createGenerateReportUseCase = (dependencies: {
  analyticsRepository: AnalyticsRepository;
  metricsRepository: MetricsRepository;
  reportingRepository: ReportingRepository;
}) => {
  const { analyticsRepository, metricsRepository, reportingRepository } = dependencies;

  const execute = async (request: GenerateReportRequest): Promise<Result<GenerateReportResponse, Error>> => {
    const startTime = Date.now();

    try {
      // Validate date range
      if (request.startDate >= request.endDate) {
        return failure(new Error('Start date must be before end date'));
      }

      // Generate report using repository
      const reportData = await reportingRepository.generateReport(
        request.reportType === 'custom' ? 'daily' : request.reportType,
        {
          startDate: request.startDate,
          endDate: request.endDate,
          includeMetrics: request.includeMetrics,
          includeEvents: request.includeEvents,
        }
      );

      // Process and organize data into sections
      const sections = await createReportSections(reportData, request);

      // Generate summary
      const summary = generateSummary(reportData);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Create report response
      const reportId = generateReportId();

      const response: GenerateReportResponse = {
        reportId,
        reportType: request.reportType,
        dateRange: {
          start: request.startDate,
          end: request.endDate,
        },
        generatedAt: new Date(),
        sections,
        summary,
        metadata: {
          executionTime,
          dataPoints: reportData.events.length + reportData.metrics.length,
          filters: {
            startDate: request.startDate,
            endDate: request.endDate,
            includeMetrics: request.includeMetrics,
            includeEvents: request.includeEvents,
            includeSummary: request.includeSummary,
            includeCharts: request.includeCharts,
            groupBy: request.groupBy,
          },
        },
      };

      return success(response);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to generate report'));
    }
  };

  const createReportSections = async (
    data: { events: Event[]; metrics: Metric[]; summary: Record<string, any> },
    request: GenerateReportRequest
  ): Promise<ReportSection[]> => {
    const sections: ReportSection[] = [];

    // Overview section
    sections.push({
      title: 'Overview',
      description: `Analytics overview for ${request.startDate.toDateString()} to ${request.endDate.toDateString()}`,
      data: {
        totalEvents: data.events.length,
        totalMetrics: data.metrics.length,
        dateRange: `${request.startDate.toDateString()} - ${request.endDate.toDateString()}`,
      },
    });

    // Events section
    if (data.events.length > 0) {
      const eventsByType = groupEventsByType(data.events);
      const eventsByTime = request.groupBy ? groupEventsByTime(data.events, request.groupBy) : {};

      sections.push({
        title: 'Events Analysis',
        description: 'Breakdown of tracked events by type and time',
        data: {
          byType: eventsByType,
          byTime: eventsByTime,
          topEvents: getTopEvents(eventsByType, 10),
        },
        chartConfig: request.includeCharts ? {
          type: 'bar',
          dataKey: 'count',
          xAxisKey: 'type',
          yAxisKey: 'count',
        } : undefined,
      });
    }

    // Metrics section
    if (data.metrics.length > 0) {
      const metricsByName = groupMetricsByName(data.metrics);
      const metricTrends = request.groupBy ? calculateMetricTrends(data.metrics, request.groupBy) : {};

      sections.push({
        title: 'Metrics Analysis',
        description: 'Key performance metrics and trends',
        data: {
          byName: metricsByName,
          trends: metricTrends,
          summary: summarizeMetrics(data.metrics),
        },
        chartConfig: request.includeCharts ? {
          type: 'line',
          dataKey: 'value',
          xAxisKey: 'time',
          yAxisKey: 'value',
        } : undefined,
      });
    }

    // User behavior section
    const userMetrics = calculateUserMetrics(data.events);
    if (Object.keys(userMetrics).length > 0) {
      sections.push({
        title: 'User Behavior',
        description: 'User engagement and behavior patterns',
        data: userMetrics,
        chartConfig: request.includeCharts ? {
          type: 'pie',
          dataKey: 'value',
        } : undefined,
      });
    }

    // Performance section
    const performanceMetrics = calculatePerformanceMetrics(data.events, data.metrics);
    if (Object.keys(performanceMetrics).length > 0) {
      sections.push({
        title: 'Performance',
        description: 'System and application performance metrics',
        data: performanceMetrics,
      });
    }

    return sections;
  };

  const generateSummary = (data: { events: Event[]; metrics: Metric[]; summary: Record<string, any> }) => {
    const uniqueUsers = new Set(data.events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(data.events.map(e => e.sessionId).filter(Boolean)).size;

    const eventsByType = groupEventsByType(data.events);
    const topEvents = getTopEvents(eventsByType, 5);

    const keyMetrics = getKeyMetrics(data.metrics);

    return {
      totalEvents: data.events.length,
      uniqueUsers,
      uniqueSessions,
      topEvents,
      keyMetrics,
    };
  };

  const groupEventsByType = (events: Event[]): Record<string, number> => {
    return events.reduce((acc, event) => {
      const type = event.type.value;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const groupEventsByTime = (events: Event[], groupBy: 'day' | 'week' | 'month'): Record<string, number> => {
    return events.reduce((acc, event) => {
      const key = getTimeKey(event.timestamp, groupBy);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const groupMetricsByName = (metrics: Metric[]): Record<string, Metric[]> => {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric);
      return acc;
    }, {} as Record<string, Metric[]>);
  };

  const calculateMetricTrends = (metrics: Metric[], groupBy: 'day' | 'week' | 'month'): Record<string, any> => {
    const grouped = metrics.reduce((acc, metric) => {
      const key = getTimeKey(metric.timestamp, groupBy);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, Metric[]>);

    return Object.entries(grouped).reduce((acc, [time, timeMetrics]) => {
      acc[time] = {
        count: timeMetrics.length,
        averageValue: timeMetrics.reduce((sum, m) => sum + m.value.raw, 0) / timeMetrics.length,
        metrics: timeMetrics.map(m => ({
          name: m.name,
          value: m.value.raw,
        })),
      };
      return acc;
    }, {} as Record<string, any>);
  };

  const calculateUserMetrics = (events: Event[]): Record<string, any> => {
    const userEvents = events.filter(e => e.userId);
    if (userEvents.length === 0) return {};

    const usersWithEventCounts = userEvents.reduce((acc, event) => {
      const userId = event.userId!;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventCounts = Object.values(usersWithEventCounts);
    const avgEventsPerUser = eventCounts.reduce((sum, count) => sum + count, 0) / eventCounts.length;

    return {
      uniqueUsers: Object.keys(usersWithEventCounts).length,
      averageEventsPerUser: Math.round(avgEventsPerUser * 100) / 100,
      userEngagement: categorizeUserEngagement(eventCounts),
    };
  };

  const calculatePerformanceMetrics = (events: Event[], metrics: Metric[]): Record<string, any> => {
    const performanceEvents = events.filter(e => e.type.value === 'performance_metric');
    const performanceMetrics = metrics.filter(m =>
      m.tags.includes('performance') || m.name.includes('performance')
    );

    if (performanceEvents.length === 0 && performanceMetrics.length === 0) {
      return {};
    }

    return {
      totalPerformanceEvents: performanceEvents.length,
      performanceMetrics: performanceMetrics.length,
      averageLoadTime: calculateAverageLoadTime(performanceEvents),
    };
  };

  const getTopEvents = (eventsByType: Record<string, number>, limit: number): Array<{ type: string; count: number }> => {
    return Object.entries(eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  };

  const getKeyMetrics = (metrics: Metric[]): Array<{ name: string; value: string; change?: string }> => {
    const metricsByName = groupMetricsByName(metrics);

    return Object.entries(metricsByName)
      .slice(0, 10) // Top 10 metrics
      .map(([name, metricList]) => {
        const latest = metricList[metricList.length - 1];
        return {
          name,
          value: latest.value.formatted,
          change: calculateMetricChange(metricList),
        };
      });
  };

  const getTimeKey = (date: Date, groupBy: 'day' | 'week' | 'month'): string => {
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'week':
        const week = getWeekNumber(date);
        return `${date.getFullYear()}-W${week}`;
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString();
    }
  };

  const getWeekNumber = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  };

  const categorizeUserEngagement = (eventCounts: number[]): Record<string, number> => {
    const low = eventCounts.filter(count => count <= 5).length;
    const medium = eventCounts.filter(count => count > 5 && count <= 20).length;
    const high = eventCounts.filter(count => count > 20).length;

    return { low, medium, high };
  };

  const calculateAverageLoadTime = (performanceEvents: Event[]): number => {
    const loadTimes = performanceEvents
      .map(e => getEventProperty<number>(e, 'loadTime'))
      .filter((time): time is number => typeof time === 'number');

    return loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;
  };

  const calculateMetricChange = (metrics: Metric[]): string | undefined => {
    if (metrics.length < 2) return undefined;

    const first = metrics[0].value.raw;
    const last = metrics[metrics.length - 1].value.raw;

    if (first === 0) return undefined;

    const change = ((last - first) / first) * 100;
    const sign = change > 0 ? '+' : '';

    return `${sign}${change.toFixed(1)}%`;
  };

  const summarizeMetrics = (metrics: Metric[]): Record<string, any> => {
    if (metrics.length === 0) return {};

    const numericMetrics = metrics.filter(m =>
      m.value.isNumber() || m.value.isCount() || m.value.isDuration()
    );

    if (numericMetrics.length === 0) return {};

    const values = numericMetrics.map(m => m.value.raw);

    return {
      total: numericMetrics.length,
      sum: values.reduce((acc, val) => acc + val, 0),
      average: values.reduce((acc, val) => acc + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  const generateReportId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `report_${timestamp}_${random}`;
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type GenerateReportUseCase = ReturnType<typeof createGenerateReportUseCase>;