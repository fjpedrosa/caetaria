import React from 'react';
import { motion } from 'framer-motion';

interface FeatureBadgeProps {
  text: string;
  variant?: 'popular' | 'new' | 'premium';
}

/**
 * Badge consistente para las tarjetas de features
 * Soluciona el problema de z-index y visibilidad
 */
export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ 
  text, 
  variant = 'popular' 
}) => {
  const variantStyles = {
    popular: 'bg-primary text-white',
    new: 'bg-success text-white',
    premium: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="absolute -top-3 left-6 z-10" // z-10 con posición correcta
    >
      <div className={`
        px-4 py-1.5 rounded-full text-xs font-semibold
        shadow-md transform -rotate-2
        ${variantStyles[variant]}
      `}>
        {text}
      </div>
    </motion.div>
  );
};