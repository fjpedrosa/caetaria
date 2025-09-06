// This component doesn't need 'use client' as it has no hooks or state

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { MARKETING_COPY } from '@/modules/marketing/domain/copy';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';

const { title, subtitle, description, buttons, guarantee } = MARKETING_COPY.finalCta;

export function FinalCta() {

  return (
    <section className="py-20 bg-gradient-brand">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white dark:text-white mb-4">
            {title}
          </h2>

          <p className="text-xl md:text-2xl text-white/90 dark:text-white/90 mb-4">
            {subtitle}
          </p>

          <p className="text-lg text-white/90 dark:text-white/90 mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold group"
              >
                {buttons.primary}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold"
              >
                {buttons.secondary}
              </Button>
            </Link>
          </div>

          <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-sm">
            {guarantee}
          </Badge>
        </div>
      </div>
    </section>
  );
}