import path from 'path';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const isTurbopack = process.env.TURBOPACK === '1';
const isAnalyzing = process.env.ANALYZE === 'true';

// Bundle analyzer config
const withBundleAnalyzer = isAnalyzing
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config: any) => config;

const nextConfig = {
  reactStrictMode: true,

  // Move serverComponentsExternalPackages to top level (no longer experimental in Next.js 15)
  serverExternalPackages: ['@sentry/profiling-node'],

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      'framer-motion'
    ]
  },

  turbopack: {
    resolveAlias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
    rules: {
      '*.test.{js,ts,jsx,tsx}': {
        loaders: ['ignore-loader']
      },
      '*.spec.{js,ts,jsx,tsx}': {
        loaders: ['ignore-loader']
      }
    }
  },

  webpack: (config, { dev, isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/e2e/**'
      ]
    };

    return config;
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Security and performance headers
  async headers() {
    return [
      // Security headers for all pages
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // API route caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1, stale-while-revalidate=59',
          },
        ],
      },
      // Static asset caching
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Next.js static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // PostHog rewrites - proxy to EU servers
  async rewrites() {
    return [
      // Static assets first (more specific)
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      // Session recordings
      {
        source: '/ingest/s/:path*',
        destination: 'https://eu.i.posthog.com/s/:path*',
      },
      // Main API endpoint (most general)
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

if (!isTurbopack) {
  nextConfig.webpack = (config) => {
    // Configuración específica para pdfjs-dist versión 5.x
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };

    return config;
  };
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Organization and project from environment
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs in CI/dev
  silent: !process.env.CI && process.env.NODE_ENV !== 'development',

  // Upload source maps for better error tracking
  widenClientFileUpload: true,

  // Route tunnel to avoid ad blockers
  tunnelRoute: '/monitoring',

  // Hide source maps from client bundles
  hideSourceMaps: true,

  // Disable Sentry SDK debug logs in production
  disableLogger: true,

  // Automatically instrument Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Apply configurations in order
let config = nextConfig;

// Apply bundle analyzer if analyzing
config = withBundleAnalyzer(config);

// Apply Sentry configuration only if enabled or in production
const isDevelopment = process.env.NODE_ENV === 'development';
const isSentryEnabled = process.env.SENTRY_ENABLED === 'true';

if (!isDevelopment || isSentryEnabled) {
  config = withSentryConfig(config, sentryWebpackPluginOptions);
}

export default config;
