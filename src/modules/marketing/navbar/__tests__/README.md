# Navbar Testing Suite

Suite completa de tests para el módulo de navegación del navbar. Incluye tests de:

- **Hooks de aplicación (95% coverage)**
- **Componentes presentacionales (90% coverage)**  
- **Contenedores de integración (90% coverage)**
- **Accesibilidad WCAG 2.1 AA (100% compliance)**
- **Tests de integración end-to-end**

## Estructura de Tests

```
__tests__/
├── setup/
│   └── test-setup.ts              # Configuración global de tests
├── hooks/                          # Tests de Application Layer
│   ├── use-navbar-scroll.test.ts   # Hook de scroll con throttling
│   ├── use-navbar-accessibility.test.ts  # Hook de accesibilidad
│   └── use-mega-menu-interaction.test.ts # Hook de mega menús
├── presentation/
│   ├── components/                 # Tests de componentes puros
│   │   ├── navbar-link-pure.test.tsx
│   │   └── navbar-progress-bar-pure.test.tsx
│   └── containers/                 # Tests de contenedores
│       └── navbar-container.test.tsx
├── accessibility/
│   └── wcag-compliance.test.tsx    # Tests de accesibilidad completos
├── integration/
│   └── navbar-integration.test.tsx # Tests de integración E2E
└── README.md                       # Esta documentación
```

## Comandos de Testing

### Tests Específicos del Navbar
```bash
# Ejecutar todos los tests del navbar
npm run test src/modules/marketing/navbar

# Tests con coverage
npm run test:coverage src/modules/marketing/navbar

# Tests en modo watch
npm run test:watch src/modules/marketing/navbar

# Solo tests de hooks
npm run test src/modules/marketing/navbar/hooks

# Solo tests de accesibilidad
npm run test src/modules/marketing/navbar/accessibility
```

### Tests por Categoría
```bash
# Tests de Application Layer (hooks)
npm run test src/modules/marketing/navbar/__tests__/hooks

# Tests de Presentation Layer  
npm run test src/modules/marketing/navbar/__tests__/presentation

# Tests de accesibilidad
npm run test src/modules/marketing/navbar/__tests__/accessibility

# Tests de integración
npm run test src/modules/marketing/navbar/__tests__/integration
```

## Coverage Requirements

| Layer | Minimum Coverage | Target Coverage |
|-------|-----------------|----------------|
| Domain | 95% | 98% |
| Application (Hooks) | 90% | 95% |
| Presentation | 85% | 90% |
| Integration | 80% | 85% |

## Tipos de Tests

### 1. Application Layer Tests (Hooks)

#### `use-navbar-scroll.test.ts`
- ✅ Throttling y requestAnimationFrame  
- ✅ HideOnScroll logic
- ✅ Progress calculation
- ✅ Velocity tracking
- ✅ Memory cleanup
- ✅ Edge cases y error handling

#### `use-navbar-accessibility.test.ts`
- ✅ Focus management y focus trapping
- ✅ Keyboard navigation (arrow keys, shortcuts)
- ✅ Screen reader announcements
- ✅ User preferences detection
- ✅ ARIA attributes management
- ✅ Skip links functionality

#### `use-mega-menu-interaction.test.ts`
- ✅ Triangle safe zone detection
- ✅ Hover delays y timing
- ✅ Touch/click/keyboard interactions
- ✅ Cursor tracking y velocity
- ✅ Accessibility compliance
- ✅ Performance optimizations

### 2. Presentation Layer Tests

#### `navbar-link-pure.test.tsx`
- ✅ Renderizado con diferentes props
- ✅ Estados visuales (activo, hover, focus)
- ✅ Variantes de enlace (default, button, cta)
- ✅ Event handlers
- ✅ Props condicionales

#### `navbar-progress-bar-pure.test.tsx`
- ✅ Renderizado con diferentes niveles de progreso
- ✅ Visibilidad y estados
- ✅ Animaciones y transiciones
- ✅ Comportamiento responsivo

### 3. Container Tests

#### `navbar-container.test.tsx`
- ✅ Integración de todos los hooks
- ✅ Orquestación de estado y lógica
- ✅ Event handling y callbacks
- ✅ Responsive behavior
- ✅ Performance optimizations

### 4. Accessibility Tests

#### `wcag-compliance.test.tsx`
- ✅ WCAG 2.1 AA automated testing (axe-core)
- ✅ Keyboard navigation completa
- ✅ Focus management
- ✅ Screen reader compatibility
- ✅ Touch target sizes (44px minimum)
- ✅ Motion preferences
- ✅ High contrast support

### 5. Integration Tests

#### `navbar-integration.test.tsx`
- ✅ Flujos de usuario completos (hover, click, keyboard)
- ✅ Estados complejos y transiciones
- ✅ Performance bajo carga
- ✅ Escenarios reales de uso
- ✅ Edge cases en integración

