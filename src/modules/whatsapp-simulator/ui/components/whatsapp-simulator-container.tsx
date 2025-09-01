/**
 * WhatsApp Simulator Container
 * Container component that connects logic hooks with presentational component
 * Follows Clean Architecture principles with complete separation of concerns
 */

'use client';

import React from 'react';

import type { WhatsAppSimulatorProps } from '../../domain/types';
import { restaurantReservationScenario } from '../../scenarios/restaurant-reservation-scenario';
import { useWhatsAppSimulator } from '../hooks/use-whatsapp-simulator';

import { WhatsAppSimulator } from './whatsapp-simulator';


export const WhatsAppSimulatorContainer: React.FC<WhatsAppSimulatorProps> = ({
  scenario = restaurantReservationScenario,
  device = 'iphone14',
  autoPlay = false,
  isInView,
  enableEducationalBadges = true,
  enableGifExport = false,
  onComplete,
  onBadgeShow,
  onFlowStep,
  className = ''
}) => {

  const simulatorData = useWhatsAppSimulator({
    scenario,
    autoPlay,
    isInView, // Pass isInView to enable reactive auto-restart behavior
    enableEducationalBadges,
    onComplete,
    onBadgeShow,
    onFlowStep
  });

  const presentationalProps = {
    conversation: simulatorData.conversation,
    isInitialized: simulatorData.isInitialized,
    activeBadge: simulatorData.activeBadge,
    showFlow: simulatorData.showFlow,
    flowStep: simulatorData.flowStep,
    reservationData: simulatorData.reservationData,

    // Configuration props (passed through)
    device,
    enableEducationalBadges,
    className,

    // Hook instances for direct consumption by presentational component
    conversationFlow: simulatorData.conversationFlow,
    typingIndicator: simulatorData.typingIndicator,
    flowExecution: simulatorData.flowExecution,

    onDataChange: simulatorData.handleDataChange
  };

  return <WhatsAppSimulator {...presentationalProps} />;
};

// ============================================================================
// ============================================================================

/**
 * Enhanced WhatsApp Simulator - Alias for backward compatibility
 * This maintains the same API as the original 985-line component
 */
export const EnhancedWhatsAppSimulator = WhatsAppSimulatorContainer;

/**
 * Default export for easier imports
 */
export default WhatsAppSimulatorContainer;

// ============================================================================
// ============================================================================

/*
USAGE EXAMPLES:

1. Basic usage (same as before):
   <WhatsAppSimulatorContainer />

2. With custom scenario:
   <WhatsAppSimulatorContainer
     scenario={customScenario}
     autoPlay={true}
     onComplete={() => console.log('Done!')}
   />

3. With educational badges disabled:
   <WhatsAppSimulatorContainer
     enableEducationalBadges={false}
     device="android"
   />

ARCHITECTURE BENEFITS:

✅ CLEAN SEPARATION: Business logic completely separated from presentation
✅ TESTABILITY: Each hook can be tested independently
✅ REUSABILITY: Hooks can be reused in other components
✅ MAINTAINABILITY: Changes to logic don't affect UI and vice versa
✅ SINGLE RESPONSIBILITY: Each hook handles one specific concern
✅ PERFORMANCE: Optimized with proper memoization and cleanup

HOOK HIERARCHY:

WhatsAppSimulatorContainer
├── useWhatsAppSimulator (main orchestrator)
    ├── useEducationalBadges (badge logic)
    ├── useFlowSequence (flow steps logic)
    ├── useReservationData (reservation state)
    ├── useConversationFlow (existing)
    ├── useTypingIndicatorWithEvents (existing)
    └── useFlowExecutionWithEvents (existing)

COMPONENT HIERARCHY:

WhatsAppSimulatorContainer (logic)
└── WhatsAppSimulator (presentation)
    ├── EducationalBadge (badge UI)
    └── FlowPanel (flow UI)
        ├── GuestSelection
        ├── DateSelection
        ├── TimeSelection
        └── ConfirmationStep
*/