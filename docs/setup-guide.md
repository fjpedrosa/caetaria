# 🛠️ Setup Guide - WhatsApp Cloud Landing

> **Target**: Backend Developers  
> **Time to Setup**: 2-4 horas  
> **Difficulty**: Intermediate  
> **Prerequisites**: Node.js 18+, Git, Docker (opcional)

## 📋 Resumen de Setup

Esta guía te llevará de **cero a desarrollo completo** en el menor tiempo posible. Al final tendrás:

- ✅ Entorno de desarrollo funcionando
- ✅ Base de datos configurada con datos de prueba
- ✅ APIs REST completamente funcionales
- ✅ Integración WhatsApp lista para testing
- ✅ Sistema de pagos Stripe configurado
- ✅ Herramientas de debugging y monitoreo

---

## 🎯 Pre-requisitos

### Software Requerido

```bash
# Node.js (versión 18 o superior)
node --version  # v18.0.0+
npm --version   # v8.0.0+

# Git
git --version  # v2.30.0+

# Docker (opcional pero recomendado para bases de datos)
docker --version        # v20.0.0+
docker-compose --version # v2.0.0+
```

### Herramientas Recomendadas

```bash
# VS Code con extensiones
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension Prisma.prisma
code --install-extension ms-vscode.vscode-json

# CLI tools útiles
npm install -g @supabase/cli
npm install -g stripe-cli
```

### Cuentas Necesarias

