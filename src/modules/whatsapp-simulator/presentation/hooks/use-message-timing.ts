/**
 * useMessageTiming - Handle realistic message delays and timing
 */

import { useCallback, useMemo } from 'react';

import { Message, MessageType, SenderType } from '../../domain/entities';

export interface TimingConfig {
  baseTypingSpeed: number; // characters per second
  delayVariation: number; // percentage of variation (0-1)
  messageTypeMultipliers: Record<MessageType, number>;
  senderMultipliers: Record<SenderType, number>;
  minDelay: number; // minimum delay in ms
  maxDelay: number; // maximum delay in ms
  readReceiptDelay: number; // delay for read receipts in ms
  deliveryDelay: number; // delay for delivery confirmations in ms
}

export interface CalculatedTiming {
  delayBeforeTyping: number;
  typingDuration: number;
  deliveryDelay: number;
  readDelay: number;
  totalDuration: number;
}

export interface TimingUtilities {
  calculateMessageTiming: (message: Message, previousMessage?: Message) => CalculatedTiming;
  calculateConversationDuration: (messages: Message[]) => number;
  adjustTimingForSpeed: (timing: CalculatedTiming, speed: number) => CalculatedTiming;
  generateRealisticTiming: (
    text: string,
    messageType: MessageType,
    sender: SenderType
  ) => CalculatedTiming;
  getTypingSpeed: (sender: SenderType) => number;
  getMessageTypeDelay: (messageType: MessageType) => number;
  createTimingPresets: () => Record<string, Partial<TimingConfig>>;
}

const DEFAULT_CONFIG: TimingConfig = {
  baseTypingSpeed: 3.5, // characters per second (realistic average)
  delayVariation: 0.3, // 30% variation
  messageTypeMultipliers: {
    'text': 1.0,
    'image': 2.5, // takes longer to select and send images
    'audio': 1.8,
    'video': 3.0,
    'document': 2.0,
    'sticker': 0.8, // quick to send
    'location': 1.5,
    'contact': 1.2,
    'interactive': 2.2, // takes time to create interactive messages
    'template': 1.5,
    'flow': 2.8 // complex flow messages
  },
  senderMultipliers: {
    'user': 1.0, // regular typing speed
    'business': 1.4 // businesses might type more carefully/formally
  },
  minDelay: 800, // minimum delay between messages
  maxDelay: 8000, // maximum delay between messages
  readReceiptDelay: 500, // delay before marking as read
  deliveryDelay: 200 // delay before marking as delivered
};

