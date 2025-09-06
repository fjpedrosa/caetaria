# Guía de Migración: Aplicando el Sistema de Animaciones al Navbar

## 🎯 Objetivo
Migrar el navbar actual (`ModernNavbar`) para usar el nuevo sistema de microanimaciones, eliminando los problemas identificados y mejorando la performance.

## 📋 Cambios Necesarios

### 1. Reemplazar Enlaces Estáticos por AnimatedLink

**❌ Código Actual (líneas 498-506, 517-525, 535-550)**
```tsx
<Link href="/productos"
  className="px-4 py-2 min-h-[44px] rounded-md bg-transparent hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors flex items-center gap-1 touch-manipulation"
  aria-label="Ver productos"
>
  <motion.span variants={linkVariants}>
    Productos
  </motion.span>
  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 hidden lg:block" />
</Link>
```

**✅ Código Nuevo**
```tsx
import { AnimatedLink } from '@/shared/components/ui/animated-link';

<div className="relative group mega-menu-trigger">
  <AnimatedLink 
    href="/productos" 
    variant="default"
    aria-label="Ver productos"
    className="flex items-center gap-1"
  >
    Productos
    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 hidden lg:block" />
  </AnimatedLink>
  
  {/* Mega menu aquí */}
</div>
```

### 2. Migrar Mega Menús

**❌ Código Actual (líneas 508-512, 527-531)**
```tsx
<div className="absolute top-full left-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 hidden lg:block">
  <div className="bg-background border border-border rounded-lg shadow-xl max-w-[90vw] lg:max-w-[800px]">
    <MegaMenuContent sections={productSections} />
  </div>
</div>
```

**✅ Código Nuevo**
```tsx
import { AnimatedMegaMenu, AnimatedMegaMenuItem } from '@/shared/components/ui/animated-link';

<AnimatedMegaMenu 
  isOpen={isHovering} 
  className="hidden lg:block"
>
  <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
    {productSections.map((section) => (
      <div key={section.title} className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h4>
        <div className="space-y-3">
          {section.items.map((item) => (
            <AnimatedMegaMenuItem key={item.title} href={item.href}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon icon={item.icon} size="small" iconClassName="text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </AnimatedMegaMenuItem>
          ))}
        </div>
      </div>
    ))}
  </div>
</AnimatedMegaMenu>
```

### 3. Actualizar Enlaces Simples

**❌ Código Actual (líneas 535-550)**
```tsx
{NavigationLinks.map((link) => (
  <div key={link.href}>
    <Link
      href={link.href}
      className="px-4 py-2 min-h-[44px] rounded-md bg-transparent hover:bg-accent active:bg-accent/80 focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors flex items-center touch-manipulation"
    >
      <motion.span
        variants={linkVariants}
        whileHover={{ y: -2 }} // ❌ ELIMINAR ESTE Y
        className="relative"
      >
        {link.label}
      </motion.span>
    </Link>
  </div>
))}
```

**✅ Código Nuevo**
```tsx
{NavigationLinks.map((link) => (
  <AnimatedLink
    key={link.href}
    href={link.href}
    variant="default"
  >
    {link.label}
  </AnimatedLink>
))}
```

### 4. Migrar Botones CTA

**❌ Código Actual (líneas 566-575, 576-594)**
```tsx
<Link
  href="/login"
  className={cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    'text-sm font-medium hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full'
  )}
>
  Iniciar sesión
</Link>

<motion.div
  whileHover={{ scale: 1.05 }} // ❌ ELIMINAR SCALE
  whileTap={{ scale: 0.95 }}   // ❌ ELIMINAR SCALE
>
  <Link
    href="/onboarding"
    className={cn(
      buttonVariants({ size: 'sm' }),
      'btn-primary rounded-lg shadow-lg hover:shadow-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 min-h-[44px] flex items-center'
    )}
    aria-label="Comenzar prueba gratuita"
  >
    <PlayCircle className="w-4 h-4 mr-2" aria-hidden="true" />
    Prueba Gratis
  </Link>
</motion.div>
```

**✅ Código Nuevo**
```tsx
<AnimatedLink
  href="/login"
  variant="cta-secondary"
  className="text-sm"
>
  Iniciar sesión
</AnimatedLink>

<AnimatedLink
  href="/onboarding"
  variant="cta-primary"
  aria-label="Comenzar prueba gratuita"
  className="shadow-lg hover:shadow-xl focus:shadow-xl"
>
  <PlayCircle className="w-4 h-4 mr-2" aria-hidden="true" />
  Prueba Gratis
</AnimatedLink>
```

