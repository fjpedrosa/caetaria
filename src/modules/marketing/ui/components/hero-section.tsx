'use client';

import { useEffect,useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedIcon,Icon } from '@/components/ui/icon';
import { 
  Activity,
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  Users,
  Zap, 
} from '@/lib/icons';
import { MARKETING_COPY } from '@/modules/marketing/domain/copy';

// Improved typewriter effect hook with smoother animation
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    // Delay the start of typewriter animation for smoother experience
    const startDelay = setTimeout(() => {
      setShouldStart(true);
    }, 800); // Wait 800ms before starting typewriter
      
    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!shouldStart) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, shouldStart]);

  return displayText;
}

// Counter animation hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(end * easeOut));
      
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration, isVisible]);
  
  return { count, setIsVisible };
}

/**
 * Hero Section Component - Client Component
 * Main hero with mobile mockup and CTA with advanced animations
 */
export function HeroSection() {
  const { badge, title, subtitle, description, cta, metrics } = MARKETING_COPY.hero;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Delay animations to prevent initial chaos
  useEffect(() => {
    if (isInView && !prefersReducedMotion) {
      const delay = setTimeout(() => {
        setAnimationsReady(true);
      }, 1000); // Wait 1 second after section is in view
      
      return () => clearTimeout(delay);
    }
  }, [isInView, prefersReducedMotion]);
  
  const typewriterText = useTypewriter(subtitle, 120); // Slower speed for smoother effect
  const messagesCounter = useCounter(10000);
  const businessesCounter = useCounter(500);
  const uptimeCounter = useCounter(99.9);
  
  // Trigger counters when in view
  useEffect(() => {
    if (isInView) {
      messagesCounter.setIsVisible(true);
      businessesCounter.setIsVisible(true);
      uptimeCounter.setIsVisible(true);
    }
  }, [isInView]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden"
      aria-label="Sección principal de presentación"
    >
      {/* Animated Background Elements - Only render if motion is preferred and ready */}
      {!prefersReducedMotion && animationsReady && (
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-2xl"
          initial={{ scale: 1, opacity: 0.2 }}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-72 h-72 bg-primary/12 rounded-full mix-blend-multiply filter blur-2xl"
          initial={{ scale: 1, opacity: 0.15 }}
          animate={{ 
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-2xl"
          initial={{ scale: 1, opacity: 0.1 }}
          animate={{ 
            scale: [1, 1.04, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />

        {/* Mobile-optimized floating particles - reduced count and complexity */}
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full sm:w-1.5 sm:h-1.5 sm:bg-primary/40"
            style={{
              left: `${30 + (i * 40)}%`, // More spaced out for better mobile performance
              top: `${45 + (i * 10)}%`,
            }}
            initial={{ y: 0, opacity: 0.1 }}
            animate={{
              y: [-6, 6, -6],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 16 + (i * 4), // Slower for better battery life
              repeat: Infinity,
              delay: 4 + (i * 3), // Longer stagger
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      )}

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 xl:gap-12 items-center justify-items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
          
          {/* Left: Content */}
          <motion.div 
            className="space-y-8 w-full max-w-xl lg:max-w-lg xl:max-w-xl lg:justify-self-end"
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReducedMotion ? 0 : -50 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Badge className="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 px-3 py-1.5 text-xs font-medium inline-flex items-center">
                <Icon icon={Sparkles} size="small" iconClassName="w-3 h-3 mr-1.5 opacity-70" />
                {badge}
              </Badge>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                {title}
                <motion.span 
                  className="block text-primary mt-2 min-h-[3rem] md:min-h-[4rem] lg:min-h-[3rem]"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {isInView ? typewriterText : ''}
                  <motion.span
                    className="inline-block w-0.5 h-12 bg-secondary ml-1"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                {description}
              </motion.p>
            </div>

            {/* Animated Metrics */}
            <motion.div 
              className="flex flex-wrap gap-3 sm:gap-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              role="region"
              aria-label="Estadísticas de la plataforma"
            >
              <motion.div 
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-primary/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                aria-label={`${messagesCounter.count.toLocaleString()} mensajes procesados en la plataforma`}
              >
                <motion.div 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  aria-hidden="true"
                />
                <Icon icon={MessageCircle} size="small" iconClassName="text-primary" aria-hidden="true" />
                <span className="text-foreground font-semibold">{messagesCounter.count.toLocaleString()}+ mensajes</span>
              </motion.div>
              <motion.div 
                className="hidden sm:flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-secondary/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                aria-label={`${businessesCounter.count} empresas utilizan la plataforma`}
              >
                <motion.div 
                  className="w-3 h-3 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  aria-hidden="true"
                />
                <Icon icon={Users} size="small" iconClassName="text-secondary" aria-hidden="true" />
                <span className="text-foreground font-semibold">{businessesCounter.count}+ empresas</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-success/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                aria-label={`${uptimeCounter.count}% de tiempo de actividad garantizado`}
              >
                <motion.div 
                  className="w-3 h-3 bg-success rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  aria-hidden="true"
                />
                <Icon icon={Activity} size="small" iconClassName="text-success" aria-hidden="true" />
                <span className="text-foreground font-semibold">{uptimeCounter.count}% uptime</span>
              </motion.div>
            </motion.div>

            {/* Enhanced CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 1.2 }}
            >
              <Link 
                href="/onboarding"
                aria-label="Comenzar proceso de registro para prueba gratuita"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="btn-primary shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 group relative overflow-hidden px-8 py-6 text-lg"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <AnimatedIcon icon={Zap} size="medium" hover animationType="pulse" iconClassName="text-current" />
                      {cta.primary}
                      <Icon icon={ArrowRight} size="medium" iconClassName="text-current group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
              
            </motion.div>
          </motion.div>

          {/* Right: Enhanced Mobile Mockup with 3D */}
          <motion.div 
            className="relative flex justify-center lg:justify-start lg:pl-4"
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: -15 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ perspective: 1000 }}
            role="img"
            aria-label="Demostración de interfaz de WhatsApp Business mostrando conversación automatizada con cliente"
          >
            <motion.div 
              className="relative"
              animate={{ 
                rotateY: [-2, 2, -2],
                rotateX: [-1, 1, -1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Enhanced iPhone Frame - Mobile optimized */}
              <motion.div 
                className="bg-black rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-xl sm:shadow-2xl relative max-w-[280px] sm:max-w-[320px] mx-auto"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02, rotateY: prefersReducedMotion ? 0 : 3 }}
                transition={{ duration: 0.4 }}
              >
                {/* iPhone Notch - Responsive */}
                <div className="absolute top-3 sm:top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 sm:w-24 sm:h-6 bg-black rounded-full z-10"></div>
                
                {/* iPhone Screen - Responsive sizing */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden w-[260px] h-[520px] sm:w-[320px] sm:h-[650px] relative">
                  
                  {/* Animated WhatsApp Header */}
                  <motion.div 
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 flex items-center gap-3 relative"
                    initial={{ y: -20, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon icon={MessageCircle} size="medium" iconClassName="text-white" />
                    </motion.div>
                    <div>
                      <div className="font-semibold">Tu Negocio</div>
                      <motion.div 
                        className="text-xs opacity-90 flex items-center gap-1"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                        En línea ahora
                      </motion.div>
                    </div>
                    
                    {/* Floating notification */}
                    <motion.div
                      className="absolute -right-2 -top-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                    >
                      3
                    </motion.div>
                  </motion.div>

                  {/* Animated Chat Messages */}
                  <div className="bg-[#e5ddd5] p-4 space-y-3 h-full relative">
                    {/* Customer message */}
                    <motion.div 
                      className="flex"
                      initial={{ x: -100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <div className="bg-white rounded-lg rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900">Hola, ¿tienen disponible el producto X?</p>
                        <div className="text-xs text-gray-500 mt-1">10:30</div>
                      </div>
                    </motion.div>

                    {/* Bot response */}
                    <motion.div 
                      className="flex justify-end"
                      initial={{ x: 100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                      transition={{ delay: 1.8, duration: 0.5 }}
                    >
                      <div className="bg-[#d9fdd3] rounded-lg rounded-br-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900">¡Hola! Sí, tenemos disponible. ¿Te gustaría conocer los precios?</p>
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                          10:31 
                          <motion.span
                            animate={{ opacity: [0, 1] }}
                            transition={{ delay: 2, duration: 0.3 }}
                          >
                            ✓✓
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Customer message */}
                    <motion.div 
                      className="flex"
                      initial={{ x: -100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                      transition={{ delay: 2.2, duration: 0.5 }}
                    >
                      <div className="bg-white rounded-lg rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900">Sí, por favor</p>
                        <div className="text-xs text-gray-500 mt-1">10:31</div>
                      </div>
                    </motion.div>

                    {/* Enhanced Bot typing */}
                    <motion.div 
                      className="flex justify-end"
                      initial={{ x: 100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                      transition={{ delay: 2.5, duration: 0.5 }}
                    >
                      <div className="bg-[#d9fdd3] rounded-lg rounded-br-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <motion.div 
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{ y: [-2, 0, -2] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{ y: [-2, 0, -2] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                          />
                          <motion.div 
                            className="w-2 h-2 bg-gray-500 rounded-full"
                            animate={{ y: [-2, 0, -2] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Floating badges */}
              <motion.div 
                className="z-10 absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border-2 border-primary/20"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  Respuesta automática
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  &lt; 1s
                </div>
              </motion.div>
              
              {/* Additional floating element */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-2 border border-emerald-200"
                animate={{ 
                  x: [0, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">Online</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}