/**
 * Restaurant Campaign Landing Page - A/B Test Variant A
 * Focused on ROI messaging and restaurant-specific use cases
 * Target KPIs: CPL <€50, Conversion Rate >5%, Onboarding >40%
 */

import { Metadata } from 'next';

import { CampaignCTASection } from '@/modules/marketing/presentation/components/campaign-cta-section';
import { CampaignFooter } from '@/modules/marketing/presentation/components/campaign-footer';
import { CampaignHeroSection } from '@/modules/marketing/presentation/components/campaign-hero-section';
import { CampaignPricing } from '@/modules/marketing/presentation/components/campaign-pricing';
import { CampaignROICalculator } from '@/modules/marketing/presentation/components/campaign-roi-calculator';
import { CampaignTestimonials } from '@/modules/marketing/presentation/components/campaign-testimonials';
import { FeedbackWidget } from '@/modules/marketing/presentation/components/feedback-widget';
import { RestaurantUseCases } from '@/modules/marketing/presentation/components/restaurant-use-cases';
import { UTMTracker } from '@/modules/marketing/presentation/components/utm-tracker';

export const metadata: Metadata = {
  title: 'Aumenta las Ventas de tu Restaurante 30% con WhatsApp Automatizado',
  description: 'Automatiza reservas, pedidos y atención al cliente. Reduce tiempo de respuesta 90% y aumenta conversión 40%. Prueba gratis.',
  keywords: ['restaurante WhatsApp', 'automatización restaurante', 'reservas automáticas', 'pedidos WhatsApp', 'gestión restaurante'],
  openGraph: {
    title: 'Automatización WhatsApp para Restaurantes | +30% Ventas Garantizado',
    description: 'Sistema completo para automatizar tu restaurante: reservas, pedidos, marketing. Casos de éxito reales con ROI demostrado.',
    images: ['/images/campaign/restaurant-hero-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Automation for Restaurants | +30% Sales',
    description: 'Complete restaurant automation: reservations, orders, marketing. Real success cases with proven ROI.',
    images: ['/images/campaign/restaurant-hero-twitter.jpg'],
  },
};

export default function RestaurantCampaignPage() {
  const campaignData = {
    variant: 'A', // A/B test variant
    industry: 'restaurant',
    utm_source: 'google_ads',
    utm_medium: 'cpc',
    utm_campaign: 'restaurant_validation_2025_q1',
    utm_content: 'roi_focused_variant_a',
    target_cpl: 50, // EUR
    target_conversion: 0.05, // 5%
  };

  const restaurantROIData = {
    averageOrderValue: 25,
    dailyOrders: 40,
    monthlyRevenue: 30000,
    currentResponseTime: 120, // minutes
    targetResponseTime: 2, // minutes
    conversionIncrease: 30, // percent
  };

  const restaurantUseCases = [
    {
      title: 'Reservas Automáticas 24/7',
      description: 'Sistema inteligente que confirma disponibilidad, gestiona horarios y envía recordatorios automáticos.',
      metrics: {
        timeSaved: '15 horas/semana',
        conversionIncrease: '+25%',
        customerSatisfaction: '98%'
      },
      features: [
        'Confirmación instantánea de disponibilidad',
        'Gestión automática de cancelaciones',
        'Recordatorios personalizados',
        'Integración con calendario del restaurante'
      ]
    },
    {
      title: 'Pedidos y Delivery Optimizado',
      description: 'Automatiza todo el proceso de pedidos desde WhatsApp con catálogo interactivo y pagos integrados.',
      metrics: {
        orderIncrease: '+40%',
        errorReduction: '85%',
        customerRetention: '+60%'
      },
      features: [
        'Catálogo visual interactivo',
        'Cálculo automático de precios',
        'Integración con sistemas de pago',
        'Tracking de pedidos en tiempo real'
      ]
    },
    {
      title: 'Marketing y Fidelización',
      description: 'Campaañs personalizadas, promociones automáticas y programa de fidelidad integrado.',
      metrics: {
        repeatCustomers: '+50%',
        promotionConversion: '+35%',
        wordOfMouth: '+200%'
      },
      features: [
        'Ofertas personalizadas por cliente',
        'Programa de puntos automático',
        'Campañas por segmentos',
        'Referidos con incentivos'
      ]
    }
  ];

  return (
    <>
      {/* UTM Tracking Component */}
      <UTMTracker campaignData={campaignData} />

      {/* Hero Section with ROI focus */}
      <CampaignHeroSection
        variant="restaurant_roi"
        headline="Aumenta las Ventas de tu Restaurante un 30% en los Próximos 90 Días"
        subheadline="Sistema completo de automatización WhatsApp diseñado específicamente para restaurantes. ROI garantizado desde el primer mes."
        heroImage="/images/campaign/restaurant-hero-dashboard.jpg"
        ctaText="Calcular Mi ROI Gratis"
        ctaVariant="roi_calculator"
        socialProof={{
          customerCount: '500+',
          industryFocus: 'restaurantes',
          avgIncrease: '30%',
          timeToValue: '48 horas'
        }}
        campaignData={campaignData}
      />

      {/* ROI Calculator Section */}
      <CampaignROICalculator
        industry="restaurant"
        defaultValues={restaurantROIData}
        conversionGoals={{
          increaseOrders: 30,
          reduceResponseTime: 95,
          improveRetention: 50
        }}
        campaignData={campaignData}
      />

      {/* Restaurant-Specific Use Cases */}
      <RestaurantUseCases
        useCases={restaurantUseCases}
        campaignData={campaignData}
      />

      {/* Social Proof & Testimonials */}
      <CampaignTestimonials
        industry="restaurant"
        testimonials={[
          {
            id: 'rest_1',
            name: 'Carlos Mendoza',
            role: 'Propietario',
            company: 'La Taberna del Puerto',
            location: 'Madrid',
            avatar: '/images/testimonials/carlos-mendoza.jpg',
            content: 'En 3 meses aumentamos las reservas 40% y redujimos cancelaciones 60%. El ROI fue inmediato.',
            metrics: {
              revenueIncrease: '+40%',
              timeSaved: '20 horas/semana',
              customerSatisfaction: '4.8/5'
            },
            verified: true
          },
          {
            id: 'rest_2',
            name: 'María Fernández',
            role: 'Gerente',
            company: 'Pizzería Bella Vista',
            location: 'Barcelona',
            avatar: '/images/testimonials/maria-fernandez.jpg',
            content: 'Los pedidos por WhatsApp se triplicaron. Ya no perdemos ningún cliente por demoras en responder.',
            metrics: {
              orderIncrease: '+300%',
              responseTime: '2 minutos',
              errorReduction: '90%'
            },
            verified: true
          }
        ]}
        campaignData={campaignData}
      />

      {/* Campaign-Specific Pricing */}
      <CampaignPricing
        variant="restaurant_campaign"
        industry="restaurant"
        campaignOffer={{
          discountPercent: 25,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          bonusFeatures: [
            'Setup gratuito personalizado para restaurantes',
            'Plantillas específicas para reservas y pedidos',
            '30 días de soporte premium incluido',
            'Integración gratuita con un sistema POS'
          ]
        }}
        roiGuarantee={{
          timeframe: '90 días',
          minIncrease: '20%',
          moneyBackGuarantee: true
        }}
        campaignData={campaignData}
      />

      {/* Final CTA Section */}
      <CampaignCTASection
        variant="urgency"
        headline="Únete a los 500+ Restaurantes que ya Aumentaron sus Ventas"
        subheadline="Oferta limitada: 25% descuento + setup gratuito. Solo disponible hasta fin de mes."
        ctaText="Empezar Mi Prueba Gratuita"
        urgencyTimer={true}
        campaignData={campaignData}
        riskReduction={{
          freeTrialDays: 14,
          moneyBackGuarantee: 30,
          noSetupFees: true,
          cancelAnytime: true
        }}
      />

      {/* Campaign Footer */}
      <CampaignFooter
        campaignData={campaignData}
        industryLinks={[
          { label: 'Casos de Éxito Restaurantes', href: '/casos-exito/restaurantes' },
          { label: 'Guía Setup Restaurante', href: '/guias/restaurante-setup' },
          { label: 'Integraciones POS', href: '/integraciones/pos-restaurante' },
          { label: 'Calculadora ROI', href: '/herramientas/roi-calculator' }
        ]}
      />

      {/* Feedback Collection Widget */}
      <FeedbackWidget
        campaignData={campaignData}
        feedbackType="campaign_experience"
        position="bottom-right"
      />
    </>
  );
}