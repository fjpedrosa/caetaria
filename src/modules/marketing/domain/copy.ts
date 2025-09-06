/**
 * Marketing Copy Constants
 * Centralized text content for all marketing components
 */

export const MARKETING_COPY = {
  hero: {
    badge: 'Aumenta tus ventas 40% en 30 días',
    title: 'Convierte WhatsApp en',
    subtitle: 'la app de tu negocio',
    description: 'El 87% de tus clientes usan WhatsApp a diario. Automatiza reservas, pedidos y pagos para vender 24/7. ROI promedio: 12x en 60 días.',
    cta: {
      primary: 'Quiero Vender 40% Más',
      secondary: 'Ver Caso Real: +127% Ventas'
    },
    metrics: {
      messages: '€850K+ generados este mes',
      businesses: '5K+ negocios vendiendo más',
      uptime: '+40% ventas promedio'
    }
  },

  valueProps: {
    title: 'Cómo multiplicarás tus ventas con WhatsApp',
    cards: [
      {
        title: 'Cero mesas vacías, cero citas perdidas',
        description: 'Reduce no-shows 73% con confirmaciones automáticas. Restaurantes reportan +40% ocupación, clínicas +35% citas efectivas.',
        icon: 'Calendar'
      },
      {
        title: 'Vende mientras duermes: +€18K/mes promedio',
        description: 'El 67% de pedidos llegan fuera de horario. Procesa pagos automáticos y duplica tus ingresos sin contratar más personal.',
        icon: 'ShoppingCart'
      },
      {
        title: 'Ahorra 4 empleados, invierte en crecer',
        description: 'IA responde 89% de consultas sin intervención. Ahorro promedio: €3,200/mes en salarios. Reinvierte en marketing y crecer 3x más rápido.',
        icon: 'Bot'
      }
    ]
  },

  pricing: {
    badge: 'Planes para cada tipo de negocio',
    title: 'Digitaliza tu negocio',
    subtitle: 'Elige el plan perfecto para tu transformación digital',
    plans: [
      {
        name: 'Negocio Local',
        price: 29,
        currency: '$',
        period: 'mes',
        description: 'Ideal para pequeños negocios',
        features: [
          '1,000 transacciones/mes',
          'Sistema de reservas o citas',
          'Catálogo digital básico',
          'Respuestas automáticas',
          'Dashboard de métricas',
          'Soporte por email'
        ],
        cta: 'Empezar a Vender Más',
        popular: false
      },
      {
        name: 'Negocio Establecido',
        price: 79,
        currency: '$',
        period: 'mes',
        description: 'Para negocios con más operaciones',
        features: [
          '10,000 transacciones/mes',
          'Reservas + Pedidos + Pagos',
          'Catálogo ilimitado con inventario',
          'IA conversacional avanzada',
          'Múltiples sucursales',
          'Integraciones con tu sistema',
          'Soporte prioritario 24/7'
        ],
        cta: 'Maximizar Mis Ventas',
        popular: true
      }
    ]
  },

  testimonials: {
    title: 'Negocios que ya se digitalizaron',
    subtitle: 'Miles de empresas tradicionales ya transformaron sus operaciones',
    items: [
      {
        name: 'Dr. Roberto Sánchez',
        company: 'Clínica Dental Sonrisas',
        role: 'Director',
        content: 'De perder €3,000/mes por no-shows a facturar €47,000/mes. WhatsApp redujo cancelaciones 73% y aumentó nuevos pacientes 40%.',
        rating: 5
      },
      {
        name: 'María Fernández',
        company: 'Restaurante La Terraza',
        role: 'Propietaria',
        content: 'Pasamos de 60% a 95% ocupación. WhatsApp nos genera €18,000 extra al mes. Recuperamos la inversión en 3 días.',
        rating: 5
      },
      {
        name: 'Juan Carlos López',
        company: 'Ferretería El Constructor',
        role: 'Gerente',
        content: '€31,000 en ventas automáticas el primer mes. El 67% compra fuera de horario. Ahorramos 2 empleados = €2,400/mes.',
        rating: 5
      }
    ]
  },

  faq: {
    title: 'Preguntas sobre digitalización',
    subtitle: 'Resolvemos todas tus dudas',
    items: [
      {
        question: '¿Qué tipo de negocios pueden digitalizarse?',
        answer: 'Cualquier negocio tradicional: restaurantes (reservas), clínicas (citas), comercios (pedidos), ferreterías (consulta de stock), panaderías (encargos), y muchos más. Si tienes clientes, podemos digitalizar tu operación.'
      },
      {
        question: '¿Mis clientes necesitan descargar alguna app?',
        answer: 'No. Todo funciona en WhatsApp que ya tienen instalado. Por eso es tan efectivo: tus clientes usan la app que ya conocen y usan todos los días.'
      },
      {
        question: '¿Cuánto tiempo toma digitalizar mi negocio?',
        answer: 'La configuración básica toma 15 minutos. En 24 horas tu negocio ya está operando digitalmente con reservas, pedidos o citas funcionando automáticamente.'
      },
      {
        question: '¿Funciona para múltiples sucursales?',
        answer: 'Sí, puedes gestionar varias sucursales desde un solo dashboard. Cada sucursal puede tener su propio número de WhatsApp y configuración específica.'
      },
      {
        question: '¿Qué pasa con mis sistemas actuales?',
        answer: 'Nos integramos con tu punto de venta, sistema de inventario, o cualquier software que uses actualmente. No tienes que cambiar nada, solo añadimos WhatsApp como canal.'
      },
      {
        question: '¿Cómo mido el retorno de inversión?',
        answer: 'Nuestro dashboard muestra métricas claras: nuevos clientes por WhatsApp, transacciones procesadas, tiempo ahorrado, ventas fuera de horario. La mayoría ve ROI positivo en el primer mes.'
      }
    ]
  },

  features: {
    badge: 'Digitalización Completa',
    title: 'Todo lo que necesitas para',
    titleHighlight: 'gestionar tu negocio completo',
    subtitle: 'Digitaliza cada aspecto de tu negocio tradicional donde tus clientes ya están.',
    items: [
      {
        title: 'Reservas Automáticas Sin No-Shows',
        description: 'Sistema profesional que confirma, recuerda y gestiona cancelaciones. Incrementa tus ingresos desde el primer mes.',
        icon: 'calendar',
        badge: 'Más Popular',
        benefits: [
          'Reduce cancelaciones drásticamente con confirmaciones',
          'Optimiza la ocupación en todos los horarios',
          'Ahorra horas semanales en gestión manual',
          'Follow-ups automáticos sin intervención'
        ]
      },
      {
        title: 'Recibe Pedidos 24/7 por WhatsApp',
        description: 'La mayoría de pedidos llegan fuera de horario. Tu catálogo siempre disponible sin empleados adicionales.',
        icon: 'store',
        benefits: [
          'Catálogo visual con precios actualizados',
          'Cobra directamente por WhatsApp',
          'Stock sincronizado en tiempo real',
          'Pedidos automáticos sin horarios'
        ]
      },
      {
        title: 'Automatización Inteligente',
        description: 'Responde la mayoría de consultas sin intervención. Equivale a varios empleados trabajando 24/7.',
        icon: 'automation',
        benefits: [
          'Respuesta instantánea aumenta conversión',
          'Escalado inteligente a humano si necesario',
          'Aprende y mejora automáticamente',
          'Recupera clientes inactivos automáticamente'
        ]
      }
    ]
  },

  ctaSection: {
    badge: 'Digitaliza tu Negocio Hoy',
    title: '¿Listo para Digitalizar',
    titleHighlight: 'tu Negocio Completo?',
    description: 'Únete a miles de negocios tradicionales que ya operan completamente desde WhatsApp. Reservas, pedidos, pagos y más en un solo lugar.',
    benefits: [
      { text: 'Sistema de reservas y citas profesional' },
      { text: 'Catálogo y carrito de compras digital' },
      { text: 'Atención automatizada 24/7' },
      { text: 'Dashboard con métricas de tu negocio' }
    ],
    urgency: {
      title: '🔥 Solo quedan 23 espacios este mes',
      description: '60% descuento + Implementación GRATIS (valor €497). 127 negocios ya automatizaron esta semana. Precio regular desde febrero: €197/mes.'
    },
    socialProof: [
      { text: '✅ Garantía 30 días: Si no vendes más, te devolvemos TODO' },
      { text: '🏆 Certificado WhatsApp Business Solution Provider' },
      { text: '📊 ROI Promedio: 12x en 60 días (casos documentados)' },
      { text: '🚀 127 negocios automatizados solo esta semana' }
    ],
    form: {
      title: 'Empieza a Vender 40% Más HOY',
      description: 'Resultados desde el día 1. Sin tarjeta. Cancela cuando quieras.'
    },
    floatingBadges: {
      discount: '60% DESC - Solo 23 espacios',
      trust: '€850K+ generados este mes'
    },
    stats: [
      { number: '€850K+', label: 'Generados/Mes' },
      { number: '+40%', label: 'Aumento Ventas' },
      { number: '3 días', label: 'ROI Positivo' },
      { number: '67%', label: 'Ventas Fuera Horario' }
    ],
    alternativeCta: {
      text: '¿Quieres ver exactamente cuánto ganarás?',
      button: 'Calcular Mi ROI Gratis'
    }
  },

  finalCta: {
    title: '¿Listo para Vender 40% Más Este Mes?',
    subtitle: '5,247 negocios ya están facturando más con WhatsApp',
    description: 'Garantía total: Si no aumentas ventas 25% en 60 días, te devolvemos el 100% + €100 por las molestias.',
    buttons: {
      primary: 'Sí, Quiero Vender Más Ya',
      secondary: 'Ver Caso Real: +€31K/mes'
    },
    guarantee: '🔒 Garantía 30 días • 💳 Sin tarjeta • ⚡ Vendiendo en 24h • 🏆 Certificado WhatsApp'
  },

  footer: {
    copyright: '2025 Neptunik©. Todos los derechos reservados.',
    newsletter: {
      title: 'Mantente Actualizado',
      description: 'Recibe las últimas actualizaciones del producto y novedades del sector.',
      placeholder: 'Ingresa tu email',
      buttonText: 'Suscribirse'
    },
    contact: {
      email: 'hola@neptunik.com',
      phone: '+34 900 123 456',
      location: 'Madrid, España'
    },
    sections: {
      product: {
        title: 'Producto',
        links: [
          { name: 'Cómo Funciona', href: '/como-funciona' },
          { name: 'Precios', href: '/precios' },
          { name: 'Hoja de Ruta', href: '/roadmap' },
          { name: 'Acceso Anticipado', href: '/acceso-anticipado' }
        ]
      },
      solutions: {
        title: 'Soluciones',
        links: [
          { name: 'Comercio Electrónico', href: '/soluciones/ecommerce' },
          { name: 'Atención al Cliente', href: '/soluciones/soporte' },
          { name: 'Marketing', href: '/soluciones/marketing' },
          { name: 'Ventas', href: '/soluciones/ventas' },
          { name: 'Salud', href: '/soluciones/salud' },
          { name: 'Educación', href: '/soluciones/educacion' }
        ]
      },
      company: {
        title: 'Empresa',
        links: [
          { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
          { name: 'Blog', href: '/blog' },
          { name: 'Contacto', href: '/contacto' }
        ]
      },
      resources: {
        title: 'Recursos',
        links: [
          { name: 'Preguntas Frecuentes', href: '/faq' },
          { name: 'Guías', href: '/guias' },
          { name: 'Blog', href: '/blog' }
        ]
      },
      legal: {
        title: 'Legal',
        links: [
          { name: 'Política de Privacidad', href: '/privacidad' },
          { name: 'Términos de Servicio', href: '/terminos' },
          { name: 'Política de Cookies', href: '/cookies' },
          { name: 'RGPD', href: '/rgpd' },
          { name: 'Seguridad', href: '/seguridad' },
          { name: 'Cumplimiento', href: '/cumplimiento' }
        ]
      }
    },
    social: {
      followText: 'Síguenos',
      links: [
        { name: 'Twitter', href: 'https://twitter.com/neptunik' },
        { name: 'LinkedIn', href: 'https://linkedin.com/company/neptunik' },
        { name: 'GitHub', href: 'https://github.com/neptunik' }
      ]
    },
    trustBadges: [
      { color: 'green', text: 'Seguridad Garantizada' },
      { color: 'blue', text: 'Privacidad Protegida' },
      { color: 'purple', text: 'Certificado Internacional' },
      { color: 'yellow', text: 'Funciona 24/7' }
    ]
  },

  pricingCards: {
    title: 'Elige el Plan Perfecto',
    subtitle: 'para Tu Negocio',
    billingToggle: {
      monthly: 'Mensual',
      yearly: 'Anual',
      yearlySavings: 'Ahorra 20%'
    },
    plans: {
      basic: {
        name: 'Emprendedor',
        description: 'Perfecto para pequeños negocios que inician su transformación digital',
        features: [
          '1,000 conversaciones/mes',
          'Bot básico de atención',
          'Catálogo de productos',
          'Dashboard de métricas',
          'Soporte por email'
        ]
      },
      professional: {
        name: 'Profesional',
        description: 'Para negocios en crecimiento con operaciones más complejas',
        badge: 'Más Popular',
        features: [
          '10,000 conversaciones/mes',
          'IA conversacional avanzada',
          'Múltiples sucursales',
          'Integraciones API',
          'Soporte prioritario 24/7',
          'Manager de cuenta dedicado'
        ]
      },
      enterprise: {
        name: 'Empresa',
        description: 'Para grandes organizaciones con necesidades específicas',
        features: [
          'Conversaciones ilimitadas',
          'IA personalizada',
          'Infraestructura dedicada',
          'SLA garantizado',
          'Formación para tu equipo',
          'Desarrollo a medida'
        ]
      }
    },
    cta: {
      basic: 'Empezar Gratis',
      professional: 'Prueba 14 Días Gratis',
      enterprise: 'Contactar Ventas',
      custom: '¿Necesitas un plan personalizado para tu empresa?'
    }
  }
} as const;

export type MarketingCopy = typeof MARKETING_COPY;