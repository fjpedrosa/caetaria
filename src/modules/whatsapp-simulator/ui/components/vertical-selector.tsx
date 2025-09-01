/**
 * Vertical Selector Component
 * Allows users to select their business vertical to see personalized demos
 */

'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Calendar,
  Heart,
  ShoppingCart,
  Stethoscope,
  UtensilsCrossed,
  Wrench
} from '@/lib/icons';
import { Icon } from '@/modules/shared/ui/components/ui/icon';

import { ScenarioOption } from '../../scenarios';

import { OptimizedMotion, useReducedMotion } from './optimized-motion';

export interface VerticalOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  examples: string[];
}

const VERTICAL_OPTIONS: VerticalOption[] = [
  {
    id: 'restaurant',
    name: 'Restaurante',
    description: 'Pedidos, reservas y delivery',
    icon: UtensilsCrossed,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    examples: ['Pizzería', 'Café', 'Restaurante']
  },
  {
    id: 'medical',
    name: 'Clínica/Consultorio',
    description: 'Citas, recordatorios y seguimiento',
    icon: Stethoscope,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    examples: ['Dentista', 'Médico', 'Psicólogo']
  },
  {
    id: 'retail',
    name: 'Comercio',
    description: 'Ventas, catálogo y fidelización',
    icon: ShoppingCart,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
    examples: ['Ferretería', 'Panadería', 'Boutique']
  },
  {
    id: 'services',
    name: 'Servicios',
    description: 'Presupuestos, citas y seguimiento',
    icon: Wrench,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    examples: ['Plomería', 'Electricista', 'Abogado']
  },
  {
    id: 'beauty',
    name: 'Belleza',
    description: 'Citas, recordatorios y promociones',
    icon: Heart,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    examples: ['Peluquería', 'Spa', 'Estética']
  },
  {
    id: 'universal',
    name: 'Otro Negocio',
    description: 'Solución adaptable a cualquier negocio',
    icon: Calendar,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    examples: ['Cualquier negocio', 'Múltiples servicios']
  }
];

interface VerticalSelectorProps {
  selectedVertical: string;
  onVerticalChange: (vertical: string) => void;
  availableScenarios: Record<string, ScenarioOption>;
  className?: string;
}

export const VerticalSelector = React.memo<VerticalSelectorProps>(function VerticalSelector({
  selectedVertical,
  onVerticalChange,
  availableScenarios,
  className = ''
}) {
  const [hoveredVertical, setHoveredVertical] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Memoize scenario lookup to prevent unnecessary computations
  const getScenarioForVertical = useCallback((verticalId: string): ScenarioOption | null => {
    const scenario = Object.values(availableScenarios).find(
      s => s.vertical === verticalId || (verticalId === 'universal' && s.vertical === 'universal')
    );
    return scenario || availableScenarios['loyalty-program'] || null;
  }, [availableScenarios]);

  // Memoize vertical options with their scenarios
  const verticalOptionsWithScenarios = useMemo(() => {
    return VERTICAL_OPTIONS.map(vertical => ({
      ...vertical,
      scenario: getScenarioForVertical(vertical.id)
    }));
  }, [getScenarioForVertical]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Elige tu tipo de negocio
        </h3>
        <p className="text-sm text-gray-600">
          Te mostraremos el caso de uso perfecto para tu negocio
        </p>
      </div>

      {/* Vertical Options Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {verticalOptionsWithScenarios.map((vertical) => {
          const isSelected = selectedVertical === vertical.id;
          const isHovered = hoveredVertical === vertical.id;
          const scenario = vertical.scenario;

          return (
            <motion.button
              key={vertical.id}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? `${vertical.bgColor.replace('hover:', '')} border-current ring-2 ring-offset-2 ${vertical.color.replace('text-', 'ring-')}`
                  : vertical.bgColor
                }
              `}
              whileHover={prefersReducedMotion ? {} : { scale: 1.01, y: -1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
              onHoverStart={() => setHoveredVertical(vertical.id)}
              onHoverEnd={() => setHoveredVertical(null)}
              onClick={() => onVerticalChange(vertical.id)}
              aria-label={`Seleccionar ${vertical.name}`}
              style={{ willChange: 'transform' }}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${vertical.bgColor.replace('hover:', '').replace('bg-', 'bg-').replace('-50', '-100')} flex items-center justify-center mb-3`}>
                <Icon
                  icon={vertical.icon}
                  size="small"
                  iconClassName={`w-5 h-5 ${vertical.color}`}
                />
              </div>

              {/* Content */}
              <div>
                <h4 className={`font-semibold text-sm mb-1 ${vertical.color}`}>
                  {vertical.name}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  {vertical.description}
                </p>

                {/* Examples */}
                <div className="text-xs text-gray-500">
                  {vertical.examples.slice(0, 2).join(' • ')}
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <div className={`w-6 h-6 rounded-full ${vertical.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </motion.div>
              )}

              {/* Optimized Hover ROI preview */}
              <AnimatePresence>
                {(isHovered || isSelected) && scenario && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 z-10"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.15, ease: 'easeOut' }}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 mx-2">
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-gray-900">
                          {scenario.title}
                        </div>
                        <div className="text-green-600 font-medium">
                          {scenario.roi.metric}
                        </div>
                        <div className="text-gray-500">
                          {scenario.hook.emotional}
                        </div>
                      </div>

                      {/* Arrow pointer */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Optimized current selection summary */}
      <AnimatePresence>
        {selectedVertical && getScenarioForVertical(selectedVertical) && (
          <OptimizedMotion.ScenarioContainer
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
          >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">🎯</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm">
                Demo personalizado para {VERTICAL_OPTIONS.find(v => v.id === selectedVertical)?.name}
              </h4>
              <p className="text-green-700 text-xs">
                {getScenarioForVertical(selectedVertical)?.hook.rational}
              </p>
            </div>
          </div>
          </OptimizedMotion.ScenarioContainer>
        )}
      </AnimatePresence>
    </div>
  );
});

export default VerticalSelector;