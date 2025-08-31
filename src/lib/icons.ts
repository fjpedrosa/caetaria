import {
  Activity,
  AlertCircle,
  ArrowRight,
  AtSign,
  Award,
  BarChart3,
  BatteryCharging,
  Bell,
  Bot,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  CloudOff,
  Copy,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Gift,
  Globe2,
  Hash,
  Heart,
  HeartHandshake,
  HelpCircle,
  Image,
  Info,
  Key,
  Layers,
  Link,
  Lock,
  LogIn,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Minus,
  Moon,
  Package,
  Paperclip,
  Phone,
  PlayCircle,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UtensilsCrossed,
  Video,
  Volume2,
  Webhook,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap} from 'lucide-react';

// Icon configuration for consistent styling
export const iconConfig = {
  default: {
    size: 24,
    strokeWidth: 1.5,
    className: 'transition-colors duration-250'
  },
  small: {
    size: 16,
    strokeWidth: 1.5,
    className: 'transition-colors duration-250'
  },
  medium: {
    size: 20,
    strokeWidth: 1.5,
    className: 'transition-colors duration-250'
  },
  large: {
    size: 32,
    strokeWidth: 1.5,
    className: 'transition-colors duration-250'
  },
  xlarge: {
    size: 48,
    strokeWidth: 1.5,
    className: 'transition-colors duration-250'
  }
};

// Feature icons mapping
export const featureIcons = {
  messaging: MessageCircle,
  automation: Bot,
  speed: Zap,
  security: Shield,
  analytics: BarChart3,
  global: Globe2,
  users: Users,
  integration: Webhook,
  notifications: Bell,
  ai: Sparkles,
  mobile: Smartphone,
  send: Send,
  realtime: Activity,
  cloud: Cloud,
  database: Database,
  api: Server,
  settings: Settings,
  support: HeartHandshake,
  growth: TrendingUp,
  enterprise: Building2
} as const;

// Navigation icons
export const navIcons = {
  menu: Menu,
  close: X,
  dropdown: ChevronDown,
  external: ExternalLink,
  search: Search,
  darkMode: Moon,
  lightMode: Sun,
  home: Building2,
  features: Layers,
  pricing: DollarSign,
  docs: FileText,
  help: HelpCircle
} as const;

// Action icons
export const actionIcons = {
  arrow: ArrowRight,
  chevron: ChevronRight,
  play: PlayCircle,
  check: Check,
  checkCircle: CheckCircle,
  star: Star,
  plus: Plus,
  minus: Minus,
  download: Download,
  upload: Upload,
  copy: Copy,
  share: Share2,
  edit: Edit3,
  delete: Trash2,
  save: Save,
  refresh: RefreshCw
} as const;

// Status icons
export const statusIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  error: X,
  info: Info,
  loading: RefreshCw
} as const;

// Social icons (could be extended with custom SVGs if needed)
export const socialIcons = {
  email: Mail,
  phone: Phone,
  location: MapPin,
  calendar: Calendar
} as const;

// Helper function to get icon with default config
export const getIcon = (
  Icon: LucideIcon,
  size: keyof typeof iconConfig = 'default',
  additionalClasses?: string
) => {
  const config = iconConfig[size];
  return {
    Icon,
    ...config,
    className: `${config.className} ${additionalClasses || ''}`
  };
};

// Animation classes for icons
export const iconAnimations = {
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  float: 'animate-float',
  glow: 'animate-glow',
  none: ''
} as const;

// Icon wrapper styles for different contexts
export const iconWrapperStyles = {
  primary: 'bg-primary/10 p-3 rounded-lg text-primary hover:bg-primary/20 transition-colors duration-250',
  secondary: 'bg-secondary/10 p-3 rounded-lg text-secondary hover:bg-secondary/20 transition-colors duration-250',
  success: 'bg-success/10 p-3 rounded-lg text-success hover:bg-success/20 transition-colors duration-250',
  warning: 'bg-warning/10 p-3 rounded-lg text-warning hover:bg-warning/20 transition-colors duration-250',
  error: 'bg-destructive/10 p-3 rounded-lg text-destructive hover:bg-destructive/20 transition-colors duration-250',
  neutral: 'bg-muted p-3 rounded-lg text-muted-foreground hover:bg-accent transition-colors duration-250',
  gradient: 'bg-gradient-brand p-3 rounded-lg text-white',
  outline: 'border-2 border-current p-3 rounded-lg hover:bg-current/5 transition-colors duration-250'
} as const;

// Export all icons for easy access
export {
  Activity,
  AlertCircle,
  ArrowRight,
  AtSign,
  Award,
  BarChart3,
  BatteryCharging,
  Bell,
  Bot,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  CloudOff,
  Copy,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Gift,
  Globe2,
  Hash,
  Heart,
  HeartHandshake,
  HelpCircle,
  Image,
  Info,
  Key,
  Layers,
  Link,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Minus,
  Moon,
  Package,
  Paperclip,
  Phone,
  PlayCircle,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  UtensilsCrossed,
  Video,
  Volume2,
  Webhook,
  Wifi,
  WifiOff,
  Wrench,
  X,
  Zap};