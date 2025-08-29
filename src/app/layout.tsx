import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from 'next/font/google';
import "./globals.css";
import { Providers } from './providers';
import { PerformanceMonitor } from "@/components/performance-monitor";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import { ResponsiveTestOverlay, ResponsiveDebugInfo } from "@/components/responsive-test-overlay";

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap', 
  variable: '--font-roboto-mono',
  preload: false, // Only preload primary font
});

// Optimize viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://caetaria.com'),
  title: {
    default: "Caetaria | Automatiza WhatsApp para tu negocio",
    template: "%s | Caetaria"
  },
  description: "Aumenta tus ventas 30% automatizando WhatsApp. Caetaria te permite gestionar clientes, automatizar respuestas y cerrar más ventas con WhatsApp Business API. Configuración en 5 minutos.",
  keywords: [
    "WhatsApp Business API",
    "Cloud messaging platform", 
    "AI chatbots",
    "Multi-channel support",
    "Customer communication",
    "Business messaging",
    "WhatsApp integration",
    "Enterprise messaging",
    "African markets",
    "Customer support automation"
  ],
  authors: [{ name: "The Kroko Company", url: "https://thekrokocompany.com" }],
  creator: "The Kroko Company",
  publisher: "The Kroko Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://caetaria.com",
    title: "Caetaria | Automatiza WhatsApp para tu negocio",
    description: "Aumenta tus ventas 30% automatizando WhatsApp. Gestiona clientes, automatiza respuestas y cierra más ventas con Caetaria.",
    siteName: "Caetaria",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Caetaria - Dashboard de WhatsApp Business",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@thekrokocompany",
    creator: "@thekrokocompany", 
    title: "Caetaria | Automatiza WhatsApp para tu negocio",
    description: "Aumenta tus ventas 30% automatizando WhatsApp. Gestiona clientes, automatiza respuestas y cierra más ventas con Caetaria.",
    images: [{
      url: "/og-image.jpg",
      alt: "Caetaria - Dashboard de WhatsApp Business"
    }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "technology",
  classification: "Business Software",
  other: {
    "msapplication-TileColor": "#10b981",
    "theme-color": "#10b981"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        {/* DNS Prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//vercel.app" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`antialiased font-sans ${inter.className}`}>
        <Providers>
          {children}
          <PerformanceMonitor />
          <ServiceWorkerRegister />
          {process.env.NODE_ENV === 'development' && (
            <>
              <PerformanceDashboard />
              {/* <ResponsiveTestOverlay /> */}
              {/* <ResponsiveDebugInfo /> */}
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}