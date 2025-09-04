/**
 * Functional Conversation Factory - Pure factory functions following Clean Architecture
 * Replaced class-based approach with functional composition and dependency injection
 */

import {
  Conversation,
  ConversationMetadata,
  createConversation,
  createMessage,
  Message,
  MessageType,
  SenderType} from '../../domain/entities';


export interface MessageTemplate {
  sender: SenderType;
  type: MessageType;
  content: any;
  delayBeforeTyping?: number;
  typingDuration?: number;
}

export interface ConversationTemplate {
  metadata: Omit<ConversationMetadata, 'id' | 'estimatedDuration' | 'createdAt' | 'updatedAt'>;
  messages: MessageTemplate[];
  settings?: ConversationSettings;
}

export interface ConversationSettings {
  playbackSpeed?: number;
  autoAdvance?: boolean;
  showTypingIndicators?: boolean;
  showReadReceipts?: boolean;
}

// Factory configuration interfaces
export interface FactoryConfig {
  messageIdGenerator: () => string;
  conversationIdGenerator: () => string;
  timestampProvider: () => Date;
  delayCalculator: DelayCalculator;
  typingDurationCalculator: TypingDurationCalculator;
}

export interface DelayCalculator {
  getDefaultDelay: (sender: SenderType, index: number) => number;
}

export interface TypingDurationCalculator {
  getDefaultTypingDuration: (content: any, type: MessageType) => number;
}

/**
 * Scenario configuration interface for type-safe scenario definitions
 */
export interface ScenarioConfig {
  id: string;
  metadata: Omit<ConversationMetadata, 'id' | 'estimatedDuration' | 'createdAt' | 'updatedAt'>;
  messages: MessageTemplate[];
  settings?: ConversationSettings;
  educationalBadges?: any[]; // Extended for educational scenarios
  flowSteps?: any[]; // Extended for flow scenarios
  timing?: any; // Extended for animation scenarios
}

/**
 * Scenario factory function type definition
 */
export type ScenarioFactory = (config?: FactoryConfig) => Conversation;

/**
 * Pure function to calculate default delay based on sender and position
 */
export const calculateDefaultDelay = (sender: SenderType, index: number): number => {
  const baseDelay = index === 0 ? 500 : 1500; // First message is quicker
  const senderMultiplier = sender === 'business' ? 1.2 : 1.0;
  return Math.round(baseDelay * senderMultiplier);
};

/**
 * Pure function to calculate typing duration based on content and type
 */
export const calculateTypingDuration = (content: any, type: MessageType): number => {
  switch (type) {
    case 'text':
      const textLength = content.text?.length || 0;
      return Math.max(800, Math.min(4000, textLength * 50)); // 50ms per character
    case 'image':
    case 'video':
      return 2500;
    case 'audio':
      return 1800;
    case 'document':
      return 2000;
    case 'interactive':
      return 3000;
    case 'template':
      return 2200;
    case 'flow':
      return 3500;
    default:
      return 1500;
  }
};

/**
 * Counter-based ID generators (with closure for state)
 */
let messageIdCounter = 1;
let conversationIdCounter = 1;

export const createMessageIdGenerator = (): (() => string) => {
  return () => `msg_${messageIdCounter++}`;
};

export const createConversationIdGenerator = (): (() => string) => {
  return () => `conv_${conversationIdCounter++}`;
};

/**
 * Default delay calculator implementation
 */
export const createDefaultDelayCalculator = (): DelayCalculator => ({
  getDefaultDelay: calculateDefaultDelay
});

/**
 * Default typing duration calculator implementation
 */
export const createDefaultTypingDurationCalculator = (): TypingDurationCalculator => ({
  getDefaultTypingDuration: calculateTypingDuration
});

/**
 * Default factory configuration with dependency injection
 */
export const createDefaultFactoryConfig = (): FactoryConfig => ({
  messageIdGenerator: createMessageIdGenerator(),
  conversationIdGenerator: createConversationIdGenerator(),
  timestampProvider: () => new Date(),
  delayCalculator: createDefaultDelayCalculator(),
  typingDurationCalculator: createDefaultTypingDurationCalculator()
});

/**
 * Pure function to create a message from template with dependency injection
 */
