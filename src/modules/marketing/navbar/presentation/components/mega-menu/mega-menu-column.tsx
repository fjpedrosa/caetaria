/**
 * Column component for organizing mega menu content
 * Creates structured layout similar to Stripe's navigation
 */

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { type MegaMenuColumn, type MegaMenuItem } from '../../../domain/types/mega-menu.types';

import { MegaMenuItemCompact,MegaMenuItemComponent } from './mega-menu-item';

interface MegaMenuColumnProps {
  column: MegaMenuColumn;
  columnIndex: number;
  onItemClick?: (item: MegaMenuItem) => void;
  variant?: 'default' | 'compact';
}

/**
 * Professional column layout with optional header and footer
 */
export function MegaMenuColumnComponent({
  column,
  columnIndex,
  onItemClick,
  variant = 'default',
}: MegaMenuColumnProps) {
  // Column animation with stagger
  const columnVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: columnIndex * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.03,
      },
    },
  };

  return (
    <motion.div
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col ${column.span === 2 ? 'col-span-2' : 'col-span-1'}`}
    >
      {/* Column header */}
      {column.title && (
        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {column.title}
          </h3>
        </div>
      )}

      {/* Column items */}
      <div className="space-y-1 flex-1">
        {column.items.map((item, index) => (
          variant === 'default' ? (
            <MegaMenuItemComponent
              key={item.id}
              item={item}
              index={index}
              onItemClick={onItemClick}
            />
          ) : (
            <MegaMenuItemCompact
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          )
        ))}
      </div>

      {/* Column footer link */}
      {column.footerLink && (
        <motion.div
          className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href={column.footerLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group"
          >
            {column.footerLink.icon && (
              <column.footerLink.icon className="w-4 h-4" />
            )}
            <span>{column.footerLink.text}</span>
            <ArrowRight className="w-3 h-3 transform translate-x-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Featured section for highlighting important content
 */
export function MegaMenuFeaturedSection({
  featured,
  onCtaClick,
}: {
  featured: {
    title: string;
    description: string;
    image?: string;
    cta: {
      text: string;
      href: string;
      variant?: 'primary' | 'secondary' | 'ghost';
    };
    gradient?: {
      from: string;
      to: string;
    };
  };
  onCtaClick?: () => void;
}) {
  const ctaVariants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50',
    ghost: 'text-purple-600 hover:bg-purple-50',
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl p-6"
      style={{
        background: featured.gradient
          ? `linear-gradient(135deg, ${featured.gradient.from}, ${featured.gradient.to})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-2">
          {featured.title}
        </h3>
        <p className="text-sm text-white/90 mb-4 line-clamp-2">
          {featured.description}
        </p>

        {/* CTA Button */}
        <Link
          href={featured.cta.href}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${ctaVariants[featured.cta.variant || 'primary']}`}
          onClick={onCtaClick}
        >
          <span>{featured.cta.text}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Featured image */}
      {featured.image && (
        <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20">
          <img
            src={featured.image}
            alt=""
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
    </motion.div>
  );
}