- **Supabase**: [supabase.com](https://supabase.com) (plan gratuito)
- **Meta for Developers**: [developers.facebook.com](https://developers.facebook.com)
- **Stripe**: [stripe.com](https://stripe.com) (modo test)
- **OpenAI**: [platform.openai.com](https://platform.openai.com) ($5 crédito inicial)
- **Resend**: [resend.com](https://resend.com) (plan gratuito)

---

## 📁 Setup del Proyecto

### 1. Clonar y Instalar Dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd whatsapp-cloud-landing

# Instalar dependencias
npm install

# Verificar que todo esté instalado correctamente
npm run build
```

### 2. Configuración de Environment Variables

```bash
# Copiar template de variables de entorno
cp .env.example .env.local

# Editar variables de entorno
code .env.local
```

### 3. Variables de Entorno Requeridas

```bash
# .env.local

# ==========================================
# DATABASE - Supabase
# ==========================================
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ==========================================
# AUTHENTICATION
# ==========================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-secret-here"

# ==========================================
# REDIS - Upstash (para cache y colas)
# ==========================================
REDIS_URL="redis://localhost:6379"
# O para Upstash:
# REDIS_URL="redis://:password@redis-host:port"

# ==========================================
# WHATSAPP CLOUD API
# ==========================================
WHATSAPP_ACCESS_TOKEN="EAAG..."
WHATSAPP_APP_ID="123456789012345"
WHATSAPP_APP_SECRET="abcdef123456789"
WHATSAPP_WEBHOOK_SECRET="your-webhook-secret"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-verify-token"

# ==========================================
# OPENAI
# ==========================================
OPENAI_API_KEY="sk-..."

# ==========================================
# STRIPE
# ==========================================
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ==========================================
# EMAIL - Resend
# ==========================================
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# ==========================================
# ANALYTICS
# ==========================================
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# ==========================================
# DEVELOPMENT
# ==========================================
NODE_ENV="development"
LOG_LEVEL="debug"
```

---

## 🗄️ Setup de Base de Datos

### Opción 1: Supabase (Recomendado)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Crear nuevo proyecto en supabase.com
# Copiar URL y API keys a .env.local

# 3. Ejecutar migraciones
npx supabase db reset

# 4. Aplicar esquema personalizado
npx supabase db push
```

### Opción 2: PostgreSQL Local con Docker

```bash
# 1. Levantar PostgreSQL con Docker
docker-compose up -d postgres redis

# 2. Verificar que estén corriendo
docker ps

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Seed con datos de prueba
npm run db:seed
```

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: whatsapp-db
    environment:
      POSTGRES_DB: whatsapp_cloud
      POSTGRES_USER: postgres  
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: whatsapp-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Opcional: Admin tools
  adminer:
    image: adminer
    container_name: whatsapp-adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

### Verificar Setup de Base de Datos

```bash
# Verificar conexión
npm run db:check

# Ver tablas creadas
npm run db:studio

# Ejecutar queries de test
npm run db:test
```

---

## 🔧 Scripts de Base de Datos

### package.json Scripts

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force && npm run db:seed",
    "db:check": "tsx scripts/check-db.ts"
  }
}
```

### Script de Seed de Datos

```typescript
// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // 1. Crear usuario de prueba
  const hashedPassword = await hash('Test123!', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          phoneNumber: '+34123456789',
          onboardingCompleted: true
        }
      }
    }
  });

  // 2. Crear negocio de prueba
  const testBusiness = await prisma.business.upsert({
    where: { id: 'test-business-id' },
    update: {},
    create: {
      id: 'test-business-id',
      ownerId: testUser.id,
      name: 'Mi Tienda de Prueba',
      sector: 'retail',
      employeeCount: '1-10',
      monthlyClients: '100-500',
      phoneNumber: '+34987654321',
      description: 'Tienda de prueba para desarrollo'
    }
  });

  // 3. Configurar WhatsApp de prueba
  await prisma.whatsappConfig.upsert({
    where: { phoneNumberId: 'test-phone-number-id' },
    update: {},
    create: {
      businessId: testBusiness.id,
      phoneNumberId: 'test-phone-number-id',
      businessAccountId: 'test-business-account-id',
      accessToken: 'test-access-token',
      webhookVerifyToken: 'test-verify-token',
      phoneNumber: '+34987654321',
      displayName: 'Mi Tienda',
      verified: true,
      status: 'active'
    }
  });

  // 4. Configurar bot de prueba
  await prisma.botConfig.upsert({
    where: { businessId: testBusiness.id },
    update: {},
    create: {
      businessId: testBusiness.id,
      name: 'Asistente de Mi Tienda',
      welcomeMessage: '¡Hola! Soy el asistente de Mi Tienda. ¿En qué puedo ayudarte?',
      personalityPrompt: 'Eres un asistente amable y profesional de una tienda de retail.',
      active: true
    }
  });

  // 5. Crear conversación de prueba
  const testConversation = await prisma.conversation.upsert({
    where: { 
      businessId_whatsappContactId: {
        businessId: testBusiness.id,
        whatsappContactId: 'test-contact-id'
      }
    },
    update: {},
    create: {
      businessId: testBusiness.id,
      whatsappContactId: 'test-contact-id',
      contactName: 'Cliente de Prueba',
      contactPhone: '+34666777888',
      status: 'active'
    }
  });

  // 6. Crear mensajes de prueba
  const messages = [
    {
      direction: 'inbound' as const,
      content: 'Hola, ¿tienen disponible el producto X?'
    },
    {
      direction: 'outbound' as const,
      content: '¡Hola! Sí, tenemos el producto X disponible. ¿Te gustaría más información?',
      aiGenerated: true
    },
    {
      direction: 'inbound' as const,
      content: 'Sí, me gustaría conocer el precio'
    }
  ];

  for (const [index, message] of messages.entries()) {
    await prisma.message.create({
      data: {
        conversationId: testConversation.id,
        whatsappMessageId: `test-message-${index + 1}`,
        ...message,
        messageType: 'text',
        status: 'delivered',
        createdAt: new Date(Date.now() - (messages.length - index) * 60000)
      }
    });
  }

  console.log('✅ Seed completado:');
  console.log(`   Usuario: ${testUser.email}`);
  console.log(`   Negocio: ${testBusiness.name}`);
  console.log(`   Conversaciones: 1`);
  console.log(`   Mensajes: ${messages.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Script de Verificación

```typescript
// scripts/check-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Verificando configuración de base de datos...\n');

  try {
    // Test conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos: OK');

    // Contar registros en tablas principales
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.whatsappConfig.count(),
      prisma.botConfig.count(),
      prisma.conversation.count(),
      prisma.message.count()
    ]);

    console.log('📊 Datos en base de datos:');
    console.log(`   Usuarios: ${counts[0]}`);
    console.log(`   Negocios: ${counts[1]}`);
    console.log(`   Configs WhatsApp: ${counts[2]}`);
    console.log(`   Configs Bot: ${counts[3]}`);
    console.log(`   Conversaciones: ${counts[4]}`);
    console.log(`   Mensajes: ${counts[5]}`);

    // Verificar índices críticos
    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
    `;
    
    console.log(`📈 Índices personalizados: ${Array.isArray(indexes) ? indexes.length : 0}`);

    console.log('\n✅ Base de datos configurada correctamente');

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
```

---

## 🔑 Configuración de Servicios Externos

