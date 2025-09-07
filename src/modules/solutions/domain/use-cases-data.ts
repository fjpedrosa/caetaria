import { SolutionByUseCase } from './types';

export const useCaseSolutions: SolutionByUseCase[] = [
  {
    id: 'captacion-ventas',
    slug: 'captacion-ventas',
    name: 'Captación y Ventas',
    category: 'sales-capture',
    description: 'Convierte más leads y automatiza tu proceso de ventas con WhatsApp',
    icon: '🎯',
    process: [
      {
        step: 1,
        title: 'Captura leads 24/7',
        description: 'Chatbot inteligente que cualifica prospectos automáticamente',
        automated: true,
        time: '30 segundos'
      },
      {
        step: 2,
        title: 'Calificación automática',
        description: 'Sistema de scoring que identifica leads calientes',
        automated: true,
        time: '1 minuto'
      },
      {
        step: 3,
        title: 'Nurturing personalizado',
        description: 'Secuencias de mensajes según el interés del lead',
        automated: true,
        time: 'Automático'
      },
      {
        step: 4,
        title: 'Cierre de venta',
        description: 'Transferencia a vendedor o cierre automático',
        automated: false,
        time: 'Variable'
      }
    ],
    industrialVariations: [
      {
        industryId: 'comercio',
        industryName: 'Comercio',
        specificUse: 'Recuperación de carritos abandonados',
        example: 'Mensaje automático con descuento del 10% para completar compra'
      },
      {
        industryId: 'salud',
        industryName: 'Salud',
        specificUse: 'Captación de pacientes nuevos',
        example: 'Bot que agenda primera consulta gratuita'
      },
      {
        industryId: 'educacion',
        industryName: 'Educación',
        specificUse: 'Matriculación de estudiantes',
        example: 'Proceso completo de inscripción por WhatsApp'
      },
      {
        industryId: 'servicios-profesionales',
        industryName: 'Servicios',
        specificUse: 'Generación de presupuestos',
        example: 'Cotización automática según tipo de servicio'
      }
    ],
    features: [
      {
        id: 'f-1',
        name: 'Lead Scoring Automático',
        description: 'Algoritmo que puntúa leads según comportamiento',
        icon: '📊'
      },
      {
        id: 'f-2',
        name: 'CRM Integration',
        description: 'Sincronización directa con tu CRM favorito',
        icon: '🔄'
      },
      {
        id: 'f-3',
        name: 'Chatbot con IA',
        description: 'Respuestas inteligentes que convierten',
        icon: '🤖'
      },
      {
        id: 'f-4',
        name: 'Analytics en tiempo real',
        description: 'Métricas de conversión y ROI instantáneas',
        icon: '📈'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'HubSpot', logo: '/logos/hubspot.svg', category: 'crm' },
      { id: 'i-2', name: 'Salesforce', logo: '/logos/salesforce.svg', category: 'crm' },
      { id: 'i-3', name: 'Pipedrive', logo: '/logos/pipedrive.svg', category: 'crm' },
      { id: 'i-4', name: 'ActiveCampaign', logo: '/logos/activecampaign.svg', category: 'marketing' }
    ],
    expectedResults: [
      {
        metric: 'Tasa de conversión',
        improvement: '+40%',
        timeframe: 'En 30 días'
      },
      {
        metric: 'Costo por lead',
        improvement: '-60%',
        timeframe: 'Inmediato'
      },
      {
        metric: 'Velocidad de respuesta',
        improvement: '100% instantáneo',
        timeframe: 'Desde día 1'
      }
    ],
    resources: [
      {
        id: 'r-1',
        type: 'template',
        title: 'Scripts de ventas para WhatsApp',
        description: '10 plantillas probadas que convierten',
        downloadable: true
      },
      {
        id: 'r-2',
        type: 'guide',
        title: 'Guía de Lead Scoring',
        description: 'Cómo configurar tu sistema de puntuación',
        downloadable: true
      },
      {
        id: 'r-3',
        type: 'webinar',
        title: 'Masterclass: Ventas por WhatsApp',
        description: 'Sesión de 45 minutos con casos reales',
        url: '/webinar/ventas-whatsapp'
      }
    ]
  },
  {
    id: 'atencion-cliente',
    slug: 'atencion-cliente',
    name: 'Atención al Cliente',
    category: 'customer-service',
    description: 'Ofrece soporte excepcional 24/7 y reduce costos de atención',
    icon: '💬',
    process: [
      {
        step: 1,
        title: 'Recepción automática',
        description: 'Bot saluda y categoriza la consulta',
        automated: true,
        time: 'Instantáneo'
      },
      {
        step: 2,
        title: 'Resolución con IA',
        description: 'Respuestas automáticas para consultas frecuentes',
        automated: true,
        time: '10 segundos'
      },
      {
        step: 3,
        title: 'Escalado inteligente',
        description: 'Transferencia a agente humano si es necesario',
        automated: true,
        time: '30 segundos'
      },
      {
        step: 4,
        title: 'Seguimiento proactivo',
        description: 'Verificación de satisfacción post-atención',
        automated: true,
        time: '24 horas después'
      }
    ],
    industrialVariations: [
      {
        industryId: 'comercio',
        industryName: 'Comercio',
        specificUse: 'Consultas sobre pedidos y devoluciones',
        example: 'Estado del envío, política de devolución, disponibilidad'
      },
      {
        industryId: 'salud',
        industryName: 'Salud',
        specificUse: 'Consultas médicas y resultados',
        example: 'Horarios, resultados de exámenes, preparación para estudios'
      },
      {
        industryId: 'hosteleria',
        industryName: 'Hostelería',
        specificUse: 'Reservas y consultas del menú',
        example: 'Disponibilidad, restricciones alimentarias, eventos'
      },
      {
        industryId: 'educacion',
        industryName: 'Educación',
        specificUse: 'Soporte académico y administrativo',
        example: 'Horarios, calificaciones, requisitos, pagos'
      }
    ],
    features: [
      {
        id: 'f-1',
        name: 'FAQs Inteligentes',
        description: 'Base de conocimiento con aprendizaje automático',
        icon: '🧠'
      },
      {
        id: 'f-2',
        name: 'Multiagente',
        description: 'Gestión de múltiples conversaciones simultáneas',
        icon: '👥'
      },
      {
        id: 'f-3',
        name: 'Tickets Automáticos',
        description: 'Creación y seguimiento de tickets integrado',
        icon: '🎫'
      },
      {
        id: 'f-4',
        name: 'Análisis de Sentimiento',
        description: 'Detecta clientes insatisfechos automáticamente',
        icon: '😊'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Zendesk', logo: '/logos/zendesk.svg', category: 'support' },
      { id: 'i-2', name: 'Intercom', logo: '/logos/intercom.svg', category: 'support' },
      { id: 'i-3', name: 'Freshdesk', logo: '/logos/freshdesk.svg', category: 'support' },
      { id: 'i-4', name: 'Help Scout', logo: '/logos/helpscout.svg', category: 'support' }
    ],
    expectedResults: [
      {
        metric: 'Tickets resueltos automáticamente',
        improvement: '60%',
        timeframe: 'Primer mes'
      },
      {
        metric: 'Tiempo de respuesta',
        improvement: '-95%',
        timeframe: 'Inmediato'
      },
      {
        metric: 'Satisfacción del cliente',
        improvement: '+35%',
        timeframe: 'En 60 días'
      }
    ],
    resources: [
      {
        id: 'r-1',
        type: 'template',
        title: 'Biblioteca de respuestas predefinidas',
        description: '100+ respuestas para casos comunes',
        downloadable: true
      },
      {
        id: 'r-2',
        type: 'guide',
        title: 'Manual de escalado de tickets',
        description: 'Cuándo y cómo transferir a agente humano',
        downloadable: true
      }
    ]
  },
  {
    id: 'operaciones-gestion',
    slug: 'operaciones-gestion',
    name: 'Operaciones y Gestión',
    category: 'operations',
    description: 'Automatiza procesos operativos y ahorra tiempo valioso',
    icon: '⚙️',
    process: [
      {
        step: 1,
        title: 'Automatización de tareas',
        description: 'Configura flujos para procesos repetitivos',
        automated: true,
        time: 'Una vez configurado'
      },
      {
        step: 2,
        title: 'Notificaciones inteligentes',
        description: 'Alertas automáticas en momentos clave',
        automated: true,
        time: 'Tiempo real'
      },
      {
        step: 3,
        title: 'Coordinación de equipos',
        description: 'Asignación automática de tareas y recursos',
        automated: true,
        time: 'Instantáneo'
      },
      {
        step: 4,
        title: 'Reportes automáticos',
        description: 'Informes de rendimiento y KPIs',
        automated: true,
        time: 'Diario/Semanal'
      }
    ],
    industrialVariations: [
      {
        industryId: 'comercio',
        industryName: 'Comercio',
        specificUse: 'Gestión de inventario y pedidos',
        example: 'Alertas de stock bajo, confirmación de pedidos'
      },
      {
        industryId: 'salud',
        industryName: 'Salud',
        specificUse: 'Gestión de citas y recordatorios',
        example: 'Confirmación de citas, recordatorios de medicación'
      },
      {
        industryId: 'hosteleria',
        industryName: 'Hostelería',
        specificUse: 'Gestión de reservas y mesas',
        example: 'Sistema de reservas, lista de espera automática'
      },
      {
        industryId: 'servicios-profesionales',
        industryName: 'Servicios',
        specificUse: 'Programación de servicios',
        example: 'Agenda de visitas, rutas optimizadas'
      }
    ],
    features: [
      {
        id: 'f-1',
        name: 'Workflows Personalizados',
        description: 'Constructor visual de flujos de trabajo',
        icon: '🔄'
      },
      {
        id: 'f-2',
        name: 'Calendario Integrado',
        description: 'Sincronización con Google Calendar y Outlook',
        icon: '📅'
      },
      {
        id: 'f-3',
        name: 'Alertas Configurables',
        description: 'Notificaciones basadas en reglas de negocio',
        icon: '🔔'
      },
      {
        id: 'f-4',
        name: 'Dashboard Operativo',
        description: 'Vista en tiempo real de todas las operaciones',
        icon: '📊'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Google Calendar', logo: '/logos/google-calendar.svg', category: 'calendar' },
      { id: 'i-2', name: 'Calendly', logo: '/logos/calendly.svg', category: 'scheduling' },
      { id: 'i-3', name: 'Slack', logo: '/logos/slack.svg', category: 'communication' },
      { id: 'i-4', name: 'Trello', logo: '/logos/trello.svg', category: 'project' }
    ],
    expectedResults: [
      {
        metric: 'Tiempo en tareas manuales',
        improvement: '-70%',
        timeframe: 'Primera semana'
      },
      {
        metric: 'Errores operativos',
        improvement: '-85%',
        timeframe: 'Primer mes'
      },
      {
        metric: 'Productividad del equipo',
        improvement: '+45%',
        timeframe: 'En 30 días'
      }
    ],
    resources: [
      {
        id: 'r-1',
        type: 'template',
        title: 'Plantillas de workflows',
        description: '20+ flujos pre-configurados por industria',
        downloadable: true
      },
      {
        id: 'r-2',
        type: 'case-study',
        title: 'Caso: Automatización en restaurante',
        description: 'Cómo un restaurante automatizó el 80% de sus procesos',
        url: '/casos/restaurante-automatizado'
      }
    ]
  },
  {
    id: 'fidelizacion-engagement',
    slug: 'fidelizacion-engagement',
    name: 'Fidelización y Engagement',
    category: 'engagement',
    description: 'Mantén a tus clientes comprometidos y que vuelvan por más',
    icon: '❤️',
    process: [
      {
        step: 1,
        title: 'Segmentación inteligente',
        description: 'Agrupa clientes por comportamiento e intereses',
        automated: true,
        time: 'Automático'
      },
      {
        step: 2,
        title: 'Campañas personalizadas',
        description: 'Mensajes relevantes para cada segmento',
        automated: true,
        time: 'Programado'
      },
      {
        step: 3,
        title: 'Programa de lealtad',
        description: 'Puntos, recompensas y beneficios exclusivos',
        automated: true,
        time: 'Continuo'
      },
      {
        step: 4,
        title: 'Feedback y mejora',
        description: 'Encuestas y análisis de satisfacción',
        automated: true,
        time: 'Post-interacción'
      }
    ],
    industrialVariations: [
      {
        industryId: 'comercio',
        industryName: 'Comercio',
        specificUse: 'Programa de puntos y ofertas exclusivas',
        example: 'Acumula puntos con cada compra, ofertas VIP'
      },
      {
        industryId: 'salud',
        industryName: 'Salud',
        specificUse: 'Seguimiento de tratamientos',
        example: 'Recordatorios de citas de control, tips de salud'
      },
      {
        industryId: 'hosteleria',
        industryName: 'Hostelería',
        specificUse: 'Club de clientes frecuentes',
        example: 'Descuentos para clientes habituales, eventos exclusivos'
      },
      {
        industryId: 'educacion',
        industryName: 'Educación',
        specificUse: 'Engagement con estudiantes y padres',
        example: 'Actualizaciones de progreso, eventos escolares'
      }
    ],
    features: [
      {
        id: 'f-1',
        name: 'Segmentación Avanzada',
        description: 'Machine learning para grupos precisos',
        icon: '🎯'
      },
      {
        id: 'f-2',
        name: 'Campañas Automatizadas',
        description: 'Secuencias de mensajes programadas',
        icon: '📧'
      },
      {
        id: 'f-3',
        name: 'Programa de Puntos',
        description: 'Sistema de recompensas configurable',
        icon: '🏆'
      },
      {
        id: 'f-4',
        name: 'NPS y Encuestas',
        description: 'Medición continua de satisfacción',
        icon: '📊'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Mailchimp', logo: '/logos/mailchimp.svg', category: 'marketing' },
      { id: 'i-2', name: 'Klaviyo', logo: '/logos/klaviyo.svg', category: 'marketing' },
      { id: 'i-3', name: 'LoyaltyLion', logo: '/logos/loyaltylion.svg', category: 'loyalty' },
      { id: 'i-4', name: 'SurveyMonkey', logo: '/logos/surveymonkey.svg', category: 'survey' }
    ],
    expectedResults: [
      {
        metric: 'Tasa de retención',
        improvement: '+45%',
        timeframe: 'En 90 días'
      },
      {
        metric: 'Valor de vida del cliente',
        improvement: '+65%',
        timeframe: 'En 6 meses'
      },
      {
        metric: 'Referencias de clientes',
        improvement: '+30%',
        timeframe: 'En 60 días'
      }
    ],
    resources: [
      {
        id: 'r-1',
        type: 'guide',
        title: 'Guía de fidelización por WhatsApp',
        description: 'Estrategias probadas para retener clientes',
        downloadable: true
      },
      {
        id: 'r-2',
        type: 'template',
        title: 'Calendario de campañas',
        description: 'Planificación anual de comunicaciones',
        downloadable: true
      },
      {
        id: 'r-3',
        type: 'webinar',
        title: 'Webinar: Casos de éxito en fidelización',
        description: 'Empresas que triplicaron su retención',
        url: '/webinar/fidelizacion'
      }
    ]
  }
];