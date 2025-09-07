/**
 * Quick Reply Buttons Component
 * Simulates WhatsApp Quick Reply Buttons (max 3 buttons, 25 chars each)
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

import type { QuickReplyButton } from '@/modules/marketing/domain/types/whatsapp-features.types';

interface QuickReplyButtonsProps {
  buttons: QuickReplyButton[];
  onButtonClick?: (buttonId: string) => void;
  isVisible?: boolean;
}

export function QuickReplyButtons({ 
  buttons, 
  onButtonClick,
  isVisible = true 
}: QuickReplyButtonsProps) {
  // WhatsApp allows maximum 3 quick reply buttons
  const displayButtons = buttons.slice(0, 3);

  const handleClick = useCallback((buttonId: string) => {
    onButtonClick?.(buttonId);
  }, [onButtonClick]);

  if (!isVisible || displayButtons.length === 0) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <div className="flex flex-wrap gap-2 justify-end">
        {displayButtons.map((button, index) => (
          <motion.button
            key={button.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            onClick={() => handleClick(button.id)}
            className="px-4 py-2 bg-white border-2 border-green-500 text-green-600 rounded-full font-medium text-sm hover:bg-green-50 active:bg-green-100 transition-colors shadow-sm hover:shadow-md"
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-1.5">
              {button.icon && <span className="text-base">{button.icon}</span>}
              <span className="max-w-[100px] truncate">
                {/* Enforce max 25 chars as per WhatsApp limit */}
                {button.text.substring(0, 25)}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* WhatsApp branding hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-2"
      >
        <span className="text-xs text-gray-400">Quick Reply</span>
      </motion.div>
    </div>
  );
}