/**
 * Use Cases Section Component
 * Interactive section that showcases different WhatsApp automation use cases
 * with card selection on left and simulator on right (desktop) or stacked (mobile)
 */

'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  ShoppingBag,
  Stethoscope,
  TrendingUp,
  Users,
  UtensilsCrossed} from 'lucide-react';

import { SimulationType } from '@/modules/marketing/domain/types/simulation.types';

import { WhatsAppSimulatorContainer } from './simulation/whatsapp-simulator-container';
import { UseCaseCard } from './use-case-card';

/**
 * Use case categories with enhanced visual design and metrics
 */
interface UseCaseCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any; // LucideIcon type
  metrics: {
    primary: { label: string; value: string; icon: any };
    secondary: { label: string; value: string; icon: any };
    tertiary: { label: string; value: string; icon: any };
  };
}

// Memoized use case categories with improved marketing copy
const USE_CASE_CATEGORIES: UseCaseCategory[] = [
  {
    id: 'restaurant-reservation',
    title: 'Tu comedor lleno incluso los martes',
    subtitle: 'Sistema de Reservas 24/7',
    description: 'Deja de perder el 30% de reservas que llegan fuera de horario. Tu bot reserva 24/7, confirma automáticamente y reduce no-shows un 70%',
    icon: UtensilsCrossed,
    metrics: {
      primary: { label: 'más reservas', value: '+30%', icon: TrendingUp },
      secondary: { label: 'ingresos', value: '+35%', icon: Coins },
      tertiary: { label: 'ROI desde', value: 'día 3', icon: Clock }
    }
  },
  {
    id: 'restaurant-orders',
    title: 'Compite con Glovo sin pagar comisiones',
    subtitle: 'Pedidos Directos WhatsApp',
    description: 'El 67% de pedidos llegan fuera de tu horario. Captura todos, envía la carta con fotos, cobra por WhatsApp y ahorra el 30% en comisiones',
    icon: ShoppingBag,
    metrics: {
      primary: { label: 'más pedidos', value: '+40%', icon: TrendingUp },
      secondary: { label: 'sin comisiones', value: '-30%', icon: Coins },
      tertiary: { label: 'setup en', value: '2h', icon: Clock }
    }
  },
  {
    id: 'medical-appointments',
    title: 'Cero huecos en agenda, cero llamadas perdidas',
    subtitle: 'Gestión Inteligente de Citas',
    description: 'Tu recepcionista virtual que nunca descansa: gestiona citas, envía recordatorios, rellena huecos de cancelaciones al instante',
    icon: Stethoscope,
    metrics: {
      primary: { label: 'no-shows', value: '-85%', icon: Users },
      secondary: { label: 'tiempo admin', value: '-25%', icon: Clock },
      tertiary: { label: 'ocupación', value: '95%', icon: CheckCircle }
    }
  },
  {
    id: 'loyalty-program',
    title: 'Convierte compradores en fans como Zara',
    subtitle: 'Fidelización Automática',
    description: 'WhatsApp detecta el ticket, suma puntos, avisa de ofertas exclusivas y recupera al 40% de clientes dormidos. Sin apps que nadie descarga',
    icon: Award,
    metrics: {
      primary: { label: 'recompra', value: '+47%', icon: TrendingUp },
      secondary: { label: 'ticket medio', value: '+25%', icon: Coins },
      tertiary: { label: 'ROI <', value: '1 semana', icon: Calendar }
    }
  }
];

/**
 * Use Cases Section Component
 */
