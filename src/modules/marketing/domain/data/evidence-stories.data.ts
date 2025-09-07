/**
 * Success Stories Data
 * Verified business cases with documented ROI
 */

import type { SuccessStory } from '../types/evidence.types';

import { SOURCE_LOGOS } from './evidence-metrics.data';

/**
 * Global success stories - most impactful cases
 */
export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'tata-cliq',
    company: 'Tata CLiQ',
    industry: 'Comercio',
    metric: '10x ROI',
    value: '$500,000/mes',
    description: 'Mayor retorno que email, SMS y push notifications combinados',
    source: {
      name: 'Tata CLiQ Campaign Report',
      url: 'https://useinsider.com/case-study/tata-cliq',
      logoUrl: SOURCE_LOGOS.useInsider.logoUrl,
      year: '2021',
      verified: true
    },
    logoUrl: '/images/companies/tata-cliq-logo.svg',
    featured: true,
    region: 'asia'
  },
  {
    id: 'pti-cosmetics',
    company: 'PTI Cosmetics',
    industry: 'Belleza',
    metric: '600% ↑',
    value: '98.9% satisfacción',
    description: 'Aumento en interacciones y resolución 100% en 48h',
    source: {
      name: 'PTI Cosmetics Case Study',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/pti-logo.svg',
    featured: true,
    region: 'global'
  },
  {
    id: 'global-food-retailer',
    company: 'Global Food Retailer',
    industry: 'Alimentación',
    metric: '61% ↓',
    value: '38% ↑ AOV',
    description: 'Reducción abandono de carrito y aumento ticket medio',
    source: {
      name: 'Insider Food Retail Study',
      url: 'https://useinsider.com/food-retail-whatsapp',
      logoUrl: SOURCE_LOGOS.useInsider.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/food-retailer-logo.svg',
    region: 'global'
  },
  {
    id: 'kfc',
    company: 'KFC',
    industry: 'Fast Food',
    metric: '5% ↑',
    value: '9% ↑ CTR',
    description: 'Mejora en conversión y engagement con pedidos digitales',
    source: {
      name: 'KFC Digital Optimization',
      url: 'https://useinsider.com/kfc-case-study',
      logoUrl: SOURCE_LOGOS.useInsider.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/kfc-logo.svg',
    featured: true,
    region: 'usa'
  },
  {
    id: 'bmw',
    company: 'BMW',
    industry: 'Automoción',
    metric: '80%',
    value: 'Automatizado',
    description: 'De las consultas de clientes resueltas automáticamente',
    source: {
      name: 'BMW WhatsApp Integration',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/bmw-logo.svg',
    featured: true,
    region: 'europe'
  },
  {
    id: 'melia-hotels',
    company: 'Meliá Hotels',
    industry: 'Hospitalidad',
    metric: '45% ↑',
    value: 'Reservas directas',
    description: 'Incremento en reservas directas sin comisiones',
    source: {
      name: 'Meliá Hotels Case Study',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/melia-logo.svg',
    region: 'spain'
  },
  {
    id: 'banco-bolivariano',
    company: 'Banco Bolivariano',
    industry: 'Banca',
    metric: '98%',
    value: 'Consultas por WhatsApp',
    description: '56% servicios adicionales vendidos, 46% menos llamadas',
    source: {
      name: 'Banking Sector Case Study',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/banco-bolivariano-logo.svg',
    region: 'latam'
  },
  {
    id: 'hair-originals',
    company: 'HairOriginals',
    industry: 'D2C Beauty',
    metric: '52% ↓',
    value: 'CAC Reducido',
    description: 'Reducción en Customer Acquisition Cost con Click to WhatsApp',
    source: {
      name: 'D2C Brand Case Study',
      url: 'https://business.whatsapp.com/success-stories',
      logoUrl: SOURCE_LOGOS.metaBusiness.logoUrl,
      year: '2024',
      verified: true
    },
    logoUrl: '/images/companies/hair-originals-logo.svg',
    region: 'global'
  }
];

/**
 * Success stories by region for localized display
 */
export const REGIONAL_SUCCESS_STORIES: Record<string, string[]> = {
  spain: ['melia-hotels', 'el-corte-ingles', 'latam-airlines'],
  latam: ['banco-bolivariano', 'tata-cliq', 'pti-cosmetics'],
  usa: ['kfc', 'bmw', 'hair-originals'],
  europe: ['bmw', 'melia-hotels', 'global-food-retailer'],
  asia: ['tata-cliq', 'pti-cosmetics', 'global-food-retailer']
};

/**
 * Get featured stories for homepage
 */
export const getFeaturedStories = (limit: number = 4): SuccessStory[] => {
  return SUCCESS_STORIES
    .filter(story => story.featured)
    .slice(0, limit);
};

/**
 * Get stories by region
 */
export const getStoriesByRegion = (region: string): SuccessStory[] => {
  const storyIds = REGIONAL_SUCCESS_STORIES[region] || [];
  return SUCCESS_STORIES.filter(story => storyIds.includes(story.id));
};