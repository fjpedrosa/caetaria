# Claude Commands - DevOps Toolkit

Enhanced command-line utilities for streamlined development, database management, and deployment operations.

## 🚀 Quick Start

```bash
# One-command project setup
./.claude/commands/setup

# Start development with database
./.claude/commands/dev

# Database operations
./.claude/commands/db start

# Deploy to staging
./.claude/commands/deploy staging
```

## 📋 Available Commands

### 🛠️ Development Commands

#### `./dev` - Enhanced Development Server
Optimized development server with multiple configuration modes:

```bash
./dev                    # Stable development (recommended)
./dev sim               # Simulator-optimized mode  
./dev clean             # Clean cache and start fresh
./dev help              # Show all available options
```

#### `./setup` - One-Command Project Setup
Complete project initialization and configuration:

```bash
./setup                 # Full setup (recommended)
./setup --quick         # Quick setup without optional components
./setup --minimal       # Dependencies only
./setup --skip-db       # Skip database setup
```

### 🗄️ Database Commands

#### `./db` - Comprehensive Database Operations
Full database lifecycle management with Supabase CLI integration:

```bash
# Basic operations
./db start              # Start local Supabase environment
./db stop               # Stop local Supabase
./db status             # Show database status and health
./db reset              # Reset database (applies all migrations)

# Migration management
./db create-migration <name>     # Create new migration with template
./db apply                       # Apply pending migrations
./db types [local|remote]        # Update TypeScript types
```

### 🚀 Deployment Commands

#### `./deploy` - Production Deployment Automation
Comprehensive deployment pipeline with safety checks:

```bash
./deploy staging                    # Deploy to staging
./deploy production                 # Deploy to production (with confirmation)
./deploy staging --skip-tests       # Skip test execution
./deploy production --dry-run       # Show deployment plan without executing
```

## 🚀 Comandos Principales Optimizados

| Comando | Uso | Memoria | Ideal para |
|---------|-----|---------|------------|
| `npm run dev:stable` | Desarrollo diario | 8GB | Uso general |
| `npm run dev:performance` | Características complejas | 12GB | WhatsApp Simulator |
| `npm run dev:memory` | Debugging intensivo | 16GB | Memory leaks |
| `npm run dev:hot-reload` | HMR optimizado | 8GB | Frontend development |

## 🛠️ Scripts de Utilidades

### Uso Básico
```bash
# Desarrollo inteligente basado en recursos del sistema
./.claude/commands/dev-utils.sh smart

# Modo optimizado para WhatsApp Simulator
./.claude/commands/dev-utils.sh simulator

# Check de memoria actual
./.claude/commands/dev-utils.sh memory

# Health check completo
./.claude/commands/dev-utils.sh health
```

### Shortcuts
```bash
# Desarrollo estable
./.claude/commands/dev

# Modo simulador
./.claude/commands/dev sim

# Limpieza + desarrollo
./.claude/commands/dev clean

# Build con análisis
./.claude/commands/dev ba
```

## ⚡ Optimizaciones Implementadas

### 1. Gestión de Memoria Avanzada
- **Heap sizing optimizado**: 8GB/12GB/16GB según uso
- **Semi-space tuning**: Optimización de garbage collection
- **GC intervals**: Frecuencia ajustada para evitar bloqueos

### 2. Configuraciones de Threadpool
- **UV_THREADPOOL_SIZE**: 12-20 hilos según modo
- **Paralelización I/O**: Mejor handling de operaciones asíncronas

### 3. Optimizaciones Turbopack
- **Cache management**: Limpieza inteligente de cache
- **Debug flags**: Logging específico para troubleshooting
- **Fallback modes**: Webpack como backup confiable

### 4. Variables de Entorno
- **NEXT_TELEMETRY_DISABLED**: Mejor performance
- **FAST_REFRESH**: HMR optimizado
- **DEBUG flags**: Logging granular

## 📊 Monitoreo y Debugging

### Health Checks Automatizados
```bash
# Verificar versiones y memoria
npm run health:check
npm run health:memory

# O usando el script
./.claude/commands/dev-utils.sh health
```

### Memory Profiling
```bash
# Durante desarrollo
./.claude/commands/dev-utils.sh memory

# En modo debugging
npm run dev:memory
```

## 🔧 Troubleshooting

### Problema: jsx-dev-runtime errors
**Solución**: 
```bash
./.claude/commands/dev clean  # Limpia cache
./.claude/commands/dev webpack  # Fallback a webpack
```

### Problema: Memory exhaustion
**Solución**:
```bash
./.claude/commands/dev-utils.sh memory  # Check current usage
npm run dev:memory  # Modo high-memory
```

### Problema: Turbopack crashes
**Solución**:
```bash
./.claude/commands/dev-utils.sh recovery  # Auto-recovery mode
```

## 📈 Performance Metrics

### Tiempo de Startup
- **dev:stable**: ~3-5 segundos
- **dev:performance**: ~5-7 segundos (worth it for complex features)
- **dev:memory**: ~7-10 segundos (debugging mode)

### Memory Usage Típico
- **Desarrollo normal**: 800MB - 1.2GB
- **WhatsApp Simulator**: 1.5GB - 2.5GB
- **Con GIF export**: 2GB - 4GB

## 🎯 Recomendaciones de Uso

### Para Desarrollo Diario
```bash
npm run dev:stable
# o
./.claude/commands/dev
```

### Para WhatsApp Simulator
```bash
npm run dev:performance
# o
./.claude/commands/dev sim
```

### Para Debugging Issues
```bash
./.claude/commands/dev-utils.sh recovery
./.claude/commands/dev-utils.sh memory
```

### Antes de Commits
```bash
./.claude/commands/dev-utils.sh pre-commit
# o
npm run test:ci
```

## 🚨 Variables de Entorno Importantes

```bash
NODE_OPTIONS='--max-old-space-size=8192 --max-semi-space-size=128 --optimize-for-size --gc-interval=100'
NEXT_TELEMETRY_DISABLED=1
UV_THREADPOOL_SIZE=12
FAST_REFRESH=true
TURBOPACK_REMOTE_CACHE=false
```

## 📋 TODO / Future Improvements

- [ ] Integración con Docker para desarrollo containerizado
- [ ] Scripts para testing de performance automatizado
- [ ] Integración con CI/CD para optimización automática
- [ ] Monitoreo de métricas en tiempo real durante desarrollo
- [ ] Auto-scaling de recursos basado en features activas