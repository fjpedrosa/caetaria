'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TrailDot {
  x: number;
  y: number;
  id: number;
}

/**
 * Cursor Trail Component
 * 
 * Creates a trailing effect behind the cursor with animated dots
 * that follow the mouse movement with staggered timing.
 */
export function CursorTrail() {
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  
  // Handle tab visibility changes for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize component with delay to prevent initial chaos
  useEffect(() => {
    const initDelay = setTimeout(() => {
      setIsReady(true);
    }, 500); // Wait 500ms before activating trail
    
    return () => clearTimeout(initDelay);
  }, []);

  useEffect(() => {
    if (!isReady || !hasMouseMoved) return;
    
    let animationFrameId: number;
    let trailId = 0;
    let lastUpdateTime = 0;
    const THROTTLE_MS = 80; // Even slower for ultra-smooth experience

    const updateTrail = (currentTime: number) => {
      // Throttle updates for better performance
      if (currentTime - lastUpdateTime < THROTTLE_MS) {
        animationFrameId = requestAnimationFrame(updateTrail);
        return;
      }
      
      lastUpdateTime = currentTime;
      
      setTrail(currentTrail => {
        const newTrail = [...currentTrail];
        
        // Only add dot if we have valid mouse position and mouse has actually moved
        if (mousePosition.x > 0 && mousePosition.y > 0 && hasMouseMoved) {
          newTrail.push({
            x: mousePosition.x,
            y: mousePosition.y,
            id: trailId++
          });
        }

        // Keep only the last 2 dots for minimal visual impact
        if (newTrail.length > 2) {
          newTrail.shift();
        }

        return newTrail;
      });

      animationFrameId = requestAnimationFrame(updateTrail);
    };

    animationFrameId = requestAnimationFrame(updateTrail);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mousePosition, isTabVisible, isReady, hasMouseMoved]);
  
  // Separate effect for mouse tracking
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }
    };

    // Only add listeners on desktop and when user prefers motion and tab is visible
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isMobile && !prefersReducedMotion && isTabVisible && isReady) {
      document.addEventListener('mousemove', updateMousePosition);
    }

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
    };
  }, [isTabVisible, isReady, hasMouseMoved]);

  // Don't render on mobile devices
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile || !isReady || !hasMouseMoved) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            left: dot.x - 3,
            top: dot.y - 3,
            background: `linear-gradient(45deg, 
              rgba(250, 204, 21, ${0.4 - index * 0.15}), 
              rgba(37, 99, 235, ${0.4 - index * 0.15})
            )`,
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: 0, 
            scale: 0.4,
            x: (Math.random() - 0.5) * 3, // More predictable, less chaotic movement
            y: (Math.random() - 0.5) * 3, // More predictable, less chaotic movement
          }}
          transition={{ 
            duration: 2, // Even slower for ultra-smooth effect
            ease: "easeOut",
            delay: index * 0.15 // Slightly more stagger
          }}
        />
      ))}
    </div>
  );
}