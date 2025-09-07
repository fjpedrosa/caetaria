'use client';

import { SeamlessSection } from '@/modules/shared/presentation/components/seamless-section';
import { SectionBlend } from '@/modules/shared/presentation/components/section-blend';

export default function TestSeamlessPage() {
  return (
    <main className="min-h-screen relative">
      {/* Section 1: Hero Style */}
      <SeamlessSection
        background="light"
        decorativeBlob={{
          position: 'bottom-right',
          color: 'neptune',
          size: 'xl',
          offset: { x: 10, y: 15 },
          opacity: 0.25,
          blur: 100
        }}
      >
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-5xl font-bold mb-6">
            Seamless Section Test
          </h1>
          <p className="text-xl text-muted-foreground">
            Testing the new overlapping section system with decorative blobs
          </p>
        </div>
      </SeamlessSection>

      {/* Transition 1 */}
      <SectionBlend
        type="wave"
        height={8}
        color="neptune"
        animate={true}
      />

      {/* Section 2: Features Style */}
      <SeamlessSection
        background="transparent"
        overlap="top"
        overlapAmount={4}
        decorativeBlob={{
          position: 'top-left',
          color: 'whatsapp',
          size: 'lg',
          offset: { x: -10, y: -10 },
          opacity: 0.2,
          blur: 80
        }}
      >
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-8">Features Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
                <p className="text-muted-foreground">
                  Testing seamless transitions between sections
                </p>
              </div>
            ))}
          </div>
        </div>
      </SeamlessSection>

      {/* Transition 2 */}
      <SectionBlend
        type="organic"
        height={6}
        color="whatsapp"
        flip={false}
      />

      {/* Section 3: Content Style */}
      <SeamlessSection
        background="medium"
        overlap="both"
        overlapAmount={3}
        decorativeBlob={{
          position: 'bottom-left',
          color: 'neptune',
          size: 'lg',
          offset: { x: -5, y: 10 },
          opacity: 0.18,
          blur: 90
        }}
      >
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-8">Content Section</h2>
          <p className="text-lg mb-4">
            Notice how the decorative blobs extend beyond section boundaries,
            creating a seamless flow between sections.
          </p>
          <p className="text-lg">
            The transitions use SVG dividers that blend smoothly with the
            gradient backgrounds.
          </p>
        </div>
      </SeamlessSection>

      {/* Transition 3 */}
      <SectionBlend
        type="curve"
        height={7}
        color="neutral"
      />

      {/* Section 4: Final Style */}
      <SeamlessSection
        background="accent"
        overlap="top"
        overlapAmount={5}
        decorativeBlob={{
          position: 'top-right',
          color: 'whatsapp',
          size: 'xl',
          offset: { x: 10, y: -5 },
          opacity: 0.2,
          blur: 100
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6">Final Section</h2>
          <p className="text-xl mb-8">
            The overlapping system eliminates visible boundaries
          </p>
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Test Complete
          </button>
        </div>
      </SeamlessSection>
    </main>
  );
}