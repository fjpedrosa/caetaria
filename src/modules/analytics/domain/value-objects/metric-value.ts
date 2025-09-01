// =============================================================================
// FUNCTIONAL METRIC VALUE IMPLEMENTATION - Clean Architecture Approach
// =============================================================================

export type MetricDataType = 'number' | 'percentage' | 'duration' | 'bytes' | 'count' | 'rate';

/**
 * Core MetricValue interface - immutable data structure
 */
export interface MetricValue {
  readonly data: MetricValueData;
  readonly dataType: MetricDataType;
}

/**
 * Internal data structure for metric values
 */
export interface MetricValueData {
  readonly raw: number;
  readonly formatted: string;
  readonly unit?: string;
  readonly precision?: number;
}

// =============================================================================
// PURE FUNCTIONS FOR METRIC VALUE OPERATIONS - Functional Implementation
// =============================================================================

/**
 * Validation function for raw metric values
 */
export const validateMetricValue = (value: number): boolean => {
  return typeof value === 'number' && isFinite(value);
};

/**
 * Get default precision for a metric data type
 */
export const getDefaultPrecision = (dataType: MetricDataType): number => {
  switch (dataType) {
    case 'number':
    case 'duration':
      return 2;
    case 'percentage':
      return 1;
    case 'bytes':
    case 'count':
      return 0;
    case 'rate':
      return 3;
    default:
      return 2;
  }
};

/**
 * Format duration in milliseconds to human-readable string
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(0)}ms`;
  }

  if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }

  if (milliseconds < 3600000) {
    return `${(milliseconds / 60000).toFixed(1)}m`;
  }

  return `${(milliseconds / 3600000).toFixed(1)}h`;
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

/**
 * Format count with K/M/B suffixes
 */
export const formatCount = (count: number): string => {
  if (Math.abs(count) < 1000) {
    return count.toFixed(0);
  }

  if (Math.abs(count) < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  if (Math.abs(count) < 1000000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  return `${(count / 1000000000).toFixed(1)}B`;
};

/**
 * Format metric value based on data type
 */
export const formatMetricValue = (
  value: number,
  dataType: MetricDataType,
  unit?: string,
  precision: number = 2
): string => {
  switch (dataType) {
    case 'number':
      return unit ? `${value.toFixed(precision)} ${unit}` : value.toFixed(precision);

    case 'percentage':
      return `${value.toFixed(precision)}%`;

    case 'duration':
      return formatDuration(value);

    case 'bytes':
      return formatBytes(value);

    case 'count':
      return formatCount(value);

    case 'rate':
      return unit ? `${value.toFixed(precision)}/${unit}` : `${value.toFixed(precision)}/s`;

    default:
      return value.toString();
  }
};

// =============================================================================
// FACTORY FUNCTIONS - Pure functions for creating MetricValue instances
// =============================================================================

/**
 * Create a MetricValue from raw data (main factory function)
 */
export const createMetricValue = (
  value: number,
  dataType: MetricDataType,
  unit?: string,
  precision?: number
): MetricValueInterface => {
  if (!validateMetricValue(value)) {
    throw new Error('Metric value must be a finite number');
  }

  const actualPrecision = precision ?? getDefaultPrecision(dataType);
  const formatted = formatMetricValue(value, dataType, unit, actualPrecision);

  return {
    data: {
      raw: value,
      formatted,
      unit,
      precision: actualPrecision,
    },
    dataType,
  };
};

/**
 * Create a number metric
 */
export const createNumberMetric = (
  value: number,
  unit?: string,
  precision?: number
): MetricValueInterface => {
  return createMetricValue(value, 'number', unit, precision);
};

/**
 * Create a percentage metric
 */
export const createPercentageMetric = (
  value: number,
  precision: number = 1
): MetricValueInterface => {
  return createMetricValue(value, 'percentage', undefined, precision);
};

/**
 * Create a duration metric
 */
export const createDurationMetric = (milliseconds: number): MetricValueInterface => {
  return createMetricValue(milliseconds, 'duration');
};

/**
 * Create a bytes metric
 */
export const createBytesMetric = (bytes: number): MetricValueInterface => {
  return createMetricValue(bytes, 'bytes');
};

/**
 * Create a count metric
 */
export const createCountMetric = (count: number): MetricValueInterface => {
  return createMetricValue(count, 'count');
};

/**
 * Create a rate metric
 */
export const createRateMetric = (
  value: number,
  unit: string = 's',
  precision: number = 3
): MetricValueInterface => {
  return createMetricValue(value, 'rate', unit, precision);
};

// =============================================================================
// ACCESSOR FUNCTIONS - Pure functions for extracting data
// =============================================================================

/**
 * Get raw numeric value from MetricValue
 */
export const getMetricRawValue = (metric: MetricValueInterface): number => {
  return metric.data.raw;
};

/**
 * Get formatted string from MetricValue
 */
export const getMetricFormattedValue = (metric: MetricValueInterface): string => {
  return metric.data.formatted;
};

/**
 * Get unit from MetricValue
 */
export const getMetricUnit = (metric: MetricValueInterface): string | undefined => {
  return metric.data.unit;
};

/**
 * Get precision from MetricValue
 */
export const getMetricPrecision = (metric: MetricValueInterface): number => {
  return metric.data.precision ?? 2;
};

// =============================================================================
// TYPE PREDICATE FUNCTIONS - Pure functions for type checking
// =============================================================================

/**
 * Check if metric value is zero
 */
export const isMetricZero = (metric: MetricValueInterface): boolean => {
  return metric.data.raw === 0;
};

/**
 * Check if metric value is positive
 */
export const isMetricPositive = (metric: MetricValueInterface): boolean => {
  return metric.data.raw > 0;
};

/**
 * Check if metric value is negative
 */
export const isMetricNegative = (metric: MetricValueInterface): boolean => {
  return metric.data.raw < 0;
};

/**
 * Check if metric is a number type
 */
export const isNumberMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'number';
};

/**
 * Check if metric is a percentage type
 */
export const isPercentageMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'percentage';
};

