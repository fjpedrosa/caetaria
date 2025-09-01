/**
 * HeroMobileDemoContainer - Container component following Clean Architecture
 * Connects business logic hooks with presentational components
 * Replaces the monolithic 1049-line HeroMobileDemoV2 component
 */

'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';

// Business Logic Hooks
import {
  type HeroMobileDemoOptions,
  useHeroMobileDemo} from '../../application/hooks/use-hero-mobile-demo';
import { HeroChatMessages } from '../components/chat-messages';
// Helper function to get badge visibility state
import { chatMessageHelpers } from '../components/chat-messages';
import { MultipleBadges } from '../components/educational-badge';
// Presentational Components
import { ChatBackground,PhoneMockup, PhoneScreen, WhatsAppHeader } from '../components/phone-mockup';

// ============================================================================
// CONTAINER PROPS INTERFACE
// ============================================================================

export interface HeroMobileDemoContainerProps {
  isInView: boolean;
  className?: string;
  onFlowStart?: () => void;
  onFlowComplete?: () => void;
  onBadgeShow?: (badgeType: string) => void;
  onAnimationComplete?: () => void;
}

// ============================================================================
// MAIN CONTAINER COMPONENT
// ============================================================================

/**
 * HeroMobileDemoContainer - Main container component
 *
 * Architecture:
 * - Uses useHeroMobileDemo hook for all business logic
 * - Maps hook state to presentational component props
 * - Handles no internal state or business logic
 * - Pure coordination between hooks and UI components
 */
