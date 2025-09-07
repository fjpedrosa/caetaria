import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Heart,
  ShoppingCart,
  Star,
  TrendingUp,
  UtensilsCrossed,
  Zap
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
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

// ITERATION 3: Neptune Blue with Subtle Gradients
// Adds depth without distraction using very soft gradient backgrounds

export default function IndustriesIndexPageV3() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Subtle Gradient Background */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-background via-brand-neptune-50/5 to-background dark:from-background dark:via-brand-neptune-950/10 dark:to-background">
        {/* Very subtle animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-neptune-200/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-brand-neptune-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-neptune-100/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, oklch(0.62 0.22 220) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            {/* Badge with subtle gradient */}
            <Badge variant="outline" className="mb-6 border-brand-neptune-200/50 bg-gradient-to-r from-brand-neptune-50/50 to-transparent dark:from-brand-neptune-950/50 dark:border-brand-neptune-800/50">
              <Star className="mr-2 h-3 w-3 text-brand-neptune-500" />
              Soluciones especializadas por sector
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">WhatsApp Business para </span>
              <span className="relative">
                <span className="relative z-10 text-brand-neptune-500">tu industria</span>
                {/* Subtle underline gradient */}
                <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-brand-neptune-200/30 to-brand-neptune-300/30 -z-10 transform translate-y-2" />
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada industria es única. Nuestras soluciones se adaptan perfectamente
              a los desafíos específicos de tu sector.
            </p>
          </div>

          {/* Industries Grid with Gradient Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {industries.map((industry, index) => {
              const Icon = getIcon(industry.icon);
              // Different subtle gradient directions for variety
              const gradientClasses = [
                'from-brand-neptune-50/30 via-transparent to-transparent',
                'from-transparent via-brand-neptune-50/30 to-transparent',
                'from-transparent to-brand-neptune-50/30',
                'from-brand-neptune-50/20 to-transparent',
                'from-transparent via-transparent to-brand-neptune-50/30',
              ];

              return (
                <Link
                  key={industry.id}
                  href={`/soluciones/industrias/${industry.slug}`}
                  className="group"
                >
                  <div className={cn(
                    'relative bg-card border border-border rounded-2xl p-6',
                    'hover:shadow-xl hover:border-brand-neptune-200/50 dark:hover:border-brand-neptune-800/50',
                    'transition-all duration-300 hover:-translate-y-1',
                    'overflow-hidden'
                  )}>
                    {/* Subtle gradient background */}
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-50',
                      gradientClasses[index % gradientClasses.length],
                      'dark:from-brand-neptune-950/20 dark:via-transparent dark:to-transparent'
                    )} />

                    <div className="relative">
                      {/* Icon with subtle gradient shadow */}
                      <div className="mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-neptune-400/20 to-brand-neptune-600/20 rounded-xl blur-xl" />
                          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-brand-neptune-50 to-brand-neptune-100 dark:from-brand-neptune-950 dark:to-brand-neptune-900 flex items-center justify-center">
                            <Icon className="w-7 h-7 text-brand-neptune-500" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand-neptune-500 transition-colors">
                        {industry.name}
                      </h2>

                      <p className="text-muted-foreground mb-6">
                        {industry.description}
                      </p>

                      {/* Benefits with gradient bullets */}
                      <ul className="space-y-2 mb-6">
                        {industry.benefits.slice(0, 3).map((benefit) => (
                          <li key={benefit.id} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-brand-neptune-400 to-brand-neptune-600 flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-foreground">
                              <span className="font-semibold text-brand-neptune-500">
                                {benefit.metric}
                              </span>{' '}
                              {benefit.title.toLowerCase()}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA with gradient hover */}
                      <div className="flex items-center text-brand-neptune-500 font-medium group-hover:text-brand-neptune-600">
                        Ver solución completa
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-neptune-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA Section with gradient background */}
          <div className="mt-16 text-center">
            <div className="relative inline-block">
              {/* Gradient background blur */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-neptune-400/20 to-brand-neptune-600/20 blur-3xl" />

              <div className="relative bg-gradient-to-r from-brand-neptune-50/80 to-brand-neptune-100/80 dark:from-brand-neptune-950/80 dark:to-brand-neptune-900/80 backdrop-blur-sm rounded-2xl p-8 border border-brand-neptune-200/50 dark:border-brand-neptune-800/50">
                <p className="text-lg text-muted-foreground mb-4">
                  ¿No encuentras tu industria? Creamos soluciones personalizadas
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-brand-neptune-500 to-brand-neptune-600 hover:from-brand-neptune-600 hover:to-brand-neptune-700 text-white shadow-lg"
                  >
                    Empezar ahora
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-brand-neptune-300 hover:bg-brand-neptune-50/50 dark:border-brand-neptune-700 dark:hover:bg-brand-neptune-950/50"
                  >
                    Hablar con un experto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with gradient overlay */}
      <section className="relative py-16 bg-gradient-to-b from-transparent via-brand-neptune-50/5 to-transparent dark:via-brand-neptune-950/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '+500', label: 'Empresas activas' },
              { value: '98%', label: 'Tasa de apertura' },
              { value: '+40%', label: 'Más conversión' },
              { value: '24/7', label: 'Soporte disponible' },
            ].map((stat, index) => (
              <div key={index} className="relative">
                {/* Gradient background for each stat */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-neptune-100/20 to-transparent rounded-lg blur-xl" />
                <div className="relative space-y-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-brand-neptune-400 to-brand-neptune-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators with gradient background */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 p-4 rounded-full bg-gradient-to-r from-brand-neptune-50/30 via-transparent to-brand-neptune-50/30 dark:from-brand-neptune-950/30 dark:to-brand-neptune-950/30">
              {[
                'Configuración en 5 minutos',
                'Sin tarjeta de crédito',
                'Soporte 24/7 en español',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-neptune-400 to-brand-neptune-600 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}