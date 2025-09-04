/**
 * Educational Badge Component
 * Pure presentational component following Clean Architecture principles
 * Extracted from the original WhatsAppSimulator for better separation of concerns
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { Brain, Database, Settings, Sparkles } from '@/lib/icons';

import type {
  EducationalBadge,
  EducationalBadgeDesktopProps,
  EducationalBadgeMobileProps,
  EducationalBadgeProps} from '../../domain/types';
import { badgeHelpers } from '../hooks/use-educational-badges';

// ============================================================================
// ============================================================================

const IconComponents = {
  Brain,
  Settings,
  Database,
  Sparkles
} as const;

const getBadgeIconComponent = (badgeId: string) => {
  switch (badgeId) {
    case 'ai':
      return IconComponents.Brain;
    case 'flow':
      return IconComponents.Settings;
    case 'crm':
      return IconComponents.Database;
    default:
      return IconComponents.Settings;
  }
};

// ============================================================================
// ============================================================================

/**
 * Educational Badge - Responsive component that shows desktop or mobile version
 */
export const EducationalBadge: React.FC<EducationalBadgeProps> = ({
  badge,
  isMobile = false,
  className = ''
}) => {
  if (isMobile) {
    return <EducationalBadgeMobile badge={badge} className={className} />;
  }

  return <EducationalBadgeDesktop badge={badge} className={className} />;
};

// ============================================================================
// ============================================================================

/**
 * Desktop Educational Badge - Positioned relative to simulator
 */
export const EducationalBadgeDesktop: React.FC<EducationalBadgeDesktopProps> = ({
  badge,
  className = ''
}) => {
  const IconComponent = getBadgeIconComponent(badge.id);
  const animationConfig = badgeHelpers.getBadgeAnimationConfig(badge);
  const arrowDirection = (badge as any).arrowDirection || 'right';

  return (
    <motion.div
      className={`
        absolute z-60 ${(badge as any).bgColor} ${(badge as any).color} 
        rounded-2xl shadow-2xl border border-white/20
        min-w-[140px] p-3 text-xs
        sm:min-w-[160px] sm:p-4 sm:text-sm
        hidden xs:block
        ${className}
      `}
      style={(badge as any).position}
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      exit={animationConfig.exit}
      transition={animationConfig.transition}
      whileHover={{ scale: 1.05 }}
      role="tooltip"
      aria-label={`${badge.title}: ${(badge as any).subtitle}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <motion.div
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.div>

        <div className="flex-1">
          <motion.h3
            className="font-bold text-xs sm:text-sm mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {badge.title}
          </motion.h3>
          <motion.p
            className="text-[10px] sm:text-xs opacity-90 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {(badge as any).subtitle}
          </motion.p>
        </div>
      </div>

      {/* Animated arrow pointer */}
      <motion.div
        className={`absolute ${(badge as any).color}`}
        style={{
          ...(arrowDirection === 'left' && {
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }),
          ...(arrowDirection === 'right' && {
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }),
          ...(arrowDirection === 'down' && {
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }),
          ...(arrowDirection === 'up' && {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }),
        }}
        animate={{
          x: arrowDirection === 'left' ? [0, -5, 0] :
             arrowDirection === 'right' ? [0, 5, 0] : 0,
          y: arrowDirection === 'up' ? [0, -5, 0] :
             arrowDirection === 'down' ? [0, 5, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        aria-hidden="true"
      >
        {arrowDirection === 'left' && '◀'}
        {arrowDirection === 'right' && '▶'}
        {arrowDirection === 'up' && '▲'}
        {arrowDirection === 'down' && '▼'}
      </motion.div>

      {/* Sparkle effects */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop'
        }}
        aria-hidden="true"
      >
        <Sparkles className={`w-4 h-4 ${(badge as any).color}`} />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

/**
 * Mobile Educational Badge - Centered overlay
 */
export const EducationalBadgeMobile: React.FC<EducationalBadgeMobileProps> = ({
  badge,
  className = ''
}) => {
  const IconComponent = getBadgeIconComponent(badge.id);

  return (
    <motion.div
      className={`
        sm:hidden absolute inset-0 z-50 pointer-events-none 
        flex items-center justify-center
        ${className}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="false"
      aria-label={`Educational tip: ${badge.title}`}
    >
      <div className="bg-black/20 absolute inset-0" aria-hidden="true" />
      <motion.div
        className={`
          ${(badge as any).bgColor} 
          ${(badge as any).color} 
          rounded-xl shadow-xl p-3 mx-4 max-w-[280px]
          border border-white/20
        `}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -20 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            className="flex-shrink-0"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            <IconComponent className="w-5 h-5" />
          </motion.div>
          <span className="font-bold text-sm" id={`badge-title-${badge.id}`}>
            {badge.title}
          </span>
        </div>
        <p
          className="text-xs opacity-90"
          id={`badge-content-${badge.id}`}
          aria-describedby={`badge-title-${badge.id}`}
        >
          {(badge as any).subtitle}
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// ============================================================================

export default EducationalBadge;