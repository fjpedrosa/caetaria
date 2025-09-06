/**
 * Mega menu configuration data
 * Professional structure inspired by Stripe's navigation
 */

import {
  MessageSquare,
  Bot,
  BarChart3,
  Zap,
  Users,
  Settings,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  BookOpen,
  HelpCircle,
  Code,
  Layers,
  Package,
  Briefcase,
  Star,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
  Brain,
} from 'lucide-react';
import { type MegaMenuConfig } from '../../domain/types/mega-menu.types';

/**
 * Products mega menu configuration
 */
export const productsMegaMenu: MegaMenuConfig = {
  id: 'products',
  trigger: 'Productos',
  width: 'lg',
  showBackdrop: true,
  animationPreset: 'slide',
  columns: [
    {
      id: 'messaging',
      title: 'Mensajería',
      items: [
        {
          id: 'whatsapp-api',
          title: 'WhatsApp Cloud API',
          description: 'Integración oficial con WhatsApp Business',
          href: '/products/whatsapp',
          icon: MessageSquare,
          iconColor: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',  // Keep WhatsApp green for WhatsApp-specific feature
          badge: { text: 'Popular', variant: 'new' },
          isHighlighted: true,
        },
        {
          id: 'multi-channel',
          title: 'Mensajería Multicanal',
          description: 'WhatsApp, Telegram, Instagram en un solo lugar',
          href: '/products/multi-channel',
          icon: Globe,
          iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          id: 'broadcast',
          title: 'Campañas Masivas',
          description: 'Envía mensajes personalizados a miles',
          href: '/products/broadcast',
          icon: Rocket,
          iconColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
      ],
      footerLink: {
        text: 'Ver todos los productos de mensajería',
        href: '/products/messaging',
        icon: ArrowRight,
      },
    },
    {
      id: 'automation',
      title: 'Automatización',
      items: [
        {
          id: 'chatbots',
          title: 'Chatbots con IA',
          description: 'Bots inteligentes que entienden contexto',
          href: '/products/chatbots',
          icon: Bot,
          iconColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          badge: { text: 'AI', variant: 'beta' },
        },
        {
          id: 'workflows',
          title: 'Flujos de Trabajo',
          description: 'Automatiza procesos de negocio complejos',
          href: '/products/workflows',
          icon: Zap,
          iconColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
          id: 'integrations',
          title: 'Integraciones',
          description: 'Conecta con CRM, ERP y más herramientas',
          href: '/products/integrations',
          icon: Layers,
          iconColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard en Tiempo Real',
          description: 'Métricas y KPIs de tus conversaciones',
          href: '/products/dashboard',
          icon: BarChart3,
          iconColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        },
        {
          id: 'reports',
          title: 'Reportes Avanzados',
          description: 'Análisis detallado del rendimiento',
          href: '/products/reports',
          icon: FileText,
          iconColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        },
        {
          id: 'insights',
          title: 'AI Insights',
          description: 'Predicciones y recomendaciones con IA',
          href: '/products/insights',
          icon: Brain,
          iconColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
          badge: { text: 'Nuevo', variant: 'new' },
        },
      ],
    },
  ],
};

/**
 * Solutions mega menu configuration
 */
export const solutionsMegaMenu: MegaMenuConfig = {
  id: 'solutions',
  trigger: 'Soluciones',
  width: 'md',
  showBackdrop: true,
  animationPreset: 'fade',
  columns: [
    {
      id: 'by-industry',
      title: 'Por Industria',
      items: [
        {
          id: 'ecommerce',
          title: 'E-commerce',
          description: 'Ventas y soporte 24/7',
          href: '/solutions/ecommerce',
          icon: CreditCard,
          iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          id: 'healthcare',
          title: 'Salud',
          description: 'Citas y recordatorios médicos',
          href: '/solutions/healthcare',
          icon: Calendar,
          iconColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
          id: 'education',
          title: 'Educación',
          description: 'Campus virtual y notificaciones',
          href: '/solutions/education',
          icon: BookOpen,
          iconColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
          id: 'restaurants',
          title: 'Restaurantes',
          description: 'Reservas y pedidos automáticos',
          href: '/solutions/restaurants',
          icon: Smartphone,
          iconColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
      ],
    },
    {
      id: 'by-use-case',
      title: 'Por Caso de Uso',
      items: [
        {
          id: 'customer-support',
          title: 'Atención al Cliente',
          description: 'Soporte eficiente y personalizado',
          href: '/solutions/support',
          icon: Users,
          iconColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
          id: 'marketing',
          title: 'Marketing y Ventas',
          description: 'Campañas y conversión',
          href: '/solutions/marketing',
          icon: TrendingUp,
          iconColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        },
        {
          id: 'operations',
          title: 'Operaciones',
          description: 'Automatiza procesos internos',
          href: '/solutions/operations',
          icon: Settings,
          iconColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        },
      ],
      footerLink: {
        text: 'Explorar todas las soluciones',
        href: '/solutions',
        icon: Sparkles,
      },
    },
  ],
};

/**
 * Resources mega menu configuration
 */
export const resourcesMegaMenu: MegaMenuConfig = {
  id: 'resources',
  trigger: 'Recursos',
  width: 'md',
  showBackdrop: true,
  animationPreset: 'scale',
  columns: [
    {
      id: 'learn',
      title: 'Aprender',
      items: [
        {
          id: 'documentation',
          title: 'Documentación',
          description: 'Guías técnicas y API reference',
          href: '/docs',
          icon: BookOpen,
          iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          id: 'tutorials',
          title: 'Tutoriales',
          description: 'Paso a paso para comenzar',
          href: '/tutorials',
          icon: Code,
          iconColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
          id: 'academy',
          title: 'Academy',
          description: 'Cursos y certificaciones',
          href: '/academy',
          icon: Star,
          iconColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          badge: { text: 'Gratis', variant: 'new' },
        },
      ],
    },
    {
      id: 'support',
      title: 'Soporte',
      items: [
        {
          id: 'help-center',
          title: 'Centro de Ayuda',
          description: 'Preguntas frecuentes',
          href: '/help',
          icon: HelpCircle,
          iconColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
        {
          id: 'community',
          title: 'Comunidad',
          description: 'Conecta con otros usuarios',
          href: '/community',
          icon: Users,
          iconColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
          id: 'contact',
          title: 'Contacto',
          description: 'Habla con nuestro equipo',
          href: '/contact',
          icon: Mail,
          iconColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        },
      ],
    },
  ],
};

/**
 * Company mega menu configuration
 */
export const companyMegaMenu: MegaMenuConfig = {
  id: 'company',
  trigger: 'Empresa',
  width: 'sm',
  showBackdrop: true,
  animationPreset: 'fade',
  columns: [
    {
      id: 'about',
      items: [
        {
          id: 'about-us',
          title: 'Acerca de',
          description: 'Nuestra misión y valores',
          href: '/about',
          icon: Briefcase,
          iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          id: 'careers',
          title: 'Carreras',
          description: 'Únete a nuestro equipo',
          href: '/careers',
          icon: Users,
          iconColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          badge: { text: 'Hiring', variant: 'new' },
        },
        {
          id: 'partners',
          title: 'Partners',
          description: 'Programa de socios',
          href: '/partners',
          icon: Package,
          iconColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
          id: 'security',
          title: 'Seguridad',
          description: 'Cumplimiento y certificaciones',
          href: '/security',
          icon: Shield,
          iconColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
      ],
    },
  ],
};

/**
 * All mega menu configurations
 */
export const megaMenuConfigs: MegaMenuConfig[] = [
  productsMegaMenu,
  solutionsMegaMenu,
  resourcesMegaMenu,
  companyMegaMenu,
];