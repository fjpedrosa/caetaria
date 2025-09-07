import { EvidenceSection } from '@/modules/marketing/presentation/components/evidence-section';
import { FaqSection } from '@/modules/marketing/presentation/components/faq-section';
import { FeaturesGridContainer as FeaturesGrid } from '@/modules/marketing/presentation/components/features-grid';
import { FinalCta } from '@/modules/marketing/presentation/components/final-cta';
import { HeroSection } from '@/modules/marketing/presentation/components/hero-section';
import { HowItWorksV2 } from '@/modules/marketing/presentation/components/how-it-works-v2';
import { SkipLinks } from '@/modules/marketing/navbar/presentation/components/skip-links';
import { PricingTeaserAB } from '@/modules/marketing/presentation/components/pricing-teaser-ab';
import { Testimonials } from '@/modules/marketing/presentation/components/testimonials';
import { UseCasesSection } from '@/modules/marketing/presentation/components/use-cases-section';
import { ValueProps } from '@/modules/marketing/presentation/components/value-props';

export default function HomePage() {
  return (
    <>
      {/* Skip links mejorados para accesibilidad WCAG 2.1 AA */}
      <SkipLinks 
        mainContentId="main-content"
        showOnlyMain={true} // Solo muestra el skip link principal
      />

      {/* Main content with proper landmark */}
      <main id="main-content" className="min-h-screen" tabIndex={-1}>
        {/* 1. Hero with mockup and primary CTA */}
        <HeroSection />

        {/* 2. Features Grid - Main product features */}
        <FeaturesGrid />

        {/* 3. Use Cases - Interactive demonstrations */}
        <UseCasesSection />

        {/* 4. Evidence - Real data and verified success stories */}
        <EvidenceSection />

        {/* 5. How it Works - 4 step process with visual timeline */}
        <HowItWorksV2 />

        {/* 6. Benefits/Value Props - Value propositions */}
        <ValueProps />

        {/* 7. Testimonials - Customer reviews */}
        <Testimonials />

        {/* 8. Pricing - Plans comparison */}
        <PricingTeaserAB />

        {/* 9. FAQ - Frequently asked questions */}
        <FaqSection />

        {/* 10. Final CTA - Call to action */}
        <FinalCta />
      </main>

      {/* Footer is now in layout.tsx */}
    </>
  );
}