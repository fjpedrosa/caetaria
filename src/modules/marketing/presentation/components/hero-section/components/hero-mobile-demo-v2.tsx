'use client';

import { motion } from 'framer-motion';

// Clean Architecture imports
import { WhatsAppSimulatorContainer } from '@/modules/whatsapp-simulator/presentation/components/whatsapp-simulator-container';
import { heroDemoScenario } from '@/modules/whatsapp-simulator/scenarios/hero-demo-scenario';

interface HeroMobileDemoV2Props {
  isInView: boolean;
}
const heroSimulatorConfig = {
  scenario: heroDemoScenario,
  device: 'iphone14' as const,
  autoPlay: true,
  enableEducationalBadges: false,
  enableGifExport: false,
  className: 'relative flex justify-center items-center w-full lg:justify-center'
};

export function HeroMobileDemoV2({ isInView }: HeroMobileDemoV2Props) {
  const handleComplete = () => {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración de interfaz de WhatsApp Business mostrando conversación automatizada con cliente"
      className={heroSimulatorConfig.className}
      style={{ perspective: '1000px' }}
    >
      <WhatsAppSimulatorContainer
        scenario={heroSimulatorConfig.scenario}
        device={heroSimulatorConfig.device}
        autoPlay={heroSimulatorConfig.autoPlay}
        isInView={isInView}
        enableEducationalBadges={heroSimulatorConfig.enableEducationalBadges}
        enableGifExport={heroSimulatorConfig.enableGifExport}
        onComplete={handleComplete}
        className=""
      />
    </motion.div>
  );
}