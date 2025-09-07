/**
 * Region Context for Managing Regional Personalization
 * Provides regional data and user preferences across the application
 */

'use client';

import React, { createContext, ReactNode,useCallback, useContext, useEffect, useState } from 'react';

import { REGIONAL_MARKET_DATA } from '@/modules/marketing/domain/data/evidence-regional.data';
import type { RegionalMarketData } from '@/modules/marketing/domain/types/evidence.types';

interface RegionInfo {
  countryCode: string;
  region: 'spain' | 'latam' | 'usa' | 'europe' | 'asia' | 'other';
  city?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

interface RegionContextType {
  // Current region information
  currentRegion: RegionInfo['region'];
  regionInfo: RegionInfo | null;

  // Regional market data
  marketData: RegionalMarketData | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setRegion: (region: RegionInfo['region']) => Promise<void>;
  detectRegion: () => Promise<void>;

  // Utilities
  formatCurrency: (amount: number) => string;
  getLocalizedContent: (key: string) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

interface RegionProviderProps {
  children: ReactNode;
  defaultRegion?: RegionInfo['region'];
}

export function RegionProvider({ children, defaultRegion = 'spain' }: RegionProviderProps) {
  const [currentRegion, setCurrentRegion] = useState<RegionInfo['region']>(defaultRegion);
  const [regionInfo, setRegionInfo] = useState<RegionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get market data for current region
  const marketData = REGIONAL_MARKET_DATA[currentRegion] || REGIONAL_MARKET_DATA.spain;

  // Detect user's region via API
  const detectRegion = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for stored preference first
      const storedRegion = localStorage.getItem('user-region');
      if (storedRegion && REGIONAL_MARKET_DATA[storedRegion]) {
        setCurrentRegion(storedRegion as RegionInfo['region']);
        setRegionInfo({
          countryCode: storedRegion.toUpperCase(),
          region: storedRegion as RegionInfo['region'],
          currency: getCurrencyForRegion(storedRegion as RegionInfo['region']),
          language: getLanguageForRegion(storedRegion as RegionInfo['region']),
        });
        setIsLoading(false);
        return;
      }

      // Detect via API
      const response = await fetch('/api/region');
      if (!response.ok) {
        throw new Error('Failed to detect region');
      }

      const data: RegionInfo = await response.json();
      setRegionInfo(data);
      setCurrentRegion(data.region);

      // Store preference
      localStorage.setItem('user-region', data.region);
    } catch (err) {
      console.error('Error detecting region:', err);
      setError('Could not detect your region. Using default settings.');

      // Fall back to default
      setCurrentRegion(defaultRegion);
      setRegionInfo({
        countryCode: defaultRegion.toUpperCase(),
        region: defaultRegion,
        currency: getCurrencyForRegion(defaultRegion),
        language: getLanguageForRegion(defaultRegion),
      });
    } finally {
      setIsLoading(false);
    }
  }, [defaultRegion]);

  // Set region manually
  const setRegion = useCallback(async (region: RegionInfo['region']) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update server-side cookie
      const response = await fetch('/api/region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region }),
      });

      if (!response.ok) {
        throw new Error('Failed to set region');
      }

      // Update local state
      setCurrentRegion(region);
      setRegionInfo({
        countryCode: region.toUpperCase(),
        region,
        currency: getCurrencyForRegion(region),
        language: getLanguageForRegion(region),
      });

      // Store preference
      localStorage.setItem('user-region', region);
    } catch (err) {
      console.error('Error setting region:', err);
      setError('Could not update region preference.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format currency based on region
  const formatCurrency = useCallback((amount: number): string => {
    if (!regionInfo) return `$${amount.toLocaleString()}`;

    const formatter = new Intl.NumberFormat(regionInfo.language || 'en-US', {
      style: 'currency',
      currency: regionInfo.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(amount);
  }, [regionInfo]);

  // Get localized content (placeholder for future i18n)
  const getLocalizedContent = useCallback((key: string): string => {
    // This will be expanded with proper i18n later
    // For now, return the key or region-specific content
    const contentMap: Record<string, Record<string, string>> = {
      'hero.title': {
        spain: 'El 73% de tus clientes prefieren WhatsApp',
        latam: 'El 78% de tus clientes prefieren WhatsApp',
        usa: '65% of your customers prefer WhatsApp',
        europe: '70% of your customers prefer WhatsApp',
        asia: '85% of your customers prefer WhatsApp',
        other: '75% of your customers prefer WhatsApp',
      },
      // Add more content keys as needed
    };

    return contentMap[key]?.[currentRegion] || contentMap[key]?.['spain'] || key;
  }, [currentRegion]);

  // Detect region on mount
  useEffect(() => {
    detectRegion();
  }, [detectRegion]);

  const value: RegionContextType = {
    currentRegion,
    regionInfo,
    marketData,
    isLoading,
    error,
    setRegion,
    detectRegion,
    formatCurrency,
    getLocalizedContent,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

// Helper functions
function getCurrencyForRegion(region: RegionInfo['region']): string {
  const currencies: Record<RegionInfo['region'], string> = {
    spain: 'EUR',
    latam: 'USD',
    usa: 'USD',
    europe: 'EUR',
    asia: 'USD',
    other: 'USD',
  };
  return currencies[region] || 'USD';
}

function getLanguageForRegion(region: RegionInfo['region']): string {
  const languages: Record<RegionInfo['region'], string> = {
    spain: 'es-ES',
    latam: 'es-MX',
    usa: 'en-US',
    europe: 'en-GB',
    asia: 'en-US',
    other: 'en-US',
  };
  return languages[region] || 'en-US';
}

// Export hook for easy access
export { RegionContext };