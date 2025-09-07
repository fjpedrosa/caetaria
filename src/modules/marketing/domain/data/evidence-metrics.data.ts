/**
 * Key Performance Metrics Data
 * Verified metrics from WhatsApp Business success stories
 */

import { BarChart3, CheckCircle,TrendingUp } from 'lucide-react';

import type { KeyMetric, SourceLogo } from '../types/evidence.types';

/**
 * Source provider logos for attribution
 */
export const SOURCE_LOGOS: Record<string, SourceLogo> = {
  useInsider: {
    provider: 'Insider',
    logoUrl: '/images/logos/useinsider-logo.svg',
    altText: 'Use Insider'
  },
  metaBusiness: {
    provider: 'Meta Business',
    logoUrl: '/images/logos/meta-business-logo.svg',
    altText: 'Meta Business'
  },
  whatsapp: {
    provider: 'WhatsApp',
    logoUrl: '/images/logos/whatsapp-logo.svg',
    altText: 'WhatsApp Business'
  },
  iabSpain: {
    provider: 'IAB Spain',
    logoUrl: '/images/logos/iab-spain-logo.svg',
    altText: 'IAB Spain'
  }
};

/**
 * Global key metrics with verified sources
 */
export const KEY_METRICS: KeyMetric[] = [
  {
    id: 'roi-documented',
    title: 'ROI Documentado',
    value: '10-35x',
    comparison: 'vs 2-3x email',
    icon: TrendingUp,
    color: 'text-green-600',
    source: {
      name: 'Insider Commerce Guide 2024',
      url: 'https://useinsider.com/whatsapp-conversational-commerce',
      logoUrl: SOURCE_LOGOS.useInsider.logoUrl,
      year: '2024',
      verified: true
    },
    category: 'roi'
  },
  {
    id: 'conversion-rate',
    title: 'Tasa de Conversión',
    value: '3.75x',
    comparison: 'más que email',
    icon: BarChart3,
    color: 'text-blue-600',
    source: {
      name: 'Fashion Retailer Study',
      url: 'https://useinsider.com/whatsapp-commerce',
      logoUrl: SOURCE_LOGOS.useInsider.logoUrl,
      year: '2024',
      verified: true
    },
    category: 'conversion'
  },
  {
    id: 'open-rate',
    title: 'Tasa de Apertura',
    value: '98%',
    comparison: 'vs 20% email',
    icon: CheckCircle,
    color: 'text-purple-600',
    source: {
      name: 'Meta Business 2024',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.metaBusiness.logoUrl,
      year: '2024',
      verified: true
    },
    category: 'engagement'
  }
];

/**
 * Metrics by region - localized data
 */
export const REGIONAL_METRICS: Record<string, KeyMetric[]> = {
  spain: [
    {
      id: 'spain-users',
      title: 'Usuarios en España',
      value: '33M',
      comparison: '73% prefieren WhatsApp',
      icon: TrendingUp,
      color: 'text-red-600',
      source: {
        name: 'IAB Spain 2024',
        url: 'https://iabspain.es/estudio/estudio-redes-sociales-2024',
        logoUrl: SOURCE_LOGOS.iabSpain.logoUrl,
        year: '2024',
        verified: true
      },
      category: 'reach'
    }
  ],
  latam: [
    {
      id: 'latam-penetration',
      title: 'Penetración en LATAM',
      value: '91%',
      comparison: 'Brasil lidera con 120M usuarios',
      icon: TrendingUp,
      color: 'text-green-600',
      source: {
        name: 'WhatsApp Business Stats 2024',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
        year: '2024',
        verified: true
      },
      category: 'reach'
    }
  ],
  usa: [
    {
      id: 'usa-users',
      title: 'Usuarios en USA',
      value: '100M',
      comparison: '50% uso diario',
      icon: TrendingUp,
      color: 'text-blue-600',
      source: {
        name: 'Meta Announcement 2024',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.metaBusiness.logoUrl,
        year: '2024',
        verified: true
      },
      category: 'reach'
    }
  ]
};