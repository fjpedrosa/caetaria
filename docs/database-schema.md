# 💾 Database Schema - WhatsApp Cloud Landing

> **Diseñado para**: Supabase (PostgreSQL 15)  
> **Fecha**: 29 de Agosto, 2025  
> **Estado**: Scripts SQL listos para producción

## 📋 Resumen del Esquema

Esta base de datos está diseñada para soportar un sistema completo de SaaS para WhatsApp Cloud API con:

- **12 tablas principales** con relaciones optimizadas
- **Row Level Security (RLS)** para multi-tenancy seguro
- **Índices optimizados** para queries de alta frecuencia
- **Constraints y validaciones** para integridad de datos
- **Particionamiento preparado** para escalabilidad futura

### 📊 Entidades Principales
- **users** (Usuarios del sistema)
- **businesses** (Negocios de los usuarios)
- **whatsapp_configs** (Configuraciones WhatsApp por negocio)
- **conversations** (Conversaciones WhatsApp)
- **messages** (Mensajes individuales)
- **subscriptions** (Suscripciones Stripe)
- **bot_configs** (Configuración de bots IA)

---

## 🗄️ Schema Completo SQL

### 1. Extensiones y Configuración Inicial

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

-- Create custom types
CREATE TYPE subscription_status AS ENUM (
  'active', 'past_due', 'cancelled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'
);

CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');

CREATE TYPE message_status AS ENUM (
  'pending', 'sent', 'delivered', 'read', 'failed', 'queued'
);

CREATE TYPE whatsapp_status AS ENUM (
  'pending', 'active', 'suspended', 'failed', 'verification_required'
);

CREATE TYPE business_status AS ENUM (
  'active', 'suspended', 'cancelled', 'pending_verification'
);
```

### 2. Tabla Users - Autenticación y Usuarios

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    two_factor_backup_codes TEXT[],
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    sign_in_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT password_reset_token_length CHECK (LENGTH(password_reset_token) >= 32 OR password_reset_token IS NULL)
);

-- User profiles (separate table for profile data)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'es',
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT phone_number_format CHECK (phone_number ~* '^\+[1-9]\d{8,14}$' OR phone_number IS NULL),
    CONSTRAINT language_format CHECK (language ~* '^[a-z]{2}(-[A-Z]{2})?$'),
    CONSTRAINT timezone_valid CHECK (timezone IS NULL OR timezone != ''),
    CONSTRAINT name_not_empty CHECK (
        (first_name IS NULL OR LENGTH(TRIM(first_name)) > 0) AND
        (last_name IS NULL OR LENGTH(TRIM(last_name)) > 0)
    )
);
```

### 3. Tabla Businesses - Negocios y Empresas

```sql
-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    employee_count VARCHAR(20),
    monthly_clients VARCHAR(20),
    phone_number VARCHAR(20),
    country_code VARCHAR(4),
    website_url TEXT,
    description TEXT,
    business_hours JSONB DEFAULT '{}',
    status business_status DEFAULT 'active',
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_documents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT business_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT valid_sector CHECK (sector IN (
        'retail', 'healthcare', 'restaurant', 'education', 'real_estate',
        'automotive', 'beauty', 'fitness', 'legal', 'consulting', 'other'
    )),
    CONSTRAINT valid_employee_count CHECK (employee_count IN (
        '1-10', '11-50', '51-200', '201-1000', '1000+'
    )),
    CONSTRAINT valid_monthly_clients CHECK (monthly_clients IN (
        '0-100', '100-500', '500-2000', '2000-10000', '10000+'
    )),
    CONSTRAINT phone_number_format CHECK (
        phone_number ~* '^\+[1-9]\d{8,14}$' OR phone_number IS NULL
    ),
    CONSTRAINT country_code_format CHECK (
        country_code ~* '^[A-Z]{2,4}$' OR country_code IS NULL
    ),
    CONSTRAINT website_url_format CHECK (
        website_url ~* '^https?://.*' OR website_url IS NULL
    )
);

-- Business team members (future multi-user support)
CREATE TABLE business_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    CONSTRAINT valid_team_status CHECK (status IN ('pending', 'active', 'inactive', 'removed')),
    UNIQUE(business_id, user_id)
);
```

### 4. Tabla WhatsApp Configurations

