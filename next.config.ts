import path from 'path';

/** @type {import('next').NextConfig} */
const isTurbopack = process.env.TURBOPACK === '1';

const nextConfig = {
  // Core Next.js configuration
  reactStrictMode: true,

  // Experimental features for Next.js 15
  experimental: {
    telemetry: false,
    // Package optimization for commonly used libraries
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-*',
      'framer-motion'
    ]
  },

  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
    rules: {
      // Optimize test file exclusion
      '*.test.{js,ts,jsx,tsx}': {
        loaders: ['ignore-loader']
      },
      '*.spec.{js,ts,jsx,tsx}': {
        loaders: ['ignore-loader']
      }
    }
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Exclude test files from bundle and watching
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

  // Image optimization
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

  // PostHog rewrites
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
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
  nextConfig.webpack = (config, { isServer }) => {
    // Configuración específica para pdfjs-dist versión 5.x
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };

    return config;
  };
}

export default nextConfig;
