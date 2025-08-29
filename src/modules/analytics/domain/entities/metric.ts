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

export class MetricEntity {
  constructor(private readonly metric: Metric) {}

  get id(): string {
    return this.metric.id;
  }

  get name(): string {
    return this.metric.name;
  }

  get description(): string {
    return this.metric.description;
  }

  get type(): MetricType {
    return this.metric.type;
  }

  get value(): MetricValue {
    return this.metric.value;
  }

  get dimensions(): MetricDimensions {
    return { ...this.metric.dimensions };
  }

  get timestamp(): Date {
    return this.metric.timestamp;
  }

  get tags(): string[] {
    return [...this.metric.tags];
  }

  get source(): string | undefined {
    return this.metric.source;
  }

  get aggregation(): AggregationType | undefined {
    return this.metric.aggregation;
  }

  get timeWindow(): Metric['timeWindow'] {
    return this.metric.timeWindow ? { ...this.metric.timeWindow } : undefined;
  }

  getDimension(key: string): string | number | boolean | undefined {
    return this.metric.dimensions[key];
  }

  hasDimension(key: string): boolean {
    return key in this.metric.dimensions;
  }

  hasTag(tag: string): boolean {
    return this.metric.tags.includes(tag);
  }

  isCounter(): boolean {
    return this.metric.type === 'counter';
  }

  isGauge(): boolean {
    return this.metric.type === 'gauge';
  }

  isHistogram(): boolean {
    return this.metric.type === 'histogram';
  }

  isRate(): boolean {
    return this.metric.type === 'rate';
  }

  isAggregated(): boolean {
    return this.metric.aggregation !== undefined;
  }

  isInTimeRange(start: Date, end: Date): boolean {
    return this.metric.timestamp >= start && this.metric.timestamp <= end;
  }

  matchesDimensions(dimensions: Partial<MetricDimensions>): boolean {
    return Object.entries(dimensions).every(([key, value]) => 
      this.metric.dimensions[key] === value
    );
  }

  matchesTags(tags: string[]): boolean {
    return tags.every(tag => this.hasTag(tag));
  }

  withDimension(key: string, value: string | number | boolean): MetricEntity {
    return new MetricEntity({
      ...this.metric,
      dimensions: {
        ...this.metric.dimensions,
        [key]: value,
      },
    });
  }

  withDimensions(dimensions: MetricDimensions): MetricEntity {
    return new MetricEntity({
      ...this.metric,
      dimensions: {
        ...this.metric.dimensions,
        ...dimensions,
      },
    });
  }

  withTag(tag: string): MetricEntity {
    if (this.hasTag(tag)) {
      return this;
    }

    return new MetricEntity({
      ...this.metric,
      tags: [...this.metric.tags, tag],
    });
  }

  withTags(tags: string[]): MetricEntity {
    const newTags = tags.filter(tag => !this.hasTag(tag));
    if (newTags.length === 0) {
      return this;
    }

    return new MetricEntity({
      ...this.metric,
      tags: [...this.metric.tags, ...newTags],
    });
  }

  withSource(source: string): MetricEntity {
    return new MetricEntity({
      ...this.metric,
      source,
    });
  }

  toJSON(): Record<string, any> {
    return {
      id: this.metric.id,
      name: this.metric.name,
      description: this.metric.description,
      type: this.metric.type,
      value: this.metric.value.toJSON(),
      dimensions: this.metric.dimensions,
      timestamp: this.metric.timestamp.toISOString(),
      tags: this.metric.tags,
      source: this.metric.source,
      aggregation: this.metric.aggregation,
      timeWindow: this.metric.timeWindow ? {
        start: this.metric.timeWindow.start.toISOString(),
        end: this.metric.timeWindow.end.toISOString(),
        granularity: this.metric.timeWindow.granularity,
      } : undefined,
    };
  }

  static create(data: {
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
  }): MetricEntity {
    const now = new Date();
    const id = `metric_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

    return new MetricEntity({
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
    });
  }

  static fromJSON(data: any): MetricEntity {
    return new MetricEntity({
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
  }
}