/**
 * WhatsApp Configuration Value Objects
 * Domain layer - Pure business rules for WhatsApp integration configuration
 */

export type WhatsAppBusinessAccountId = string & { readonly __brand: unique symbol };
export type WhatsAppPhoneNumberId = string & { readonly __brand: unique symbol };
export type WhatsAppAppId = string & { readonly __brand: unique symbol };
export type WhatsAppAccessToken = string & { readonly __brand: unique symbol };
export type WebhookUrl = string & { readonly __brand: unique symbol };
export type VerifyToken = string & { readonly __brand: unique symbol };

export interface WhatsAppIntegrationConfig {
  readonly businessAccountId: WhatsAppBusinessAccountId;
  readonly phoneNumberId: WhatsAppPhoneNumberId;
  readonly appId: WhatsAppAppId;
  readonly accessToken: WhatsAppAccessToken;
  readonly webhookUrl: WebhookUrl;
  readonly verifyToken: VerifyToken;
  readonly isTestMode: boolean;
  readonly createdAt: Date;
}

export interface PhoneNumberVerification {
  readonly phoneNumber: string;
  readonly countryCode: string;
  readonly isVerified: boolean;
  readonly verificationCode?: string;
  readonly verificationAttempts: number;
  readonly lastVerificationAt?: Date;
  readonly verifiedAt?: Date;
}

export interface BotConfiguration {
  readonly name: string;
  readonly welcomeMessage: string;
  readonly businessHours: BusinessHours;
  readonly autoReplyEnabled: boolean;
  readonly languageCode: string;
  readonly fallbackMessage: string;
  readonly commands: BotCommand[];
}

export interface BusinessHours {
  readonly enabled: boolean;
  readonly timezone: string;
  readonly schedule: WeeklySchedule;
  readonly closedMessage?: string;
}

export interface WeeklySchedule {
  readonly monday: DaySchedule;
  readonly tuesday: DaySchedule;
  readonly wednesday: DaySchedule;
  readonly thursday: DaySchedule;
  readonly friday: DaySchedule;
  readonly saturday: DaySchedule;
  readonly sunday: DaySchedule;
}

export interface DaySchedule {
  readonly isOpen: boolean;
  readonly openTime?: string; // HH:MM format
  readonly closeTime?: string; // HH:MM format
}

export interface BotCommand {
  readonly trigger: string;
  readonly description: string;
  readonly response: string;
  readonly isActive: boolean;
}

export class WhatsAppConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WhatsAppConfigValidationError';
  }
}

export class PhoneVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PhoneVerificationError';
  }
}

/**
 * Pure function to validate and create WhatsApp integration configuration
 */
export function createWhatsAppIntegrationConfig(params: {
  businessAccountId: string;
  phoneNumberId: string;
  appId: string;
  accessToken: string;
  webhookUrl: string;
  verifyToken: string;
  isTestMode?: boolean;
}): WhatsAppIntegrationConfig {
  // Validate business account ID
  if (!params.businessAccountId?.trim()) {
    throw new WhatsAppConfigValidationError('Business Account ID is required');
  }
  
  // Validate phone number ID
  if (!params.phoneNumberId?.trim()) {
    throw new WhatsAppConfigValidationError('Phone Number ID is required');
  }
  
  // Validate app ID
  if (!params.appId?.trim()) {
    throw new WhatsAppConfigValidationError('App ID is required');
  }
  
  // Validate access token
  if (!params.accessToken?.trim()) {
    throw new WhatsAppConfigValidationError('Access Token is required');
  }
  
  if (params.accessToken.length < 50) {
    throw new WhatsAppConfigValidationError('Access Token appears to be invalid');
  }
  
  // Validate webhook URL
  if (!params.webhookUrl?.trim()) {
    throw new WhatsAppConfigValidationError('Webhook URL is required');
  }
  
  try {
    const url = new URL(params.webhookUrl);
    if (url.protocol !== 'https:') {
      throw new WhatsAppConfigValidationError('Webhook URL must use HTTPS');
    }
  } catch {
    throw new WhatsAppConfigValidationError('Invalid Webhook URL format');
  }
  
  // Validate verify token
  if (!params.verifyToken?.trim()) {
    throw new WhatsAppConfigValidationError('Verify Token is required');
  }
  
  if (params.verifyToken.length < 8) {
    throw new WhatsAppConfigValidationError('Verify Token must be at least 8 characters');
  }
  
  return {
    businessAccountId: params.businessAccountId.trim() as WhatsAppBusinessAccountId,
    phoneNumberId: params.phoneNumberId.trim() as WhatsAppPhoneNumberId,
    appId: params.appId.trim() as WhatsAppAppId,
    accessToken: params.accessToken.trim() as WhatsAppAccessToken,
    webhookUrl: params.webhookUrl.trim() as WebhookUrl,
    verifyToken: params.verifyToken.trim() as VerifyToken,
    isTestMode: params.isTestMode ?? false,
    createdAt: new Date(),
  };
}

