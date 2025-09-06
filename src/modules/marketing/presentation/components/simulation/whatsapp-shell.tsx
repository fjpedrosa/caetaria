/**
 * WhatsApp Shell Component
 * Reusable WhatsApp interface container for simulations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical,Phone, Video } from 'lucide-react';

interface WhatsAppShellProps {
  businessName: string;
  businessAvatar?: string;
  isTyping?: boolean;
  typingText?: string;
  isOnline?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Typing dots animation component
 */
const TypingDots = () => (
  <div className="flex gap-1">
    {[0, 0.2, 0.4].map((delay, index) => (
      <motion.div
        key={index}
        className="w-1 h-1 bg-green-300 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.8, repeat: Infinity, delay }}
      />
    ))}
  </div>
);

/**
 * WhatsApp Shell Component
 * Provides the WhatsApp UI chrome for conversation simulations
 */
export const WhatsAppShell: React.FC<WhatsAppShellProps> = ({
  businessName,
  businessAvatar,
  isTyping = false,
  typingText = 'escribiendo...',
  isOnline = true,
  children,
  className = ''
}) => {
  // Get initials for avatar fallback
  const initials = businessName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* WhatsApp Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 dark:from-green-700 dark:via-green-600 dark:to-green-700 text-white pt-14 pb-3 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              {businessAvatar ? (
                <img
                  src={businessAvatar}
                  alt={businessName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {initials}
                </span>
              )}
            </div>
            {/* Online indicator */}
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1">
            <div className="font-semibold text-sm">{businessName}</div>
            <motion.div
              className="text-xs opacity-90 flex items-center gap-1"
              key={isTyping ? 'typing' : 'online'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isTyping ? (
                <>
                  <TypingDots />
                  <span>{typingText}</span>
                </>
              ) : isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  <span>en línea</span>
                </>
              ) : (
                <span>última vez hace 5 min</span>
              )}
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 text-white/90">
            <button
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Video llamada"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Llamada de voz"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Más opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default WhatsAppShell;