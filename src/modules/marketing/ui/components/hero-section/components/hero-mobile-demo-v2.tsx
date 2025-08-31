'use client';

import { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';

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

interface HeroMobileDemoV2Props {
  isInView: boolean;
}

type MessagePhase = 'initial' | 'customer_typing1' | 'customer1' | 'message_read1' | 'badge_ai' | 'bot_typing1' | 'bot1' | 'customer_typing2' | 'customer2' | 'message_read2' | 'bot_typing2' | 'bot2' | 'badge_flow' | 'flow' | 'badge_crm' | 'complete';

type FlowStep = 'guests' | 'date' | 'time' | 'confirmation';

type BadgeType = 'ai' | 'flow' | 'crm';

interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

interface FlowStepProps {
  onNext: (data: Partial<ReservationData>) => void;
  data: ReservationData;
}

interface DynamicBadge {
  id: BadgeType;
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  arrowDirection: 'down' | 'up' | 'left' | 'right';
}

const DYNAMIC_BADGES: Record<BadgeType, DynamicBadge> = {
  ai: {
    id: 'ai',
    icon: Brain,
    title: 'Respuesta con IA',
    subtitle: 'Entiende contexto natural',
    color: 'text-purple-100',
    bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    position: { top: '30%', right: '-160px' },
    arrowDirection: 'left'
  },
  flow: {
    id: 'flow',
    icon: Settings,
    title: 'Proceso Mejorado',
    subtitle: 'WhatsApp Flow nativo',
    color: 'text-yellow-100',
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    position: { bottom: '40%', right: '-160px' },
    arrowDirection: 'left'
  },
  crm: {
    id: 'crm',
    icon: Database,
    title: 'Integración CRM',
    subtitle: 'Datos sincronizados automáticamente',
    color: 'text-blue-100',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    position: { top: '30%', left: '-170px' },
    arrowDirection: 'right'
  }
};

/**
 * Hero Section Mobile Demo V2 Component
 * Enhanced version with educational badges that appear at key moments
 * to showcase the value proposition of each feature
 */
export function HeroMobileDemoV2({ isInView }: HeroMobileDemoV2Props) {
  const [messagePhase, setMessagePhase] = useState<MessagePhase>('initial');
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [message1Read, setMessage1Read] = useState(false);
  const [message2Read, setMessage2Read] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('guests');
  const [activeBadge, setActiveBadge] = useState<BadgeType | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData>({
    guests: 0,
    date: '',
    time: ''
  });

  // Enhanced animation sequence with badges and slower timing
  useEffect(() => {
    if (!isInView) return;

    const sequence = [
      { phase: 'customer_typing1' as MessagePhase, delay: 4500, badge: null },
      { phase: 'customer1' as MessagePhase, delay: 5000, badge: null },
      { phase: 'message_read1' as MessagePhase, delay: 5200, badge: null },
      { phase: 'badge_ai' as MessagePhase, delay: 5800, badge: 'ai' as BadgeType },
      { phase: 'bot_typing1' as MessagePhase, delay: 6000, badge: null },
      { phase: 'bot1' as MessagePhase, delay: 7000, badge: null },
      { phase: 'customer_typing2' as MessagePhase, delay: 9500, badge: null },
      { phase: 'customer2' as MessagePhase, delay: 10000, badge: null },
      { phase: 'message_read2' as MessagePhase, delay: 10200, badge: null },
      { phase: 'bot_typing2' as MessagePhase, delay: 11000, badge: null },
      { phase: 'bot2' as MessagePhase, delay: 12000, badge: null },
      { phase: 'badge_flow' as MessagePhase, delay: 14000, badge: 'flow' as BadgeType },
      { phase: 'flow' as MessagePhase, delay: 15500, badge: null },
      { phase: 'badge_crm' as MessagePhase, delay: 21000, badge: 'crm' as BadgeType },
      { phase: 'complete' as MessagePhase, delay: 23000, badge: null },
    ];

    const timers: NodeJS.Timeout[] = [];

    sequence.forEach(({ phase, delay, badge }) => {
      const timer = setTimeout(() => {
        // Handle typing states
        if (phase === 'customer_typing1' || phase === 'customer_typing2') {
          setIsCustomerTyping(true);
          setIsBotTyping(false);
        } else if (phase === 'bot_typing1' || phase === 'bot_typing2') {
          setIsCustomerTyping(false);
          setIsBotTyping(true);
        } else {
          setIsCustomerTyping(false);
          setIsBotTyping(false);
        }

        // Handle read states
        if (phase === 'message_read1') {
          setMessage1Read(true);
        } else if (phase === 'message_read2') {
          setMessage2Read(true);
        }

        // Handle badge display
        if (badge) {
          setActiveBadge(badge);
        } else if (phase !== 'badge_ai' && phase !== 'badge_flow' && phase !== 'badge_crm') {
          // Clear badge unless we're in a badge phase
          setActiveBadge(null);
        }

        // Handle flow display
        if (phase === 'flow') {
          setShowFlow(true);
          startFlowSequence();
        }

        setMessagePhase(phase);
      }, delay);
      timers.push(timer);
    });

    // Auto-restart animation after longer duration
    const restartTimer = setTimeout(() => {
      setMessagePhase('initial');
      setIsCustomerTyping(false);
      setIsBotTyping(false);
      setMessage1Read(false);
      setMessage2Read(false);
      setShowFlow(false);
      setFlowStep('guests');
      setActiveBadge(null);
      setReservationData({ guests: 0, date: '', time: '' });
    }, 30000);
    timers.push(restartTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isInView]);

  // Flow sequence controller with slower transitions
  const startFlowSequence = () => {
    const flowSequence = [
      { step: 'guests' as FlowStep, delay: 1500 },
      { step: 'date' as FlowStep, delay: 4000 },
      { step: 'time' as FlowStep, delay: 6500 },
      { step: 'confirmation' as FlowStep, delay: 9000 },
    ];

    const flowTimers: NodeJS.Timeout[] = [];

    flowSequence.forEach(({ step, delay }) => {
      const timer = setTimeout(() => {
        setFlowStep(step);
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
      flowTimers.push(timer);
    });

    // Close flow after confirmation with longer display time
    const closeTimer = setTimeout(() => {
      setShowFlow(false);
    }, 10500);
    flowTimers.push(closeTimer);
  };

  const handleFlowNext = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  // Enhanced Badge Component
  const DynamicBadgeDisplay = ({ badge }: { badge: DynamicBadge }) => {
    const IconComponent = badge.icon;

    return (
      <motion.div
        className={`
          absolute z-60 ${badge.bgColor} ${badge.color} rounded-2xl shadow-2xl border border-white/20
          
          /* Mobile styles */
          min-w-[140px] p-3 text-xs
          
          /* Desktop styles */
          sm:min-w-[160px] sm:p-4 sm:text-sm
          
          /* Hide on very small screens to avoid clipping */
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
        {/* Badge content */}
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
  };

  // Enhanced Flow Step Components with Next buttons
  const GuestSelection = ({ onNext, data }: FlowStepProps) => (
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

  const DateSelection = ({ onNext, data }: FlowStepProps) => {
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
  };

  const TimeSelection = ({ onNext, data }: FlowStepProps) => {
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
  };

  const ConfirmationStep = ({ data }: { data: ReservationData }) => {
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
  };

  return (
    <motion.div
      className="relative flex justify-center items-center w-full lg:justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración avanzada de interfaz de WhatsApp Business con badges educativos"
    >
      <div className="relative p-8" style={{ perspective: '1000px' }}>
        {/* iPhone 15 Pro Style Frame */}
        <motion.div
          className="relative mx-auto w-[300px] sm:w-[340px] lg:w-[360px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Phone outer frame with enhanced realism */}
          <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.2rem] p-[2px]">
            {/* Enhanced side buttons */}
            <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-lg"></div>
            <div className="absolute -left-[2px] top-28 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>
            <div className="absolute -left-[2px] top-40 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg"></div>

            {/* Inner bezel with realistic depth */}
            <div className="bg-black rounded-[3rem] p-[6px]">
              {/* Screen container with anti-glare effect */}
              <div className="relative bg-white dark:bg-gray-900 rounded-[2.7rem] overflow-hidden" style={{ aspectRatio: '390/844' }}>
                {/* Dynamic Island with realistic depth */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-30">
                  {/* Camera and sensor dots */}
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 bg-gray-700 rounded-full"></div>
                </div>

                {/* WhatsApp Interface */}
                <div className="h-full flex flex-col">
                  {/* WhatsApp Header with enhanced realism */}
                  <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white pt-14 pb-3 px-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      {/* Profile picture with better styling */}
                      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg font-bold">TN</span>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Tu Negocio</div>
                        <motion.div
                          className="text-xs opacity-90 flex items-center gap-1"
                          key={isBotTyping ? 'typing' : 'online'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isBotTyping ? (
                            <>
                              <div className="flex gap-1">
                                <motion.div
                                  className="w-1 h-1 bg-green-300 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity }}
                                />
                                <motion.div
                                  className="w-1 h-1 bg-green-300 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                />
                                <motion.div
                                  className="w-1 h-1 bg-green-300 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                />
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

                  {/* Chat Messages with enhanced WhatsApp background */}
                  <div className="flex-1 bg-[#e5ddd5] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22whatsapp-bg%22%20patternUnits%3D%22userSpaceOnUse%22%20width%3D%2260%22%20height%3D%2260%22%3E%3Cpath%20d%3D%22M0%2030h60v30H0z%22%20fill%3D%22%23e5ddd5%22%20opacity%3D%22.8%22%2F%3E%3Cpath%20d%3D%22M0%200h60v30H0z%22%20fill%3D%22%23d9d0c7%22%20opacity%3D%22.8%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23whatsapp-bg)%22%2F%3E%3C%2Fsvg%3E')] p-4 space-y-3 overflow-hidden">

                    {/* Customer message 1 */}
                    <AnimatePresence>
                      {(messagePhase === 'customer1' || messagePhase === 'message_read1' || messagePhase === 'badge_ai' || messagePhase === 'bot_typing1' || messagePhase === 'bot1' || messagePhase === 'customer_typing2' || messagePhase === 'customer2' || messagePhase === 'message_read2' || messagePhase === 'bot_typing2' || messagePhase === 'bot2' || messagePhase === 'badge_flow' || messagePhase === 'flow' || messagePhase === 'badge_crm' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[80%] shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-900 leading-relaxed">Hola, ¿tienen disponible una mesa para 6 personas?</p>
                            <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                              <span>10:30</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.2 }}
                              >
                                <span className={message1Read ? 'text-blue-400' : 'text-gray-400'}>
                                  ✓✓
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot typing indicator 1 - appears AFTER customer message */}
                    <AnimatePresence>
                      {isBotTyping && messagePhase === 'bot_typing1' && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl rounded-tr-md px-3 py-2 shadow-sm border border-green-200">
                            <div className="flex gap-1 items-center py-1">
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot response 1 */}
                    <AnimatePresence>
                      {(messagePhase === 'bot1' || messagePhase === 'customer_typing2' || messagePhase === 'customer2' || messagePhase === 'message_read2' || messagePhase === 'bot_typing2' || messagePhase === 'bot2' || messagePhase === 'badge_flow' || messagePhase === 'flow' || messagePhase === 'badge_crm' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[80%] shadow-lg">
                            <p className="text-xs leading-relaxed">¡Claro que sí! ¿Te gustaría reservar? 😊</p>
                            <div className="text-[10px] opacity-90 mt-1 flex items-center justify-end gap-1">
                              <span>10:30</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                              >
                                <span className="text-blue-200">✓✓</span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Customer typing indicator 2 - appears AFTER bot message */}
                    <AnimatePresence>
                      {isCustomerTyping && messagePhase === 'customer_typing2' && (
                        <motion.div
                          className="flex"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 shadow-sm border border-gray-100">
                            <div className="flex gap-1 items-center py-1">
                              <motion.div
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Customer message 2 */}
                    <AnimatePresence>
                      {(messagePhase === 'customer2' || messagePhase === 'message_read2' || messagePhase === 'bot_typing2' || messagePhase === 'bot2' || messagePhase === 'badge_flow' || messagePhase === 'flow' || messagePhase === 'badge_crm' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[60%] shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-900">Sí</p>
                            <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                              <span>10:31</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.2 }}
                              >
                                <span className={message2Read ? 'text-blue-400' : 'text-gray-400'}>
                                  ✓✓
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot typing indicator 2 - appears AFTER customer message 2 */}
                    <AnimatePresence>
                      {isBotTyping && messagePhase === 'bot_typing2' && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl rounded-tr-md px-3 py-2 shadow-sm border border-green-200">
                            <div className="flex gap-1 items-center py-1">
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-1.5 h-1.5 bg-green-600 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot response 2 */}
                    <AnimatePresence>
                      {(messagePhase === 'bot2' || messagePhase === 'badge_flow' || messagePhase === 'flow' || messagePhase === 'badge_crm' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[85%] shadow-lg">
                            <p className="text-xs leading-relaxed">Perfecto, te voy a ayudar con la reserva 🍽️</p>

                            {/* Flow trigger button */}
                            {messagePhase === 'bot2' && (
                              <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-2 w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 text-xs font-medium transition-all"
                                onClick={() => setShowFlow(true)}
                              >
                                📅 Reservar mesa
                              </motion.button>
                            )}

                            <div className="text-[10px] opacity-90 mt-1 flex items-center justify-end gap-1">
                              <span>10:31</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                              >
                                <span className="text-blue-200">✓✓</span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Confirmation message after flow */}
                    <AnimatePresence>
                      {messagePhase === 'complete' && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[85%] shadow-lg">
                            <p className="text-xs leading-relaxed">¡Excelente! Tu reserva está confirmada. Te esperamos el {
                              reservationData.date ? new Date(reservationData.date).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              }) : 'día seleccionado'
                            } a las {reservationData.time}. ¡Gracias! 🎉</p>
                            <div className="text-[10px] opacity-90 mt-1 flex items-center justify-end gap-1">
                              <span>10:32</span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                              >
                                <span className="text-blue-200">✓✓</span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black bg-opacity-50" />

                        {/* Flow Panel */}
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
                          {/* Flow header */}
                          <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div>
                              <h2 className="font-semibold text-gray-900">Reserva tu mesa</h2>
                              <p className="text-sm text-gray-500">Paso {
                                flowStep === 'guests' ? '1' :
                                flowStep === 'date' ? '2' :
                                flowStep === 'time' ? '3' : '4'
                              } de 4</p>
                            </div>
                            <div className="flex gap-2">
                              {['guests', 'date', 'time', 'confirmation'].map((step, index) => (
                                <div
                                  key={step}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    flowStep === step ||
                                    (['guests', 'date', 'time', 'confirmation'].indexOf(flowStep) > index)
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
                              {flowStep === 'guests' && (
                                <GuestSelection
                                  key="guests"
                                  onNext={handleFlowNext}
                                  data={reservationData}
                                />
                              )}
                              {flowStep === 'date' && (
                                <DateSelection
                                  key="date"
                                  onNext={handleFlowNext}
                                  data={reservationData}
                                />
                              )}
                              {flowStep === 'time' && (
                                <TimeSelection
                                  key="time"
                                  onNext={handleFlowNext}
                                  data={reservationData}
                                />
                              )}
                              {flowStep === 'confirmation' && (
                                <ConfirmationStep
                                  key="confirmation"
                                  data={reservationData}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Educational Badges - Only show on larger screens */}
        <AnimatePresence>
          {activeBadge && (
            <div className="hidden sm:block">
              <DynamicBadgeDisplay badge={DYNAMIC_BADGES[activeBadge]} />
            </div>
          )}
        </AnimatePresence>

        {/* Mobile-friendly badges inside chat */}
        <AnimatePresence>
          {activeBadge && (() => {
            const badge = DYNAMIC_BADGES[activeBadge];
            const IconComponent = badge.icon;
            return (
              <motion.div
                className="sm:hidden absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-black/20 absolute inset-0" />
                <motion.div
                  className={`
                    ${badge.bgColor} 
                    ${badge.color} 
                    rounded-xl shadow-xl p-3 mx-4 max-w-[280px]
                    border border-white/20
                  `}
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: -20 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-bold text-sm">{badge.title}</span>
                  </div>
                  <p className="text-xs opacity-90">{badge.subtitle}</p>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}