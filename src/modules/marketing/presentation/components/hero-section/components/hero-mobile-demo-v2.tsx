'use client';

import { motion } from 'framer-motion';

interface HeroMobileDemoV2Props {
  isInView: boolean;
}

export function HeroMobileDemoV2({ isInView }: HeroMobileDemoV2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: -15 }}
      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      role="img"
      aria-label="Demostración de interfaz de WhatsApp Business mostrando conversación automatizada con cliente"
      className="relative flex justify-center items-center w-full lg:justify-center"
      style={{ perspective: '1000px' }}
    >
      {/* Placeholder for WhatsApp Simulator */}
      <div className="w-full max-w-sm">
        <div className="relative">
          {/* iPhone frame placeholder */}
          <div className="w-full aspect-[9/19] bg-gradient-to-b from-gray-100 to-gray-200 rounded-[2.5rem] border-8 border-gray-300 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[1.8rem] p-4 flex flex-col">
              {/* Status bar */}
              <div className="h-6 bg-gray-100 rounded mb-4"></div>
              
              {/* Chat header */}
              <div className="h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-4 flex items-center px-4">
                <div className="w-10 h-10 bg-white/20 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/40 rounded w-24 mb-2"></div>
                  <div className="h-2 bg-white/30 rounded w-16"></div>
                </div>
              </div>
              
              {/* Messages placeholder */}
              <div className="flex-1 space-y-3 p-2">
                <div className="h-10 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-10 bg-green-100 rounded-lg w-1/2 ml-auto animate-pulse delay-75"></div>
                <div className="h-10 bg-gray-100 rounded-lg w-2/3 animate-pulse delay-150"></div>
                <div className="h-10 bg-green-100 rounded-lg w-1/3 ml-auto animate-pulse delay-200"></div>
              </div>
              
              {/* Input bar */}
              <div className="h-12 bg-gray-100 rounded-full flex items-center px-4">
                <div className="flex-1 h-6 bg-white rounded-full mr-2"></div>
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Floating badge */}
          <motion.div
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            WhatsApp Business
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}