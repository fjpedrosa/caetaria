import { MetricValue } from '../value-objects/metric-value';

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'rate';
export type AggregationType = 'sum' | 'average' | 'min' | 'max' | 'count' | 'unique_count';
export type TimeGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface MetricDimensions {
  readonly [key: string]: string | number | boolean;
}

export interface Metric {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: MetricType;
  readonly value: MetricValue;
  readonly dimensions: MetricDimensions;
  readonly timestamp: Date;
  readonly tags: string[];
  readonly source?: string;
  readonly aggregation?: AggregationType;
  readonly timeWindow?: {
    readonly start: Date;
    readonly end: Date;
    readonly granularity: TimeGranularity;
  };
}

// =============================================================================
// FUNCTIONAL METRIC OPERATIONS - Pure functions replacing MetricEntity class
// =============================================================================

/**
 * Get a dimension value from a metric
 */
export const getMetricDimension = (
  metric: Metric,
  key: string
): string | number | boolean | undefined => {
  return metric.dimensions[key];
};

/**
 * Check if metric has a specific dimension
 */
export const hasMetricDimension = (metric: Metric, key: string): boolean => {
  return key in metric.dimensions;
};

/**
 * Check if metric has a specific tag
 */
export const hasMetricTag = (metric: Metric, tag: string): boolean => {
  return metric.tags.includes(tag);
};

/**
 * Type predicates for metric types
 */
export const isCounterMetric = (metric: Metric): boolean => metric.type === 'counter';
export const isGaugeMetric = (metric: Metric): boolean => metric.type === 'gauge';
export const isHistogramMetric = (metric: Metric): boolean => metric.type === 'histogram';
export const isRateMetric = (metric: Metric): boolean => metric.type === 'rate';

/**
 * Check if metric is aggregated
 */
export const isAggregatedMetric = (metric: Metric): boolean => {
  return metric.aggregation !== undefined;
};

/**
 * Check if metric is within a time range
 */
export const isMetricInTimeRange = (metric: Metric, start: Date, end: Date): boolean => {
  return metric.timestamp >= start && metric.timestamp <= end;
};

/**
 * Check if metric matches given dimensions
 */
export const matchesMetricDimensions = (
  metric: Metric,
  dimensions: Partial<MetricDimensions>
): boolean => {
  return Object.entries(dimensions).every(([key, value]) =>
    metric.dimensions[key] === value
  );
};

/**
 * Check if metric has all specified tags
 */
export const matchesMetricTags = (metric: Metric, tags: string[]): boolean => {
  return tags.every(tag => hasMetricTag(metric, tag));
};

/**
 * Add a dimension to a metric (immutable)
 */
export const withMetricDimension = (
  metric: Metric,
  key: string,
  value: string | number | boolean
): Metric => ({
  ...metric,
  dimensions: {
    ...metric.dimensions,
    [key]: value,
  },
});

/**
 * Add multiple dimensions to a metric (immutable)
 */
export const withMetricDimensions = (
  metric: Metric,
  dimensions: MetricDimensions
): Metric => ({
  ...metric,
  dimensions: {
    ...metric.dimensions,
    ...dimensions,
  },
});

/**
 * Add a tag to a metric (immutable)
 */
export const withMetricTag = (metric: Metric, tag: string): Metric => {
  if (hasMetricTag(metric, tag)) {
    return metric;
  }

  return {
    ...metric,
    tags: [...metric.tags, tag],
  };
};

/**
 * Add multiple tags to a metric (immutable)
 */
export const withMetricTags = (metric: Metric, tags: string[]): Metric => {
  const newTags = tags.filter(tag => !hasMetricTag(metric, tag));
  if (newTags.length === 0) {
    return metric;
  }

  return {
    ...metric,
    tags: [...metric.tags, ...newTags],
  };
};

/**
 * Set the source of a metric (immutable)
 */
export const withMetricSource = (metric: Metric, source: string): Metric => ({
  ...metric,
  source,
});

/**
 * Convert metric to JSON representation
 */
