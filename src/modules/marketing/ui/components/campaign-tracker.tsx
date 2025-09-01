/**
 * Campaign Tracker Component - Advanced Campaign Analytics
 * UI layer - Advanced tracking for campaign performance and lead scoring
 */

'use client';

import { useEffect, useState } from 'react';
import { useCampaign } from '../providers/campaign-provider';

export function CampaignTracker() {
  const { campaignData, trackCampaignEvent, leadScore, isTracking } = useCampaign();
  const [interactions, setInteractions] = useState<Array<{ type: string, timestamp: Date }>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    pageLoadTime: 0,
    timeToInteractive: 0,
    coreWebVitals: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!campaignData || !isTracking) return;

    // Track performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setPerformanceMetrics({
        pageLoadTime: perfData.loadEventEnd - perfData.navigationStart,
        timeToInteractive: perfData.domInteractive - perfData.navigationStart,
        coreWebVitals: {}, // Will be populated by Web Vitals API
      });

      trackCampaignEvent('page_performance', {
        page_load_time: perfData.loadEventEnd - perfData.navigationStart,
        dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        first_paint: perfData.loadEventStart - perfData.navigationStart,
      });
    }

    // Set up advanced interaction tracking
    const trackInteraction = (type: string, element?: Element) => {
      const interaction = { type, timestamp: new Date() };
      setInteractions(prev => [...prev, interaction]);

      trackCampaignEvent('user_interaction', {
        interaction_type: type,
        element_id: element?.id || null,
        element_class: element?.className || null,
        element_tag: element?.tagName?.toLowerCase() || null,
        timestamp: interaction.timestamp.toISOString(),
      });
    };

    // Enhanced click tracking with heatmap data
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const rect = target.getBoundingClientRect();
      
      trackCampaignEvent('click_heatmap', {
        x: event.clientX,
        y: event.clientY,
        element_x: rect.left,
        element_y: rect.top,
        element_width: rect.width,
        element_height: rect.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        element_selector: generateSelector(target),
      });

      trackInteraction('click', target);
    };

    // Mouse movement tracking for engagement analysis
    let mouseMovements = 0;
    const handleMouseMove = (event: MouseEvent) => {
      mouseMovements++;
      
      // Track significant mouse movements (every 50 movements)
      if (mouseMovements % 50 === 0) {
        trackCampaignEvent('mouse_activity', {
          movements: mouseMovements,
          x: event.clientX,
          y: event.clientY,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Form interaction tracking
    const handleFormInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      const formElement = target.closest('form');
      
      if (formElement) {
        trackCampaignEvent('form_interaction', {
          form_id: formElement.id || null,
          field_name: (target as HTMLInputElement).name || null,
          field_type: (target as HTMLInputElement).type || null,
          interaction_type: event.type,
          form_progress: calculateFormProgress(formElement),
        });
      }

      trackInteraction('form_interaction', target);
    };

    // CTA button specific tracking
    const trackCTAClicks = () => {
      const ctaButtons = document.querySelectorAll('[data-cta], .cta-button, [class*="cta"]');
      
      ctaButtons.forEach(button => {
        const clickHandler = (event: Event) => {
          const target = event.target as Element;
          
          trackCampaignEvent('cta_click', {
            cta_text: target.textContent?.trim() || null,
            cta_position: getCTAPosition(target),
            cta_variant: target.getAttribute('data-variant') || null,
            cta_type: target.getAttribute('data-cta-type') || 'primary',
          });
        };

        button.removeEventListener('click', clickHandler); // Prevent duplicates
        button.addEventListener('click', clickHandler);
      });
    };

    // Scroll depth tracking with milestones
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track scroll milestones
        const milestones = [25, 50, 75, 90, 100];
        const milestone = milestones.find(m => scrollPercent >= m && maxScrollDepth - scrollPercent < 5);
        
        if (milestone) {
          trackCampaignEvent('scroll_milestone', {
            milestone_percent: milestone,
            total_scroll_percent: scrollPercent,
            time_to_milestone: Date.now() - (campaignData.startTime?.getTime() || 0),
          });
        }
      }
    };

    // Element visibility tracking (for conversion optimization)
    const observeElements = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackCampaignEvent('element_view', {
              element_id: entry.target.id || null,
              element_class: entry.target.className || null,
              element_type: entry.target.getAttribute('data-track-type') || 'unknown',
              visibility_ratio: entry.intersectionRatio,
            });
          }
        });
      }, { threshold: [0.1, 0.5, 0.9] });

      // Observe important elements
      const importantElements = document.querySelectorAll(
        '[data-track="true"], .pricing-card, .testimonial, .feature-card, .cta-section'
      );
      
      importantElements.forEach(el => observer.observe(el));
    };

    // Set up event listeners
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('focus', handleFormInteraction, true);
    document.addEventListener('input', handleFormInteraction, true);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize specialized tracking
    trackCTAClicks();
    observeElements();

    // Track session engagement metrics
    const sessionTimer = setInterval(() => {
      trackCampaignEvent('session_heartbeat', {
        session_duration: Date.now() - (campaignData.startTime?.getTime() || 0),
        interactions_count: interactions.length,
        current_lead_score: leadScore,
        scroll_depth: maxScrollDepth,
        mouse_movements: mouseMovements,
      });
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('focus', handleFormInteraction, true);
      document.removeEventListener('input', handleFormInteraction, true);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(sessionTimer);
    };
  }, [campaignData, isTracking, trackCampaignEvent, interactions, leadScore]);

  // Track page exit intent
  useEffect(() => {
    if (!campaignData) return;

    const handleBeforeUnload = () => {
      trackCampaignEvent('session_end', {
        session_duration: Date.now() - (campaignData.startTime?.getTime() || 0),
        final_lead_score: leadScore,
        total_interactions: interactions.length,
        exit_intent: true,
      });
    };

    // Exit intent detection (mouse leaving viewport)
    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY < 0) {
        trackCampaignEvent('exit_intent', {
          trigger: 'mouse_leave_top',
          session_duration: Date.now() - (campaignData.startTime?.getTime() || 0),
          current_lead_score: leadScore,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [campaignData, leadScore, interactions, trackCampaignEvent]);

  // This component doesn't render anything visible
  return null;
}

// Helper functions
function generateSelector(element: Element): string {
  let selector = element.tagName.toLowerCase();
  
  if (element.id) {
    selector += `#${element.id}`;
  }
  
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      selector += `.${classes.slice(0, 2).join('.')}`;
    }
  }
  
  return selector;
}

function calculateFormProgress(form: HTMLFormElement): number {
  const fields = form.querySelectorAll('input, select, textarea');
  let filledFields = 0;
  
  fields.forEach(field => {
    const input = field as HTMLInputElement;
    if (input.value && input.value.trim()) {
      filledFields++;
    }
  });
  
  return fields.length > 0 ? Math.round((filledFields / fields.length) * 100) : 0;
}

function getCTAPosition(element: Element): string {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  if (rect.top < viewportHeight * 0.33) {
    return 'above_fold';
  } else if (rect.top < viewportHeight * 0.66) {
    return 'middle_fold';
  } else {
    return 'below_fold';
  }
}