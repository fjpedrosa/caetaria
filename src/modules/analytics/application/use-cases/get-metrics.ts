import { failure,Result, success } from '../../../shared/domain/value-objects/result';
import { AggregationType, Metric, TimeGranularity } from '../../domain/entities/metric';
import { MetricFilters,MetricsRepository } from '../ports/analytics-repository';

export interface GetMetricsRequest extends MetricFilters {
  sortBy?: 'name' | 'timestamp' | 'value';
  sortOrder?: 'asc' | 'desc';
}

export interface GetMetricsResponse {
  metrics: Metric[];
  totalCount: number;
  hasMore: boolean;
  aggregations?: Record<string, number>;
}

// Factory function for creating GetMetrics use case
export const createGetMetricsUseCase = (dependencies: {
  metricsRepository: MetricsRepository;
}) => {
  const { metricsRepository } = dependencies;

  const execute = async (request: GetMetricsRequest = {}): Promise<Result<GetMetricsResponse, Error>> => {
    try {
      const { sortBy, sortOrder, ...filters } = request;

      // Get metrics from repository
      const metrics = await metricsRepository.getMetrics(filters);

      // Sort metrics if requested
      const sortedMetrics = sortMetrics(metrics, sortBy, sortOrder);

      // Calculate aggregations for numeric metrics
      const aggregations = calculateAggregations(sortedMetrics);

      // Determine if there are more results
      const hasMore = filters.limit ? sortedMetrics.length >= filters.limit : false;

      return success({
        metrics: sortedMetrics,
        totalCount: sortedMetrics.length,
        hasMore,
        aggregations,
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to get metrics'));
    }
  };

  const sortMetrics = (
    metrics: Metric[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Metric[] => {
    if (!sortBy) {
      return metrics.sort((a, b) =>
        sortOrder === 'asc'
          ? a.timestamp.getTime() - b.timestamp.getTime()
          : b.timestamp.getTime() - a.timestamp.getTime()
      );
    }

    return metrics.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'value':
          comparison = a.value.raw - b.value.raw;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const calculateAggregations = (metrics: Metric[]): Record<string, number> => {
    if (metrics.length === 0) {
      return {};
    }

    const numericMetrics = metrics.filter(m =>
      m.value.isNumber() || m.value.isCount() || m.value.isDuration()
    );

    if (numericMetrics.length === 0) {
      return {};
    }

    const values = numericMetrics.map(m => m.value.raw);

    return {
      sum: values.reduce((acc, val) => acc + val, 0),
      average: values.reduce((acc, val) => acc + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type GetMetricsUseCase = ReturnType<typeof createGetMetricsUseCase>;

export interface GetMetricTrendRequest {
  name: string;
  granularity: TimeGranularity;
  startDate?: Date;
  endDate?: Date;
  dimensions?: Record<string, any>;
  tags?: string[];
}

export interface GetMetricTrendResponse {
  trend: Metric[];
  summary: {
    totalDataPoints: number;
    timeRange: {
      start: Date;
      end: Date;
    };
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    changePercentage: number;
  };
}

// Factory function for creating GetMetricTrend use case
export const createGetMetricTrendUseCase = (dependencies: {
  metricsRepository: MetricsRepository;
}) => {
  const { metricsRepository } = dependencies;

  const execute = async (request: GetMetricTrendRequest): Promise<Result<GetMetricTrendResponse, Error>> => {
    try {
      // Set default date range if not provided
      const endDate = request.endDate || new Date();
      const startDate = request.startDate || getDefaultStartDate(endDate, request.granularity);

      // Get trend data from repository
      const trend = await metricsRepository.getMetricTrend(request.name, request.granularity, {
        startDate,
        endDate,
        dimensions: request.dimensions,
        tags: request.tags,
      });

      if (trend.length === 0) {
        return failure(new Error(`No trend data found for metric: ${request.name}`));
      }

      // Analyze trend
      const trendAnalysis = analyzeTrend(trend);
      const changePercentage = calculateChangePercentage(trend);

      return success({
        trend,
        summary: {
          totalDataPoints: trend.length,
          timeRange: {
            start: startDate,
            end: endDate,
          },
          trend: trendAnalysis,
          changePercentage,
        },
      });
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to get metric trend'));
    }
  };

  const getDefaultStartDate = (endDate: Date, granularity: TimeGranularity): Date => {
    const start = new Date(endDate);

    switch (granularity) {
      case 'minute':
        start.setHours(start.getHours() - 1); // Last hour
        break;
      case 'hour':
        start.setDate(start.getDate() - 1); // Last day
        break;
      case 'day':
        start.setDate(start.getDate() - 30); // Last 30 days
        break;
      case 'week':
        start.setDate(start.getDate() - 84); // Last 12 weeks
        break;
      case 'month':
        start.setMonth(start.getMonth() - 12); // Last 12 months
        break;
    }

    return start;
  };

  const analyzeTrend = (metrics: Metric[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' => {
    if (metrics.length < 3) {
      return 'stable';
    }

    const values = metrics.map(m => m.value.raw);
    const changes = [];

    for (let i = 1; i < values.length; i++) {
      const change = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
      changes.push(change);
    }

    const avgChange = changes.reduce((acc, val) => acc + val, 0) / changes.length;
    const volatility = calculateVolatility(changes);

    // High volatility threshold
    if (volatility > 50) {
      return 'volatile';
    }

    // Trend thresholds
    if (avgChange > 5) {
      return 'increasing';
    } else if (avgChange < -5) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  };

  const calculateVolatility = (changes: number[]): number => {
    if (changes.length === 0) return 0;

    const mean = changes.reduce((acc, val) => acc + val, 0) / changes.length;
    const squaredDiffs = changes.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / changes.length;

    return Math.sqrt(variance);
  };

  const calculateChangePercentage = (metrics: Metric[]): number => {
    if (metrics.length < 2) {
      return 0;
    }

    const firstValue = metrics[0].value.raw;
    const lastValue = metrics[metrics.length - 1].value.raw;

    if (firstValue === 0) {
      return lastValue === 0 ? 0 : 100;
    }

    return ((lastValue - firstValue) / firstValue) * 100;
  };

  return {
    execute,
  };
};

// Export type for the use case factory
export type GetMetricTrendUseCase = ReturnType<typeof createGetMetricTrendUseCase>;