## Herramientas y Librerías

### Core Testing
- **Jest**: Framework principal de testing
- **React Testing Library**: Testing de componentes React
- **@testing-library/user-event**: Simulación de eventos de usuario
- **@testing-library/jest-dom**: Matchers adicionales para DOM

### Accessibility Testing
- **jest-axe**: Testing automatizado de accesibilidad
- **axe-core**: Motor de análisis de accesibilidad

### Mocking y Utilities
- **Custom mocks**: Para Next.js router, hooks, y servicios
- **Test utilities**: Helpers personalizados para testing

## Configuración de Tests

### Jest Setup
Los tests utilizan la configuración de Jest de Next.js con extensiones específicas:

```javascript
// jest.config.cjs - Coverage thresholds
coverageThreshold: {
  'src/modules/marketing/navbar/domain/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  },
  'src/modules/marketing/navbar/application/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

### Test Environment
- **Environment**: jsdom (para DOM testing)
- **Setup**: Configuración automática de mocks globales
- **Path mapping**: Soporte completo para `@/` imports
- **Canvas mocking**: Para testing de GIF generation (si aplica)

## Patterns de Testing

### 1. Hook Testing Pattern
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNavbarScroll } from '../use-navbar-scroll';

describe('useNavbarScroll', () => {
  it('should handle scroll with throttling', async () => {
    const { result } = renderHook(() => useNavbarScroll());
    
    act(() => {
      // Trigger scroll
    });
    
    await waitFor(() => {
      expect(result.current.scrollY).toBe(100);
    });
  });
});
```

### 2. Component Testing Pattern  
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NavbarLinkPure } from '../navbar-link-pure';

describe('NavbarLinkPure', () => {
  it('should render with correct props', () => {
    render(<NavbarLinkPure href="/test">Test Link</NavbarLinkPure>);
    
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
  });
});
```

### 3. Accessibility Testing Pattern
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4. Integration Testing Pattern
```typescript
import userEvent from '@testing-library/user-event';

it('should handle complete user flow', async () => {
  const user = userEvent.setup();
  render(<CompleteNavbar />);
  
  // Multi-step user interaction
  await user.hover(element1);
  await user.click(element2);
  await user.keyboard('{Escape}');
  
  // Assertions
  expect(finalState).toBeTruthy();
});
```

## Debugging Tests

### Debug Specific Test
```bash
# Run single test file with debug
npm run test -- --testNamePattern="should handle scroll" --verbose

# Debug with browser devtools
npm run test -- --runInBand --detectOpenHandles --forceExit
```

### Debug Accessibility
```bash
# Run only accessibility tests
npm run test -- --testPathPattern=accessibility

# With detailed axe output
npm run test -- --verbose accessibility
```

### Debug Integration Tests
```bash
# Run integration tests with extended timeout
npm run test -- --testTimeout=30000 integration
```

## Continuous Integration

Los tests se ejecutan automáticamente en CI/CD:

```yaml
# .github/workflows/test.yml
steps:
  - name: Run Navbar Tests
    run: |
      npm run test:coverage src/modules/marketing/navbar
      npm run test:accessibility src/modules/marketing/navbar
```

## Métricas y Reporting

### Coverage Report
```bash
# Generar reporte HTML detallado
npm run test:coverage src/modules/marketing/navbar

# Ver reporte en navegador
open coverage/lcov-report/index.html
```

### Performance Testing
```bash
# Tests de performance específicos
npm run test -- --testNamePattern="performance" --verbose
```

## Troubleshooting

### Common Issues

1. **Tests timeout**: Aumentar `testTimeout` en jest.config.cjs
2. **Memory leaks**: Verificar cleanup en hooks y event listeners
3. **Accessibility violations**: Usar `screen.debug()` para inspeccionar DOM
4. **Race conditions**: Usar `waitFor()` para operaciones async

### Best Practices

1. ✅ **Test behavior, not implementation**
2. ✅ **Use data-testid for reliable element selection**
3. ✅ **Mock external dependencies appropriately**  
4. ✅ **Write descriptive test names**
5. ✅ **Keep tests isolated and deterministic**
6. ✅ **Test error states and edge cases**
7. ✅ **Maintain high coverage on critical paths**

## Contributing

Al añadir nuevos tests:

1. Seguir la estructura de carpetas existente
2. Mantener los thresholds de coverage
3. Incluir tests de accesibilidad para nuevos componentes
4. Documentar casos de edge especiales
5. Usar los utilities de testing existentes
6. Escribir tests que fallen primero (TDD approach)

## Future Improvements

- [ ] Visual regression testing con Chromatic
- [ ] Performance budgets automatizados
- [ ] Cross-browser testing con Playwright
- [ ] Lighthouse CI integration
- [ ] Bundle size regression testing