export const createMessageFromTemplate = (
  template: MessageTemplate,
  index: number,
  config: FactoryConfig
): Message => {
  const messageId = config.messageIdGenerator();
  const now = config.timestampProvider();

  // Calculate queue time based on index
  const queueAt = new Date(now.getTime() + (index * 2000));

  return createMessage({
    id: messageId,
    type: template.type,
    sender: template.sender,
    content: template.content,
    timing: {
      queueAt,
      delayBeforeTyping: template.delayBeforeTyping ||
        config.delayCalculator.getDefaultDelay(template.sender, index),
      typingDuration: template.typingDuration ||
        config.typingDurationCalculator.getDefaultTypingDuration(template.content, template.type)
    },
    status: 'sending',
    createdAt: now
  });
};

/**
 * Pure function to create conversation from template with dependency injection
 */
export const createConversationFromTemplate = (
  template: ConversationTemplate,
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation => {
  const conversationId = config.conversationIdGenerator();
  const now = config.timestampProvider();

  const metadata: ConversationMetadata = {
    id: conversationId,
    estimatedDuration: 0, // Will be calculated
    createdAt: now,
    updatedAt: now,
    ...template.metadata
  };

  const messages = template.messages.map((msgTemplate, index) =>
    createMessageFromTemplate(msgTemplate, index, config)
  );

  return createConversation(metadata, messages, template.settings);
};

/**
 * Create a scenario configuration with immutable defaults
 */
export const createScenarioConfig = (config: Partial<ScenarioConfig> & { id: string }): ScenarioConfig => {
  return {
    metadata: {
      title: 'Default Scenario',
      description: 'A sample conversation scenario',
      tags: ['demo'],
      businessName: 'Demo Business',
      businessPhoneNumber: '+1234567890',
      userPhoneNumber: '+1987654321',
      language: 'en',
      category: 'demo',
      ...config.metadata
    },
    messages: [],
    settings: {
      playbackSpeed: 1.0,
      autoAdvance: true,
      showTypingIndicators: true,
      showReadReceipts: true,
      ...config.settings
    },
    ...config
  };
};

/**
 * Pure function to create a conversation from scenario configuration
 */
export const createConversationFromScenario = (
  scenarioConfig: ScenarioConfig,
  factoryConfig?: FactoryConfig
): Conversation => {
  const template: ConversationTemplate = {
    metadata: scenarioConfig.metadata,
    messages: scenarioConfig.messages,
    settings: scenarioConfig.settings
  };

  return createConversationFromTemplate(template, factoryConfig);
};

/**
 * Pure function to create booking conversation template
 */
export const createBookingConversationTemplate = (): ConversationTemplate => ({
  metadata: {
    title: 'Restaurant Booking Demo',
    description: 'Sample conversation showing restaurant booking flow',
    tags: ['booking', 'restaurant', 'demo'],
    businessName: 'Bella Vista Restaurant',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'en',
    category: 'hospitality'
  },
  messages: [
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Hi! I\'d like to make a reservation for tonight' }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'Hello! I\'d be happy to help you with a reservation. How many people will be joining you?' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'It\'s for 2 people' }
    },
    {
      sender: 'business',
      type: 'interactive',
      content: {
        interactive: {
          type: 'button',
          body: 'Perfect! What time would you prefer?',
          action: {
            buttons: [
              { id: '6pm', title: '6:00 PM' },
              { id: '7pm', title: '7:00 PM' },
              { id: '8pm', title: '8:00 PM' }
            ]
          }
        }
      }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: '7:00 PM sounds great!' }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'Excellent choice! Let me check our availability for 7:00 PM for 2 people...' },
      typingDuration: 3000
    },
    {
      sender: 'business',
      type: 'template',
      content: {
        template: {
          name: 'booking_confirmation',
          language: 'en',
          components: [
            {
              type: 'header',
              parameters: [{ type: 'text', text: 'Booking Confirmed!' }]
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'Bella Vista Restaurant' },
                { type: 'text', text: 'Tonight at 7:00 PM' },
                { type: 'text', text: '2 guests' }
              ]
            }
          ]
        }
      }
    },
    {
      sender: 'business',
      type: 'location',
      content: {
        location: {
          latitude: 40.7829,
          longitude: -73.9654,
          name: 'Bella Vista Restaurant',
          address: '123 Main St, New York, NY 10001'
        }
      }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Thank you so much! See you tonight 🎉' }
    }
  ],
  settings: {
    playbackSpeed: 1.0,
    showTypingIndicators: true,
    showReadReceipts: true
  }
});