export const metricToJSON = (metric: Metric): Record<string, any> => ({
  id: metric.id,
  name: metric.name,
  description: metric.description,
  type: metric.type,
  value: metric.value.toJSON(),
  dimensions: metric.dimensions,
  timestamp: metric.timestamp.toISOString(),
  tags: metric.tags,
  source: metric.source,
  aggregation: metric.aggregation,
  timeWindow: metric.timeWindow ? {
    start: metric.timeWindow.start.toISOString(),
    end: metric.timeWindow.end.toISOString(),
    granularity: metric.timeWindow.granularity,
  } : undefined,
});

/**
 * Create a new metric from data (factory function)
 */
export const createMetric = (data: {
  name: string;
  description: string;
  type: MetricType;
  value: MetricValue;
  dimensions?: MetricDimensions;
  tags?: string[];
  source?: string;
  aggregation?: AggregationType;
  timeWindow?: {
    start: Date;
    end: Date;
    granularity: TimeGranularity;
  };
}): Metric => {
  const now = new Date();
  const id = `metric_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name: data.name,
    description: data.description,
    type: data.type,
    value: data.value,
    dimensions: data.dimensions || {},
    timestamp: now,
    tags: data.tags || [],
    source: data.source,
    aggregation: data.aggregation,
    timeWindow: data.timeWindow,
  };
};

/**
 * Create metric from JSON data (deserializer function)
 */
export const metricFromJSON = (data: any): Metric => ({
  id: data.id,
  name: data.name,
  description: data.description,
  type: data.type,
  value: MetricValue.fromJSON(data.value),
  dimensions: data.dimensions || {},
  timestamp: new Date(data.timestamp),
  tags: data.tags || [],
  source: data.source,
  aggregation: data.aggregation,
  timeWindow: data.timeWindow ? {
    start: new Date(data.timeWindow.start),
    end: new Date(data.timeWindow.end),
    granularity: data.timeWindow.granularity,
  } : undefined,
});

// =============================================================================
// FUNCTIONAL COMPOSITION AND AGGREGATION HELPERS
// =============================================================================

/**
 * Transform a metric through multiple operations (functional composition)
 */
export const transformMetric = (
  metric: Metric,
  ...transformers: Array<(m: Metric) => Metric>
): Metric => {
  return transformers.reduce((acc, transformer) => transformer(acc), metric);
};

/**
 * Validate metric data (pure function)
 */
export const validateMetric = (metric: Metric): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!metric.id) errors.push('Metric ID is required');
  if (!metric.name) errors.push('Metric name is required');
  if (!metric.description) errors.push('Metric description is required');
  if (!['counter', 'gauge', 'histogram', 'rate'].includes(metric.type)) {
    errors.push('Invalid metric type');
  }
  if (!metric.value) errors.push('Metric value is required');
  if (!(metric.timestamp instanceof Date) || isNaN(metric.timestamp.getTime())) {
    errors.push('Valid timestamp is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Filter metrics by multiple criteria (pure function)
 */
export const filterMetrics = (
  metrics: Metric[],
  criteria: Partial<{
    type: MetricType;
    name: string;
    source: string;
    aggregation: AggregationType;
    dimensions: Partial<MetricDimensions>;
    tags: string[];
    timeRange: { start: Date; end: Date };
    isAggregated: boolean;
  }>
): Metric[] => {
  return metrics.filter(metric => {
    if (criteria.type && metric.type !== criteria.type) return false;
    if (criteria.name && metric.name !== criteria.name) return false;
    if (criteria.source && metric.source !== criteria.source) return false;
    if (criteria.aggregation && metric.aggregation !== criteria.aggregation) return false;
    if (criteria.dimensions && !matchesMetricDimensions(metric, criteria.dimensions)) return false;
    if (criteria.tags && !matchesMetricTags(metric, criteria.tags)) return false;
    if (criteria.timeRange && !isMetricInTimeRange(metric, criteria.timeRange.start, criteria.timeRange.end)) return false;
    if (criteria.isAggregated !== undefined && isAggregatedMetric(metric) !== criteria.isAggregated) return false;
    return true;
  });
};

/**
 * Group metrics by a key function
 */
export const groupMetrics = <K extends string | number>(
  metrics: Metric[],
  keyFn: (metric: Metric) => K
): Record<K, Metric[]> => {
  return metrics.reduce((acc, metric) => {
    const key = keyFn(metric);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(metric);
    return acc;
  }, {} as Record<K, Metric[]>);
};