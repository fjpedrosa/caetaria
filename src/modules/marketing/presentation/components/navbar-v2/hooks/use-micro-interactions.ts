/**
 * Micro Interactions Hook
 * Provides ripple effects and haptic feedback for enhanced UX
 */

import { useCallback } from 'react';

interface RippleOptions {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  duration?: number;
}

type HapticType = 'light' | 'medium' | 'heavy';
type MicroInteractionType = 'gentle-scale' | 'bounce' | 'pulse';

export function useMicroInteractions() {
  const createRippleEffect = useCallback((element: Element | null, options: RippleOptions = {}) => {
    if (!element) return;

    const {
      x = 0,
      y = 0,
      size = 100,
      color = 'rgba(255, 255, 255, 0.3)',
      duration = 600
    } = options;

    // Create ripple element
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();

    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = color;
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = `ripple ${duration}ms linear`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';

    // Add CSS animation keyframes if not exists
    if (!document.querySelector('#ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Append and cleanup
    element.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, duration);
  }, []);

  const triggerHapticFeedback = useCallback(async (type: HapticType) => {
    if (!('vibrate' in navigator)) {
      return Promise.resolve();
    }

    try {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };

      await navigator.vibrate(patterns[type]);
    } catch (error) {
      // Haptic feedback is not critical
      console.debug('[useMicroInteractions] Haptic feedback not available:', error);
    }
  }, []);

  const addMicroInteraction = useCallback((element: HTMLElement, type: MicroInteractionType) => {
    if (!element) return;

    const animations = {
      'gentle-scale': 'transform: scale(1.02); transition: transform 0.15s ease;',
      'bounce': 'animation: bounce 0.3s ease;',
      'pulse': 'animation: pulse 0.5s ease;'
    };

    // Add CSS animations if not exists
    if (!document.querySelector('#micro-interactions-keyframes')) {
      const style = document.createElement('style');
      style.id = 'micro-interactions-keyframes';
      style.textContent = `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Apply the micro-interaction
    const originalStyle = element.getAttribute('style') || '';
    element.setAttribute('style', originalStyle + ';' + animations[type]);

    // Reset after animation
    setTimeout(() => {
      element.setAttribute('style', originalStyle);
    }, type === 'bounce' ? 300 : type === 'pulse' ? 500 : 150);
  }, []);

  return {
    createRippleEffect,
    triggerHapticFeedback,
    addMicroInteraction
  };
}