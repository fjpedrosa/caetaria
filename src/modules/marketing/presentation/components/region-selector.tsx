/**
 * Region Selector Component
 * Allows users to manually select their preferred region
 */

'use client';

import React, { useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { Check,ChevronDown, Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useRegion } from '@/modules/marketing/application/contexts/region-context';

interface RegionOption {
  id: 'spain' | 'latam' | 'usa' | 'europe' | 'asia';
  label: string;
  flag: string;
  language: string;
}

const REGION_OPTIONS: RegionOption[] = [
  { id: 'spain', label: 'España', flag: '🇪🇸', language: 'Español' },
  { id: 'latam', label: 'Latinoamérica', flag: '🌎', language: 'Español' },
  { id: 'usa', label: 'United States', flag: '🇺🇸', language: 'English' },
  { id: 'europe', label: 'Europe', flag: '🇪🇺', language: 'English' },
  { id: 'asia', label: 'Asia Pacific', flag: '🌏', language: 'English' },
];

interface RegionSelectorProps {
  className?: string;
  variant?: 'navbar' | 'footer' | 'settings';
}

export function RegionSelector({ className, variant = 'navbar' }: RegionSelectorProps) {
  const { currentRegion, setRegion, isLoading } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = REGION_OPTIONS.find(opt => opt.id === currentRegion) || REGION_OPTIONS[0];

  const handleRegionChange = async (regionId: RegionOption['id']) => {
    if (regionId !== currentRegion) {
      await setRegion(regionId);
    }
    setIsOpen(false);
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  if (variant === 'navbar') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          aria-label="Select region"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="text-lg" aria-hidden="true">{currentOption.flag}</span>
          <span className="hidden sm:inline text-foreground">{currentOption.label}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop for mobile */}
              <motion.div
                className="fixed inset-0 z-40 sm:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown menu */}
              <motion.div
                className={cn(
                  'absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50',
                  'bg-card border border-border overflow-hidden'
                )}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1">
                  {REGION_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleRegionChange(option.id)}
                      disabled={isLoading}
                      className={cn(
                        'flex items-center w-full px-4 py-2.5 text-sm transition-colors',
                        'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        currentRegion === option.id && 'bg-muted/30'
                      )}
                      role="menuitem"
                    >
                      <span className="text-lg mr-3" aria-hidden="true">
                        {option.flag}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {option.language}
                        </div>
                      </div>
                      {currentRegion === option.id && (
                        <Check className="w-4 h-4 text-primary ml-2" aria-label="Selected" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className="inline-flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <select
          value={currentRegion}
          onChange={(e) => setRegion(e.target.value as RegionOption['id'])}
          disabled={isLoading}
          className={cn(
            'bg-transparent border border-border rounded px-2 py-1 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          aria-label="Select region"
        >
          {REGION_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.flag} {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Settings variant (more detailed)
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Region & Language
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Select your region for localized content and pricing
        </p>
      </div>

      <div className="grid gap-2">
        {REGION_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => handleRegionChange(option.id)}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-3 w-full p-3 rounded-lg border transition-all',
              'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              currentRegion === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
          >
            <span className="text-2xl" aria-hidden="true">{option.flag}</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-foreground">
                {option.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {option.language}
              </div>
            </div>
            {currentRegion === option.id && (
              <Check className="w-5 h-5 text-primary" aria-label="Selected" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}