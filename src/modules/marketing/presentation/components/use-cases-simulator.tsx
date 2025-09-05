/**
 * Use Cases Simulator Component - Placeholder
 * Placeholder component for future WhatsApp simulator functionality
 */

'use client';

import React from 'react';

interface UseCasesSimulatorProps {
  scenario?: any;
  isTransitioning?: boolean;
  isInView?: boolean;
}

/**
 * Placeholder component for Use Cases Simulator
 */
export const UseCasesSimulator = React.memo<UseCasesSimulatorProps>(function UseCasesSimulator({
  scenario,
  isTransitioning,
  isInView
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-full aspect-[9/19] bg-gradient-to-b from-gray-100 to-gray-200 rounded-[2.5rem] border-8 border-gray-300 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">💬</div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              WhatsApp Simulator
            </h4>
            <p className="text-sm text-gray-500">
              Demostración interactiva próximamente
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 justify-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-muted-foreground">
              Simulación en desarrollo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UseCasesSimulator;