### 1. Supabase Setup

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link proyecto existente (si ya lo creaste)
supabase link --project-ref your-project-id

# O crear nuevo proyecto
supabase projects create your-project-name
```

### 2. WhatsApp Business API Setup

```bash
# Proceso manual requerido:
# 1. Crear app en https://developers.facebook.com/apps/
# 2. Agregar producto "WhatsApp Business Platform"
# 3. Configurar Business Manager
# 4. Agregar número telefónico
# 5. Copiar credenciales a .env.local
```

### 3. Stripe Setup

```bash
# Instalar Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Windows/Linux: https://stripe.com/docs/stripe-cli

# Login a Stripe
stripe login

# Configurar webhooks locales
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. OpenAI Setup

```bash
# Solo necesitas API key de https://platform.openai.com/api-keys
# Agregar OPENAI_API_KEY a .env.local
```

---

## 🚀 Arrancar el Proyecto

### 1. Desarrollo Local

```bash
# Verificar que todo esté configurado
npm run check:setup

# Arrancar en modo desarrollo
npm run dev

# El proyecto estará disponible en:
# http://localhost:3000
```

### 2. Verificar APIs

```bash
# Test health check
curl http://localhost:3000/api/health

# Test autenticación
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'

# Test endpoint protegido
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/businesses
```

### 3. Testing de Integración WhatsApp

```bash
# Webhook local para desarrollo
ngrok http 3000

# Configurar webhook URL en Meta:
# https://abc123.ngrok.io/api/webhooks/whatsapp

# Test envío de mensaje
npm run test:whatsapp
```

---

## 🧪 Testing y Debugging

### 1. Scripts de Testing

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testMatch='**/*.integration.test.ts'",
    "test:whatsapp": "tsx scripts/test-whatsapp.ts",
    "test:stripe": "tsx scripts/test-stripe.ts"
  }
}
```

### 2. Script Test WhatsApp

```typescript
// scripts/test-whatsapp.ts
import { WhatsAppClient } from '../lib/whatsapp-client';

async function testWhatsApp() {
  console.log('🧪 Testing WhatsApp integration...');

  const client = new WhatsAppClient(
    process.env.WHATSAPP_ACCESS_TOKEN!,
    process.env.WHATSAPP_PHONE_NUMBER_ID!
  );

  try {
    // Test envío de mensaje
    const result = await client.sendTextMessage(
      process.env.TEST_PHONE_NUMBER!, // Tu número para testing
      '¡Hola! Este es un mensaje de prueba desde el sistema.'
    );

    console.log('✅ Mensaje enviado:', result);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
}

if (require.main === module) {
  testWhatsApp();
}
```

### 3. Configuración Jest

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};

module.exports = createJestConfig(customJestConfig);
```

---

## 🔧 Herramientas de Desarrollo

### 1. VS Code Extensions

```bash
# Instalar extensiones recomendadas
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss  
code --install-extension Prisma.prisma
code --install-extension ms-vscode.vscode-json
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension bradlc.vscode-tailwindcss
code --install-extension usernamehw.errorlens
```

### 2. Configuración VS Code

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^)]*)\\)",
    "[\"'`]([^\"'`]*).*?[\"'`]"
  ]
}
```

### 3. Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## 📝 Scripts Útiles

### package.json Scripts Completos

```json
{
  "scripts": {
    // Desarrollo
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    
    // Base de datos
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate", 
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force && npm run db:seed",
    "db:check": "tsx scripts/check-db.ts",
    "db:backup": "tsx scripts/backup-db.ts",
    
    // Testing
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage", 
    "test:integration": "jest --testMatch='**/*.integration.test.ts'",
    "test:whatsapp": "tsx scripts/test-whatsapp.ts",
    "test:stripe": "tsx scripts/test-stripe.ts",
    "test:all": "npm run test && npm run test:integration",
    
    // Utilidades
    "check:setup": "tsx scripts/check-setup.ts",
    "generate:types": "supabase gen types typescript --local > src/types/database.ts",
    "clean": "rm -rf .next node_modules/.cache",
    "postinstall": "prisma generate",
    
    // Deployment
    "build:production": "NODE_ENV=production npm run build",
    "deploy:staging": "vercel --target staging",
    "deploy:production": "vercel --prod"
  }
}
```

### Script de Verificación Completa

```typescript
// scripts/check-setup.ts
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

