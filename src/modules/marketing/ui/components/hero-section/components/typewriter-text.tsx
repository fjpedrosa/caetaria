'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
}

/**
 * Isolated client component for typewriter effect
 * Optimized to minimize client-side JavaScript impact
 */
export function TypewriterText({
  text,
  speed = 120,
  delay = 800,
  className = '',
  showCursor = true
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    // Delay the start of typewriter animation for smoother experience
    const startDelay = setTimeout(() => {
      setShouldStart(true);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [delay]);

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

  return (
    <>
      <span className={className}>
        {displayText}
      </span>
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-12 bg-secondary ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </>
  );
}