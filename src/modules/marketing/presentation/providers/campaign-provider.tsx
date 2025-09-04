/**
 * Campaign Provider - Context for campaign-wide state management
 * Application layer - Campaign state and tracking management
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAnalyticsTracking } from '@/store/api/hooks';

import { CampaignData } from '../../domain/types';

interface CampaignContextValue {
  campaignData: CampaignData | null;
  setCampaignData: (data: CampaignData) => void;
  isTracking: boolean;
  leadScore: number;
  updateLeadScore: (points: number) => void;
  trackCampaignEvent: (eventName: string, properties?: Record<string, any>) => void;
  getVariantData: () => string;
  isVariantA: boolean;
  isVariantB: boolean;
}

const CampaignContext = createContext<CampaignContextValue | undefined>(undefined);

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
}

interface CampaignProviderProps {
  children: React.ReactNode;
}

export function CampaignProvider({ children }: CampaignProviderProps) {
  const [campaignData, setCampaignDataState] = useState<CampaignData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [leadScore, setLeadScore] = useState(0);
  const [visitStartTime, setVisitStartTime] = useState<Date>(new Date());

  const router = useRouter();
  const { track, identify } = useAnalyticsTracking();

  // Initialize campaign data from URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    // Extract campaign data from URL and path
    const campaignInfo: CampaignData = {
      variant: pathname.includes('-b') ? 'B' : 'A',
      industry: extractIndustryFromPath(pathname),
      utm_source: urlParams.get('utm_source') || 'direct',
      utm_medium: urlParams.get('utm_medium') || 'organic',
      utm_campaign: urlParams.get('utm_campaign') || 'campaign_2025',
      utm_content: urlParams.get('utm_content') || 'default',
      utm_term: urlParams.get('utm_term') || '',
      target_cpl: 50,
      target_conversion: 0.05,
      sessionId: generateSessionId(),
      startTime: new Date(),
    };

    setCampaignDataState(campaignInfo);
    setIsTracking(true);
    setVisitStartTime(new Date());

    // Track campaign page view
    track('campaign_page_view', {
      campaign: campaignInfo.utm_campaign,
      source: campaignInfo.utm_source,
      medium: campaignInfo.utm_medium,
      content: campaignInfo.utm_content,
      variant: campaignInfo.variant,
      industry: campaignInfo.industry,
      page_path: pathname,
    });

    // Store campaign data in session storage for persistence
    sessionStorage.setItem('campaignData', JSON.stringify(campaignInfo));

  }, [track]);

  // Track user engagement and calculate lead score
  useEffect(() => {
    if (!campaignData || !isTracking) return;

    let scrollDepthTracked = false;
    let timeOnPageTracked = false;

    const trackScrollDepth = () => {
      if (scrollDepthTracked) return;

      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent >= 50) {
        scrollDepthTracked = true;
        updateLeadScore(10);
        track('campaign_scroll_depth', {
          depth_percent: scrollPercent,
          campaign: campaignData.utm_campaign,
          variant: campaignData.variant,
        });
      }
    };

    const trackTimeOnPage = () => {
      if (timeOnPageTracked) return;

      const timeSpent = Math.floor((Date.now() - visitStartTime.getTime()) / 1000);

      if (timeSpent >= 60) { // 1 minute
        timeOnPageTracked = true;
        updateLeadScore(15);
        track('campaign_time_engagement', {
          time_spent: timeSpent,
          campaign: campaignData.utm_campaign,
          variant: campaignData.variant,
        });
      }
    };

    const handleScroll = () => {
      trackScrollDepth();
    };

    const timeInterval = setInterval(trackTimeOnPage, 30000); // Check every 30s

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, [campaignData, isTracking, visitStartTime, track]);

  const setCampaignData = (data: CampaignData) => {
    setCampaignDataState(data);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campaignData', JSON.stringify(data));
    }
  };

  const updateLeadScore = (points: number) => {
    setLeadScore(prev => {
      const newScore = prev + points;

      // Track lead score milestones
      if (newScore >= 50 && prev < 50) {
        track('campaign_lead_qualified', {
          lead_score: newScore,
          campaign: campaignData?.utm_campaign,
          variant: campaignData?.variant,
          qualification_level: 'warm',
        });
      } else if (newScore >= 100 && prev < 100) {
        track('campaign_lead_hot', {
          lead_score: newScore,
          campaign: campaignData?.utm_campaign,
          variant: campaignData?.variant,
          qualification_level: 'hot',
        });
      }

      return newScore;
    });
  };

  const trackCampaignEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!campaignData) return;

    track(`campaign_${eventName}`, {
      campaign: campaignData.utm_campaign,
      source: campaignData.utm_source,
      medium: campaignData.utm_medium,
      variant: campaignData.variant,
      industry: campaignData.industry,
      lead_score: leadScore,
      session_id: campaignData.sessionId,
      ...properties,
    });

    // Update lead score based on event type
    const scoreMap: Record<string, number> = {
      'cta_click': 20,
      'pricing_view': 15,
      'demo_request': 30,
      'form_start': 25,
      'form_submit': 50,
      'testimonial_view': 5,
      'feature_click': 10,
      'calculator_use': 25,
    };

    if (scoreMap[eventName]) {
      updateLeadScore(scoreMap[eventName]);
    }
  };

  const getVariantData = () => {
    return campaignData?.variant || 'A';
  };

  const value: CampaignContextValue = {
    campaignData,
    setCampaignData,
    isTracking,
    leadScore,
    updateLeadScore,
    trackCampaignEvent,
    getVariantData,
    isVariantA: campaignData?.variant === 'A',
    isVariantB: campaignData?.variant === 'B',
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}

// Helper functions
function extractIndustryFromPath(pathname: string): string {
  if (pathname.includes('restaurant')) return 'restaurant';
  if (pathname.includes('dental')) return 'dental';
  if (pathname.includes('clinic')) return 'clinic';
  if (pathname.includes('childcare')) return 'childcare';
  return 'general';
}

function generateSessionId(): string {
  return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}