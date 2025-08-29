import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { EventEntity } from '../../domain/entities/event';
import { MetricEntity } from '../../domain/entities/metric';
import { EventType } from '../../domain/value-objects/event-type';
import { MetricValue } from '../../domain/value-objects/metric-value';
import { AnalyticsRepository, MetricsRepository, ReportingRepository } from '../ports/analytics-repository';

export interface GenerateReportRequest {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate: Date;
  includeMetrics?: string[];
  includeEvents?: EventType[];
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

export class GenerateReportUseCase {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricsRepository: MetricsRepository,
    private readonly reportingRepository: ReportingRepository
  ) {}

  async execute(request: GenerateReportRequest): Promise<Result<GenerateReportResponse, Error>> {
    const startTime = Date.now();

    try {
      // Validate date range
      if (request.startDate >= request.endDate) {
        return failure(new Error('Start date must be before end date'));
      }

      // Generate report using repository
      const reportData = await this.reportingRepository.generateReport(
        request.reportType === 'custom' ? 'daily' : request.reportType,
        {
          startDate: request.startDate,
          endDate: request.endDate,
          includeMetrics: request.includeMetrics,
          includeEvents: request.includeEvents,
        }
      );

      // Process and organize data into sections
      const sections = await this.createReportSections(reportData, request);

      // Generate summary
      const summary = this.generateSummary(reportData);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Create report response
      const reportId = this.generateReportId();
      
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
  }

  private async createReportSections(
    data: { events: EventEntity[]; metrics: MetricEntity[]; summary: Record<string, any> },
    request: GenerateReportRequest
  ): Promise<ReportSection[]> {
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
      const eventsByType = this.groupEventsByType(data.events);
      const eventsByTime = request.groupBy ? this.groupEventsByTime(data.events, request.groupBy) : {};

      sections.push({
        title: 'Events Analysis',
        description: 'Breakdown of tracked events by type and time',
        data: {
          byType: eventsByType,
          byTime: eventsByTime,
          topEvents: this.getTopEvents(eventsByType, 10),
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
      const metricsByName = this.groupMetricsByName(data.metrics);
      const metricTrends = request.groupBy ? this.calculateMetricTrends(data.metrics, request.groupBy) : {};

      sections.push({
        title: 'Metrics Analysis',
        description: 'Key performance metrics and trends',
        data: {
          byName: metricsByName,
          trends: metricTrends,
          summary: this.summarizeMetrics(data.metrics),
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
    const userMetrics = this.calculateUserMetrics(data.events);
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
    const performanceMetrics = this.calculatePerformanceMetrics(data.events, data.metrics);
    if (Object.keys(performanceMetrics).length > 0) {
      sections.push({
        title: 'Performance',
        description: 'System and application performance metrics',
        data: performanceMetrics,
      });
    }

    return sections;
  }

  private generateSummary(data: { events: EventEntity[]; metrics: MetricEntity[]; summary: Record<string, any> }) {
    const uniqueUsers = new Set(data.events.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(data.events.map(e => e.sessionId).filter(Boolean)).size;
    
    const eventsByType = this.groupEventsByType(data.events);
    const topEvents = this.getTopEvents(eventsByType, 5);
    
    const keyMetrics = this.getKeyMetrics(data.metrics);

    return {
      totalEvents: data.events.length,
      uniqueUsers,
      uniqueSessions,
      topEvents,
      keyMetrics,
    };
  }

  private groupEventsByType(events: EventEntity[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const type = event.type.value;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEventsByTime(events: EventEntity[], groupBy: 'day' | 'week' | 'month'): Record<string, number> {
    return events.reduce((acc, event) => {
      const key = this.getTimeKey(event.timestamp, groupBy);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupMetricsByName(metrics: MetricEntity[]): Record<string, MetricEntity[]> {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric);
      return acc;
    }, {} as Record<string, MetricEntity[]>);
  }

  private calculateMetricTrends(metrics: MetricEntity[], groupBy: 'day' | 'week' | 'month'): Record<string, any> {
    const grouped = metrics.reduce((acc, metric) => {
      const key = this.getTimeKey(metric.timestamp, groupBy);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, MetricEntity[]>);

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
  }

  private calculateUserMetrics(events: EventEntity[]): Record<string, any> {
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
      userEngagement: this.categorizeUserEngagement(eventCounts),
    };
  }

  private calculatePerformanceMetrics(events: EventEntity[], metrics: MetricEntity[]): Record<string, any> {
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
      averageLoadTime: this.calculateAverageLoadTime(performanceEvents),
    };
  }

  private getTopEvents(eventsByType: Record<string, number>, limit: number): Array<{ type: string; count: number }> {
    return Object.entries(eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  private getKeyMetrics(metrics: MetricEntity[]): Array<{ name: string; value: string; change?: string }> {
    const metricsByName = this.groupMetricsByName(metrics);
    
    return Object.entries(metricsByName)
      .slice(0, 10) // Top 10 metrics
      .map(([name, metricList]) => {
        const latest = metricList[metricList.length - 1];
        return {
          name,
          value: latest.value.formatted,
          change: this.calculateMetricChange(metricList),
        };
      });
  }

  private getTimeKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'week':
        const week = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${week}`;
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString();
    }
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }

  private categorizeUserEngagement(eventCounts: number[]): Record<string, number> {
    const low = eventCounts.filter(count => count <= 5).length;
    const medium = eventCounts.filter(count => count > 5 && count <= 20).length;
    const high = eventCounts.filter(count => count > 20).length;

    return { low, medium, high };
  }

  private calculateAverageLoadTime(performanceEvents: EventEntity[]): number {
    const loadTimes = performanceEvents
      .map(e => e.getProperty<number>('loadTime'))
      .filter((time): time is number => typeof time === 'number');

    return loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;
  }

  private calculateMetricChange(metrics: MetricEntity[]): string | undefined {
    if (metrics.length < 2) return undefined;

    const first = metrics[0].value.raw;
    const last = metrics[metrics.length - 1].value.raw;
    
    if (first === 0) return undefined;
    
    const change = ((last - first) / first) * 100;
    const sign = change > 0 ? '+' : '';
    
    return `${sign}${change.toFixed(1)}%`;
  }

  private summarizeMetrics(metrics: MetricEntity[]): Record<string, any> {
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
  }

  private generateReportId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `report_${timestamp}_${random}`;
  }
}