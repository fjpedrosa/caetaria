import { useEffect,useRef } from 'react';
import { useAnimation,useInView } from 'framer-motion';

interface ScrollAnimationOptions {
  once?: boolean;
  amount?: number;
  delay?: number;
  duration?: number;
  animateIn?: any;
  animateOut?: any;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    once = true,
    amount = 0.3,
    delay = 0,
    duration = 0.6,
    animateIn = { opacity: 1, y: 0 },
    animateOut = { opacity: 0, y: 30 }
  } = options;

  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once, amount });

  useEffect(() => {
    if (isInView) {
      controls.start({
        ...animateIn,
        transition: { duration, delay }
      });
    } else if (!once) {
      controls.start({
        ...animateOut,
        transition: { duration: duration * 0.5 }
      });
    }
  }, [isInView, controls, animateIn, animateOut, delay, duration, once]);

  return {
    ref,
    controls,
    isInView,
    initial: animateOut
  };
}

// Predefined animation variants
export const fadeInUp = {
  animateIn: { opacity: 1, y: 0 },
  animateOut: { opacity: 0, y: 40 }
};

export const fadeInDown = {
  animateIn: { opacity: 1, y: 0 },
  animateOut: { opacity: 0, y: -40 }
};

export const fadeInLeft = {
  animateIn: { opacity: 1, x: 0 },
  animateOut: { opacity: 0, x: -40 }
};

export const fadeInRight = {
  animateIn: { opacity: 1, x: 0 },
  animateOut: { opacity: 0, x: 40 }
};

export const scaleIn = {
  animateIn: { opacity: 1, scale: 1 },
  animateOut: { opacity: 0, scale: 0.9 }
};

export const rotateIn = {
  animateIn: { opacity: 1, rotate: 0 },
  animateOut: { opacity: 0, rotate: -10 }
};

// Stagger animation helper
export function useStaggerAnimation(
  itemCount: number,
  baseDelay: number = 0,
  staggerDelay: number = 0.1
) {
  return Array.from({ length: itemCount }, (_, i) => ({
    delay: baseDelay + i * staggerDelay
  }));
}

// Parallax scroll effect
export function useParallaxScroll(speed: number = 0.5) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const scrolled = window.scrollY;
      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate if element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const yPos = -(scrolled - elementTop) * speed;
        element.style.transform = `translateY(${yPos}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}

// Intersection Observer for multiple elements
export function useScrollReveal(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    refs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return addToRefs;
}