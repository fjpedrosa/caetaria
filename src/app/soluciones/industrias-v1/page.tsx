import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Heart,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { industriesV1 as industries } from '@/modules/solutions/domain/industries-data-v2';

export const metadata: Metadata = {
  title: 'Soluciones por Industria | WhatsApp Business | Neptunik',
  description: 'Soluciones WhatsApp Business específicas para cada industria: Comercio, Salud, Hostelería, Educación y Servicios Profesionales.',
  keywords: [
    'whatsapp business industrias',
    'whatsapp comercio',
    'whatsapp salud',
    'whatsapp hostelería',
    'whatsapp educación',
    'whatsapp servicios profesionales',
  ],
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

export default function IndustriesIndexPageV1() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean and Professional */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-neptune-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-whatsapp-green-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* Badge */}
            <Badge variant="outline" className="mb-6 inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whatsapp-green-500"></span>
              </span>
              Soluciones especializadas por sector
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              WhatsApp Business para{' '}
              <span className="text-brand-neptune-500">
                tu industria
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Cada industria tiene necesidades únicas. Por eso creamos soluciones específicas
              que se adaptan perfectamente a tu negocio.
            </p>
          </div>

          {/* Industries Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {industries.map((industry) => {
              const Icon = getIcon(industry.icon);
              return (
                <Link
                  key={industry.id}
                  href={`/soluciones/industrias/${industry.slug}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-brand-neptune-200 transition-all hover:-translate-y-1">
                    {/* Icon and Name */}
                    <div className="mb-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-neptune-50 dark:bg-brand-neptune-950 flex items-center justify-center mb-4 group-hover:bg-brand-neptune-100 dark:group-hover:bg-brand-neptune-900 transition-colors">
                        <Icon className="w-7 h-7 text-brand-neptune-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground group-hover:text-brand-neptune-500 transition-colors">
                        {industry.name}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6">
                      {industry.description}
                    </p>

                    {/* Key Benefits */}
                    <ul className="space-y-2 mb-6">
                      {industry.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit.id} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-whatsapp-green-500 flex-shrink-0" />
                          <span className="text-sm text-foreground">
                            <span className="font-semibold text-brand-neptune-500">
                              {benefit.metric}
                            </span>{' '}
                            {benefit.title.toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="group-hover:text-brand-neptune-500 p-0"
                      >
                        Ver solución completa
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {/* Pain point teaser */}
                    {industry.painPoints[0] && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Resolvemos:</span> {industry.painPoints[0].title}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <p className="text-lg text-muted-foreground">
                ¿No encuentras tu industria? Tenemos soluciones personalizadas para ti
              </p>
              <Button
                size="lg"
                className="bg-brand-neptune-500 hover:bg-brand-neptune-600 text-white shadow-brand hover:shadow-brand-lg transition-all"
              >
                Hablar con un experto
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-brand-neptune-500">+500</p>
              <p className="text-muted-foreground">Empresas activas</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-brand-neptune-500">5</p>
              <p className="text-muted-foreground">Industrias especializadas</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-brand-neptune-500">98%</p>
              <p className="text-muted-foreground">Tasa de apertura</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-brand-neptune-500">40%</p>
              <p className="text-muted-foreground">Más conversión</p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-whatsapp-green-500" />
              <span className="text-sm text-muted-foreground">Configuración en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-whatsapp-green-500" />
              <span className="text-sm text-muted-foreground">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-whatsapp-green-500" />
              <span className="text-sm text-muted-foreground">Soporte 24/7 en español</span>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Integration Banner */}
      <section className="py-12 bg-whatsapp-green-50 dark:bg-whatsapp-green-950/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-whatsapp-green-500 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">Integración oficial de WhatsApp</p>
                <p className="text-sm text-muted-foreground">Partner verificado con badge verde</p>
              </div>
            </div>
            <Button variant="outline" className="border-whatsapp-green-500 text-whatsapp-green-600 hover:bg-whatsapp-green-100 dark:hover:bg-whatsapp-green-900">
              <TrendingUp className="mr-2 h-4 w-4" />
              Ver casos de éxito
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}