/**
 * Webhook Notification Service
 * Infrastructure layer - Webhook delivery service implementation
 */

import crypto from 'crypto';

import {
  NotificationStatus,
  WebhookNotification,
  WebhookNotificationData,
} from '../../domain/entities/notification';

// HTTP client interface for webhook calls
interface HttpClient {
  request(options: {
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  }>;
}

// Webhook delivery result
export interface WebhookDeliveryResult {
  id: string;
  status: NotificationStatus;
  httpStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveryTime: number;
}

// Webhook retry configuration
export interface WebhookRetryConfig {
  maxRetries: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: WebhookRetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Webhook notification service implementation
 */
export interface WebhookService {
  send(notification: WebhookNotification): Promise<WebhookDeliveryResult>;
  sendWithRetry(notification: WebhookNotification, retryConfig?: WebhookRetryConfig): Promise<WebhookDeliveryResult>;
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean;
  generateWebhookSignature(payload: string, secret: string): string;
  testWebhookEndpoint(url: string, secretKey?: string): Promise<{ isValid: boolean; responseTime: number; error?: string }>;
}

/**
 * Create webhook notification service
 */
export const createWebhookService = (
  httpClient: HttpClient,
  config: {
    userAgent?: string;
    defaultTimeout?: number;
    enableRetries?: boolean;
  } = {}
): WebhookService => {

  const send = async (notification: WebhookNotification): Promise<WebhookDeliveryResult> => {
    const startTime = Date.now();
    const { data } = notification;

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent || 'WebhookService/1.0',
        ...data.headers,
      };

      // Generate signature if secret key is provided
      if (data.secretKey) {
        const payload = JSON.stringify(data.payload);
        const signature = generateWebhookSignature(payload, data.secretKey);
        headers['X-Webhook-Signature'] = signature;
        headers['X-Webhook-Signature-256'] = `sha256=${signature}`;
      }

      // Make HTTP request
      const response = await httpClient.request({
        url: data.url,
        method: data.method,
        headers,
        body: JSON.stringify(data.payload),
        timeout: data.timeout || config.defaultTimeout || 30000,
      });

      const deliveryTime = Date.now() - startTime;

      // Check if response indicates success
      if (response.status >= 200 && response.status < 300) {
        return {
          id: notification.id,
          status: NotificationStatus.DELIVERED,
          httpStatus: response.status,
          responseBody: response.body,
          deliveryTime,
        };
      } else {
        return {
          id: notification.id,
          status: NotificationStatus.FAILED,
          httpStatus: response.status,
          responseBody: response.body,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          deliveryTime,
        };
      }
    } catch (error) {
      const deliveryTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        id: notification.id,
        status: NotificationStatus.FAILED,
        errorMessage,
        deliveryTime,
      };
    }
  };

  const sendWithRetry = async (
    notification: WebhookNotification,
    retryConfig: WebhookRetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<WebhookDeliveryResult> => {
    let lastResult: WebhookDeliveryResult;
    let attempt = 0;

    while (attempt <= retryConfig.maxRetries) {
      lastResult = await send(notification);

      // Success - return immediately
      if (lastResult.status === NotificationStatus.DELIVERED) {
        return lastResult;
      }

      // Check if we should retry
      const shouldRetry =
        attempt < retryConfig.maxRetries &&
        lastResult.httpStatus &&
        retryConfig.retryableStatusCodes.includes(lastResult.httpStatus);

      if (!shouldRetry) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
      attempt++;
    }

    return lastResult;
  };

  const validateWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
    try {
      const expectedSignature = generateWebhookSignature(payload, secret);

      // Support multiple signature formats
      const providedSignature = signature.replace(/^sha256=/, '');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  };

  const generateWebhookSignature = (payload: string, secret: string): string => {
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  };

  const testWebhookEndpoint = async (
    url: string,
    secretKey?: string
  ): Promise<{ isValid: boolean; responseTime: number; error?: string }> => {
    const startTime = Date.now();

    try {
      // Create test payload
      const testPayload = {
        event: 'webhook_test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
        },
      };

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent || 'WebhookService/1.0',
      };

      // Add signature if secret provided
      if (secretKey) {
        const payload = JSON.stringify(testPayload);
        const signature = generateWebhookSignature(payload, secretKey);
        headers['X-Webhook-Signature-256'] = `sha256=${signature}`;
      }

      // Make test request
      const response = await httpClient.request({
        url,
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        timeout: config.defaultTimeout || 10000,
      });

      const responseTime = Date.now() - startTime;

      return {
        isValid: response.status >= 200 && response.status < 300,
        responseTime,
        error: response.status >= 400 ? `HTTP ${response.status}: ${response.statusText}` : undefined,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        isValid: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return {
    send,
    sendWithRetry,
    validateWebhookSignature,
    generateWebhookSignature,
    testWebhookEndpoint,
  };
};

/**
 * Built-in HTTP client using fetch API
 */
export const createFetchHttpClient = (): HttpClient => ({
  request: async (options) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const body = await response.text();
      const headers: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        body,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },
});

/**
 * Webhook event types for common integrations
 */
export const WEBHOOK_EVENTS = {
  LEAD_CAPTURED: 'lead.captured',
  LEAD_QUALIFIED: 'lead.qualified',
  DEMO_SCHEDULED: 'demo.scheduled',
  ONBOARDING_STARTED: 'onboarding.started',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
} as const;

/**
 * Standard webhook payload structure
 */
export interface StandardWebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  source: {
    name: string;
    version: string;
  };
  webhook: {
    id: string;
    attempt: number;
  };
}