/**
 * Check if metric is a duration type
 */
export const isDurationMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'duration';
};

/**
 * Check if metric is a bytes type
 */
export const isBytesMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'bytes';
};

/**
 * Check if metric is a count type
 */
export const isCountMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'count';
};

/**
 * Check if metric is a rate type
 */
export const isRateMetric = (metric: MetricValueInterface): boolean => {
  return metric.dataType === 'rate';
};

// =============================================================================
// ARITHMETIC OPERATIONS - Pure functions for mathematical operations
// =============================================================================

/**
 * Add two MetricValue instances (returns new instance)
 */
export const addMetricValues = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): MetricValueInterface => {
  if (metric1.dataType !== metric2.dataType) {
    throw new Error(
      `Cannot add metrics of different types: ${metric1.dataType} vs ${metric2.dataType}`
    );
  }

  const newRaw = metric1.data.raw + metric2.data.raw;
  return createMetricValue(newRaw, metric1.dataType, metric1.data.unit);
};

/**
 * Subtract two MetricValue instances (returns new instance)
 */
export const subtractMetricValues = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): MetricValueInterface => {
  if (metric1.dataType !== metric2.dataType) {
    throw new Error(
      `Cannot subtract metrics of different types: ${metric1.dataType} vs ${metric2.dataType}`
    );
  }

  const newRaw = metric1.data.raw - metric2.data.raw;
  return createMetricValue(newRaw, metric1.dataType, metric1.data.unit);
};

/**
 * Multiply MetricValue by a factor (returns new instance)
 */
export const multiplyMetricValue = (
  metric: MetricValueInterface,
  factor: number
): MetricValueInterface => {
  if (!validateMetricValue(factor)) {
    throw new Error('Multiplication factor must be a finite number');
  }

  const newRaw = metric.data.raw * factor;
  return createMetricValue(newRaw, metric.dataType, metric.data.unit);
};

/**
 * Divide MetricValue by a divisor (returns new instance)
 */
export const divideMetricValue = (
  metric: MetricValueInterface,
  divisor: number
): MetricValueInterface => {
  if (!validateMetricValue(divisor) || divisor === 0) {
    throw new Error('Division divisor must be a finite non-zero number');
  }

  const newRaw = metric.data.raw / divisor;
  return createMetricValue(newRaw, metric.dataType, metric.data.unit);
};

// =============================================================================
// COMPARISON FUNCTIONS - Pure functions for comparing MetricValue instances
// =============================================================================

/**
 * Check if two MetricValue instances are equal
 */
export const areMetricValuesEqual = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): boolean => {
  return (
    metric1.data.raw === metric2.data.raw &&
    metric1.dataType === metric2.dataType &&
    metric1.data.unit === metric2.data.unit
  );
};

/**
 * Compare two MetricValue instances (-1, 0, 1)
 */
export const compareMetricValues = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): number => {
  if (metric1.dataType !== metric2.dataType) {
    throw new Error(
      `Cannot compare metrics of different types: ${metric1.dataType} vs ${metric2.dataType}`
    );
  }

  if (metric1.data.raw < metric2.data.raw) return -1;
  if (metric1.data.raw > metric2.data.raw) return 1;
  return 0;
};

/**
 * Check if first metric is greater than second
 */
export const isMetricGreaterThan = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): boolean => {
  return compareMetricValues(metric1, metric2) > 0;
};

/**
 * Check if first metric is less than second
 */
export const isMetricLessThan = (
  metric1: MetricValueInterface,
  metric2: MetricValueInterface
): boolean => {
  return compareMetricValues(metric1, metric2) < 0;
};

// =============================================================================
// SERIALIZATION FUNCTIONS - Pure functions for data conversion
// =============================================================================

/**
 * Convert MetricValue to JSON representation
 */
export const metricValueToJSON = (metric: MetricValueInterface): Record<string, any> => {
  return {
    data: metric.data,
    dataType: metric.dataType,
  };
};

/**
 * Create MetricValue from JSON data
 */
export const metricValueFromJSON = (data: any): MetricValueInterface => {
  if (!data.data || !data.dataType) {
    throw new Error('Invalid JSON data for MetricValue');
  }

  return {
    data: data.data,
    dataType: data.dataType,
  };
};

