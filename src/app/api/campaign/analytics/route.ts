/**
 * Campaign Analytics API Route
 * Handles campaign performance data and attribution analytics
 */

import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign = searchParams.get('campaign');
    const timeRange = searchParams.get('timeRange') || '7d';
    const variant = searchParams.get('variant');

    const supabase = createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Build query conditions
    let queryConditions = `created_at >= '${startDate.toISOString()}'`;
    if (campaign) {
      queryConditions += ` AND utm_campaign = '${campaign}'`;
    }
    if (variant) {
      queryConditions += ` AND campaign_variant = '${variant}'`;
    }

    // Get campaign events
    const { data: events, error: eventsError } = await supabase
      .from('campaign_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (eventsError) {
      throw eventsError;
    }

    // Get lead data with campaign attribution
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        *,
        attribution_data,
        lead_score,
        campaign_variant
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (leadsError) {
      throw leadsError;
    }

    // Process analytics data
    const analytics = {
      overview: {
        totalVisitors: events?.filter(e => e.event_name === 'campaign_page_view').length || 0,
        totalLeads: leads?.length || 0,
        conversionRate: leads?.length && events?.length
          ? ((leads.length / events.filter(e => e.event_name === 'campaign_page_view').length) * 100)
          : 0,
        averageLeadScore: leads?.length
          ? (leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leads.length)
          : 0,
      },

      attribution: {
        sources: processAttributionData(events, leads),
        channels: processChannelData(events, leads),
        touchpoints: processTouchpointData(events),
      },

      funnel: {
        steps: processFunnelData(events),
      },

      variants: variant ? {} : processVariantData(events, leads),

      leadScoring: {
        distribution: processLeadScoringData(leads),
        averageBySource: processLeadScoringBySource(leads),
      },

      timeData: processTimeSeriesData(events, leads, startDate, endDate),
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      meta: {
        timeRange,
        campaign,
        variant,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataPoints: events?.length || 0,
      }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to retrieve campaign analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventName,
      properties,
      campaignData,
      sessionId,
      leadScore
    } = body;

    const supabase = createClient();

    // Store campaign event
    const { data, error } = await supabase
      .from('campaign_events')
      .insert({
        event_name: eventName,
        event_properties: properties,
        campaign_data: campaignData,
        session_id: sessionId,
        lead_score: leadScore,
        utm_source: campaignData.utm_source,
        utm_medium: campaignData.utm_medium,
        utm_campaign: campaignData.utm_campaign,
        utm_content: campaignData.utm_content,
        campaign_variant: campaignData.variant,
        industry: campaignData.industry,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update lead score if this is a lead scoring event
    if (leadScore && sessionId) {
      await updateLeadScore(supabase, sessionId, leadScore, eventName);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Campaign event tracked successfully'
    });

  } catch (error) {
    console.error('Campaign tracking error:', error);

    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to track campaign event',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// Helper functions
function processAttributionData(events: any[], leads: any[]) {
  const attribution = new Map();

  leads.forEach(lead => {
    const source = lead.attribution_data?.utm_source || 'direct';
    const medium = lead.attribution_data?.utm_medium || 'organic';
    const campaign = lead.attribution_data?.utm_campaign || 'unknown';

    const key = `${source}-${medium}-${campaign}`;

    if (!attribution.has(key)) {
      attribution.set(key, {
        source,
        medium,
        campaign,
        leads: 0,
        conversions: 0,
        totalLeadScore: 0,
      });
    }

    const data = attribution.get(key);
    data.leads++;
    data.totalLeadScore += lead.lead_score || 0;

    if (lead.status === 'converted' || lead.onboarding_status === 'completed') {
      data.conversions++;
    }
  });

  return Array.from(attribution.values()).map(item => ({
    ...item,
    averageLeadScore: item.totalLeadScore / item.leads,
    conversionRate: (item.conversions / item.leads) * 100,
  }));
}

function processChannelData(events: any[], leads: any[]) {
  const channels = new Map();

  events.forEach(event => {
    const source = event.utm_source || 'direct';

    if (!channels.has(source)) {
      channels.set(source, {
        source,
        pageViews: 0,
        uniqueSessions: new Set(),
        leads: 0,
        avgTimeOnSite: 0,
      });
    }

    const data = channels.get(source);

    if (event.event_name === 'campaign_page_view') {
      data.pageViews++;
      data.uniqueSessions.add(event.session_id);
    }
  });

  // Count leads by channel
  leads.forEach(lead => {
    const source = lead.attribution_data?.utm_source || 'direct';
    if (channels.has(source)) {
      channels.get(source).leads++;
    }
  });

  return Array.from(channels.values()).map(item => ({
    ...item,
    uniqueVisitors: item.uniqueSessions.size,
    conversionRate: item.uniqueSessions.size > 0 ? (item.leads / item.uniqueSessions.size) * 100 : 0,
  }));
}

function processTouchpointData(events: any[]) {
  const touchpoints = new Map();

  events.forEach(event => {
    const eventType = event.event_name;

    if (!touchpoints.has(eventType)) {
      touchpoints.set(eventType, {
        eventType,
        count: 0,
        uniqueSessions: new Set(),
        avgLeadScore: 0,
        totalLeadScore: 0,
      });
    }

    const data = touchpoints.get(eventType);
    data.count++;
    data.uniqueSessions.add(event.session_id);
    data.totalLeadScore += event.lead_score || 0;
  });

  return Array.from(touchpoints.values()).map(item => ({
    ...item,
    uniqueParticipants: item.uniqueSessions.size,
    avgLeadScore: item.count > 0 ? item.totalLeadScore / item.count : 0,
  }));
}

function processFunnelData(events: any[]) {
  const funnelSteps = [
    { name: 'Page View', eventName: 'campaign_page_view' },
    { name: 'Engaged (30s+)', eventName: 'campaign_time_engagement' },
    { name: 'Scroll 50%+', eventName: 'campaign_scroll_depth' },
    { name: 'CTA Click', eventName: 'campaign_cta_click' },
    { name: 'Form Start', eventName: 'campaign_form_start' },
    { name: 'Form Submit', eventName: 'campaign_form_submit' },
  ];

  const sessionCounts = new Map();

  // Count unique sessions for each funnel step
  events.forEach(event => {
    const stepIndex = funnelSteps.findIndex(step => step.eventName === event.event_name);
    if (stepIndex >= 0) {
      for (let i = 0; i <= stepIndex; i++) {
        const stepName = funnelSteps[i].name;
        if (!sessionCounts.has(stepName)) {
          sessionCounts.set(stepName, new Set());
        }
        sessionCounts.get(stepName).add(event.session_id);
      }
    }
  });

  const totalVisitors = sessionCounts.get('Page View')?.size || 0;

  return funnelSteps.map((step, index) => {
    const visitors = sessionCounts.get(step.name)?.size || 0;
    const previousVisitors = index > 0 ? (sessionCounts.get(funnelSteps[index - 1].name)?.size || 0) : totalVisitors;

    return {
      step: step.name,
      visitors,
      conversionRate: totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0,
      dropoffRate: previousVisitors > 0 ? ((previousVisitors - visitors) / previousVisitors) * 100 : 0,
    };
  });
}

function processVariantData(events: any[], leads: any[]) {
  const variants = { A: { visitors: 0, leads: 0, events: 0 }, B: { visitors: 0, leads: 0, events: 0 } };

  events.forEach(event => {
    const variant = event.campaign_variant || 'A';
    if (variants[variant]) {
      variants[variant].events++;
      if (event.event_name === 'campaign_page_view') {
        variants[variant].visitors++;
      }
    }
  });

  leads.forEach(lead => {
    const variant = lead.campaign_variant || 'A';
    if (variants[variant]) {
      variants[variant].leads++;
    }
  });

  return Object.entries(variants).reduce((acc, [key, data]) => {
    acc[key] = {
      ...data,
      conversionRate: data.visitors > 0 ? (data.leads / data.visitors) * 100 : 0,
    };
    return acc;
  }, {} as any);
}

function processLeadScoringData(leads: any[]) {
  const scoreRanges = [
    { range: '0-25', min: 0, max: 25 },
    { range: '26-50', min: 26, max: 50 },
    { range: '51-75', min: 51, max: 75 },
    { range: '76-100', min: 76, max: 100 },
    { range: '100+', min: 101, max: Infinity },
  ];

  return scoreRanges.map(range => {
    const rangeLeads = leads.filter(lead => {
      const score = lead.lead_score || 0;
      return score >= range.min && score <= range.max;
    });

    const conversions = rangeLeads.filter(lead =>
      lead.status === 'converted' || lead.onboarding_status === 'completed'
    ).length;

    return {
      scoreRange: range.range,
      count: rangeLeads.length,
      conversionRate: rangeLeads.length > 0 ? (conversions / rangeLeads.length) * 100 : 0,
    };
  });
}

function processLeadScoringBySource(leads: any[]) {
  const sourceScores = new Map();

  leads.forEach(lead => {
    const source = lead.attribution_data?.utm_source || 'direct';

    if (!sourceScores.has(source)) {
      sourceScores.set(source, {
        source,
        totalScore: 0,
        count: 0,
        conversions: 0,
      });
    }

    const data = sourceScores.get(source);
    data.totalScore += lead.lead_score || 0;
    data.count++;

    if (lead.status === 'converted' || lead.onboarding_status === 'completed') {
      data.conversions++;
    }
  });

  return Array.from(sourceScores.values()).map(item => ({
    ...item,
    averageScore: item.count > 0 ? item.totalScore / item.count : 0,
    conversionRate: item.count > 0 ? (item.conversions / item.count) * 100 : 0,
  }));
}

function processTimeSeriesData(events: any[], leads: any[], startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeSeries = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const dayEvents = events.filter(event =>
      event.created_at.startsWith(dateStr)
    );

    const dayLeads = leads.filter(lead =>
      lead.created_at.startsWith(dateStr)
    );

    timeSeries.push({
      date: dateStr,
      pageViews: dayEvents.filter(e => e.event_name === 'campaign_page_view').length,
      leads: dayLeads.length,
      events: dayEvents.length,
      averageLeadScore: dayLeads.length > 0
        ? dayLeads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / dayLeads.length
        : 0,
    });
  }

  return timeSeries;
}

async function updateLeadScore(supabase: any, sessionId: string, leadScore: number, eventName: string) {
  // Find existing lead by session or create lead scoring record
  const { data: existingLead } = await supabase
    .from('leads')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (existingLead) {
    // Update existing lead score
    await supabase
      .from('leads')
      .update({
        lead_score: leadScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingLead.id);
  } else {
    // Create or update lead scoring record
    await supabase
      .from('lead_scoring_sessions')
      .upsert({
        session_id: sessionId,
        lead_score: leadScore,
        last_event: eventName,
        updated_at: new Date().toISOString()
      });
  }
}