import { FaqSection } from '@/modules/marketing/ui/components/faq-section';
import { FeaturesGrid } from '@/modules/marketing/ui/components/features-grid';
import { FinalCta } from '@/modules/marketing/ui/components/final-cta';
import { HeroSection } from '@/modules/marketing/ui/components/hero-section';
import { HowItWorks } from '@/modules/marketing/ui/components/how-it-works';
import { LandingFooter } from '@/modules/marketing/ui/components/landing-footer';
import { ModernNavbar } from '@/modules/marketing/ui/components/modern-navbar';
import { PricingTeaserAB } from '@/modules/marketing/ui/components/pricing-teaser-ab';
import { SocialProof } from '@/modules/marketing/ui/components/social-proof';
import { Testimonials } from '@/modules/marketing/ui/components/testimonials';
import { ValueProps } from '@/modules/marketing/ui/components/value-props';

/**
 * Landing Page
 * Main marketing page with all sections and enhanced accessibility
 */
export default function HomePage() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <ModernNavbar />
      
      {/* Main content with proper landmark */}
      <main id="main-content" className="min-h-screen">
        {/* 1. Hero with mockup and primary CTA */}
        <HeroSection />
        
        {/* 2. Social Proof - Logos and stats */}
        <SocialProof />
        
        {/* 3. Features Grid - Main product features */}
        <FeaturesGrid />
        
        {/* 4. How it Works - 3-4 step process */}
        <HowItWorks />
        
        {/* 5. Benefits/Use Cases - Value propositions */}
        <ValueProps />
        
        {/* 6. Testimonials - Customer reviews */}
        <Testimonials />
        
        {/* 7. Pricing - Plans comparison */}
        <PricingTeaserAB />
        
        {/* 8. FAQ - Frequently asked questions */}
        <FaqSection />
        
        {/* 9. Final CTA - Call to action */}
        <FinalCta />
      </main>
      
      {/* Footer */}
      <LandingFooter />
    </>
  );
}