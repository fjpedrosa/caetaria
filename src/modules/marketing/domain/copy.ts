/**
 * Marketing Copy Constants
 * Centralized text content for all marketing components
 */

export const MARKETING_COPY = {
  hero: {
    badge: 'Tu negocio digital en 15 minutos',
    title: 'WhatsApp es ahora tu',
    subtitle: 'aplicación de negocio completa',
    description: 'Reservas, pedidos, pagos y atención 24/7. La digitalización que tu negocio necesita, donde tus clientes ya están.',
    cta: {
      primary: 'Digitaliza tu negocio gratis',
      secondary: 'Ver demostración 3 min'
    },
    metrics: {
      messages: '1M+ transacciones/mes',
      businesses: '5K+ negocios digitalizados',
      uptime: '99.9% disponibilidad'
    }
  },

  valueProps: {
    title: 'Tu negocio completo funcionando en WhatsApp',
    cards: [
      {
        title: 'Sistema de reservas y citas',
        description: 'Tus clientes reservan mesas, agendan citas o solicitan turnos directamente por WhatsApp. Sin apps adicionales.',
        icon: 'Calendar'
      },
      {
        title: 'Gestión de pedidos y pagos',
        description: 'Catálogo digital, carrito de compras y pagos seguros. Tu tienda completa donde tus clientes ya están.',
        icon: 'ShoppingCart'
      },
      {
        title: 'Operación automatizada 24/7',
        description: 'Respuestas instantáneas, confirmaciones automáticas y seguimiento de clientes. Tu negocio nunca cierra.',
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
        cta: 'Digitalízate Ahora',
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
        cta: 'Transformación Completa',
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
        content: 'Reducimos los no-shows en 30% con confirmaciones automáticas. Nuestros pacientes aman agendar por WhatsApp.',
        rating: 5
      },
      {
        name: 'María Fernández',
        company: 'Restaurante La Terraza',
        role: 'Propietaria',
        content: '40% más reservas desde que implementamos el sistema. Ya no perdemos clientes por teléfono ocupado.',
        rating: 5
      },
      {
        name: 'Juan Carlos López',
        company: 'Ferretería El Constructor',
        role: 'Gerente',
        content: 'Nuestros clientes consultan stock y hacen pedidos 24/7. Duplicamos las ventas fuera de horario.',
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
    description: 'Digitaliza cada aspecto de tu negocio tradicional donde tus clientes ya están.',
    items: [
      {
        title: 'Gestión de Reservas y Citas',
        description: 'Sistema profesional de reservas y agenda. Perfecto para restaurantes, clínicas, salones de belleza.',
        icon: 'calendar',
        badge: 'Más Popular',
        benefits: [
          'Confirmaciones automáticas',
          'Recordatorios inteligentes',
          'Gestión de cancelaciones'
        ]
      },
      {
        title: 'Tienda y Catálogo Digital',
        description: 'Tu negocio completo en WhatsApp. Ideal para comercios, ferreterías, panaderías.',
        icon: 'store',
        benefits: [
          'Catálogo con fotos y precios',
          'Carrito de compras integrado',
          'Gestión de inventario en tiempo real'
        ]
      },
      {
        title: 'Atención al Cliente con IA',
        description: 'Respuestas instantáneas y personalizadas. Tu negocio atiende 24/7 sin descanso.',
        icon: 'automation',
        benefits: [
          'Responde consultas frecuentes',
          'Procesa pedidos automáticamente',
          'Escala a humano cuando necesario'
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
      title: 'Precio Especial de Lanzamiento',
      description: '50% de descuento para negocios tradicionales que se digitalicen este mes. Ahorra hasta $450 en tu transformación digital.'
    },
    socialProof: [
      { text: 'Sin apps que descargar' },
      { text: 'Funciona en cualquier teléfono' },
      { text: 'Implementación en 24 horas' }
    ],
    form: {
      title: 'Digitaliza Tu Negocio Gratis',
      description: 'Sin tarjeta de crédito. 14 días de prueba completa.'
    },
    floatingBadges: {
      discount: '50% DESC',
      trust: '5,000+ negocios digitalizados'
    },
    stats: [
      { number: '1M+', label: 'Transacciones/Mes' },
      { number: '99.9%', label: 'Disponibilidad' },
      { number: '15min', label: 'Setup Completo' },
      { number: '24/7', label: 'Tu Negocio Abierto' }
    ],
    alternativeCta: {
      text: '¿Necesitas ayuda para digitalizar tu negocio?',
      button: 'Habla con un Experto'
    }
  },

  finalCta: {
    title: '¿Listo para digitalizar tu negocio?',
    subtitle: 'Únete a miles de negocios tradicionales ya digitalizados',
    description: 'Transforma tu negocio en una operación digital completa. Reservas, pedidos, pagos y más, todo desde WhatsApp.',
    buttons: {
      primary: 'Digitaliza Tu Negocio Ahora',
      secondary: 'Habla con un Experto'
    },
    guarantee: '14 días de prueba gratis • Sin tarjeta de crédito • Implementación en 24 horas'
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