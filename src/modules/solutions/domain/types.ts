// Domain types for Solutions module

export interface Industry {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  painPoints: PainPoint[];
  useCases: UseCase[];
  benefits: Benefit[];
  metrics: MetricImprovement[];
  testimonials: Testimonial[];
  integrations: Integration[];
  heroImage?: string;
  color?: string;
}

export interface PainPoint {
  id: string;
  title: string;
  description: string;
  cost?: string; // Ej: "€2000/mes en pérdidas"
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  icon?: string;
  example?: string;
  workflow?: WorkflowStep[];
}

export interface WorkflowStep {
  step: number;
  action: string;
  automated: boolean;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  metric?: string; // Ej: "40% más conversión"
  icon?: string;
}

export interface MetricImprovement {
  metric: string;
  before: string | number;
  after: string | number;
  improvement: string; // Ej: "+40%"
}

export interface Testimonial {
  id: string;
  company: string;
  author: string;
  role: string;
  quote: string;
  rating?: number;
  metric?: string;
  image?: string;
  logo?: string;
}

export interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
}

export interface SolutionByUseCase {
  id: string;
  slug: string;
  name: string;
  category: UseCaseCategory;
  description: string;
  icon: string;
  process: ProcessStep[];
  industrialVariations: IndustryVariation[];
  features: Feature[];
  integrations: Integration[];
  expectedResults: ExpectedResult[];
  resources: Resource[];
}

export type UseCaseCategory =
  | 'sales-capture'
  | 'customer-service'
  | 'operations'
  | 'engagement';

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  automated: boolean;
  time?: string; // Ej: "30 segundos"
}

export interface IndustryVariation {
  industryId: string;
  industryName: string;
  specificUse: string;
  example: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface ExpectedResult {
  metric: string;
  improvement: string;
  timeframe: string; // Ej: "En 30 días"
}

export interface Resource {
  id: string;
  type: 'template' | 'guide' | 'webinar' | 'case-study';
  title: string;
  description: string;
  url?: string;
  downloadable?: boolean;
}

export interface CTAConfig {
  primary: {
    text: string;
    action: string;
    variant?: 'default' | 'industry' | 'usecase';
  };
  secondary?: {
    text: string;
    action: string;
  };
  tertiary?: {
    text: string;
    action: string;
  };
}

export interface PageSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  content: any; // Contenido específico según el tipo
  cta?: CTAConfig;
}

export type SectionType =
  | 'hero'
  | 'pain-points'
  | 'solution'
  | 'use-cases'
  | 'metrics'
  | 'testimonials'
  | 'features'
  | 'integrations'
  | 'pricing'
  | 'cta-final';