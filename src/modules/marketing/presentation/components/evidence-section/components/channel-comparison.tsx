/**
 * Channel Comparison Component
 * Visual comparison of WhatsApp vs Email vs SMS performance
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ChannelComparison, ChannelType } from '@/modules/marketing/domain/types/evidence.types';

interface ChannelComparisonProps {
  data: ChannelComparison;
  isInView: boolean;
  className?: string;
  showAsUnified?: boolean; // Nueva prop para mostrar comparación unificada
}

interface MetricBarProps {
  label: string;
  whatsapp: number;
  email: number;
  sms: number;
  maxValue?: number;
  showPercentage?: boolean;
}

const MetricBar: React.FC<MetricBarProps> = ({
  label,
  whatsapp,
  email,
  sms,
  maxValue = 100,
  showPercentage = true
}) => {
  const normalizeValue = (value: number) => (value / maxValue) * 100;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>

      {/* WhatsApp Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium">WhatsApp</span>
          </div>
          {showPercentage && (
            <span className="text-sm font-bold text-green-600">
              {whatsapp}{maxValue === 100 ? '%' : 'x'}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-green-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${normalizeValue(whatsapp)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Email Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium">Email</span>
          </div>
          {showPercentage && (
            <span className="text-sm font-bold text-blue-600">
              {email}{maxValue === 100 ? '%' : 'x'}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-blue-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${normalizeValue(email)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
      </div>

      {/* SMS Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium">SMS</span>
          </div>
          {showPercentage && (
            <span className="text-sm font-bold text-purple-600">
              {sms}{maxValue === 100 ? '%' : 'x'}
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-purple-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${normalizeValue(sms)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
};

export function ChannelComparison({
  data,
  isInView,
  className,
  showAsUnified = true
}: ChannelComparisonProps) {
  // Calcular mejoras de WhatsApp sobre otros canales
  const improvements = {
    vsEmail: {
      openRate: Math.round(((data.whatsapp.openRate - data.email.openRate) / data.email.openRate) * 100),
      conversion: Math.round(((data.whatsapp.conversion - data.email.conversion) / data.email.conversion) * 100),
      roi: Math.round(((data.whatsapp.roi - data.email.roi) / data.email.roi) * 100)
    },
    vsSms: {
      ctr: Math.round(((data.whatsapp.ctr - data.sms.ctr) / data.sms.ctr) * 100),
      conversion: Math.round(((data.whatsapp.conversion - data.sms.conversion) / data.sms.conversion) * 100)
    }
  };

  return (
    <motion.div
      className={cn('space-y-8', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: 0.7 }}
      role="region"
      aria-label="Comparación de canales de comunicación"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">
          WhatsApp supera a todos los canales tradicionales
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground/80">
          Comparación basada en datos reales de empresas verificadas
        </p>
      </div>

      <div className="bg-card dark:bg-card/80 rounded-xl p-8 border border-border">
        {showAsUnified ? (
          // Vista unificada con todas las métricas visibles
          <div className="grid md:grid-cols-2 gap-8">
            <MetricBar
              label="Tasa de Apertura"
              whatsapp={data.whatsapp.openRate}
              email={data.email.openRate}
              sms={data.sms.openRate}
            />
            <MetricBar
              label="Click Through Rate"
              whatsapp={data.whatsapp.ctr}
              email={data.email.ctr}
              sms={data.sms.ctr}
            />
            <MetricBar
              label="Tasa de Conversión"
              whatsapp={data.whatsapp.conversion}
              email={data.email.conversion}
              sms={data.sms.conversion}
            />
            <MetricBar
              label="ROI Promedio"
              whatsapp={data.whatsapp.roi}
              email={data.email.roi}
              sms={data.sms.roi}
              maxValue={30}
              showPercentage={true}
            />
          </div>
        ) : (
          // Vista con selector (mantenida por compatibilidad)
          <div className="space-y-6">
            <MetricBar
              label="Tasa de Apertura"
              whatsapp={data.whatsapp.openRate}
              email={data.email.openRate}
              sms={data.sms.openRate}
            />
            <MetricBar
              label="Tasa de Conversión"
              whatsapp={data.whatsapp.conversion}
              email={data.email.conversion}
              sms={data.sms.conversion}
            />
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {improvements.vsEmail.openRate}% más apertura que email
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {improvements.vsEmail.conversion}% más conversión que email
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {improvements.vsEmail.roi}% mejor ROI que email
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}