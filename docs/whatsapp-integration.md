# 📱 WhatsApp Cloud API Integration Guide

> **Plataforma**: Meta WhatsApp Cloud API  
> **Versión**: v17.0+  
> **Fecha**: 29 de Agosto, 2025  
> **Estado**: Guía completa de implementación

## 📋 Resumen de la Integración

Esta guía proporciona todo lo necesario para implementar una integración completa con WhatsApp Cloud API, desde la configuración inicial hasta el procesamiento avanzado de mensajes con IA.

### 🎯 Capacidades Implementadas
- **Envío/Recepción de mensajes** (texto, multimedia, templates)
- **Verificación de números** telefónicos  
- **Webhooks robustos** con procesamiento asíncrono
- **Bot inteligente** con context management
- **Rate limiting** y manejo de errores
- **Analytics** de conversaciones en tiempo real

---

## 🚀 Setup Inicial WhatsApp Business

### 1. Crear App en Meta for Developers

```bash
# URL: https://developers.facebook.com/apps/
```

**Pasos:**
1. Crear nueva app → "Business" type
2. Agregar producto "WhatsApp Business Platform"
3. Configurar Business Manager (requerido)
4. Obtener credenciales iniciales

### 2. Configuración Business Manager

```typescript
// Datos necesarios para registro
interface BusinessSetup {
  businessName: string;              // Nombre legal de la empresa
  businessAddress: string;           // Dirección fiscal
  businessPhone: string;             // E.164 format
  businessEmail: string;             // Email de contacto empresarial
  businessWebsite?: string;          // Sitio web oficial
  businessCategory: string;          // Categoría de negocio
  businessDescription: string;       // Descripción detallada
}
```

### 3. Verificación de Negocio

Meta requiere verificación empresarial para usar WhatsApp Cloud API:

**Documentos Necesarios:**
- Registro mercantil o CIF
- Extracto bancario empresarial
- Factura de servicios a nombre de la empresa
- Autorización de persona autorizada

**Timeline:** 1-3 semanas para aprobación

---

## 🔑 Configuración de Credenciales

### Obtener Access Tokens

```typescript
// Tipos de tokens necesarios
interface WhatsAppCredentials {
  // Token permanente para app
  appAccessToken: string;            // Nunca expira
  
  // Token temporal para desarrollo/testing
  userAccessToken: string;           // 1-2 horas
  
  // Token de sistema para producción  
  systemUserToken: string;           // No expira (recomendado)
  
  // IDs necesarios
  appId: string;                     // Facebook App ID
  appSecret: string;                 // Facebook App Secret
  businessAccountId: string;         // WhatsApp Business Account ID
  phoneNumberId: string;             // Phone Number ID específico
  
  // Webhook configuration
  webhookVerifyToken: string;        // Token personalizado para verificación
  webhookUrl: string;                // URL del webhook en tu servidor
}
```

### Generar System User Token (Recomendado)

```typescript
// Script para generar token permanente de sistema
const generateSystemUserToken = async () => {
  // 1. Crear System User en Business Manager
  const systemUser = await fetch(`https://graph.facebook.com/v17.0/{business-id}/system_users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'WhatsApp Bot System User',
      role: 'ADMIN'
    })
  });
  
  // 2. Generar token para el System User
  const tokenResponse = await fetch(`https://graph.facebook.com/v17.0/{system-user-id}/access_tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scope: 'whatsapp_business_messaging,whatsapp_business_management'
    })
  });
  
  return tokenResponse.json();
};
```

---

## 📞 Configuración del Número Telefónico

### 1. Agregar Número a Business Account

```typescript
// Proceso de adición de número telefónico
const addPhoneNumber = async (phoneNumber: string) => {
  // Verificar que el número no esté registrado en WhatsApp personal
  const verificationResponse = await fetch(`https://graph.facebook.com/v17.0/{phone-number-id}/request_code`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code_method: 'SMS',
      locale: 'es_ES'
    })
  });
  
  return verificationResponse.json();
};

