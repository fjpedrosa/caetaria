import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { AnalyticsRepository,EventFilters } from '../../application/ports/analytics-repository';
import { Event } from '../../domain/entities/event';
import { EventTypeInterface } from '../../domain/value-objects/event-type';

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveEvent(event: Event): Promise<Event> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(this.transformEventForStorage(event))
      .select('*')
      .single();

    if (error) throw new Error(`Event save failed: ${error.message}`);
    return this.transformStoredEventToDomain(data);
  }

  async saveEvents(events: Event[]): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from('events')
      .insert(events.map(this.transformEventForStorage))
      .select('*');

    if (error) throw new Error(`Batch event save failed: ${error.message}`);
    return data.map(this.transformStoredEventToDomain);
  }

  async getEvents(filters: EventFilters): Promise<Event[]> {
    let query = this.supabase.from('events').select('*');

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.sessionId) query = query.eq('session_id', filters.sessionId);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.eventTypes) {
      query = query.in('type', filters.eventTypes.map(et => et.value));
    }
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit);

    const { data, error } = await query;

    if (error) throw new Error(`Event retrieval failed: ${error.message}`);
    return data.map(this.transformStoredEventToDomain);
  }

  async createABTest(config: {
    name: string;
    variants: Array<{ id: string; name: string; weight: number }>;
    conversionGoal: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    const { data, error } = await this.supabase
      .from('ab_tests')
      .insert({
        name: config.name,
        variants: JSON.stringify(config.variants),
        conversion_goal: config.conversionGoal,
        start_date: config.startDate?.toISOString(),
        end_date: config.endDate?.toISOString(),
        status: 'running'
      })
      .select('id')
      .single();

    if (error) throw new Error(`A/B Test creation failed: ${error.message}`);
    return data.id;
  }

  async recordABTestVariantView(params: {
    testId: string;
    variantId: string;
    userId?: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('ab_test_events')
      .insert({
        test_id: params.testId,
        variant_id: params.variantId,
        user_id: params.userId,
        event_type: 'view'
      });

    if (error) throw new Error(`A/B Test variant view record failed: ${error.message}`);
  }

  async recordABTestConversion(params: {
    testId: string;
    variantId: string;
    userId?: string;
    conversionValue?: number;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('ab_test_events')
      .insert({
        test_id: params.testId,
        variant_id: params.variantId,
        user_id: params.userId,
        event_type: 'conversion',
        conversion_value: params.conversionValue
      });

    if (error) throw new Error(`A/B Test conversion record failed: ${error.message}`);
  }

  async calculateABTestResults(testId: string): Promise<{
    variantId: string;
    conversionRate: number;
    statisticalSignificance: 'high' | 'medium' | 'low' | 'inconclusive';
  }[]> {
    const { data, error } = await this.supabase.rpc('calculate_ab_test_results', { test_id: testId });

    if (error) throw new Error(`A/B Test results calculation failed: ${error.message}`);
    return data;
  }

  async trackPerformanceMetric(metric: {
    name: string;
    category: 'core_web_vital' | 'custom';
    value: number;
    timestamp?: Date;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('performance_metrics')
      .insert({
        name: metric.name,
        category: metric.category,
        value: metric.value,
        timestamp: (metric.timestamp || new Date()).toISOString(),
        metadata: JSON.stringify(metric.metadata || {})
      });

    if (error) throw new Error(`Performance metric tracking failed: ${error.message}`);
  }

  async trackFunnelEntry(params: {
    funnelId: string;
    stepName: string;
    userId?: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('funnel_tracking')
      .insert({
        funnel_id: params.funnelId,
        step_name: params.stepName,
        user_id: params.userId,
        properties: JSON.stringify(params.properties || {})
      });

    if (error) throw new Error(`Funnel entry tracking failed: ${error.message}`);
  }

  async trackFunnelProgression(params: {
    funnelId: string;
    fromStep: string;
    toStep: string;
    userId?: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('funnel_tracking')
      .insert({
        funnel_id: params.funnelId,
        from_step: params.fromStep,
        to_step: params.toStep,
        user_id: params.userId,
        properties: JSON.stringify(params.properties || {})
      });

    if (error) throw new Error(`Funnel progression tracking failed: ${error.message}`);
  }

  async trackUserRetention(params: {
    userId: string;
    feature?: string;
    duration?: number;
    properties?: Record<string, any>;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('user_retention')
      .insert({
        user_id: params.userId,
        feature: params.feature,
        duration: params.duration,
        properties: JSON.stringify(params.properties || {})
      });

    if (error) throw new Error(`User retention tracking failed: ${error.message}`);
  }

  // Other mandated methods
  async deleteEvents(filters: EventFilters): Promise<number> {
    let query = this.supabase.from('events').delete();

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.sessionId) query = query.eq('session_id', filters.sessionId);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.eventTypes) {
      query = query.in('type', filters.eventTypes.map(et => et.value));
    }

    const { count, error } = await query;

    if (error) throw new Error(`Event deletion failed: ${error.message}`);
    return count || 0;
  }

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Event retrieval failed: ${error.message}`);
    return data ? this.transformStoredEventToDomain(data) : null;
  }

  async getEventCount(filters: Omit<EventFilters, 'limit' | 'offset'>): Promise<number> {
    let query = this.supabase.from('events').select('id', { count: 'exact' });

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.sessionId) query = query.eq('session_id', filters.sessionId);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.eventTypes) {
      query = query.in('type', filters.eventTypes.map(et => et.value));
    }

    const { count, error } = await query;

    if (error) throw new Error(`Event count retrieval failed: ${error.message}`);
    return count || 0;
  }

  async getUniqueUsers(filters: Omit<EventFilters, 'userId'>): Promise<string[]> {
    let query = this.supabase.from('events').select('user_id', { distinct: true });

    if (filters.sessionId) query = query.eq('session_id', filters.sessionId);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.eventTypes) {
      query = query.in('type', filters.eventTypes.map(et => et.value));
    }

    const { data, error } = await query;

    if (error) throw new Error(`Unique users retrieval failed: ${error.message}`);
    return data.map(row => row.user_id).filter(Boolean);
  }

  async getUniqueSessions(filters: EventFilters): Promise<string[]> {
    let query = this.supabase.from('events').select('session_id', { distinct: true });

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.startDate) query = query.gte('timestamp', filters.startDate.toISOString());
    if (filters.endDate) query = query.lte('timestamp', filters.endDate.toISOString());
    if (filters.eventTypes) {
      query = query.in('type', filters.eventTypes.map(et => et.value));
    }

    const { data, error } = await query;

    if (error) throw new Error(`Unique sessions retrieval failed: ${error.message}`);
    return data.map(row => row.session_id).filter(Boolean);
  }

  async getEventsByType(filters: EventFilters): Promise<Record<string, Event[]>> {
    const events = await this.getEvents(filters);
    const groupedEvents = events.reduce((acc, event) => {
      const type = event.type.value;
      if (!acc[type]) acc[type] = [];
      acc[type].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    return groupedEvents;
  }

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Event deletion failed: ${error.message}`);
  }

  private transformEventForStorage(event: Event): any {
    return {
      id: event.id,
      type: event.type.value,
      name: event.name,
      user_id: event.userId,
      session_id: event.sessionId,
      properties: JSON.stringify(event.properties),
      metadata: JSON.stringify(event.metadata),
      timestamp: event.timestamp.toISOString(),
      processed: event.processed
    };
  }

  private transformStoredEventToDomain(storedEvent: any): Event {
    return {
      id: storedEvent.id,
      type: { value: storedEvent.type } as EventTypeInterface,
      name: storedEvent.name,
      userId: storedEvent.user_id,
      sessionId: storedEvent.session_id,
      properties: JSON.parse(storedEvent.properties || '{}'),
      metadata: JSON.parse(storedEvent.metadata || '{}'),
      timestamp: new Date(storedEvent.timestamp),
      processed: storedEvent.processed
    };
  }
}