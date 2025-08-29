import type { Metadata } from 'next';

import { CursorTrail } from '@/components/cursor-trail';
import { FloatingWhatsAppCTA } from '@/components/floating-whatsapp-cta';
import { ScrollToTop,SmoothScroll } from '@/components/smooth-scroll';
import { LandingFooter } from '@/modules/marketing/ui/components/landing-footer';
import { ModernNavbar } from '@/modules/marketing/ui/components/modern-navbar';

export const metadata: Metadata = {
  title: {
    default: "WhatsApp Cloud API Platform | Enterprise Messaging Solution",
    template: "%s | WhatsApp Cloud API Platform"
  },
  description: "Transform your business communication with WhatsApp Cloud API. Multi-channel bot platform, AI-powered customer support, and enterprise-grade messaging solutions for African markets.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Global Effects */}
      <SmoothScroll />
      <CursorTrail />
      
      {/* Layout Components */}
      <ModernNavbar />
      {children}
      <LandingFooter />
      
      {/* Floating Elements */}
      <FloatingWhatsAppCTA />
      <ScrollToTop />
    </>
  );
}
