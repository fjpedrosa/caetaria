# Sistema de Microanimaciones para Navbar

## 🎯 Visión General

Sistema completo de microanimaciones optimizadas para el navbar de Neptunik, diseñado para ofrecer una experiencia fluida y performante en todos los dispositivos, especialmente móviles de gama baja.

## ✨ Características Principales

### 1. Enlaces con Animaciones Avanzadas
- **Subrayado animado**: Aparece de izquierda a derecha con easing suave
- **Transición de font-weight**: De 400 a 500 sin layout shift
- **Sin translate vertical**: Eliminado el efecto de movimiento hacia arriba
- **GPU acceleration**: Optimizado para performance

### 2. Mega Menús con Efecto Crecimiento
- **Entrada**: scale(0.95→1) + opacity(0→1) en 200ms
- **Timing**: ease-out con bounce sutil para naturalidad
- **Origen**: Crecimiento desde el punto de activación
- **Performance**: will-change aplicado solo durante animaciones

### 3. Botones CTA Unificados
- **Estilo consistente**: Ambos botones como primarios/secundarios
- **Sin translate vertical**: Solo brightness y shadow para hover
- **Feedback táctil**: Scale(0.98) en press para dispositivos táctiles
- **Accesibilidad**: Cumple WCAG 2.1 AA con targets de 44px+

### 4. Optimizaciones de Performance
- **GPU Acceleration**: transforms con translateZ(0)
- **will-change**: Aplicado dinámicamente solo cuando necesario
- **Throttling**: requestAnimationFrame para scroll events
- **Memory cleanup**: Limpieza automática de optimizaciones

## 📁 Estructura de Archivos

```
src/shared/
├── styles/
│   └── navbar-animations.css      # Sistema completo de clases CSS
├── hooks/
│   ├── use-navbar-animations.ts   # Hook principal de gestión
│   └── use-text-animations.ts     # Hook para animaciones de texto
└── components/ui/
    └── animated-link.tsx          # Componentes wrapper optimizados
```

## 🎨 Clases CSS Disponibles

### Enlaces Base
```css
.nav-link                  /* Link básico con subrayado animado */
.nav-link--button         /* Variant botón sin subrayado */
.nav-link--active         /* Estado activo persistente */
```

### Mega Menús
```css
.mega-menu                 /* Contenedor con animaciones de entrada/salida */
.mega-menu-content         /* Contenido con backdrop y shadows */
.mega-menu-item           /* Items individuales con hover sutil */
```

### Botones CTA
```css
.cta-button               /* Base común para todos los CTA */
.cta-button--primary      /* Variante primaria (Neptune blue) */
.cta-button--secondary    /* Variante secundaria (ghost) */
```

### Utilidades de Performance
```css
.will-animate             /* Activa GPU acceleration temporalmente */
.animation-complete       /* Limpia will-change después de animar */
.hw-accel                 /* Hardware acceleration permanente */
```

## 🚀 Uso del Sistema

### Implementación Básica

```tsx
import { AnimatedLink } from '@/shared/components/ui/animated-link';

// Link básico con subrayado animado
<AnimatedLink href="/productos" variant="default">
  Productos
</AnimatedLink>

// Botón en navbar
<AnimatedLink href="/login" variant="button">
  Iniciar Sesión
</AnimatedLink>

// CTA primario
<AnimatedLink href="/onboarding" variant="cta-primary">
  Prueba Gratis
</AnimatedLink>
```

### Con Hook de Animaciones

```tsx
import { useNavbarAnimations } from '@/shared/hooks/use-navbar-animations';

function CustomNavbar() {
  const { state, linkHandlers, ctaHandlers } = useNavbarAnimations({
    hideOnScroll: true,
    showProgress: true,
    throttleMs: 16
  });

  return (
    <nav className={cn(
      'fixed top-0 w-full transition-all duration-500',
      state.isScrolled && 'bg-background/95 backdrop-blur-xl',
      !state.isVisible && '-translate-y-full'
    )}>
      {/* Contenido del navbar */}
    </nav>
  );
}
```

### Mega Menús Avanzados

```tsx
import { AnimatedMegaMenu, AnimatedMegaMenuItem } from '@/shared/components/ui/animated-link';

<div className="relative group">
  <AnimatedLink href="/productos" variant="default">
    Productos
  </AnimatedLink>
  
  <AnimatedMegaMenu 
    isOpen={isHovering} 
    onAnimationComplete={() => console.log('Animation complete')}
  >
    <div className="grid grid-cols-2 gap-6 p-6">
      <div>
        <h4 className="font-semibold text-muted-foreground">Plataformas</h4>
        <AnimatedMegaMenuItem href="/productos/whatsapp">
          <div className="flex items-center gap-3">
            <Icon icon={MessageCircle} />
            <div>
              <p className="font-medium">WhatsApp Business</p>
              <p className="text-sm text-muted-foreground">Automatiza conversaciones</p>
            </div>
          </div>
        </AnimatedMegaMenuItem>
      </div>
    </div>
  </AnimatedMegaMenu>
</div>
```

## ⚡ Optimizaciones de Performance

### 1. GPU Acceleration Inteligente
```css
/* Solo durante animaciones */
.will-animate {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Cleanup automático */
.animation-complete {
  will-change: auto;
}
```

