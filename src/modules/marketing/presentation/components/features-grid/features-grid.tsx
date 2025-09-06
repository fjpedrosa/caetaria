'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FeaturesHeader } from './components/features-header';
import { FeatureCard } from './components/feature-card';
import type { FeatureViewModel } from './hooks/use-features-grid';

interface FeaturesGridProps {
  features: FeatureViewModel[];
  headerData: {
    badge: {
      text: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'promotional';
      icon?: React.ComponentType<{ className?: string }>;
    };
    title: {
      main: string;
      highlight: string;
    };
    subtitle: string;
  };
  animationConfig: {
    container: object;
    item: object;
    badge: object;
  };
  isInView: boolean;
  onFeatureClick?: (featureId: string) => void;
  onBenefitHover?: (benefit: string) => void;
}

/**
 * Componente presentacional puro FeaturesGrid
 * Solo recibe props y renderiza - sin lógica de negocio
 */
export const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  features,
  headerData,
  animationConfig,
  isInView,
  onFeatureClick,
  onBenefitHover,
}) => {
  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-black">
      {/* Background effects - Dark mode compatible */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-black pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <FeaturesHeader
          badge={headerData.badge}
          title={headerData.title}
          subtitle={headerData.subtitle}
          animationConfig={animationConfig}
        />

        {/* Grid de features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={animationConfig.container}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              benefits={feature.benefits}
              badge={feature.badge}
              cardStyles={feature.cardStyles}
              isPopular={feature.isPopular}
              isPremium={feature.isPremium}
              animationVariants={animationConfig.item}
              onFeatureClick={() => onFeatureClick?.(feature.id)}
              onBenefitHover={onBenefitHover}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};