/**
 * Restaurant Campaign Landing Page - A/B Test Variant B
 * Focused on ease of use and quick setup messaging
 * Target KPIs: CPL <€50, Conversion Rate >5%, Onboarding >40%
 */

import { Metadata } from 'next';

import { CTASection } from '@/modules/marketing/presentation/components/cta-section';
import { LandingFooter } from '@/modules/marketing/presentation/components/landing-footer';
import { HeroSection } from '@/modules/marketing/presentation/components/hero-section';
import { PricingCards } from '@/modules/marketing/presentation/components/pricing-cards';
import { ValueProps } from '@/modules/marketing/presentation/components/value-props';
import { Testimonials } from '@/modules/marketing/presentation/components/testimonials';
import { UseCasesSection } from '@/modules/marketing/presentation/components/use-cases-section';
import { UTMTracker } from '@/modules/marketing/presentation/components/utm-tracker';

export const metadata: Metadata = {
  title: 'WhatsApp para tu Restaurante Listo en 5 Minutos | Sin Complicaciones',
  description: 'Setup automático, sin programación, sin contratos. Tu restaurante conectado a WhatsApp en minutos, no meses. Prueba gratis.',
  keywords: ['WhatsApp restaurante fácil', 'setup automático', 'sin programación', 'restaurante simple', 'WhatsApp rápido'],
  openGraph: {
    title: 'WhatsApp para Restaurantes | Listo en 5 Minutos | Neptunik',
    description: 'La forma más fácil de conectar tu restaurante a WhatsApp. Sin complicaciones técnicas, sin contratos largos.',
    images: ['/images/campaign/restaurant-simplicity-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp for Restaurants | Ready in 5 Minutes',
    description: 'The easiest way to connect your restaurant to WhatsApp. No technical complications, no long contracts.',
    images: ['/images/campaign/restaurant-simplicity-twitter.jpg'],
  },
};

export default function RestaurantCampaignPageB() {
  const campaignData = {
    variant: 'B', // A/B test variant
    industry: 'restaurant',
    utm_source: 'google_ads',
    utm_medium: 'cpc',
    utm_campaign: 'restaurant_validation_2025_q1',
    utm_content: 'simplicity_focused_variant_b',
    target_cpl: 50, // EUR
    target_conversion: 0.05, // 5%
  };

  const simplicityFeatures = [
    {
      title: 'Setup Automático en 5 Minutos',
      description: 'Solo necesitas tu número de WhatsApp Business. Nosotros nos encargamos del resto.',
      steps: [
        'Registra tu número',
        'Verifica con SMS',
        'Configura mensajes automáticos',
        '¡Listo para recibir clientes!'
      ],
      time: '5 min',
      difficulty: 'Súper fácil'
    },
    {
      title: 'Sin Conocimientos Técnicos',
      description: 'Interfaz diseñada para dueños de restaurante, no programadores.',
      benefits: [
        'Arrastrar y soltar plantillas',
        'Configuración visual paso a paso',
        'Soporte en español incluido',
        'Videos tutorial cortos'
      ],
      userFriendly: '100%',
      techRequired: 'Ninguno'
    },
    {
      title: 'Funciona Desde el Primer Día',
      description: 'Plantillas pre-configuradas específicas para restaurantes.',
      templates: [
        'Reservas automáticas',
        'Menú con precios',
        'Horarios de atención',
        'Ubicación y contacto'
      ],
      readyToUse: 'Inmediato',
      customization: 'Fácil'
    }
  ];

  const testimonialsB = [
    {
      id: 'rest_b1',
      name: 'Ana García',
      role: 'Propietaria',
      company: 'Tapería El Rincón',
      location: 'Valencia',
      avatar: '/images/testimonials/ana-garcia.jpg',
      content: 'En 10 minutos tenía todo funcionando. Mis clientes ya reservan por WhatsApp sin que yo tenga que hacer nada.',
      metrics: {
        setupTime: '10 minutos',
        satisfaction: '5/5 estrellas',
        easeOfUse: 'Súper fácil'
      },
      verified: true
    },
    {
      id: 'rest_b2',
      name: 'Miguel Torres',
      role: 'Gerente',
      company: 'Pizzería Milano',
      location: 'Sevilla',
      avatar: '/images/testimonials/miguel-torres.jpg',
      content: 'Pensé que sería complicado, pero literalmente en 5 minutos estaba recibiendo pedidos automáticamente.',
      metrics: {
        setupTime: '5 minutos',
        techKnowledge: 'Ninguno',
        satisfaction: 'Excelente'
      },
      verified: true
    }
  ];

  return (
    <>
      {/* UTM Tracking Component */}
      <UTMTracker campaignData={campaignData} />

      {/* Hero Section with Simplicity focus */}
      <HeroSection
        variant="restaurant_simplicity"
        headline="Tu Restaurante en WhatsApp en Solo 5 Minutos"
        subheadline="Sin complicaciones técnicas, sin contratos eternos, sin dolor de cabeza. El WhatsApp para restaurantes más fácil del mundo."
        heroImage="/images/campaign/restaurant-hero-simple.jpg"
        ctaText="Empezar Ahora Gratis"
        ctaVariant="get_started"
        socialProof={{
          customerCount: '500+',
          industryFocus: 'restaurantes',
          setupTime: '5 minutos',
          satisfaction: '98% satisfacción'
        }}
        campaignData={campaignData}
      />

      {/* Simplicity-focused Features */}
      <ValueProps
        industry="restaurant"
        features={simplicityFeatures}
        campaignData={campaignData}
        timeGuarantee={{
          setupTime: '5 minutos',
          moneyBack: 'Si no funciona en 5 minutos, te devolvemos el dinero',
          support: '24/7 en español'
        }}
      />

      {/* Restaurant-Specific Use Cases (Simplified presentation) */}
      <UseCasesSection
        variant="simplified"
        useCases={[
          {
            title: 'Reservas que se Manejan Solas',
            description: 'Los clientes reservan, el sistema confirma, tú solo cocinas.',
            simplicity: 'Automático 100%',
            setup: '2 minutos'
          },
          {
            title: 'Pedidos sin Confusiones',
            description: 'Menú visual, precios claros, pedidos directos a cocina.',
            simplicity: 'Sin errores',
            setup: '3 minutos'
          },
          {
            title: 'Clientes que Vuelven',
            description: 'Ofertas automáticas para clientes frecuentes.',
            simplicity: 'Se configura solo',
            setup: '2 minutos'
          }
        ]}
        campaignData={campaignData}
      />

      {/* Social Proof & Testimonials (Simplicity focus) */}
      <Testimonials
        industry="restaurant"
        variant="simplicity_focused"
        testimonials={testimonialsB}
        campaignData={campaignData}
        simplicityStats={{
          averageSetupTime: '6 minutos',
          satisfactionRate: 98,
          noTechKnowledge: 95
        }}
      />

      {/* Campaign-Specific Pricing (Simplicity messaging) */}
      <PricingCards
        variant="restaurant_simplicity"
        industry="restaurant"
        campaignOffer={{
          discountPercent: 25,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          bonusFeatures: [
            'Setup personal gratuito (llamada 15 min)',
            'Plantillas pre-configuradas para tu tipo de restaurante',
            'Soporte prioritario primer mes',
            'Video tutorial personalizado'
          ]
        }}
        simplicityGuarantee={{
          setupTime: '5 minutos máximo',
          moneyBackGuarantee: 'Si no está listo en 5 minutos, gratis 3 meses',
          noTechRequired: 'Garantía cero conocimientos técnicos'
        }}
        campaignData={campaignData}
      />

      {/* Final CTA Section (Urgency + Simplicity) */}
      <CTASection
        variant="simplicity_urgency"
        headline="500+ Restaurantes ya lo Usan. Tu Turno es Ahora."
        subheadline="Ofertas especial: Setup gratuito + 25% descuento. Solo hasta fin de mes."
        ctaText="Configurar Mi WhatsApp Ahora"
        urgencyTimer={true}
        campaignData={campaignData}
        simplicityPromise={{
          timeGuarantee: '5 minutos máximo',
          difficultyLevel: 'Más fácil que hacer una reserva',
          support: 'Soporte en español 24/7',
          noCommitment: 'Cancela cuando quieras'
        }}
      />

      {/* Campaign Footer */}
      <LandingFooter
        campaignData={campaignData}
        industryLinks={[
          { label: 'Ver Demo en Vivo', href: '/demo/restaurante-live' },
          { label: 'Casos de Éxito', href: '/casos-exito/restaurantes' },
          { label: 'Setup en 5 Minutos', href: '/setup/restaurante-express' },
          { label: 'Soporte 24/7', href: '/soporte/chat' }
        ]}
      />

      {/* Feedback Collection Widget - Removed as component doesn't exist */}
    </>
  );
}