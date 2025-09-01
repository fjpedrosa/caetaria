/**
 * Use Case Card Component
 * Interactive card that displays a use case with hover and selected states
 * Inspired by Canny.io card design pattern
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface UseCaseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  scenario: any;
}

interface UseCaseCardProps {
  useCase: UseCaseCategory;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Use Case Card Component
 * Interactive card with smooth animations and clear visual hierarchy
 */
export const UseCaseCard = React.memo<UseCaseCardProps>(function UseCaseCard({
  useCase,
  isSelected,
  onClick
}) {
  return (
    <motion.button
      className={`
        w-full text-left p-4 lg:p-6 rounded-xl border-2 transition-all duration-300
        group relative overflow-hidden
        ${isSelected
          ? `${useCase.bgColor.replace('hover:', '')} border-current ring-2 ring-primary/20 shadow-lg`
          : 'bg-card hover:bg-muted/50 border-border hover:border-primary/30 hover:shadow-md'
        }
      `}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`Seleccionar caso de uso: ${useCase.title}`}
      aria-pressed={isSelected}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">✓</span>
          </div>
        </motion.div>
      )}

      {/* Card Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div
          className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${isSelected
              ? 'bg-primary/20'
              : 'bg-muted group-hover:bg-primary/10'
            }
          `}
          animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {useCase.icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-semibold text-base lg:text-lg mb-2 
            ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}
          `}>
            {useCase.title}
          </h4>

          <p className={`
            text-sm lg:text-base leading-relaxed
            ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}
          `}>
            {useCase.description}
          </p>

          {/* ROI Preview (only visible on hover or when selected) */}
          <motion.div
            className={`
              mt-3 flex items-center gap-2 text-xs
              ${isSelected || 'opacity-0 group-hover:opacity-100'}
            `}
            initial={{ opacity: 0, y: 5 }}
            animate={{
              opacity: isSelected ? 1 : 0,
              y: isSelected ? 0 : 5
            }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <span>📈</span>
              <span className="font-medium">{useCase.scenario?.roi?.metric || '+40%'}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              <span>⚡</span>
              <span className="font-medium">{useCase.scenario?.roi?.timeline || 'día 1'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hover Effect Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Selection Effect Background */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
});

export default UseCaseCard;