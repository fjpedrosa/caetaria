/**
 * BackgroundPattern Component
 *
 * Provides various SVG background patterns for different sections
 * Maintains minimalist design while adding visual interest
 * Optimized for performance with inline SVG and low opacity
 */

'use client';

import React from 'react';

import { cn } from '@/lib/utils';

export type PatternType =
  | 'dots'           // Grid de puntos para Hero
  | 'diagonal-lines' // Líneas diagonales para Features
  | 'hexagons'       // Hexágonos conectados para Use Cases
  | 'waves'          // Ondas orgánicas para Digital Businesses
  | 'circuits'       // Líneas de circuito para How It Works
  | 'circles'        // Círculos concéntricos para Pricing
  | 'plus'           // Pattern de plus/cross para FAQ
  | 'dynamic'        // Combinación dinámica para Final CTA
  | 'mesh-gradient'; // Gradiente de malla para fondos especiales

interface BackgroundPatternProps {
  pattern: PatternType;
  className?: string;
  opacity?: number; // 0-100
  primaryColor?: string;
  secondaryColor?: string;
  density?: 'low' | 'medium' | 'high';
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  pattern,
  className,
  opacity = 5,
  primaryColor = '#3B82F6', // Neptune blue por defecto
  secondaryColor = '#10B981', // WhatsApp green
  density = 'medium',
}) => {
  const densityMap = {
    low: { size: 60, strokeWidth: 1 },
    medium: { size: 40, strokeWidth: 1.5 },
    high: { size: 25, strokeWidth: 2 },
  };

  const config = densityMap[density];
  const patternId = `pattern-${pattern}-${Math.random().toString(36).substr(2, 9)}`;

  const renderPattern = () => {
    switch (pattern) {
      case 'dots':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size} height={config.size} patternUnits="userSpaceOnUse">
            <circle cx={config.size / 2} cy={config.size / 2} r={config.size / 10} fill={primaryColor} />
          </pattern>
        );

      case 'diagonal-lines':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size} height={config.size} patternUnits="userSpaceOnUse">
            <line
              x1="0"
              y1={config.size}
              x2={config.size}
              y2="0"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
            />
          </pattern>
        );

      case 'hexagons':
        const hexSize = config.size / 2;
        const hexPath = `M${hexSize},0 L${hexSize * 1.5},${hexSize * 0.866} L${hexSize},${hexSize * 1.732} L0,${hexSize * 1.732} L${-hexSize * 0.5},${hexSize * 0.866} L0,0 Z`;
        return (
          <pattern id={patternId} x="0" y="0" width={config.size * 2} height={config.size * 1.732} patternUnits="userSpaceOnUse">
            <path
              d={hexPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
              transform={`translate(${hexSize}, 0)`}
            />
          </pattern>
        );

      case 'waves':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size * 3} height={config.size} patternUnits="userSpaceOnUse">
            <path
              d={`M0,${config.size / 2} Q${config.size * 0.75},${config.size * 0.25} ${config.size * 1.5},${config.size / 2} T${config.size * 3},${config.size / 2}`}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
            />
          </pattern>
        );

      case 'circuits':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size * 2} height={config.size * 2} patternUnits="userSpaceOnUse">
            <line x1="0" y1={config.size} x2={config.size * 2} y2={config.size} stroke={primaryColor} strokeWidth={config.strokeWidth} />
            <line x1={config.size} y1="0" x2={config.size} y2={config.size * 2} stroke={primaryColor} strokeWidth={config.strokeWidth} />
            <circle cx={config.size} cy={config.size} r="2" fill={primaryColor} />
            <circle cx="0" cy={config.size} r="1.5" fill={secondaryColor} />
            <circle cx={config.size * 2} cy={config.size} r="1.5" fill={secondaryColor} />
          </pattern>
        );

      case 'circles':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size * 3} height={config.size * 3} patternUnits="userSpaceOnUse">
            <circle
              cx={config.size * 1.5}
              cy={config.size * 1.5}
              r={config.size * 0.4}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
            />
            <circle
              cx={config.size * 1.5}
              cy={config.size * 1.5}
              r={config.size * 0.8}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth * 0.7}
              opacity="0.5"
            />
            <circle
              cx={config.size * 1.5}
              cy={config.size * 1.5}
              r={config.size * 1.2}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth * 0.5}
              opacity="0.3"
            />
          </pattern>
        );

      case 'plus':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size} height={config.size} patternUnits="userSpaceOnUse">
            <line
              x1={config.size / 2}
              y1={config.size * 0.25}
              x2={config.size / 2}
              y2={config.size * 0.75}
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
            />
            <line
              x1={config.size * 0.25}
              y1={config.size / 2}
              x2={config.size * 0.75}
              y2={config.size / 2}
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
            />
          </pattern>
        );

      case 'dynamic':
        return (
          <pattern id={patternId} x="0" y="0" width={config.size * 4} height={config.size * 4} patternUnits="userSpaceOnUse">
            {/* Combinación de puntos y líneas */}
            <circle cx={config.size} cy={config.size} r="2" fill={primaryColor} />
            <circle cx={config.size * 3} cy={config.size * 3} r="2" fill={secondaryColor} />
            <line
              x1="0"
              y1={config.size * 2}
              x2={config.size * 4}
              y2={config.size * 2}
              stroke={primaryColor}
              strokeWidth={config.strokeWidth}
              opacity="0.5"
            />
            <line
              x1={config.size * 2}
              y1="0"
              x2={config.size * 2}
              y2={config.size * 4}
              stroke={secondaryColor}
              strokeWidth={config.strokeWidth}
              opacity="0.5"
            />
            <path
              d={`M0,${config.size * 4} Q${config.size * 2},${config.size * 3} ${config.size * 4},${config.size * 4}`}
              fill="none"
              stroke={primaryColor}
              strokeWidth={config.strokeWidth * 0.7}
              opacity="0.3"
            />
          </pattern>
        );

      case 'mesh-gradient':
        // Para mesh gradient usamos un gradiente más complejo
        return (
          <>
            <linearGradient id={`${patternId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.1" />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
            </linearGradient>
            <pattern id={patternId} x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
              <rect width="100%" height="100%" fill={`url(#${patternId}-gradient)`} />
            </pattern>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} style={{ zIndex: 0 }}>
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>{renderPattern()}</defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
          opacity={opacity / 100}
        />
      </svg>

      {/* Gradiente overlay opcional para suavizar los bordes */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10" />
    </div>
  );
};

// Componente adicional para crear separadores con formas SVG entre secciones
export const SectionDivider: React.FC<{
  type?: 'wave' | 'triangle' | 'curve';
  flip?: boolean;
  color?: string;
  className?: string;
}> = ({ type = 'wave', flip = false, color = '#ffffff', className }) => {
  const renderDivider = () => {
    switch (type) {
      case 'wave':
        return (
          <path
            d="M0,64 C150,100 350,0 500,64 L500,0 L0,0 Z"
            fill={color}
            transform={flip ? 'rotate(180 250 50)' : undefined}
          />
        );
      case 'triangle':
        return (
          <path
            d="M0,0 L250,100 L500,0 Z"
            fill={color}
            transform={flip ? 'rotate(180 250 50)' : undefined}
          />
        );
      case 'curve':
        return (
          <path
            d="M0,50 Q250,0 500,50 L500,0 L0,0 Z"
            fill={color}
            transform={flip ? 'rotate(180 250 50)' : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <svg
        viewBox="0 0 500 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {renderDivider()}
      </svg>
    </div>
  );
};