```sql
-- WhatsApp configurations per business
CREATE TABLE whatsapp_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number_id VARCHAR(255) UNIQUE NOT NULL,
    business_account_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    webhook_verify_token VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    display_name VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    status whatsapp_status DEFAULT 'pending',
    last_verified_at TIMESTAMP WITH TIME ZONE,
    rate_limit_tier VARCHAR(50) DEFAULT 'tier_1',
    webhook_url TEXT,
    webhook_events TEXT[] DEFAULT ARRAY['messages', 'message_deliveries'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT phone_number_format CHECK (phone_number ~* '^\+[1-9]\d{8,14}$'),
    CONSTRAINT phone_number_id_format CHECK (LENGTH(phone_number_id) > 10),
    CONSTRAINT business_account_id_format CHECK (LENGTH(business_account_id) > 10),
    CONSTRAINT webhook_verify_token_length CHECK (LENGTH(webhook_verify_token) >= 32),
    CONSTRAINT access_token_encrypted CHECK (LENGTH(access_token) > 50),
    CONSTRAINT valid_rate_limit_tier CHECK (rate_limit_tier IN (
        'tier_1', 'tier_2', 'tier_3', 'tier_unknown'
    ))
);
```

### 5. Tablas de Bot Configuration

```sql
-- Bot configurations per business  
CREATE TABLE bot_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Mi Asistente',
    welcome_message TEXT NOT NULL,
    response_time VARCHAR(20) DEFAULT 'instant',
    enable_keywords BOOLEAN DEFAULT FALSE,
    keywords JSONB DEFAULT '[]',
    personality_prompt TEXT,
    max_context_turns INTEGER DEFAULT 10,
    fallback_message TEXT DEFAULT 'Lo siento, no pude entender tu mensaje. ¿Puedes ser más específico?',
    llm_provider VARCHAR(50) DEFAULT 'openai',
    llm_model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    active BOOLEAN DEFAULT TRUE,
    business_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT bot_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT welcome_message_not_empty CHECK (LENGTH(TRIM(welcome_message)) > 0),
    CONSTRAINT valid_response_time CHECK (response_time IN ('instant', 'quick', 'normal', 'delayed')),
    CONSTRAINT max_context_turns_positive CHECK (max_context_turns > 0 AND max_context_turns <= 50),
    CONSTRAINT valid_llm_provider CHECK (llm_provider IN ('openai', 'anthropic', 'deepseek', 'local')),
    CONSTRAINT temperature_range CHECK (temperature >= 0.0 AND temperature <= 2.0),
    CONSTRAINT max_tokens_range CHECK (max_tokens > 0 AND max_tokens <= 4096),
    CONSTRAINT fallback_message_not_empty CHECK (LENGTH(TRIM(fallback_message)) > 0)
);

-- Bot response templates (predefined responses)
CREATE TABLE bot_response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_config_id UUID REFERENCES bot_configs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_keywords TEXT[] NOT NULL,
    response_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT template_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT response_text_not_empty CHECK (LENGTH(TRIM(response_text)) > 0),
    CONSTRAINT priority_range CHECK (priority >= 0 AND priority <= 100),
    CONSTRAINT valid_category CHECK (category IN (
        'greeting', 'faq', 'pricing', 'support', 'booking', 'general', 'emergency'
    ))
);
```

### 6. Tablas de Conversations y Messages

