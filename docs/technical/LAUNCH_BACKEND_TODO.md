# 🔧 Backend TODO - WhatsApp Cloud Landing

## 📊 Para Fase de Validación (INMEDIATO - Semana 1)

### Supabase Setup
- [ ] **Crear proyecto en Supabase**
  - [ ] Registrar cuenta en supabase.com
  - [ ] Crear nuevo proyecto "whatsapp-cloud-landing"
  - [ ] Obtener URL del proyecto y anon key
  - [ ] Configurar variables de entorno (.env.local)
  - [ ] Test de conexión inicial

### Lead Capture Database
- [ ] **Crear tabla `leads` con schema completo**
  ```sql
  CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    industry TEXT,
    whatsapp_number TEXT,
    full_name TEXT,
    business_type TEXT,
    monthly_volume INTEGER,
    current_solution TEXT,
    pain_points TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Marketing attribution
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT,
    landing_page TEXT,
    -- Onboarding tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step_completed INTEGER DEFAULT 0,
    onboarding_data JSONB,
    onboarding_completed_at TIMESTAMP,
    -- Analytics
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    country_code TEXT,
    device_type TEXT,
    -- Quality scoring
    lead_score INTEGER DEFAULT 0,
    is_qualified BOOLEAN DEFAULT FALSE,
    qualification_notes TEXT
  );
  ```

- [ ] **Implementar `/api/leads` POST endpoint**
  - [ ] Validación de datos con Zod schema
  - [ ] Guardar todos los campos del onboarding
  - [ ] Capturar UTM parameters automáticamente
  - [ ] Guardar onboarding progress step by step
  - [ ] Return success/error responses
  - [ ] Rate limiting (max 5 requests per minute)

### Notificaciones Sistema
- [ ] **Setup email service (SendGrid/Resend)**
  - [ ] Crear cuenta en SendGrid/Resend
  - [ ] Configurar API key en variables de entorno
  - [ ] Crear template para nuevos leads
  - [ ] Template incluye: datos del lead, timestamp, next steps
  - [ ] Test de envío manual

- [ ] **Webhook Slack/Discord**
  - [ ] Crear webhook URL en Slack/Discord
  - [ ] Implementar `/api/webhook/lead-notification`
  - [ ] Mensaje incluye: lead info, score, link a dashboard
  - [ ] Test de envío automático

### Tracking y Analytics
- [ ] **Google Ads conversion pixel**
  - [ ] Configurar Google Ads conversion tracking
  - [ ] Implementar pixel en thank you page
  - [ ] Test de tracking con herramientas dev
  - [ ] Verificar conversiones en Google Ads dashboard

- [ ] **Facebook Pixel (opcional)**
  - [ ] Setup Facebook Business Manager
  - [ ] Implementar Facebook Pixel
  - [ ] Configurar custom conversion
  - [ ] Test de tracking

- [ ] **Enhanced event tracking**
  - [ ] Onboarding step completion events
  - [ ] Form field interaction events
  - [ ] Time spent per step
  - [ ] Drop-off point identification

### Dashboard Básico de Administración
- [ ] **Página admin protegida**
  - [ ] Simple password protection (no auth complejo)
  - [ ] Ruta: `/admin/leads`
  - [ ] Middleware de protección

- [ ] **Tabla de leads con funcionalidad**
  - [ ] Lista todos los leads ordenados por fecha
  - [ ] Filtros: por fecha, estado onboarding, fuente
  - [ ] Paginación (20 leads por página)
  - [ ] Search por email o company name
  - [ ] Color coding: completos vs incompletos

- [ ] **Export y métricas**
  - [ ] Export CSV con todos los campos
  - [ ] Métricas básicas: total leads, por día, conversion rate
  - [ ] Gráfico simple de leads por día (últimos 30 días)
  - [ ] Top sources (UTM tracking)

### Thank You Page
- [ ] **Crear página post-onboarding**
  - [ ] Ruta: `/onboarding/thank-you`
  - [ ] Mensaje claro de próximos pasos
  - [ ] Timeline esperado de contacto (24-48h)
  - [ ] Enlaces a recursos educativos
  - [ ] Social sharing opcional
  - [ ] Tracking pixels implementation

---

## 🚀 Para MVP Real (Post-Validación - Mes 2-4)

> **IMPORTANTE**: Solo implementar después de validar el mercado con la fase anterior

### Autenticación y Usuarios Completa
- [ ] **Supabase Auth setup completo**
  - [ ] Login/Register flows con UI
  - [ ] Password recovery functionality
  - [ ] Email verification obligatoria
  - [ ] Session management avanzada
  - [ ] Protected routes con middleware
  - [ ] User roles (admin, business_owner, team_member)

### Base de Datos Completa
- [ ] **Schema de usuarios extendido**
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'business_owner',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
  );
  ```

- [ ] **Schema de businesses**
  ```sql
  CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    whatsapp_number TEXT UNIQUE,
    whatsapp_display_name TEXT,
    logo_url TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    business_hours JSONB,
    timezone TEXT DEFAULT 'Europe/Madrid',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Schema de configuraciones WhatsApp**
  ```sql
  CREATE TABLE whatsapp_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    webhook_verify_token TEXT NOT NULL,
    webhook_url TEXT,
    bot_personality TEXT,
    welcome_message TEXT,
    fallback_message TEXT,
    business_hours_message TEXT,
    auto_reply_enabled BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **Schema de conversaciones y mensajes**
  ```sql
  CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    whatsapp_phone_number TEXT NOT NULL,
    customer_name TEXT,
    status TEXT DEFAULT 'active',
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );

  CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    whatsapp_message_id TEXT UNIQUE,
    type TEXT NOT NULL, -- 'text', 'image', 'template', etc.
    content TEXT,
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    status TEXT DEFAULT 'sent',
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
  );
  ```

- [ ] **Schema de billing y suscripciones**
  ```sql
  CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    month_year TEXT NOT NULL, -- '2025-01'
    messages_sent INTEGER DEFAULT 0,
    conversations_handled INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

