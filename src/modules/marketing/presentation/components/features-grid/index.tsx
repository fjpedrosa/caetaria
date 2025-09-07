'use client';

import React from 'react';

import { useFeaturesGrid } from './hooks/use-features-grid';
import { FeaturesGrid } from './features-grid';

/**
 * Container Component - Conecta el hook con el componente presentacional
 * Siguiendo el patrón Container/Presentational de Clean Architecture
 */
export const FeaturesGridContainer: React.FC = () => {
  const {
    containerRef,
    isInView,
    features,
    headerData,
    animationConfig,
    handlers,
  } = useFeaturesGrid();

  return (
    <div ref={containerRef}>
      <FeaturesGrid
        features={features}
        headerData={headerData}
        animationConfig={animationConfig}
        isInView={isInView}
        onFeatureClick={handlers.onFeatureClick}
        onBenefitHover={handlers.onBenefitHover}
      />
    </div>
  );
};

// Export por defecto para mantener compatibilidad
export default FeaturesGridContainer;