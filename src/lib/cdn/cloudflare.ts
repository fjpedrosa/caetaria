/**
 * Cloudflare CDN and caching utilities for production optimization
 */

// Cloudflare API configuration
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

interface CloudflareResponse<T = any> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
}

interface PurgeRequest {
  files?: string[];
  tags?: string[];
  hosts?: string[];
  prefixes?: string[];
}

interface CacheSettings {
  ttl: number;
  edge_ttl?: number;
  browser_ttl?: number;
  cache_level?: 'aggressive' | 'basic' | 'simplified';
  edge_cache_ttl?: number;
}

class CloudflareClient {
  private apiToken: string;
  private zoneId: string;

  constructor(apiToken?: string, zoneId?: string) {
    this.apiToken = apiToken || CLOUDFLARE_API_TOKEN || '';
    this.zoneId = zoneId || CLOUDFLARE_ZONE_ID || '';

    if (!this.apiToken || !this.zoneId) {
      console.warn('Cloudflare API token or zone ID not configured');
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiToken || !this.zoneId) {
      throw new Error('Cloudflare API not configured');
    }

    const response = await fetch(`${CLOUDFLARE_API_BASE}/zones/${this.zoneId}/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data: CloudflareResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${data.errors.map(e => e.message).join(', ')}`);
    }

    return data.result;
  }

  /**
   * Purge cache for specific files or tags
   */
  async purgeCache(request: PurgeRequest): Promise<void> {
    await this.makeRequest('purge_cache', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Purge entire cache for the zone
   */
  async purgeAll(): Promise<void> {
    await this.makeRequest('purge_cache', {
      method: 'POST',
      body: JSON.stringify({ purge_everything: true }),
    });
  }

  /**
   * Get cache analytics
   */
  async getCacheAnalytics(since: string, until: string): Promise<any> {
    const params = new URLSearchParams({
      since,
      until,
      dimensions: 'cacheStatus,responseContentType',
      metrics: 'requests,bytes,bandwidth',
    });

    return this.makeRequest(`analytics/dashboard?${params}`);
  }

  /**
   * Update cache rules for specific patterns
   */
  async updateCacheRule(pattern: string, settings: CacheSettings): Promise<void> {
    // Note: This would require Page Rules API or Cache Rules API
    // Implementation depends on your specific Cloudflare plan
    console.log(`Cache rule update requested for ${pattern}:`, settings);
  }
}

// Singleton instance
export const cloudflare = new CloudflareClient();

/**
 * Purge cache for deployment
 */
export async function purgeDeploymentCache(): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('Cloudflare not configured, skipping cache purge');
    return;
  }

  try {
    // Purge static assets
    await cloudflare.purgeCache({
      files: [
        '/_next/static/*',
        '/images/*',
        '/favicon.ico',
        '/manifest.json',
      ],
    });

    // Purge API routes
    await cloudflare.purgeCache({
      files: [
        '/api/health',
        '/api/status',
      ],
    });

    console.log('✅ Cache purged successfully');
  } catch (error) {
    console.error('❌ Failed to purge cache:', error);
    // Don't throw to avoid breaking deployment
  }
}

/**
 * Purge cache by tags
 */
export async function purgeCacheByTags(tags: string[]): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    console.log('Cloudflare not configured, skipping cache purge');
    return;
  }

  try {
    await cloudflare.purgeCache({ tags });
    console.log(`✅ Cache purged for tags: ${tags.join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to purge cache by tags:', error);
  }
}

/**
 * Get cache performance metrics
 */
export async function getCacheMetrics(hours: number = 24): Promise<any> {
  const until = new Date();
  const since = new Date(until.getTime() - hours * 60 * 60 * 1000);

  try {
    return await cloudflare.getCacheAnalytics(
      since.toISOString(),
      until.toISOString()
    );
  } catch (error) {
    console.error('❌ Failed to get cache metrics:', error);
    return null;
  }
}

/**
 * Cache headers configuration
 */
export const CACHE_HEADERS = {
  // Static assets (1 year)
  STATIC_ASSETS: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000',
    'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
  },

  // API responses (short cache with revalidation)
  API_RESPONSES: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, s-maxage=300',
  },

  // Dynamic pages (no cache)
  DYNAMIC_PAGES: {
    'Cache-Control': 'no-store, must-revalidate',
    'CDN-Cache-Control': 'no-cache',
  },

  // Health checks (minimal cache)
  HEALTH_CHECKS: {
    'Cache-Control': 'no-store, must-revalidate',
    'CDN-Cache-Control': 'no-cache',
  },

  // Status page (short cache)
  STATUS_PAGE: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, s-maxage=300',
  },
} as const;

/**
 * Apply cache headers to response
 */
export function applyCacheHeaders(
  response: Response,
  cacheType: keyof typeof CACHE_HEADERS
): Response {
  const headers = CACHE_HEADERS[cacheType];

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Cache optimization utilities
 */
export const cacheUtils = {
  /**
   * Generate cache key for API responses
   */
  generateCacheKey(path: string, params?: Record<string, string>): string {
    const paramString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return `api:${path}${paramString}`;
  },

  /**
   * Check if response should be cached
   */
  shouldCache(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  },

  /**
   * Get cache TTL based on content type
   */
  getCacheTTL(contentType: string): number {
    if (contentType.includes('application/json')) {
      return 300; // 5 minutes for API responses
    } else if (contentType.includes('text/html')) {
      return 0; // Don't cache HTML pages
    } else if (contentType.includes('image/') || contentType.includes('font/')) {
      return 31536000; // 1 year for static assets
    } else {
      return 3600; // 1 hour default
    }
  },

  /**
   * Generate cache tags for purging
   */
  generateCacheTags(resource: string, id?: string): string[] {
    const tags = [`resource:${resource}`];
    if (id) {
      tags.push(`${resource}:${id}`);
    }
    return tags;
  },
};

/**
 * Pre-warming cache for critical resources
 */
export async function prewarmCache(urls: string[]): Promise<void> {
  const promises = urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        headers: {
          'CF-Cache-Control': 'public, max-age=3600',
        },
      });

      if (response.ok) {
        console.log(`✅ Pre-warmed cache for: ${url}`);
      } else {
        console.warn(`⚠️ Failed to pre-warm: ${url} (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ Error pre-warming ${url}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Critical resources to pre-warm on deployment
 */
export const CRITICAL_URLS = [
  '/',
  '/api/health',
  '/api/status',
  '/onboarding/business',
] as const;

// Export for deployment scripts
export { CloudflareClient };