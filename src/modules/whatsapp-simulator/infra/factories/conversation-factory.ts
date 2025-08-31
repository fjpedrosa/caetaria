/**
 * ConversationFactory - Factory for creating sample conversations
 */

import {
  Conversation,
  ConversationMetadata,
  Message,
  MessageType,
  SenderType
} from '../../domain/entities';

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
  settings?: {
    playbackSpeed?: number;
    autoAdvance?: boolean;
    showTypingIndicators?: boolean;
    showReadReceipts?: boolean;
  };
}

export class ConversationFactory {
  private static messageIdCounter = 1;
  private static conversationIdCounter = 1;

  /**
   * Create a conversation from a template
   */
  static createFromTemplate(template: ConversationTemplate): Conversation {
    const conversationId = `conv_${this.conversationIdCounter++}`;
    const now = new Date();

    const metadata: ConversationMetadata = {
      id: conversationId,
      estimatedDuration: 0, // Will be calculated
      createdAt: now,
      updatedAt: now,
      ...template.metadata
    };

    const messages = template.messages.map((msgTemplate, index) => {
      return this.createMessage(msgTemplate, index);
    });

    const conversation = new Conversation(metadata, messages, template.settings);

    return conversation;
  }

  /**
   * Create a message from template
   */
  private static createMessage(template: MessageTemplate, index: number): Message {
    const messageId = `msg_${this.messageIdCounter++}`;
    const now = new Date();

    // Calculate queue time based on index
    const queueAt = new Date(now.getTime() + (index * 2000));

    return new Message({
      id: messageId,
      type: template.type,
      sender: template.sender,
      content: template.content,
      timing: {
        queueAt,
        delayBeforeTyping: template.delayBeforeTyping || this.getDefaultDelay(template.sender, index),
        typingDuration: template.typingDuration || this.getDefaultTypingDuration(template.content, template.type)
      },
      status: 'sending',
      createdAt: now
    });
  }

  /**
   * Get default delay based on sender and position
   */
  private static getDefaultDelay(sender: SenderType, index: number): number {
    const baseDelay = index === 0 ? 500 : 1500; // First message is quicker
    const senderMultiplier = sender === 'business' ? 1.2 : 1.0;
    return Math.round(baseDelay * senderMultiplier);
  }

  /**
   * Get default typing duration based on content and type
   */
  private static getDefaultTypingDuration(content: any, type: MessageType): number {
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
  }

  /**
   * Create a sample booking conversation
   */
  static createBookingConversation(): Conversation {
    const template: ConversationTemplate = {
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
    };

    return this.createFromTemplate(template);
  }

  /**
   * Create a sample support conversation
   */
  static createSupportConversation(): Conversation {
    const template: ConversationTemplate = {
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
    };

    return this.createFromTemplate(template);
  }

  /**
   * Create a sample e-commerce conversation
   */
  static createEcommerceConversation(): Conversation {
    const template: ConversationTemplate = {
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
    };

    return this.createFromTemplate(template);
  }

  /**
   * Get all sample conversations
   */
  static getAllSampleConversations(): Conversation[] {
    return [
      this.createBookingConversation(),
      this.createSupportConversation(),
      this.createEcommerceConversation()
    ];
  }

  /**
   * Create a sample conversation with configurable parameters
   */
  static createSampleConversation(config: {
    businessName?: string;
    businessPhoneNumber?: string;
    title?: string;
    messageCount?: number;
  }): Conversation {
    const {
      businessName = 'Demo Business',
      businessPhoneNumber = '+1234567890',
      title = 'Sample Chat',
      messageCount = 8
    } = config;

    // Generate messages based on messageCount
    const messages: MessageTemplate[] = [];

    for (let i = 0; i < messageCount; i++) {
      if (i % 2 === 0) {
        // User messages
        messages.push({
          sender: 'user',
          type: 'text',
          content: { text: this.getSampleUserMessage(i / 2) }
        });
      } else {
        // Business messages
        messages.push({
          sender: 'business',
          type: 'text',
          content: { text: this.getSampleBusinessMessage(Math.floor(i / 2)) }
        });
      }
    }

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
      messages,
      settings: {
        playbackSpeed: 1.0,
        showTypingIndicators: true,
        showReadReceipts: true
      }
    };

    return this.createFromTemplate(template);
  }

  /**
   * Get sample user message by index
   */
  private static getSampleUserMessage(index: number): string {
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
  }

  /**
   * Get sample business message by index
   */
  private static getSampleBusinessMessage(index: number): string {
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
  }

  /**
   * Reset counters (useful for testing)
   */
  static resetCounters(): void {
    this.messageIdCounter = 1;
    this.conversationIdCounter = 1;
  }
}

// Direct imports for scenario creation functions
import { createRestaurantReservationConversation } from '../../scenarios/restaurant-reservation-scenario';
import { createLoyaltyProgramConversation } from '../../scenarios/loyalty-program-scenario';
import { createMedicalAppointmentsConversation } from '../../scenarios/medical-appointments-scenario';
import { createRestaurantOrdersConversation } from '../../scenarios/restaurant-orders-scenario';

/**
 * Dynamic scenario mapping factory
 * Maps scenario IDs to their conversation creation functions
 */
export class ScenarioConversationFactory {
  private static scenarioFactories: Record<string, () => Conversation> = {
    'restaurant-reservation': createRestaurantReservationConversation,
    'loyalty-program': createLoyaltyProgramConversation,
    'medical-appointments': createMedicalAppointmentsConversation,
    'restaurant-orders': createRestaurantOrdersConversation,
  };

  /**
   * Create conversation for a given scenario ID
   */
  static createConversationForScenario(scenarioId: string): Conversation {
    const factory = this.scenarioFactories[scenarioId];
    
    if (!factory) {
      console.warn(`[ScenarioConversationFactory] No factory found for scenario: ${scenarioId}, falling back to restaurant-reservation`);
      return this.scenarioFactories['restaurant-reservation']() || ConversationFactory.createBookingConversation();
    }

    try {
      console.log(`[ScenarioConversationFactory] Creating conversation for scenario: ${scenarioId}`);
      return factory();
    } catch (error) {
      console.error(`[ScenarioConversationFactory] Error creating conversation for scenario ${scenarioId}:`, error);
      // Fallback to restaurant reservation or default booking conversation
      return this.scenarioFactories['restaurant-reservation']() || ConversationFactory.createBookingConversation();
    }
  }

  /**
   * Get all available scenario IDs
   */
  static getAvailableScenarios(): string[] {
    return Object.keys(this.scenarioFactories);
  }

  /**
   * Check if a scenario is available
   */
  static hasScenario(scenarioId: string): boolean {
    return scenarioId in this.scenarioFactories;
  }
}

/**
 * Singleton instance for easy importing
 */
export const conversationFactory = ConversationFactory;
export const scenarioFactory = ScenarioConversationFactory;