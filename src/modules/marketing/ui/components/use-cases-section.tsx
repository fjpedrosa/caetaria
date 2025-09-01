/**
 * Use Cases Section Component
 * Interactive section that showcases different WhatsApp automation use cases
 * with card selection on left and simulator on right (desktop) or stacked (mobile)
 */

'use client';

import React, { useCallback, useMemo,useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

import { AVAILABLE_SCENARIOS, getPrimaryScenarioForVertical, ScenarioOption } from '@/modules/whatsapp-simulator/scenarios';

import { UseCaseCard } from './use-case-card';
import { UseCasesSimulator } from './use-cases-simulator';

/**
 * Use case categories with enhanced visual design
 */
interface UseCaseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  scenario: ScenarioOption;
}

// Memoized use case categories for better performance
// Currently using only available scenario (restaurant-reservation) for all use cases
const restaurantScenario = AVAILABLE_SCENARIOS['restaurant-reservation'];

const USE_CASE_CATEGORIES: UseCaseCategory[] = [
  {
    id: 'restaurant-reservation',
    title: 'Reservas de Mesa',
    description: 'Mesa siempre llena con reservas confirmadas automáticamente',
    icon: '🍽️',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
    scenario: restaurantScenario
  },
  {
    id: 'restaurant-orders',
    title: 'Pedidos Automáticos',
    description: 'Recibe pedidos 24/7 sin perder ventas por teléfono ocupado',
    icon: '🍕',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    scenario: restaurantScenario // Using same scenario temporarily
  },
  {
    id: 'medical-appointments',
    title: 'Citas Médicas',
    description: 'Elimina los no-shows con recordatorios automáticos inteligentes',
    icon: '🏥',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    scenario: restaurantScenario // Using same scenario temporarily
  },
  {
    id: 'loyalty-program',
    title: 'Fidelización VIP',
    description: 'Reconoce tickets automáticamente y recompensa a tus mejores clientes',
    icon: '🏆',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    scenario: restaurantScenario // Using same scenario temporarily
  }
];

/**
 * Use Cases Section Component
 */
export function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Memoize initial state to prevent recreations
  const initialUseCase = useMemo(() => USE_CASE_CATEGORIES[0], []);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseCategory>(initialUseCase);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle use case selection with smooth transition
  const handleUseCaseChange = useCallback((useCase: UseCaseCategory) => {
    if (useCase.id === selectedUseCase.id) return;

    setIsTransitioning(true);

    // Smooth transition with requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        setSelectedUseCase(useCase);
        setIsTransitioning(false);
      }, 150);
    });
  }, [selectedUseCase.id]);

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30"
      aria-label="Casos de uso de WhatsApp automation"
    >
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-primary font-semibold text-sm">Casos de Uso Reales</span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-6">
            Ve tu negocio en acción
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubre cómo otros negocios como el tuyo están automatizando WhatsApp
            para <span className="text-primary font-semibold">aumentar ventas</span> y
            <span className="text-primary font-semibold"> reducir trabajo manual</span>
          </p>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {/* Left Column - Use Case Cards (40% width on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xl font-semibold text-foreground mb-6 lg:mb-8">
              Selecciona tu caso de uso:
            </h3>

            <div className="space-y-3">
              {USE_CASE_CATEGORIES.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                >
                  <UseCaseCard
                    useCase={useCase}
                    isSelected={selectedUseCase.id === useCase.id}
                    onClick={() => handleUseCaseChange(useCase)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Selected Use Case Benefits */}
            <motion.div
              key={selectedUseCase.id}
              className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{selectedUseCase.icon}</span>
                <h4 className="font-semibold text-foreground text-lg">
                  {selectedUseCase.title}
                </h4>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {selectedUseCase.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg">
                  <span className="font-semibold">📈</span>
                  <span className="font-medium">{selectedUseCase.scenario.roi.metric}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                  <span className="font-semibold">💰</span>
                  <span className="font-medium">{selectedUseCase.scenario.roi.value}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="font-semibold">⏱️</span>
                  <span className="font-medium">{selectedUseCase.scenario.roi.timeline}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - WhatsApp Simulator (60% width on desktop) */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <UseCasesSimulator
                scenario={selectedUseCase.scenario}
                isTransitioning={isTransitioning}
                isInView={isInView}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}