```sql
-- Conversations (WhatsApp chats)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    whatsapp_contact_id VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}',
    context_summary TEXT,
    customer_satisfaction_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT contact_phone_format CHECK (contact_phone ~* '^\+[1-9]\d{8,14}$'),
    CONSTRAINT valid_conversation_status CHECK (status IN ('active', 'archived', 'blocked', 'spam')),
    CONSTRAINT whatsapp_contact_id_not_empty CHECK (LENGTH(TRIM(whatsapp_contact_id)) > 0),
    CONSTRAINT message_count_non_negative CHECK (message_count >= 0),
    CONSTRAINT unread_count_non_negative CHECK (unread_count >= 0),
    CONSTRAINT satisfaction_score_range CHECK (
        customer_satisfaction_score IS NULL OR 
        (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5)
    ),
    UNIQUE(business_id, whatsapp_contact_id)
);

-- Messages table (potentially large, optimized for performance)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    whatsapp_message_id VARCHAR(255),
    direction message_direction NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    content TEXT,
    media_url TEXT,
    media_mime_type VARCHAR(100),
    media_size_bytes INTEGER,
    status message_status DEFAULT 'pending',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    context_used JSONB DEFAULT '{}',
    ai_generated BOOLEAN DEFAULT FALSE,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_message_type CHECK (message_type IN (
        'text', 'image', 'audio', 'video', 'document', 'location', 
        'contact', 'sticker', 'template', 'interactive', 'reaction'
    )),
    CONSTRAINT content_or_media CHECK (
        (message_type = 'text' AND content IS NOT NULL) OR
        (message_type != 'text' AND (media_url IS NOT NULL OR content IS NOT NULL))
    ),
    CONSTRAINT retry_count_non_negative CHECK (retry_count >= 0),
    CONSTRAINT media_size_positive CHECK (media_size_bytes IS NULL OR media_size_bytes > 0),
    CONSTRAINT processing_time_positive CHECK (
        processing_time_ms IS NULL OR processing_time_ms >= 0
    ),
    CONSTRAINT whatsapp_message_id_unique CHECK (
        whatsapp_message_id IS NULL OR LENGTH(whatsapp_message_id) > 0
    )
);

-- Message reactions (WhatsApp reactions)
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    whatsapp_contact_id VARCHAR(255) NOT NULL,
    reaction_emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT whatsapp_contact_not_empty CHECK (LENGTH(TRIM(whatsapp_contact_id)) > 0),
    UNIQUE(message_id, whatsapp_contact_id)
);
```

### 7. Tablas de Billing y Subscriptions

```sql
-- Subscriptions (Stripe integration)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    price_per_month_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_plan_type CHECK (plan_type IN ('starter', 'pro', 'enterprise', 'custom')),
    CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly')),
    CONSTRAINT stripe_subscription_id_format CHECK (stripe_subscription_id LIKE 'sub_%'),
    CONSTRAINT stripe_customer_id_format CHECK (stripe_customer_id LIKE 'cus_%'),
    CONSTRAINT price_positive CHECK (price_per_month_cents > 0),
    CONSTRAINT valid_currency CHECK (currency IN ('EUR', 'USD', 'GBP')),
    CONSTRAINT period_order CHECK (
        current_period_start IS NULL OR current_period_end IS NULL OR
        current_period_start < current_period_end
    ),
    CONSTRAINT trial_order CHECK (
        trial_start IS NULL OR trial_end IS NULL OR
        trial_start < trial_end
    )
);

-- Payments (individual payment records)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL,
    description TEXT,
    failure_reason TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT amount_positive CHECK (amount_cents > 0),
    CONSTRAINT valid_payment_status CHECK (status IN (
        'succeeded', 'pending', 'failed', 'canceled', 'requires_action'
    )),
    CONSTRAINT stripe_payment_intent_format CHECK (
        stripe_payment_intent_id IS NULL OR stripe_payment_intent_id LIKE 'pi_%'
    ),
    CONSTRAINT stripe_charge_format CHECK (
        stripe_charge_id IS NULL OR stripe_charge_id LIKE 'ch_%'
    ),
    CONSTRAINT valid_payment_currency CHECK (currency IN ('EUR', 'USD', 'GBP'))
);

-- Usage records (for usage-based billing)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_usage_record_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_metric_type CHECK (metric_type IN (
        'messages_sent', 'messages_received', 'api_calls', 
        'storage_mb', 'contacts', 'ai_requests'
    )),
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT period_order CHECK (period_start <= period_end),
    UNIQUE(business_id, metric_type, period_start)
);
```

### 8. Tablas de Analytics

