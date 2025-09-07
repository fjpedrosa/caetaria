'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

import { HeroContent } from './components/hero-content';
import { HeroMobileDemo } from './components/hero-mobile-demo';

export function HeroSection() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

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
      }, 1000);

      return () => clearTimeout(delay);
    }
  }, [isInView, prefersReducedMotion]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen"
      aria-label="Sección principal de presentación"
    >
      {/* Glass Morphism Elements */}
      <div className="glass-circle w-32 h-32 right-1/4 animate-[glass-float_8s_ease-in-out_infinite]" />
      <div className="glass-circle w-24 h-24 bottom-32 left-1/3 animate-[glass-float_10s_ease-in-out_infinite_reverse]" />

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
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-72 h-72 bg-primary/12 rounded-full mix-blend-multiply filter blur-2xl"
          initial={{ scale: 1, opacity: 0.15 }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-2xl"
          initial={{ scale: 1, opacity: 0.1 }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
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
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      )}

      <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] xl:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 xl:gap-20 items-center min-h-[70vh] sm:min-h-[75vh] md:min-h-[80vh]">
          {/* Left: Content - más espacio para el contenido */}
          <HeroContent
            isInView={isInView}
            prefersReducedMotion={prefersReducedMotion}
          />

          {/* Right: Mobile Mockup - menos espacio ya que tiene espacio vacío */}
          <HeroMobileDemo isInView={isInView} />
          {/* <HeroMobileDemoV2 isInView={true} /> */}
        </div>
      </div>
    </section>
  );
}