# ModernNavbar Component

Navbar moderno y profesional con mega-menús, animaciones avanzadas y funcionalidades completas para la landing page.

## Características Implementadas

### ✅ Diseño y Estructura
- **Logo animado**: Efecto hover con scale y gradiente de colores amarillo-azul
- **Navegación principal**: NavigationMenu con mega-menús para "Productos" y "Soluciones"
- **Links simples**: Precios, Recursos, Empresa con micro-interacciones
- **CTA Buttons**: "Iniciar sesión" y "Prueba gratis" con diseño redondeado

### ✅ Mega-Menús Interactivos
- **Productos**: Organizado en "Plataformas de Chat" y "Herramientas"
- **Soluciones**: Categorizado por "Por Industria" y "Casos de Uso"
- **Badges**: Indicadores "Popular", "Nuevo", "Top" en elementos destacados
- **Iconografía**: Iconos contextuales con Lucide React

### ✅ Funcionalidades Avanzadas
- **Sticky Header**: Se vuelve translúcido con blur al hacer scroll
- **Progress Indicator**: Barra de progreso del scroll en la parte superior
- **Responsive Design**: Versión móvil completa con Sheet/drawer
- **Detección de Scroll**: Cambio de apariencia basado en posición

### ✅ Animaciones con Framer Motion
- **Entrada**: Animación de aparición desde arriba
- **Stagger**: Efecto escalonado en links de navegación
- **Hover Effects**: Micro-interacciones en todos los elementos clickeables
- **Mobile Menu**: Animaciones de entrada/salida en menú móvil
- **Scroll Progress**: Barra animada que indica progreso de lectura

### ✅ Versión Móvil
- **Sheet Component**: Drawer lateral derecho con overlay
- **Navegación Organizada**: Secciones colapsibles por categoría
- **CTAs Prominentes**: Botones de acción bien posicionados
- **Responsive**: Se adapta automáticamente al tamaño de pantalla

### ✅ Accesibilidad
- **ARIA Labels**: Etiquetas descriptivas para screen readers
- **Keyboard Navigation**: Soporte completo para navegación por teclado
- **Focus Management**: Estados de focus claramente definidos
- **Semantic HTML**: Estructura semántica correcta

### ✅ Colores y Tema
- **Colores Brand**: Usa las variables CSS amarillo (primary) y azul (secondary)
- **Gradientes**: Efectos visuales con degradados de marca
- **Dark Mode**: Soporte completo para tema oscuro
- **Consistencia**: Coherente con el sistema de diseño

## Estructura del Componente

```typescript
interface MegaMenuSection {
  title: string;
  items: {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}
```

## Uso

```jsx
import { ModernNavbar } from '@/modules/marketing/ui/components/modern-navbar';

export default function Layout({ children }) {
  return (
    <>
      <ModernNavbar />
      {children}
    </>
  );
}
```

## Dependencias Utilizadas

- **Framer Motion**: Animaciones y transiciones
- **Radix UI**: Componentes base accesibles
- **Lucide React**: Sistema de iconografía
- **Next.js**: Navegación y routing
- **Tailwind CSS**: Estilos y responsive design

## Personalización

### Modificar Mega-Menús
Los datos de los mega-menús están definidos en las constantes `productSections` y `solutionSections`. Para agregar nuevas secciones o elementos:

```typescript
const productSections: MegaMenuSection[] = [
  {
    title: "Nueva Sección",
    items: [
      {
        title: "Nuevo Producto",
        description: "Descripción del producto",
        href: "/productos/nuevo",
        icon: IconoComponente,
        badge: "Beta" // Opcional
      }
    ]
  }
];
```

### Personalizar Animaciones
Las animaciones están configuradas con Framer Motion y se pueden ajustar modificando los objetos `variants`:

```typescript
const navbarVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.6, // Ajustar duración
      ease: "easeOut" // Cambiar easing
    }
  }
};
```

## Rendimiento

- **Lazy Loading**: Componentes cargados bajo demanda
- **Optimized Animations**: Animaciones GPU-accelerated
- **Bundle Size**: Importaciones específicas para minimizar tamaño
- **Scroll Performance**: Throttled scroll listeners

## Próximas Mejoras

- [ ] Búsqueda integrada en mega-menús
- [ ] Notificaciones in-app
- [ ] Avatar de usuario con dropdown
- [ ] Breadcrumbs dinámicos
- [ ] Shortcuts de teclado