// Verificar código SMS
const verifyPhoneNumber = async (code: string) => {
  const response = await fetch(`https://graph.facebook.com/v17.0/{phone-number-id}/verify_code`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: code
    })
  });
  
  return response.json();
};
```

### 2. Configurar Display Name y Profile

```typescript
// Configurar información del perfil empresarial
const configureBusinessProfile = async (profile: BusinessProfile) => {
  const response = await fetch(`https://graph.facebook.com/v17.0/{phone-number-id}/whatsapp_business_profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      address: profile.address,
      description: profile.description,
      email: profile.email,
      profile_picture_url: profile.logoUrl,
      websites: [profile.websiteUrl],
      vertical: profile.industry
    })
  });
  
  return response.json();
};

interface BusinessProfile {
  address: string;
  description: string;
  email: string;
  logoUrl?: string;
  websiteUrl?: string;
  industry: 'AUTO' | 'BEAUTY' | 'APPAREL' | 'EDU' | 'ENTERTAIN' | 'EVENT_PLAN' | 'FINANCE' | 'GROCERY' | 'GOVT' | 'HOTEL' | 'HEALTH' | 'NONPROFIT' | 'PROF_SERVICES' | 'RETAIL' | 'TRAVEL' | 'RESTAURANT' | 'OTHER';
}
```

---

## 🔗 Configuración de Webhooks

### 1. Implementar Webhook Endpoint

```typescript
// /api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verificación inicial del webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar token
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verificado exitosamente');
    return new NextResponse(challenge);
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// Procesamiento de mensajes entrantes
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Verificar signature del webhook
    if (!verifyWebhookSignature(body, signature)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const webhookData = JSON.parse(body);
    
    // Procesar webhook de forma asíncrona
    await processWebhookAsync(webhookData);
    
    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Verificar signature de seguridad
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(payload, 'utf8')
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')), 
    Buffer.from(expectedSignature)
  );
}
```

### 2. Configurar Webhook en Meta

```typescript
// Script para configurar webhook automáticamente
const configureWebhook = async () => {
  const response = await fetch(`https://graph.facebook.com/v17.0/{app-id}/webhooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      callback_url: 'https://your-domain.com/api/webhooks/whatsapp',
      verify_token: process.env.WEBHOOK_VERIFY_TOKEN,
      fields: 'messages,message_deliveries'
    })
  });
  
  return response.json();
};

// Suscribir app a WhatsApp webhooks
const subscribeToWebhooks = async () => {
  const response = await fetch(`https://graph.facebook.com/v17.0/{phone-number-id}/subscribed_apps`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscribed_fields: 'messages'
    })
  });
  
  return response.json();
};
```

---

## 💬 Envío de Mensajes

### 1. Cliente WhatsApp API

```typescript
// lib/whatsapp-client.ts
export class WhatsAppClient {
  private baseUrl = 'https://graph.facebook.com/v17.0';
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
  }

  // Enviar mensaje de texto
  async sendTextMessage(to: string, message: string): Promise<SendMessageResponse> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      throw new WhatsAppAPIError(await response.json());
    }

    return response.json();
  }

  // Enviar mensaje multimedia
  async sendMediaMessage(
    to: string, 
    mediaType: MediaType, 
    mediaUrl: string, 
    caption?: string
  ): Promise<SendMessageResponse> {
    const mediaContent: any = {
      link: mediaUrl
    };

    if (caption) {
      mediaContent.caption = caption;
    }

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: mediaType,
        [mediaType]: mediaContent
      })
    });

    return response.json();
  }

  // Enviar template message
  async sendTemplateMessage(
    to: string, 
    templateName: string, 
    languageCode: string = 'es',
    components?: TemplateComponent[]
  ): Promise<SendMessageResponse> {
    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components || []
        }
      })
    });

    return response.json();
  }

  // Marcar mensaje como leído
  async markAsRead(messageId: string): Promise<void> {
    await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });
  }
}

