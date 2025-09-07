'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle,
  MessageCircle,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';

import { Industry } from '../../domain/types';

interface IndustryDetailPageProps {
  industry: Industry;
}

export function IndustryDetailPage({ industry }: IndustryDetailPageProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'ShoppingCart': require('lucide-react').ShoppingCart,
      'Heart': require('lucide-react').Heart,
      'UtensilsCrossed': require('lucide-react').UtensilsCrossed,
      'GraduationCap': require('lucide-react').GraduationCap,
      'Briefcase': require('lucide-react').Briefcase,
    };
    return icons[iconName] || CheckCircle;
  };

  const Icon = getIcon(industry.icon);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Version 4 Design */}
      <section className="relative gradient-pricing py-16 md:py-24 overflow-hidden">
        {/* Static Geometric Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-neptune-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-neptune-500/5 rounded-full blur-3xl" />

        {/* Very subtle animated accent */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl animate-[float_25s_ease-in-out_infinite]" />

        <div className="container relative mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              {/* Badge */}
              <Badge variant="outline" className="inline-flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Solución especializada para {industry.name}
              </Badge>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  WhatsApp Business para{' '}
                  <span className="text-brand-neptune-500">{industry.name}</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  {industry.description}
                </p>
              </div>

              {/* Key Benefits */}
              <div className="space-y-3">
                {industry.benefits?.slice(0, 3).map((benefit) => (
                  <div key={benefit.id} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong className="font-semibold text-brand-neptune-500">
                        {benefit.metric}
                      </strong>{' '}
                      {benefit.title.toLowerCase()}
                    </span>
                  </div>
                )) || []}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="shadow-lg">
                  <Zap className="mr-2 h-5 w-5" />
                  Empezar prueba gratis
                </Button>
                <Button size="lg" variant="outline" onClick={() => setIsVideoModalOpen(true)}>
                  <Play className="mr-2 h-5 w-5" />
                  Ver demo en vivo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Configuración en 5 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Soporte 24/7</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {industry.metrics?.slice(0, 4).map((metric, index) => (
                <Card
                  key={metric.id}
                  className={`p-6 hover:shadow-lg transition-shadow ${
                    index === 0 ? 'col-span-2' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand-neptune-500">
                        {metric.after}
                      </span>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {metric.improvement}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Antes: {metric.before}
                    </p>
                  </div>
                </Card>
              )) || []}
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="mr-1 h-3 w-3" />
              Problemas que resolvemos
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Sabemos los desafíos de {industry.name.toLowerCase()}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hemos trabajado con cientos de empresas del sector y conocemos exactamente
              qué necesitas para triunfar con WhatsApp Business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {industry.painPoints?.map((painPoint) => (
              <Card key={painPoint.id} className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{painPoint.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {painPoint.description}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Nuestra solución</p>
                      <p className="text-sm text-muted-foreground">WhatsApp Business automatizado que resuelve este problema específico</p>
                    </div>
                  </div>
                </div>
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <MessageCircle className="mr-1 h-3 w-3" />
              Casos de uso específicos
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              WhatsApp Business adaptado a tu industria
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Implementaciones específicas que generan resultados inmediatos en {industry.name.toLowerCase()}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {industry.useCases?.map((useCase, index) => (
              <Card key={useCase.id} className={`p-8 ${index === 0 ? 'border-primary border-2' : ''}`}>
                {index === 0 && (
                  <Badge className="mb-4">Más popular</Badge>
                )}
                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground mb-6">{useCase.description}</p>

                {useCase.example && (
                  <div className="pt-4 border-t">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-brand-neptune-500 mb-2">Ejemplo práctico:</p>
                      <p className="text-sm text-muted-foreground">{useCase.example}</p>
                    </div>
                  </div>
                )}
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users className="mr-1 h-3 w-3" />
              Casos de éxito
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Lo que dicen nuestros clientes de {industry.name.toLowerCase()}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {industry.testimonials?.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="text-sm mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <footer>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} en {testimonial.company}
                  </p>
                  {testimonial.metric && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-brand-neptune-500">
                        {testimonial.metric}
                      </p>
                    </div>
                  )}
                </footer>
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-brand-neptune-50/50 to-transparent dark:from-brand-neptune-950/50">
            <div className="w-16 h-16 rounded-xl bg-brand-neptune-100 dark:bg-brand-neptune-900 flex items-center justify-center mx-auto mb-6">
              <Icon className="w-8 h-8 text-brand-neptune-500" />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Transforma tu {industry.name.toLowerCase()} con WhatsApp Business
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a más de 500 empresas que ya están automatizando su comunicación
              y vendiendo más con nuestra solución especializada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Empezar prueba gratis
              </Button>
              <Button size="lg" variant="outline">
                Hablar con un experto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                14 días gratis
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Sin tarjeta
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Cancela cuando quieras
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Related Industries */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Explora otras industrias</h3>
            <p className="text-muted-foreground">
              Descubre cómo WhatsApp Business puede transformar otros sectores
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {['comercio', 'salud', 'hosteleria', 'educacion', 'servicios-profesionales']
              .filter(slug => slug !== industry.slug)
              .slice(0, 3)
              .map((slug) => (
                <Link key={slug} href={`/soluciones/industrias/${slug}`}>
                  <Button variant="outline" size="sm">
                    {slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}