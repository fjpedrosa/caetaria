import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Heart,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  Zap
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';
import { industriesV1 as industries } from '@/modules/solutions/domain/industries-data-v2';

export const metadata: Metadata = {
  title: 'Soluciones por Industria | WhatsApp Business | Neptunik',
  description: 'Soluciones WhatsApp Business específicas para cada industria: Comercio, Salud, Hostelería, Educación y Servicios Profesionales.',
};

// Icon mapping helper
const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'ShoppingCart': ShoppingCart,
    'Heart': Heart,
    'UtensilsCrossed': UtensilsCrossed,
    'GraduationCap': GraduationCap,
    'Briefcase': Briefcase,
  };
  return icons[iconName] || ShoppingCart;
};

// ITERATION 2: Monochromatic Neptune Blue Design
// Professional, clean, focused on Neptune Blue shades only

export default function IndustriesIndexPageV2() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-brand-neptune-50/5 dark:to-brand-neptune-950/10">
      {/* Hero Section - Monochromatic Neptune */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Geometric pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              oklch(0.62 0.22 220 / 0.1) 35px,
              oklch(0.62 0.22 220 / 0.1) 70px
            )`
          }} />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            {/* Badge with Neptune accent */}
            <Badge className="mb-6 bg-brand-neptune-100 text-brand-neptune-700 border-brand-neptune-200 dark:bg-brand-neptune-900 dark:text-brand-neptune-200 dark:border-brand-neptune-800">
              <Sparkles className="mr-2 h-3 w-3" />
              Soluciones especializadas por sector
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Transforma tu </span>
              <span className="bg-gradient-to-r from-brand-neptune-400 to-brand-neptune-600 bg-clip-text text-transparent">
                industria
              </span>
              <span className="text-foreground"> con WhatsApp</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Soluciones diseñadas específicamente para los desafíos únicos de tu sector,
              con resultados comprobados y ROI garantizado.
            </p>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-neptune-500">98%</p>
                <p className="text-sm text-muted-foreground">Apertura</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-neptune-500">+40%</p>
                <p className="text-sm text-muted-foreground">Conversión</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-neptune-500">24/7</p>
                <p className="text-sm text-muted-foreground">Disponible</p>
              </div>
            </div>
          </div>

          {/* Industries Grid - Card based design */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {industries.map((industry, index) => {
              const Icon = getIcon(industry.icon);
              return (
                <Link
                  key={industry.id}
                  href={`/soluciones/industrias/${industry.slug}`}
                  className="group"
                >
                  <Card className="relative h-full p-8 border-2 border-transparent hover:border-brand-neptune-200 dark:hover:border-brand-neptune-800 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-neptune-50/0 to-brand-neptune-100/0 group-hover:from-brand-neptune-50/50 group-hover:to-brand-neptune-100/50 dark:group-hover:from-brand-neptune-950/50 dark:group-hover:to-brand-neptune-900/50 transition-all duration-300" />

                    <div className="relative">
                      {/* Icon with gradient background */}
                      <div className="mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-neptune-100 to-brand-neptune-200 dark:from-brand-neptune-900 dark:to-brand-neptune-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-brand-neptune-600 dark:text-brand-neptune-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand-neptune-600 dark:group-hover:text-brand-neptune-400 transition-colors">
                        {industry.name}
                      </h3>

                      <p className="text-muted-foreground mb-6 line-clamp-2">
                        {industry.description}
                      </p>

                      {/* Top 2 metrics */}
                      <div className="space-y-3 mb-6">
                        {industry.metrics.slice(0, 2).map((metric) => (
                          <div key={metric.id} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{metric.metric}</span>
                            <span className="text-sm font-semibold text-brand-neptune-500">
                              {metric.improvement}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center text-brand-neptune-500 font-medium">
                        Explorar solución
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-neptune-500/10 to-transparent" />
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <Card className="inline-block p-8 bg-gradient-to-r from-brand-neptune-50 to-brand-neptune-100 dark:from-brand-neptune-950 dark:to-brand-neptune-900 border-brand-neptune-200 dark:border-brand-neptune-800">
              <p className="text-lg mb-4 text-foreground">
                ¿Tu industria necesita una solución personalizada?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-brand-neptune-500 hover:bg-brand-neptune-600 text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Empezar ahora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-brand-neptune-300 hover:bg-brand-neptune-50 dark:border-brand-neptune-700 dark:hover:bg-brand-neptune-950"
                >
                  Hablar con experto
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-brand-neptune-50/30 dark:bg-brand-neptune-950/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Una plataforma, múltiples industrias
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-neptune-100 dark:bg-brand-neptune-900 flex items-center justify-center">
                <Zap className="w-8 h-8 text-brand-neptune-500" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Implementación rápida</h3>
              <p className="text-sm text-muted-foreground">
                Configuración en 5 minutos con plantillas pre-diseñadas para tu industria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-neptune-100 dark:bg-brand-neptune-900 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-brand-neptune-500" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Resultados garantizados</h3>
              <p className="text-sm text-muted-foreground">
                ROI comprobado con métricas específicas de tu sector
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-neptune-100 dark:bg-brand-neptune-900 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-neptune-500" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">IA especializada</h3>
              <p className="text-sm text-muted-foreground">
                Inteligencia artificial entrenada para tu industria específica
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}