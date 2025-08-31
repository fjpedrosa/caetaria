# Navbar v2 - Especificaciones Técnicas

## 📋 Resumen de Componentes

### Estructura Principal
```
motion-navbar-v2.tsx          # Componente principal 
├── navbar-container.tsx      # Container con effects y layout
├── logo-section.tsx          # Logo y branding
├── navigation-pill.tsx       # Navegación central (distintivo)
├── cta-section.tsx          # CTAs derecha (Sign in + Get Started)
├── mobile-menu.tsx          # Menú mobile responsive
└── hooks/                   # Hooks especializados
    ├── use-smart-scroll.ts  # ✅ Implementado
    └── use-navbar-animation.ts # ✅ Implementado
```

---

## 🎨 Diseño Visual (Motion Style)

### Color Scheme
```css
/* Navbar Background */
bg-gray-900               /* Base: #1a1b26 */
bg-gray-900/95           /* Scrolled: con transparencia */

/* Navigation Pill */
bg-white/10              /* Semi-transparente */
backdrop-blur-md         /* Blur effect */
border border-white/20   /* Borde sutil */

/* Text Colors */
text-white               /* Principal */
text-gray-200           /* Secundario */
text-gray-900           /* En botón CTA */

/* CTA Button */
bg-white                /* Background */
text-gray-900           /* Text */
hover:bg-gray-100       /* Hover state */
```

### Typography & Spacing
```css
/* Logo */
text-xl font-bold        /* Logo text */

/* Navigation */
text-sm font-medium      /* Nav items */

/* Spacing */
px-4 py-2               /* Nav items padding */
px-6 py-2.5             /* CTA button padding */
gap-3                   /* Between CTAs */
gap-1                   /* Between nav items */
```

---

## 🏗️ Componente: motion-navbar-v2.tsx

### Props Interface
```typescript
interface MotionNavbarV2Props {
  variant?: 'default' | 'transparent';
  showProgress?: boolean;
  hideOnScroll?: boolean; // Smart scroll feature
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
  badge?: string;
}

interface CTAConfig {
  signIn: {
    text: string;
    href: string;
  };
  primary: {
    text: string;
    href: string;
    icon?: LucideIcon;
  };
}
```

### Smart Scroll Behavior
```typescript
// Usando useSmartScroll hook
const { isVisible, isAtTop } = useSmartScroll({
  threshold: 10,        // Top detection
  hideThreshold: 80,    // Hide after 80px
  debounceTime: 10      // Performance
});

// Clases dinámicas
const navbarClasses = cn(
  "fixed top-0 left-0 right-0 z-50",
  "transition-transform duration-300 ease-out",
  isVisible ? "translate-y-0" : "-translate-y-full",
  isAtTop ? "bg-gray-900/50" : "bg-gray-900/95"
);
```

---

## 🔹 Componente: navigation-pill.tsx

### Características Distintivas
- **Forma**: Píldora redondeada (`rounded-full`)
- **Background**: Semi-transparente con blur (`bg-white/10 backdrop-blur-md`)
- **Border**: Sutil (`border border-white/20`)
- **Hover**: Más opaco (`hover:bg-white/15`)

### Props Interface
```typescript
interface NavigationPillProps {
  items: NavigationItem[];
  activeItem?: string;
  className?: string;
}

interface NavigationPillItemProps {
  item: NavigationItem;
  isActive?: boolean;
  onClick?: () => void;
}
```

### Implementación CVA
```typescript
import { cva } from 'class-variance-authority';

const pillVariants = cva(
  [
    "flex items-center gap-1 px-2 py-2 rounded-full",
    "bg-white/10 backdrop-blur-md border border-white/20",
    "transition-all duration-200"
  ],
  {
    variants: {
      state: {
        default: "hover:bg-white/15",
        active: "bg-white/20",
      }
    }
  }
);

const pillItemVariants = cva(
  [
    "px-4 py-2 rounded-full text-sm font-medium",
    "transition-all duration-200 ease-out",
    "hover:bg-white/20 focus:bg-white/20",
    "focus:outline-none focus:ring-2 focus:ring-white/50"
  ],
  {
    variants: {
      state: {
        default: "text-gray-200 hover:text-white",
        active: "bg-white/20 text-white",
      }
    }
  }
);
```

---

## 🔹 Componente: cta-section.tsx

### Layout
```
[Sign in] [Get Started Button]
```

### Props Interface
```typescript
interface CTASectionProps {
  config: CTAConfig;
  variant?: 'default' | 'compact';
  className?: string;
}
```

### Sign In Link
```typescript
const signInVariants = cva(
  [
    "text-sm font-medium text-gray-200",
    "hover:text-white transition-colors duration-200",
    "px-3 py-2 rounded-lg hover:bg-white/10"
  ]
);
```