### 2. Throttling de Scroll
```typescript
// requestAnimationFrame + throttling inteligente
const handleScroll = rafThrottle(() => {
  // Solo actualiza si hay cambios significativos
  const significantChange = Math.abs(scrollY - lastScrollY) > 10;
  if (significantChange) {
    updateNavbarState();
  }
}, 16); // 60fps máximo
```

### 3. Intersection Observer
```typescript
// Desactiva eventos en elementos fuera del viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const element = entry.target;
    element.style.pointerEvents = entry.isIntersecting ? 'auto' : 'none';
  });
}, { rootMargin: '50px' });
```

### 4. Prevención de Layout Shift
```css
/* Reserva espacio para texto bold */
.nav-link::before {
  content: attr(data-text);
  font-weight: 500;
  height: 0;
  visibility: hidden;
  position: absolute;
}
```

## 📱 Compatibilidad Responsive

### Mobile First
```css
/* Base: móvil */
.nav-link {
  min-height: 3rem; /* 48px para touch targets */
  padding: 0.75rem 1rem;
}

/* Desktop optimizations */
@media (min-width: 768px) {
  .nav-link {
    min-height: 2.75rem; /* 44px para desktop */
  }
}
```

### Touch Optimization
```css
@media (pointer: coarse) {
  .nav-link,
  .cta-button {
    min-height: 3rem; /* 48px obligatorio para touch */
  }
  
  .mega-menu {
    padding: 0.5rem; /* Mayor área de hover */
  }
}
```

## ♿ Accesibilidad

### WCAG 2.1 AA Compliance
- **Touch targets**: Mínimo 44px (48px en móvil)
- **Focus visible**: Ring de 2px con alto contraste
- **Keyboard navigation**: Soporte completo para tab/enter
- **Screen readers**: ARIA labels y live regions
- **High contrast**: Adaptación automática para `prefers-contrast: high`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .mega-menu,
  .cta-button {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
  
  .nav-link::after {
    width: 100%; /* Subrayado inmediato */
  }
}
```

### Keyboard Shortcuts
- **Alt + S**: Skip to main content
- **Alt + M**: Toggle mobile menu
- **Tab**: Navegación secuencial
- **Escape**: Cerrar mega menús

## 🛠️ Configuración en Tailwind

### Animaciones Personalizadas
```typescript
// tailwind.config.ts
animation: {
  'underline-expand': 'underlineExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  'mega-menu-enter': 'megaMenuEnter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  'mega-menu-exit': 'megaMenuExit 0.15s cubic-bezier(0.4, 0, 1, 1)',
  'cta-press': 'ctaPress 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
}
```

### Keyframes Optimizados
```typescript
keyframes: {
  underlineExpand: {
    '0%': { width: '0', transform: 'translateZ(0)' },
    '100%': { width: '100%', transform: 'translateZ(0)' },
  },
  megaMenuEnter: {
    '0%': { opacity: '0', transform: 'scale(0.95) translateY(-8px)' },
    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
  },
  ctaPress: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(0.98)' },
    '100%': { transform: 'scale(1)' },
  },
}
```

## 🧪 Testing

### Performance Testing
```typescript
// Medir performance de animaciones
const measureAnimationPerformance = () => {
  performance.mark('animation-start');
  
  element.addEventListener('transitionend', () => {
    performance.mark('animation-end');
    performance.measure('animation-duration', 'animation-start', 'animation-end');
    
    const measure = performance.getEntriesByName('animation-duration')[0];
    console.log(`Animation took ${measure.duration}ms`);
  });
};
```

### Accessibility Testing
```typescript
// Verificar touch targets
const checkTouchTargets = () => {
  document.querySelectorAll('.nav-link, .cta-button').forEach(el => {
    const rect = el.getBoundingClientRect();
    const minSize = window.matchMedia('(pointer: coarse)').matches ? 48 : 44;
    
    if (rect.height < minSize || rect.width < minSize) {
      console.warn('Touch target too small:', el);
    }
  });
};
```

## 🔧 Troubleshooting

### Problemas Comunes

**1. Layout Shift en font-weight**
```css
/* Solución: Pseudo-elemento para reservar espacio */
.nav-link::before {
  content: attr(data-text);
  font-weight: 500;
  height: 0;
  visibility: hidden;
}
```

**2. Animaciones lentas en móviles**
```typescript
// Solución: Detectar performance y ajustar
const isLowEndDevice = navigator.hardwareConcurrency <= 4;
const animationDuration = isLowEndDevice ? 100 : 200;
```

**3. will-change no se limpia**
```typescript
// Solución: Cleanup automático
setTimeout(() => {
  element.style.willChange = 'auto';
}, animationDuration + 50);
```

## 📊 Métricas de Performance

### Objetivos
- **First Paint**: < 100ms para animaciones
- **Memory**: < 2MB adicional por animaciones
- **CPU**: < 5% uso durante scroll
- **Touch Response**: < 50ms delay

### Monitoreo
```typescript
// Web Vitals integration
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.name.includes('animation')) {
      console.log(`${entry.name}: ${entry.duration}ms`);
    }
  });
}).observe({ entryTypes: ['measure'] });
```

## 🚀 Futuras Mejoras

1. **Adaptive Performance**: Ajustar animaciones según device capabilities
2. **Gesture Support**: Swipe gestures en mega menús móviles
3. **Voice Navigation**: Integración con Web Speech API
4. **Theme Transitions**: Animaciones suaves entre light/dark mode
5. **Micro-interactions**: Feedback visual en todas las interacciones