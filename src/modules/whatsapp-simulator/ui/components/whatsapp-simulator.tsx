'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// UI Components
import { Menu, Phone, Video } from '@/lib/icons';
import { Icon } from '@/modules/shared/ui/components/ui/icon';

// Domain Types
import type { Conversation } from '../../domain/entities';
import type { FlowStepId, ReservationData, WhatsAppSimulatorProps } from '../../domain/types';

// Presentational Components
import { EducationalBadge } from './educational-badge';
import { FlowPanel } from './flow-panel';

export interface WhatsAppSimulatorPresentationalProps {
  // Core state
  conversation: Conversation | null;
  isInitialized: boolean;
  activeBadge: any;
  showFlow: boolean;
  flowStep: FlowStepId;
  reservationData: ReservationData;

  // Configuration
  device: 'iphone14' | 'android';
  enableEducationalBadges: boolean;
  className: string;

  // Hooks data
  conversationFlow: any;
  typingIndicator: any;
  flowExecution: any;

  // Event handlers
  onDataChange: (data: ReservationData) => void;
}

export const WhatsAppSimulator = React.memo<WhatsAppSimulatorPresentationalProps>(
  function WhatsAppSimulator({
    conversation,
    isInitialized,
    activeBadge,
    showFlow,
    flowStep,
    reservationData,
    device = 'iphone14',
    enableEducationalBadges = true,
    className = '',
    conversationFlow,
    typingIndicator,
    flowExecution,
    onDataChange
  }) {
    // Loading state - pure UI rendering
    if (!isInitialized || !conversation) {
      console.log('[WhatsAppSimulator UI] Loading state:', {isInitialized, hasConversation: !!conversation});
      return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando simulador...</p>
          </div>
        </div>
      );
    }

    // Main simulator UI - pure JSX rendering
    return (
    <motion.div
      className={`relative flex justify-center items-center w-full lg:justify-center overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración avanzada de interfaz de WhatsApp Business con badges educativos"
    >
      <div className="relative p-8" style={{ perspective: '1000px' }}>
        {/* iPhone 14 Style Frame */}
        <motion.div
          className="relative mx-auto w-[300px] sm:w-[340px] lg:w-[360px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Phone outer frame */}
          <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.2rem] p-[2px]">
            {/* Side buttons */}
            <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-lg"></div>
            <div className="absolute -left-[2px] top-28 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>
            <div className="absolute -left-[2px] top-40 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>

            {/* Inner bezel */}
            <div className="bg-black rounded-[3rem] p-[6px]">
              {/* Screen container */}
              <div className="relative bg-white dark:bg-gray-900 rounded-[2.7rem] overflow-hidden" style={{ aspectRatio: '390/844' }}>
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-30">
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-gray-700 rounded-full"></div>
                </div>

                {/* WhatsApp Interface */}
                <div className="h-full flex flex-col">
                  {/* WhatsApp Header */}
                  <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white pt-14 pb-3 px-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {/* Profile picture */}
                      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg font-bold">TN</span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{conversation.metadata.businessName}</div>
                        <motion.div
                          className="text-xs opacity-90 flex items-center gap-1"
                          key={typingIndicator.state.isAnyoneTyping ? 'typing' : 'online'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {typingIndicator.state.isAnyoneTyping ? (
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
                      <div className="flex items-center gap-4 text-white/90">
                        <Icon icon={Video} size="small" iconClassName="w-5 h-5" />
                        <Icon icon={Phone} size="small" iconClassName="w-5 h-5" />
                        <Icon icon={Menu} size="small" iconClassName="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 bg-[#e5ddd5] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22whatsapp-bg%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M0%2030h60v30H0z%22%20fill%3D%22%23e5ddd5%22%20opacity%3D%22.8%22%2F%3E%3Cpath%20d%3D%22M0%200h60v30H0z%22%20fill%3D%22%23d9d0c7%22%20opacity%3D%22.8%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23whatsapp-bg)%22%2F%3E%3C%2Fsvg%3E')] p-4 space-y-3 overflow-hidden">
                    {/* Render messages - pure presentation */}
                    {conversationFlow.state.messages.map((message, index) => {
                      const isVisible = index <= conversationFlow.state.currentMessageIndex;
                      if (!isVisible) return null;

                      return (
                        <AnimatePresence key={message.id}>
                          <motion.div
                            className={`flex ${message.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                          >
                            <div
                              className={`
                                ${message.sender === 'business'
                                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md'
                                  : 'bg-white rounded-2xl rounded-tl-md'
                                } px-3 py-2 max-w-[80%] shadow-sm border border-gray-100
                              `}
                            >
                              <p className={`text-xs leading-relaxed ${
                                message.sender === 'business' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {message.getDisplayText()}
                              </p>
                              <div className="text-[10px] mt-1 flex items-center justify-between">
                                <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.3, duration: 0.2 }}
                                >
                                  <span className={message.status === 'read' ? 'text-blue-400' : 'text-gray-400'}>
                                    ✓✓
                                  </span>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      );
                    })}

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {typingIndicator.state.isAnyoneTyping && (
                        <motion.div
                          className={`flex ${
                            typingIndicator.state.activeTypingUsers.includes('business') ? 'justify-end' : 'justify-start'
                          }`}
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
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* WhatsApp Flow Panel */}
                <AnimatePresence>
                  {showFlow && (
                    <motion.div
                      className="absolute inset-0 z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-50" />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl"
                        style={{ height: '70%' }}
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 200,
                          duration: 0.5
                        }}
                      >
                        <FlowPanel
                          step={flowStep}
                          reservationData={reservationData}
                          onDataChange={onDataChange}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Educational Badges */}
        <AnimatePresence>
          {enableEducationalBadges && activeBadge && (
            <>
              {/* Desktop badge */}
              <div className="hidden sm:block">
                <EducationalBadge badge={activeBadge} isMobile={false} />
              </div>

              {/* Mobile badge */}
              <div className="sm:hidden">
                <EducationalBadge badge={activeBadge} isMobile={true} />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    );
  }
);


export default WhatsAppSimulator;
