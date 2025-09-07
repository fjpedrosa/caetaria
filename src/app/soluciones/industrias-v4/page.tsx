import {
  Activity,
  ArrowRight,
  Briefcase,
  Check,
  GraduationCap,
  Heart,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  Zap} from 'lucide-react';
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

// ITERATION 4: Neptune Blue + Emerald Accents (RECOMMENDED)
// Consistent with existing pricing component using emerald-600 for success states

export default function IndustriesIndexPageV4() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean like existing landing */}
      <section className="relative gradient-pricing py-16 md:py-24 overflow-hidden">
        {/* Static Geometric Shapes - No animation for better focus */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-neptune-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-neptune-500/5 rounded-full blur-3xl" />

        {/* Very subtle animated accent shapes - small and slow */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl animate-[float_25s_ease-in-out_infinite_reverse]" style={{ animationDelay: '5s' }} />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* Badge consistent with pricing */}
            <Badge variant="outline" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Soluciones especializadas por industria
            </Badge>

            <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight">
              WhatsApp Business para{' '}
              <span className="text-brand-neptune-500">cada industria</span>
            </h1>

            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Soluciones diseñadas específicamente para los desafíos únicos de tu sector.
              Empieza gratis y escala cuando lo necesites.
            </p>
          </div>

          {/* Industries Grid - Card style like pricing */}
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => {
              const Icon = getIcon(industry.icon);
              const isPopular = index === 1; // Make second industry "most popular"

              return (
                <Link
                  key={industry.id}
                  href={`/soluciones/industrias/${industry.slug}`}
                  className="group"
                >
                  <Card className={`relative p-8 transition-shadow hover:shadow-xl h-full ${
                    isPopular ? 'border-primary border-2' : ''
                  }`}>
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                        Más popular
                      </Badge>
                    )}

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-14 h-14 rounded-xl bg-brand-neptune-50 dark:bg-brand-neptune-950 flex items-center justify-center group-hover:bg-brand-neptune-100 dark:group-hover:bg-brand-neptune-900 transition-colors">
                        <Icon className="w-7 h-7 text-brand-neptune-500" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="mb-2 text-2xl font-bold">{industry.name}</h3>
                      <p className="text-muted-foreground">
                        {industry.description}
                      </p>
                    </div>

                    {/* Key metrics */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-brand-neptune-500">
                          {industry.metrics[0]?.improvement || '+40%'}
                        </span>
                        <span className="text-muted-foreground">
                          {industry.metrics[0]?.metric || 'mejora promedio'}
                        </span>
                      </div>
                    </div>

                    {/* Benefits list with emerald checks (like pricing) */}
                    <ul className="mb-8 space-y-3">
                      {industry.benefits.slice(0, 4).map((benefit) => (
                        <li key={benefit.id} className="flex items-center">
                          <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm">
                            <span className="font-semibold">{benefit.metric}</span> {benefit.title.toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className="w-full group-hover:shadow-lg transition-shadow"
                      size="lg"
                      variant={isPopular ? 'default' : 'secondary'}
                    >
                      Ver solución
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Card>
                </Link>
              );
            })}

            {/* Custom Solutions Card */}
            <Card className="relative p-8 transition-shadow hover:shadow-lg border border-secondary/20">
              <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-secondary-foreground" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-bold">Solución Personalizada</h3>
                <p className="text-muted-foreground">
                  Para empresas que necesitan soluciones a medida
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-muted-foreground">Precio</span>
                  <span className="text-lg text-muted-foreground">personalizado</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Análisis de necesidades</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Implementación guiada</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Soporte dedicado 24/7</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>SLA garantizado</span>
                </li>
              </ul>

              <Button className="w-full" size="lg" variant="outline">
                Contactar ventas
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          {/* Bottom notice like pricing */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-6">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                14 días de prueba gratis
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Cancela cuando quieras
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Resultados comprobados en todas las industrias
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <Activity className="w-8 h-8 mx-auto text-brand-neptune-500 mb-2" />
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Tasa de apertura</p>
            </div>
            <div className="space-y-2">
              <Zap className="w-8 h-8 mx-auto text-brand-neptune-500 mb-2" />
              <p className="text-3xl font-bold text-foreground">2 min</p>
              <p className="text-sm text-muted-foreground">Tiempo respuesta</p>
            </div>
            <div className="space-y-2">
              <Check className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-3xl font-bold text-foreground">+40%</p>
              <p className="text-sm text-muted-foreground">Más conversión</p>
            </div>
            <div className="space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto text-brand-neptune-500 mb-2" />
              <p className="text-3xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Disponibilidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-brand-neptune-50/50 to-transparent dark:from-brand-neptune-950/50">
            <h2 className="text-3xl font-bold mb-4">
              Empieza con WhatsApp Business hoy mismo
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a más de 500 empresas que ya están automatizando su comunicación
              y vendiendo más con WhatsApp
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Empezar prueba gratis
              </Button>
              <Button size="lg" variant="outline">
                Ver demo en vivo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Configuración en 5 min
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Soporte en español
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ROI garantizado
              </span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}