// Tipos TypeScript
type MediaType = 'image' | 'video' | 'audio' | 'document';

interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: {
      fallback_value: string;
      code: string;
      amount_1000: number;
    };
    date_time?: {
      fallback_value: string;
    };
    image?: {
      link: string;
    };
  }>;
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

class WhatsAppAPIError extends Error {
  constructor(public errorData: any) {
    super(`WhatsApp API Error: ${errorData.error?.message || 'Unknown error'}`);
    this.name = 'WhatsAppAPIError';
  }
}
```

### 2. Sistema de Colas (BullMQ)

```typescript
// lib/message-queue.ts
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Configuración Redis
const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

// Cola de mensajes salientes
export const outboundMessageQueue = new Queue('outbound-messages', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// Cola de mensajes entrantes
export const inboundMessageQueue = new Queue('inbound-messages', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});

// Interfaces para jobs
interface OutboundMessageJob {
  businessId: string;
  conversationId: string;
  to: string;
  messageType: 'text' | 'template' | 'media';
  content: string | TemplateMessageData | MediaMessageData;
  priority?: number;
  scheduledAt?: Date;
}

interface InboundMessageJob {
  businessId: string;
  phoneNumberId: string;
  message: WhatsAppInboundMessage;
  timestamp: number;
}

// Worker para mensajes salientes
const outboundWorker = new Worker('outbound-messages', 
  async (job: Job<OutboundMessageJob>) => {
    const { businessId, to, messageType, content } = job.data;
    
    try {
      // Obtener configuración WhatsApp del negocio
      const config = await getWhatsAppConfig(businessId);
      const client = new WhatsAppClient(config.accessToken, config.phoneNumberId);
      
      let result: SendMessageResponse;
      
      // Enviar según tipo de mensaje
      switch (messageType) {
        case 'text':
          result = await client.sendTextMessage(to, content as string);
          break;
        case 'template':
          const templateData = content as TemplateMessageData;
          result = await client.sendTemplateMessage(
            to, 
            templateData.name, 
            templateData.language, 
            templateData.components
          );
          break;
        case 'media':
          const mediaData = content as MediaMessageData;
          result = await client.sendMediaMessage(
            to, 
            mediaData.type, 
            mediaData.url, 
            mediaData.caption
          );
          break;
        default:
          throw new Error(`Unsupported message type: ${messageType}`);
      }
      
      // Actualizar estado del mensaje en BD
      await updateMessageStatus(job.data.conversationId, result.messages[0].id, 'sent');
      
      return result;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Actualizar estado a fallido
      await updateMessageStatus(job.data.conversationId, null, 'failed', error.message);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 5 // Procesar 5 mensajes simultáneamente
  }
);

// Worker para mensajes entrantes
const inboundWorker = new Worker('inbound-messages',
  async (job: Job<InboundMessageJob>) => {
    const { businessId, message } = job.data;
    
    try {
      // Procesar mensaje entrante
      await processInboundMessage(businessId, message);
    } catch (error) {
      console.error('Error procesando mensaje entrante:', error);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 10 // Mayor concurrencia para mensajes entrantes
  }
);

// Función para encolar mensaje saliente
export const enqueueOutboundMessage = async (
  messageData: OutboundMessageJob,
  options?: {
    delay?: number;
    priority?: number;
  }
) => {
  await outboundMessageQueue.add('send-message', messageData, {
    delay: options?.delay,
    priority: options?.priority || 0,
  });
};

// Función para encolar mensaje entrante
export const enqueueInboundMessage = async (
  messageData: InboundMessageJob
) => {
  await inboundMessageQueue.add('process-message', messageData, {
    priority: 10, // Alta prioridad para mensajes entrantes
  });
};
```

---

## 🤖 Procesamiento de Mensajes con IA

### 1. Servicio de Bot Inteligente

```typescript
// lib/bot-service.ts
import { OpenAI } from 'openai';

export class WhatsAppBotService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Generar respuesta inteligente
  async generateResponse(
    businessId: string,
    message: string,
    context: ConversationContext
  ): Promise<BotResponse> {
    try {
      // Obtener configuración del bot
      const botConfig = await getBotConfig(businessId);
      
      // Construir prompt con contexto
      const prompt = this.buildPrompt(botConfig, message, context);
      
      // Llamada a OpenAI
      const completion = await this.openai.chat.completions.create({
        model: botConfig.llmModel,
        messages: prompt,
        temperature: botConfig.temperature,
        max_tokens: botConfig.maxTokens,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        return {
          message: botConfig.fallbackMessage,
          confidence: 0,
          tokensUsed: 0,
          shouldHandoff: false
        };
      }

      // Analizar respuesta para determinar confianza
      const confidence = this.calculateConfidence(response, context);
      const shouldHandoff = confidence < 0.6 || this.detectHandoffKeywords(message);

      return {
        message: response,
        confidence,
        tokensUsed: completion.usage?.total_tokens || 0,
        shouldHandoff,
        metadata: {
          model: botConfig.llmModel,
          temperature: botConfig.temperature,
          processingTime: Date.now() - context.startTime
        }
      };
      
    } catch (error) {
      console.error('Error generando respuesta del bot:', error);
      
      return {
        message: 'Lo siento, tengo problemas técnicos. Un humano te contactará pronto.',
        confidence: 0,
        tokensUsed: 0,
        shouldHandoff: true,
        error: error.message
      };
    }
  }

  // Construir prompt con contexto empresarial
  private buildPrompt(
    botConfig: BotConfig,
    currentMessage: string,
    context: ConversationContext
  ): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [];

    // System prompt con personalidad del bot
    messages.push({
      role: 'system',
      content: `${botConfig.personalityPrompt}

INFORMACIÓN EMPRESARIAL:
- Nombre: ${context.business.name}
- Sector: ${context.business.sector}
- Horarios: ${JSON.stringify(context.business.businessHours)}
- Teléfono: ${context.business.phoneNumber}
- Website: ${context.business.websiteUrl || 'No disponible'}

INSTRUCCIONES:
- Responde en español, de forma amable y profesional
- Usa la información empresarial para personalizar respuestas  
- Si no tienes información suficiente, ofrece contacto humano
- Máximo 280 caracteres por respuesta (límite WhatsApp)
- Si detectas urgencia o frustración, deriva a humano

CONTEXTO DE CONVERSACIÓN:
Mensajes anteriores: ${context.recentMessages.length}
Satisfacción cliente: ${context.customerSatisfaction || 'N/A'}
Tags: ${context.tags.join(', ')}`
    });

    // Agregar contexto de mensajes recientes (últimos 5)
    context.recentMessages.slice(-5).forEach(msg => {
      messages.push({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Mensaje actual del usuario
    messages.push({
      role: 'user', 
      content: currentMessage
    });

    return messages;
  }

  // Calcular confianza de la respuesta
  private calculateConfidence(response: string, context: ConversationContext): number {
    let confidence = 0.8; // Base confidence

    // Reducir si es muy genérica
    const genericPhrases = [
      'no estoy seguro',
      'no tengo información',
      'no puedo ayudarte',
      'contacta con',
    ];
    
    if (genericPhrases.some(phrase => response.toLowerCase().includes(phrase))) {
      confidence -= 0.3;
    }

    // Aumentar si menciona información específica del negocio
    if (response.includes(context.business.name)) confidence += 0.1;
    if (response.includes('horario') && context.business.businessHours) confidence += 0.1;

    // Ajustar por historial de conversación
    if (context.recentMessages.length > 5) confidence += 0.1; // Más contexto
    if (context.customerSatisfaction && context.customerSatisfaction < 3) confidence -= 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  // Detectar keywords que requieren handoff humano
  private detectHandoffKeywords(message: string): boolean {
    const handoffKeywords = [
      'hablar con persona',
      'hablar con humano',
      'quiero quejarme',
      'estoy enfadado',
      'gerente',
      'supervisor',
      'cancelar',
      'devolver dinero',
      'problema urgente',
      'emergencia'
    ];

    const messageLower = message.toLowerCase();
    return handoffKeywords.some(keyword => messageLower.includes(keyword));
  }
}

// Interfaces
interface BotConfig {
  personalityPrompt: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  fallbackMessage: string;
}

interface ConversationContext {
  business: {
    name: string;
    sector: string;
    businessHours: object;
    phoneNumber: string;
    websiteUrl?: string;
  };
  recentMessages: Array<{
    direction: 'inbound' | 'outbound';
    content: string;
    createdAt: Date;
  }>;
  customerSatisfaction?: number;
  tags: string[];
  startTime: number;
}

interface BotResponse {
  message: string;
  confidence: number;
  tokensUsed: number;
  shouldHandoff: boolean;
  metadata?: object;
  error?: string;
}
```

### 2. Context Management

```typescript
// lib/conversation-context.ts
export class ConversationContextManager {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  // Obtener contexto de conversación
  async getContext(conversationId: string): Promise<ConversationContext> {
    const cacheKey = `context:${conversationId}`;
    const cachedContext = await this.redis.get(cacheKey);
    
    if (cachedContext) {
      return JSON.parse(cachedContext);
    }

    // Construir contexto desde base de datos
    const context = await this.buildContextFromDB(conversationId);
    
    // Cachear por 1 hora
    await this.redis.setex(cacheKey, 3600, JSON.stringify(context));
    
    return context;
  }

  // Actualizar contexto con nuevo mensaje
  async updateContext(
    conversationId: string, 
    message: Message
  ): Promise<ConversationContext> {
    const context = await this.getContext(conversationId);
    
    // Agregar mensaje reciente
    context.recentMessages.push({
      direction: message.direction,
      content: message.content,
      createdAt: message.createdAt
    });

    // Mantener solo últimos 10 mensajes en contexto
    if (context.recentMessages.length > 10) {
      context.recentMessages = context.recentMessages.slice(-10);
    }

    // Actualizar timestamp
    context.lastUpdated = new Date();

    // Guardar contexto actualizado
    const cacheKey = `context:${conversationId}`;
    await this.redis.setex(cacheKey, 3600, JSON.stringify(context));
    
    return context;
  }

  // Construir contexto desde base de datos
  private async buildContextFromDB(conversationId: string): Promise<ConversationContext> {
    // Obtener conversación y negocio
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        business: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            direction: true,
            content: true,
            createdAt: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    return {
      business: {
        name: conversation.business.name,
        sector: conversation.business.sector,
        businessHours: conversation.business.businessHours || {},
        phoneNumber: conversation.business.phoneNumber || '',
        websiteUrl: conversation.business.websiteUrl
      },
      recentMessages: conversation.messages.reverse(),
      customerSatisfaction: conversation.customerSatisfactionScore,
      tags: conversation.tags || [],
      startTime: Date.now(),
      lastUpdated: new Date()
    };
  }

  // Limpiar contexto antiguo
  async cleanupOldContexts(): Promise<number> {
    const pattern = 'context:*';
    const keys = await this.redis.keys(pattern);
    
    let deletedCount = 0;
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl < 0) { // Key without expiration or expired
        await this.redis.del(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
}
```

---

## 📊 Analytics y Monitoreo

### 1. Métricas de WhatsApp

```typescript
// lib/whatsapp-analytics.ts
export class WhatsAppAnalytics {
  
  // Registrar evento de mensaje
  async trackMessage(data: MessageTrackingData): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        businessId: data.businessId,
        eventType: `message_${data.direction}`,
        eventData: {
          messageType: data.messageType,
          processingTime: data.processingTime,
          aiGenerated: data.aiGenerated,
          status: data.status
        }
      }
    });

    // Actualizar métricas en tiempo real (Redis)
    const metricsKey = `metrics:${data.businessId}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.hincrby(metricsKey, `messages_${data.direction}`, 1);
    await this.redis.expire(metricsKey, 86400 * 30); // 30 días
  }

  // Obtener métricas del dashboard
  async getDashboardMetrics(
    businessId: string, 
    period: 'today' | 'week' | 'month'
  ): Promise<DashboardMetrics> {
    const dateRange = this.getDateRange(period);
    
    // Consulta optimizada con agregaciones
    const metrics = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_conversations,
        COUNT(DISTINCT m.id) as total_messages,
        COUNT(DISTINCT CASE WHEN m.direction = 'outbound' THEN m.id END) as messages_sent,
        COUNT(DISTINCT CASE WHEN m.direction = 'inbound' THEN m.id END) as messages_received,
        AVG(m.processing_time_ms) as avg_processing_time,
        AVG(ca.customer_satisfaction) as avg_satisfaction,
        COUNT(DISTINCT CASE WHEN m.ai_generated = true THEN m.id END) as ai_responses
      FROM businesses b
      LEFT JOIN conversations c ON c.business_id = b.id
      LEFT JOIN messages m ON m.conversation_id = c.id 
        AND m.created_at >= ${dateRange.start} 
        AND m.created_at <= ${dateRange.end}
      LEFT JOIN conversation_analytics ca ON ca.business_id = b.id 
        AND ca.date >= ${dateRange.start}::date
        AND ca.date <= ${dateRange.end}::date  
      WHERE b.id = ${businessId}
      GROUP BY b.id
    `;

    return this.formatDashboardMetrics(metrics[0]);
  }

  // Obtener trending de mensajes por día
  async getMessageTrends(
    businessId: string,
    days: number = 30
  ): Promise<MessageTrend[]> {
    return prisma.$queryRaw`
      SELECT 
        DATE(m.created_at) as date,
        COUNT(CASE WHEN m.direction = 'inbound' THEN 1 END) as inbound,
        COUNT(CASE WHEN m.direction = 'outbound' THEN 1 END) as outbound,
        COUNT(CASE WHEN m.ai_generated = true THEN 1 END) as ai_generated,
        AVG(m.processing_time_ms) as avg_processing_time
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id  
      WHERE c.business_id = ${businessId}
        AND m.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(m.created_at)
      ORDER BY DATE(m.created_at) DESC
    `;
  }

  // Rate limit tracking
  async trackRateLimit(phoneNumberId: string, tier: string): Promise<RateLimitStatus> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60000); // 1 minuto
    
    const key = `rate_limit:${phoneNumberId}:${Math.floor(now.getTime() / 60000)}`;
    const current = await this.redis.incr(key);
    await this.redis.expire(key, 60);
    
    const limits = this.getRateLimits(tier);
    
    return {
      current,
      limit: limits.perMinute,
      remaining: Math.max(0, limits.perMinute - current),
      resetTime: new Date(Math.ceil(now.getTime() / 60000) * 60000)
    };
  }

  private getRateLimits(tier: string) {
    const limits = {
      'tier_1': { perMinute: 80, perSecond: 20 },
      'tier_2': { perMinute: 80, perSecond: 20 },
      'tier_3': { perMinute: 200, perSecond: 50 },
      'tier_unknown': { perMinute: 80, perSecond: 20 }
    };
    
    return limits[tier] || limits.tier_unknown;
  }
}

// Interfaces
interface MessageTrackingData {
  businessId: string;
  direction: 'inbound' | 'outbound';
  messageType: string;
  processingTime?: number;
  aiGenerated: boolean;
  status: string;
}

interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  messagesSent: number;
  messagesReceived: number;
  averageResponseTime: number;
  averageSatisfaction: number;
  aiResponseRate: number;
}

interface MessageTrend {
  date: string;
  inbound: number;
  outbound: number;
  aiGenerated: number;
  avgProcessingTime: number;
}

interface RateLimitStatus {
  current: number;
  limit: number;
  remaining: number;
  resetTime: Date;
}
```

### 2. Monitoreo de Health

```typescript
// lib/whatsapp-health-monitor.ts
export class WhatsAppHealthMonitor {
  
  // Verificar salud de la integración WhatsApp
  async checkWhatsAppHealth(businessId: string): Promise<HealthStatus> {
    try {
      const config = await getWhatsAppConfig(businessId);
      const client = new WhatsAppClient(config.accessToken, config.phoneNumberId);
      
      // Test básico de conectividad
      const start = Date.now();
      await this.testConnectivity(client);
      const responseTime = Date.now() - start;
      
      // Verificar rate limits
      const rateLimitStatus = await this.checkRateLimit(config.phoneNumberId);
      
      // Verificar webhook
      const webhookStatus = await this.checkWebhookHealth(businessId);
      
      return {
        status: 'healthy',
        responseTime,
        rateLimitStatus,
        webhookStatus,
        lastCheck: new Date()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }

  // Test de conectividad básica
  private async testConnectivity(client: WhatsAppClient): Promise<void> {
    // Hacer una llamada simple a la API para verificar conectividad
    await fetch(`https://graph.facebook.com/v17.0/${client.phoneNumberId}?fields=verified_name`, {
      headers: {
        'Authorization': `Bearer ${client.accessToken}`
      }
    });
  }

  // Verificar webhook health
  private async checkWebhookHealth(businessId: string): Promise<WebhookStatus> {
    const recentWebhooks = await prisma.webhookLog.findMany({
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const successCount = recentWebhooks.filter(w => w.status === 'success').length;
    const errorCount = recentWebhooks.filter(w => w.status === 'error').length;
    
    return {
      recentWebhooks: recentWebhooks.length,
      successRate: recentWebhooks.length > 0 ? successCount / recentWebhooks.length : 1,
      lastWebhook: recentWebhooks[0]?.createdAt || null,
      errors: errorCount
    };
  }

  // Alertas automáticas
  async checkAndSendAlerts(businessId: string): Promise<void> {
    const health = await this.checkWhatsAppHealth(businessId);
    
    if (health.status === 'unhealthy') {
      await this.sendAlert(businessId, {
        type: 'whatsapp_down',
        severity: 'high',
        message: `WhatsApp integration down: ${health.error}`,
        timestamp: new Date()
      });
    }
    
    if (health.rateLimitStatus?.remaining < 10) {
      await this.sendAlert(businessId, {
        type: 'rate_limit_warning',
        severity: 'medium',
        message: `Rate limit warning: ${health.rateLimitStatus.remaining} requests remaining`,
        timestamp: new Date()
      });
    }
    
    if (health.webhookStatus?.successRate < 0.9) {
      await this.sendAlert(businessId, {
        type: 'webhook_errors',
        severity: 'medium',
        message: `High webhook error rate: ${(1 - health.webhookStatus.successRate) * 100}%`,
        timestamp: new Date()
      });
    }
  }

  private async sendAlert(businessId: string, alert: Alert): Promise<void> {
    // Guardar alerta en BD
    await prisma.alert.create({
      data: {
        businessId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        resolved: false
      }
    });
    
    // Enviar notificación (email, Slack, etc.)
    await this.sendNotification(businessId, alert);
  }
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  rateLimitStatus?: RateLimitStatus;
  webhookStatus?: WebhookStatus;
  error?: string;
  lastCheck: Date;
}

interface WebhookStatus {
  recentWebhooks: number;
  successRate: number;
  lastWebhook: Date | null;
  errors: number;
}

interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}
```

---

## 🔧 Troubleshooting y Best Practices

### Errores Comunes y Soluciones

```typescript
// lib/whatsapp-error-handler.ts
export class WhatsAppErrorHandler {
  
  static handleApiError(error: any): WhatsAppError {
    const { error: apiError } = error;
    
    switch (apiError?.code) {
      case 131026: // Message undeliverable
        return new WhatsAppError(
          'MESSAGE_UNDELIVERABLE',
          'El número no está disponible en WhatsApp',
          'warning'
        );
        
      case 131051: // User not opted in
        return new WhatsAppError(
          'USER_NOT_OPTED_IN', 
          'El usuario no ha iniciado conversación. Usa un template message.',
          'info'
        );
        
      case 131052: // Re-engagement message
        return new WhatsAppError(
          'REQUIRES_TEMPLATE',
          'Se requiere mensaje template para re-engagement',
          'info'
        );
        
      case 100: // Invalid parameter
        return new WhatsAppError(
          'INVALID_PARAMETER',
          'Parámetros inválidos en la solicitud',
          'error'
        );
        
      case 4: // Rate limit exceeded
        return new WhatsAppError(
          'RATE_LIMIT_EXCEEDED',
          'Rate limit excedido. Intenta más tarde.',
          'warning'
        );
        
      case 190: // Invalid access token
        return new WhatsAppError(
          'INVALID_TOKEN',
          'Token de acceso inválido o expirado',
          'error'
        );
        
      default:
        return new WhatsAppError(
          'UNKNOWN_ERROR',
          apiError?.message || 'Error desconocido de WhatsApp API',
          'error'
        );
    }
  }
}

class WhatsAppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public severity: 'info' | 'warning' | 'error'
  ) {
    super(message);
    this.name = 'WhatsAppError';
  }
}
```

### Best Practices de Implementación

```typescript
// Best practices y configuraciones recomendadas

const WHATSAPP_BEST_PRACTICES = {
  // Límites de mensajes
  MESSAGE_LIMITS: {
    TEXT_MAX_LENGTH: 4096,
    CAPTION_MAX_LENGTH: 1024,
    FILENAME_MAX_LENGTH: 240
  },
  
  // Tiempos recomendados
  TIMEOUTS: {
    API_REQUEST: 30000,      // 30 segundos
    WEBHOOK_RESPONSE: 5000,  // 5 segundos
    QUEUE_PROCESSING: 60000  // 1 minuto
  },
  
  // Retry policies
  RETRY_CONFIG: {
    MAX_ATTEMPTS: 3,
    BACKOFF_BASE: 2000,      // 2 segundos
    BACKOFF_MAX: 30000,      // 30 segundos
    BACKOFF_MULTIPLIER: 2
  },
  
  // Rate limiting seguro (90% del límite oficial)
  RATE_LIMITS: {
    TIER_1: { perMinute: 72, perSecond: 18 },
    TIER_2: { perMinute: 72, perSecond: 18 },
    TIER_3: { perMinute: 180, perSecond: 45 }
  },
  
  // Template message guidelines
  TEMPLATE_GUIDELINES: {
    // Usar templates para primer contacto
    FIRST_MESSAGE: 'always_template',
    
    // Window de 24 horas para mensajes libres
    FREE_MESSAGE_WINDOW: 24 * 60 * 60 * 1000,
    
    // Categorías recomendadas por caso de uso
    CATEGORIES: {
      APPOINTMENT: 'utility',
      MARKETING: 'marketing',
      OTP: 'authentication',
      RECEIPT: 'utility'
    }
  }
};
```

---

Esta guía proporciona una implementación completa y robusta de WhatsApp Cloud API, desde la configuración inicial hasta el monitoreo avanzado, preparada para manejar miles de conversaciones diarias con alta disponibilidad y performance.