### Get Started Button
```typescript
const ctaButtonVariants = cva(
  [
    "px-6 py-2.5 rounded-lg font-semibold text-sm",
    "transition-all duration-200 ease-out",
    "transform hover:scale-105 active:scale-95",
    "focus:outline-none focus:ring-2 focus:ring-white/50"
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white text-gray-900",
          "hover:bg-gray-100 hover:shadow-lg",
        ],
        gradient: [
          "bg-gradient-to-r from-blue-500 to-purple-600",
          "text-white hover:shadow-lg hover:shadow-blue-500/25",
        ]
      }
    }
  }
);
```

---

## 📱 Componente: mobile-menu.tsx

### Tipo de Menú
- **Desktop**: Hidden (`hidden lg:block`)
- **Mobile**: Full-screen overlay o Sheet desde arriba
- **Trigger**: Hamburger menu (`lg:hidden`)

### Props Interface
```typescript
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  ctaConfig: CTAConfig;
  className?: string;
}
```

### Animaciones
```typescript
const mobileMenuVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const menuItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 }
};
```

---

## 🎛️ Breakpoints y Responsive

### Breakpoint Strategy
```css
/* Mobile First Approach */
.mobile-only { } /* Default: hasta 767px */
.tablet-up { @apply md:flex; } /* 768px+ */
.desktop-up { @apply lg:flex; } /* 1024px+ */

/* Specific Components */
.navigation-pill { @apply hidden lg:flex; } /* Solo desktop */
.mobile-menu-trigger { @apply lg:hidden; } /* Solo mobile */
.cta-section { @apply hidden md:flex; } /* Tablet+ */
```

### Mobile Behavior
```typescript
// Navigation pill: Oculta en mobile
<div className="hidden lg:flex">
  <NavigationPill />
</div>

// CTAs: Ocultos en mobile, visibles en menú
<div className="hidden md:flex">
  <CTASection />
</div>

// Mobile menu: Solo mobile
<div className="lg:hidden">
  <MobileMenuTrigger />
</div>
```

---

## ⚡ Performance Optimizations

### Hardware Acceleration
```css
.navbar-container {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.navigation-pill {
  contain: layout style paint;
}
```

### Memoization Strategy
```typescript
// Componentes memoizados
const MemoizedNavigationPill = React.memo(NavigationPill);
const MemoizedCTASection = React.memo(CTASection);
const MemoizedMobileMenu = React.memo(MobileMenu);

// Data memoizada
const navigationData = useMemo(() => ({
  items: [...],
  ctaConfig: {...}
}), []);
```

### Lazy Loading
```typescript
// Mobile menu lazy loading
const MobileMenu = lazy(() => import('./mobile-menu'));

// Conditional loading
{isOpen && (
  <Suspense fallback={null}>
    <MobileMenu {...props} />
  </Suspense>
)}
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] `useSmartScroll` hook behavior
- [ ] `useNavbarAnimation` hook states
- [ ] Component rendering con props
- [ ] CVA variants correctos

### Integration Tests
- [ ] Navbar v2 render completo
- [ ] Smart scroll functionality
- [ ] Mobile menu interactions
- [ ] Responsive breakpoints

### Performance Tests
- [ ] Animation frame rate (target: 60fps)
- [ ] Scroll event throttling
- [ ] Memory leaks en hooks
- [ ] Bundle size impact

---

## 📋 Criterios de Aceptación

### Funcionalidades
- ✅ Smart scroll: Hide on down, show on up
- ✅ Navigation pill con backdrop blur
- ✅ CTAs diferenciados (texto vs botón)
- ✅ Mobile menu responsive
- ✅ Animaciones suaves (300ms)

### Performance
- ✅ 60fps en animaciones
- ✅ < 100ms response time
- ✅ Throttled scroll events
- ✅ Hardware acceleration

### Accesibilidad
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Focus management
- ✅ Touch targets 44px+

### Visual
- ✅ Backdrop blur functional
- ✅ Color scheme consistente
- ✅ Typography siguiendo design
- ✅ Responsive en todos los breakpoints

---

## 🔧 Configuración Técnica

### Dependencies Adicionales
Todas las dependencias ya están disponibles en el proyecto:
- ✅ `framer-motion` - Animaciones
- ✅ `class-variance-authority` - Variants
- ✅ `tailwind-merge` - Class merging
- ✅ `lucide-react` - Icons
- ✅ `@radix-ui/*` - UI primitives

### Tailwind Extensions Necesarias
```javascript
// tailwind.config.ts - Already configured
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        md: '12px', 
      }
    }
  }
}
```