# Navbar Containers

## Overview

Los contenedores smart son el puente entre la lógica de aplicación (hooks) y los componentes presentacionales puros. Siguen el patrón Container/Presentation para mantener una separación clara de responsabilidades.

## Contenedores Disponibles

### NavbarContainer

Contenedor principal que orquesta todo el navbar.

**Responsabilidades:**
- Conecta todos los hooks necesarios (scroll, state, accessibility, prefetch, mega menu)
- Maneja la navegación y routing
- Coordina la interacción entre subcomponentes
- Gestiona el estado global del navbar

**Uso:**
```tsx
import { NavbarContainer } from '@/modules/marketing/navbar/presentation/containers';

<NavbarContainer
  config={{
    variant: { type: 'transparent' },
    showProgress: true,
    hideOnScroll: true
  }}
  navigationItems={navItems}
  ctaConfig={ctaConfig}
  onNavigate={(href) => console.log('Navigating to:', href)}
/>
```

### NavbarMobileContainer

Contenedor especializado para dispositivos móviles con soporte para gestos táctiles.

**Características:**
- Detección de gestos swipe para cerrar
- Feedback háptico en interacciones
- Gestión de focus trap para accesibilidad
- Animaciones optimizadas para móvil

**Uso:**
```tsx
import { NavbarMobileContainer } from '@/modules/marketing/navbar/presentation/containers';

<NavbarMobileContainer
  navigationItems={navItems}
  ctaConfig={ctaConfig}
  isOpen={isMobileMenuOpen}
  enableGestures={true}
  enableHapticFeedback={true}
  onClose={() => setMobileMenuOpen(false)}
  onNavigate={(href) => console.log('Mobile navigation:', href)}
/>
```

### MegaMenuContainer

Contenedor para menús desplegables complejos con soporte para triangle safe zone.

**Características:**
- Triangle safe zone para mejor UX en hover
- Delays inteligentes para apertura/cierre
- Soporte para modos hover, click y touch
- Prefetch automático en hover
- Navegación con teclado completa

**Uso:**
```tsx
import { MegaMenuContainer } from '@/modules/marketing/navbar/presentation/containers';

<MegaMenuContainer
  menuId="products"
  navigationItems={productItems}
  interactionMode="hover"
  position="center"
  onClose={() => console.log('Menu closed')}
  onNavigate={(href) => router.push(href)}
/>
```

### ProgressBarContainer

Contenedor para el indicador de progreso de scroll.

**Características:**
- Muestra progreso de lectura de la página
- Indicadores de sección clickeables
- Animaciones suaves con Framer Motion
- Accesibilidad con ARIA attributes

**Uso:**
```tsx
import { ProgressBarContainer } from '@/modules/marketing/navbar/presentation/containers';

<ProgressBarContainer
  progress={scrollProgress}
  currentSection={activeSection}
  isVisible={isNavbarVisible}
  onSectionClick={(sectionId) => scrollToSection(sectionId)}
/>
```

## Arquitectura

### Separación de Responsabilidades

```
Hooks (Lógica) → Containers (Conexión) → Components (Presentación)
```

**Hooks:** Toda la lógica de negocio, estado, efectos
**Containers:** Conectan hooks con componentes, no tienen lógica propia
**Components:** Solo presentación, reciben props y renderizan

### Ejemplo de Flujo

1. **Hook** maneja el estado de scroll:
```tsx
const { isVisible, scrollProgress } = useNavbarScroll();
```

2. **Container** conecta el hook con el componente:
```tsx
const NavbarContainer = () => {
  const scrollData = useNavbarScroll();
  return <NavbarPure {...scrollData} />;
};
```

3. **Component** solo renderiza:
```tsx
const NavbarPure = ({ isVisible, scrollProgress }) => (
  <nav className={isVisible ? 'visible' : 'hidden'}>
    {/* Solo JSX, sin lógica */}
  </nav>
);
```

## Best Practices

1. **No lógica en containers:** Los containers solo conectan, no implementan lógica
2. **Props mínimas:** Pasa solo las props necesarias a los componentes presentacionales
3. **Composición:** Usa múltiples containers pequeños en lugar de uno grande
4. **Testing:** Testea hooks y componentes por separado, los containers son simples conectores
5. **Performance:** Usa `useMemo` y `useCallback` en los containers cuando sea necesario

## Testing

Los containers se testean principalmente a través de:
- **Integration tests:** Verifican que conectan correctamente hooks con componentes
- **Smoke tests:** Verifican que renderizan sin errores

La lógica compleja se testea en los hooks, la presentación en los componentes puros.