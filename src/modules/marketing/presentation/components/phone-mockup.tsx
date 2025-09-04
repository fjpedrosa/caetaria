/**
 * PhoneMockup - Pure presentational component for phone frame
 * Extracted from HeroMobileDemoV2 following Clean Architecture principles
 * Contains ONLY UI rendering - no business logic
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

import type { PhoneMockupProps, PhoneScreenProps } from '@/modules/marketing/domain/types';

/**
 * Phone Mockup Component - Pure presentational
 * Renders the phone frame and device styling without any business logic
 */
export const PhoneMockup = ({
  children,
  isInView,
  className = '',
  device = 'iphone'
}: PhoneMockupProps) => {
  return (
    <motion.div
      className={`relative flex justify-center items-center w-full lg:justify-center overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración avanzada de interfaz de WhatsApp Business"
    >
      <div className="relative p-8" style={{ perspective: '1000px' }}>
        {/* Phone Frame */}
        <motion.div
          className="relative mx-auto w-[300px] sm:w-[340px] lg:w-[360px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer frame with gradient */}
          <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.2rem] p-[2px]">

            {/* Side buttons */}
            <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-lg"></div>
            <div className="absolute -left-[2px] top-28 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>
            <div className="absolute -left-[2px] top-40 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>

            {/* Inner bezel */}
            <div className="bg-black rounded-[3rem] p-[6px]">

              {/* Screen container */}
              <div
                className="relative bg-white dark:bg-gray-900 rounded-[2.7rem] overflow-hidden"
                style={{ aspectRatio: '390/844' }}
              >

                {/* Dynamic Island - iPhone style */}
                {device === 'iphone' && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-30">
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-gray-700 rounded-full"></div>
                  </div>
                )}

                {/* Android notch style */}
                {device === 'android' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-b-xl z-30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full"></div>
                  </div>
                )}

                {/* Screen content - passed as children */}
                <div className="h-full w-full">
                  {children}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Phone Screen Container - For screen-specific styling
 * Provides the WhatsApp green background and structure
 */

export const PhoneScreen = ({
  children,
  className = ''
}: PhoneScreenProps) => {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {children}
    </div>
  );
};

/**
 * WhatsApp Header - Pure presentational header component
 */
export interface WhatsAppHeaderProps {
  businessName: string;
  isTyping?: boolean;
  className?: string;
}

export const WhatsAppHeader = ({
  businessName,
  isTyping = false,
  className = ''
}: WhatsAppHeaderProps) => {
  return (
    <div className={`bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white pt-14 pb-3 px-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">

        {/* Profile picture */}
        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">
            {businessName.substring(0, 2).toUpperCase()}
          </span>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* Business info */}
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
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-green-300 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span>escribiendo...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <span>en línea</span>
              </>
            )}
          </motion.div>
        </div>

        {/* Header actions - could be extracted to separate component if needed */}
        <div className="flex items-center gap-4 text-white/90">
          {/* Video call icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>

          {/* Phone call icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>

          {/* Menu icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Chat Background - WhatsApp-style chat background
 */
export interface ChatBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatBackground = ({
  children,
  className = ''
}: ChatBackgroundProps) => {
  return (
    <div className={`
      flex-1 bg-[#e5ddd5] 
      bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22whatsapp-bg%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M0%2030h60v30H0z%22%20fill%3D%22%23e5ddd5%22%20opacity%3D%22.8%22%2F%3E%3Cpath%20d%3D%22M0%200h60v30H0z%22%20fill%3D%22%23d9d0c7%22%20opacity%3D%22.8%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23whatsapp-bg)%22%2F%3E%3C%2Fsvg%3E')] 
      p-4 space-y-3 overflow-hidden 
      ${className}
    `}>
      {children}
    </div>
  );
};