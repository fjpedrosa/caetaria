'use client';

import { ArrowRight, CheckCircle } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';

import { Industry } from '../../domain/types';

interface IndustryHeroProps {
  industry: Industry;
  onStartTrial?: () => void;
  onViewDemo?: () => void;
}

export function IndustryHero({ industry, onStartTrial, onViewDemo }: IndustryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-16 md:py-24">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2">
              <span className="text-2xl">{industry.icon}</span>
              <span className="text-sm font-medium text-purple-700">
                Solución para {industry.name}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                WhatsApp Business para{' '}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {industry.name}
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                {industry.description}
              </p>
            </div>

            {/* Benefits list */}
            <ul className="space-y-3">
              {industry.benefits.slice(0, 3).map((benefit) => (
                <li key={benefit.id} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-900">{benefit.title}</span>
                    {benefit.metric && (
                      <span className="ml-2 text-sm font-bold text-purple-600">
                        {benefit.metric}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onStartTrial}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Empezar prueba gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onViewDemo}
              >
                Ver demo de {industry.name}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-gray-300 border-2 border-white"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">+500 empresas</span> de{' '}
                {industry.name.toLowerCase()} ya confían en Neptunik
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square lg:aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8">
              {/* Placeholder for industry-specific visual */}
              <div className="h-full w-full rounded-xl bg-white/80 backdrop-blur flex items-center justify-center">
                <div className="text-center space-y-4">
                  <span className="text-6xl">{industry.icon}</span>
                  <p className="text-gray-600">
                    Demo interactivo de WhatsApp
                  </p>
                </div>
              </div>
            </div>

            {/* Floating metrics */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">98%</p>
                <p className="text-sm text-gray-600">Tasa de apertura</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">5 min</p>
                <p className="text-sm text-gray-600">Setup completo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-200 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-200 opacity-20 blur-3xl" />
      </div>
    </section>
  );
}