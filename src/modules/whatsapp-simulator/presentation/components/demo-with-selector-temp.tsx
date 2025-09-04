'use client';

import React from 'react';

import type { DemoWithSelectorProps } from '../../domain/types';

export function DemoWithSelector({
  isInView,
  enableEducationalBadges = true,
  autoPlay = true,
  device = 'iphone14',
  className = ''
}: DemoWithSelectorProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          WhatsApp Scenario Selector
        </h2>
        <p className="text-gray-600">
          Temporary placeholder - original component has parsing error
        </p>
      </div>
    </div>
  );
}

export default DemoWithSelector;