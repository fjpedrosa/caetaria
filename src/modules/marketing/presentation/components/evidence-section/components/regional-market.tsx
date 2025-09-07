/**
 * Regional Market Component
 * Displays market data for specific regions
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare,TrendingUp, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { RegionalMarketData } from '@/modules/marketing/domain/types/evidence.types';

interface RegionalMarketProps {
  data: RegionalMarketData;
  isInView: boolean;
  className?: string;
  hideFlag?: boolean;
}

export function RegionalMarket({
  data,
  isInView,
  className,
  hideFlag = false
}: RegionalMarketProps) {
  const getRegionTitle = (region: string): string => {
    const titles: Record<string, string> = {
      spain: 'España',
      latam: 'Latinoamérica',
      usa: 'Estados Unidos',
      europe: 'Europa',
      asia: 'Asia-Pacífico',
      global: 'Global'
    };
    return titles[region] || region;
  };

  return (
    <motion.div
      className={cn('', className)}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: 0.6 }}
      role="region"
      aria-label={`Datos del mercado de ${getRegionTitle(data.region)}`}
    >
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-8 border border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          {!hideFlag && data.flag && (
            <span className="text-2xl" aria-hidden="true">{data.flag}</span>
          )}
          <Globe className="w-6 h-6 text-primary" aria-hidden="true" />
          <h3 className="text-2xl font-bold text-foreground dark:text-foreground">
            En {getRegionTitle(data.region)}: La Oportunidad es Ahora
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Usuarios Activos */}
          <div className="text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" aria-hidden="true" />
            <p className="text-3xl font-bold text-primary mb-1">
              {data.users}
            </p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
              usuarios activos
            </p>
          </div>

          {/* Uso Diario */}
          {data.dailyUsage && (
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2 opacity-60" aria-hidden="true" />
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {data.dailyUsage}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                uso diario
              </p>
            </div>
          )}

          {/* Canal Preferido */}
          {data.preferredChannel && (
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2 opacity-60" aria-hidden="true" />
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {data.preferredChannel}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                prefieren WhatsApp
              </p>
            </div>
          )}

          {/* Mensajes de Negocio */}
          {data.businessMessages && (
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2 opacity-60" aria-hidden="true" />
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {data.businessMessages}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                mensajes a negocios
              </p>
            </div>
          )}
        </div>

        {/* Empresas Clave */}
        {data.keyCompanies && data.keyCompanies.length > 0 && (
          <div className="mt-6 pt-6 border-t border-primary/20">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                Empresas líderes usando WhatsApp:
              </p>
              <div className="flex flex-wrap gap-3">
                {data.keyCompanies.map((company, index) => (
                  <motion.span
                    key={company}
                    className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium shadow-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {company}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fuente de Datos */}
        {data.sources && data.sources.length > 0 && (
          <div className="mt-4 flex justify-end">
            {data.sources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Fuente: {source.name} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}