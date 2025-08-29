/**
 * Marketing Copy Constants
 * Centralized text content for all marketing components
 */

export const MARKETING_COPY = {
  hero: {
    badge: 'Lanzamiento Exclusivo 2025',
    title: 'Convierte WhatsApp en tu',
    subtitle: 'canal de ventas #1',
    description: 'Automatiza conversaciones, captura 3x más leads calificados y cierra ventas 24/7 con la plataforma de WhatsApp Business más avanzada para África.',
    cta: {
      primary: 'Comienza tu prueba gratis',
      secondary: 'Ver demostración 3 min'
    },
    metrics: {
      messages: '10M+ mensajes',
      businesses: '5K+ empresas',
      uptime: '99.9% uptime'
    }
  },

  valueProps: {
    title: 'Todo lo que necesitas para WhatsApp Business',
    cards: [
      {
        title: 'Configuración en minutos',
        description: 'Conecta tu WhatsApp Business API sin complicaciones. Interfaz intuitiva y soporte 24/7.',
        icon: 'Zap'
      },
      {
        title: 'Automatización inteligente',
        description: 'Respuestas automáticas con IA, flujos de conversación y gestión de contactos avanzada.',
        icon: 'Bot'
      },
      {
        title: 'Análisis en tiempo real',
        description: 'Métricas detalladas, reportes de conversaciones y optimización continua de tu comunicación.',
        icon: 'BarChart3'
      }
    ]
  },

  pricing: {
    badge: 'Precios simples y transparentes',
    title: 'Elige tu plan',
    subtitle: 'Sin costos ocultos, cancela cuando quieras',
    plans: [
      {
        name: 'Starter',
        price: 29,
        currency: '$',
        period: 'mes',
        description: 'Perfecto para empezar',
        features: [
          '1,000 mensajes/mes',
          '1 número de WhatsApp',
          'Respuestas automáticas básicas',
          'Panel de analytics',
          'Soporte por email'
        ],
        cta: 'Reserva tu lugar',
        popular: false
      },
      {
        name: 'Professional',
        price: 79,
        currency: '$',
        period: 'mes',
        description: 'Para negocios en crecimiento',
        features: [
          '10,000 mensajes/mes',
          '3 números de WhatsApp',
          'IA conversacional avanzada',
          'Integraciones con CRM',
          'API webhooks',
          'Soporte prioritario 24/7'
        ],
        cta: 'Acceso Anticipado',
        popular: true
      }
    ]
  },

  testimonials: {
    title: 'Empresas que confían en nosotros',
    subtitle: 'Miles de negocios ya transformaron su comunicación',
    items: [
      {
        name: 'María González',
        company: 'TechStore México',
        role: 'CEO',
        content: 'Increíble plataforma. Aumentamos nuestras ventas un 40% automatizando la atención al cliente.',
        rating: 5
      },
      {
        name: 'Carlos Rodríguez',
        company: 'Fashion Boutique',
        role: 'Director de Marketing',
        content: 'La mejor inversión para nuestro negocio. Configuración simple y resultados inmediatos.',
        rating: 5
      },
      {
        name: 'Ana Martínez',
        company: 'Delivery Express',
        role: 'COO',
        content: 'Redujo nuestros tiempos de respuesta de horas a segundos. Clientes más felices que nunca.',
        rating: 5
      }
    ]
  },

  faq: {
    title: 'Preguntas frecuentes',
    subtitle: 'Todo lo que necesitas saber',
    items: [
      {
        question: '¿Necesito conocimientos técnicos para usarlo?',
        answer: 'No, nuestra plataforma está diseñada para ser intuitiva y fácil de usar. Ofrecemos tutoriales paso a paso y soporte 24/7 para ayudarte en cada etapa.'
      },
      {
        question: '¿Puedo usar mi número de WhatsApp actual?',
        answer: 'Sí, puedes migrar tu número de WhatsApp Business existente o configurar uno nuevo. Te guiamos en todo el proceso de verificación con Meta.'
      },
      {
        question: '¿Qué incluye el periodo de prueba?',
        answer: 'Acceso completo a todas las funciones del plan Professional durante 14 días, sin necesidad de tarjeta de crédito. Incluye 1,000 mensajes gratis.'
      },
      {
        question: '¿Cómo funciona la facturación?',
        answer: 'Facturación mensual o anual (con 20% de descuento). Los mensajes adicionales se cobran a $0.05 por mensaje después de tu límite mensual.'
      },
      {
        question: '¿Puedo cancelar en cualquier momento?',
        answer: 'Sí, sin compromisos ni penalizaciones. Tu servicio continuará hasta el final del periodo pagado y no se renovará automáticamente.'
      },
      {
        question: '¿Ofrecen integración con mi CRM actual?',
        answer: 'Sí, tenemos integraciones nativas con Salesforce, HubSpot, Pipedrive y más. También ofrecemos API REST para integraciones personalizadas.'
      }
    ]
  },

  ctaSection: {
    badge: 'Oferta por Tiempo Limitado',
    title: '¿Listo para Transformar tu',
    titleHighlight: 'Experiencia de Cliente?',
    description: 'Únete a miles de empresas que han revolucionado su comunicación con clientes usando nuestra plataforma de WhatsApp Cloud API. Inicia tu prueba gratuita hoy y ve resultados en 24 horas.',
    benefits: [
      { text: 'Configuración en menos de 5 minutos' },
      { text: '99.9% de tasa de entrega de mensajes' },
      { text: 'Soporte para usuarios ilimitados' },
      { text: 'Automatización con IA incluida' }
    ],
    urgency: {
      title: 'Precio de Lanzamiento Especial',
      description: '50% de descuento en tus primeros 3 meses - Ahorra hasta $450 cuando inicies tu prueba antes de fin de mes.'
    },
    socialProof: [
      { text: 'Certificado SOC 2' },
      { text: 'Listo para GDPR' },
      { text: '99.9% Uptime' }
    ],
    form: {
      title: 'Inicia Tu Prueba Gratis',
      description: 'Sin tarjeta de crédito requerida. Acceso completo por 14 días.'
    },
    floatingBadges: {
      discount: '50% DESC',
      trust: 'Confiado por 10,000+ empresas'
    },
    stats: [
      { number: '10M+', label: 'Mensajes Enviados' },
      { number: '99.9%', label: 'SLA de Uptime' },
      { number: '<1s', label: 'Respuesta Promedio' },
      { number: '24/7', label: 'Soporte Experto' }
    ],
    alternativeCta: {
      text: '¿Prefieres hablar con alguien primero?',
      button: 'Habla con los Fundadores'
    }
  },

  finalCta: {
    title: '¿Listo para transformar tu comunicación?',
    subtitle: 'Únete a miles de empresas que ya confían en nosotros',
    description: 'Configura tu WhatsApp Business en minutos y empieza a automatizar hoy mismo.',
    buttons: {
      primary: 'Únete al Acceso Anticipado',
      secondary: 'Ver Roadmap'
    },
    guarantee: '14 días de prueba gratis • Sin tarjeta de crédito • Cancela cuando quieras'
  },

  footer: {
    copyright: '© 2025 WhatsApp Cloud. Todos los derechos reservados.',
    links: {
      privacy: 'Privacidad',
      terms: 'Términos',
      contact: 'Contacto'
    }
  }
} as const;

export type MarketingCopy = typeof MARKETING_COPY;