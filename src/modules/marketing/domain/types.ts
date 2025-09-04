/**
 * Marketing Domain Types - Centralized type definitions
 * Following Clean Architecture principles with all interfaces in one place
 */

// Import form data types from validation schemas
import { type LeadCaptureFormData } from '@/modules/shared/presentation/validation/form-schemas';

// =============================================================================
// LEAD CAPTURE TYPES
// =============================================================================

export type LeadSource =
  | 'hero-cta'
  | 'pricing-section'
  | 'footer'
  | 'popup'
  | 'nav-cta'
  | 'demo-widget'
  | 'contact-form'
  | 'download-guide';

export interface LeadData {
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  companyName?: string;
  interestedFeatures?: string[];
  notes?: string;
}

export interface LeadCaptureFormProps {
  source: LeadSource;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'modal';
  onSuccess?: (data: LeadCaptureFormData) => void;
}

export interface LeadSubmissionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  selectedFeatures: string[];
  error?: string;
}

// =============================================================================
// FEATURE OPTIONS
// =============================================================================

export interface FeatureOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// =============================================================================
// ANALYTICS & TRACKING TYPES
// =============================================================================

export interface TrackingEvent {
  eventName: string;
  properties: Record<string, any>;
  source?: LeadSource;
  timestamp?: Date;
}

export interface AnalyticsContext {
  userId?: string;
  sessionId: string;
  source: LeadSource;
  campaignData?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

// =============================================================================
// FORM VALIDATION TYPES
// =============================================================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface LeadSubmissionResponse {
  leadId: string;
  message: string;
  nextSteps?: {
    emailSent: boolean;
    calendarLink?: string;
    followUpDate?: Date;
  };
}

// =============================================================================
// PRICING TYPES
// =============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
}

export interface PricingDisplayProps {
  plans: PricingPlan[];
  showYearly?: boolean;
  onPlanSelect?: (planId: string) => void;
  className?: string;
}

// =============================================================================
// COMPONENT STATE TYPES
// =============================================================================

export interface ComponentLoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface ComponentErrorState {
  hasError: boolean;
  error?: Error;
  retryCount?: number;
}

// =============================================================================
// MARKETING CONTENT TYPES
// =============================================================================

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SocialProofData {
  customerCount: number;
  reviewCount: number;
  averageRating: number;
  logoUrls: string[];
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  children?: NavigationItem[];
}

export interface NavigationState {
  isOpen: boolean;
  activeSection?: string;
  scrollPosition: number;
}

// =============================================================================
// HERO MOBILE DEMO TYPES - Added from refactoring
// =============================================================================

export type MessagePhase =
  | 'initial'
  | 'customer_typing1'
  | 'customer1'
  | 'message_read1'
  | 'badge_ai'
  | 'bot_typing1'
  | 'bot1'
  | 'customer_typing2'
  | 'customer2'
  | 'message_read2'
  | 'bot_typing2'
  | 'bot2'
  | 'badge_flow'
  | 'flow'
  | 'badge_crm'
  | 'complete';

export type BadgeType = 'ai' | 'flow' | 'crm';
export type FlowStep = 'guests' | 'date' | 'time' | 'confirmation';
export type DeviceType = 'iphone' | 'android';
export type ArrowDirection = 'down' | 'up' | 'left' | 'right';

export interface AnimationStep {
  phase: MessagePhase;
  delay: number;
  badge: BadgeType | null;
}

export interface DynamicBadge {
  id: BadgeType;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  arrowDirection: ArrowDirection;
}

export interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

export interface FlowSequenceStep {
  step: FlowStep;
  delay: number;
  mockData?: Partial<ReservationData>;
}

export interface HeroDemoEventCallbacks {
  onFlowStart?: () => void;
  onFlowComplete?: (data: ReservationData) => void;
  onBadgeShow?: (badgeType: BadgeType) => void;
  onAnimationComplete?: () => void;
  onMessageSent?: (message: any) => void;
  onPhaseChange?: (phase: MessagePhase) => void;
}

// =============================================================================
// HERO COMPONENT PROPS - Pure UI concerns
// =============================================================================

export interface HeroMobileDemoProps {
  className?: string;
  style?: React.CSSProperties;
  deviceType?: DeviceType;
  autoStart?: boolean;
  onAnimationComplete?: () => void;
}

export interface HeroMobileDemoV2Props {
  className?: string;
  deviceType?: DeviceType;
  autoPlay?: boolean;
  onFlowComplete?: (data: ReservationData) => void;
}

export interface HeroContentProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
  showAnimatedCounter?: boolean;
}