export function useMessageTiming(config: Partial<TimingConfig> = {}): TimingUtilities {
  const fullConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  const calculateMessageTiming = useCallback(
    (message: Message, previousMessage?: Message): CalculatedTiming => {
      const { content, type, sender } = message;

      // Base calculations
      const textLength = getTextLength(content, type);
      const baseTypingTime = (textLength / fullConfig.baseTypingSpeed) * 1000;

      // Apply multipliers
      const typeMultiplier = fullConfig.messageTypeMultipliers[type] || 1;
      const senderMultiplier = fullConfig.senderMultipliers[sender] || 1;

      // Calculate typing duration with variations
      let typingDuration = baseTypingTime * typeMultiplier * senderMultiplier;

      // Add realistic variation
      const variation = 1 + (Math.random() - 0.5) * fullConfig.delayVariation;
      typingDuration *= variation;

      // Ensure minimum typing duration for non-text messages
      if (type !== 'text') {
        typingDuration = Math.max(typingDuration, 1500);
      }

      // Calculate delay before typing
      let delayBeforeTyping = calculateDelayBetweenMessages(message, previousMessage);

      // Apply speed and constraints
      delayBeforeTyping = Math.max(
        fullConfig.minDelay,
        Math.min(fullConfig.maxDelay, delayBeforeTyping)
      );

      const deliveryDelay = fullConfig.deliveryDelay;
      const readDelay = fullConfig.readReceiptDelay;
      const totalDuration = delayBeforeTyping + typingDuration + deliveryDelay + readDelay;

      return {
        delayBeforeTyping,
        typingDuration: Math.round(typingDuration),
        deliveryDelay,
        readDelay,
        totalDuration: Math.round(totalDuration)
      };
    },
    [fullConfig]
  );

  const calculateConversationDuration = useCallback(
    (messages: Message[]): number => {
      let totalDuration = 0;

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const previousMessage = i > 0 ? messages[i - 1] : undefined;
        const timing = calculateMessageTiming(message, previousMessage);
        totalDuration += timing.totalDuration;
      }

      return totalDuration;
    },
    [calculateMessageTiming]
  );

  const adjustTimingForSpeed = useCallback(
    (timing: CalculatedTiming, speed: number): CalculatedTiming => {
      if (speed <= 0) speed = 1;

      return {
        delayBeforeTyping: Math.round(timing.delayBeforeTyping / speed),
        typingDuration: Math.round(timing.typingDuration / speed),
        deliveryDelay: timing.deliveryDelay, // Don't scale system delays
        readDelay: timing.readDelay, // Don't scale system delays
        totalDuration: Math.round(
          (timing.delayBeforeTyping + timing.typingDuration) / speed +
          timing.deliveryDelay + timing.readDelay
        )
      };
    },
    []
  );

  const generateRealisticTiming = useCallback(
    (text: string, messageType: MessageType, sender: SenderType): CalculatedTiming => {
      const mockMessage = {
        content: { text },
        type: messageType,
        sender
      } as Message;

      return calculateMessageTiming(mockMessage);
    },
    [calculateMessageTiming]
  );

  const getTypingSpeed = useCallback(
    (sender: SenderType): number => {
      return fullConfig.baseTypingSpeed * fullConfig.senderMultipliers[sender];
    },
    [fullConfig]
  );

  const getMessageTypeDelay = useCallback(
    (messageType: MessageType): number => {
      return fullConfig.messageTypeMultipliers[messageType] || 1;
    },
    [fullConfig]
  );

  const createTimingPresets = useCallback(
    (): Record<string, Partial<TimingConfig>> => ({
      'fast': {
        baseTypingSpeed: 5.0,
        delayVariation: 0.2,
        minDelay: 500,
        maxDelay: 4000
      },
      'normal': {
        baseTypingSpeed: 3.5,
        delayVariation: 0.3,
        minDelay: 800,
        maxDelay: 8000
      },
      'slow': {
        baseTypingSpeed: 2.0,
        delayVariation: 0.4,
        minDelay: 1500,
        maxDelay: 12000
      },
      'realistic': {
        baseTypingSpeed: 3.2,
        delayVariation: 0.35,
        minDelay: 1200,
        maxDelay: 15000,
        messageTypeMultipliers: {
          ...DEFAULT_CONFIG.messageTypeMultipliers,
          'text': 1.0,
          'image': 4.0, // More realistic delay for media
          'audio': 3.5,
          'video': 5.0
        }
      },
      'demo': {
        baseTypingSpeed: 8.0,
        delayVariation: 0.1,
        minDelay: 300,
        maxDelay: 2000
      }
    }),
    []
  );

  return {
    calculateMessageTiming,
    calculateConversationDuration,
    adjustTimingForSpeed,
    generateRealisticTiming,
    getTypingSpeed,
    getMessageTypeDelay,
    createTimingPresets
  };
}

/**
 * Helper function to extract text length from message content
 */
function getTextLength(content: any, type: MessageType): number {
  switch (type) {
    case 'text':
      return content.text?.length || 0;
    case 'image':
    case 'video':
      return content.media?.caption?.length || 20; // default length for media
    case 'interactive':
      return content.interactive?.body?.length || 30;
    case 'template':
      return 40; // average template length
    case 'audio':
      return 15; // audio messages are quick to send
    case 'document':
      return content.media?.filename?.length || 25;
    case 'sticker':
      return 5; // stickers are very quick
    case 'location':
    case 'contact':
      return 10;
    case 'flow':
      return 35;
    default:
      return 20;
  }
}

/**
 * Calculate realistic delay between consecutive messages
 */
function calculateDelayBetweenMessages(
  currentMessage: Message,
  previousMessage?: Message
): number {
  if (!previousMessage) return 1000; // First message delay

  // Base delay
  let delay = 2000;

  // Sender switching adds delay
  if (currentMessage.sender !== previousMessage.sender) {
    delay += 1500; // Time to process and respond
  }

  // Message type affects response time
  if (previousMessage.type !== 'text') {
    delay += 1000; // Media messages take longer to process
  }

  // Question messages typically get faster responses
  if (previousMessage.content.text?.includes('?')) {
    delay *= 0.7;
  }

  // Add some random variation
  delay *= (0.8 + Math.random() * 0.4); // ±20% variation

  return Math.round(delay);
}