/**
 * Pure function to create phone number verification
 */
export function createPhoneNumberVerification(params: {
  phoneNumber: string;
  countryCode: string;
}): PhoneNumberVerification {
  // Validate phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(params.phoneNumber.replace(/\s+/g, ''))) {
    throw new PhoneVerificationError('Invalid phone number format');
  }
  
  // Validate country code
  if (!params.countryCode || params.countryCode.length !== 2) {
    throw new PhoneVerificationError('Invalid country code');
  }
  
  return {
    phoneNumber: params.phoneNumber.replace(/\s+/g, ''),
    countryCode: params.countryCode.toUpperCase(),
    isVerified: false,
    verificationAttempts: 0,
  };
}

/**
 * Pure function to create bot configuration with defaults
 */
export function createBotConfiguration(params: {
  name: string;
  welcomeMessage?: string;
  languageCode?: string;
  businessHours?: Partial<BusinessHours>;
}): BotConfiguration {
  if (!params.name?.trim()) {
    throw new WhatsAppConfigValidationError('Bot name is required');
  }
  
  if (params.name.trim().length < 2) {
    throw new WhatsAppConfigValidationError('Bot name must be at least 2 characters');
  }
  
  if (params.name.trim().length > 50) {
    throw new WhatsAppConfigValidationError('Bot name must be less than 50 characters');
  }
  
  const defaultBusinessHours: BusinessHours = {
    enabled: false,
    timezone: 'UTC',
    schedule: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: false },
      sunday: { isOpen: false },
    },
  };
  
  return {
    name: params.name.trim(),
    welcomeMessage: params.welcomeMessage?.trim() || `Hello! Welcome to ${params.name.trim()}. How can I help you today?`,
    businessHours: { ...defaultBusinessHours, ...params.businessHours },
    autoReplyEnabled: true,
    languageCode: params.languageCode || 'en',
    fallbackMessage: "I'm sorry, I didn't understand that. Please try again or type 'help' for assistance.",
    commands: [
      {
        trigger: 'help',
        description: 'Show available commands',
        response: 'Available commands:\n• help - Show this help message\n• contact - Contact support',
        isActive: true,
      },
      {
        trigger: 'contact',
        description: 'Contact support',
        response: 'For support, please email us at support@example.com or call +1-555-0123',
        isActive: true,
      },
    ],
  };
}

/**
 * Pure function to verify phone number with code
 */
export function verifyPhoneNumber(
  verification: PhoneNumberVerification,
  code: string
): PhoneNumberVerification {
  if (verification.verificationAttempts >= 5) {
    throw new PhoneVerificationError('Too many verification attempts');
  }
  
  if (!verification.verificationCode) {
    throw new PhoneVerificationError('No verification code sent');
  }
  
  const isCodeValid = verification.verificationCode === code.trim();
  
  return {
    ...verification,
    isVerified: isCodeValid,
    verificationAttempts: verification.verificationAttempts + 1,
    verifiedAt: isCodeValid ? new Date() : verification.verifiedAt,
  };
}

/**
 * Pure function to generate verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Pure function to mask access token for display
 */
export function maskAccessToken(token: string): string {
  if (token.length <= 8) return '***';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Pure function to validate time format (HH:MM)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Pure function to check if business is open at given time
 */
export function isBusinessOpen(businessHours: BusinessHours, date: Date): boolean {
  if (!businessHours.enabled) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayName = dayNames[date.getDay()];
  const daySchedule = businessHours.schedule[dayName];
  
  if (!daySchedule.isOpen) return false;
  if (!daySchedule.openTime || !daySchedule.closeTime) return true;
  
  const currentTime = date.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= daySchedule.openTime && currentTime <= daySchedule.closeTime;
}

/**
 * Pure function to get supported languages
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'sw', name: 'Swahili' },
    { code: 'am', name: 'Amharic' },
    { code: 'ha', name: 'Hausa' },
    { code: 'ig', name: 'Igbo' },
    { code: 'yo', name: 'Yoruba' },
  ];
}
