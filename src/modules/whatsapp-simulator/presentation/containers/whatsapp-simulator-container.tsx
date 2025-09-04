'use client';

import React from 'react';

import type { WhatsAppSimulatorProps } from '../../domain/types';
import { WhatsAppSimulator } from '../components/whatsapp-simulator';
import { useWhatsAppSimulator } from '../hooks/use-whatsapp-simulator';

export interface WhatsAppSimulatorContainerProps extends WhatsAppSimulatorProps {
  debug?: boolean;
  onStateChange?: (state: any) => void;
}

export const WhatsAppSimulatorContainer: React.FC<WhatsAppSimulatorContainerProps> = ({
  scenario,
  device = 'iphone14',
  autoPlay = false,
  enableEducationalBadges = true,
  enableGifExport = false,
  onComplete,
  onBadgeShow,
  onFlowStep,
  className,
  debug = false,
  onStateChange
}) => {
  const {
    state,
    conversationFlow,
    typingIndicator,
    flowExecution
  } = useWhatsAppSimulator({
    scenario,
    device,
    autoPlay,
    enableEducationalBadges,
    enableGifExport,
    onComplete,
    onBadgeShow,
    onFlowStep
  });

  // Notify parent of state changes for debugging
  React.useEffect(() => {
    if (debug && onStateChange) {
      onStateChange({
        conversation: state.conversation,
        isInitialized: state.isInitialized,
        flowState: conversationFlow?.state,
        typingState: typingIndicator?.state
      });
    }
  }, [state, conversationFlow?.state, typingIndicator?.state, debug, onStateChange]);

  // Debug logging
  React.useEffect(() => {
    if (debug) {
      console.log('[WhatsAppSimulatorContainer] State:', {
        isInitialized: state.isInitialized,
        hasConversation: !!state.conversation,
        messageCount: state.conversation?.messages?.length || 0,
        flowReady: conversationFlow?.isReady,
        currentMessage: conversationFlow?.state?.currentMessageIndex
      });
    }
  }, [state, conversationFlow, debug]);

  // Handle flow data changes
  const handleDataChange = React.useCallback((data: any) => {
    if (debug) {
      console.log('[WhatsAppSimulatorContainer] Flow data changed:', data);
    }
  }, [debug]);

  return (
    <WhatsAppSimulator
      conversation={state.conversation}
      isInitialized={state.isInitialized}
      activeBadge={state.activeBadge}
      showFlow={state.showFlow}
      flowStep={state.flowExecution?.currentStep || 'guests'}
      reservationData={state.flowExecution?.flowData || { guests: 0, date: '', time: '' }}
      device={device}
      enableEducationalBadges={enableEducationalBadges}
      className={className}
      conversationFlow={conversationFlow}
      typingIndicator={typingIndicator}
      flowExecution={flowExecution}
      onDataChange={handleDataChange}
    />
  );
};

export default WhatsAppSimulatorContainer;