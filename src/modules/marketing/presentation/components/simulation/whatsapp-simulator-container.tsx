/**
 * WhatsApp Simulator Container
 * Main container for WhatsApp conversation simulations
 * Optimized with lazy loading and accessibility features
 */

'use client';

import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSimulationEngine } from '@/modules/marketing/application/hooks/use-simulation-engine';
import { SimulationType } from '@/modules/marketing/domain/types/simulation.types';

import { DateDivider,MessageBubble, SystemMessage } from './message-bubble';
import { WhatsAppShell } from './whatsapp-shell';

interface WhatsAppSimulatorContainerProps {
  simulationType: SimulationType;
  isInView?: boolean;
  className?: string;
  onSimulationComplete?: () => void;
}

/**
 * Typing Indicator Component
 */
const TypingIndicator: React.FC = () => (
  <motion.div
    className="flex justify-end mb-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center">
        {[0, 0.3, 0.6].map((delay, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

/**
 * WhatsApp Simulator Container Component
 */
export const WhatsAppSimulatorContainer: React.FC<WhatsAppSimulatorContainerProps> = ({
  simulationType,
  isInView = true,
  className = '',
  onSimulationComplete
}) => {
  // Initialize simulation engine
  const simulation = useSimulationEngine({
    initialScenario: simulationType,
    autoPlay: isInView,
    loop: true,
    speed: 1,
    onScenarioComplete: onSimulationComplete,
    debug: false // Debug disabled after fixing the issue
  });

  const {
    scenario,
    state,
    visibleMessages,
    isPlaying
  } = simulation;

  // Ref for messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (messagesContainerRef.current && visibleMessages.length > 0) {
      const container = messagesContainerRef.current;
      // Smooth scroll to bottom
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [visibleMessages.length]);

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group messages by date for date dividers
  const messageGroups = useMemo(() => {
    const groups: { date: string; messages: typeof visibleMessages }[] = [];
    let currentDate = '';
    let currentGroup: typeof visibleMessages = [];

    visibleMessages.forEach(message => {
      const messageDate = message.timestamp.toLocaleDateString('es-ES');

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [visibleMessages]);

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Cargando simulación...</div>
      </div>
    );
  }

  return (
    <div
      className={`h-full ${className}`}
      role="application"
      aria-label={`Simulación de WhatsApp para ${scenario.businessName}`}
      aria-busy={state.isTyping}
    >
      <WhatsAppShell
        businessName={scenario.businessName}
        isTyping={state.isTyping && state.typingEntity === 'bot'}
        isOnline={true}
      >
        {/* Chat Messages Area */}
        <div
          className="h-full bg-[#e5ddd5] dark:bg-gray-800 relative"
          role="log"
          aria-live="polite"
          aria-label="Conversación de WhatsApp"
        >
          {/* WhatsApp Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'whatsapp-bg\' patternUnits=\'userSpaceOnUse\' width=\'60\' height=\'60\'%3E%3Cpath d=\'M0 30h60v30H0z\' fill=\'%23000\' opacity=\'.05\'/%3E%3Cpath d=\'M0 0h60v30H0z\' fill=\'%23000\' opacity=\'.025\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23whatsapp-bg)\'/%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}
          />

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="relative h-full overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            tabIndex={0}
            aria-label="Mensajes de la conversación"
          >
            {/* System Message */}
            <SystemMessage content="Los mensajes están cifrados de extremo a extremo" />

            {/* Message Groups with Date Dividers */}
            <AnimatePresence mode="popLayout">
              {messageGroups.map((group, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  {/* Date Divider */}
                  {groupIndex === 0 && (
                    <DateDivider
                      date={group.date === new Date().toLocaleDateString('es-ES') ? 'Hoy' : group.date}
                    />
                  )}

                  {/* Messages in Group */}
                  {group.messages.map((message, messageIndex) => (
                    <MessageBubble
                      key={message.id}
                      type={message.type}
                      content={message.content}
                      timestamp={formatTime(message.timestamp)}
                      status="read"
                      showAnimation={isPlaying}
                    />
                  ))}
                </React.Fragment>
              ))}

              {/* Typing Indicator */}
              {state.isTyping && state.typingEntity === 'bot' && (
                <TypingIndicator key="typing-indicator" />
              )}
            </AnimatePresence>

            {/* Auto-scroll to bottom */}
            <div className="h-4" />
          </div>
        </div>
      </WhatsAppShell>
    </div>
  );
};

export default WhatsAppSimulatorContainer;