/**
 * Factory function to create booking conversation
 */
export const createBookingConversation = (
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation =>
  createConversationFromTemplate(createBookingConversationTemplate(), config);

/**
 * Pure function to create support conversation template
 */
export const createSupportConversationTemplate = (): ConversationTemplate => ({
  metadata: {
    title: 'Customer Support Demo',
    description: 'Sample conversation showing customer support flow',
    tags: ['support', 'technical', 'demo'],
    businessName: 'TechCorp Support',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'en',
    category: 'support'
  },
  messages: [
    {
      sender: 'user',
      type: 'text',
      content: { text: 'I\'m having trouble with my account login' }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'I\'m sorry to hear you\'re having login issues. I\'m here to help! Can you tell me what happens when you try to log in?' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'I enter my email and password but it says "invalid credentials"' }
    },
    {
      sender: 'business',
      type: 'interactive',
      content: {
        interactive: {
          type: 'list',
          body: 'Let\'s try a few troubleshooting steps. Which would you like to try first?',
          action: {
            sections: [
              {
                title: 'Quick Fixes',
                rows: [
                  { id: 'reset_password', title: 'Reset Password', description: 'Get a new password via email' },
                  { id: 'check_email', title: 'Verify Email', description: 'Make sure you\'re using the right email' },
                  { id: 'clear_cache', title: 'Clear Cache', description: 'Clear browser cache and cookies' }
                ]
              }
            ]
          }
        }
      }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Let me try resetting my password' }
    },
    {
      sender: 'business',
      type: 'flow',
      content: {
        flow: {
          flowId: 'password_reset_flow',
          flowToken: 'pwd_reset_123',
          flowData: {
            userId: 'user_12345',
            supportTicket: 'SUP-001'
          }
        }
      }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'I\'ve initiated a password reset for your account. You should receive an email shortly with instructions. Please check your inbox and spam folder.' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Got it! The email just arrived. Thanks for the quick help!' }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'You\'re very welcome! Is there anything else I can help you with today?' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'No, that\'s all. Great service! 👍' }
    }
  ],
  settings: {
    playbackSpeed: 1.2,
    showTypingIndicators: true,
    showReadReceipts: true
  }
});

/**
 * Factory function to create support conversation
 */
export const createSupportConversation = (
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation =>
  createConversationFromTemplate(createSupportConversationTemplate(), config);

/**
 * Pure function to create e-commerce conversation template
 */
export const createEcommerceConversationTemplate = (): ConversationTemplate => ({
  metadata: {
    title: 'Product Inquiry Demo',
    description: 'Sample conversation showing product inquiry and purchase flow',
    tags: ['ecommerce', 'product', 'demo'],
    businessName: 'StyleHub Fashion',
    businessPhoneNumber: '+1234567890',
    userPhoneNumber: '+1987654321',
    language: 'en',
    category: 'retail'
  },
  messages: [
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Do you have this jacket in size M?' }
    },
    {
      sender: 'user',
      type: 'image',
      content: {
        media: {
          url: 'https://example.com/jacket.jpg',
          caption: 'Looking for this in medium'
        }
      }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'Great choice! That\'s our bestselling leather jacket. Let me check our inventory for size M...' },
      typingDuration: 2500
    },
    {
      sender: 'business',
      type: 'interactive',
      content: {
        interactive: {
          type: 'button',
          body: 'Good news! We have it in stock in size M. The price is $199. Would you like to purchase it?',
          action: {
            buttons: [
              { id: 'buy_now', title: '🛒 Buy Now' },
              { id: 'add_cart', title: '🛍️ Add to Cart' },
              { id: 'more_info', title: 'ℹ️ More Info' }
            ]
          }
        }
      }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Can I see more details first?' }
    },
    {
      sender: 'business',
      type: 'template',
      content: {
        template: {
          name: 'product_details',
          language: 'en',
          components: [
            {
              type: 'header',
              parameters: [{ type: 'image', image: { link: 'https://example.com/jacket-detail.jpg' } }]
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'Premium Leather Jacket' },
                { type: 'text', text: '$199.00' },
                { type: 'text', text: '100% Genuine Leather' },
                { type: 'text', text: 'Available in Black, Brown' },
                { type: 'text', text: 'Free shipping & 30-day returns' }
              ]
            }
          ]
        }
      }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'This jacket is made from premium genuine leather with a classic design. Perfect for both casual and formal occasions. Would you like to proceed with the purchase?' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Yes, I\'ll take it! Can you send me the payment link?' }
    },
    {
      sender: 'business',
      type: 'flow',
      content: {
        flow: {
          flowId: 'checkout_flow',
          flowToken: 'checkout_789',
          flowData: {
            productId: 'jacket_001',
            size: 'M',
            price: 199.00,
            customerId: 'cust_456'
          }
        }
      }
    },
    {
      sender: 'business',
      type: 'text',
      content: { text: 'Perfect! I\'ve sent you a secure payment link. Once payment is confirmed, we\'ll ship your jacket within 1-2 business days. You\'ll receive tracking information via WhatsApp.' }
    },
    {
      sender: 'user',
      type: 'text',
      content: { text: 'Awesome! Payment completed. Thanks for the great service! 🙌' }
    }
  ],
  settings: {
    playbackSpeed: 1.1,
    showTypingIndicators: true,
    showReadReceipts: true
  }
});

