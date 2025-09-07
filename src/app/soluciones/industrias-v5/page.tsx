import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  GraduationCap,
  Heart,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed} from 'lucide-react';
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

// ITERATION 5: Neptune Blue + Premium Grays
// Corporate, professional design with refined gray scale

export default function IndustriesIndexPageV5() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section - Premium Corporate Style */}
      <section className="relative py-20 md:py-28 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%),
                             linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.02) 50%, transparent 52%)`,
            backgroundSize: '20px 20px'
          }}
        />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Building2 className="w-4 h-4 text-brand-neptune-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Soluciones Empresariales
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gray-900 dark:text-gray-100">
                WhatsApp Business
              </span>
              <br />
              <span className="text-brand-neptune-500">
                para tu Industria
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Soluciones profesionales diseñadas específicamente para los desafíos
              de tu sector. Tecnología de vanguardia con resultados medibles.
            </p>

            {/* Professional trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  +500 Empresas
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  98% Satisfacción
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  ROI Garantizado
                </span>
              </div>
            </div>
          </div>

          {/* Industries Grid - Premium Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {industries.map((industry) => {
              const Icon = getIcon(industry.icon);

              return (
                <Link
                  key={industry.id}
                  href={`/soluciones/industrias/${industry.slug}`}
                  className="group"
                >
                  <div className={cn(
                    'relative bg-white dark:bg-gray-900',
                    'border border-gray-200 dark:border-gray-800',
                    'rounded-lg p-8',
                    'hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700',
                    'transition-all duration-300'
                  )}>
                    {/* Icon section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-neptune-500" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-neptune-500 transition-colors" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {industry.name}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                      {industry.description}
                    </p>

                    {/* Key metrics - Professional style */}
                    <div className="space-y-3 mb-6">
                      {industry.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {metric.metric}
                          </span>
                          <span className="text-sm font-bold text-brand-neptune-500">
                            {metric.improvement}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Professional CTA */}
                    <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-neptune-500 transition-colors">
                      Explorar solución
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Top corner accent */}
                    <div className="absolute top-0 right-0 w-1 h-12 bg-gradient-to-b from-brand-neptune-500 to-transparent rounded-tr-lg" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Professional CTA */}
          <div className="mt-16 text-center">
            <div className="inline-block">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Necesitas una solución personalizada para tu empresa?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-brand-neptune-500 hover:bg-brand-neptune-600 text-white px-8"
                >
                  Solicitar Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 px-8"
                >
                  Hablar con Ventas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Corporate Style */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { label: 'Tasa de Apertura', value: '98%', subtext: 'vs 20% email' },
                { label: 'Reducción de Costos', value: '-60%', subtext: 'en soporte' },
                { label: 'Incremento en Ventas', value: '+40%', subtext: 'promedio' },
                { label: 'Tiempo de Implementación', value: '5 días', subtext: 'llave en mano' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-brand-neptune-500 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Capacidades de la Plataforma
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Automatización Inteligente',
                description: 'IA conversacional entrenada para tu industria específica',
                icon: '🤖' // Would be replaced with icon component
              },
              {
                title: 'Integración Completa',
                description: 'Conecta con tus sistemas existentes sin fricción',
                icon: '🔗'
              },
              {
                title: 'Análisis en Tiempo Real',
                description: 'Métricas y KPIs actualizados cada segundo',
                icon: '📊'
              },
              {
                title: 'Seguridad Empresarial',
                description: 'Encriptación end-to-end y cumplimiento GDPR',
                icon: '🔒'
              },
              {
                title: 'Soporte Dedicado',
                description: 'Equipo de expertos disponible 24/7',
                icon: '🎯'
              },
              {
                title: 'Escalabilidad Garantizada',
                description: 'Crece de 10 a 10,000 conversaciones sin problemas',
                icon: '📈'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-brand-neptune-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Professional */}
      <section className="py-20 bg-gray-900 dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Transforma tu Comunicación Empresarial
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Únete a las empresas líderes que ya confían en Neptunik
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-neptune-500 hover:bg-brand-neptune-600 text-white px-10 py-6 text-lg"
            >
              Comenzar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 px-10 py-6 text-lg"
            >
              Agendar Consultoría
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Sin compromisos
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Implementación incluida
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              ROI en 30 días
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}