/**
 * Regional Market Data
 * WhatsApp Business adoption by geographic region
 */

import type { ChannelComparison,RegionalMarketData } from '../types/evidence.types';

import { SOURCE_LOGOS } from './evidence-metrics.data';

/**
 * Market data by region - based on 2024-2025 research
 */
export const REGIONAL_MARKET_DATA: Record<string, RegionalMarketData> = {
  spain: {
    region: 'spain',
    flag: '🇪🇸',
    users: '33M',
    dailyUsage: '70%',
    preferredChannel: '73%',
    businessMessages: '175M/día',
    penetrationRate: '91%',
    keyCompanies: ['Meliá Hotels', 'LATAM Airlines', 'El Corte Inglés'],
    sources: [
      {
        name: 'IAB Spain 2024',
        url: 'https://iabspain.es/estudio/estudio-redes-sociales-2024',
        logoUrl: SOURCE_LOGOS.iabSpain.logoUrl,
        verified: true
      }
    ]
  },
  latam: {
    region: 'latam',
    flag: '🌎',
    users: '250M+',
    dailyUsage: '91%',
    preferredChannel: '80%',
    businessMessages: '2B/día',
    penetrationRate: '92%',
    keyCompanies: ['Banco Bolivariano', 'Magazine Luiza', 'Mercado Libre'],
    sources: [
      {
        name: 'WhatsApp Business LATAM Report',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
        verified: true
      }
    ]
  },
  usa: {
    region: 'usa',
    flag: '🇺🇸',
    users: '100M',
    dailyUsage: '50%',
    preferredChannel: '34%',
    businessMessages: '500M/día',
    penetrationRate: '42%',
    keyCompanies: ['KFC', 'BMW USA', 'Best Buy'],
    sources: [
      {
        name: 'Meta Business USA 2024',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.metaBusiness.logoUrl,
        verified: true
      }
    ]
  },
  europe: {
    region: 'europe',
    flag: '🇪🇺',
    users: '200M+',
    dailyUsage: '73%',
    preferredChannel: '68%',
    businessMessages: '1.5B/día',
    penetrationRate: '81%',
    keyCompanies: ['BMW', 'Lufthansa', 'Carrefour'],
    sources: [
      {
        name: 'WhatsApp Business Europe Report',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
        verified: true
      }
    ]
  },
  asia: {
    region: 'asia',
    flag: '🌏',
    users: '750M+',
    dailyUsage: '87%',
    preferredChannel: '85%',
    businessMessages: '5B/día',
    penetrationRate: '91%',
    keyCompanies: ['Tata CLiQ', 'Grab', 'Tokopedia'],
    sources: [
      {
        name: 'WhatsApp Business Asia Report',
        url: 'https://business.whatsapp.com/success-stories',
        logoUrl: SOURCE_LOGOS.whatsapp.logoUrl,
        verified: true
      }
    ]
  }
};

/**
 * Channel comparison data - global averages
 */
export const CHANNEL_COMPARISON: ChannelComparison = {
  whatsapp: {
    openRate: 98,
    ctr: 45,
    conversion: 15,
    roi: 25,
    color: 'bg-green-500'
  },
  email: {
    openRate: 20,
    ctr: 3,
    conversion: 2,
    roi: 3,
    color: 'bg-blue-500'
  },
  sms: {
    openRate: 95,
    ctr: 8,
    conversion: 4,
    roi: 5,
    color: 'bg-purple-500'
  }
};

/**
 * Regional channel comparison variations
 */
export const REGIONAL_CHANNEL_COMPARISON: Record<string, ChannelComparison> = {
  spain: {
    whatsapp: {
      openRate: 98,
      ctr: 48,
      conversion: 18,
      roi: 28,
      color: 'bg-green-500'
    },
    email: {
      openRate: 22,
      ctr: 3.5,
      conversion: 2.5,
      roi: 3.5,
      color: 'bg-blue-500'
    },
    sms: {
      openRate: 92,
      ctr: 7,
      conversion: 3.5,
      roi: 4,
      color: 'bg-purple-500'
    }
  },
  latam: {
    whatsapp: {
      openRate: 99,
      ctr: 60,
      conversion: 25,
      roi: 35,
      color: 'bg-green-500'
    },
    email: {
      openRate: 18,
      ctr: 2.5,
      conversion: 1.8,
      roi: 2.5,
      color: 'bg-blue-500'
    },
    sms: {
      openRate: 90,
      ctr: 6,
      conversion: 3,
      roi: 3.5,
      color: 'bg-purple-500'
    }
  },
  usa: {
    whatsapp: {
      openRate: 95,
      ctr: 35,
      conversion: 12,
      roi: 15,
      color: 'bg-green-500'
    },
    email: {
      openRate: 25,
      ctr: 4,
      conversion: 3,
      roi: 4,
      color: 'bg-blue-500'
    },
    sms: {
      openRate: 98,
      ctr: 10,
      conversion: 5,
      roi: 6,
      color: 'bg-purple-500'
    }
  }
};

/**
 * Get market data for a specific region
 */
export const getRegionalData = (region: string): RegionalMarketData | null => {
  return REGIONAL_MARKET_DATA[region] || null;
};

/**
 * Get channel comparison for a specific region
 */
export const getRegionalComparison = (region: string): ChannelComparison => {
  return REGIONAL_CHANNEL_COMPARISON[region] || CHANNEL_COMPARISON;
};