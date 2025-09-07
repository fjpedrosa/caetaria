/**
 * Main mega menu panel component
 * Creates the professional dropdown panel with grid layout
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';

import { type MegaMenuConfig, type MegaMenuItem } from '../../../domain/types/mega-menu.types';
import { designTokens } from '../../styles/design-tokens';

import { MegaMenuColumnComponent } from './mega-menu-column';

interface MegaMenuPanelProps {
  config: MegaMenuConfig;
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (item: MegaMenuItem) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement>;
  panelRef?: (ref: HTMLDivElement | null) => void;
}

/**
 * Professional mega menu panel with sophisticated animations and layout
 */
export function MegaMenuPanel({
  config,
  isOpen,
  onClose,
  onItemClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  triggerRef,
  panelRef: externalPanelRef,
}: MegaMenuPanelProps) {
  const internalPanelRef = useRef<HTMLDivElement>(null);
  const panelRef = internalPanelRef;
  const [position, setPosition] = useState<'left' | 'center' | 'right'>('center');

  // Calculate optimal position based on trigger location
  useEffect(() => {
    if (!triggerRef?.current || !panelRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const panelWidth = panelRef.current!.offsetWidth;
      const windowWidth = window.innerWidth;

      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const leftSpace = triggerCenter;
      const rightSpace = windowWidth - triggerCenter;

      // Determine best position to avoid overflow
      if (leftSpace < panelWidth / 2) {
        setPosition('left');
      } else if (rightSpace < panelWidth / 2) {
        setPosition('right');
      } else {
        setPosition('center');
      }
    };

    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      return () => window.removeEventListener('resize', calculatePosition);
    }
  }, [isOpen, triggerRef]);

  // Panel width classes based on config
  const widthClasses = {
    sm: 'w-fit max-w-md',
    md: 'w-fit max-w-2xl',
    lg: 'w-fit max-w-4xl',
    xl: 'w-fit max-w-5xl',
    full: 'w-fit max-w-7xl',
  };

  // Panel animation variants
  const panelVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: {
        duration: 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Position styles
  const positionStyles = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0',
  };

  // Calculate grid columns based on content
  const gridCols = `grid-cols-${Math.min(config.columns.length, 4)}`;

  // Calculate panel and arrow position based on trigger
  const [panelPosition, setPanelPosition] = useState({ left: '50%', transform: 'translateX(-50%)' });
  const [arrowPosition, setArrowPosition] = useState(0);
  const prevArrowPosition = useRef(0);

  useEffect(() => {
    if (triggerRef?.current && isOpen) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const panelWidth = 800; // Adjusted width for content-only layout

      // Calculate ideal panel position (centered under trigger)
      const idealLeft = triggerRect.left + (triggerRect.width / 2) - (panelWidth / 2);

      // Adjust if panel would overflow viewport
      let actualLeft = idealLeft;
      if (idealLeft < 20) {
        actualLeft = 20; // Minimum margin from left
      } else if (idealLeft + panelWidth > windowWidth - 20) {
        actualLeft = windowWidth - panelWidth - 20; // Minimum margin from right
      }

      // Set panel position
      setPanelPosition({
        left: `${actualLeft}px`,
        transform: 'none'
      });

      // Calculate arrow position relative to panel
      const arrowPos = triggerRect.left + (triggerRect.width / 2) - actualLeft;
      const newPosition = Math.max(20, Math.min(panelWidth - 20, arrowPos));

      // Store previous position for smooth transitions
      if (arrowPosition !== 0) {
        prevArrowPosition.current = arrowPosition;
      }

      setArrowPosition(newPosition);
    }
  }, [isOpen, triggerRef, arrowPosition]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={(el) => {
            internalPanelRef.current = el;
            if (externalPanelRef && el) {
              externalPanelRef(el);
            }
          }}
          className={`
            fixed top-14 z-50
            ${widthClasses[config.width || 'lg']}
            ${className}
          `}
          style={{
            ...panelPosition,
            maxWidth: 'calc(100vw - 40px)'
          }}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Arrow pointer with smooth animation */}
          <motion.div
            className="absolute -top-2 w-4 h-4 bg-white dark:bg-gray-900 rotate-45 border-l border-t border-gray-200 dark:border-gray-700"
            animate={{
              left: arrowPosition,
            }}
            initial={false}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              mass: 0.8,
            }}
            style={{
              transform: 'translateX(-50%) rotate(45deg)',
            }}
          />

          {/* Main panel container */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={config.id}
                className="p-6"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{
                  duration: 0.15,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <div className={`grid ${gridCols} gap-6`}>
                  {/* Menu columns */}
                  {config.columns.map((column, index) => (
                    <MegaMenuColumnComponent
                      key={column.id}
                      column={column}
                      columnIndex={index}
                      onItemClick={(item) => {
                        onItemClick?.(item);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simplified panel for mobile (full-width drawer style)
 */
export function MegaMenuPanelMobile({
  config,
  isOpen,
  onClose,
  onItemClick,
}: Omit<MegaMenuPanelProps, 'className' | 'triggerRef'>) {
  const mobileVariants = {
    hidden: {
      height: 0,
      opacity: 0,
    },
    visible: {
      height: 'auto',
      opacity: 1,
      transition: {
        height: {
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        },
        opacity: {
          duration: 0.2,
          delay: 0.1,
        },
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        height: {
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        },
        opacity: {
          duration: 0.1,
        },
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          variants={mobileVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-4 space-y-4">
            {config.columns.map((column) => (
              <div key={column.id}>
                {column.title && (
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {column.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {column.items.map((item) => (
                    <MegaMenuColumnComponent
                      key={item.id}
                      column={{ ...column, items: [item] }}
                      columnIndex={0}
                      variant="compact"
                      onItemClick={(item) => {
                        onItemClick?.(item);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}