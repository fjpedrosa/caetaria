import { SkipLinks } from '@/modules/marketing/navbar/presentation/components/skip-links';
import { DigitalBusinessesSection } from '@/modules/marketing/presentation/components/digital-businesses-section';
import { FaqSection } from '@/modules/marketing/presentation/components/faq-section';
import { FeaturesGridContainer as FeaturesGrid } from '@/modules/marketing/presentation/components/features-grid';
import { FinalCta } from '@/modules/marketing/presentation/components/final-cta';
import { HeroSection } from '@/modules/marketing/presentation/components/hero-section';
import { HowItWorksV2 } from '@/modules/marketing/presentation/components/how-it-works-v2';
import { PricingTeaserAB } from '@/modules/marketing/presentation/components/pricing-teaser-ab';
import { UseCasesSection } from '@/modules/marketing/presentation/components/use-cases-section';
import { SeamlessSection } from '@/modules/shared/presentation/components/seamless-section';

export default function HomePage() {
  return (
    <>
      {/* Skip links mejorados para accesibilidad WCAG 2.1 AA */}
      <SkipLinks
        mainContentId="main-content"
        showOnlyMain={true} // Solo muestra el skip link principal
      />

      {/* Main content with proper landmark */}
      <main id="main-content" className="min-h-screen relative" tabIndex={-1}>
        {/* 1. Hero with mockup and primary CTA */}
        <SeamlessSection
          spacing="xlarge"
          paddingTop='none'
          decorativeBlob={{
            position: 'bottom-right',
            color: 'neptune',
            size: 'xl',
            offset: { x: 10, y: 20 },
            opacity: 0.05,
            blur: 180
          }}
        >
          <HeroSection />
        </SeamlessSection>

        {/* 2. Features Grid - Main product features */}
        <SeamlessSection
          spacing="large"
          decorativeBlob={{
            position: 'top-left',
            color: 'whatsapp',
            size: 'xl',
            offset: { x: -15, y: -15 },
            opacity: 0.04,
            blur: 200
          }}
        >
          <FeaturesGrid />
        </SeamlessSection>

        {/* 3. Use Cases - Interactive demonstrations */}
        <SeamlessSection
          spacing="large"
        >
          <UseCasesSection />
        </SeamlessSection>

        {/* 4. Digital Businesses - Companies that already digitalized with WhatsApp */}
        <SeamlessSection
          spacing="large"
          decorativeBlob={{
            position: 'bottom-left',
            color: 'neptune',
            size: 'xl',
            offset: { x: -10, y: 15 },
            opacity: 0.06,
            blur: 170
          }}
        >
          <DigitalBusinessesSection />
        </SeamlessSection>

        {/* 5. How it Works - 4 step process with visual timeline */}
        <SeamlessSection
          spacing="large"
        >
          <HowItWorksV2 />
        </SeamlessSection>

        {/* 6. Pricing - Plans comparison */}
        <SeamlessSection
          spacing="xlarge"
          decorativeBlob={{
            position: 'top-right',
            color: 'whatsapp',
            size: 'xl',
            offset: { x: 15, y: -10 },
            opacity: 0.05,
            blur: 190
          }}
        >
          <PricingTeaserAB />
        </SeamlessSection>

        {/* 9. FAQ - Frequently asked questions */}
        <SeamlessSection
          spacing="large"
          decorativeBlob={{
            position: 'bottom-right',
            color: 'neptune',
            size: 'xl',
            offset: { x: 10, y: 15 },
            opacity: 0.04,
            blur: 200
          }}
        >
          <FaqSection />
        </SeamlessSection>

        {/* 10. Final CTA - Call to action */}
        <SeamlessSection
          spacing="xlarge"
        >
          <FinalCta />
        </SeamlessSection>
      </main>

      {/* Footer is now in layout.tsx */}
    </>
  );
}