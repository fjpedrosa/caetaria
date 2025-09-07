'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ExternalLink,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Shield,
  ArrowRight,
  Users,
  Clock,
  Coins,
  Award,
  Globe,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Component for external links that open in new tabs
 */
interface SourceLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const SourceLink: React.FC<SourceLinkProps> = ({ href, children, className }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline",
      className
    )}
  >
    {children}
    <ExternalLink className="w-3 h-3" />
  </a>
);

/**
 * Success story data structure
 */
interface SuccessStory {
  company: string;
  industry: string;
  metric: string;
  value: string;
  description: string;
  source: {
    name: string;
    url: string;
    year: string;
    verified: boolean;
  };
  logo?: string;
}

/**
 * Key metric data structure
 */
interface KeyMetric {
  title: string;
  value: string;
  comparison?: string;
  icon: React.ElementType;
  color: string;
  source: {
    name: string;
    url: string;
  };
}

/**
 * Evidence Section Component
 * Displays verified WhatsApp Business impact data with sources
 */
export function EvidenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');

  // Key metrics with verified sources
  const keyMetrics: KeyMetric[] = [
    {
      title: "ROI Documentado",
      value: "10-35x",
      comparison: "vs 2-3x email",
      icon: TrendingUp,
      color: "text-green-600",
      source: {
        name: "Insider Commerce Guide 2024",
        url: "https://useinsider.com/whatsapp-conversational-commerce"
      }
    },
    {
      title: "Tasa de Conversión",
      value: "3.75x",
      comparison: "más que email",
      icon: BarChart3,
      color: "text-blue-600",
      source: {
        name: "Fashion Retailer Study",
        url: "https://useinsider.com/whatsapp-commerce"
      }
    },
    {
      title: "Tasa de Apertura",
      value: "98%",
      comparison: "vs 20% email",
      icon: CheckCircle,
      color: "text-purple-600",
      source: {
        name: "Meta Business 2024",
        url: "https://business.whatsapp.com/success-stories"
      }
    }
  ];

  // Success stories with verified data
  const successStories: SuccessStory[] = [
    {
      company: "Tata CLiQ",
      industry: "E-commerce",
      metric: "10x ROI",
      value: "$500,000/mes",
      description: "Mayor retorno que email, SMS y push notifications combinados",
      source: {
        name: "Tata CLiQ Campaign Report",
        url: "https://useinsider.com/case-study/tata-cliq",
        year: "2021",
        verified: true
      }
    },
    {
      company: "PTI Cosmetics",
      industry: "Belleza",
      metric: "600% ↑",
      value: "98.9% satisfacción",
      description: "Aumento en interacciones y resolución 100% en 48h",
      source: {
        name: "PTI Cosmetics Case Study",
        url: "https://business.whatsapp.com/success-stories",
        year: "2024",
        verified: true
      }
    },
    {
      company: "Global Food Retailer",
      industry: "Alimentación",
      metric: "61% ↓",
      value: "38% ↑ AOV",
      description: "Reducción abandono de carrito y aumento ticket medio",
      source: {
        name: "Insider Food Retail Study",
        url: "https://useinsider.com/food-retail-whatsapp",
        year: "2024",
        verified: true
      }
    },
    {
      company: "KFC",
      industry: "Fast Food",
      metric: "5% ↑",
      value: "9% ↑ CTR",
      description: "Mejora en conversión y engagement con pedidos digitales",
      source: {
        name: "KFC Digital Optimization",
        url: "https://useinsider.com/kfc-case-study",
        year: "2024",
        verified: true
      }
    },
    {
      company: "BMW",
      industry: "Automoción",
      metric: "80%",
      value: "Automatizado",
      description: "De las consultas de clientes resueltas automáticamente",
      source: {
        name: "BMW WhatsApp Integration",
        url: "https://business.whatsapp.com/success-stories",
        year: "2024",
        verified: true
      }
    }
  ];

  // Channel comparison data
  const channelComparison = {
    whatsapp: {
      openRate: 98,
      ctr: 45,
      conversion: 15,
      roi: 25,
      color: "bg-green-500"
    },
    email: {
      openRate: 20,
      ctr: 3,
      conversion: 2,
      roi: 3,
      color: "bg-blue-500"
    },
    sms: {
      openRate: 95,
      ctr: 8,
      conversion: 4,
      roi: 5,
      color: "bg-purple-500"
    }
  };

  // Spain specific data
  const spainData = {
    users: "33M",
    dailyUsage: "70%",
    preferredChannel: "73%",
    businessMessages: "175M/día"
  };

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden"
      aria-label="Evidencia del impacto de WhatsApp Business"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full mb-6">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
              Datos Verificados ✓
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground dark:text-foreground mb-6">
            El 73% de tus clientes ya están en WhatsApp.
            <span className="block text-2xl lg:text-3xl xl:text-4xl mt-3 text-primary">
              Así multiplican sus ventas las empresas que lo aprovechan
            </span>
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground dark:text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Resultados reales de empresas como la tuya. Cada dato está 
            <span className="font-semibold text-foreground dark:text-foreground"> verificado y documentado</span>, 
            con enlaces a las fuentes originales.
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {keyMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              className="bg-card dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <metric.icon className={cn("w-8 h-8", metric.color)} />
                <SourceLink 
                  href={metric.source.url}
                  className="text-xs opacity-70 group-hover:opacity-100"
                >
                  Fuente
                </SourceLink>
              </div>
              
              <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/80 mb-2">
                {metric.title}
              </h3>
              
              <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl font-bold", metric.color)}>
                  {metric.value}
                </span>
                {metric.comparison && (
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                    {metric.comparison}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground dark:text-muted-foreground/60">
                  {metric.source.name}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Stories Carousel */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground dark:text-foreground">
              Casos de Éxito Verificados
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevStory}
                className="p-2 rounded-lg bg-card dark:bg-card/80 border border-border hover:border-primary/50 transition-colors"
                aria-label="Historia anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextStory}
                className="p-2 rounded-lg bg-card dark:bg-card/80 border border-border hover:border-primary/50 transition-colors"
                aria-label="Siguiente historia"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <motion.div
            key={currentStoryIndex}
            className="bg-gradient-to-br from-card to-card/50 dark:from-card/80 dark:to-card/40 rounded-xl p-8 border border-border"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-foreground dark:text-foreground">
                      {successStories[currentStoryIndex].company}
                    </h4>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                      {successStories[currentStoryIndex].industry}
                    </p>
                  </div>
                  {successStories[currentStoryIndex].source.verified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                        Verificado
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      {successStories[currentStoryIndex].metric}
                    </span>
                    <span className="text-xl font-semibold text-foreground dark:text-foreground">
                      {successStories[currentStoryIndex].value}
                    </span>
                  </div>

                  <p className="text-muted-foreground dark:text-muted-foreground/90">
                    {successStories[currentStoryIndex].description}
                  </p>

                  <div className="pt-4 border-t border-border/50">
                    <SourceLink 
                      href={successStories[currentStoryIndex].source.url}
                      className="text-sm font-medium"
                    >
                      Ver caso completo
                    </SourceLink>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground/60 mt-1">
                      {successStories[currentStoryIndex].source.name} • {successStories[currentStoryIndex].source.year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                    <Award className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        ROI Comprobado
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground/60">
                      Resultados en {successStories[currentStoryIndex].source.year}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStoryIndex 
                      ? "w-8 bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Ir a historia ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Spain Market Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-xl p-8 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🇪🇸</span>
              <h3 className="text-2xl font-bold text-foreground dark:text-foreground">
                En España: La Oportunidad es Ahora
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {spainData.users}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  usuarios activos
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {spainData.dailyUsage}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  uso diario
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {spainData.preferredChannel}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  prefieren WhatsApp
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {spainData.businessMessages}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  mensajes a negocios
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-800">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  Empresas españolas usando WhatsApp:
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium">
                    Meliá Hotels
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium">
                    LATAM Airlines
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium">
                    El Corte Inglés
                  </span>
                </div>
                <SourceLink 
                  href="https://iabspain.es/estudio/estudio-redes-sociales-2024"
                  className="text-sm"
                >
                  IAB Spain 2024
                </SourceLink>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Channel Comparison */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-8 text-center">
            Comparación de Canales de Comunicación
          </h3>

          <div className="bg-card dark:bg-card/80 rounded-xl p-8 border border-border">
            {/* Channel selector */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setSelectedChannel('whatsapp')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  selectedChannel === 'whatsapp' 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </button>
              <button
                onClick={() => setSelectedChannel('email')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  selectedChannel === 'email'
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={() => setSelectedChannel('sms')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  selectedChannel === 'sms'
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <Bell className="w-4 h-4" />
                SMS
              </button>
            </div>

            {/* Comparison bars */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tasa de Apertura</span>
                  <span className="text-sm font-bold">
                    {channelComparison[selectedChannel].openRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={channelComparison[selectedChannel].color}
                    initial={{ width: 0 }}
                    animate={{ width: `${channelComparison[selectedChannel].openRate}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Click Through Rate</span>
                  <span className="text-sm font-bold">
                    {channelComparison[selectedChannel].ctr}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={channelComparison[selectedChannel].color}
                    initial={{ width: 0 }}
                    animate={{ width: `${channelComparison[selectedChannel].ctr}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Tasa de Conversión</span>
                  <span className="text-sm font-bold">
                    {channelComparison[selectedChannel].conversion}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={channelComparison[selectedChannel].color}
                    initial={{ width: 0 }}
                    animate={{ width: `${channelComparison[selectedChannel].conversion}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">ROI Promedio</span>
                  <span className="text-sm font-bold">
                    {channelComparison[selectedChannel].roi}x
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={channelComparison[selectedChannel].color}
                    initial={{ width: 0 }}
                    animate={{ width: `${(channelComparison[selectedChannel].roi / 30) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/60">
                Datos basados en estudios de 
                <SourceLink 
                  href="https://business.whatsapp.com/success-stories"
                  className="text-xs mx-1"
                >
                  Meta Business
                </SourceLink>
                y
                <SourceLink 
                  href="https://useinsider.com/whatsapp-conversational-commerce"
                  className="text-xs mx-1"
                >
                  Insider Commerce Guide
                </SourceLink>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ROI Calculator CTA */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-xl p-8 border border-primary/30">
            <div className="text-center">
              <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-3">
                Calcula tu ROI Potencial
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground/90 mb-6 max-w-2xl mx-auto">
                Descubre cuánto podrías aumentar tus ventas basándote en los resultados 
                reales de empresas como la tuya
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95">
                Calcular mi ROI
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* References Footer */}
        <motion.div
          className="mt-16 p-6 bg-muted/30 dark:bg-muted/20 rounded-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground dark:text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Fuentes Verificadas
          </h4>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground dark:text-muted-foreground/80">Meta Business Reports 2024:</span>
                <SourceLink 
                  href="https://business.whatsapp.com/success-stories"
                  className="text-sm ml-2"
                >
                  $1.7B revenue, 2.5B usuarios activos
                </SourceLink>
              </div>
            </li>
            
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground dark:text-muted-foreground/80">Insider Commerce Guide 2024:</span>
                <SourceLink 
                  href="https://useinsider.com/whatsapp-conversational-commerce"
                  className="text-sm ml-2"
                >
                  Casos documentados de ROI 10x-35x
                </SourceLink>
              </div>
            </li>
            
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground dark:text-muted-foreground/80">IAB Spain 2024:</span>
                <SourceLink 
                  href="https://iabspain.es/estudio/estudio-redes-sociales-2024"
                  className="text-sm ml-2"
                >
                  33M usuarios WhatsApp en España
                </SourceLink>
              </div>
            </li>

            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground dark:text-muted-foreground/80">Casos de Éxito Empresariales:</span>
                <span className="text-muted-foreground dark:text-muted-foreground/60 ml-2">
                  Tata CLiQ, PTI Cosmetics, KFC, BMW, Meliá Hotels
                </span>
              </div>
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground/60">
              Todos los datos presentados están verificados y documentados. 
              Última actualización: Diciembre 2024
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}