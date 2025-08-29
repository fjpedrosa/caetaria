import { 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Check,
  Star,
  Users,
  Zap,
  HeadphonesIcon,
  Bot,
  ChartBar
} from 'lucide-react';

export interface Feature {
  icon: any;
  title: string;
  description: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface LandingData {
  heroTitle: string;
  heroSubtitle: string;
  features: Feature[];
  pricing: {
    starter: PricingPlan;
    pro: PricingPlan;
  };
  cta: {
    primary: string;
    secondary: string;
  };
  faq: FAQ[];
  testimonials: Testimonial[];
  stats: Stat[];
}

export interface Testimonial {
  name: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface Stat {
  value: string;
  label: string;
  icon: any;
}

export const landingData: LandingData = {
  heroTitle: "Vende más en WhatsApp con tu asistente virtual 24/7",
  heroSubtitle: "La plataforma de confianza que ya usan +500 pymes para automatizar ventas y multiplicar conversiones en WhatsApp Business",
  features: [
    {
      icon: MessageSquare,
      title: "Responde al instante, vende mientras duermes",
      description: "Tu bot responde en segundos, califica leads y cierra ventas automáticamente 24/7"
    },
    {
      icon: TrendingUp,
      title: "Multiplica x3 tus conversiones sin contratar más personal",
      description: "Gestiona 1000+ conversaciones simultáneas y convierte hasta 3 veces más clientes"
    },
    {
      icon: Shield,
      title: "100% legal y verificado por Meta Business",
      description: "Cumple GDPR/LOPD, con badge verde verificado y sin riesgo de bloqueos"
    }
  ],
  pricing: {
    starter: {
      name: "Starter",
      price: "49€",
      description: "Perfecto para empezar a vender más",
      features: [
        "Hasta 1.000 conversaciones/mes",
        "Bot con IA conversacional",
        "Plantillas pre-diseñadas",
        "Soporte por email",
        "Badge verde verificado",
        "Panel de analytics básico"
      ],
      cta: "Prueba 14 días gratis"
    },
    pro: {
      name: "Pro",
      price: "149€",
      description: "Para pymes que buscan escalar",
      features: [
        "Conversaciones ilimitadas",
        "IA avanzada + integraciones CRM",
        "Plantillas personalizadas",
        "Soporte prioritario 24/7",
        "Analytics y reportes avanzados",
        "API personalizada",
        "Multi-agente simultáneo",
        "Exportación de datos"
      ],
      cta: "Empieza ahora",
      highlighted: true
    }
  },
  cta: {
    primary: "Empieza a vender más hoy - 14 días gratis",
    secondary: "Sin tarjeta de crédito · Cancela cuando quieras"
  },
  faq: [
    {
      question: "¿Es legal usar bots en WhatsApp Business?",
      answer: "Totalmente legal. Somos partners oficiales de Meta Business y cumplimos todas las políticas de WhatsApp Business API. Tu cuenta estará verificada con el badge verde y nunca tendrás riesgo de bloqueos."
    },
    {
      question: "¿Incluye plantillas de mensajes pre-diseñadas?",
      answer: "Sí, incluimos +50 plantillas probadas para diferentes sectores (retail, servicios, restauración...) que han demostrado aumentar las conversiones. Todas personalizables con tu marca."
    },
    {
      question: "¿La IA entiende preguntas complejas de mis clientes?",
      answer: "Nuestra IA está entrenada específicamente para ventas en español y entiende contexto, variaciones, errores de escritura y hasta emojis. Aprende de cada conversación para mejorar continuamente."
    },
    {
      question: "¿Qué pasa si necesito ayuda para configurarlo?",
      answer: "Te acompañamos en todo el proceso. Incluimos onboarding personalizado, videotutoriales paso a paso y soporte en español. En plan Pro tienes soporte prioritario 24/7 por WhatsApp."
    }
  ],
  testimonials: [
    {
      name: "Carlos Rodríguez",
      company: "TechStore Madrid",
      content: "En 3 meses triplicamos las ventas. El bot gestiona el 80% de consultas y nosotros solo cerramos ventas grandes.",
      rating: 5
    },
    {
      name: "María García",
      company: "Boutique Bella",
      content: "Pasamos de 10 a 200+ conversaciones diarias. El ROI fue positivo desde el primer mes.",
      rating: 5
    },
    {
      name: "Juan Martínez",
      company: "Clínica Dental Plus",
      content: "Automatizamos las citas y recordatorios. Redujimos un 90% las llamadas y el equipo está más enfocado.",
      rating: 5
    }
  ],
  stats: [
    {
      value: "+500",
      label: "Pymes confían en nosotros",
      icon: Users
    },
    {
      value: "3x",
      label: "Aumento en conversiones",
      icon: ChartBar
    },
    {
      value: "24/7",
      label: "Disponibilidad garantizada",
      icon: Zap
    },
    {
      value: "2M+",
      label: "Mensajes procesados",
      icon: MessageSquare
    }
  ]
};