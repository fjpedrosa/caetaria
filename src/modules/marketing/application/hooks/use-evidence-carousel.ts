/**
 * Custom hook for managing evidence carousel state and navigation
 */

import { useCallback, useEffect,useState } from 'react';

import type { SuccessStory } from '../../domain/types/evidence.types';

interface UseEvidenceCarouselProps {
  stories: SuccessStory[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface UseEvidenceCarouselReturn {
  currentIndex: number;
  currentStory: SuccessStory;
  nextStory: () => void;
  prevStory: () => void;
  goToStory: (index: number) => void;
  isPlaying: boolean;
  toggleAutoPlay: () => void;
}

export function useEvidenceCarousel({
  stories,
  autoPlay = false,
  autoPlayInterval = 5000
}: UseEvidenceCarouselProps): UseEvidenceCarouselReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const nextStory = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  const prevStory = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  }, [stories.length]);

  const goToStory = useCallback((index: number) => {
    if (index >= 0 && index < stories.length) {
      setCurrentIndex(index);
    }
  }, [stories.length]);

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || stories.length <= 1) return;

    const interval = setInterval(() => {
      nextStory();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, nextStory, autoPlayInterval, stories.length]);

  // Pause auto-play on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isPlaying) {
        setIsPlaying(false);
      }
    };

    // Add event listeners for user interaction
    const events = ['mousedown', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isPlaying]);

  return {
    currentIndex,
    currentStory: stories[currentIndex],
    nextStory,
    prevStory,
    goToStory,
    isPlaying,
    toggleAutoPlay
  };
}