/**
 * Factory function to create e-commerce conversation
 */
export const createEcommerceConversation = (
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation =>
  createConversationFromTemplate(createEcommerceConversationTemplate(), config);

/**
 * Pure function to get all sample conversations
 */
export const getAllSampleConversations = (
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation[] => [
  createBookingConversation(config),
  createSupportConversation(config),
  createEcommerceConversation(config)
];

/**
 * Pure function to get sample user message by index
 */
export const getSampleUserMessage = (index: number): string => {
  const messages = [
    'Hi there! I need some help.',
    'That sounds perfect!',
    'Can you give me more details?',
    'I\'d like to proceed with this.',
    'Thank you so much!',
    'Great service!',
    'This is exactly what I needed.',
    'I appreciate the quick response.'
  ];
  return messages[index % messages.length];
};

/**
 * Pure function to get sample business message by index
 */
export const getSampleBusinessMessage = (index: number): string => {
  const messages = [
    'Hello! Welcome to our service. How can I assist you today?',
    'I\'d be happy to help you with that. Let me check our options.',
    'Here are the details you requested. Everything looks good to go!',
    'Excellent choice! I\'ll get that set up for you right away.',
    'You\'re very welcome! Is there anything else I can help you with?',
    'Thank you for choosing our service. We appreciate your business!',
    'Perfect! Your request has been processed successfully.',
    'It was my pleasure to assist you today. Have a great day!'
  ];
  return messages[index % messages.length];
};

/**
 * Pure function to generate messages based on count
 */
export const generateSampleMessages = (messageCount: number): MessageTemplate[] => {
  const messages: MessageTemplate[] = [];

  for (let i = 0; i < messageCount; i++) {
    if (i % 2 === 0) {
      // User messages
      messages.push({
        sender: 'user',
        type: 'text',
        content: { text: getSampleUserMessage(i / 2) }
      });
    } else {
      // Business messages
      messages.push({
        sender: 'business',
        type: 'text',
        content: { text: getSampleBusinessMessage(Math.floor(i / 2)) }
      });
    }
  }

  return messages;
};

/**
 * Factory function to create a sample conversation with configurable parameters
 */
export interface SampleConversationConfig {
  businessName?: string;
  businessPhoneNumber?: string;
  title?: string;
  messageCount?: number;
  factoryConfig?: FactoryConfig;
}

export const createSampleConversation = ({
  businessName = 'Demo Business',
  businessPhoneNumber = '+1234567890',
  title = 'Sample Chat',
  messageCount = 8,
  factoryConfig = createDefaultFactoryConfig()
}: SampleConversationConfig = {}): Conversation => {

  const template: ConversationTemplate = {
    metadata: {
      title,
      description: 'Dynamically generated sample conversation',
      tags: ['demo', 'sample'],
      businessName,
      businessPhoneNumber,
      userPhoneNumber: '+1987654321',
      language: 'en',
      category: 'demo'
    },
    messages: generateSampleMessages(messageCount),
    settings: {
      playbackSpeed: 1.0,
      showTypingIndicators: true,
      showReadReceipts: true
    }
  };

  return createConversationFromTemplate(template, factoryConfig);
};

/**
 * Reset ID counters (useful for testing)
 * This breaks immutability but is needed for deterministic testing
 */
export const resetFactoryCounters = (): void => {
  messageIdCounter = 1;
  conversationIdCounter = 1;
};

/**
 * Create test-friendly factory config with predictable IDs
 */
export const createTestFactoryConfig = (): FactoryConfig => ({
  messageIdGenerator: () => `test_msg_${messageIdCounter++}`,
  conversationIdGenerator: () => `test_conv_${conversationIdCounter++}`,
  timestampProvider: () => new Date('2024-01-01T00:00:00Z'),
  delayCalculator: createDefaultDelayCalculator(),
  typingDurationCalculator: createDefaultTypingDurationCalculator()
});

import { createRestaurantReservationConversation } from '../../scenarios/restaurant-reservation-scenario';

/**
 * Scenario registry - pure object configuration
 */
export const scenarioRegistry: Record<string, ScenarioFactory> = {
  'restaurant-reservation': (config?: FactoryConfig) => createRestaurantReservationConversation(),
  'booking': (config?: FactoryConfig) => createBookingConversation(config),
  'support': (config?: FactoryConfig) => createSupportConversation(config),
  'ecommerce': (config?: FactoryConfig) => createEcommerceConversation(config),
  // Temporarily disabled scenarios
  // 'loyalty-program': createLoyaltyProgramConversation,
  // 'medical-appointments': createMedicalAppointmentsConversation,
  // 'restaurant-orders': createRestaurantOrdersConversation,
};

/**
 * Pure function to create conversation for a given scenario ID with error handling
 */
export const createConversationForScenario = (
  scenarioId: string,
  config: FactoryConfig = createDefaultFactoryConfig()
): Conversation => {
  const factory = scenarioRegistry[scenarioId];

  if (!factory) {
    console.warn(`[Scenario] No factory found for scenario: ${scenarioId}, falling back to restaurant-reservation`);
    return scenarioRegistry['restaurant-reservation'](config);
  }

  try {
    console.log(`[Scenario] Creating conversation for scenario: ${scenarioId}`);
    return factory(config);
  } catch (error) {
    console.error(`[Scenario] Error creating conversation for scenario ${scenarioId}:`, error);
    // Fallback to restaurant reservation
    return scenarioRegistry['restaurant-reservation'](config);
  }
};

/**
 * Pure function to get all available scenario IDs
 */
export const getAvailableScenarios = (): string[] =>
  Object.keys(scenarioRegistry);

/**
 * Pure function to check if a scenario is available
 */
export const hasScenario = (scenarioId: string): boolean =>
  scenarioId in scenarioRegistry;

/**
 * Register a new scenario factory function
 */
export const registerScenario = (
  scenarioId: string,
  factory: ScenarioFactory
): void => {
  scenarioRegistry[scenarioId] = factory;
};

/**
 * Modern functional scenario API (recommended)
 * Provides a clean, functional interface for scenario operations
 */
export const scenarios = {
  /**
   * Create conversation for a scenario ID using functional API
   */
  createConversation: (scenarioId: string): Conversation => {
    return createConversationForScenario(scenarioId);
  },

  /**
   * Get all available scenario IDs
   */
  getAvailableScenarios: (): string[] => getAvailableScenarios(),

  /**
   * Check if scenario is available
   */
  hasScenario: (scenarioId: string): boolean => hasScenario(scenarioId),

  /**
   * Register a new scenario factory function
   */
  registerScenario: (scenarioId: string, factory: ScenarioFactory): void => {
    registerScenario(scenarioId, factory);
  }
};


/**
 * @deprecated Use functional factories instead. This class will be removed in v2.0
 * Backward compatibility wrapper around functional implementation
 *
 * Migration guide:
 * - ConversationFactory.createFromTemplate(template) → createConversationFromTemplate(template)
 * - ConversationFactory.createBookingConversation() → createBookingConversation()
 * - ConversationFactory.createSupportConversation() → createSupportConversation()
 * - ConversationFactory.createEcommerceConversation() → createEcommerceConversation()
 */
export class ConversationFactory {
  private static messageIdCounter = 1;
  private static conversationIdCounter = 1;

  /**
   * @deprecated Use createConversationFromTemplate instead
   */
  static createFromTemplate(template: ConversationTemplate): Conversation {
    console.warn('[DEPRECATED] ConversationFactory.createFromTemplate is deprecated. Use createConversationFromTemplate instead.');
    return createConversationFromTemplate(template);
  }

  /**
   * @deprecated Use createBookingConversation instead
   */
  static createBookingConversation(): Conversation {
    console.warn('[DEPRECATED] ConversationFactory.createBookingConversation is deprecated. Use createBookingConversation instead.');
    return createBookingConversation();
  }

  /**
   * @deprecated Use createSupportConversation instead
   */
  static createSupportConversation(): Conversation {
    console.warn('[DEPRECATED] ConversationFactory.createSupportConversation is deprecated. Use createSupportConversation instead.');
    return createSupportConversation();
  }

  /**
   * @deprecated Use createEcommerceConversation instead
   */
  static createEcommerceConversation(): Conversation {
    console.warn('[DEPRECATED] ConversationFactory.createEcommerceConversation is deprecated. Use createEcommerceConversation instead.');
    return createEcommerceConversation();
  }

  /**
   * @deprecated Use getAllSampleConversations instead
   */
  static getAllSampleConversations(): Conversation[] {
    console.warn('[DEPRECATED] ConversationFactory.getAllSampleConversations is deprecated. Use getAllSampleConversations instead.');
    return getAllSampleConversations();
  }

  /**
   * @deprecated Use createSampleConversation instead
   */
  static createSampleConversation(config: {
    businessName?: string;
    businessPhoneNumber?: string;
    title?: string;
    messageCount?: number;
  }): Conversation {
    console.warn('[DEPRECATED] ConversationFactory.createSampleConversation is deprecated. Use createSampleConversation instead.');
    return createSampleConversation(config);
  }

  /**
   * @deprecated Use resetFactoryCounters instead
   */
  static resetCounters(): void {
    console.warn('[DEPRECATED] ConversationFactory.resetCounters is deprecated. Use resetFactoryCounters instead.');
    resetFactoryCounters();
  }

  private static createMessage(template: MessageTemplate, index: number): Message {
    return createMessageFromTemplate(template, index, createDefaultFactoryConfig());
  }

  private static getDefaultDelay(sender: SenderType, index: number): number {
    return calculateDefaultDelay(sender, index);
  }

  private static getDefaultTypingDuration(content: any, type: MessageType): number {
    return calculateTypingDuration(content, type);
  }

  private static getSampleUserMessage(index: number): string {
    return getSampleUserMessage(index);
  }

  private static getSampleBusinessMessage(index: number): string {
    return getSampleBusinessMessage(index);
  }
}


/**
 * @deprecated Use functional scenario functions instead. This class will be removed in v2.0
 *
 * Migration guide:
 * - ScenarioConversationFactory.createConversationForScenario(id) → createConversationForScenario(id)
 * - ScenarioConversationFactory.getAvailableScenarios() → getAvailableScenarios()
 * - ScenarioConversationFactory.hasScenario(id) → hasScenario(id)
 */
export class ScenarioConversationFactory {
  /**
   * @deprecated Use createConversationForScenario instead
   */
  static createConversationForScenario(scenarioId: string): Conversation {
    console.warn('[DEPRECATED] ScenarioConversationFactory.createConversationForScenario is deprecated. Use createConversationForScenario instead.');
    return createConversationForScenario(scenarioId);
  }

  /**
   * @deprecated Use getAvailableScenarios instead
   */
  static getAvailableScenarios(): string[] {
    console.warn('[DEPRECATED] ScenarioConversationFactory.getAvailableScenarios is deprecated. Use getAvailableScenarios instead.');
    return getAvailableScenarios();
  }

  /**
   * @deprecated Use hasScenario instead
   */
  static hasScenario(scenarioId: string): boolean {
    console.warn('[DEPRECATED] ScenarioConversationFactory.hasScenario is deprecated. Use hasScenario instead.');
    return hasScenario(scenarioId);
  }
}

/**
 * Factory instances for easy importing
 */
export const conversationFactory = ConversationFactory;

/**
 * @deprecated Use functional `scenarios` API instead
 * Legacy alias for backward compatibility
 */
export const scenarioFactory = ScenarioConversationFactory;

/**
 * Modern functional scenario API (recommended)
 */
export const scenarioApi = scenarios;


