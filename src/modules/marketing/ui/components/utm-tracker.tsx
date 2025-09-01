/**
 * UTM Tracker Component - Campaign Attribution and Tracking
 * UI layer - Tracks UTM parameters and campaign attribution
 */

'use client';

import { useEffect } from 'react';
import { useCampaign } from '../providers/campaign-provider';
import { CampaignData } from '../../domain/types';

interface UTMTrackerProps {
  campaignData: CampaignData;
}

export function UTMTracker({ campaignData }: UTMTrackerProps) {
  const { trackCampaignEvent, setCampaignData } = useCampaign();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update campaign context with provided data
    setCampaignData(campaignData);

    // Track initial page view with attribution
    trackCampaignEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer || '(direct)',
    });

    // Enhanced attribution tracking for campaign validation
    const enhancedAttribution = {
      // UTM parameters
      utm_source: campaignData.utm_source,
      utm_medium: campaignData.utm_medium,
      utm_campaign: campaignData.utm_campaign,
      utm_content: campaignData.utm_content,
      utm_term: campaignData.utm_term,
      
      // Campaign metadata
      variant: campaignData.variant,
      industry: campaignData.industry,
      target_cpl: campaignData.target_cpl,
      target_conversion: campaignData.target_conversion,
      
      // Session data
      session_id: campaignData.sessionId,
      timestamp: campaignData.startTime?.toISOString(),
      
      // Technical attribution
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_type: getDeviceType(),
      browser: getBrowserInfo(),
      
      // Referrer analysis
      referrer: document.referrer,
      referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      is_returning_visitor: checkReturningVisitor(),
      
      // Campaign validation KPIs
      expected_cpl: campaignData.target_cpl,
      expected_conversion_rate: campaignData.target_conversion,
    };

    // Send enhanced attribution event
    trackCampaignEvent('campaign_attribution', enhancedAttribution);

    // Set up attribution persistence
    const attributionData = {
      utm_params: {
        source: campaignData.utm_source,
        medium: campaignData.utm_medium,
        campaign: campaignData.utm_campaign,
        content: campaignData.utm_content,
        term: campaignData.utm_term,
      },
      campaign_data: campaignData,
      first_touch: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
      },
    };

    // Store first-touch attribution (if not already stored)
    const existingAttribution = localStorage.getItem('first_touch_attribution');
    if (!existingAttribution) {
      localStorage.setItem('first_touch_attribution', JSON.stringify({
        ...attributionData,
        attribution_type: 'first_touch'
      }));
    }

    // Always update last-touch attribution
    localStorage.setItem('last_touch_attribution', JSON.stringify({
      ...attributionData,
      attribution_type: 'last_touch'
    }));

    // Send attribution data to analytics platforms
    sendToGoogleAnalytics(enhancedAttribution);
    sendToFacebookPixel(enhancedAttribution);
    sendToLinkedInInsight(enhancedAttribution);

  }, [campaignData, trackCampaignEvent, setCampaignData]);

  // Component doesn't render anything, it's just for tracking
  return null;
}

// Helper functions for enhanced attribution
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  return 'Unknown';
}

function checkReturningVisitor(): boolean {
  const hasVisitedBefore = localStorage.getItem('has_visited_before');
  if (!hasVisitedBefore) {
    localStorage.setItem('has_visited_before', 'true');
    return false;
  }
  return true;
}

// Analytics platform integrations
function sendToGoogleAnalytics(data: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    // Send custom dimensions to GA4
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      custom_map: {
        'custom_parameter_1': 'utm_source',
        'custom_parameter_2': 'utm_medium', 
        'custom_parameter_3': 'utm_campaign',
        'custom_parameter_4': 'campaign_variant',
        'custom_parameter_5': 'industry',
      }
    });

    // Track campaign attribution event
    window.gtag('event', 'campaign_attribution', {
      campaign_name: data.utm_campaign,
      campaign_source: data.utm_source,
      campaign_medium: data.utm_medium,
      campaign_content: data.utm_content,
      campaign_term: data.utm_term,
      custom_parameter_4: data.variant,
      custom_parameter_5: data.industry,
    });

    // Set user properties for better segmentation
    window.gtag('set', 'user_properties', {
      campaign_variant: data.variant,
      target_industry: data.industry,
      device_category: data.device_type,
      is_returning: data.is_returning_visitor,
    });
  }
}

function sendToFacebookPixel(data: any) {
  if (typeof window !== 'undefined' && window.fbq) {
    // Track campaign page view with custom parameters
    window.fbq('track', 'PageView', {
      campaign_name: data.utm_campaign,
      campaign_source: data.utm_source,
      campaign_variant: data.variant,
      target_industry: data.industry,
      expected_cpl: data.expected_cpl,
    });

    // Set custom audience parameters
    window.fbq('set', 'userData', {
      campaign_variant: data.variant,
      industry: data.industry,
    });
  }
}

function sendToLinkedInInsight(data: any) {
  if (typeof window !== 'undefined' && window._linkedin_data_partner_id) {
    // LinkedIn Insight Tag custom event
    const linkedinEvent = {
      event_name: 'campaign_attribution',
      campaign: data.utm_campaign,
      variant: data.variant,
      industry: data.industry,
    };

    // Send to LinkedIn if tracking code is available
    if (window.lintrk) {
      window.lintrk('track', linkedinEvent);
    }
  }
}