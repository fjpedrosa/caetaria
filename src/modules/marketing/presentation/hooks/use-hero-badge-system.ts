/**
 * useHeroBadgeSystem - Hook for managing educational badges in hero section
 * Extracted from HeroMobileDemoV2 to follow Single Responsibility Principle
 * Handles badge data, positioning, and display logic
 */

import { useMemo } from 'react';

import { Brain, Database, Settings } from '@/lib/icons';

import { BadgeType, MessagePhase } from './use-animation-sequence';

export interface DynamicBadge {
  id: BadgeType;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  arrowDirection: 'down' | 'up' | 'left' | 'right';
}

export interface HeroBadgeSystemOptions {
  customBadges?: Partial<Record<BadgeType, Partial<DynamicBadge>>>;
  enableAnimations?: boolean;
}

export interface HeroBadgeSystemResult {
  // Badge data
  badges: Record<BadgeType, DynamicBadge>;

  // Badge utilities
  getBadgeByType: (type: BadgeType) => DynamicBadge | null;
  shouldShowBadge: (phase: MessagePhase, badgeType: BadgeType) => boolean;
  getBadgeForPhase: (phase: MessagePhase) => DynamicBadge | null;

  // Badge positioning
  getBadgePosition: (type: BadgeType) => DynamicBadge['position'];
  getArrowDirection: (type: BadgeType) => DynamicBadge['arrowDirection'];

  // Badge styling
  getBadgeColors: (type: BadgeType) => { color: string; bgColor: string };
  getBadgeIcon: (type: BadgeType) => React.ComponentType<any> | null;
}

// Default badge configurations
const DEFAULT_BADGES: Record<BadgeType, DynamicBadge> = {
  ai: {
    id: 'ai',
    icon: Brain,
    title: 'Respuesta con IA',
    subtitle: 'Entiende contexto natural',
    color: 'text-purple-100',
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    position: { top: '30%', right: '-160px' },
    arrowDirection: 'left'
  },
  flow: {
    id: 'flow',
    icon: Settings,
    title: 'Proceso Mejorado',
    subtitle: 'WhatsApp Flow nativo',
    color: 'text-yellow-100',
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    position: { bottom: '40%', right: '-160px' },
    arrowDirection: 'left'
  },
  crm: {
    id: 'crm',
    icon: Database,
    title: 'Integración CRM',
    subtitle: 'Datos sincronizados automáticamente',
    color: 'text-blue-100',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    position: { top: '30%', left: '-170px' },
    arrowDirection: 'right'
  }
};

// Phase to badge mapping
const PHASE_BADGE_MAPPING: Partial<Record<MessagePhase, BadgeType>> = {
  'badge_ai': 'ai',
  'badge_flow': 'flow',
  'badge_crm': 'crm'
};

export const useHeroBadgeSystem = (
  options: HeroBadgeSystemOptions = {}
): HeroBadgeSystemResult => {
  const {
    customBadges = {},
    enableAnimations = true
  } = options;

  // Merge default badges with custom overrides
  const badges = useMemo((): Record<BadgeType, DynamicBadge> => {
    const mergedBadges = { ...DEFAULT_BADGES };

    Object.entries(customBadges).forEach(([badgeType, customBadge]) => {
      const type = badgeType as BadgeType;
      if (mergedBadges[type] && customBadge) {
        mergedBadges[type] = {
          ...mergedBadges[type],
          ...customBadge
        };
      }
    });

    return mergedBadges;
  }, [customBadges]);

  // Get badge by type
  const getBadgeByType = (type: BadgeType): DynamicBadge | null => {
    return badges[type] || null;
  };

  // Check if badge should be shown for current phase
  const shouldShowBadge = (phase: MessagePhase, badgeType: BadgeType): boolean => {
    const phaseBadge = PHASE_BADGE_MAPPING[phase];
    return phaseBadge === badgeType;
  };

  // Get the badge that should be displayed for a specific phase
  const getBadgeForPhase = (phase: MessagePhase): DynamicBadge | null => {
    const badgeType = PHASE_BADGE_MAPPING[phase];
    return badgeType ? badges[badgeType] : null;
  };

  // Get badge position
  const getBadgePosition = (type: BadgeType): DynamicBadge['position'] => {
    const badge = badges[type];
    return badge?.position || {};
  };

  // Get arrow direction
  const getArrowDirection = (type: BadgeType): DynamicBadge['arrowDirection'] => {
    const badge = badges[type];
    return badge?.arrowDirection || 'down';
  };

  // Get badge colors
  const getBadgeColors = (type: BadgeType): { color: string; bgColor: string } => {
    const badge = badges[type];
    return {
      color: badge?.color || 'text-gray-100',
      bgColor: badge?.bgColor || 'bg-gray-500'
    };
  };

  // Get badge icon
  const getBadgeIcon = (type: BadgeType): React.ComponentType<any> | null => {
    const badge = badges[type];
    return badge?.icon || null;
  };

  return {
    badges,
    getBadgeByType,
    shouldShowBadge,
    getBadgeForPhase,
    getBadgePosition,
    getArrowDirection,
    getBadgeColors,
    getBadgeIcon
  };
};

