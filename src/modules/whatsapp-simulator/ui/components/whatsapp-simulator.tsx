/**
 * Enhanced WhatsApp Simulator
 * Supports educational badges, iPhone UI, and WhatsApp Flows
 * Designed to replace the hardcoded hero-mobile-demo-v2.tsx
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import {
  Brain,
  Database,
  Menu,
  Phone,
  Settings,
  Sparkles,
  Video,
} from '@/lib/icons';

import { useConversationFlow } from '../hooks/use-conversation-flow';
import { useTypingIndicatorWithEvents } from '../hooks/use-typing-indicator';
import { useFlowExecutionWithEvents } from '../hooks/use-flow-execution';
import { Conversation, Message } from '../../domain/entities';
import {
  restaurantReservationScenario,
  createRestaurantReservationConversation,
  WhatsAppSimulatorProps,
  EducationalBadge,
  FlowStep
} from '../../scenarios/restaurant-reservation-scenario';

interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

type FlowStepId = 'guests' | 'date' | 'time' | 'confirmation';

/**
 * Enhanced WhatsApp Simulator with iPhone UI and educational badges
 */
export function WhatsAppSimulator({
  scenario = restaurantReservationScenario,
  device = 'iphone14',
  autoPlay = false,
  enableEducationalBadges = true,
  enableGifExport = false,
  onComplete,
  onBadgeShow,
  onFlowStep,
  className = ''
}: WhatsAppSimulatorProps) {
  // Main conversation flow
  const conversationFlow = useConversationFlow({
    enableDebug: false,
    autoCleanup: true
  });

  // Typing indicator integration
  const typingIndicator = useTypingIndicatorWithEvents(
    conversationFlow.events$,
    {
      showTypingIndicator: true,
      animationDuration: 1200
    }
  );

  // Flow execution integration
  const flowExecution = useFlowExecutionWithEvents(
    conversationFlow.events$,
    {
      enableMockExecution: true,
      autoCompleteFlows: true
    }
  );

  // Component state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeBadge, setActiveBadge] = useState<EducationalBadge | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStepId>('guests');
  const [reservationData, setReservationData] = useState<ReservationData>({
    guests: 0,
    date: '',
    time: ''
  });

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      const conv = createRestaurantReservationConversation();
      setConversation(conv);
      
      const success = await conversationFlow.actions.loadConversation(conv);
      if (success) {
        setIsInitialized(true);
        
        // Auto-play if enabled
        if (autoPlay) {
          setTimeout(() => {
            conversationFlow.actions.play();
          }, 1000);
        }
      }
    };

    initializeConversation();
  }, [scenario]);

  // Handle educational badges
  useEffect(() => {
    if (!enableEducationalBadges || !conversationFlow.events$) return;

    const subscription = conversationFlow.events$.subscribe(event => {
      if (event.type === 'message.sent') {
        const messageIndex = conversationFlow.state.currentMessageIndex;
        const badge = scenario.educationalBadges.find(
          b => b.triggerAtMessageIndex === messageIndex
        );
        
        if (badge) {
          setTimeout(() => {
            setActiveBadge(badge);
            onBadgeShow?.(badge);
            
            // Hide badge after duration
            setTimeout(() => {
              setActiveBadge(null);
            }, badge.displayDuration);
          }, 500);
        }
        
        // Trigger flow if this message has flowTrigger
        const currentMessage = scenario.messages[messageIndex];
        if (currentMessage?.flowTrigger) {
          setTimeout(() => {
            setShowFlow(true);
            startFlowSequence();
          }, 1500);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [conversationFlow.events$, enableEducationalBadges, scenario]);

  // Flow sequence controller
  const startFlowSequence = () => {
    const sequence = [
      { step: 'guests' as FlowStepId, delay: 1500 },
      { step: 'date' as FlowStepId, delay: 4000 },
      { step: 'time' as FlowStepId, delay: 6500 },
      { step: 'confirmation' as FlowStepId, delay: 9000 },
    ];

    sequence.forEach(({ step, delay }) => {
      setTimeout(() => {
        setFlowStep(step);
        onFlowStep?.(scenario.flowSteps.find(s => s.id === step)!);
        
        if (step === 'guests') {
          setReservationData(prev => ({ ...prev, guests: 6 }));
        } else if (step === 'date') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setReservationData(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));
        } else if (step === 'time') {
          setReservationData(prev => ({ ...prev, time: '19:00' }));
        }
      }, delay);
    });

    // Close flow after confirmation
    setTimeout(() => {
      setShowFlow(false);
    }, 10500);
  };

  // Handle conversation complete
  useEffect(() => {
    if (!conversationFlow.events$) return;

    const subscription = conversationFlow.events$.subscribe(event => {
      if (event.type === 'conversation.completed') {
        onComplete?.();
        
        // Auto-restart after delay
        setTimeout(() => {
          conversationFlow.actions.reset();
          setActiveBadge(null);
          setShowFlow(false);
          setFlowStep('guests');
          setReservationData({ guests: 0, date: '', time: '' });
          
          if (autoPlay) {
            setTimeout(() => {
              conversationFlow.actions.play();
            }, 1000);
          }
        }, scenario.timing.restartDelay);
      }
    });

    return () => subscription.unsubscribe();
  }, [conversationFlow.events$, onComplete, autoPlay, scenario]);

  if (!isInitialized || !conversation) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando simulador...</p>
        </div>
      </div>
    );
  }

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
                    {/* Render messages */}
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
                          onDataChange={setReservationData}
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
            <div className="hidden sm:block">
              <DynamicBadgeDisplay badge={activeBadge} />
            </div>
          )}
        </AnimatePresence>

        {/* Mobile-friendly badges */}
        <AnimatePresence>
          {enableEducationalBadges && activeBadge && (
            <motion.div
              className="sm:hidden absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-black/20 absolute inset-0" />
              <motion.div
                className={`
                  ${activeBadge.bgColor} 
                  ${activeBadge.color} 
                  rounded-xl shadow-xl p-3 mx-4 max-w-[280px]
                  border border-white/20
                `}
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -20 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {activeBadge.id === 'ai' && <Brain className="w-5 h-5" />}
                  {activeBadge.id === 'flow' && <Settings className="w-5 h-5" />}
                  {activeBadge.id === 'crm' && <Database className="w-5 h-5" />}
                  <span className="font-bold text-sm">{activeBadge.title}</span>
                </div>
                <p className="text-xs opacity-90">{activeBadge.subtitle}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Dynamic Badge Display Component
 */
function DynamicBadgeDisplay({ badge }: { badge: EducationalBadge }) {
  const IconComponent = badge.id === 'ai' ? Brain : badge.id === 'flow' ? Settings : Database;

  return (
    <motion.div
      className={`
        absolute z-60 ${badge.bgColor} ${badge.color} rounded-2xl shadow-2xl border border-white/20
        min-w-[140px] p-3 text-xs
        sm:min-w-[160px] sm:p-4 sm:text-sm
        hidden xs:block
      `}
      style={badge.position}
      initial={{
        opacity: 0,
        scale: 0.8,
        x: badge.arrowDirection === 'left' ? 30 : badge.arrowDirection === 'right' ? -30 : 0,
        y: badge.arrowDirection === 'up' ? 30 : badge.arrowDirection === 'down' ? -30 : 0
      }}
      animate={{
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        duration: 0.6
      }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <motion.div
          className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.div>
        <div className="flex-1">
          <motion.h3
            className="font-bold text-xs sm:text-sm mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {badge.title}
          </motion.h3>
          <motion.p
            className="text-[10px] sm:text-xs opacity-90 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {badge.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Animated arrow pointer */}
      <motion.div
        className={`absolute ${badge.color}`}
        style={{
          ...(badge.arrowDirection === 'left' && {
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }),
          ...(badge.arrowDirection === 'right' && {
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }),
          ...(badge.arrowDirection === 'down' && {
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }),
          ...(badge.arrowDirection === 'up' && {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }),
        }}
        animate={{
          x: badge.arrowDirection === 'left' ? [0, -5, 0] :
             badge.arrowDirection === 'right' ? [0, 5, 0] : 0,
          y: badge.arrowDirection === 'up' ? [0, -5, 0] :
             badge.arrowDirection === 'down' ? [0, 5, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {badge.arrowDirection === 'left' && '◀'}
        {badge.arrowDirection === 'right' && '▶'}
        {badge.arrowDirection === 'up' && '▲'}
        {badge.arrowDirection === 'down' && '▼'}
      </motion.div>

      {/* Sparkle effects */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop'
        }}
      >
        <Sparkles className={`w-4 h-4 ${badge.color}`} />
      </motion.div>
    </motion.div>
  );
}

/**
 * Flow Panel Component
 */
function FlowPanel({
  step,
  reservationData,
  onDataChange
}: {
  step: FlowStepId;
  reservationData: ReservationData;
  onDataChange: (data: ReservationData) => void;
}) {
  const handleFlowNext = (data: Partial<ReservationData>) => {
    onDataChange({ ...reservationData, ...data });
  };

  return (
    <>
      {/* Flow header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="font-semibold text-gray-900">Reserva tu mesa</h2>
          <p className="text-sm text-gray-500">Paso {
            step === 'guests' ? '1' :
            step === 'date' ? '2' :
            step === 'time' ? '3' : '4'
          } de 4</p>
        </div>
        <div className="flex gap-2">
          {['guests', 'date', 'time', 'confirmation'].map((stepName, index) => (
            <div
              key={stepName}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === stepName ||
                (['guests', 'date', 'time', 'confirmation'].indexOf(step) > index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Flow content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'guests' && (
            <GuestSelection
              key="guests"
              onNext={handleFlowNext}
              data={reservationData}
            />
          )}
          {step === 'date' && (
            <DateSelection
              key="date"
              onNext={handleFlowNext}
              data={reservationData}
            />
          )}
          {step === 'time' && (
            <TimeSelection
              key="time"
              onNext={handleFlowNext}
              data={reservationData}
            />
          )}
          {step === 'confirmation' && (
            <ConfirmationStep
              key="confirmation"
              data={reservationData}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Flow Step Components (identical to original)
function GuestSelection({ onNext, data }: { onNext: (data: Partial<ReservationData>) => void; data: ReservationData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">¿Cuántas personas?</h3>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <motion.button
            key={num}
            className={`w-12 h-12 rounded-full border-2 transition-colors ${
              data.guests === num
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 text-gray-700 hover:border-green-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNext({ guests: num })}
          >
            {num}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {data.guests > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Siguiente →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DateSelection({ onNext, data }: { onNext: (data: Partial<ReservationData>) => void; data: ReservationData }) {
  const today = new Date();
  const dates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">¿Qué día prefieres?</h3>
      <div className="space-y-3 mb-6">
        {dates.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = data.date === dateStr;
          return (
            <motion.button
              key={dateStr}
              className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                isSelected
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-green-400'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNext({ date: dateStr })}
            >
              <div className="font-medium">
                {date.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {data.date && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Siguiente →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TimeSelection({ onNext, data }: { onNext: (data: Partial<ReservationData>) => void; data: ReservationData }) {
  const times = ['18:00', '19:00', '20:00', '21:00'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">¿A qué hora?</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {times.map((time) => (
          <motion.button
            key={time}
            className={`p-4 rounded-xl border-2 transition-colors ${
              data.time === time
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'border-gray-300 text-gray-700 hover:border-green-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNext({ time })}
          >
            <div className="font-medium text-lg">{time}</div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {data.time && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirmar reserva →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ConfirmationStep({ data }: { data: ReservationData }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-2xl">✓</span>
        </motion.div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">¡Reserva confirmada!</h3>
        <div className="bg-gray-50 rounded-xl p-4 text-left">
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>Personas:</strong> {data.guests}</div>
            <div><strong>Fecha:</strong> {formatDate(data.date)}</div>
            <div><strong>Hora:</strong> {data.time}</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Te hemos enviado la confirmación por WhatsApp
        </p>
      </div>
    </motion.div>
  );
}