export interface HeroComparisonProps {
  className?: string;
  showAnimation?: boolean;
  variant?: 'default' | 'compact';
}

// =============================================================================
// TYPEWRITER AND ANIMATIONS
// =============================================================================

export interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  loop?: boolean;
  className?: string;
}

// Alternative TypewriterText interface used in hero-section/components/typewriter-text.tsx
export interface TypewriterTextComponentProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
}

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

// Alternative AnimatedCounter interface used in hero-section/components/animated-counter.tsx
export interface AnimatedCounterComponentProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export interface FlowStepProps {
  step: FlowStep;
  data: ReservationData;
  isActive: boolean;
  onNext: () => void;
  className?: string;
}

// =============================================================================
// NAVBAR COMPONENT PROPS
// =============================================================================

export interface ModernNavbarProps {
  className?: string;
  variant?: 'default' | 'sticky' | 'transparent';
  showCta?: boolean;
  onCtaClick?: () => void;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface NavigationPillProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

export interface NavigationPillItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}

export interface CTASectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface SmartNavigationPillProps {
  sections: string[];
  offset?: number;
  className?: string;
  threshold?: number;
}

// =============================================================================
// FEATURE AND CONTENT COMPONENT PROPS
// =============================================================================

export interface FeaturesGridProps {
  features?: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface TestimonialCarouselProps {
  testimonials: TestimonialData[];
  autoPlay?: boolean;
  showDots?: boolean;
  className?: string;
}

export interface UseCaseCardProps {
  title: string;
  description: string;
  features: string[];
  icon?: React.ComponentType<any>;
  imageUrl?: string;
  onSelect?: () => void;
  isSelected?: boolean;
  className?: string;
}

export interface UseCasesSimulatorProps {
  useCases: Array<{
    id: string;
    title: string;
    description: string;
    features: string[];
    scenario?: any;
  }>;
  onUseCaseSelect?: (id: string) => void;
  className?: string;
}

// =============================================================================
// PRICING COMPONENT PROPS
// =============================================================================

export interface PricingCardsProps {
  plans: PricingPlan[];
  billingCycle?: 'monthly' | 'yearly';
  onPlanSelect?: (planId: string) => void;
  highlightPlan?: string;
  className?: string;
  showFeatureComparison?: boolean;
}

// =============================================================================
// CAMPAIGN VALIDATION TYPES - Task 6.2 Implementation
// =============================================================================

export interface CampaignData {
  variant: 'A' | 'B';
  industry: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
  target_cpl: number;
  target_conversion: number;
  sessionId?: string;
  startTime?: Date;
}

export interface CampaignMetrics {
  visitors: number;
  leads: number;
  conversions: number;
  spend: number;
  cpl: number;
  conversionRate: number;
  onboardingCompletionRate: number;
  timeOnSite: number;
  bounceRate: number;
}

export interface AttributionData {
  firstTouch: {
    source: string;
    medium: string;
    campaign: string;
    timestamp: Date;
    url: string;
  };
  lastTouch: {
    source: string;
    medium: string;
    campaign: string;
    timestamp: Date;
    url: string;
  };
  touchpointCount: number;
  touchpoints: Array<{
    source: string;
    medium: string;
    campaign: string;
    timestamp: Date;
    url: string;
    type: 'page_view' | 'click' | 'form_interaction' | 'scroll' | 'time_spent';
  }>;
}

export interface CampaignEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  leadScore: number;
  campaignData: CampaignData;
}

export interface LeadScoringRules {
  pageView: number;
  timeOnSite30s: number;
  timeOnSite60s: number;
  scrollDepth50: number;
  scrollDepth75: number;
  ctaClick: number;
  pricingView: number;
  formStart: number;
  formFieldFill: number;
  formSubmit: number;
  demoRequest: number;
  testimonialView: number;
  featureClick: number;
  calculatorUse: number;
  emailClick: number;
  phoneClick: number;
}

export interface CampaignTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  variants: Array<{
    id: string;
    name: string;
    trafficSplit: number;
    conversionRate: number;
    participants: number;
    conversions: number;
  }>;
  hypothesis: string;
  successMetrics: Array<{
    metric: string;
    target: number;
    current: number;
  }>;
  statisticalSignificance: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface CampaignTarget {
  industry: string;
  geography: string[];
  demographics: {
    ageRange?: [number, number];
    gender?: 'all' | 'male' | 'female';
    interests?: string[];
    behaviors?: string[];
  };
  businessSize?: 'micro' | 'small' | 'medium' | 'large';
  painPoints: string[];
  channels: string[];
}