```sql
-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    country_code VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT event_type_not_empty CHECK (LENGTH(TRIM(event_type)) > 0),
    CONSTRAINT session_id_format CHECK (
        session_id IS NULL OR LENGTH(session_id) >= 10
    ),
    CONSTRAINT valid_device_type CHECK (
        device_type IS NULL OR device_type IN ('desktop', 'mobile', 'tablet', 'unknown')
    ),
    CONSTRAINT country_code_format CHECK (
        country_code IS NULL OR country_code ~* '^[A-Z]{2}$'
    )
);

-- Conversation analytics (aggregated metrics)
CREATE TABLE conversation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    response_time_avg_minutes DECIMAL(10,2),
    response_time_median_minutes DECIMAL(10,2),
    customer_satisfaction INTEGER,
    bot_accuracy_score DECIMAL(3,2),
    human_handoff_count INTEGER DEFAULT 0,
    resolution_status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT messages_sent_non_negative CHECK (messages_sent >= 0),
    CONSTRAINT messages_received_non_negative CHECK (messages_received >= 0),
    CONSTRAINT response_time_positive CHECK (
        response_time_avg_minutes IS NULL OR response_time_avg_minutes >= 0
    ),
    CONSTRAINT customer_satisfaction_range CHECK (
        customer_satisfaction IS NULL OR 
        (customer_satisfaction >= 1 AND customer_satisfaction <= 5)
    ),
    CONSTRAINT bot_accuracy_range CHECK (
        bot_accuracy_score IS NULL OR 
        (bot_accuracy_score >= 0.0 AND bot_accuracy_score <= 1.0)
    ),
    CONSTRAINT handoff_count_non_negative CHECK (human_handoff_count >= 0),
    CONSTRAINT valid_resolution_status CHECK (
        resolution_status IS NULL OR resolution_status IN (
            'resolved', 'pending', 'escalated', 'abandoned'
        )
    ),
    UNIQUE(business_id, conversation_id, date)
);
```

### 9. Tablas de Message Templates

```sql
-- WhatsApp message templates
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    whatsapp_template_id VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'es',
    status VARCHAR(20) DEFAULT 'pending',
    content JSONB NOT NULL,
    variables JSONB DEFAULT '[]',
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT template_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT valid_template_category CHECK (category IN (
        'utility', 'marketing', 'authentication', 'otp'
    )),
    CONSTRAINT valid_template_status CHECK (status IN (
        'pending', 'approved', 'rejected', 'paused', 'disabled'
    )),
    CONSTRAINT language_format CHECK (language ~* '^[a-z]{2}(-[A-Z]{2})?$'),
    CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0),
    CONSTRAINT content_not_empty CHECK (jsonb_array_length(content::jsonb) > 0),
    UNIQUE(business_id, name)
);
```

### 10. Tablas de Onboarding

```sql
-- Onboarding sessions (temporary data during user setup)
CREATE TABLE onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_step VARCHAR(50) NOT NULL DEFAULT 'business_info',
    data JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_onboarding_step CHECK (current_step IN (
        'business_info', 'whatsapp_setup', 'bot_config', 'testing', 'completed'
    )),
    CONSTRAINT expires_in_future CHECK (expires_at > created_at),
    CONSTRAINT completed_consistency CHECK (
        (completed = TRUE AND completed_at IS NOT NULL AND current_step = 'completed') OR
        (completed = FALSE)
    )
);

-- Onboarding step completions (audit trail)
CREATE TABLE onboarding_step_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
    step_name VARCHAR(50) NOT NULL,
    step_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent_seconds INTEGER,
    
    -- Constraints
    CONSTRAINT step_name_not_empty CHECK (LENGTH(TRIM(step_name)) > 0),
    CONSTRAINT time_spent_positive CHECK (
        time_spent_seconds IS NULL OR time_spent_seconds >= 0
    ),
    UNIQUE(session_id, step_name)
);
```

---

## 🔐 Row Level Security (RLS) Policies

### Configuración RLS

```sql
-- Enable RLS on all user-accessible tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_step_completions ENABLE ROW LEVEL SECURITY;
```

### Policies para Users

```sql
-- Users: Only access own data
CREATE POLICY users_own_data ON users 
  FOR ALL USING (auth.uid() = id);

-- User profiles: Only access own profile
CREATE POLICY user_profiles_own_data ON user_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- User profiles: Allow insert during registration
CREATE POLICY user_profiles_insert ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Policies para Business

```sql
-- Businesses: Owner access
CREATE POLICY businesses_owner_access ON businesses 
  FOR ALL USING (auth.uid() = owner_id);

-- Businesses: Team member read access
CREATE POLICY businesses_team_read ON businesses 
  FOR SELECT USING (
    id IN (
      SELECT business_id FROM business_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Business team members: Business owner can manage
CREATE POLICY team_members_owner_manage ON business_team_members
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Business team members: Members can view team
CREATE POLICY team_members_view ON business_team_members
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
```

### Policies para WhatsApp y Messages

```sql
-- WhatsApp configs: Business owner access
CREATE POLICY whatsapp_configs_business_access ON whatsapp_configs 
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Bot configs: Business access
CREATE POLICY bot_configs_business_access ON bot_configs 
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Conversations: Business access
CREATE POLICY conversations_business_access ON conversations 
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Messages: Business access through conversations
CREATE POLICY messages_business_access ON messages 
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
    )
  );

