'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon, IconWithText, AnimatedIcon } from '@/components/ui/icon';
import { 
  MessageCircle, 
  ArrowRight, 
  PlayCircle, 
  Sparkles, 
  Zap, 
  Users,
  Activity,
  CheckCircle,
  Star,
  TrendingUp
} from '@/lib/icons';
import Link from 'next/link';
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
    
    let startTime = Date.now();
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
    <section ref={ref} className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
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
        
        {/* Floating particles - minimal and very smooth */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
            style={{
              left: `${25 + (i * 25)}%`, // More spaced out positions
              top: `${40 + (i * 10)}%`,
            }}
            initial={{ y: 0, opacity: 0.2 }}
            animate={{
              y: [-8, 8, -8],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 12 + (i * 3), // Much slower and more synchronized
              repeat: Infinity,
              delay: 3 + (i * 2), // Longer initial delay + stagger
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      )}

      <div className="relative container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left: Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Badge className="bg-primary text-white dark:bg-primary/20 dark:text-primary hover:bg-primary-hover px-4 py-2 shadow-md border-0">
                <Icon icon={Sparkles} size="small" iconClassName="w-4 h-4 mr-2" />
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
                  className="block text-primary mt-2"
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
              className="flex gap-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              <motion.div 
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Icon icon={MessageCircle} size="small" iconClassName="text-primary" />
                <span className="text-foreground font-semibold">{messagesCounter.count.toLocaleString()}+ mensajes</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-secondary/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-secondary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <Icon icon={Users} size="small" iconClassName="text-secondary" />
                <span className="text-foreground font-semibold">{businessesCounter.count}+ empresas</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-success/20 shadow-sm"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-success rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <Icon icon={Activity} size="small" iconClassName="text-success" />
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
              <Link href="/onboarding">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="btn-primary shadow-lg hover:shadow-xl group relative overflow-hidden px-8 py-6 text-lg"
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
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50, rotateY: -15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 50, rotateY: -15 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ perspective: 1000 }}
          >
            <motion.div 
              className="relative"
              animate={{ 
                rotateY: [-2, 2, -2],
                rotateX: [-1, 1, -1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Enhanced Phone Frame */}
              <motion.div 
                className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] overflow-hidden w-[320px] h-[650px] relative">
                  
                  {/* Animated WhatsApp Header */}
                  <motion.div 
                    className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex items-center gap-3 relative"
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
                        <div className="w-2 h-2 bg-green-300 rounded-full" />
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
                  <div className="bg-white dark:bg-[#0b141a] p-4 space-y-3 h-full relative">
                    {/* Customer message */}
                    <motion.div 
                      className="flex"
                      initial={{ x: -100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      <div className="bg-gray-100 dark:bg-[#1f2c33] rounded-lg rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100">Hola, ¿tienen disponible el producto X?</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:30</div>
                      </div>
                    </motion.div>

                    {/* Bot response */}
                    <motion.div 
                      className="flex justify-end"
                      initial={{ x: 100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                      transition={{ delay: 1.8, duration: 0.5 }}
                    >
                      <div className="bg-[#d9fdd3] dark:bg-[#005d4b] rounded-lg rounded-br-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100">¡Hola! Sí, tenemos disponible. ¿Te gustaría conocer los precios?</p>
                        <div className="text-xs text-gray-500 dark:text-gray-300 mt-1 flex items-center justify-end gap-1">
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
                      <div className="bg-gray-100 dark:bg-[#1f2c33] rounded-lg rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-100">Sí, por favor</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:31</div>
                      </div>
                    </motion.div>

                    {/* Enhanced Bot typing */}
                    <motion.div 
                      className="flex justify-end"
                      initial={{ x: 100, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
                      transition={{ delay: 2.5, duration: 0.5 }}
                    >
                      <div className="bg-[#d9fdd3] dark:bg-[#005d4b] rounded-lg rounded-br-sm px-4 py-3 shadow-sm">
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
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border-2 border-primary/20"
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
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-2 border border-green-200"
                animate={{ 
                  x: [0, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-700">Online</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}