async function checkCompleteSetup() {
  console.log('🔍 Verificación completa del setup...\n');

  const checks = [
    checkEnvironmentVariables,
    checkDatabaseConnection, 
    checkRedisConnection,
    checkExternalServices,
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      await check();
    } catch (error) {
      console.error(`❌ ${check.name} falló:`, error.message);
      allPassed = false;
    }
  }

  console.log(allPassed ? '\n🎉 ¡Setup completo y funcional!' : '\n⚠️  Hay problemas que resolver');
  process.exit(allPassed ? 0 : 1);
}

async function checkEnvironmentVariables() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'REDIS_URL',
    'WHATSAPP_ACCESS_TOKEN',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables faltantes: ${missing.join(', ')}`);
  }
  
  console.log('✅ Variables de entorno: OK');
}

async function checkDatabaseConnection() {
  await prisma.$connect();
  const userCount = await prisma.user.count();
  console.log(`✅ Base de datos: OK (${userCount} usuarios)`);
  await prisma.$disconnect();
}

async function checkRedisConnection() {
  const redis = new Redis(process.env.REDIS_URL);
  await redis.ping();
  await redis.quit();
  console.log('✅ Redis: OK');
}

async function checkExternalServices() {
  // Test WhatsApp API
  const whatsappResponse = await fetch(
    `https://graph.facebook.com/v17.0/me?access_token=${process.env.WHATSAPP_ACCESS_TOKEN}`
  );
  
  if (!whatsappResponse.ok) {
    throw new Error('WhatsApp API no responde');
  }
  
  console.log('✅ Servicios externos: OK');
}

checkCompleteSetup();
```

---

## 🚨 Troubleshooting Común

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Si no está corriendo
docker-compose up -d postgres

# Verificar variables de entorno
echo $DATABASE_URL

# Test conexión manual
npx prisma db push
```

### Error: "Redis connection failed"

```bash
# Verificar Redis
docker ps | grep redis

# Si no está corriendo  
docker-compose up -d redis

# Test conexión Redis
redis-cli ping
```

### Error: "WhatsApp API unauthorized"

```bash
# Verificar token
curl -X GET "https://graph.facebook.com/v17.0/me?access_token=YOUR_TOKEN"

# Regenerar token si es necesario
# Ir a Meta for Developers → Tu App → WhatsApp → API Setup
```

### Error: "Stripe webhook signature verification failed"

```bash
# Verificar webhook secret
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copiar webhook secret a .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Error: "OpenAI API quota exceeded"

```bash
# Verificar quota en https://platform.openai.com/usage
# Agregar créditos o cambiar a modelo más económico
```

---

## 📚 Recursos Adicionales

### Documentación de Referencia

- **Next.js 15**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **WhatsApp Business API**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Stripe API**: [stripe.com/docs/api](https://stripe.com/docs/api)

### Herramientas de Monitoring

```bash
# Logs en tiempo real
npm run dev | tee logs/development.log

# Monitoring de base de datos
npm run db:studio

# Redis monitoring
redis-cli monitor

# Webhook testing
ngrok http 3000
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Performance Profiling

```typescript
// next.config.js - habilitar en desarrollo
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },
};
```

---

## ✅ Checklist Final

Una vez completado el setup, deberías poder:

- [ ] ✅ Arrancar `npm run dev` sin errores
- [ ] ✅ Acceder a http://localhost:3000
- [ ] ✅ Login con usuario de prueba (`test@example.com`)
- [ ] ✅ Ver dashboard con datos de prueba
- [ ] ✅ Ejecutar `npm run test` exitosamente  
- [ ] ✅ Recibir webhook de WhatsApp en desarrollo
- [ ] ✅ Procesar pago de prueba con Stripe
- [ ] ✅ Generar respuesta del bot con OpenAI
- [ ] ✅ Ver métricas en tiempo real

**¡Felicidades!** Tienes el entorno de desarrollo completamente configurado y listo para implementar nuevas funcionalidades.

---

## 🆘 Soporte

Si encuentras problemas durante el setup:

1. **Revisa los logs**: `npm run dev` y busca errores específicos
2. **Verifica variables de entorno**: `npm run check:setup`  
3. **Consulta troubleshooting**: Sección anterior de esta guía
4. **Issues conocidos**: Revisa GitHub Issues del proyecto
5. **Contacto**: Crear issue con logs completos y pasos para reproducir

**Tiempo estimado de setup**: 2-4 horas para desarrollador con experiencia en el stack.