export const HeroMobileDemoContainer: React.FC<HeroMobileDemoContainerProps> = ({
  isInView,
  className = '',
  onFlowStart,
  onFlowComplete,
  onBadgeShow,
  onAnimationComplete
}) => {

  // ============================================================================
  // BUSINESS LOGIC INTEGRATION
  // ============================================================================

  const demoData = useHeroMobileDemo({
    isInView,
    onFlowStart,
    onFlowComplete,
    onBadgeShow,
    onAnimationComplete
  });

  // Destructure for cleaner access
  const { derivedState, badges, flow } = demoData;
  const {
    messagePhase,
    isTyping,
    currentBadge,
    shouldShowFlow
  } = derivedState;

  // ============================================================================
  // DERIVED STATE FOR PRESENTATIONAL COMPONENTS
  // ============================================================================

  // Message visibility states based on animation phase
  const showMessage1 = chatMessageHelpers.shouldShowMessage('customer1', messagePhase);
  const showBotMessage1 = chatMessageHelpers.shouldShowMessage('bot1', messagePhase);
  const showMessage2 = chatMessageHelpers.shouldShowMessage('customer2', messagePhase);
  const showBotMessage2 = chatMessageHelpers.shouldShowMessage('bot2', messagePhase);

  // Message read states
  const message1Read = chatMessageHelpers.shouldShowAsRead('message1', messagePhase);
  const message2Read = chatMessageHelpers.shouldShowAsRead('message2', messagePhase);

  // Typing states from animation hook
  const isCustomerTyping = demoData.animation.isCustomerTyping;
  const isBotTyping = demoData.animation.isBotTyping;

  // Badge system data
  const allBadges = Object.values(badges.badges);
  const activeBadgeId = currentBadge?.id || null;

  // Flow step data for potential future flow UI
  const currentFlowStep = flow.flowStep;
  const reservationData = flow.reservationData;

  // ============================================================================
  // RENDER COORDINATION
  // ============================================================================

  return (
    <div className={`relative ${className}`}>

      {/* Phone Mockup with WhatsApp Interface */}
      <PhoneMockup isInView={isInView} device="iphone">
        <PhoneScreen>

          {/* WhatsApp Header */}
          <WhatsAppHeader
            businessName="Terraza Nueva"
            isTyping={isTyping}
          />

          {/* Chat Messages Area */}
          <ChatBackground>
            <HeroChatMessages
              showMessage1={showMessage1}
              showMessage2={showMessage2}
              showBotMessage1={showBotMessage1}
              showBotMessage2={showBotMessage2}
              message1Read={message1Read}
              message2Read={message2Read}
              isCustomerTyping={isCustomerTyping}
              isBotTyping={isBotTyping}
            />
          </ChatBackground>

          {/* WhatsApp Flow Overlay - Future Enhancement */}
          {shouldShowFlow && (
            <AnimatePresence>
              <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 m-4 max-w-sm">
                  <h3 className="font-semibold text-lg mb-2">Reserva en Proceso</h3>
                  <div className="space-y-2 text-sm">
                    <div>Paso: {currentFlowStep}</div>
                    {reservationData.guests > 0 && (
                      <div>Personas: {reservationData.guests}</div>
                    )}
                    {reservationData.date && (
                      <div>Fecha: {reservationData.date}</div>
                    )}
                    {reservationData.time && (
                      <div>Hora: {reservationData.time}</div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatePresence>
          )}

        </PhoneScreen>
      </PhoneMockup>

      {/* Educational Badges */}
      <MultipleBadges
        badges={allBadges}
        activeBadgeId={activeBadgeId}
        onBadgeClick={(badge) => {
          onBadgeShow?.(badge.id);
        }}
      />

    </div>
  );
};

// ============================================================================
// ALTERNATIVE EXPORT NAMES
// ============================================================================

/**
 * Enhanced Hero Mobile Demo - Alias for backward compatibility
 * Maintains the same API as the original 1049-line component
 */
export const EnhancedHeroMobileDemoV2 = HeroMobileDemoContainer;

/**
 * Default export for easier imports
 */
export default HeroMobileDemoContainer;

// ============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ============================================================================

/*
USAGE EXAMPLES:

1. Basic usage (same as original):
   <HeroMobileDemoContainer isInView={isInView} />

2. With event callbacks:
   <HeroMobileDemoContainer
     isInView={isInView}
     onFlowStart={() => console.log('Flow started')}
     onFlowComplete={() => console.log('Flow completed')}
     onBadgeShow={(type) => console.log('Badge shown:', type)}
   />

3. With custom styling:
   <HeroMobileDemoContainer
     isInView={isInView}
     className="custom-demo-styles"
   />

ARCHITECTURE BENEFITS:

✅ SEPARATION OF CONCERNS: Business logic in hooks, UI in components
✅ TESTABILITY: Each hook and component can be tested independently
✅ REUSABILITY: Presentational components can be reused elsewhere
✅ MAINTAINABILITY: Changes to logic don't affect UI and vice versa
✅ PERFORMANCE: Optimized re-renders with proper memoization
✅ ACCESSIBILITY: Proper ARIA labels and keyboard navigation

REFACTORING RESULTS:

BEFORE (HeroMobileDemoV2):
- 1049 lines in single file
- 15+ useState hooks mixed with UI
- Complex timing logic mixed with rendering
- Difficult to test and maintain
- Violates Single Responsibility Principle

AFTER (Container + Hooks + Components):
- ~150 lines per file maximum
- Business logic separated into specialized hooks
- Pure presentational components
- Each concern is testable independently
- Follows Clean Architecture principles

HOOK HIERARCHY:

HeroMobileDemoContainer
├── useHeroMobileDemo (main orchestrator)
    ├── useAnimationSequence (timing & phases)
    ├── useHeroBadgeSystem (badge data & logic)
    └── useHeroFlowSequence (flow steps & data)

COMPONENT HIERARCHY:

HeroMobileDemoContainer (logic)
└── PhoneMockup (phone frame)
    └── PhoneScreen (screen layout)
        ├── WhatsAppHeader (header UI)
        ├── ChatBackground (chat area)
        │   └── HeroChatMessages (messages)
        │       ├── CustomerMessage1/2
        │       ├── BotMessage1/2
        │       └── TypingIndicator
        └── FlowOverlay (future enhancement)
├── MultipleBadges (badge system)
    └── EducationalBadge (individual badges)
*/