-- Message templates: Business access
CREATE POLICY message_templates_business_access ON message_templates
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
```

### Policies para Billing

```sql
-- Subscriptions: User own subscriptions
CREATE POLICY subscriptions_user_access ON subscriptions 
  FOR ALL USING (auth.uid() = user_id);

-- Payments: User own payments
CREATE POLICY payments_user_access ON payments 
  FOR ALL USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
  );

-- Usage records: Business owner access
CREATE POLICY usage_records_business_access ON usage_records
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
```

### Policies para Analytics

```sql
-- Analytics events: Business access
CREATE POLICY analytics_events_business_access ON analytics_events
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Conversation analytics: Business access
CREATE POLICY conversation_analytics_business_access ON conversation_analytics
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
```

### Policies para Onboarding

```sql
-- Onboarding sessions: User own sessions
CREATE POLICY onboarding_sessions_user_access ON onboarding_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding step completions: User access through sessions
CREATE POLICY onboarding_step_completions_user_access ON onboarding_step_completions
  FOR ALL USING (
    session_id IN (
      SELECT id FROM onboarding_sessions WHERE user_id = auth.uid()
    )
  );
```

---

## 📈 Índices de Performance

### Índices Principales

```sql
-- Users table indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_email_verified ON users(email_verified) WHERE email_verified = FALSE;
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);

-- Businesses table indexes  
CREATE INDEX CONCURRENTLY idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX CONCURRENTLY idx_businesses_status ON businesses(status);
CREATE INDEX CONCURRENTLY idx_businesses_sector ON businesses(sector);
CREATE INDEX CONCURRENTLY idx_businesses_created_at ON businesses(created_at);

-- WhatsApp configs indexes
CREATE INDEX CONCURRENTLY idx_whatsapp_configs_business_id ON whatsapp_configs(business_id);
CREATE INDEX CONCURRENTLY idx_whatsapp_configs_phone_number_id ON whatsapp_configs(phone_number_id);
CREATE INDEX CONCURRENTLY idx_whatsapp_configs_status ON whatsapp_configs(status);

-- Conversations indexes (critical for performance)
CREATE INDEX CONCURRENTLY idx_conversations_business_id ON conversations(business_id);
CREATE INDEX CONCURRENTLY idx_conversations_whatsapp_contact ON conversations(business_id, whatsapp_contact_id);
CREATE INDEX CONCURRENTLY idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX CONCURRENTLY idx_conversations_status ON conversations(status);
CREATE INDEX CONCURRENTLY idx_conversations_unread ON conversations(unread_count) WHERE unread_count > 0;

-- Messages indexes (most critical - large table)
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_direction ON messages(direction);
CREATE INDEX CONCURRENTLY idx_messages_status ON messages(status);
CREATE INDEX CONCURRENTLY idx_messages_created_at ON messages(created_at);
CREATE INDEX CONCURRENTLY idx_messages_whatsapp_message_id ON messages(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_messages_ai_generated ON messages(ai_generated) WHERE ai_generated = TRUE;

-- Subscriptions indexes
CREATE INDEX CONCURRENTLY idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX CONCURRENTLY idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX CONCURRENTLY idx_subscriptions_status ON subscriptions(status);
CREATE INDEX CONCURRENTLY idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Analytics indexes
CREATE INDEX CONCURRENTLY idx_analytics_events_business_id ON analytics_events(business_id);
CREATE INDEX CONCURRENTLY idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX CONCURRENTLY idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX CONCURRENTLY idx_analytics_events_business_date ON analytics_events(business_id, DATE(created_at));

-- Usage records indexes
CREATE INDEX CONCURRENTLY idx_usage_records_business_period ON usage_records(business_id, period_start, metric_type);
CREATE INDEX CONCURRENTLY idx_usage_records_subscription_id ON usage_records(subscription_id);

-- Onboarding indexes
CREATE INDEX CONCURRENTLY idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);
CREATE INDEX CONCURRENTLY idx_onboarding_sessions_expires_at ON onboarding_sessions(expires_at);
CREATE INDEX CONCURRENTLY idx_onboarding_sessions_completed ON onboarding_sessions(completed) WHERE completed = FALSE;
```

### Índices Compuestos para Queries Complejas

```sql
-- Business performance queries
CREATE INDEX CONCURRENTLY idx_conversations_business_status_updated 
  ON conversations(business_id, status, last_message_at DESC);

