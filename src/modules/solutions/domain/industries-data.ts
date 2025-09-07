import { Industry } from './types';

export const industries: Industry[] = [
  {
    id: 'comercio',
    slug: 'comercio',
    name: 'Comercio',
    description: 'Soluciones WhatsApp para e-commerce y retail',
    icon: '🛍️',
    color: '#8B5CF6',
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
        icon: '📱',
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
        icon: '🛒',
        example: 'Recupera hasta el 30% de carritos con mensajes personalizados'
      },
      {
        id: 'uc-3',
        title: 'Notificaciones de pedidos',
        description: 'Actualiza a tus clientes en cada paso del proceso',
        icon: '📦',
        example: 'Confirmación, preparación, envío y entrega automatizados'
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Aumenta tus ventas',
        description: 'Convierte hasta un 40% más con atención 24/7',
        metric: '+40% conversión',
        icon: '📈'
      },
      {
        id: 'b-2',
        title: 'Reduce costos de soporte',
        description: 'Automatiza el 60% de las consultas repetitivas',
        metric: '-60% tickets',
        icon: '💰'
      },
      {
        id: 'b-3',
        title: 'Mejora la experiencia',
        description: 'Respuestas instantáneas en el canal favorito de tus clientes',
        metric: '98% satisfacción',
        icon: '⭐'
      }
    ],
    metrics: [
      {
        metric: 'Tasa de conversión',
        before: '2%',
        after: '5-8%',
        improvement: '+150%'
      },
      {
        metric: 'Tiempo de respuesta',
        before: '2-4 horas',
        after: 'Instantáneo',
        improvement: '-100%'
      },
      {
        metric: 'Carritos recuperados',
        before: '5%',
        after: '30%',
        improvement: '+500%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        company: 'TechStore Madrid',
        person: 'Carlos Martínez',
        role: 'Director de E-commerce',
        quote: 'Recuperamos €50,000 en carritos abandonados el primer mes. El ROI fue inmediato.',
        metric: '€50,000 recuperados',
        logo: '/logos/techstore.png'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Shopify', logo: '/logos/shopify.svg', category: 'e-commerce' },
      { id: 'i-2', name: 'WooCommerce', logo: '/logos/woocommerce.svg', category: 'e-commerce' },
      { id: 'i-3', name: 'PrestaShop', logo: '/logos/prestashop.svg', category: 'e-commerce' },
      { id: 'i-4', name: 'Stripe', logo: '/logos/stripe.svg', category: 'payments' }
    ]
  },
  {
    id: 'salud',
    slug: 'salud',
    name: 'Salud',
    description: 'WhatsApp para clínicas, consultorios y centros médicos',
    icon: '🏥',
    color: '#10B981',
    heroImage: '/images/solutions/salud-hero.jpg',
    painPoints: [
      {
        id: 'sp-1',
        title: 'Alto índice de citas perdidas',
        description: 'Pacientes que no asisten sin avisar causan pérdidas importantes',
        cost: '25% de citas no atendidas'
      },
      {
        id: 'sp-2',
        title: 'Gestión manual de citas',
        description: 'Recepcionistas saturadas atendiendo llamadas para agendar',
        cost: '6 horas/día en llamadas'
      },
      {
        id: 'sp-3',
        title: 'Sin seguimiento post-consulta',
        description: 'Pacientes no siguen tratamientos por falta de recordatorios',
        cost: '40% abandono de tratamiento'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Agendamiento automático de citas',
        description: 'Pacientes agendan directamente por WhatsApp 24/7',
        icon: '📅',
        example: 'Sistema muestra horarios disponibles y confirma automáticamente'
      },
      {
        id: 'uc-2',
        title: 'Recordatorios inteligentes',
        description: 'Reduce el ausentismo con recordatorios personalizados',
        icon: '⏰',
        example: 'Recordatorio 24h y 2h antes con opción de confirmar o reagendar'
      },
      {
        id: 'uc-3',
        title: 'Seguimiento de tratamientos',
        description: 'Mensajes automáticos para asegurar adherencia',
        icon: '💊',
        example: 'Recordatorios de medicación y citas de seguimiento'
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Reduce citas perdidas',
        description: 'Disminuye el ausentismo hasta en un 70%',
        metric: '-70% no-shows',
        icon: '✅'
      },
      {
        id: 'b-2',
        title: 'Libera a tu personal',
        description: 'Automatiza el 80% de la gestión de citas',
        metric: '-80% llamadas',
        icon: '👥'
      },
      {
        id: 'b-3',
        title: 'Mejora resultados clínicos',
        description: 'Mayor adherencia a tratamientos con seguimiento automático',
        metric: '+60% adherencia',
        icon: '📊'
      }
    ],
    metrics: [
      {
        metric: 'Citas perdidas',
        before: '25%',
        after: '7%',
        improvement: '-72%'
      },
      {
        metric: 'Tiempo en agendar',
        before: '15 minutos',
        after: '2 minutos',
        improvement: '-87%'
      },
      {
        metric: 'Satisfacción paciente',
        before: '75%',
        after: '95%',
        improvement: '+27%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        company: 'Clínica Dental Sonrisa',
        person: 'Dra. María López',
        role: 'Directora Médica',
        quote: 'Redujimos las citas perdidas de 25% a 5%. Eso significa 20 pacientes más atendidos por semana.',
        metric: '20 pacientes más/semana',
        logo: '/logos/clinica-sonrisa.png'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Google Calendar', logo: '/logos/google-calendar.svg', category: 'calendar' },
      { id: 'i-2', name: 'Calendly', logo: '/logos/calendly.svg', category: 'calendar' },
      { id: 'i-3', name: 'Doctoralia', logo: '/logos/doctoralia.svg', category: 'health' }
    ]
  },
  {
    id: 'hosteleria',
    slug: 'hosteleria',
    name: 'Hostelería',
    description: 'WhatsApp para restaurantes, bares y hoteles',
    icon: '🍽️',
    color: '#F59E0B',
    heroImage: '/images/solutions/hosteleria-hero.jpg',
    painPoints: [
      {
        id: 'hp-1',
        title: 'Pérdida de reservas telefónicas',
        description: 'No puedes atender llamadas en horas pico y pierdes clientes',
        cost: '30% reservas perdidas'
      },
      {
        id: 'hp-2',
        title: 'Pedidos mal gestionados',
        description: 'Errores en pedidos telefónicos y retrasos en la cocina',
        cost: '15% pedidos con error'
      },
      {
        id: 'hp-3',
        title: 'Sin fidelización de clientes',
        description: 'No tienes forma de mantener contacto con clientes frecuentes',
        cost: '60% no repite visita'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Reservas automáticas 24/7',
        description: 'Acepta reservas incluso cuando estás cerrado',
        icon: '📋',
        example: 'Cliente reserva mesa, ve disponibilidad y recibe confirmación instantánea'
      },
      {
        id: 'uc-2',
        title: 'Menú digital y pedidos',
        description: 'Comparte tu carta y recibe pedidos directamente',
        icon: '📱',
        example: 'Cliente ve menú con fotos, precios y hace pedido para recoger'
      },
      {
        id: 'uc-3',
        title: 'Programa de fidelización',
        description: 'Promociones y ofertas exclusivas por WhatsApp',
        icon: '🎁',
        example: 'Envía ofertas especiales a clientes frecuentes automáticamente'
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Nunca pierdas una reserva',
        description: 'Sistema 24/7 que no descansa',
        metric: '+30% reservas',
        icon: '📈'
      },
      {
        id: 'b-2',
        title: 'Cero errores en pedidos',
        description: 'Todo por escrito y confirmado',
        metric: '0% errores',
        icon: '✓'
      },
      {
        id: 'b-3',
        title: 'Clientes que vuelven',
        description: 'Mantén el contacto y fideliza',
        metric: '+45% repetición',
        icon: '🔄'
      }
    ],
    metrics: [
      {
        metric: 'Reservas captadas',
        before: '70%',
        after: '95%',
        improvement: '+36%'
      },
      {
        metric: 'Errores en pedidos',
        before: '15%',
        after: '2%',
        improvement: '-87%'
      },
      {
        metric: 'Clientes recurrentes',
        before: '40%',
        after: '65%',
        improvement: '+63%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        company: 'Restaurante El Mediterráneo',
        person: 'Juan García',
        role: 'Propietario',
        quote: 'Ahora captamos reservas las 24 horas. Los domingos por la noche se llenan las reservas para la semana.',
        metric: '+30% ocupación',
        logo: '/logos/mediterraneo.png'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Resmio', logo: '/logos/resmio.svg', category: 'restaurant' },
      { id: 'i-2', name: 'ElTenedor', logo: '/logos/eltenedor.svg', category: 'restaurant' },
      { id: 'i-3', name: 'Glovo', logo: '/logos/glovo.svg', category: 'delivery' }
    ]
  },
  {
    id: 'educacion',
    slug: 'educacion',
    name: 'Educación',
    description: 'WhatsApp para centros educativos y academias',
    icon: '🎓',
    color: '#3B82F6',
    heroImage: '/images/solutions/educacion-hero.jpg',
    painPoints: [
      {
        id: 'ep-1',
        title: 'Comunicación fragmentada',
        description: 'Padres y alumnos no reciben información importante a tiempo',
        cost: '40% mensajes no leídos'
      },
      {
        id: 'ep-2',
        title: 'Proceso de matrícula complejo',
        description: 'Inscripciones manuales que requieren presencialidad',
        cost: '5 días promedio matriculación'
      },
      {
        id: 'ep-3',
        title: 'Sin soporte fuera de horario',
        description: 'Consultas de estudiantes sin respuesta en tardes y fines de semana',
        cost: '60% consultas sin atender'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Matriculación digital',
        description: 'Proceso completo de inscripción por WhatsApp',
        icon: '📝',
        example: 'Estudiante completa formulario, envía documentos y paga matrícula'
      },
      {
        id: 'uc-2',
        title: 'Comunicación con padres',
        description: 'Avisos, calificaciones y eventos directamente',
        icon: '👨‍👩‍👧',
        example: 'Notificaciones de ausencias, tareas y reuniones automáticas'
      },
      {
        id: 'uc-3',
        title: 'Soporte académico 24/7',
        description: 'Respuestas instantáneas sobre cursos y horarios',
        icon: '💬',
        example: 'Bot responde dudas frecuentes y agenda tutorías'
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'Matrículas más rápidas',
        description: 'Reduce el tiempo de inscripción en 80%',
        metric: '-80% tiempo',
        icon: '⚡'
      },
      {
        id: 'b-2',
        title: 'Padres informados',
        description: '100% de mensajes importantes recibidos',
        metric: '100% alcance',
        icon: '📬'
      },
      {
        id: 'b-3',
        title: 'Mejor retención',
        description: 'Estudiantes más satisfechos y comprometidos',
        metric: '+25% retención',
        icon: '🎯'
      }
    ],
    metrics: [
      {
        metric: 'Tiempo matriculación',
        before: '5 días',
        after: '30 minutos',
        improvement: '-99%'
      },
      {
        metric: 'Mensajes leídos',
        before: '60%',
        after: '98%',
        improvement: '+63%'
      },
      {
        metric: 'Satisfacción padres',
        before: '70%',
        after: '92%',
        improvement: '+31%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        company: 'Academia Futuro',
        person: 'Ana Rodríguez',
        role: 'Directora',
        quote: 'Procesamos 200 matrículas en una semana, algo que antes nos tomaba un mes.',
        metric: '200 matrículas/semana',
        logo: '/logos/academia-futuro.png'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Moodle', logo: '/logos/moodle.svg', category: 'education' },
      { id: 'i-2', name: 'Google Classroom', logo: '/logos/google-classroom.svg', category: 'education' },
      { id: 'i-3', name: 'Zoom', logo: '/logos/zoom.svg', category: 'communication' }
    ]
  },
  {
    id: 'servicios-profesionales',
    slug: 'servicios-profesionales',
    name: 'Servicios Profesionales',
    description: 'WhatsApp para fontaneros, electricistas y consultores',
    icon: '🔧',
    color: '#EC4899',
    heroImage: '/images/solutions/servicios-hero.jpg',
    painPoints: [
      {
        id: 'spp-1',
        title: 'Pérdida de clientes potenciales',
        description: 'No puedes atender llamadas mientras trabajas',
        cost: '40% llamadas perdidas'
      },
      {
        id: 'spp-2',
        title: 'Presupuestos lentos',
        description: 'Días para enviar cotizaciones que el cliente ya no espera',
        cost: '30% presupuestos rechazados'
      },
      {
        id: 'spp-3',
        title: 'Sin seguimiento de servicios',
        description: 'Clientes insatisfechos por falta de comunicación',
        cost: '50% no contrata de nuevo'
      }
    ],
    useCases: [
      {
        id: 'uc-1',
        title: 'Solicitud de servicios 24/7',
        description: 'Recibe solicitudes incluso mientras trabajas',
        icon: '📲',
        example: 'Cliente describe problema, envía fotos y solicita presupuesto'
      },
      {
        id: 'uc-2',
        title: 'Presupuestos instantáneos',
        description: 'Envía cotizaciones automáticas según el servicio',
        icon: '💰',
        example: 'Sistema calcula presupuesto basado en tipo de trabajo y urgencia'
      },
      {
        id: 'uc-3',
        title: 'Agenda y recordatorios',
        description: 'Gestiona citas y envía recordatorios automáticos',
        icon: '📅',
        example: 'Cliente agenda visita y recibe confirmación con detalles'
      }
    ],
    benefits: [
      {
        id: 'b-1',
        title: 'No pierdas clientes',
        description: 'Atiende 100% de solicitudes automáticamente',
        metric: '100% atención',
        icon: '✅'
      },
      {
        id: 'b-2',
        title: 'Presupuesta al instante',
        description: 'Envía cotizaciones en minutos, no días',
        metric: '10x más rápido',
        icon: '⚡'
      },
      {
        id: 'b-3',
        title: 'Clientes satisfechos',
        description: 'Comunicación profesional que genera confianza',
        metric: '+85% satisfacción',
        icon: '⭐'
      }
    ],
    metrics: [
      {
        metric: 'Solicitudes atendidas',
        before: '60%',
        after: '100%',
        improvement: '+67%'
      },
      {
        metric: 'Tiempo presupuestar',
        before: '2-3 días',
        after: '5 minutos',
        improvement: '-99%'
      },
      {
        metric: 'Clientes recurrentes',
        before: '50%',
        after: '80%',
        improvement: '+60%'
      }
    ],
    testimonials: [
      {
        id: 't-1',
        company: 'Fontanería Rápida',
        person: 'Pedro Sánchez',
        role: 'Propietario',
        quote: 'Ahora atiendo el doble de clientes sin contratar más personal. El sistema trabaja mientras yo estoy en servicio.',
        metric: '2x más clientes',
        logo: '/logos/fontaneria-rapida.png'
      }
    ],
    integrations: [
      { id: 'i-1', name: 'Google Calendar', logo: '/logos/google-calendar.svg', category: 'calendar' },
      { id: 'i-2', name: 'Stripe', logo: '/logos/stripe.svg', category: 'payments' },
      { id: 'i-3', name: 'Holded', logo: '/logos/holded.svg', category: 'invoicing' }
    ]
  }
];