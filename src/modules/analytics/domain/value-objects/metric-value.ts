export type MetricDataType = 'number' | 'percentage' | 'duration' | 'bytes' | 'count' | 'rate';

export interface MetricValueData {
  readonly raw: number;
  readonly formatted: string;
  readonly unit?: string;
  readonly precision?: number;
}

export class MetricValue {
  constructor(
    public readonly data: MetricValueData,
    public readonly dataType: MetricDataType
  ) {
    if (typeof data.raw !== 'number' || !isFinite(data.raw)) {
      throw new Error('Metric value must be a finite number');
    }
  }

  get raw(): number {
    return this.data.raw;
  }

  get formatted(): string {
    return this.data.formatted;
  }

  get unit(): string | undefined {
    return this.data.unit;
  }

  get precision(): number {
    return this.data.precision ?? 2;
  }

  isZero(): boolean {
    return this.data.raw === 0;
  }

  isPositive(): boolean {
    return this.data.raw > 0;
  }

  isNegative(): boolean {
    return this.data.raw < 0;
  }

  isNumber(): boolean {
    return this.dataType === 'number';
  }

  isPercentage(): boolean {
    return this.dataType === 'percentage';
  }

  isDuration(): boolean {
    return this.dataType === 'duration';
  }

  isBytes(): boolean {
    return this.dataType === 'bytes';
  }

  isCount(): boolean {
    return this.dataType === 'count';
  }

  isRate(): boolean {
    return this.dataType === 'rate';
  }

  add(other: MetricValue): MetricValue {
    if (this.dataType !== other.dataType) {
      throw new Error(`Cannot add metrics of different types: ${this.dataType} vs ${other.dataType}`);
    }

    const newRaw = this.data.raw + other.data.raw;
    return MetricValue.create(newRaw, this.dataType, this.unit);
  }

  subtract(other: MetricValue): MetricValue {
    if (this.dataType !== other.dataType) {
      throw new Error(`Cannot subtract metrics of different types: ${this.dataType} vs ${other.dataType}`);
    }

    const newRaw = this.data.raw - other.data.raw;
    return MetricValue.create(newRaw, this.dataType, this.unit);
  }

  multiply(factor: number): MetricValue {
    if (typeof factor !== 'number' || !isFinite(factor)) {
      throw new Error('Multiplication factor must be a finite number');
    }

    const newRaw = this.data.raw * factor;
    return MetricValue.create(newRaw, this.dataType, this.unit);
  }

  divide(divisor: number): MetricValue {
    if (typeof divisor !== 'number' || !isFinite(divisor) || divisor === 0) {
      throw new Error('Division divisor must be a finite non-zero number');
    }

    const newRaw = this.data.raw / divisor;
    return MetricValue.create(newRaw, this.dataType, this.unit);
  }

  equals(other: MetricValue): boolean {
    return this.data.raw === other.data.raw &&
           this.dataType === other.dataType &&
           this.unit === other.unit;
  }

  compareTo(other: MetricValue): number {
    if (this.dataType !== other.dataType) {
      throw new Error(`Cannot compare metrics of different types: ${this.dataType} vs ${other.dataType}`);
    }

    if (this.data.raw < other.data.raw) return -1;
    if (this.data.raw > other.data.raw) return 1;
    return 0;
  }

  isGreaterThan(other: MetricValue): boolean {
    return this.compareTo(other) > 0;
  }

  isLessThan(other: MetricValue): boolean {
    return this.compareTo(other) < 0;
  }

  toJSON(): Record<string, any> {
    return {
      data: this.data,
      dataType: this.dataType,
    };
  }

  toString(): string {
    return this.data.formatted;
  }

  static create(
    value: number,
    dataType: MetricDataType,
    unit?: string,
    precision?: number
  ): MetricValue {
    const actualPrecision = precision ?? MetricValue.getDefaultPrecision(dataType);
    const formatted = MetricValue.formatValue(value, dataType, unit, actualPrecision);

    return new MetricValue(
      {
        raw: value,
        formatted,
        unit,
        precision: actualPrecision,
      },
      dataType
    );
  }

  static fromJSON(data: any): MetricValue {
    return new MetricValue(data.data, data.dataType);
  }

  private static getDefaultPrecision(dataType: MetricDataType): number {
    switch (dataType) {
      case 'number':
      case 'duration':
        return 2;
      case 'percentage':
        return 1;
      case 'bytes':
        return 0;
      case 'count':
        return 0;
      case 'rate':
        return 3;
      default:
        return 2;
    }
  }

  private static formatValue(
    value: number,
    dataType: MetricDataType,
    unit?: string,
    precision: number = 2
  ): string {
    switch (dataType) {
      case 'number':
        return unit ? `${value.toFixed(precision)} ${unit}` : value.toFixed(precision);

      case 'percentage':
        return `${value.toFixed(precision)}%`;

      case 'duration':
        return MetricValue.formatDuration(value);

      case 'bytes':
        return MetricValue.formatBytes(value);

      case 'count':
        return MetricValue.formatCount(value);

      case 'rate':
        return unit ? `${value.toFixed(precision)}/${unit}` : `${value.toFixed(precision)}/s`;

      default:
        return value.toString();
    }
  }

  private static formatDuration(milliseconds: number): string {
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
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  private static formatCount(count: number): string {
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
  }

  // Factory methods for common metric types
  static number(value: number, unit?: string, precision?: number): MetricValue {
    return MetricValue.create(value, 'number', unit, precision);
  }

  static percentage(value: number, precision: number = 1): MetricValue {
    return MetricValue.create(value, 'percentage', undefined, precision);
  }

  static duration(milliseconds: number): MetricValue {
    return MetricValue.create(milliseconds, 'duration');
  }

  static bytes(bytes: number): MetricValue {
    return MetricValue.create(bytes, 'bytes');
  }

  static count(count: number): MetricValue {
    return MetricValue.create(count, 'count');
  }

  static rate(value: number, unit: string = 's', precision: number = 3): MetricValue {
    return MetricValue.create(value, 'rate', unit, precision);
  }
}