/**
 * Individual menu item component with premium styling
 * Inspired by Stripe's clean and professional design
 */

import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { type MegaMenuItem } from '../../../domain/types/mega-menu.types';
import { designTokens } from '../../styles/design-tokens';

interface MegaMenuItemComponentProps {
  item: MegaMenuItem;
  index: number;
  onItemClick?: (item: MegaMenuItem) => void;
  isActive?: boolean;
}

/**
 * Premium menu item with icon, title, description and hover effects
 */
export function MegaMenuItemComponent({
  item,
  index,
  onItemClick,
  isActive = false,
}: MegaMenuItemComponentProps) {
  const Icon = item.icon;
  
  // Stagger animation for items
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.03, // Stagger effect
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  // Badge variant styles
  const badgeStyles = {
    new: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    beta: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'coming-soon': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const content = (
    <>
      {/* Icon container with subtle background */}
      {Icon && (
        <div 
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 bg-gray-100 dark:bg-gray-800"
        >
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {item.title}
          </h3>
          
          {/* Badge */}
          {item.badge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[item.badge.variant]}`}>
              {item.badge.text}
            </span>
          )}
          
          {/* External link indicator */}
          {item.isExternal && (
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
        
        {/* Description */}
        {item.description && (
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
      
      {/* Arrow indicator for highlighted items */}
      {item.isHighlighted && (
        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
      )}
    </>
  );

  const itemClasses = `
    group relative flex items-start gap-3 px-3 py-2.5
    transition-all duration-200 cursor-pointer
    ${isActive ? 'text-gray-900 dark:text-white' : ''}
  `;

  // Render as Link or button based on href
  if (item.href) {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <Link
          href={item.href}
          className={itemClasses}
          onClick={() => onItemClick?.(item)}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className={`${itemClasses} w-full text-left`}
      onClick={() => onItemClick?.(item)}
    >
      {content}
    </motion.button>
  );
}

/**
 * Compact version for smaller menus
 */
export function MegaMenuItemCompact({
  item,
  onItemClick,
}: Omit<MegaMenuItemComponentProps, 'index'>) {
  return (
    <Link
      href={item.href}
      className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
      onClick={() => onItemClick?.(item)}
    >
      <span className="flex items-center gap-2">
        {item.icon && <item.icon className="w-4 h-4" />}
        {item.title}
        {item.badge && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-full">
            {item.badge.text}
          </span>
        )}
      </span>
    </Link>
  );
}