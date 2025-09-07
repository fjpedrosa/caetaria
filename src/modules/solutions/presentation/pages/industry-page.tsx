'use client';

import { ArrowRight, Download, Phone } from 'lucide-react';

import { Button } from '@/modules/shared/presentation/components/ui/button';

import { Industry } from '../../domain/types';
import { IndustryHero } from '../components/industry-hero';
import { IndustryMetrics } from '../components/industry-metrics';
import { IndustryPainPoints } from '../components/industry-pain-points';
import { IndustryTestimonials } from '../components/industry-testimonials';
import { IndustryUseCases } from '../components/industry-use-cases';

interface IndustryPageProps {
  industry: Industry;
}

export function IndustryPage({ industry }: IndustryPageProps) {
  const handleStartTrial = () => {
    // TODO: Navigate to onboarding or show modal
    console.log('Start trial for', industry.name);
  };

  const handleViewDemo = () => {
    // TODO: Show demo modal or navigate to demo page
    console.log('View demo for', industry.name);
  };

  const handleCalculateROI = () => {
    // TODO: Show ROI calculator modal
    console.log('Calculate ROI for', industry.name);
  };

  const handleLearnMore = (useCase: any) => {
    // TODO: Show use case details modal
    console.log('Learn more about', useCase.title);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <IndustryHero
        industry={industry}
        onStartTrial={handleStartTrial}
        onViewDemo={handleViewDemo}
      />

      {/* Pain Points Section */}
      <IndustryPainPoints
        painPoints={industry.painPoints}
        industryName={industry.name}
      />

      {/* Use Cases Section */}
      <IndustryUseCases
        useCases={industry.useCases}
        industryName={industry.name}
        onLearnMore={handleLearnMore}
      />

      {/* Metrics Section */}
      <IndustryMetrics
        metrics={industry.metrics}
        industryName={industry.name}
        onCalculateROI={handleCalculateROI}
      />

      {/* Testimonials Section */}
      <IndustryTestimonials
        testimonials={industry.testimonials}
        industryName={industry.name}
      />

      {/* Integrations Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Se integra con tus herramientas favoritas
            </h2>
            <p className="text-lg text-gray-600">
              Conecta Neptunik con las plataformas que ya usas en tu negocio
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
            {industry.integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-center w-32 h-20 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-600 font-medium">
                  {integration.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transforma tu negocio de {industry.name.toLowerCase()} con WhatsApp
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Únete a más de 500 empresas que ya están automatizando su comunicación
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={handleStartTrial}
              >
                Empezar prueba gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Phone className="mr-2 h-5 w-5" />
                Hablar con un experto
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar guía {industry.name}
              </Button>
            </div>

            <div className="text-sm text-white/80">
              <p>✓ Sin tarjeta de crédito</p>
              <p>✓ Configuración en 5 minutos</p>
              <p>✓ Soporte especializado en {industry.name.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}