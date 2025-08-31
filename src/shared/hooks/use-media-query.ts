import { useEffect,useState } from 'react'

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Set initial state
    setMatches(mediaQuery.matches)

    // Define event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * Hook for responsive breakpoint detection
 */
export function useBreakpoint(breakpoint: string | number): boolean {
  const query = typeof breakpoint === 'number'
    ? `(min-width: ${breakpoint}px)`
    : `(min-width: ${breakpoint})`

  return useMediaQuery(query)
}

/**
 * Hook for common responsive breakpoints
 */
export function useResponsive() {
  const isXs = useMediaQuery('(max-width: 479px)')
  const isSm = useMediaQuery('(min-width: 480px) and (max-width: 639px)')
  const isMd = useMediaQuery('(min-width: 640px) and (max-width: 767px)')
  const isLg = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isXl = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)')
  const is2Xl = useMediaQuery('(min-width: 1280px)')

  const isSmAndUp = useMediaQuery('(min-width: 480px)')
  const isMdAndUp = useMediaQuery('(min-width: 640px)')
  const isLgAndUp = useMediaQuery('(min-width: 768px)')
  const isXlAndUp = useMediaQuery('(min-width: 1024px)')
  const is2XlAndUp = useMediaQuery('(min-width: 1280px)')

  const isSmAndDown = useMediaQuery('(max-width: 639px)')
  const isMdAndDown = useMediaQuery('(max-width: 767px)')
  const isLgAndDown = useMediaQuery('(max-width: 1023px)')
  const isXlAndDown = useMediaQuery('(max-width: 1279px)')

  // Current breakpoint
  const currentBreakpoint = isXs
    ? 'xs'
    : isSm
    ? 'sm'
    : isMd
    ? 'md'
    : isLg
    ? 'lg'
    : isXl
    ? 'xl'
    : '2xl'

  return {
    // Exact breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,

    // Up breakpoints (min-width)
    isSmAndUp,
    isMdAndUp,
    isLgAndUp,
    isXlAndUp,
    is2XlAndUp,

    // Down breakpoints (max-width)
    isSmAndDown,
    isMdAndDown,
    isLgAndDown,
    isXlAndDown,

    // Current breakpoint name
    currentBreakpoint,

    // Utility properties
    isMobile: isSmAndDown,
    isTablet: isMdAndUp && isLgAndDown,
    isDesktop: isXlAndUp,
  }
}

/**
 * Hook for device type detection
 */
export function useDeviceType() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
  }, [])

  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    deviceType,
  }
}

/**
 * Hook for orientation detection
 */
export function useOrientation() {
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const isLandscape = useMediaQuery('(orientation: landscape)')

  return {
    isPortrait,
    isLandscape,
    orientation: isPortrait ? 'portrait' : 'landscape',
  }
}

/**
 * Hook for dark mode detection
 */
export function usePrefersColorScheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersLight = useMediaQuery('(prefers-color-scheme: light)')

  return {
    prefersDark,
    prefersLight,
    colorScheme: prefersDark ? 'dark' : 'light',
  }
}

/**
 * Hook for reduced motion detection
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return prefersReducedMotion
}

/**
 * Hook for high contrast detection
 */
export function usePrefersContrast() {
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)')
  const prefersLowContrast = useMediaQuery('(prefers-contrast: low)')

  return {
    prefersHighContrast,
    prefersLowContrast,
    prefersNormalContrast: !prefersHighContrast && !prefersLowContrast,
  }
}

/**
 * Hook for viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial viewport
    updateViewport()

    // Listen for resize events
    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [])

  return viewport
}

/**
 * Hook for container query-like behavior
 */
export function useContainerQuery(
  containerRef: React.RefObject<HTMLElement>,
  query: string
): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') {
      return
    }

    const container = containerRef.current
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect

        // Simple width-based queries for now
        if (query.includes('min-width')) {
          const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0')
          setMatches(width >= minWidth)
        } else if (query.includes('max-width')) {
          const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '0')
          setMatches(width <= maxWidth)
        } else if (query.includes('min-height')) {
          const minHeight = parseInt(query.match(/min-height:\s*(\d+)px/)?.[1] || '0')
          setMatches(height >= minHeight)
        } else if (query.includes('max-height')) {
          const maxHeight = parseInt(query.match(/max-height:\s*(\d+)px/)?.[1] || '0')
          setMatches(height <= maxHeight)
        }
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, query])

  return matches
}

/**
 * Hook for hover capability detection
 */
export function useHoverCapability() {
  const canHover = useMediaQuery('(hover: hover)')
  const cannotHover = useMediaQuery('(hover: none)')

  return {
    canHover,
    cannotHover,
    hoverCapability: canHover ? 'hover' : 'none',
  }
}

/**
 * Hook for pointer type detection
 */
export function usePointerType() {
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)')
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const hasNoPointer = useMediaQuery('(pointer: none)')

  const pointerType = hasCoarsePointer
    ? 'coarse'
    : hasFinePointer
    ? 'fine'
    : 'none'

  return {
    hasCoarsePointer,
    hasFinePointer,
    hasNoPointer,
    pointerType,
    isTouchPrimary: hasCoarsePointer,
    isMousePrimary: hasFinePointer,
  }
}

/**
 * Hook for combining multiple media queries
 */
export function useMediaQueries(queries: Record<string, string>) {
  const [matches, setMatches] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQueries: Record<string, MediaQueryList> = {}
    const listeners: Record<string, (event: MediaQueryListEvent) => void> = {}

    // Create media queries and listeners
    Object.entries(queries).forEach(([key, query]) => {
      mediaQueries[key] = window.matchMedia(query)
      listeners[key] = (event) => {
        setMatches((prev) => ({
          ...prev,
          [key]: event.matches,
        }))
      }
    })

    // Set initial matches
    const initialMatches: Record<string, boolean> = {}
    Object.entries(mediaQueries).forEach(([key, mq]) => {
      initialMatches[key] = mq.matches
      mq.addEventListener('change', listeners[key])
    })
    setMatches(initialMatches)

    // Cleanup
    return () => {
      Object.entries(mediaQueries).forEach(([key, mq]) => {
        mq.removeEventListener('change', listeners[key])
      })
    }
  }, [queries])

  return matches
}

/**
 * Hook for custom breakpoint system
 */
export function useCustomBreakpoints<T extends Record<string, number>>(
  breakpoints: T
): Record<keyof T, boolean> & { current: keyof T } {
  const queries = Object.fromEntries(
    Object.entries(breakpoints).map(([key, value]) => [
      key,
      `(min-width: ${value}px)`,
    ])
  )

  const matches = useMediaQueries(queries)

  // Find the current breakpoint (largest matching one)
  const current = Object.keys(breakpoints)
    .reverse()
    .find((key) => matches[key]) as keyof T || Object.keys(breakpoints)[0] as keyof T

  return {
    ...matches,
    current,
  } as Record<keyof T, boolean> & { current: keyof T }
}