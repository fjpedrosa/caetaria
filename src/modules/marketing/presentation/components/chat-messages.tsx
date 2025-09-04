/**
 * Chat Messages - Pure presentational components for WhatsApp-style messages
 * Extracted from HeroMobileDemoV2 following Clean Architecture principles
 * Contains ONLY UI rendering - no business logic
 */

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type {
  ChatMessageProps,
  ChatMessagesContainerProps,
  TypingIndicatorProps} from '@/modules/marketing/domain/types';

// ============================================================================
// INDIVIDUAL MESSAGE COMPONENT
// ============================================================================

/**
 * ChatMessage - Individual message bubble component
 * Pure presentational - receives all state as props
 */
export const ChatMessage = ({
  message,
  timestamp,
  isFromBot,
  isRead,
  isVisible,
  className = ''
}: ChatMessageProps) => {
  if (!isVisible) return null;

  // Generate timestamp if not provided
  const displayTimestamp = timestamp ||
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      <motion.div
        className={`flex ${isFromBot ? 'justify-end' : 'justify-start'} ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div
          className={`
            ${isFromBot
              ? 'bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md'
              : 'bg-white rounded-2xl rounded-tl-md text-gray-900'
            } px-3 py-2 max-w-[80%] shadow-sm border border-gray-100
          `}
        >
          {/* Message content */}
          <p className={`text-xs leading-relaxed ${
            isFromBot ? 'text-white' : 'text-gray-900'
          }`}>
            {message}
          </p>

          {/* Timestamp and read indicators */}
          <div className="text-[10px] mt-1 flex items-center justify-between">
            <span className={isFromBot ? 'text-green-100' : 'text-gray-500'}>
              {displayTimestamp}
            </span>

            {isFromBot && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                <span className={`ml-1 ${isRead ? 'text-blue-400' : 'text-green-200'}`}>
                  ✓✓
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// TYPING INDICATOR COMPONENT
// ============================================================================

/**
 * TypingIndicator - Animated typing indicator
 * Shows the classic three-dot animation when someone is typing
 */
export const TypingIndicator = ({
  isVisible,
  isFromBot = false,
  className = ''
}: TypingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`flex ${isFromBot ? 'justify-end' : 'justify-start'} ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gray-200 rounded-2xl px-3 py-2 shadow-sm border border-gray-100">
          <div className="flex gap-1 items-center py-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gray-600 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// PREDEFINED MESSAGE COMPONENTS
// ============================================================================

/**
 * Predefined message components for the hero demo
 * These contain the specific messages shown in the demo
 */

export interface CustomerMessage1Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export const CustomerMessage1 = ({
  isVisible,
  isRead,
  className
}: CustomerMessage1Props) => {
  return (
    <ChatMessage
      message="¡Hola! Me gustaría hacer una reserva para esta noche"
      isFromBot={false}
      isRead={isRead}
      isVisible={isVisible}
      className={className}
    />
  );
};

export interface BotMessage1Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export const BotMessage1 = ({
  isVisible,
  isRead,
  className
}: BotMessage1Props) => {
  return (
    <ChatMessage
      message="¡Por supuesto! Te ayudo con tu reserva. Veo que prefieres cenar por la noche. ¿Para cuántas personas sería?"
      isFromBot={true}
      isRead={isRead}
      isVisible={isVisible}
      className={className}
    />
  );
};

export interface CustomerMessage2Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export const CustomerMessage2 = ({
  isVisible,
  isRead,
  className
}: CustomerMessage2Props) => {
  return (
    <ChatMessage
      message="Para 6 personas, por favor"
      isFromBot={false}
      isRead={isRead}
      isVisible={isVisible}
      className={className}
    />
  );
};

export interface BotMessage2Props {
  isVisible: boolean;
  isRead: boolean;
  className?: string;
}

export const BotMessage2 = ({
  isVisible,
  isRead,
  className
}: BotMessage2Props) => {
  return (
    <ChatMessage
      message="Perfecto para 6 personas. Te ayudo a completar los detalles:"
      isFromBot={true}
      isRead={isRead}
      isVisible={isVisible}
      className={className}
    />
  );
};

// ============================================================================
// CHAT MESSAGES CONTAINER
// ============================================================================

/**
 * ChatMessagesContainer - Container for all chat messages
 * Provides consistent spacing and layout
 */
export const ChatMessagesContainer = ({
  children,
  className = ''
}: ChatMessagesContainerProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// COMPOSITE CHAT COMPONENT
// ============================================================================

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

/**
 * HeroChatMessages - Complete chat sequence for hero demo
 * Orchestrates all messages and typing indicators for the demo
 */
export const HeroChatMessages = ({
  showMessage1,
  showMessage2,
  showBotMessage1,
  showBotMessage2,
  message1Read,
  message2Read,
  isCustomerTyping,
  isBotTyping,
  className = ''
}: HeroChatMessagesProps) => {
  return (
    <ChatMessagesContainer className={className}>
      {/* First customer message */}
      <CustomerMessage1
        isVisible={showMessage1}
        isRead={message1Read}
      />

      {/* First bot message */}
      <BotMessage1
        isVisible={showBotMessage1}
        isRead={true}
      />

      {/* Second customer message */}
      <CustomerMessage2
        isVisible={showMessage2}
        isRead={message2Read}
      />

      {/* Second bot message */}
      <BotMessage2
        isVisible={showBotMessage2}
        isRead={true}
      />

      {/* Typing indicators */}
      <TypingIndicator
        isVisible={isCustomerTyping}
        isFromBot={false}
      />

      <TypingIndicator
        isVisible={isBotTyping}
        isFromBot={true}
      />
    </ChatMessagesContainer>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const chatMessageHelpers = {
  /**
   * Generate timestamp for message
   */
  generateTimestamp: (): string => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Create message with default props
   */
  createMessage: (
    message: string,
    isFromBot: boolean,
    overrides: Partial<ChatMessageProps> = {}
  ): ChatMessageProps => ({
    message,
    isFromBot,
    isRead: true,
    isVisible: true,
    timestamp: chatMessageHelpers.generateTimestamp(),
    ...overrides
  }),

  /**
   * Check if message should be visible based on phase
   */
  shouldShowMessage: (
    messageKey: string,
    currentPhase: string
  ): boolean => {
    const visibilityMap: Record<string, string[]> = {
      'customer1': ['customer1', 'message_read1', 'badge_ai', 'bot_typing1', 'bot1', 'customer_typing2', 'customer2', 'message_read2', 'bot_typing2', 'bot2', 'badge_flow', 'flow', 'badge_crm', 'complete'],
      'bot1': ['bot1', 'customer_typing2', 'customer2', 'message_read2', 'bot_typing2', 'bot2', 'badge_flow', 'flow', 'badge_crm', 'complete'],
      'customer2': ['customer2', 'message_read2', 'bot_typing2', 'bot2', 'badge_flow', 'flow', 'badge_crm', 'complete'],
      'bot2': ['bot2', 'badge_flow', 'flow', 'badge_crm', 'complete']
    };

    return visibilityMap[messageKey]?.includes(currentPhase) || false;
  },

  /**
   * Check if message should be marked as read
   */
  shouldShowAsRead: (
    messageKey: string,
    currentPhase: string
  ): boolean => {
    const readMap: Record<string, string[]> = {
      'message1': ['message_read1', 'badge_ai', 'bot_typing1', 'bot1', 'customer_typing2', 'customer2', 'message_read2', 'bot_typing2', 'bot2', 'badge_flow', 'flow', 'badge_crm', 'complete'],
      'message2': ['message_read2', 'bot_typing2', 'bot2', 'badge_flow', 'flow', 'badge_crm', 'complete']
    };

    return readMap[messageKey]?.includes(currentPhase) || false;
  }
};