/**
 * Presentation Layer - Progress Bar Container
 *
 * Smart container for scroll progress indicator.
 * Connects scroll state with progress bar presentation.
 *
 * Principios aplicados:
 * - Container/Presentation Pattern: Separa lógica de presentación
 * - Single Responsibility: Solo maneja indicador de progreso
 * - Interface Segregation: Props mínimas y específicas
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { SECTION_IDS } from '../../domain/constants';
import { NavbarProgressBarPure } from '../components/navbar-progress-bar-pure';

interface ProgressBarContainerProps {
  progress: number;
  currentSection?: string;
  isVisible?: boolean;
  onSectionClick?: (sectionId: string) => void;
}

export const ProgressBarContainer: React.FC<ProgressBarContainerProps> = ({
  progress,
  currentSection,
  isVisible = true,
  onSectionClick
}) => {
  // Calculate section progress
  const sectionProgress = useMemo(() => {
    return SECTION_IDS.map(sectionId => ({
      sectionId,
      progress: 0, // This would be calculated based on section visibility
      isVisible: true,
      isActive: currentSection === sectionId
    }));
  }, [currentSection]);

  // Props for presentational component
  const progressBarProps = {
    progress,
    sections: sectionProgress,
    currentSection,
    variant: 'linear' as const,
    onSectionClick,
    className: cn(
      'fixed top-0 left-0 right-0 z-50',
      !isVisible && 'translate-y-full opacity-0'
    )
  };

  // Use the pure presentational component
  return <NavbarProgressBarPure {...progressBarProps} />;
};