import React from 'react';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface FeaturesHeaderProps {
  badge: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'promotional';
    icon?: LucideIcon;
  };
  title: {
    main: string;
    highlight: string;
  };
  subtitle: string;
  animationConfig?: {
    badge: {
      initial: object;
      animate: object;
    };
  };
}

/**
 * Componente presentacional puro para el header de Features
 * Sin lógica - solo renderizado
 */
export const FeaturesHeader: React.FC<FeaturesHeaderProps> = ({
  badge,
  title,
  subtitle,
  animationConfig,
}) => {
  const IconComponent = badge.icon;
  
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <motion.div 
        className="inline-block mb-4"
        initial={animationConfig?.badge.initial}
        animate={animationConfig?.badge.animate}
      >
        <Badge 
          variant={badge.variant}
          className="px-4 py-1.5 text-sm font-medium flex items-center gap-2"
        >
          {IconComponent && <IconComponent className="w-4 h-4" />}
          {badge.text}
        </Badge>
      </motion.div>
      
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {title.main}
        <span className="text-primary"> {title.highlight}</span>
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
};