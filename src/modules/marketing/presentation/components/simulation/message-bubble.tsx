/**
 * Message Bubble Component
 * WhatsApp-style message bubbles for conversations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';

export interface MessageBubbleProps {
  type: 'customer' | 'bot';
  content: string;
  timestamp?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  showAnimation?: boolean;
  hasMedia?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  onMediaClick?: () => void;
}

/**
 * Message status indicator
 */
const MessageStatus: React.FC<{ status?: string }> = ({ status }) => {
  if (!status || status === 'sending') return null;

  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-400" />;
    default:
      return null;
  }
};

/**
 * Message Bubble Component
 * Renders WhatsApp-style message bubbles with animations
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  content,
  timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  status = 'read',
  showAnimation = true,
  hasMedia = false,
  mediaUrl,
  mediaType = 'image',
  onMediaClick
}) => {
  const isBot = type === 'bot';

  const bubbleVariants = {
    hidden: {
      x: isBot ? 50 : -50,
      opacity: 0,
      scale: 0.8
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      className={`flex ${isBot ? 'justify-end' : 'justify-start'} mb-2`}
      variants={bubbleVariants}
      initial={showAnimation ? 'hidden' : 'visible'}
      animate="visible"
    >
      <div className={`
        max-w-[80%] sm:max-w-[70%] lg:max-w-[60%]
        ${isBot
          ? 'order-1'
          : 'order-2'
        }
      `}>
        <div className={`
          rounded-2xl px-3 py-2 shadow-sm relative
          ${isBot
            ? 'bg-gradient-to-br from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 text-white rounded-tr-md'
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-md'
          }
        `}>
          {/* Media Content */}
          {hasMedia && mediaUrl && (
            <div className="mb-2 -mx-3 -mt-2">
              {mediaType === 'image' && (
                <img
                  src={mediaUrl}
                  alt="Imagen compartida"
                  className="w-full rounded-t-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={onMediaClick}
                />
              )}
              {mediaType === 'document' && (
                <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                  <span className="text-2xl">📄</span>
                  <span className="text-sm">Documento.pdf</span>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <p className={`
            text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap
            ${isBot ? 'text-white' : 'text-gray-900 dark:text-gray-100'}
          `}>
            {content}
          </p>

          {/* Timestamp and Status */}
          <div className={`
            text-[10px] mt-1 flex items-center gap-1 
            ${isBot ? 'justify-end' : 'justify-start'}
            ${isBot ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
          `}>
            <span>{timestamp}</span>
            {isBot && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              >
                <MessageStatus status={status} />
              </motion.span>
            )}
          </div>

          {/* Message tail */}
          <div className={`
            absolute top-0 w-0 h-0
            ${isBot
              ? '-right-2 border-l-[8px] border-l-green-500 dark:border-l-green-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
              : '-left-2 border-r-[8px] border-r-white dark:border-r-gray-800 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
            }
          `} />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * System message component (e.g., "Messages are end-to-end encrypted")
 */
export const SystemMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="flex justify-center my-4">
      <motion.div
        className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-xs"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        🔒 {content}
      </motion.div>
    </div>
  );
};

/**
 * Date divider component
 */
export const DateDivider: React.FC<{ date: string }> = ({ date }) => {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs">
        {date}
      </div>
    </div>
  );
};

export default MessageBubble;