/**
 * Convert MetricValue to string representation
 */
export const metricValueToString = (metric: MetricValueInterface): string => {
  return metric.data.formatted;
};

// =============================================================================
// BACKWARD COMPATIBILITY WRAPPER - Deprecated Class (For Migration Period)
// =============================================================================

/**
 * @deprecated Use functional implementation instead
 *
 * This class provides backward compatibility with existing code.
 * It wraps the functional implementation to maintain the same API.
 *
 * Migration guide:
 * - Replace `new MetricValue(data, type)` with `createMetricValue(value, type, unit, precision)`
 * - Replace `MetricValue.create()` with `createMetricValue()`
 * - Replace `metric.add(other)` with `addMetricValues(metric, other)`
 * - Replace `metric.isZero()` with `isMetricZero(metric)`
 * - Replace `metric.raw` with `getMetricRawValue(metric)`
 * - Replace `metric.formatted` with `getMetricFormattedValue(metric)`
 */
export class MetricValueClass {
  private readonly _metricValue: MetricValueInterface;

  constructor(data: MetricValueData, dataType: MetricDataType) {
    if (!validateMetricValue(data.raw)) {
      throw new Error('Metric value must be a finite number');
    }

    this._metricValue = {
      data,
      dataType,
    };
  }

  get raw(): number {
    return getMetricRawValue(this._metricValue);
  }

  get formatted(): string {
    return getMetricFormattedValue(this._metricValue);
  }

  get unit(): string | undefined {
    return getMetricUnit(this._metricValue);
  }

  get precision(): number {
    return getMetricPrecision(this._metricValue);
  }

  isZero(): boolean {
    return isMetricZero(this._metricValue);
  }

  isPositive(): boolean {
    return isMetricPositive(this._metricValue);
  }

  isNegative(): boolean {
    return isMetricNegative(this._metricValue);
  }

  isNumber(): boolean {
    return isNumberMetric(this._metricValue);
  }

  isPercentage(): boolean {
    return isPercentageMetric(this._metricValue);
  }

  isDuration(): boolean {
    return isDurationMetric(this._metricValue);
  }

  isBytes(): boolean {
    return isBytesMetric(this._metricValue);
  }

  isCount(): boolean {
    return isCountMetric(this._metricValue);
  }

  isRate(): boolean {
    return isRateMetric(this._metricValue);
  }

  add(other: MetricValueClass): MetricValueClass {
    const result = addMetricValues(this._metricValue, other._metricValue);
    return new MetricValueClass(result.data, result.dataType);
  }

  subtract(other: MetricValueClass): MetricValueClass {
    const result = subtractMetricValues(this._metricValue, other._metricValue);
    return new MetricValueClass(result.data, result.dataType);
  }

  multiply(factor: number): MetricValueClass {
    const result = multiplyMetricValue(this._metricValue, factor);
    return new MetricValueClass(result.data, result.dataType);
  }

  divide(divisor: number): MetricValueClass {
    const result = divideMetricValue(this._metricValue, divisor);
    return new MetricValueClass(result.data, result.dataType);
  }

  equals(other: MetricValueClass): boolean {
    return areMetricValuesEqual(this._metricValue, other._metricValue);
  }

  compareTo(other: MetricValueClass): number {
    return compareMetricValues(this._metricValue, other._metricValue);
  }

  isGreaterThan(other: MetricValueClass): boolean {
    return isMetricGreaterThan(this._metricValue, other._metricValue);
  }

  isLessThan(other: MetricValueClass): boolean {
    return isMetricLessThan(this._metricValue, other._metricValue);
  }

  toJSON(): Record<string, any> {
    return metricValueToJSON(this._metricValue);
  }

  toString(): string {
    return metricValueToString(this._metricValue);
  }

  static create(
    value: number,
    dataType: MetricDataType,
    unit?: string,
    precision?: number
  ): MetricValueClass {
    const metricValue = createMetricValue(value, dataType, unit, precision);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static fromJSON(data: any): MetricValueClass {
    const metricValue = metricValueFromJSON(data);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  // Factory methods for common metric types
  static number(value: number, unit?: string, precision?: number): MetricValueClass {
    const metricValue = createNumberMetric(value, unit, precision);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static percentage(value: number, precision: number = 1): MetricValueClass {
    const metricValue = createPercentageMetric(value, precision);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static duration(milliseconds: number): MetricValueClass {
    const metricValue = createDurationMetric(milliseconds);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static bytes(bytes: number): MetricValueClass {
    const metricValue = createBytesMetric(bytes);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static count(count: number): MetricValueClass {
    const metricValue = createCountMetric(count);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  static rate(value: number, unit: string = 's', precision: number = 3): MetricValueClass {
    const metricValue = createRateMetric(value, unit, precision);
    return new MetricValueClass(metricValue.data, metricValue.dataType);
  }

  /**
   * Get the internal functional MetricValue (for migration purposes)
   */
  get functionalValue(): MetricValueInterface {
    return this._metricValue;
  }
}

// Export the class as the original name for backward compatibility
// This maintains existing imports while allowing migration
export { MetricValueClass as MetricValue };