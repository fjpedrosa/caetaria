'use client';

import { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';

import {
  Menu,
  Phone,
  Video,
} from '@/lib/icons';
import { Icon } from '@/modules/shared/presentation/components/ui/icon';

interface HeroMobileDemoProps {
  isInView: boolean;
}

type MessagePhase = 'initial' | 'customer1' | 'typing1' | 'bot1' | 'customer2' | 'typing2' | 'bot2' | 'flow' | 'complete';

type FlowStep = 'guests' | 'date' | 'time' | 'confirmation';

interface ReservationData {
  guests: number;
  date: string;
  time: string;
}

interface FlowStepProps {
  onNext: (data: Partial<ReservationData>) => void;
  data: ReservationData;
}

/**
 * Hero Section Mobile Demo Component
 * Contains the mobile mockup with WhatsApp interface animation
 */
export function HeroMobileDemo({ isInView }: HeroMobileDemoProps) {
  const [messagePhase, setMessagePhase] = useState<MessagePhase>('initial');
  const [isTyping, setIsTyping] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('guests');
  const [reservationData, setReservationData] = useState<ReservationData>({
    guests: 2,
    date: '',
    time: ''
  });

  // Animation sequence controller
  useEffect(() => {
    if (!isInView) return;

    const sequence = [
      { phase: 'customer1' as MessagePhase, delay: 1000 },
      { phase: 'typing1' as MessagePhase, delay: 1500 },
      { phase: 'bot1' as MessagePhase, delay: 2000 },
      { phase: 'customer2' as MessagePhase, delay: 3500 },
      { phase: 'typing2' as MessagePhase, delay: 4000 },
      { phase: 'bot2' as MessagePhase, delay: 4500 },
      { phase: 'flow' as MessagePhase, delay: 6000 },
      { phase: 'complete' as MessagePhase, delay: 10000 },
    ];

    const timers: NodeJS.Timeout[] = [];

    sequence.forEach(({ phase, delay }) => {
      const timer = setTimeout(() => {
        if (phase === 'typing1' || phase === 'typing2') {
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
        if (phase === 'flow') {
          setShowFlow(true);
          startFlowSequence();
        }
        setMessagePhase(phase);
      }, delay);
      timers.push(timer);
    });

    // Auto-restart animation
    const restartTimer = setTimeout(() => {
      setMessagePhase('initial');
      setIsTyping(false);
      setShowFlow(false);
      setFlowStep('guests');
      setReservationData({ guests: 2, date: '', time: '' });
    }, 20000);
    timers.push(restartTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isInView, messagePhase === 'complete']);

  // Flow sequence controller
  const startFlowSequence = () => {
    const flowSequence = [
      { step: 'guests' as FlowStep, delay: 3000 },
      { step: 'date' as FlowStep, delay: 6000 },
      { step: 'time' as FlowStep, delay: 9000 },
      { step: 'confirmation' as FlowStep, delay: 12000 },
    ];

    const flowTimers: NodeJS.Timeout[] = [];

    flowSequence.forEach(({ step, delay }) => {
      const timer = setTimeout(() => {
        setFlowStep(step);
        if (step === 'guests') {
          setReservationData(prev => ({ ...prev, guests: 4 }));
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

    // Close flow after confirmation
    const closeTimer = setTimeout(() => {
      setShowFlow(false);
    }, 15000);
    flowTimers.push(closeTimer);
  };

  const handleFlowNext = (data: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...data }));
  };

  // Flow Step Components
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
      className="relative flex justify-center items-center w-full lg:justify-end"
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración de interfaz de WhatsApp Business mostrando conversación automatizada con cliente"
    >
      <div className="relative" style={{ perspective: '1000px' }}>
        {/* iPhone 15 Pro Style Frame */}
        <motion.div
          className="relative mx-auto w-[300px] sm:w-[340px] lg:w-[360px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Phone outer frame with enhanced realism */}
          <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.2rem] p-[2px] shadow-2xl shadow-black/50">
            {/* Enhanced side buttons */}
            <div className="absolute -right-[2px] top-32 w-[3px] h-16 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-lg shadow-inner"></div>
            <div className="absolute -left-[2px] top-28 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg shadow-inner"></div>
            <div className="absolute -left-[2px] top-40 w-[3px] h-10 bg-gradient-to-b from-gray-600 to-gray-800 rounded-l-lg shadow-inner"></div>

            {/* Inner bezel with realistic depth */}
            <div className="bg-black rounded-[3rem] p-[6px] shadow-inner">
              {/* Screen container with anti-glare effect */}
              <div className="relative bg-white dark:bg-gray-900 rounded-[2.7rem] overflow-hidden shadow-inner" style={{ aspectRatio: '390/844' }}>
                {/* Dynamic Island with realistic depth */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-30 shadow-lg">
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
                          key={isTyping ? 'typing' : 'online'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isTyping ? (
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
                      {messagePhase !== 'initial' && (
                        <motion.div
                          className="flex"
                          initial={{ x: -50, opacity: 0, scale: 0.8 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[80%] shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-900 leading-relaxed">¡Hola! ¿Tienen disponible...?</p>
                            <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                              <span>10:30</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot response 1 */}
                    <AnimatePresence>
                      {(messagePhase === 'bot1' || messagePhase === 'customer2' || messagePhase === 'typing2' || messagePhase === 'bot2' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ x: 50, opacity: 0, scale: 0.8 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[80%] shadow-lg">
                            <p className="text-xs leading-relaxed">¡Hola! Sí tenemos disponible. Te ayudo ahora mismo 😊</p>
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

                    {/* Customer message 2 */}
                    <AnimatePresence>
                      {(messagePhase === 'customer2' || messagePhase === 'typing2' || messagePhase === 'bot2' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex"
                          initial={{ x: -50, opacity: 0, scale: 0.8 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 max-w-[60%] shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-900">Perfecto, ¿cuál es el precio?</p>
                            <div className="text-[10px] text-gray-500 mt-1">10:31</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bot response 2 */}
                    <AnimatePresence>
                      {(messagePhase === 'bot2' || messagePhase === 'flow' || messagePhase === 'complete') && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ x: 50, opacity: 0, scale: 0.8 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                          <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[85%] shadow-lg">
                            <p className="text-xs leading-relaxed">¡Perfecto! Tenemos mesa disponible para hoy. ¿Te gustaría hacer una reserva? 🍽️</p>

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
                          initial={{ x: 50, opacity: 0, scale: 0.8 }}
                          animate={{ x: 0, opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
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

                    {/* Enhanced typing indicator that appears during typing phases */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gray-200 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                            <div className="flex gap-1 items-center">
                              <motion.div
                                className="w-2 h-2 bg-gray-500 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-gray-500 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-gray-500 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              />
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
                            duration: 0.4
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




      </div>
    </motion.div>
  );
}