### APIs Core Completas
- [ ] **API de usuarios (CRUD)**
  - [ ] GET /api/users/profile
  - [ ] PUT /api/users/profile
  - [ ] POST /api/users/change-password
  - [ ] POST /api/users/upload-avatar
  - [ ] DELETE /api/users/delete-account

- [ ] **API de businesses**
  - [ ] POST /api/businesses (crear negocio)
  - [ ] GET /api/businesses/:id
  - [ ] PUT /api/businesses/:id
  - [ ] DELETE /api/businesses/:id
  - [ ] GET /api/businesses/:id/stats

- [ ] **API de onboarding persistente**
  - [ ] POST /api/onboarding/start
  - [ ] PUT /api/onboarding/step/:step
  - [ ] GET /api/onboarding/status
  - [ ] POST /api/onboarding/complete

- [ ] **API de configuración WhatsApp**
  - [ ] POST /api/whatsapp/setup
  - [ ] GET /api/whatsapp/config
  - [ ] PUT /api/whatsapp/config
  - [ ] POST /api/whatsapp/verify
  - [ ] GET /api/whatsapp/templates

- [ ] **API de analytics completo**
  - [ ] GET /api/analytics/dashboard
  - [ ] GET /api/analytics/conversations
  - [ ] GET /api/analytics/messages
  - [ ] POST /api/analytics/events

### WhatsApp Integration Completa
- [ ] **WhatsApp Business API application**
  - [ ] Solicitar acceso a WhatsApp Business API
  - [ ] Crear App en Meta for Developers
  - [ ] Configurar Business Manager
  - [ ] Proceso de verificación de business (1-2 semanas)
  - [ ] Obtener Phone Number ID y tokens

- [ ] **Webhook endpoints**
  - [ ] POST /api/webhooks/whatsapp/messages
  - [ ] GET /api/webhooks/whatsapp/verify
  - [ ] Message status updates handling
  - [ ] Error handling y retry logic
  - [ ] Rate limiting y queue management

- [ ] **Message sending API**
  - [ ] Text messages
  - [ ] Template messages
  - [ ] Media messages (images, documents)
  - [ ] Interactive messages (buttons, lists)
  - [ ] Message templates management

- [ ] **Message queue system (BullMQ)**
  - [ ] Setup Redis for queue storage
  - [ ] Message sending queue
  - [ ] Retry logic for failed sends
  - [ ] Priority queue for urgent messages
  - [ ] Queue monitoring dashboard

### Sistema de Pagos (Stripe)
- [ ] **Stripe account setup**
  - [ ] Crear cuenta Stripe business
  - [ ] Configurar products y prices
  - [ ] Setup webhook endpoints
  - [ ] Test en modo sandbox

- [ ] **Checkout y subscriptions**
  - [ ] POST /api/stripe/checkout-session
  - [ ] POST /api/stripe/portal-session
  - [ ] POST /api/webhooks/stripe
  - [ ] Subscription lifecycle management
  - [ ] Upgrade/downgrade flows

- [ ] **Billing features**
  - [ ] Invoice generation automática
  - [ ] Usage-based billing tracking
  - [ ] Customer portal integration
  - [ ] Trial period management
  - [ ] Cancellation y refunds

### Seguridad Avanzada
- [ ] **Database security**
  - [ ] Row Level Security (RLS) policies
  - [ ] Audit logging automático
  - [ ] Data encryption at rest
  - [ ] Regular security scans

- [ ] **API security**
  - [ ] Input sanitization completa
  - [ ] SQL injection prevention
  - [ ] XSS protection headers
  - [ ] CSRF tokens where needed
  - [ ] API key rotation system
  - [ ] Rate limiting por endpoint

### Monitoring y Observability
- [ ] **Error tracking avanzado**
  - [ ] Sentry performance monitoring
  - [ ] Custom error boundaries
  - [ ] Database query monitoring
  - [ ] API endpoint performance

- [ ] **Business metrics**
  - [ ] Custom dashboards
  - [ ] MRR tracking
  - [ ] Churn analysis
  - [ ] User engagement metrics
  - [ ] Conversion funnel analysis

### DevOps y Infraestructura
- [ ] **CI/CD pipeline**
  - [ ] GitHub Actions setup
  - [ ] Automated testing pipeline
  - [ ] Deployment automático a staging
  - [ ] Manual approval para production

- [ ] **Backup y recovery**
  - [ ] Automated database backups
  - [ ] Point-in-time recovery
  - [ ] Disaster recovery plan
  - [ ] Data retention policies

---

## 📋 Notas Importantes

### Para Fase de Validación
- **Prioridad absoluta**: Solo implementar lo mínimo para capturar leads y medir conversión
- **Tiempo estimado**: 4-5 días de desarrollo
- **Objetivo**: Validar product-market fit antes de invertir en desarrollo completo

### Para MVP Real
- **Solo si validación es exitosa**: CPL < €50, conversion > 40%, leads cualificados
- **Tiempo estimado**: 3-4 meses con desarrollador full-time
- **Inversión**: €15,000-25,000 en desarrollo + infraestructura

### Criterios Go/No-Go
- **GO para MVP**: Métricas de validación positivas + €10k budget disponible
- **NO-GO**: CPL > €100, conversion < 20%, feedback negativo de leads

---

*Documento creado: Agosto 2025*
*Próxima actualización: Después de completar fase de validación*