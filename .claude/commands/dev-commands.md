# Comandos de Desarrollo Optimizados

## Comandos de Desarrollo Principal

### `npm run dev:stable` ⭐ **RECOMENDADO PARA USO DIARIO**
Comando optimizado para desarrollo estable con mejor gestión de memoria y performance.

**Configuración:**
- 8GB memoria heap (--max-old-space-size=8192)
- 128MB semi-space optimizado para GC eficiente  
- Garbage Collection cada 100ms para evitar bloqueos
- Telemetría deshabilitada para mejor performance
- 12 hilos UV para operaciones I/O

**Ideal para:** Desarrollo diario, múltiples desarrolladores, proyectos estables.

### `npm run dev:performance` 🚀 **PARA PROYECTOS COMPLEJOS**
Configuración de alta performance para desarrollo intensivo con módulos complejos como el simulador WhatsApp.

**Configuración:**
- 12GB memoria heap para operaciones intensivas
- 256MB semi-space para mejor handling de objetos temporales
- GC agresivo cada 50ms con garbage collection global
- 16 hilos UV para máximo throughput I/O

**Ideal para:** WhatsApp Simulator, GIF export, operaciones canvas, desarrollo de características complejas.

### `npm run dev:memory` 💾 **PARA DESARROLLOS CON MEMORY LEAKS**
Configuración extrema de memoria con herramientas de debugging para detectar memory leaks.

**Configuración:**
- 16GB memoria heap (máximo disponible)
- 512MB semi-space para objetos de larga duración
- GC cada 25ms con --expose-gc para debugging manual
- 20 hilos UV para máxima concurrencia

**Ideal para:** Debugging memory issues, análisis de performance, pruebas de estrés.

## Comandos de Fallback

### `npm run dev:webpack`
Fallback a Webpack cuando Turbopack falla.
- 6GB memoria heap (balanceado)
- Sin Turbopack específico

### `npm run dev:fallback` 
Configuración mínima para sistemas con limitaciones.
- 4GB memoria heap
- Turbopack completamente deshabilitado

## Comandos Especializados

### `npm run dev:hot-reload`
Optimizado para mejor Hot Module Replacement (HMR).
- Fast Refresh habilitado
- Remote cache deshabilitado para cambios inmediatos
- 8GB memoria heap balanceada

### `npm run dev:production`
Desarrollo con configuración similar a producción.
- HTTPS experimental habilitado
- 6GB memoria heap (optimizado para build-like)

### `npm run dev:debug` 🔍
Debugging complejo con logging detallado.
- Trace de warnings habilitado
- Debug específico de Turbopack
- Telemetría de desarrollo habilitada

## Comandos de Build

### `npm run build`
Build optimizado para producción.
- 8GB memoria heap para build complex

### `npm run build:analyze`
Build con análisis de bundle size.
- Variable ANALYZE=true para webpack-bundle-analyzer

## Comandos de Limpieza

### `npm run clean:cache`
Limpieza básica de cache de desarrollo.
Elimina: .next, node_modules/.cache, .turbo, playwright-report, test-results

### `npm run clean:all`
Limpieza completa con reinstalación.
Incluye eliminación de node_modules y package-lock.json

### `npm run clean:deep`
Limpieza completa + build fresh.
Útil para resolver problemas de cache persistentes.

## Comandos de Health Check

### `npm run health:check`
Verifica versiones de Node.js, npm y Next.js.

### `npm run health:memory`
Muestra uso actual de memoria heap.

## Comandos de Testing Mejorados

### `npm run test:ci`
Suite completa para CI/CD:
1. Linting estricto (0 warnings)
2. Type checking incremental
3. Tests con coverage
4. E2E tests

## Comandos Windows

### `npm run dev:windows`
Versión optimizada para Windows con sintaxis set.

### `npm run dev:clean:windows`
Limpieza + desarrollo para Windows.

## Guía de Uso por Escenario

### ✅ **Desarrollo Diario Normal**
```bash
npm run dev:stable
```

### ⚡ **Desarrollo de WhatsApp Simulator / GIF Export**
```bash
npm run dev:performance
```

### 🔍 **Debugging Issues de Performance**
```bash
npm run dev:memory
npm run health:memory  # para monitorear
```

### 🐛 **Debugging Turbopack Issues**
```bash
npm run dev:debug
# Si falla, fallback:
npm run dev:webpack
```

### 🧹 **Problemas de Cache / Estado Inconsistente**
```bash
npm run clean:deep
npm run dev:stable
```

### 🚀 **Testing Antes de Deploy**
```bash
npm run test:ci
npm run build:analyze
```

## Mejores Prácticas

1. **Usar siempre `dev:stable`** para desarrollo diario
2. **Cambiar a `dev:performance`** cuando trabajes con simulador WhatsApp o GIF export
3. **Ejecutar `health:memory`** periódicamente para monitorear uso de memoria
4. **Usar `clean:cache`** si experimentas problemas de HMR
5. **Ejecutar `test:ci`** antes de commits importantes
6. **Mantener solo una instancia** de desarrollo corriendo simultáneamente

## Variables de Entorno Utilizadas

- `NODE_OPTIONS`: Configuración de memoria y garbage collection de Node.js
- `NEXT_TELEMETRY_DISABLED`: Deshabilita telemetría para mejor performance
- `UV_THREADPOOL_SIZE`: Número de hilos para operaciones I/O asíncronas
- `FAST_REFRESH`: Habilita Fast Refresh de React
- `TURBOPACK_REMOTE_CACHE`: Control de cache remoto de Turbopack
- `DEBUG`: Logging detallado de Next.js/Turbopack
- `ANALYZE`: Habilita análisis de bundle size