-- Message analytics queries  
CREATE INDEX CONCURRENTLY idx_messages_conversation_direction_created
  ON messages(conversation_id, direction, created_at DESC);

-- Billing period queries
CREATE INDEX CONCURRENTLY idx_usage_records_business_metric_period
  ON usage_records(business_id, metric_type, period_start DESC, period_end DESC);

-- Analytics time-series queries
CREATE INDEX CONCURRENTLY idx_analytics_business_type_created
  ON analytics_events(business_id, event_type, created_at DESC);
```

---

## 🔄 Triggers y Funciones

### Trigger para Updated At

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at 
  BEFORE UPDATE ON businesses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_configs_updated_at 
  BEFORE UPDATE ON whatsapp_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_configs_updated_at 
  BEFORE UPDATE ON bot_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_sessions_updated_at 
  BEFORE UPDATE ON onboarding_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trigger para Conversation Stats

```sql
-- Function to update conversation stats when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message count and last message timestamp
    UPDATE conversations 
    SET 
        message_count = message_count + 1,
        last_message_at = NEW.created_at,
        unread_count = CASE 
            WHEN NEW.direction = 'inbound' THEN unread_count + 1 
            ELSE unread_count 
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER update_conversation_stats_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();
```

### Trigger para Usage Tracking

```sql
-- Function to track message usage for billing
CREATE OR REPLACE FUNCTION track_message_usage()
RETURNS TRIGGER AS $$
DECLARE
    business_record RECORD;
    current_period_start DATE;
    current_period_end DATE;
BEGIN
    -- Only track outbound messages for billing
    IF NEW.direction = 'outbound' AND NEW.status = 'sent' THEN
        -- Get business info
        SELECT b.id, b.owner_id INTO business_record
        FROM businesses b
        JOIN conversations c ON c.business_id = b.id  
        WHERE c.id = NEW.conversation_id;
        
        -- Calculate current billing period (monthly)
        current_period_start := DATE_TRUNC('month', NEW.created_at)::DATE;
        current_period_end := (current_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
        
        -- Insert or update usage record
        INSERT INTO usage_records (
            business_id, 
            metric_type, 
            quantity, 
            period_start, 
            period_end
        ) VALUES (
            business_record.id,
            'messages_sent',
            1,
            current_period_start,
            current_period_end
        )
        ON CONFLICT (business_id, metric_type, period_start)
        DO UPDATE SET quantity = usage_records.quantity + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER track_message_usage_trigger
  AFTER UPDATE OF status ON messages
  FOR EACH ROW 
  WHEN (NEW.status = 'sent' AND OLD.status != 'sent')
  EXECUTE FUNCTION track_message_usage();
```

---

## 🗄️ Views para Queries Comunes

### Dashboard Views

```sql
-- Business dashboard summary view
CREATE OR REPLACE VIEW business_dashboard AS
SELECT 
    b.id,
    b.name,
    b.sector,
    b.status,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_conversations,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT CASE WHEN m.direction = 'outbound' THEN m.id END) as messages_sent,
    COUNT(DISTINCT CASE WHEN m.direction = 'inbound' THEN m.id END) as messages_received,
    AVG(ca.customer_satisfaction)::DECIMAL(3,1) as avg_satisfaction,
    MAX(c.last_message_at) as last_activity_at
FROM businesses b
LEFT JOIN conversations c ON c.business_id = b.id
LEFT JOIN messages m ON m.conversation_id = c.id AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN conversation_analytics ca ON ca.business_id = b.id AND ca.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY b.id, b.name, b.sector, b.status;

