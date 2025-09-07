/**
 * WhatsApp Business API Features Types
 * Types for real WhatsApp Business API features used in simulations
 */

/**
 * Quick Reply Button - Max 3 buttons, 25 chars each
 */
export interface QuickReplyButton {
  id: string;
  text: string; // Max 25 characters
  icon?: string;
}

/**
 * WhatsApp Flow Step Types
 */
export type FlowStepType = 
  | 'text-input'
  | 'number-input'
  | 'date-picker'
  | 'time-picker'
  | 'single-select'
  | 'multi-select'
  | 'dropdown'
  | 'checkbox';

/**
 * WhatsApp Flow Step
 */
export interface WhatsAppFlowStep {
  id: string;
  type: FlowStepType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: string | number;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * WhatsApp Flow Definition
 */
export interface WhatsAppFlow {
  id: string;
  title: string;
  description?: string;
  steps: WhatsAppFlowStep[];
  submitButton: {
    text: string;
    color?: string;
  };
}

/**
 * Product for Catalog
 */
export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category?: string;
  inStock: boolean;
  badge?: string; // e.g., "Nuevo", "Oferta", "Más vendido"
}

/**
 * Shopping Cart Item
 */
export interface CartItem {
  product: CatalogProduct;
  quantity: number;
}

/**
 * Shopping Cart
 */
export interface ShoppingCart {
  items: CartItem[];
  total: number;
  currency: string;
  itemCount: number;
}

/**
 * Message Template Types
 */
export type MessageTemplateType = 
  | 'marketing'
  | 'utility'
  | 'authentication';

/**
 * Message Template with media and buttons
 */
export interface MessageTemplate {
  id: string;
  type: MessageTemplateType;
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    content: string; // Text or URL
  };
  body: string;
  footer?: string;
  buttons?: QuickReplyButton[];
  callToAction?: {
    type: 'url' | 'phone';
    text: string;
    value: string;
  };
}

/**
 * List Message Option
 */
export interface ListMessageOption {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

/**
 * List Message Section
 */
export interface ListMessageSection {
  title: string;
  rows: ListMessageOption[];
}

/**
 * List Message
 */
export interface ListMessage {
  id: string;
  header?: string;
  body: string;
  footer?: string;
  buttonText: string; // Text for the button that opens the list
  sections: ListMessageSection[];
}

/**
 * Loyalty Points Update
 */
export interface LoyaltyPointsUpdate {
  previousPoints: number;
  pointsAdded: number;
  newTotal: number;
  reason: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints?: number;
}

/**
 * Loyalty Reward
 */
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  available: boolean;
  expiresAt?: string;
}

/**
 * Use Case Scenario Type
 */
export type UseCaseScenarioType = 
  | 'restaurant-reservation'
  | 'restaurant-orders'
  | 'medical-appointments'
  | 'loyalty-program';

/**
 * Animation Configuration
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
}

/**
 * WhatsApp Message Types for Simulation
 */
export type WhatsAppMessageType = 
  | 'text'
  | 'template'
  | 'flow'
  | 'catalog'
  | 'list'
  | 'quick-reply'
  | 'cart'
  | 'points-update';

/**
 * Base WhatsApp Message
 */
export interface WhatsAppMessage {
  id: string;
  type: WhatsAppMessageType;
  sender: 'customer' | 'bot';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  content?: string;
  template?: MessageTemplate;
  flow?: WhatsAppFlow;
  catalog?: CatalogProduct[];
  listMessage?: ListMessage;
  quickReplyButtons?: QuickReplyButton[];
  cart?: ShoppingCart;
  pointsUpdate?: LoyaltyPointsUpdate;
  animation?: AnimationConfig;
}

/**
 * Conversation Scenario
 */
export interface ConversationScenario {
  id: UseCaseScenarioType;
  title: string;
  businessName: string;
  description: string;
  messages: WhatsAppMessage[];
  features: string[]; // List of WhatsApp features showcased
  duration: number; // Total animation duration in ms
}