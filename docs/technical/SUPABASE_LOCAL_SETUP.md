# 🚀 Supabase Local Development Setup

## ✅ Estado Actual

El entorno de desarrollo local de Supabase está completamente configurado y funcionando con:

- **PostgreSQL**: Puerto 54322
- **Supabase Studio**: http://localhost:54323
- **API REST**: http://localhost:54321
- **Inbucket (Email testing)**: http://localhost:54324
- **Datos de prueba**: 6 leads, 2 flujos onboarding, 10 eventos analytics, 2 experimentos A/B

## 📋 Requisitos Previos

- Docker Desktop o OrbStack instalado y corriendo
- Node.js 18+ y pnpm
- Supabase CLI v2.34+

## 🎯 Comandos Rápidos

### Comandos Básicos

```bash
# Iniciar Supabase local
pnpm supabase:start

# Detener Supabase local
pnpm supabase:stop

# Ver estado de Supabase
pnpm supabase:status

# Resetear base de datos con datos frescos
pnpm db:reset
```

### Comandos de Desarrollo

```bash
# Iniciar desarrollo con Supabase local
pnpm dev:local

# Generar tipos TypeScript desde esquema local
pnpm supabase:types

# Cargar datos de prueba
pnpm db:seed

# Setup completo (start + types)
pnpm local:setup

# Teardown con backup
pnpm local:teardown
```

### Comandos de Base de Datos

```bash
# Crear nueva migración
pnpm db:migrate nombre_migracion

# Aplicar migraciones a producción
pnpm db:push

# Conectar con proyecto remoto
pnpm supabase:link
```

## 📁 Estructura del Proyecto

```
supabase/
├── migrations/
│   └── 20250101000000_local_schema.sql  # Schema simplificado para local
├── seed.sql                              # Datos de prueba
├── config.toml                           # Configuración de Supabase
└── migrations-backup/                    # Backup de migraciones originales
```

## 🔧 Archivos de Configuración

### `.env.development.local`
Contiene las credenciales para el entorno local:
- `NEXT_PUBLIC_SUPABASE_URL`: http://127.0.0.1:54321
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Key pública para cliente
- `SUPABASE_SERVICE_ROLE_KEY`: Key privada para servidor
- `DATABASE_URL`: Conexión directa a PostgreSQL

### `.env.local` (Producción)
Contiene las credenciales del proyecto en la nube:
- Usar para desarrollo conectado a producción
- NO commitear este archivo

## 📊 Datos de Prueba

### Leads (6 registros)
- TechCorp Solutions - john.doe@techcorp.com
- Retail Plus - sarah.johnson@retail.com
- Healthcare Group - mike.wilson@health.org
- EduTech Institute - lisa.martinez@edu.edu
- Hotel Paradise - carlos.garcia@hotel.es
- Beauty Studio - anna.smith@beauty.com

### Onboarding Flows (2 tipos)
- Standard Onboarding: 4 pasos completos
- Quick Start: 2 pasos simplificados

### Analytics Events (10 eventos)
- Page views, clicks, conversions
- Diferentes fuentes UTM (google, facebook, linkedin)
- Métricas de engagement

### Experimentos A/B (2 activos)
- Hero CTA Test: "Get Started" vs "Start Free Trial"
- Pricing Layout: 2 columnas vs 3 columnas

## 🔄 Flujo de Trabajo

### Desarrollo Local

1. **Iniciar entorno**:
   ```bash
   pnpm local:setup
   ```

2. **Desarrollar con hot-reload**:
   ```bash
   pnpm dev:local
   ```

3. **Acceder a Supabase Studio**:
   - Abrir http://localhost:54323
   - Ver y editar datos directamente

4. **Ver emails de prueba**:
   - Abrir http://localhost:54324
   - Todos los emails se capturan aquí

### Migración a Producción

1. **Crear migración local**:
   ```bash
   pnpm db:migrate feature_name
   ```

2. **Probar en local**:
   ```bash
   pnpm db:reset
   ```

3. **Aplicar a producción**:
   ```bash
   pnpm db:push
   ```

## 🐛 Troubleshooting

### Error: Puerto 54322 ya está en uso
```bash
# Detener todos los contenedores de Supabase
supabase stop --all
# Reiniciar
pnpm supabase:start
```

### Error: Docker daemon no está corriendo
```bash
# Iniciar Docker Desktop o OrbStack manualmente
open -a OrbStack
```

### Error: Schema cache no actualizado
```bash
# Regenerar tipos
pnpm supabase:types
# Reiniciar Next.js
pnpm dev:local
```

### Limpiar todo y empezar de nuevo
```bash
# Detener y limpiar
supabase stop
docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project)
# Iniciar limpio
pnpm local:setup
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**: 
- Las credenciales en `.env.development.local` son SOLO para desarrollo local
- NUNCA usar estas credenciales en producción
- NUNCA commitear archivos `.env` con credenciales reales

## 📚 Recursos

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [OrbStack](https://orbstack.dev/) (alternativa ligera a Docker Desktop)

## 💡 Tips

1. **Performance**: OrbStack usa menos recursos que Docker Desktop
2. **Datos persistentes**: Los datos sobreviven reinicios con `supabase stop`
3. **Reset rápido**: Usa `pnpm db:reset` para datos frescos
4. **Debugging SQL**: Usa Supabase Studio en http://localhost:54323
5. **Tipos actualizados**: Ejecuta `pnpm supabase:types` después de cambios en schema

---

Última actualización: 2025-01-09