export interface CampaignROI {
  totalSpend: number;
  totalRevenue: number;
  totalLeads: number;
  cac: number; // Customer Acquisition Cost
  ltv: number; // Customer Lifetime Value
  ltvCacRatio: number;
  paybackPeriod: number; // in months
  roi: number; // Return on Investment percentage
  roas: number; // Return on Ad Spend
  marginContribution: number;
}

export interface CampaignFunnel {
  steps: Array<{
    stepName: string;
    visitors: number;
    dropoffCount: number;
    dropoffRate: number;
    conversionRate: number;
    timeSpent: number;
    topExitPages?: string[];
    improvements?: string[];
  }>;
  overallConversionRate: number;
  biggestBottleneck: {
    stepName: string;
    dropoffRate: number;
    improvementOpportunity: number;
  };
}

export interface FeedbackData {
  campaignId: string;
  variant: 'A' | 'B';
  feedbackType: 'campaign_experience' | 'product_interest' | 'nps' | 'exit_intent';
  rating?: number;
  comments?: string;
  suggestions?: string;
  likelihood_to_recommend?: number;
  pain_points?: string[];
  feature_requests?: string[];
  timestamp: Date;
  sessionId: string;
  leadScore: number;
}

export interface CampaignSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    industry?: string[];
    company_size?: string[];
    location?: string[];
    utm_source?: string[];
    device_type?: string[];
    lead_score_min?: number;
    behavior_tags?: string[];
  };
  performance: {
    visitors: number;
    conversions: number;
    conversionRate: number;
    cpl: number;
    ltv: number;
  };
}

// Utility types
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
export type CampaignObjective = 'lead_generation' | 'brand_awareness' | 'traffic' | 'conversions' | 'engagement';
export type CampaignChannel = 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'twitter_ads' | 'email' | 'organic' | 'referral' | 'direct';
export type CampaignVertical = 'restaurant' | 'dental' | 'clinic' | 'childcare' | 'ecommerce' | 'professional_services';

// Event types for tracking
export interface CampaignEventTypes {
  // Page events
  'campaign_page_view': {
    page_path: string;
    page_title: string;
    referrer?: string;
  };

  // User engagement
  'campaign_scroll_depth': {
    depth_percent: number;
    time_to_depth: number;
  };

  'campaign_time_engagement': {
    time_spent: number;
    engaged_time: number;
  };

  // CTA interactions
  'campaign_cta_click': {
    cta_text: string;
    cta_position: string;
    cta_variant?: string;
  };

  // Form events
  'campaign_form_start': {
    form_id: string;
    form_type: string;
  };

  'campaign_form_submit': {
    form_id: string;
    form_type: string;
    lead_data: Record<string, any>;
  };

  // Attribution events
  'campaign_attribution': {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    attribution_type: 'first_touch' | 'last_touch' | 'multi_touch';
  };

  // Lead scoring
  'campaign_lead_qualified': {
    lead_score: number;
    qualification_level: 'cold' | 'warm' | 'hot';
  };

  // Exit intent
  'campaign_exit_intent': {
    trigger: 'mouse_leave' | 'back_button' | 'tab_close';
    time_spent: number;
  };
}

// Campaign component prop types
export interface CampaignHeroSectionProps {
  variant: 'restaurant_roi' | 'restaurant_simplicity' | 'dental' | 'clinic';
  headline: string;
  subheadline: string;
  heroImage: string;
  ctaText: string;
  ctaVariant: 'roi_calculator' | 'get_started' | 'demo_request';
  socialProof: {
    customerCount: string;
    industryFocus: string;
    avgIncrease?: string;
    setupTime?: string;
    timeToValue?: string;
    satisfaction?: string;
  };
  campaignData: CampaignData;
}

export interface CampaignTestimonialsProps {
  industry: string;
  variant?: 'default' | 'simplicity_focused';
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    location: string;
    avatar: string;
    content: string;
    metrics: Record<string, string>;
    verified: boolean;
  }>;
  campaignData: CampaignData;
  simplicityStats?: {
    averageSetupTime: string;
    satisfactionRate: number;
    noTechKnowledge: number;
  };
}

export interface CampaignPricingProps {
  variant: 'restaurant_campaign' | 'restaurant_simplicity' | 'dental' | 'clinic';
  industry: string;
  campaignOffer: {
    discountPercent: number;
    validUntil: Date;
    bonusFeatures: string[];
  };
  roiGuarantee?: {
    timeframe: string;
    minIncrease: string;
    moneyBackGuarantee: boolean;
  };
  simplicityGuarantee?: {
    setupTime: string;
    moneyBackGuarantee: string;
    noTechRequired: string;
  };
  campaignData: CampaignData;
}