export function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // Memoize initial state to prevent recreations
  const initialUseCase = useMemo(() => USE_CASE_CATEGORIES[0], []);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseCategory>(initialUseCase);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  // Handle use case selection with smooth transition and accessibility
  const handleUseCaseChange = useCallback((useCase: UseCaseCategory) => {
    if (useCase.id === selectedUseCase.id) return;

    setIsTransitioning(true);

    // Announce change to screen readers
    setAnnouncement(`Cambiado a ${useCase.title}. Simulación cargando.`);

    // Smooth transition with requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        setSelectedUseCase(useCase);
        setIsTransitioning(false);

        // Focus management for keyboard users
        const simulatorElement = document.getElementById(`panel-${useCase.id}`);
        if (simulatorElement) {
          simulatorElement.focus();
        }
      }, 150);
    });
  }, [selectedUseCase.id]);

  // Keyboard navigation for use case cards
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    const cards = USE_CASE_CATEGORIES;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (index < cards.length - 1) {
          handleUseCaseChange(cards[index + 1]);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index > 0) {
          handleUseCaseChange(cards[index - 1]);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleUseCaseChange(cards[index]);
        break;
    }
  }, [handleUseCaseChange]);

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30"
      aria-label="Casos de uso de WhatsApp automation"
      role="region"
    >
      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-primary font-semibold text-sm">Casos de Éxito Reales</span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-6">
            El 73% de tus clientes prefieren WhatsApp.
            <span className="block text-2xl lg:text-3xl xl:text-4xl mt-2 text-primary">
              ¿Y si nunca más perdieras una venta?
            </span>
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Únete a <span className="font-bold text-foreground dark:text-foreground">+2.400 negocios españoles</span> que ya no pierden clientes
            por no contestar a tiempo. <span className="text-primary font-semibold">Sin contratar personal extra.</span>
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
          <div
            className="lg:col-span-5 space-y-4"
            role="tablist"
            aria-label="Casos de uso disponibles"
            aria-orientation="vertical"
          >
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-6 lg:mb-8">
              ¿Cuál es tu negocio?
            </h3>

            <div className="space-y-3">
              {USE_CASE_CATEGORIES.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  role="tab"
                  aria-selected={selectedUseCase.id === useCase.id}
                  aria-controls={`panel-${useCase.id}`}
                  tabIndex={selectedUseCase.id === useCase.id ? 0 : -1}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  <UseCaseCard
                    useCase={useCase}
                    isSelected={selectedUseCase.id === useCase.id}
                    onClick={() => handleUseCaseChange(useCase)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              key={selectedUseCase.id}
              className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <h4 className="font-bold text-foreground dark:text-foreground text-lg mb-2">
                  ¿Listo para automatizar tu {selectedUseCase.title.toLowerCase()}?
                </h4>
                <p className="text-muted-foreground dark:text-muted-foreground/90 text-sm mb-4">
                  Configuración en 2 horas · Sin permanencia · Soporte en español
                </p>
                <button
                  className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Ver demo personalizada para ${selectedUseCase.title}`}
                >
                  Ver demo personalizada →
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - WhatsApp Simulator (60% width on desktop) */}
          <div
            className="lg:col-span-7"
            role="tabpanel"
            id={`panel-${selectedUseCase.id}`}
            aria-labelledby={`tab-${selectedUseCase.id}`}
            tabIndex={-1}
            aria-live="polite"
          >
            <motion.div
              key={selectedUseCase.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              {/* Phone Mockup with Simulator */}
              <div className="relative mx-auto w-[320px] sm:w-[360px] lg:w-[380px]">
                {/* iPhone Frame */}
                <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.2rem] p-[2px] shadow-2xl">
                  {/* Side buttons */}
                  <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-lg"></div>
                  <div className="absolute -left-[2px] top-28 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>
                  <div className="absolute -left-[2px] top-40 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>

                  {/* Inner bezel */}
                  <div className="bg-black rounded-[3rem] p-[6px] shadow-inner">
                    {/* Screen container */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.7rem] overflow-hidden" style={{ aspectRatio: '390/844' }}>
                      {/* Dynamic Island */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-30 shadow-lg"></div>

                      {/* WhatsApp Simulator */}
                      <div className="h-full">
                        <WhatsAppSimulatorContainer
                          key={selectedUseCase.id} // Force remount on scenario change
                          simulationType={selectedUseCase.id as SimulationType}
                          isInView={isInView && !isTransitioning}
                          onSimulationComplete={() => {
                            // Optional: Track completion
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shadow and reflection */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-black/20 dark:bg-black/40 rounded-[50%] blur-xl"></div>
              </div>

              {/* Simulator Info */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  💡 Simulación real de WhatsApp Business
                </p>
                <p className="text-xs text-muted-foreground/60 dark:text-muted-foreground/50 mt-1">
                  Observa cómo automatizamos las conversaciones
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}