-- Subscription status view
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
    u.id as user_id,
    u.email,
    s.plan_type,
    s.status as subscription_status,
    s.current_period_end,
    s.cancel_at_period_end,
    s.trial_end,
    CASE 
        WHEN s.trial_end > NOW() THEN 'trial'
        WHEN s.status = 'active' THEN 'active' 
        WHEN s.status = 'past_due' THEN 'past_due'
        ELSE 'inactive'
    END as computed_status,
    COUNT(b.id) as business_count
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN businesses b ON b.owner_id = u.id
GROUP BY u.id, u.email, s.plan_type, s.status, s.current_period_end, s.cancel_at_period_end, s.trial_end;
```

### Analytics Views

```sql
-- Daily message statistics
CREATE OR REPLACE VIEW daily_message_stats AS
SELECT 
    b.id as business_id,
    b.name as business_name,
    DATE(m.created_at) as date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN m.direction = 'inbound' THEN 1 END) as inbound_messages,
    COUNT(CASE WHEN m.direction = 'outbound' THEN 1 END) as outbound_messages,
    COUNT(CASE WHEN m.ai_generated = TRUE THEN 1 END) as ai_generated_messages,
    COUNT(DISTINCT m.conversation_id) as active_conversations,
    AVG(m.processing_time_ms)::INTEGER as avg_processing_time_ms
FROM businesses b
LEFT JOIN conversations c ON c.business_id = b.id
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE m.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY b.id, b.name, DATE(m.created_at)
ORDER BY b.id, DATE(m.created_at) DESC;

-- Monthly usage summary for billing
CREATE OR REPLACE VIEW monthly_usage_summary AS
SELECT 
    b.id as business_id,
    b.name as business_name,
    u.email as owner_email,
    DATE_TRUNC('month', ur.period_start) as billing_month,
    SUM(CASE WHEN ur.metric_type = 'messages_sent' THEN ur.quantity ELSE 0 END) as messages_sent,
    SUM(CASE WHEN ur.metric_type = 'api_calls' THEN ur.quantity ELSE 0 END) as api_calls,
    SUM(CASE WHEN ur.metric_type = 'ai_requests' THEN ur.quantity ELSE 0 END) as ai_requests,
    s.plan_type,
    s.status as subscription_status
FROM businesses b
JOIN users u ON u.id = b.owner_id
LEFT JOIN usage_records ur ON ur.business_id = b.id
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE ur.period_start >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY b.id, b.name, u.email, DATE_TRUNC('month', ur.period_start), s.plan_type, s.status
ORDER BY b.id, billing_month DESC;
```

---

## 🚀 Preparación para Escalabilidad

### Particionamiento de Messages (Futuro)

```sql
-- Prepare messages table for partitioning by month
-- (Implementar cuando se alcancen >1M mensajes)