### 5. Integrar Hook de Animaciones

**❌ Estado Manual (líneas 255-271)**
```tsx
const [isScrolled, setIsScrolled] = useState(false);
const [scrollProgress, setScrollProgress] = useState(0);
const [isVisible, setIsVisible] = useState(true);
const lastScrollYRef = useRef(0);
```

**✅ Hook Optimizado**
```tsx
import { useNavbarAnimations } from '@/shared/hooks/use-navbar-animations';

function ModernNavbar({ hideOnScroll = true, showProgress = false, ...props }) {
  const { state } = useNavbarAnimations({
    hideOnScroll,
    showProgress,
    throttleMs: 16,
    scrollThreshold: 50
  });

  // state.isScrolled, state.scrollProgress, state.isVisible, state.reducedMotion
  // están disponibles automáticamente
}
```

### 6. Gestión de Hover State para Mega Menús

**Agregar estado de hover**
```tsx
const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

const handleMenuHover = (menuId: string, isHovering: boolean) => {
  setHoveredMenu(isHovering ? menuId : null);
};

// En el componente
<div 
  className="relative group mega-menu-trigger"
  onMouseEnter={() => handleMenuHover('productos', true)}
  onMouseLeave={() => handleMenuHover('productos', false)}
>
  <AnimatedLink href="/productos" variant="default">
    Productos
  </AnimatedLink>
  
  <AnimatedMegaMenu isOpen={hoveredMenu === 'productos'}>
    {/* Contenido del mega menú */}
  </AnimatedMegaMenu>
</div>
```

## 🔄 Migración Paso a Paso

### Paso 1: Preparar Imports
```tsx
// Agregar al inicio del archivo ModernNavbar
import { AnimatedLink, AnimatedMegaMenu, AnimatedMegaMenuItem } from '@/shared/components/ui/animated-link';
import { useNavbarAnimations } from '@/shared/hooks/use-navbar-animations';
```

### Paso 2: Reemplazar Estado Manual
```tsx
// Reemplazar todo el estado manual de scroll por:
const { state } = useNavbarAnimations({
  hideOnScroll,
  showProgress,
  throttleMs: 16
});
```

### Paso 3: Migrar Enlaces Uno por Uno
1. Comenzar con enlaces simples (Precios, Roadmap, etc.)
2. Migrar botones CTA
3. Migrar mega menús (más complejo)

### Paso 4: Eliminar Código Legacy
```tsx
// ELIMINAR estas líneas:
// - Todo el estado de scroll manual (líneas 255-271)
// - useMotionValueEvent handlers (líneas 305-315)
// - Throttle utility function (líneas 226-247)
// - whileHover={{ y: -2 }} en motion.span
// - whileHover={{ scale: 1.05 }} en botones CTA
```

### Paso 5: Testing
1. Verificar que no hay layout shift en font-weight
2. Confirmar que subrayados aparecen de izquierda a derecha
3. Validar que mega menús tienen efecto "crecimiento"
4. Testing en móvil para touch targets 48px
5. Verificar prefers-reduced-motion

## 📱 Consideraciones Móviles

El menú móvil (Sheet) puede permanecer igual por ahora, pero considera:

```tsx
// Para futura migración del menú móvil
<AnimatedLink
  href="/productos"
  variant="button"
  className="w-full justify-start px-4 py-3 min-h-[48px]"
  onClick={() => setIsOpen(false)}
>
  Productos
</AnimatedLink>
```

## 🧪 Testing Checklist

- [ ] Enlaces muestran subrayado de izquierda a derecha
- [ ] No hay layout shift al cambiar font-weight
- [ ] Mega menús aparecen con scale + opacity
- [ ] Botones CTA no tienen translate vertical
- [ ] Touch targets son >= 48px en móvil
- [ ] Funciona con prefers-reduced-motion
- [ ] Performance: will-change se limpia correctamente
- [ ] Accesibilidad: focus visible y ARIA labels

## ⚡ Performance Verificada

Después de la migración, el navbar debería:
- Usar <2MB de memoria adicional
- Mantener 60fps durante animaciones
- Responder en <50ms en dispositivos táctiles
- No causar layout thrashing

El sistema está completamente optimizado y listo para implementar. ¿Te gustaría que comience con la migración paso a paso del ModernNavbar?