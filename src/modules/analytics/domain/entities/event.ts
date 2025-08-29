import { EventType } from '../value-objects/event-type';

export interface EventProperties {
  readonly [key: string]: string | number | boolean | Date | null;
}

export interface Event {
  readonly id: string;
  readonly type: EventType;
  readonly name: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly properties: EventProperties;
  readonly metadata: {
    readonly userAgent?: string;
    readonly ipAddress?: string;
    readonly referrer?: string;
    readonly url?: string;
    readonly deviceType?: 'desktop' | 'mobile' | 'tablet';
    readonly browser?: string;
    readonly os?: string;
    readonly country?: string;
    readonly region?: string;
  };
  readonly timestamp: Date;
  readonly processed: boolean;
}

export class EventEntity {
  constructor(private readonly event: Event) {}

  get id(): string {
    return this.event.id;
  }

  get type(): EventType {
    return this.event.type;
  }

  get name(): string {
    return this.event.name;
  }

  get userId(): string | undefined {
    return this.event.userId;
  }

  get sessionId(): string | undefined {
    return this.event.sessionId;
  }

  get properties(): EventProperties {
    return { ...this.event.properties };
  }

  get metadata(): Event['metadata'] {
    return { ...this.event.metadata };
  }

  get timestamp(): Date {
    return this.event.timestamp;
  }

  get processed(): boolean {
    return this.event.processed;
  }

  getProperty<T = any>(key: string): T | undefined {
    return this.event.properties[key] as T;
  }

  hasProperty(key: string): boolean {
    return key in this.event.properties;
  }

  isPageView(): boolean {
    return this.event.type.isPageView();
  }

  isUserAction(): boolean {
    return this.event.type.isUserAction();
  }

  isConversion(): boolean {
    return this.event.type.isConversion();
  }

  isSystemEvent(): boolean {
    return this.event.type.isSystem();
  }

  getAge(): number {
    return Date.now() - this.event.timestamp.getTime();
  }

  isRecent(thresholdMs: number = 300000): boolean { // 5 minutes default
    return this.getAge() < thresholdMs;
  }

  withUserId(userId: string): EventEntity {
    return new EventEntity({
      ...this.event,
      userId,
    });
  }

  withSessionId(sessionId: string): EventEntity {
    return new EventEntity({
      ...this.event,
      sessionId,
    });
  }

  addProperty(key: string, value: string | number | boolean | Date | null): EventEntity {
    return new EventEntity({
      ...this.event,
      properties: {
        ...this.event.properties,
        [key]: value,
      },
    });
  }

  addProperties(properties: EventProperties): EventEntity {
    return new EventEntity({
      ...this.event,
      properties: {
        ...this.event.properties,
        ...properties,
      },
    });
  }

  markAsProcessed(): EventEntity {
    return new EventEntity({
      ...this.event,
      processed: true,
    });
  }

  toJSON(): Record<string, any> {
    return {
      id: this.event.id,
      type: this.event.type.value,
      name: this.event.name,
      userId: this.event.userId,
      sessionId: this.event.sessionId,
      properties: this.event.properties,
      metadata: this.event.metadata,
      timestamp: this.event.timestamp.toISOString(),
      processed: this.event.processed,
    };
  }

  static create(data: {
    type: EventType;
    name: string;
    userId?: string;
    sessionId?: string;
    properties?: EventProperties;
    metadata?: Partial<Event['metadata']>;
  }): EventEntity {
    const now = new Date();
    const id = `evt_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

    return new EventEntity({
      id,
      type: data.type,
      name: data.name,
      userId: data.userId,
      sessionId: data.sessionId,
      properties: data.properties || {},
      metadata: data.metadata || {},
      timestamp: now,
      processed: false,
    });
  }

  static fromJSON(data: any): EventEntity {
    return new EventEntity({
      id: data.id,
      type: EventType.fromValue(data.type),
      name: data.name,
      userId: data.userId,
      sessionId: data.sessionId,
      properties: data.properties || {},
      metadata: data.metadata || {},
      timestamp: new Date(data.timestamp),
      processed: data.processed || false,
    });
  }
}