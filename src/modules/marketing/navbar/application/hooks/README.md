# Navbar Application Hooks

Conjunto de custom hooks especializados que encapsulan toda la lógica del navbar siguiendo los principios de Clean Architecture y separación de responsabilidades.

## Hooks Disponibles

### 🎯 useNavbarScroll
Hook optimizado para el manejo de scroll con throttling a 60fps.

**Características:**
- Throttling con requestAnimationFrame (16ms/60fps)
- Cálculo de velocidad con smoothing
- Detección de dirección de scroll
- Progress bar calculation
- Hide/show logic con hysteresis
- Performance optimizado con cleanup apropiado

**Uso:**
```typescript
const {
  isVisible,
  isAtTop,
  scrollY,
  scrollVelocity,
  scrollDirection,
  scrollProgress,
  scrollToTop,
  scrollToElement,
  lockScroll,
  unlockScroll
} = useNavbarScroll({
  threshold: 10,
  hideThreshold: 80,
  throttleTime: 16, // 60fps
  enableProgressBar: true,
  enableVelocityTracking: true
});
```

### ♿ useNavbarAccessibility
Manejo completo de accesibilidad WCAG 2.1 AA.

**Características:**
- ARIA attributes management
- Keyboard navigation (Tab, Escape, Arrow keys, Home/End)
- Focus trap inteligente para menús
- Skip links functionality
- Screen reader announcements
- Detección de preferencias (reduced motion, high contrast)
- Navegación con teclas de flecha

**Uso:**
```typescript
const {
  // State
  reducedMotion,
  highContrast,
  screenReaderActive,
  keyboardNavigating,
  // Actions
  announceToScreenReader,
  trapFocus,
  releaseFocus,
  trackFocus,
  showSkipLinks,
  hideSkipLinks,
  // Helpers
  getAriaProps
} = useNavbarAccessibility({
  config: {
    enableKeyboardShortcuts: true,
    enableFocusTrap: true,
    enableSkipLinks: true
  }
});
```

### 🎮 useMegaMenuInteraction
Interacción avanzada con mega menús.

**Características:**
- Hover state management con delays inteligentes (100ms in, 300ms out)
- Triangle safe zone para cursor path
- Touch/click handling para móviles
- Open/close state management
- Active menu tracking
- Soporte para diferentes modos de interacción

**Uso:**
```typescript
const {
  activeMenu,
  isOpen,
  interactionMode,
  openMenu,
  closeMenu,
  toggleMenu,
  registerMenu,
  handleMouseEnter,
  handleMouseLeave,
  handleClick,
  handleKeyDown,
  getMenuProps
} = useMegaMenuInteraction({
  config: {
    hoverDelay: { enter: 100, exit: 300 },
    triangleSafeZone: { enabled: true, tolerance: 100 },
    touchMode: { enabled: true }
  }
});

// Registrar un menú
useEffect(() => {
  const cleanup = registerMenu('products-menu', menuElement);
  return cleanup;
}, []);

// Aplicar props a trigger
<button {...getMenuProps('products-menu')}>
  Products
</button>
```

### 🚀 useNavbarPrefetch
Prefetch inteligente con múltiples estrategias.

**Características:**
- Integración con sistema SmartLink
- Priority-based prefetching (critical, high, medium, low, idle)
- Múltiples estrategias (immediate, hover, viewport, idle, predicted)
- Network-aware (detecta velocidad de conexión)
- Resource hints (dns-prefetch, preconnect, preload)
- Métricas de performance

**Uso:**
```typescript
const {
  prefetchImmediate,
  prefetchOnHover,
  cancelHoverPrefetch,
  observeForPrefetch,
  prefetchOnIdle,
  predictAndPrefetch,
  metrics,
  isLoading,
  isPrefetched,
  networkSpeed
} = useNavbarPrefetch({
  config: {
    maxConcurrent: 3,
    maxQueueSize: 10,
    strategies: {
      viewport: { enabled: true, rootMargin: '50px' },
      hover: { enabled: true, delay: 150 },
      idle: { enabled: true, timeout: 2000 },
      predicted: { enabled: true, confidence: 0.7 }
    },
    networkAware: {
      enabled: true,
      slowConnectionThreshold: '3g',
      reduceOnSlowConnection: true
    }
  }
});

// Prefetch on hover
const handleHover = (url: string) => {
  const cleanup = prefetchOnHover(url, 'medium');
  return cleanup; // Para cancelar si se sale del hover
};

// Observe element for viewport prefetch
useEffect(() => {
  const cleanup = observeForPrefetch(linkElement, '/about', 'low');
  return cleanup;
}, []);
```

### 📊 useNavbarState
Gestión centralizada del estado del navbar.

**Características:**
- Estado unificado para todo el navbar
- Reducers para actualizaciones predecibles
- Subscripción a cambios de estado
- Gestión de mega menús y mobile menu
- Control de animaciones y transiciones

**Uso:**
```typescript
const {
  state,
  dispatch,
  toggleMobileMenu,
  setActiveMenu,
  clearActiveMenu,
  addToPrefetchQueue,
  removeFromPrefetchQueue,
  subscribeToState
} = useNavbarState();

// Subscribir a cambios
useEffect(() => {
  const unsubscribe = subscribeToState((newState) => {
    console.log('Navbar state changed:', newState);
  });
  return unsubscribe;
}, []);
```

## Principios de Diseño

### Single Responsibility Principle (SRP)
Cada hook tiene una única responsabilidad bien definida:
- Scroll → `useNavbarScroll`
- Accesibilidad → `useNavbarAccessibility`
- Mega menús → `useMegaMenuInteraction`
- Prefetch → `useNavbarPrefetch`
- Estado → `useNavbarState`

### Performance First
- Throttling a 60fps con requestAnimationFrame
- Cleanup apropiado de timers y listeners
- Memoización de cálculos costosos
- Solo actualizar estado cuando hay cambios reales

### Accessibility by Default
- WCAG 2.1 AA compliance
- Keyboard navigation completa
- Screen reader support
- Respeto por preferencias del usuario

### Testability
- Funciones puras cuando es posible
- No dependencias de UI específicas
- Estado predecible con reducers
- Separación clara de lógica y presentación

## Integración con Componentes

Los hooks están diseñados para ser usados por los componentes contenedor, no directamente en componentes presentacionales:

```typescript
// ✅ Correcto - En container
const NavbarContainer = () => {
  const scroll = useNavbarScroll();
  const accessibility = useNavbarAccessibility();
  const megaMenu = useMegaMenuInteraction();
  
  return (
    <NavbarPresentation
      isVisible={scroll.isVisible}
      isAtTop={scroll.isAtTop}
      {...accessibility.getAriaProps('navbar')}
      onMenuOpen={megaMenu.openMenu}
    />
  );
};

// ❌ Incorrecto - En componente presentacional
const NavbarPresentation = () => {
  const scroll = useNavbarScroll(); // NO hacer esto
  // ...
};
```

## Testing

Cada hook puede ser testeado independientemente:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNavbarScroll } from './use-navbar-scroll';

describe('useNavbarScroll', () => {
  it('should hide navbar when scrolling down past threshold', () => {
    const { result } = renderHook(() => useNavbarScroll({
      hideThreshold: 100
    }));

    act(() => {
      // Simulate scroll
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(false);
  });
});
```

## Notas de Performance

- Los hooks usan `requestAnimationFrame` para optimización
- Throttling configurable para diferentes frame rates
- Cleanup automático de recursos
- Memoización de cálculos costosos
- Lazy loading de funcionalidad no crítica