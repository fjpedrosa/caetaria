/**
 * Custom hook for managing channel comparison state
 */

import { useCallback, useMemo,useState } from 'react';

import type { ChannelComparison,ChannelType } from '../../domain/types/evidence.types';

interface UseChannelComparisonProps {
  comparisonData: ChannelComparison;
  defaultChannel?: ChannelType;
}

interface UseChannelComparisonReturn {
  selectedChannel: ChannelType;
  setSelectedChannel: (channel: ChannelType) => void;
  currentMetrics: {
    openRate: number;
    ctr: number;
    conversion: number;
    roi: number;
    color: string;
  };
  comparisonPercentages: {
    vsEmail: {
      openRate: string;
      ctr: string;
      conversion: string;
      roi: string;
    };
    vsSms: {
      openRate: string;
      ctr: string;
      conversion: string;
      roi: string;
    };
  };
  isWhatsAppBetter: boolean;
}

export function useChannelComparison({
  comparisonData,
  defaultChannel = 'whatsapp'
}: UseChannelComparisonProps): UseChannelComparisonReturn {
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>(defaultChannel);

  const currentMetrics = useMemo(() => {
    return comparisonData[selectedChannel];
  }, [comparisonData, selectedChannel]);

  const comparisonPercentages = useMemo(() => {
    const whatsapp = comparisonData.whatsapp;
    const email = comparisonData.email;
    const sms = comparisonData.sms;

    const calculateImprovement = (whatsappValue: number, otherValue: number): string => {
      if (otherValue === 0) return '∞';
      const improvement = ((whatsappValue - otherValue) / otherValue) * 100;
      return improvement > 0 ? `+${improvement.toFixed(0)}%` : `${improvement.toFixed(0)}%`;
    };

    return {
      vsEmail: {
        openRate: calculateImprovement(whatsapp.openRate, email.openRate),
        ctr: calculateImprovement(whatsapp.ctr, email.ctr),
        conversion: calculateImprovement(whatsapp.conversion, email.conversion),
        roi: calculateImprovement(whatsapp.roi, email.roi)
      },
      vsSms: {
        openRate: calculateImprovement(whatsapp.openRate, sms.openRate),
        ctr: calculateImprovement(whatsapp.ctr, sms.ctr),
        conversion: calculateImprovement(whatsapp.conversion, sms.conversion),
        roi: calculateImprovement(whatsapp.roi, sms.roi)
      }
    };
  }, [comparisonData]);

  const isWhatsAppBetter = selectedChannel === 'whatsapp';

  return {
    selectedChannel,
    setSelectedChannel,
    currentMetrics,
    comparisonPercentages,
    isWhatsAppBetter
  };
}