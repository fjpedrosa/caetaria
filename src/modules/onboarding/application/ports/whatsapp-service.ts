/**
 * WhatsApp Service Port
 * Application layer - Interface for WhatsApp API integration
 */

import { Result } from '../../../shared/domain/value-objects/result';
import { WhatsAppIntegrationConfig } from '../../domain/value-objects/whatsapp-config';

export interface WhatsAppValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly businessInfo?: {
    name: string;
    category: string;
    description: string;
  };
}

export interface SendMessageResult {
  readonly messageId: string;
  readonly status: 'sent' | 'delivered' | 'failed';
  readonly timestamp: Date;
}

export interface PhoneVerificationResult {
  readonly success: boolean;
  readonly verificationId: string;
  readonly expiresAt: Date;
}

export interface WhatsAppService {
  /**
   * Validate WhatsApp configuration
   */
  validateConfiguration(config: WhatsAppIntegrationConfig): Promise<Result<WhatsAppValidationResult, Error>>;

  /**
   * Send verification code to phone number
   */
  sendVerificationCode(phoneNumber: string): Promise<Result<PhoneVerificationResult, Error>>;

  /**
   * Verify phone number with code
   */
  verifyPhoneNumber(phoneNumber: string, code: string): Promise<Result<boolean, Error>>;

  /**
   * Send test message
   */
  sendTestMessage(
    config: WhatsAppIntegrationConfig,
    phoneNumber: string,
    message: string
  ): Promise<Result<SendMessageResult, Error>>;

  /**
   * Configure webhook
   */
  configureWebhook(
    config: WhatsAppIntegrationConfig,
    webhookUrl: string
  ): Promise<Result<boolean, Error>>;

  /**
   * Test webhook connectivity
   */
  testWebhook(webhookUrl: string): Promise<Result<boolean, Error>>;

  /**
   * Get business profile
   */
  getBusinessProfile(config: WhatsAppIntegrationConfig): Promise<Result<{
    name: string;
    category: string;
    description: string;
    email?: string;
    websites?: string[];
  }, Error>>;
}
