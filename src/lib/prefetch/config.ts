/**
 * Prefetch Configuration for Next.js 15
 *
 * Defines routes with their prefetch strategies, priorities, and performance constraints.
 * Optimized for Next.js 15 App Router with intelligent prefetching patterns.
 */

/**
 * Prefetch Strategy Types
 */
export type PrefetchStrategy =
  | 'immediate'     // Prefetch on page load (critical routes)
  | 'hover'         // Prefetch on mouse hover
  | 'viewport'      // Prefetch when element enters viewport
  | 'idle'          // Prefetch during browser idle time
  | 'manual'        // Manual prefetch control
  | 'none';         // No prefetching

/**
 * Route Priority Levels
 */
export type RoutePriority =
  | 'critical'      // Homepage, main navigation
  | 'high'          // Product pages, pricing
  | 'medium'        // Secondary pages
  | 'low'           // Rarely accessed pages
  | 'external';     // External links (no prefetch)

/**
 * Route Configuration Interface
 */
export interface RouteConfig {
  /** Route path pattern */
  path: string;
  /** Prefetch strategy to use */
  strategy: PrefetchStrategy;
  /** Priority level for resource allocation */
  priority: RoutePriority;
  /** Delay before prefetch (ms) */
  delay?: number;
  /** Whether to use high priority prefetch hint */
  highPriority?: boolean;
  /** Whether this route should be preloaded */
  preload?: boolean;
  /** Custom prefetch options */
  options?: {
    /** Cache time in ms */
    cacheTime?: number;
    /** Max retries on failure */
    maxRetries?: number;
    /** Only prefetch on fast connections */
    fastConnectionOnly?: boolean;
  };
}

/**
 * System Performance Constraints
 */
export interface PerfConstraints {
  /** Max concurrent prefetch operations */
  maxConcurrentPrefetch: number;
  /** Max memory usage for prefetch cache (MB) */
  maxMemoryUsage: number;
  /** Min connection speed for aggressive prefetch (Mbps) */
  minConnectionSpeed: number;
  /** Max prefetch operations per minute */
  maxPrefetchPerMinute: number;
  /** Viewport intersection threshold (0-1) */
  viewportThreshold: number;
  /** Idle callback timeout (ms) */
  idleTimeout: number;
  /** Hover delay before prefetch (ms) */
  hoverDelay: number;
}

/**
 * Default Performance Constraints
 */
export const DEFAULT_PERF_CONSTRAINTS: PerfConstraints = {
  maxConcurrentPrefetch: 3,
  maxMemoryUsage: 50, // 50MB
  minConnectionSpeed: 1.5, // 1.5 Mbps for aggressive prefetch
  maxPrefetchPerMinute: 20,
  viewportThreshold: 0.1, // 10% of element visible
  idleTimeout: 2000, // 2 seconds
  hoverDelay: 300, // 300ms hover delay
};

/**
 * Route Configuration Map
 *
 * Defines prefetch strategy for each route pattern in the application.
 * Routes are ordered by priority for optimal resource allocation.
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Critical Routes - Immediate prefetch
  {
    path: '/',
    strategy: 'immediate',
    priority: 'critical',
    highPriority: true,
    preload: true,
    options: {
      cacheTime: 300000, // 5 minutes
      maxRetries: 3,
    }
  },
  {
    path: '/pricing',
    strategy: 'immediate',
    priority: 'critical',
    highPriority: true,
    options: {
      cacheTime: 180000, // 3 minutes
      maxRetries: 2,
    }
  },
  {
    path: '/onboarding',
    strategy: 'immediate',
    priority: 'critical',
    delay: 1000, // Delay to prioritize homepage
    options: {
      cacheTime: 120000, // 2 minutes
      maxRetries: 2,
    }
  },

  // High Priority Routes - Hover prefetch
  {
    path: '/simulator',
    strategy: 'hover',
    priority: 'high',
    delay: 200,
    options: {
      cacheTime: 300000, // 5 minutes
      fastConnectionOnly: false,
    }
  },
  {
    path: '/features',
    strategy: 'hover',
    priority: 'high',
    delay: 300,
    options: {
      cacheTime: 240000, // 4 minutes
    }
  },
  {
    path: '/about',
    strategy: 'hover',
    priority: 'high',
    delay: 300,
    options: {
      cacheTime: 180000, // 3 minutes
    }
  },

  // Medium Priority Routes - Viewport prefetch
  {
    path: '/case-studies',
    strategy: 'viewport',
    priority: 'medium',
    options: {
      cacheTime: 120000, // 2 minutes
      fastConnectionOnly: true,
    }
  },
  {
    path: '/integrations',
    strategy: 'viewport',
    priority: 'medium',
    options: {
      cacheTime: 120000,
      fastConnectionOnly: true,
    }
  },
  {
    path: '/resources',
    strategy: 'viewport',
    priority: 'medium',
    options: {
      cacheTime: 90000, // 1.5 minutes
      fastConnectionOnly: true,
    }
  },

  // Low Priority Routes - Idle prefetch
  {
    path: '/privacy',
    strategy: 'idle',
    priority: 'low',
    options: {
      cacheTime: 60000, // 1 minute
      fastConnectionOnly: true,
    }
  },
  {
    path: '/terms',
    strategy: 'idle',
    priority: 'low',
    options: {
      cacheTime: 60000,
      fastConnectionOnly: true,
    }
  },
  {
    path: '/contact',
    strategy: 'idle',
    priority: 'low',
    options: {
      cacheTime: 90000,
    }
  },

  // External Routes - No prefetch
  {
    path: 'https://*',
    strategy: 'none',
    priority: 'external',
  },
  {
    path: 'http://*',
    strategy: 'none',
    priority: 'external',
  },
  {
    path: 'mailto:*',
    strategy: 'none',
    priority: 'external',
  },
  {
    path: 'tel:*',
    strategy: 'none',
    priority: 'external',
  },
];

/**
 * Get route configuration for a given path
 */
export function getRouteConfig(path: string): RouteConfig | null {
  // Exact match first
  const exactMatch = ROUTE_CONFIGS.find(config => config.path === path);
  if (exactMatch) return exactMatch;

  // Pattern matching for wildcards
  const patternMatch = ROUTE_CONFIGS.find(config => {
    if (config.path.includes('*')) {
      const regex = new RegExp(
        config.path.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
      );
      return regex.test(path);
    }
    return false;
  });

  return patternMatch || null;
}

/**
 * Check if route is external
 */
export function isExternalRoute(href: string): boolean {
  return /^https?:\/\//.test(href) ||
         /^mailto:/.test(href) ||
         /^tel:/.test(href) ||
         href.startsWith('//');
}

/**
 * Get routes by priority level
 */
export function getRoutesByPriority(priority: RoutePriority): RouteConfig[] {
  return ROUTE_CONFIGS.filter(config => config.priority === priority);
}

/**
 * Get routes by strategy
 */
export function getRoutesByStrategy(strategy: PrefetchStrategy): RouteConfig[] {
  return ROUTE_CONFIGS.filter(config => config.strategy === strategy);
}