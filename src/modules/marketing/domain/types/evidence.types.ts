/**
 * Evidence Section Domain Types
 * Business entities and value objects for WhatsApp Business evidence data
 */

import { LucideIcon } from 'lucide-react';

/**
 * Data source for evidence metrics
 */
export interface DataSource {
  name: string;
  url: string;
  logoUrl?: string;
  year?: string;
  verified?: boolean;
}

/**
 * Key performance metric with source attribution
 */
export interface KeyMetric {
  id: string;
  title: string;
  value: string;
  comparison?: string;
  icon: LucideIcon;
  color: string;
  source: DataSource;
  category?: 'roi' | 'conversion' | 'engagement' | 'reach';
}

/**
 * Success story from verified business cases
 */
export interface SuccessStory {
  id: string;
  company: string;
  industry: string;
  metric: string;
  value: string;
  description: string;
  source: DataSource;
  logoUrl?: string;
  featured?: boolean;
  region?: Region;
}

/**
 * Channel performance comparison data
 */
export interface ChannelMetrics {
  openRate: number;
  ctr: number;
  conversion: number;
  roi: number;
  color: string;
}

/**
 * Communication channel types
 */
export type ChannelType = 'whatsapp' | 'email' | 'sms';

/**
 * Channel comparison data structure
 */
export interface ChannelComparison {
  whatsapp: ChannelMetrics;
  email: ChannelMetrics;
  sms: ChannelMetrics;
}

/**
 * Supported regions for localized data
 */
export type Region = 'spain' | 'latam' | 'usa' | 'europe' | 'asia' | 'global';

/**
 * Regional market data
 */
export interface RegionalMarketData {
  region: Region;
  flag?: string;
  users: string;
  dailyUsage?: string;
  preferredChannel?: string;
  businessMessages?: string;
  penetrationRate?: string;
  keyCompanies?: string[];
  sources?: DataSource[];
}

/**
 * Complete regional data structure with all metrics
 */
export interface RegionalData {
  region: Region;
  displayName: string;
  metrics: KeyMetric[];
  successStories: SuccessStory[];
  marketData: RegionalMarketData;
  comparison?: ChannelComparison;
}

/**
 * Source provider logos mapping
 */
export interface SourceLogo {
  provider: string;
  logoUrl: string;
  altText: string;
}

/**
 * Evidence section configuration
 */
export interface EvidenceConfig {
  showRegionalData: boolean;
  autoDetectRegion: boolean;
  defaultRegion: Region;
  maxSuccessStories: number;
  enableComparison: boolean;
  enableCalculator: boolean;
}