-- 1. Create partition function
CREATE OR REPLACE FUNCTION create_monthly_message_partition(start_date DATE)
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := 'messages_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('
        CREATE TABLE %I PARTITION OF messages
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date);
        
    -- Create indexes on partition
    EXECUTE format('
        CREATE INDEX CONCURRENTLY %I ON %I (conversation_id, created_at DESC)',
        partition_name || '_conversation_created_idx', partition_name);
        
    EXECUTE format('
        CREATE INDEX CONCURRENTLY %I ON %I (created_at)',
        partition_name || '_created_at_idx', partition_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Automated partition creation (future implementation)
-- This would be run by a scheduled job to create future partitions
-- Example: SELECT create_monthly_message_partition('2025-02-01'::DATE);
```

### Archival Strategy

```sql
-- Archive old analytics events (keep last 2 years)
CREATE OR REPLACE FUNCTION archive_old_analytics_events()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
    cutoff_date DATE;
BEGIN
    cutoff_date := CURRENT_DATE - INTERVAL '2 years';
    
    -- Move to archive table (create if not exists)
    CREATE TABLE IF NOT EXISTS analytics_events_archive (
        LIKE analytics_events INCLUDING ALL
    );
    
    WITH archived AS (
        DELETE FROM analytics_events 
        WHERE created_at < cutoff_date
        RETURNING *
    )
    INSERT INTO analytics_events_archive 
    SELECT * FROM archived;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Log archival
    INSERT INTO system_logs (event_type, event_data) 
    VALUES ('analytics_archived', jsonb_build_object(
        'archived_count', archived_count,
        'cutoff_date', cutoff_date
    ));
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔧 Maintenance Scripts

### Database Health Check

```sql
-- Database health check function
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    value NUMERIC,
    threshold NUMERIC,
    message TEXT
) AS $$
BEGIN
    -- Check table sizes
    RETURN QUERY
    WITH table_sizes AS (
        SELECT 
            schemaname, tablename,
            pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
    )
    SELECT 
        'table_size_' || tablename,
        CASE WHEN size_bytes > 1000000000 THEN 'WARNING' ELSE 'OK' END,
        size_bytes::NUMERIC,
        1000000000::NUMERIC,
        'Table size: ' || pg_size_pretty(size_bytes)
    FROM table_sizes;
    
    -- Check connection count
    RETURN QUERY
    SELECT 
        'active_connections'::TEXT,
        CASE WHEN count(*) > 80 THEN 'WARNING' ELSE 'OK' END,
        count(*)::NUMERIC,
        80::NUMERIC,
        'Active connections: ' || count(*)::TEXT
    FROM pg_stat_activity 
    WHERE state = 'active';
    
    -- Check slow queries
    RETURN QUERY
    SELECT 
        'slow_queries'::TEXT,
        CASE WHEN avg(mean_exec_time) > 1000 THEN 'WARNING' ELSE 'OK' END,
        avg(mean_exec_time)::NUMERIC,
        1000::NUMERIC,
        'Average query time: ' || round(avg(mean_exec_time)::NUMERIC, 2)::TEXT || 'ms'
    FROM pg_stat_statements
    WHERE calls > 100;
    
END;
$$ LANGUAGE plpgsql;
```

### Performance Optimization

```sql
-- Function to analyze and suggest indexes
CREATE OR REPLACE FUNCTION analyze_missing_indexes()
RETURNS TABLE(
    table_name TEXT,
    column_names TEXT,
    seq_scan_count BIGINT,
    suggested_index TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.tablename,
        pt.attname,
        pg_stat_user_tables.seq_scan,
        'CREATE INDEX CONCURRENTLY idx_' || pt.tablename || '_' || pt.attname || 
        ' ON ' || pt.tablename || '(' || pt.attname || ')'
    FROM (
        SELECT DISTINCT 
            t.tablename,
            a.attname
        FROM pg_tables t
        JOIN pg_attribute a ON a.attrelid = (t.schemaname||'.'||t.tablename)::regclass
        WHERE t.schemaname = 'public' 
        AND a.attnum > 0 
        AND NOT a.attisdropped
        AND a.attname LIKE '%_id'
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes i 
            WHERE i.tablename = t.tablename 
            AND i.indexdef LIKE '%' || a.attname || '%'
        )
    ) pt
    JOIN pg_stat_user_tables ON pg_stat_user_tables.relname = pt.tablename
    WHERE pg_stat_user_tables.seq_scan > 1000
    ORDER BY pg_stat_user_tables.seq_scan DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 Scripts de Inicialización

### Setup Script Completo

```sql
-- Complete database setup script
-- Run this script on a fresh Supabase project

DO $$
BEGIN
    RAISE NOTICE 'Starting WhatsApp Cloud Landing database setup...';
    
    -- Create all tables (previous SQL code would go here)
    
    -- Create sample data for development
    IF current_setting('app.environment', true) = 'development' THEN
        RAISE NOTICE 'Creating sample data for development...';
        
        -- Insert sample user (in development only)
        INSERT INTO users (id, email, email_verified) 
        VALUES (
            '550e8400-e29b-41d4-a716-446655440000',
            'test@example.com',
            true
        ) ON CONFLICT DO NOTHING;
        
        -- Insert sample business
        INSERT INTO businesses (id, owner_id, name, sector, employee_count) 
        VALUES (
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440000',
            'Test Business',
            'retail',
            '1-10'
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Database setup completed successfully!';
END
$$;
```

### Validation Script

```sql
-- Validation script to ensure setup is correct
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Database validation:';
    RAISE NOTICE '- Tables: %', table_count;
    RAISE NOTICE '- Indexes: %', index_count;  
    RAISE NOTICE '- RLS Policies: %', policy_count;
    
    IF table_count >= 12 AND index_count >= 25 AND policy_count >= 20 THEN
        RAISE NOTICE '✅ Database setup validation PASSED';
    ELSE
        RAISE EXCEPTION '❌ Database setup validation FAILED';
    END IF;
END
$$;
```

---

Este esquema de base de datos proporciona una foundation sólida, escalable y segura para el sistema WhatsApp Cloud Landing, con todas las optimizaciones necesarias para rendimiento y mantenimiento a largo plazo.