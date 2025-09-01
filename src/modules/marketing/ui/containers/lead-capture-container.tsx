/**
 * Lead Capture Container - Connects hook logic with presentational component
 * Following Clean Architecture principles - Bridge between logic and UI
 */

import React from 'react';

import { useLeadCapture } from '../../application/hooks/use-lead-capture';
import type { LeadCaptureFormProps, TrackingEvent } from '../../domain/types';
import { LeadCaptureForm } from '../components/lead-capture-form';

// =============================================================================
// CONTAINER COMPONENT - Only connects hook with component
// =============================================================================

export const LeadCaptureContainer: React.FC<LeadCaptureFormProps> = ({
  source,
  title,
  description,
  className,
  variant,
  onSuccess
}) => {
  // =============================================================================
  // ANALYTICS INTEGRATION - Could be injected via context
  // =============================================================================

  const handleTrackEvent = (event: TrackingEvent) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.eventName, {
        ...event.properties,
        source: event.source,
      });
    }
    console.log('[Analytics]', event.eventName, event.properties);
  };

  // =============================================================================
  // HOOK INTEGRATION - All logic comes from hook
  // =============================================================================

  const hookData = useLeadCapture({
    source,
    onSuccess,
    trackEvent: handleTrackEvent,
    enableAnalytics: true,
  });

  // =============================================================================
  // ABANDONMENT TRACKING - Handled at container level
  // =============================================================================

  const handleFormAbandonment = () => {
    // Only track if form has been interacted with
    if (hookData.isDirty && !hookData.isSuccess) {
      hookData.trackFormAbandonment();
    }
  };

  // =============================================================================
  // RENDER - Just passes everything to presentational component
  // =============================================================================

  return (
    <LeadCaptureForm
      source={source}
      title={title}
      description={description}
      className={className}
      variant={variant}
      onSuccess={onSuccess}
      hookData={hookData}
      onFormAbandonment={handleFormAbandonment}
    />
  );
};

// =============================================================================
// EXPORT AS DEFAULT FOR EASY IMPORTS
// =============================================================================

export default LeadCaptureContainer;