/**
 * EducationalBadge - Pure presentational component for educational badges
 * Extracted from HeroMobileDemoV2 following Clean Architecture principles
 * Contains ONLY UI rendering - no business logic
 */

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { DynamicBadge } from '../../application/hooks/use-hero-badge-system';

// ============================================================================
// BADGE COMPONENT TYPES
// ============================================================================

export interface EducationalBadgeProps {
  badge: DynamicBadge;
  isVisible: boolean;
  className?: string;
  onBadgeClick?: (badge: DynamicBadge) => void;
  'aria-label'?: string;
  'role'?: string;
  'tabIndex'?: number;
}

export interface BadgeIconProps {
  icon: React.ComponentType<any>;
  className?: string;
}

export interface BadgeContentProps {
  title: string;
  subtitle: string;
  className?: string;
}

export interface BadgeArrowProps {
  direction: 'down' | 'up' | 'left' | 'right';
  color: string;
  className?: string;
}

// ============================================================================
// BADGE ICON COMPONENT
// ============================================================================

/**
 * BadgeIcon - Animated icon for educational badge
 * Shows subtle animation to draw attention
 */
const BadgeIcon: React.FC<BadgeIconProps> = ({
  icon: IconComponent,
  className = ''
}) => {
  return (
    <motion.div
      className={`
        flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 
        flex items-center justify-center ${className}
      `}
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
  );
};

// ============================================================================
// BADGE CONTENT COMPONENT
// ============================================================================

/**
 * BadgeContent - Text content for educational badge
 * Handles title and subtitle with staggered animations
 */
