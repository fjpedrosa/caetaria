import React from 'react';
import { motion } from 'framer-motion';
import type { BenefitWithIcon } from '../hooks/use-features-grid';

interface BenefitsListProps {
  benefits: BenefitWithIcon[];
  checkColor?: string;
  onBenefitHover?: (benefit: string) => void;
}

/**
 * Lista de beneficios con iconos específicos
 * Usa iconos descriptivos para características y checkmarks para métricas
 */
export const BenefitsList: React.FC<BenefitsListProps> = ({
  benefits,
  checkColor = 'text-success',
  onBenefitHover,
}) => {
  return (
    <ul className="space-y-3">
      {benefits.map((benefit, index) => {
        const IconComponent = benefit.icon;
        const iconColor = benefit.useCheckmark ? checkColor : 'text-primary';
        const bgColor = benefit.useCheckmark ? 'bg-success/10' : 'bg-primary/10';
        
        return (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-3 group"
            onMouseEnter={() => onBenefitHover?.(benefit.text)}
          >
            <div className={`
              mt-0.5 p-1 rounded-full ${bgColor}
              transition-transform group-hover:scale-110
            `}>
              <IconComponent className={`h-3.5 w-3.5 ${iconColor}`} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
              {benefit.text}
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
};