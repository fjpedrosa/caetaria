import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { FeatureBadge } from './feature-badge';
import { BenefitsList } from './benefits-list';
import type { BenefitWithIcon } from '../hooks/use-features-grid';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  benefits: BenefitWithIcon[];
  badge?: string;
  cardStyles: {
    container: string;
    header: string;
    iconContainer: string;
    benefitCheck: string;
    titleColor: string;
  };
  isPopular?: boolean;
  isPremium?: boolean;
  animationVariants?: {
    hidden: object;
    visible: object;
  };
  onFeatureClick?: () => void;
  onBenefitHover?: (benefit: string) => void;
}

/**
 * Tarjeta de feature - componente presentacional puro
 * Sin lógica de negocio, solo renderizado
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  benefits,
  badge,
  cardStyles,
  isPopular = false,
  isPremium = false,
  animationVariants,
  onFeatureClick,
  onBenefitHover,
}) => {
  return (
    <motion.div
      variants={animationVariants}
      className={cardStyles.container}
      onClick={onFeatureClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
    >
      {/* Badge mejorado con z-index correcto */}
      {badge && (
        <FeatureBadge 
          text={badge} 
          variant={isPopular ? 'popular' : isPremium ? 'premium' : 'new'} 
        />
      )}

      {/* Header con icono integrado en el título */}
      <div className={cardStyles.header}>
        <div className={cardStyles.iconContainer}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-semibold mb-2 ${cardStyles.titleColor}`}>
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Separador visual */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      {/* Lista de beneficios con iconos específicos */}
      <BenefitsList
        benefits={benefits}
        checkColor={cardStyles.benefitCheck}
        onBenefitHover={onBenefitHover}
      />
    </motion.div>
  );
};