export interface CampaignCTASectionProps {
  variant: 'urgency' | 'simplicity_urgency' | 'roi_focused';
  headline: string;
  subheadline: string;
  ctaText: string;
  urgencyTimer: boolean;
  campaignData: CampaignData;
  riskReduction?: {
    freeTrialDays: number;
    moneyBackGuarantee: number;
    noSetupFees: boolean;
    cancelAnytime: boolean;
  };
  simplicityPromise?: {
    timeGuarantee: string;
    difficultyLevel: string;
    support: string;
    noCommitment: string;
  };
}

export interface FeedbackWidgetProps {
  campaignData: CampaignData;
  feedbackType: 'campaign_experience' | 'product_interest' | 'nps' | 'exit_intent';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'inline';
  variant?: 'default' | 'simplicity_focused';
}

// =============================================================================
// NAVBAR V2 TYPES - Extracted and consolidated from navbar-v2 components
// =============================================================================

// Navigation types used in navbar-v2/navigation-pill.tsx and other navbar components
export interface NavigationPillItemProps {
  item: NavigationItem;
  isActive: boolean;
  onClick: () => void;
}

// =============================================================================
// CHAT MESSAGE COMPONENT TYPES - From chat-messages.tsx
// =============================================================================

export interface ChatMessageProps {
  message: string;
  isFromBot: boolean;
  isRead?: boolean;
  isVisible: boolean;
  timestamp?: string;
  className?: string;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
  isFromBot?: boolean;
  className?: string;
}

export interface ChatMessagesContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface CustomerMessage1Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export interface BotMessage1Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export interface CustomerMessage2Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export interface BotMessage2Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export interface HeroChatMessagesProps {
  // Message visibility states
  showMessage1: boolean;
  showMessage2: boolean;
  showBotMessage1: boolean;
  showBotMessage2: boolean;

  // Read states
  message1Read: boolean;
  message2Read: boolean;

  // Typing states
  isCustomerTyping: boolean;
  isBotTyping: boolean;

  // Optional customization
  className?: string;
}

// =============================================================================
// EDUCATIONAL BADGE COMPONENT TYPES - From educational-badge.tsx
// =============================================================================

export interface EducationalBadgeProps {
  badge: DynamicBadge;
  isVisible: boolean;
  className?: string;
  onBadgeClick?: (badge: DynamicBadge) => void;
}

export interface BadgeIconProps {
  icon: React.ComponentType<any>;
  className?: string;
}

export interface BadgeContentProps {
  title: string;
  subtitle: string;
  className?: string;
}

export interface BadgeArrowProps {
  direction: ArrowDirection;
  color: string;
  className?: string;
}

export interface AIBadgeProps {
  isVisible: boolean;
  className?: string;
  onBadgeClick?: () => void;
}

export interface BadgeContainerProps {
  children: React.ReactNode;
  className?: string;
}

export interface MultipleBadgesProps {
  badges: DynamicBadge[];
  activeBadgeId: string | null;
  className?: string;
  onBadgeClick?: (badge: DynamicBadge) => void;
}

// =============================================================================
// FEATURES GRID COMPONENT TYPES - From features-grid.tsx
// =============================================================================

export interface Feature {
  title: string;
  description: string;
  icon: string; // keyof typeof featureIcons from lib/icons
  benefits: string[];
  badge?: string;
}

export interface FeaturesGridComponentProps {
  features?: Feature[];
}

// =============================================================================
// HERO SECTION COMPONENT TYPES - From hero-section/components
// =============================================================================

export interface HeroComparisonProps {
  isInView: boolean;
  className?: string;
}

export interface ComparisonStats {
  originalLoops: number;
  v2Loops: number;
  startTime: number;
  isRunning: boolean;
}

// =============================================================================
// OPTIMIZED MOBILE MENU TYPES - From navbar-v2/optimized-mobile-menu.tsx
// =============================================================================

export interface OptimizedNavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
  icon?: React.ComponentType<any>;
  description?: string;
}

export interface CTAConfig {
  signIn: {
    text: string;
    href: string;
  };
  primary: {
    text: string;
    href: string;
    icon?: React.ComponentType<any>;
  };
}

export interface OptimizedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: OptimizedNavigationItem[];
  ctaConfig: CTAConfig;
  className?: string;
  logoText?: string;
  // Accessibility props
  reducedMotion?: boolean;
  highContrast?: boolean;
  screenReaderActive?: boolean;
}