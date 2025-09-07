import {
  ArrowRight,
  Briefcase,
  Check,
  GraduationCap,
  Heart,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/modules/shared/presentation/components/ui/badge';
import { Button } from '@/modules/shared/presentation/components/ui/button';
import { Card } from '@/modules/shared/presentation/components/ui/card';

export const metadata: Metadata = {
  title: 'Soluciones WhatsApp Business | Neptunik',
  description: 'Soluciones WhatsApp Business adaptadas a tu industria y casos de uso específicos. Automatiza, vende más y mejora la experiencia del cliente.',
  keywords: [
    'whatsapp business soluciones',
    'automatización whatsapp',
    'chatbot whatsapp',
    'whatsapp api',
    'soluciones por industria',
    'casos de uso whatsapp',
  ],
};

// Industry icons mapping
const industryIcons = [
  { icon: ShoppingCart, name: 'Comercio' },
  { icon: Heart, name: 'Salud' },
  { icon: UtensilsCrossed, name: 'Hostelería' },
  { icon: GraduationCap, name: 'Educación' },
  { icon: Briefcase, name: 'Servicios' },
];

// Use case categories
const useCaseCategories = [
  {
    id: 'ventas',
    title: 'Ventas y Conversión',
    description: 'Cierra más ventas con atención 24/7',
    icon: TrendingUp,
    examples: ['Catálogos interactivos', 'Cotizaciones automáticas', 'Cross-selling'],
  },
  {
    id: 'soporte',
    title: 'Atención al Cliente',
    description: 'Resuelve dudas al instante',
    icon: MessageCircle,
    examples: ['FAQ automatizadas', 'Tickets de soporte', 'Seguimiento de casos'],
  },
  {
    id: 'marketing',
    title: 'Marketing y Engagement',
    description: 'Campañas personalizadas que convierten',
    icon: Target,
    examples: ['Campañas masivas', 'Segmentación', 'Retargeting'],
  },
  {
    id: 'operaciones',
    title: 'Operaciones',
    description: 'Automatiza procesos repetitivos',
    icon: Zap,
    examples: ['Reservas automáticas', 'Confirmaciones', 'Recordatorios'],
  },
];

export default function SolutionsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative gradient-pricing py-20 md:py-28 overflow-hidden">
        {/* Static Geometric Shapes */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-brand-neptune-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-neptune-500/5 rounded-full blur-3xl" />

        {/* Very subtle animated accents */}
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl animate-[float_30s_ease-in-out_infinite]" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Soluciones que transforman negocios
            </Badge>

            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Soluciones WhatsApp Business{' '}
              <span className="text-brand-neptune-500">
                para cada necesidad
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Ya sea por industria o caso de uso, tenemos la solución perfecta para
              automatizar tu comunicación, aumentar ventas y mejorar la experiencia del cliente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Empezar prueba gratis
              </Button>
              <Button size="lg" variant="outline">
                <MessageCircle className="mr-2 h-5 w-5" />
                Hablar con ventas
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                +500 empresas activas
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                98% satisfacción
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ROI en 30 días
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Industry */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Briefcase className="mr-1 h-3 w-3" />
              Por industria
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Soluciones especializadas por industria
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conocemos los desafíos únicos de cada sector y tenemos la experiencia
              para resolverlos con WhatsApp Business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {industryIcons.map((industry, index) => {
              const Icon = industry.icon;
              const isPopular = index === 1;

              return (
                <Card
                  key={industry.name}
                  className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    isPopular ? 'border-primary border-2 relative' : ''
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Más popular
                    </Badge>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-neptune-50 dark:bg-brand-neptune-950 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-brand-neptune-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{industry.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Soluciones específicas para empresas del sector
                      </p>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm">+40% conversión</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/soluciones/industrias">
              <Button size="lg" variant="outline">
                Ver todas las industrias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions by Use Case */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Target className="mr-1 h-3 w-3" />
              Por caso de uso
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Soluciones para cada objetivo de negocio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sea cual sea tu objetivo, tenemos plantillas y flujos probados
              que generan resultados desde el día uno.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
            {useCaseCategories.map((category) => {
              const Icon = category.icon;

              return (
                <Card key={category.id} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-brand-neptune-50 dark:bg-brand-neptune-950 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-brand-neptune-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {category.examples.map((example) => (
                      <div key={example} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="text-sm">{example}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" variant="secondary">
                    Explorar casos de uso
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Link href="/soluciones/casos-uso">
              <Button size="lg" variant="outline">
                Ver todos los casos de uso
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Resultados que hablan por sí solos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Métricas reales de empresas que confían en nuestras soluciones
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-4 text-brand-neptune-500" />
              <p className="text-3xl font-bold mb-2">+500</p>
              <p className="text-sm text-muted-foreground">Empresas activas</p>
            </Card>

            <Card className="p-6 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-4 text-brand-neptune-500" />
              <p className="text-3xl font-bold mb-2">2M+</p>
              <p className="text-sm text-muted-foreground">Mensajes/mes</p>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-3xl font-bold mb-2">+40%</p>
              <p className="text-sm text-muted-foreground">Aumento ventas</p>
            </Card>

            <Card className="p-6 text-center">
              <Zap className="w-10 h-10 mx-auto mb-4 text-brand-neptune-500" />
              <p className="text-3xl font-bold mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Disponibilidad</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-neptune-50/50 to-transparent dark:from-brand-neptune-950/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center border-0 bg-transparent">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para transformar tu negocio con WhatsApp?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a las más de 500 empresas que ya están vendiendo más
              y atendiendo mejor con nuestras soluciones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Empezar 14 días gratis
              </Button>
              <Button size="lg" variant="outline">
                Agendar demo personalizada
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Configuración en 5 min
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Soporte en español
              </span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}