const BadgeContent: React.FC<BadgeContentProps> = ({
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`flex-1 ${className}`}>
      <motion.h3
        className="font-bold text-xs sm:text-sm mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-[10px] sm:text-xs opacity-90 leading-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

// ============================================================================
// BADGE ARROW COMPONENT
// ============================================================================

/**
 * BadgeArrow - Pointing arrow for badge positioning
 * Shows visual connection between badge and relevant UI element
 */
const BadgeArrow: React.FC<BadgeArrowProps> = ({
  direction,
  color,
  className = ''
}) => {
  const arrowPaths = {
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6',
    up: 'M18 15l-6-6-6 6',
    down: 'M6 9l6 6 6-6'
  };

  const arrowPositions = {
    left: 'absolute top-1/2 -translate-y-1/2 -right-2',
    right: 'absolute top-1/2 -translate-y-1/2 -left-2',
    up: 'absolute left-1/2 -translate-x-1/2 -bottom-2',
    down: 'absolute left-1/2 -translate-x-1/2 -top-2'
  };

  return (
    <div className={`${arrowPositions[direction]} ${className}`}>
      <svg
        className="w-4 h-4"
        stroke={color}
        strokeWidth={2}
        fill="none"
        viewBox="0 0 24 24"
      >
        <path d={arrowPaths[direction]} />
      </svg>
    </div>
  );
};

// ============================================================================
// MAIN EDUCATIONAL BADGE COMPONENT
// ============================================================================

/**
 * EducationalBadge - Main educational badge component
 * Pure presentational - receives badge data and visibility as props
 */
export const EducationalBadge: React.FC<EducationalBadgeProps> = ({
  badge,
  isVisible,
  className = '',
  onBadgeClick
}) => {
  if (!isVisible) return null;

  const handleClick = () => {
    onBadgeClick?.(badge);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`
          absolute z-60 ${badge.bgColor} ${badge.color} rounded-2xl shadow-2xl border border-white/20
          cursor-pointer
          
          /* Mobile styles */
          min-w-[140px] p-3 text-xs
          
          /* Desktop styles */
          sm:min-w-[160px] sm:p-4 sm:text-sm
          
          /* Hide on very small screens to avoid clipping */
          hidden xs:block
          
          ${className}
        `}
        style={badge.position}
        initial={{
          opacity: 0,
          scale: 0.8,
          x: badge.arrowDirection === 'left' ? 30 : badge.arrowDirection === 'right' ? -30 : 0,
          y: badge.arrowDirection === 'up' ? 30 : badge.arrowDirection === 'down' ? -30 : 0
        }}
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0
        }}
        exit={{
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3 }
        }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
          duration: 0.6
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`Educational badge: ${badge.title}. ${badge.subtitle}`}
      >
        {/* Badge content */}
        <div className="flex items-start gap-2 sm:gap-3 relative">
          <BadgeIcon icon={badge.icon} />
          <BadgeContent title={badge.title} subtitle={badge.subtitle} />

          {/* Pointing arrow */}
          <BadgeArrow
            direction={badge.arrowDirection}
            color={badge.color}
          />
        </div>

        {/* Subtle pulsing effect for attention */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/5"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// SPECIALIZED BADGE COMPONENTS
// ============================================================================

/**
 * Predefined badge components for specific use cases
 * These can be used when you need specific badge types without passing full badge data
 */

export interface AIBadgeProps {
  isVisible: boolean;
  className?: string;
  onBadgeClick?: () => void;
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  isVisible,
  className,
  onBadgeClick
}) => {
  // This would typically come from the badge system hook
  // For now, we'll create a mock badge structure
  const aiBadge: DynamicBadge = {
    id: 'ai',
    icon: ({ className: iconClassName }: { className?: string }) => (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Respuesta con IA',
    subtitle: 'Entiende contexto natural',
    color: 'text-purple-100',
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    position: { top: '30%', right: '-160px' },
    arrowDirection: 'left'
  };

  return (
    <EducationalBadge
      badge={aiBadge}
      isVisible={isVisible}
      className={className}
      onBadgeClick={onBadgeClick ? () => onBadgeClick() : undefined}
    />
  );
};

// ============================================================================
// BADGE CONTAINER COMPONENT
// ============================================================================

export interface BadgeContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * BadgeContainer - Container for multiple badges
 * Provides consistent positioning context
 */
export const BadgeContainer: React.FC<BadgeContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="relative w-full h-full pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// MULTIPLE BADGES COMPONENT
// ============================================================================

export interface MultipleBadgesProps {
  badges: DynamicBadge[];
  activeBadgeId: string | null;
  className?: string;
  onBadgeClick?: (badge: DynamicBadge) => void;
}

/**
 * MultipleBadges - Component for handling multiple badges
 * Shows only the active badge to avoid clutter
 */
export const MultipleBadges: React.FC<MultipleBadgesProps> = ({
  badges,
  activeBadgeId,
  className = '',
  onBadgeClick
}) => {
  return (
    <BadgeContainer className={className}>
      {badges.map(badge => (
        <EducationalBadge
          key={badge.id}
          badge={badge}
          isVisible={activeBadgeId === badge.id}
          onBadgeClick={onBadgeClick}
        />
      ))}
    </BadgeContainer>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const educationalBadgeHelpers = {
  /**
   * Calculate responsive positioning for different screen sizes
   */
  getResponsivePosition: (
    basePosition: DynamicBadge['position'],
    screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  ): React.CSSProperties => {
    const adjustments = {
      mobile: { scale: 0.8, offset: 20 },
      tablet: { scale: 0.9, offset: 15 },
      desktop: { scale: 1, offset: 0 }
    };

    const { scale, offset } = adjustments[screenSize];

    return {
      ...basePosition,
      transform: `scale(${scale})`,
      right: basePosition.right ?
        `${parseInt(basePosition.right) + offset}px` :
        basePosition.right,
      left: basePosition.left ?
        `${parseInt(basePosition.left) + offset}px` :
        basePosition.left
    };
  },

  /**
   * Create badge with accessibility attributes
   */
  createAccessibleBadge: (
    badge: DynamicBadge,
    additionalProps: Partial<EducationalBadgeProps> = {}
  ): EducationalBadgeProps => ({
    badge,
    isVisible: true,
    'aria-label': `Educational badge: ${badge.title}. ${badge.subtitle}`,
    'role': 'button' as any,
    'tabIndex': 0 as any,
    ...additionalProps
  }),

  /**
   * Generate badge entrance animation config
   */
  getEntranceAnimation: (direction: DynamicBadge['arrowDirection']) => {
    const animations = {
      left: { x: [30, 0], opacity: [0, 1] },
      right: { x: [-30, 0], opacity: [0, 1] },
      up: { y: [30, 0], opacity: [0, 1] },
      down: { y: [-30, 0], opacity: [0, 1] }
    };

    return {
      initial: {
        opacity: 0,
        scale: 0.8,
        ...animations[direction]
      },
      animate: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0
      },
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        duration: 0.6
      }
    };
  }
};