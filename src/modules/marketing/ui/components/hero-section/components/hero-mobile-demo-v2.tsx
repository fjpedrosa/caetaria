'use client';

import { motion } from 'framer-motion';

import { heroDemoScenario } from '@/modules/whatsapp-simulator/scenarios/hero-demo-scenario';
// Clean Architecture imports
import { WhatsAppSimulatorContainer } from '@/modules/whatsapp-simulator/ui/components/whatsapp-simulator-container';

interface HeroMobileDemoV2Props {
  isInView: boolean;
}

export function HeroMobileDemoV2({ isInView }: HeroMobileDemoV2Props) {

  const heroSimulatorConfig = {
    // Scenario with exact timing from original component
    scenario: heroDemoScenario,

    // Device configuration
    device: 'iphone14' as const,

    // Behavior configuration - maps isInView to autoPlay
    autoPlay: isInView,

    // Feature flags - hero doesn't show educational badges
    enableEducationalBadges: false,
    enableGifExport: false,

    // Styling - same classes as original for iPhone mockup
    className: 'relative flex justify-center items-center w-full lg:justify-center'
  };


  const handleComplete = () => {

  };

  return (
    <motion.div
      // Exact same motion properties as original (lines 280-287)
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      // Exact same accessibility label as original (line 286)
      role="img"
      aria-label="Demostración de interfaz de WhatsApp Business mostrando conversación automatizada con cliente"
      // Same styling classes as original
      className={heroSimulatorConfig.className}
      // Perspective container like original
      style={{ perspective: '1000px' }}
    >
      {/* Clean Architecture Integration */}
      <WhatsAppSimulatorContainer
        // Core configuration
        scenario={heroSimulatorConfig.scenario}
        device={heroSimulatorConfig.device}

        // Behavior - auto-play when in view (exact original behavior)
        autoPlay={heroSimulatorConfig.autoPlay}

        // CRITICAL: Pass isInView for reactive auto-restart behavior
        isInView={isInView}

        // Features - disabled for hero presentation
        enableEducationalBadges={heroSimulatorConfig.enableEducationalBadges}
        enableGifExport={heroSimulatorConfig.enableGifExport}

        // Hero timing handled by scenario configuration

        // Event handlers
        onComplete={handleComplete}

        // Styling
        className=""
      />
    </motion.div>
  );
}

// ============================================================================
// ARCHITECTURE DOCUMENTATION
// ============================================================================

/*
CLEAN ARCHITECTURE IMPLEMENTATION:

1. SEPARATION OF CONCERNS:
   ✅ Configuration only - no business logic
   ✅ No state management - delegated to simulator
   ✅ No complex timing logic - handled by scenario
   ✅ No message management - handled by simulator

2. REUSABILITY:
   ✅ Leverages existing WhatsApp simulator architecture
   ✅ Benefits from all simulator improvements automatically
   ✅ Shares testing coverage with simulator module
   ✅ Uses proven conversation engine

3. MAINTAINABILITY:
   ✅ Single responsibility - hero presentation configuration
   ✅ No duplication of simulator logic
   ✅ Clear dependency direction (Marketing -> WhatsApp Simulator)
   ✅ Easy to modify timing or behavior via scenario config

4. IDENTICAL EXTERNAL BEHAVIOR:
   ✅ Same props interface: { isInView: boolean }
   ✅ Same auto-play behavior when isInView = true
   ✅ Same auto-restart after completion (12 seconds)
   ✅ Same visual styling and animations
   ✅ Same accessibility attributes
   ✅ Same iPhone mockup appearance

COMPARISON WITH ORIGINAL:
- Original: 647 lines of mixed presentation/logic
- This version: ~100 lines of pure configuration
- Same external behavior and appearance
- Better testability and maintainability
- Leverages existing, tested infrastructure

USAGE (identical to original):
<HeroMobileDemoV2 isInView={isInView} />

The component will:
1. Start animation when isInView becomes true
2. Play the exact same conversation sequence
3. Show the same iPhone mockup styling
4. Auto-restart every 12 seconds
5. No educational badges (hero-specific config)
*/