// Utility functions for badge management
export const heroBadgeSystemHelpers = {
  // Create badge with default styling
  createBadge: (
    id: BadgeType,
    title: string,
    subtitle: string,
    options: Partial<DynamicBadge> = {}
  ): DynamicBadge => ({
    id,
    icon: Settings,
    title,
    subtitle,
    color: 'text-white',
    bgColor: 'bg-blue-500',
    position: { top: '50%', right: '-160px' },
    arrowDirection: 'left',
    ...options
  }),

  // Generate responsive position styles
  getResponsivePosition: (badge: DynamicBadge): string => {
    const { position } = badge;
    let styles = 'absolute z-60 ';

    // Add position styles
    if (position.top) styles += `top-[${position.top}] `;
    if (position.bottom) styles += `bottom-[${position.bottom}] `;
    if (position.left) styles += `left-[${position.left}] `;
    if (position.right) styles += `right-[${position.right}] `;

    // Add responsive visibility
    styles += 'hidden xs:block ';

    return styles;
  },

  // Get badge phases in order
  getBadgePhases: (): MessagePhase[] => {
    return Object.keys(PHASE_BADGE_MAPPING) as MessagePhase[];
  },

  // Check if phase is a badge phase
  isBadgePhase: (phase: MessagePhase): boolean => {
    return phase in PHASE_BADGE_MAPPING;
  },

  // Get all available badge types
  getBadgeTypes: (): BadgeType[] => {
    return Object.values(PHASE_BADGE_MAPPING);
  },

  // Get badge display duration (could be customizable)
  getBadgeDisplayDuration: (type: BadgeType): number => {
    // Default durations for each badge type
    const durations: Record<BadgeType, number> = {
      ai: 3000,    // AI badge shows for 3 seconds
      flow: 6000,  // Flow badge shows longer (6 seconds) as it leads to flow
      crm: 2000    // CRM badge shows briefly (2 seconds)
    };

    return durations[type] || 3000;
  },

  // Create mobile-optimized badge positions
  getMobileBadgePosition: (type: BadgeType): DynamicBadge['position'] => {
    const mobilePositions: Record<BadgeType, DynamicBadge['position']> = {
      ai: { top: '20%', right: '-120px' },
      flow: { bottom: '35%', right: '-120px' },
      crm: { top: '20%', left: '-130px' }
    };

    return mobilePositions[type] || DEFAULT_BADGES[type].position;
  },

  // Create desktop-optimized badge positions
  getDesktopBadgePosition: (type: BadgeType): DynamicBadge['position'] => {
    const desktopPositions: Record<BadgeType, DynamicBadge['position']> = {
      ai: { top: '30%', right: '-180px' },
      flow: { bottom: '40%', right: '-180px' },
      crm: { top: '30%', left: '-190px' }
    };

    return desktopPositions[type] || DEFAULT_BADGES[type].position;
  }
};