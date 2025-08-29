'use client';

import { useEffect,useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { MessageCircle, Phone,X } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Floating WhatsApp CTA Component
 * 
 * A floating action button that appears after scroll with pulse animation,
 * tooltip, and ripple effect when clicked.
 */
export function FloatingWhatsAppCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show button after scrolling 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
        // Show tooltip after 2 seconds if user hasn't interacted
        if (!hasInteracted) {
          setTimeout(() => setShowTooltip(true), 2000);
        }
      } else {
        setIsVisible(false);
        setShowTooltip(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [hasInteracted]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowTooltip(false);
    // Open WhatsApp with pre-filled message
    window.open(
      'https://wa.me/1234567890?text=Hello! I\'m interested in learning more about your WhatsApp Cloud API platform.',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
    setHasInteracted(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 100 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
          }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                className="absolute bottom-16 right-0 mb-2"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative bg-white rounded-lg shadow-xl border p-4 max-w-xs">
                  <motion.button
                    onClick={handleTooltipClose}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Need help getting started?
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        Chat with our WhatsApp experts and get your API set up in minutes!
                      </p>
                      <div className="flex items-center text-xs text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        Usually replies instantly
                      </div>
                    </div>
                  </div>

                  {/* Tooltip arrow */}
                  <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main CTA Button */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400"
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />

            {/* Button */}
            <motion.div
              className="relative"
              onClick={handleClick}
              whileHover={{
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 shadow-xl relative overflow-hidden group"
              >
                {/* Ripple effect background */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* WhatsApp icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <MessageCircle className="w-8 h-8 text-white fill-current" />
                </motion.div>

                {/* Notification dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <span className="text-xs text-white font-bold">!</span>
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating particles */}
          <motion.div
            className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{
              y: [-10, -20, -10],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute -bottom-2 -right-2 w-1.5 h-1.5 bg-blue-400 rounded-full"
            animate={{
              y: [5, -5, 5],
              x: [-2, 2, -2],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}