'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  Bot,
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  CreditCard,
  type LucideIcon,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap} from 'lucide-react';

import { MARKETING_COPY } from '@/modules/marketing/domain/copy';

// Tipos para el hook
export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  badge?: string;
  isPremium?: boolean;
  isPopular?: boolean;
  order: number;
}

export interface BenefitWithIcon {
  text: string;
  icon: LucideIcon;
  useCheckmark?: boolean;
}

export interface FeatureViewModel {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  benefits: BenefitWithIcon[];
  badge?: string;
  cardStyles: {
    container: string;
    header: string;
    iconContainer: string;
    benefitCheck: string;
    titleColor: string;
  };
  isPopular: boolean;
  isPremium: boolean;
}

// Mapeo correcto de iconos para features
const featureIconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  store: ShoppingCart,
  automation: Bot,
  chat: MessageCircle,
};

// Mapeo de iconos para beneficios específicos - más preciso
const benefitIconMap: Record<string, LucideIcon> = {
  // Reservas - Primera tarjeta
  'reduce cancelaciones drásticamente con confirmaciones': CalendarCheck,
  'optimiza la ocupación en todos los horarios': TrendingUp,
  'ahorra horas semanales en gestión manual': Clock,
  'follow-ups automáticos sin intervención': MessageCircle,
  // Pedidos - Segunda tarjeta
  'catálogo visual con precios actualizados': ShoppingBag,
  'cobra directamente por whatsapp': CreditCard,
  'stock sincronizado en tiempo real': RefreshCw,
  'pedidos automáticos sin horarios': Zap,
  // Automatización - Tercera tarjeta
  'respuesta instantánea aumenta conversión': Zap,
  'escalado inteligente a humano si necesario': Users,
  'aprende y mejora automáticamente': TrendingUp,
  'recupera clientes inactivos automáticamente': MessageCircle,
};

/**
 * Custom hook que encapsula toda la lógica del componente FeaturesGrid
 * Siguiendo Clean Architecture - separa lógica de presentación
 */
export const useFeaturesGrid = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: '-100px'
  });

  // Helper para obtener el icono del beneficio - siempre usa iconos descriptivos
  const getBenefitIcon = (benefit: string): LucideIcon => {
    const lowerBenefit = benefit.toLowerCase();

    // Buscar coincidencia exacta primero
    if (benefitIconMap[lowerBenefit]) {
      return benefitIconMap[lowerBenefit];
    }

    // Buscar coincidencia parcial con las claves del mapa
    for (const [key, icon] of Object.entries(benefitIconMap)) {
      if (lowerBenefit === key.toLowerCase()) {
        return icon;
      }
    }

    // Iconos por palabras clave si no hay coincidencia exacta
    if (lowerBenefit.includes('cancelacion') || lowerBenefit.includes('reduce')) return CalendarCheck;
    if (lowerBenefit.includes('optimiza') || lowerBenefit.includes('ocupación')) return TrendingUp;
    if (lowerBenefit.includes('ahorra') || lowerBenefit.includes('horas')) return Clock;
    if (lowerBenefit.includes('follow') || lowerBenefit.includes('automático')) return MessageCircle;
    if (lowerBenefit.includes('catálogo') || lowerBenefit.includes('visual')) return ShoppingBag;
    if (lowerBenefit.includes('cobra') || lowerBenefit.includes('pago')) return CreditCard;
    if (lowerBenefit.includes('stock') || lowerBenefit.includes('sincronizado')) return RefreshCw;
    if (lowerBenefit.includes('pedidos') || lowerBenefit.includes('24/7')) return Zap;
    if (lowerBenefit.includes('respuesta') || lowerBenefit.includes('instantánea')) return Zap;
    if (lowerBenefit.includes('escalado') || lowerBenefit.includes('humano')) return Users;
    if (lowerBenefit.includes('aprende') || lowerBenefit.includes('mejora')) return TrendingUp;
    if (lowerBenefit.includes('recupera') || lowerBenefit.includes('clientes')) return MessageCircle;

    return Check; // Fallback to checkmark only if nothing matches
  };

  // Transformar datos del dominio a ViewModels para presentación
  const features = useMemo((): FeatureViewModel[] => {
    return MARKETING_COPY.features.items.map((item, index) => {
      // Determinar si es popular (primera tarjeta) o premium (última)
      const isPopular = index === 0;
      const isPremium = index === MARKETING_COPY.features.items.length - 1;

      // Obtener icono con mapeo correcto
      const IconComponent = featureIconMap[item.icon] || Calendar;

      // Mapear beneficios con iconos descriptivos siempre
      const benefitsWithIcons: BenefitWithIcon[] = item.benefits.map(benefit => ({
        text: benefit,
        icon: getBenefitIcon(benefit), // Siempre usar icono descriptivo
        useCheckmark: false // Nunca usar checkmark por defecto
      }));

      // Estilos consistentes para todas las tarjetas con soporte dark mode
      const cardStyles = {
        container: `
          relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm 
          border border-gray-100 dark:border-gray-800
          transition-all duration-150 ease-in-out hover:shadow-lg hover:scale-[1.02]
          dark:hover:shadow-2xl dark:hover:shadow-primary/10
          ${isPremium ? 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900' : ''}
        `,
        header: 'flex items-start gap-4 mb-6',
        iconContainer: 'p-3 rounded-xl bg-primary/10 dark:bg-primary/20',
        benefitCheck: 'text-success',
        titleColor: 'text-primary', // Color primario para títulos
      };

      return {
        id: `feature-${index}`,
        title: item.title,
        description: item.description,
        icon: IconComponent,
        benefits: benefitsWithIcons,
        badge: isPopular ? 'Más Popular' : undefined,
        cardStyles,
        isPopular,
        isPremium,
      };
    });
  }, []);

  // Configuración de animaciones
  const animationConfig = useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      },
    },
    badge: {
      initial: {
        opacity: 0,
        x: -20
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          delay: 0.3,
          duration: 0.4,
        },
      },
    },
  }), []);

  // Handlers para interacciones (si se necesitan en el futuro)
  const handleFeatureClick = useCallback((featureId: string) => {
    // Lógica para tracking de analytics
    console.log('Feature clicked:', featureId);
  }, []);

  const handleBenefitHover = useCallback((benefitText: string) => {
    // Lógica para tooltips o destacados
    console.log('Benefit hovered:', benefitText);
  }, []);

  // Datos del header
  const headerData = {
    badge: {
      text: MARKETING_COPY.features.badge,
      variant: 'promotional' as const,
      icon: Target, // Icono en lugar de emoji
    },
    title: {
      main: MARKETING_COPY.features.title,
      highlight: MARKETING_COPY.features.titleHighlight || 'gestionar tu negocio completo',
    },
    subtitle: MARKETING_COPY.features.subtitle,
  };

  // Datos de background effects
  const backgroundEffects = {
    showGradient: true,
    showParticles: false, // Simplificado para mejor performance
  };

  return {
    // Referencias
    containerRef,

    // Estado
    isInView,

    // Datos transformados
    features,
    headerData,
    backgroundEffects,

    // Configuraciones
    animationConfig,

    // Handlers
    handlers: {
      onFeatureClick: handleFeatureClick,
      onBenefitHover: handleBenefitHover,
    },

    // Utilidades
    getCheckIcon: () => Check,
  };
};