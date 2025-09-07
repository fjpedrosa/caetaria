import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  MessageCircle,
  Package,
  Phone,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap} from 'lucide-react';

import { Industry } from './types';

// Icon type for TypeScript compatibility
export type IconType = typeof ShoppingCart;

// ITERATION 1: Neptune Blue Primary + WhatsApp Green Secondary
// Using the brand's electric blue with WhatsApp's signature green for trust
export const industriesV1: Industry[] = [
  {
    id: 'comercio',
    slug: 'comercio',
    name: 'Comercio',
    description: 'Soluciones WhatsApp para tiendas online y físicas que buscan vender más y automatizar la atención al cliente.',
    icon: 'ShoppingCart', // Using string reference for icon
    color: 'brand-neptune', // Using Neptune Blue from tailwind config
    heroImage: '/images/solutions/comercio-hero.jpg',
    painPoints: [
      {
        id: 'cp-1',
        title: 'Carritos abandonados sin recuperar',
        description: 'El 70% de los carritos se abandonan y no tienes forma efectiva de recuperarlos',
        cost: '€15,000/mes en ventas perdidas'
      },
      {
        id: 'cp-2',
        title: 'Atención al cliente saturada',
        description: 'Tu equipo responde las mismas preguntas una y otra vez sobre productos y envíos',
        cost: '40 horas/semana en consultas repetitivas'
      },
      {
        id: 'cp-3',
        title: 'Sin comunicación post-venta',
        description: 'Clientes desinformados sobre el estado de sus pedidos generan más consultas',
        cost: '25% más tickets de soporte'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Catálogo de productos en WhatsApp',
        description: 'Muestra tu catálogo completo directamente en el chat',
        icon: 'Package',
        example: 'Cliente ve productos, precios y disponibilidad sin salir de WhatsApp',
        workflow: [
          { step: 1, action: 'Cliente pregunta por productos', automated: false },
          { step: 2, action: 'Bot muestra catálogo interactivo', automated: true },
          { step: 3, action: 'Cliente selecciona productos', automated: false },
          { step: 4, action: 'Se genera orden automáticamente', automated: true }
        ]
      },
      {
        id: 'uc-2',
        title: 'Recuperación de carritos abandonados',
        description: 'Mensajes automáticos para recuperar ventas perdidas',
        icon: 'ShoppingCart',
        example: 'Recupera hasta el 35% de carritos abandonados con mensajes personalizados',
        workflow: [
          { step: 1, action: 'Cliente abandona carrito', automated: false },
          { step: 2, action: 'Espera inteligente de 1 hora', automated: true },
          { step: 3, action: 'Mensaje personalizado con descuento', automated: true },
          { step: 4, action: 'Cliente completa compra', automated: false }
        ]
      },
      {
        id: 'uc-3',
        title: 'Notificaciones de envío',
        description: 'Actualiza a tus clientes sobre el estado de sus pedidos',
        icon: 'Package',
        example: 'Reduce 60% las consultas sobre envíos con actualizaciones automáticas',
        workflow: [
          { step: 1, action: 'Pedido confirmado', automated: true },
          { step: 2, action: 'Notificación de preparación', automated: true },
          { step: 3, action: 'Código de seguimiento enviado', automated: true },
          { step: 4, action: 'Confirmación de entrega', automated: true }
        ]
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Aumento en ventas',
        metric: '+40%',
        description: 'Incremento promedio en conversión'
      },
      {
        id: 'b-2',
        title: 'Reducción de costos',
        metric: '-60%',
        description: 'Menos tiempo en atención repetitiva'
      },
      {
        id: 'b-3',
        title: 'Satisfacción del cliente',
        metric: '4.8/5',
        description: 'Calificación promedio de clientes'
      }
    ],
    metrics: [
      {
        id: 'm-1',
        metric: 'Tasa de conversión',
        before: '2.5%',
        after: '4.2%',
        improvement: '+68%'
      },
      {
        id: 'm-2',
        metric: 'Ticket promedio',
        before: '€45',
        after: '€67',
        improvement: '+49%'
      },
      {
        id: 'm-3',
        metric: 'Tiempo de respuesta',
        before: '2 horas',
        after: '30 segundos',
        improvement: '-99%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        quote: 'Neptunik transformó nuestra tienda online. Ahora vendemos 24/7 sin aumentar personal.',
        author: 'María García',
        role: 'CEO',
        company: 'Fashion Store Madrid',
        rating: 5
      },
      {
        id: 't-2',
        quote: 'Recuperamos el 35% de carritos abandonados. Es dinero que antes perdíamos completamente.',
        author: 'Carlos Rodríguez',
        role: 'Director E-commerce',
        company: 'TechShop España',
        rating: 5
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Shopify', category: 'ecommerce' },
      { id: 'i-2', name: 'WooCommerce', category: 'ecommerce' },
      { id: 'i-3', name: 'PrestaShop', category: 'ecommerce' },
      { id: 'i-4', name: 'Stripe', category: 'payment' },
      { id: 'i-5', name: 'PayPal', category: 'payment' }
    ]
  },
  {
    id: 'salud',
    slug: 'salud',
    name: 'Salud',
    description: 'Gestión eficiente de citas médicas, recordatorios y atención al paciente a través de WhatsApp.',
    icon: 'Heart',
    color: 'brand-neptune',
    heroImage: '/images/solutions/salud-hero.jpg',
    painPoints: [
      {
        id: 'sp-1',
        title: 'Alto índice de citas perdidas',
        description: 'Pacientes olvidan sus citas causando pérdidas y huecos en la agenda',
        cost: '30% de no-shows mensuales'
      },
      {
        id: 'sp-2',
        title: 'Líneas telefónicas saturadas',
        description: 'Recepcionistas ocupadas todo el día agendando y confirmando citas',
        cost: '70% del tiempo en llamadas'
      },
      {
        id: 'sp-3',
        title: 'Comunicación post-consulta deficiente',
        description: 'Pacientes sin seguimiento adecuado de tratamientos',
        cost: '40% abandono de tratamiento'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Agendamiento automático de citas',
        description: 'Pacientes agendan sus citas 24/7 sin llamadas',
        icon: 'Calendar',
        example: 'Sistema inteligente que muestra disponibilidad en tiempo real',
        workflow: [
          { step: 1, action: 'Paciente solicita cita', automated: false },
          { step: 2, action: 'Bot muestra horarios disponibles', automated: true },
          { step: 3, action: 'Paciente selecciona horario', automated: false },
          { step: 4, action: 'Confirmación y recordatorio automático', automated: true }
        ]
      },
      {
        id: 'uc-2',
        title: 'Recordatorios inteligentes',
        description: 'Reduce no-shows con recordatorios personalizados',
        icon: 'Clock',
        example: 'Recordatorios 48h y 2h antes con opción de confirmar o reagendar',
        workflow: [
          { step: 1, action: 'Recordatorio 48h antes', automated: true },
          { step: 2, action: 'Paciente confirma asistencia', automated: false },
          { step: 3, action: 'Recordatorio 2h antes', automated: true },
          { step: 4, action: 'Reagendamiento si es necesario', automated: true }
        ]
      },
      {
        id: 'uc-3',
        title: 'Seguimiento post-consulta',
        description: 'Acompañamiento automático en tratamientos',
        icon: 'MessageCircle',
        example: 'Mensajes de seguimiento y recordatorios de medicación',
        workflow: [
          { step: 1, action: 'Mensaje post-consulta', automated: true },
          { step: 2, action: 'Recordatorios de medicación', automated: true },
          { step: 3, action: 'Check-in de síntomas', automated: true },
          { step: 4, action: 'Alerta a doctor si es necesario', automated: true }
        ]
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Reducción de no-shows',
        metric: '-75%',
        description: 'Menos citas perdidas'
      },
      {
        id: 'b-2',
        title: 'Eficiencia operativa',
        metric: '+60%',
        description: 'Más tiempo para pacientes'
      },
      {
        id: 'b-3',
        title: 'Satisfacción del paciente',
        metric: '4.9/5',
        description: 'Calificación promedio'
      }
    ],
    metrics: [
      {
        id: 'm-1',
        metric: 'Tasa de no-shows',
        before: '30%',
        after: '8%',
        improvement: '-73%'
      },
      {
        id: 'm-2',
        metric: 'Tiempo en recepción',
        before: '6 horas/día',
        after: '2 horas/día',
        improvement: '-67%'
      },
      {
        id: 'm-3',
        metric: 'Adherencia al tratamiento',
        before: '60%',
        after: '85%',
        improvement: '+42%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        quote: 'Redujimos los no-shows del 30% al 8%. Es un cambio radical en nuestra operación.',
        author: 'Dr. Juan Martínez',
        role: 'Director Médico',
        company: 'Clínica Salud Plus',
        rating: 5
      },
      {
        id: 't-2',
        quote: 'Nuestras recepcionistas ahora dedican tiempo a los pacientes, no al teléfono.',
        author: 'Laura Sánchez',
        role: 'Administradora',
        company: 'Centro Médico Barcelona',
        rating: 5
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Google Calendar', category: 'calendar' },
      { id: 'i-2', name: 'Calendly', category: 'scheduling' },
      { id: 'i-3', name: 'Doctoralia', category: 'healthcare' },
      { id: 'i-4', name: 'Practice Management Systems', category: 'healthcare' }
    ]
  },
  {
    id: 'hosteleria',
    slug: 'hosteleria',
    name: 'Hostelería',
    description: 'Automatiza reservas, pedidos y atención al cliente para restaurantes, bares y hoteles.',
    icon: 'UtensilsCrossed',
    color: 'brand-neptune',
    heroImage: '/images/solutions/hosteleria-hero.jpg',
    painPoints: [
      {
        id: 'hp-1',
        title: 'Gestión manual de reservas',
        description: 'Pérdida de reservas y errores en la gestión de mesas',
        cost: '15% overbooking mensual'
      },
      {
        id: 'hp-2',
        title: 'Pedidos telefónicos caóticos',
        description: 'Errores en pedidos y pérdida de tiempo en llamadas',
        cost: '20% errores en pedidos'
      },
      {
        id: 'hp-3',
        title: 'Sin canal directo con clientes',
        description: 'Dependencia de plataformas terceras con altas comisiones',
        cost: '30% comisión en delivery'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Sistema de reservas automático',
        description: 'Gestiona reservas 24/7 sin errores',
        icon: 'Calendar',
        example: 'Clientes reservan mesa viendo disponibilidad en tiempo real',
        workflow: [
          { step: 1, action: 'Cliente solicita reserva', automated: false },
          { step: 2, action: 'Bot muestra disponibilidad', automated: true },
          { step: 3, action: 'Cliente confirma reserva', automated: false },
          { step: 4, action: 'Recordatorio automático', automated: true }
        ]
      },
      {
        id: 'uc-2',
        title: 'Menú digital y pedidos',
        description: 'Toma pedidos directamente por WhatsApp',
        icon: 'UtensilsCrossed',
        example: 'Menú interactivo con fotos, precios y personalización',
        workflow: [
          { step: 1, action: 'Cliente solicita menú', automated: false },
          { step: 2, action: 'Bot envía menú digital', automated: true },
          { step: 3, action: 'Cliente realiza pedido', automated: false },
          { step: 4, action: 'Confirmación y tiempo estimado', automated: true }
        ]
      },
      {
        id: 'uc-3',
        title: 'Programa de fidelización',
        description: 'Mantén a tus clientes volviendo con recompensas',
        icon: 'Star',
        example: 'Puntos automáticos y ofertas personalizadas',
        workflow: [
          { step: 1, action: 'Cliente realiza pedido', automated: false },
          { step: 2, action: 'Acumulación automática de puntos', automated: true },
          { step: 3, action: 'Notificación de recompensas', automated: true },
          { step: 4, action: 'Canje de beneficios', automated: true }
        ]
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Aumento en reservas',
        metric: '+35%',
        description: 'Más mesas ocupadas'
      },
      {
        id: 'b-2',
        title: 'Ahorro en comisiones',
        metric: '-80%',
        description: 'Pedidos directos sin intermediarios'
      },
      {
        id: 'b-3',
        title: 'Clientes recurrentes',
        metric: '+45%',
        description: 'Mayor fidelización'
      }
    ],
    metrics: [
      {
        id: 'm-1',
        metric: 'Ocupación de mesas',
        before: '65%',
        after: '88%',
        improvement: '+35%'
      },
      {
        id: 'm-2',
        metric: 'Errores en pedidos',
        before: '20%',
        after: '3%',
        improvement: '-85%'
      },
      {
        id: 'm-3',
        metric: 'Ticket promedio',
        before: '€25',
        after: '€38',
        improvement: '+52%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        quote: 'Ahora gestionamos el doble de reservas sin errores. WhatsApp cambió nuestro negocio.',
        author: 'Chef Antonio López',
        role: 'Propietario',
        company: 'Restaurante El Mediterráneo',
        rating: 5
      },
      {
        id: 't-2',
        quote: 'Redujimos las comisiones de delivery del 30% al 5%. Es un ahorro enorme.',
        author: 'Patricia Ruiz',
        role: 'Gerente',
        company: 'Pizzería Napoli',
        rating: 5
      }
    ],
    integrations: [
      { id: 'i-1', name: 'POS Systems', category: 'restaurant' },
      { id: 'i-2', name: 'OpenTable', category: 'reservations' },
      { id: 'i-3', name: 'Resy', category: 'reservations' },
      { id: 'i-4', name: 'Square', category: 'payment' }
    ]
  },
  {
    id: 'educacion',
    slug: 'educacion',
    name: 'Educación',
    description: 'Comunicación efectiva con estudiantes y padres, gestión de matrículas y soporte académico.',
    icon: 'GraduationCap',
    color: 'brand-neptune',
    heroImage: '/images/solutions/educacion-hero.jpg',
    painPoints: [
      {
        id: 'ep-1',
        title: 'Comunicación dispersa con padres',
        description: 'Múltiples canales causan confusión y mensajes perdidos',
        cost: '40% mensajes sin leer'
      },
      {
        id: 'ep-2',
        title: 'Proceso de matrícula complejo',
        description: 'Formularios físicos y procesos lentos desaniman inscripciones',
        cost: '25% abandono en matrícula'
      },
      {
        id: 'ep-3',
        title: 'Soporte académico limitado',
        description: 'Estudiantes sin acceso a ayuda fuera de horario escolar',
        cost: '30% menor rendimiento'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Canal directo con padres',
        description: 'Comunicación bidireccional efectiva',
        icon: 'Users',
        example: 'Avisos, tareas y comunicados llegan al 98% de padres',
        workflow: [
          { step: 1, action: 'Institución envía comunicado', automated: true },
          { step: 2, action: 'Padres reciben en WhatsApp', automated: true },
          { step: 3, action: 'Confirmación de lectura', automated: true },
          { step: 4, action: 'Respuestas y consultas', automated: false }
        ]
      },
      {
        id: 'uc-2',
        title: 'Matrícula digital simplificada',
        description: 'Proceso de inscripción 100% por WhatsApp',
        icon: 'GraduationCap',
        example: 'Completa matrícula en 10 minutos desde el móvil',
        workflow: [
          { step: 1, action: 'Padre solicita información', automated: false },
          { step: 2, action: 'Bot envía requisitos y formulario', automated: true },
          { step: 3, action: 'Padre completa datos', automated: false },
          { step: 4, action: 'Confirmación y siguiente pasos', automated: true }
        ]
      },
      {
        id: 'uc-3',
        title: 'Tutor académico 24/7',
        description: 'Apoyo estudiantil con IA educativa',
        icon: 'MessageCircle',
        example: 'Respuestas instantáneas a dudas académicas',
        workflow: [
          { step: 1, action: 'Estudiante hace pregunta', automated: false },
          { step: 2, action: 'IA analiza y responde', automated: true },
          { step: 3, action: 'Material de apoyo enviado', automated: true },
          { step: 4, action: 'Escalado a profesor si necesario', automated: true }
        ]
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Comunicación efectiva',
        metric: '98%',
        description: 'Tasa de lectura de mensajes'
      },
      {
        id: 'b-2',
        title: 'Matrículas completadas',
        metric: '+40%',
        description: 'Más inscripciones exitosas'
      },
      {
        id: 'b-3',
        title: 'Rendimiento académico',
        metric: '+25%',
        description: 'Mejora en calificaciones'
      }
    ],
    metrics: [
      {
        id: 'm-1',
        metric: 'Tasa de lectura',
        before: '60%',
        after: '98%',
        improvement: '+63%'
      },
      {
        id: 'm-2',
        metric: 'Tiempo de matrícula',
        before: '3 días',
        after: '10 minutos',
        improvement: '-99%'
      },
      {
        id: 'm-3',
        metric: 'Satisfacción de padres',
        before: '3.2/5',
        after: '4.7/5',
        improvement: '+47%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        quote: 'La comunicación con padres mejoró drásticamente. Ahora todos están informados.',
        author: 'Directora Ana Fernández',
        role: 'Directora',
        company: 'Colegio Internacional Madrid',
        rating: 5
      },
      {
        id: 't-2',
        quote: 'El proceso de matrícula pasó de 3 días a 10 minutos. Increíble eficiencia.',
        author: 'Roberto Méndez',
        role: 'Coordinador Académico',
        company: 'Instituto Tecnológico Barcelona',
        rating: 5
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Google Classroom', category: 'education' },
      { id: 'i-2', name: 'Moodle', category: 'lms' },
      { id: 'i-3', name: 'Canvas', category: 'lms' },
      { id: 'i-4', name: 'School Management Systems', category: 'education' }
    ]
  },
  {
    id: 'servicios-profesionales',
    slug: 'servicios-profesionales',
    name: 'Servicios Profesionales',
    description: 'Herramientas WhatsApp para consultores, abogados, contadores y otros profesionales independientes.',
    icon: 'Briefcase',
    color: 'brand-neptune',
    heroImage: '/images/solutions/servicios-hero.jpg',
    painPoints: [
      {
        id: 'pp-1',
        title: 'Difícil captación de clientes',
        description: 'Sin canal efectivo para convertir leads en clientes',
        cost: '60% leads perdidos'
      },
      {
        id: 'pp-2',
        title: 'Gestión de consultas ineficiente',
        description: 'Tiempo valioso perdido en consultas no calificadas',
        cost: '30% tiempo improductivo'
      },
      {
        id: 'pp-3',
        title: 'Seguimiento manual de clientes',
        description: 'Procesos manuales que limitan el crecimiento',
        cost: 'Max 20 clientes/mes'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Calificación automática de leads',
        description: 'Filtra y califica prospectos automáticamente',
        icon: 'Users',
        example: 'Solo recibes consultas de clientes potenciales reales',
        workflow: [
          { step: 1, action: 'Lead contacta por WhatsApp', automated: false },
          { step: 2, action: 'Bot hace preguntas de calificación', automated: true },
          { step: 3, action: 'Evaluación automática del lead', automated: true },
          { step: 4, action: 'Solo leads calificados pasan', automated: true }
        ]
      },
      {
        id: 'uc-2',
        title: 'Agenda y consultas automatizadas',
        description: 'Gestiona tu agenda sin intervención manual',
        icon: 'Calendar',
        example: 'Clientes agendan consultas según tu disponibilidad',
        workflow: [
          { step: 1, action: 'Cliente solicita consulta', automated: false },
          { step: 2, action: 'Bot muestra slots disponibles', automated: true },
          { step: 3, action: 'Cliente agenda y paga', automated: false },
          { step: 4, action: 'Recordatorios automáticos', automated: true }
        ]
      },
      {
        id: 'uc-3',
        title: 'Seguimiento y cobros',
        description: 'Automatiza recordatorios de pago y seguimiento',
        icon: 'DollarSign',
        example: 'Cobra más rápido con recordatorios automáticos',
        workflow: [
          { step: 1, action: 'Servicio completado', automated: false },
          { step: 2, action: 'Factura enviada automáticamente', automated: true },
          { step: 3, action: 'Recordatorios de pago', automated: true },
          { step: 4, action: 'Confirmación de pago', automated: true }
        ]
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Más clientes calificados',
        metric: '+65%',
        description: 'Conversión de leads'
      },
      {
        id: 'b-2',
        title: 'Productividad aumentada',
        metric: '+40%',
        description: 'Más tiempo facturable'
      },
      {
        id: 'b-3',
        title: 'Cobros más rápidos',
        metric: '-50%',
        description: 'Tiempo de cobro'
      }
    ],
    metrics: [
      {
        id: 'm-1',
        metric: 'Conversión de leads',
        before: '15%',
        after: '45%',
        improvement: '+200%'
      },
      {
        id: 'm-2',
        metric: 'Horas facturables',
        before: '25h/semana',
        after: '35h/semana',
        improvement: '+40%'
      },
      {
        id: 'm-3',
        metric: 'Días para cobrar',
        before: '45 días',
        after: '15 días',
        improvement: '-67%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        quote: 'Triplicé mi cartera de clientes en 6 meses. WhatsApp es mi mejor vendedor.',
        author: 'Lic. Pedro González',
        role: 'Consultor Independiente',
        company: 'González Consulting',
        rating: 5
      },
      {
        id: 't-2',
        quote: 'Ahora cobro en 15 días en lugar de 45. Mi flujo de caja mejoró enormemente.',
        author: 'Dra. Isabel Moreno',
        role: 'Abogada',
        company: 'Moreno & Asociados',
        rating: 5
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Zoom', category: 'communication' },
      { id: 'i-2', name: 'Stripe', category: 'payment' },
      { id: 'i-3', name: 'QuickBooks', category: 'accounting' },
      { id: 'i-4', name: 'HubSpot', category: 'crm' }
    ]
  }
];