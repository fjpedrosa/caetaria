/**
 * API-specific types and interfaces
 */

import type {
  ApiResponse,
  BusinessInfo,
  ContactInfo,
  Email,
  PaginationParams,
  PhoneNumber,
  Timestamp,
  URL,
  UserId} from './global'

// Base API types
export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, unknown>
}

export interface ApiSuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse extends ApiResponse {
  success: false
  error: ApiError
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Authentication API types
export interface LoginRequest {
  email: Email
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: ApiUser
  token: string
  refreshToken: string
  expiresAt: Timestamp
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: Email
  password: string
  terms: boolean
  marketing?: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ResetPasswordRequest {
  email: Email
}

export interface ConfirmPasswordResetRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// User API types
export interface ApiUser {
  id: UserId
  email: Email
  firstName: string
  lastName: string
  avatar?: URL
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
  emailVerified: boolean
  phoneVerified?: boolean
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr' | 'pt' | 'de'
  timezone: string
  dateFormat: string
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
    security: boolean
  }
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  avatar?: URL
  preferences?: Partial<UserPreferences>
}

export interface UserListResponse {
  users: ApiUser[]
  total: number
  page: number
  pageSize: number
}

// Contact/Lead API types
export interface CreateLeadRequest {
  name: string
  email: Email
  phone?: PhoneNumber
  company?: string
  message: string
  subject?: string
  source?: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
}

export interface ApiLead {
  id: string
  name: string
  email: Email
  phone?: PhoneNumber
  company?: string
  message: string
  subject?: string
  source?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
  assignedTo?: UserId
  createdAt: Timestamp
  updatedAt: Timestamp
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  notes?: LeadNote[]
}

export interface LeadNote {
  id: string
  content: string
  createdBy: UserId
  createdAt: Timestamp
}

export interface UpdateLeadRequest {
  status?: ApiLead['status']
  assignedTo?: UserId
  notes?: string
}

export interface LeadListRequest extends PaginationParams {
  status?: ApiLead['status']
  assignedTo?: UserId
  source?: string
  dateRange?: {
    from: string
    to: string
  }
}

export interface LeadListResponse {
  leads: ApiLead[]
  total: number
  page: number
  pageSize: number
}

// WhatsApp API types
export interface WhatsAppConfigRequest {
  businessName: string
  phoneNumber: PhoneNumber
  accessToken: string
  verifyToken: string
  webhookUrl: URL
  businessId: string
  appId: string
  appSecret: string
}

export interface ApiWhatsAppConfig {
  id: string
  userId: UserId
  businessName: string
  phoneNumber: PhoneNumber
  businessId: string
  appId: string
  status: 'pending' | 'verified' | 'active' | 'suspended'
  webhookUrl: URL
  createdAt: Timestamp
  updatedAt: Timestamp
  lastWebhookAt?: Timestamp
}

export interface WhatsAppMessageRequest {
  to: PhoneNumber
  type: 'text' | 'template' | 'image' | 'document'
  content: {
    text?: string
    templateName?: string
    templateParams?: string[]
    mediaId?: string
    filename?: string
  }
}

export interface ApiWhatsAppMessage {
  id: string
  configId: string
  from: PhoneNumber
  to: PhoneNumber
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location'
  content: Record<string, unknown>
  direction: 'inbound' | 'outbound'
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: Timestamp
  messageId?: string
  error?: string
}

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account'
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: 'whatsapp'
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          text?: { body: string }
          image?: { id: string; mime_type: string; caption?: string }
          type: string
        }>
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }>
      }
      field: 'messages'
    }>
  }>
}

// Business/Organization API types
export interface CreateBusinessRequest extends BusinessInfo {
  ownerId: UserId
}

export interface ApiBusiness extends BusinessInfo {
  id: string
  ownerId: UserId
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt: Timestamp
  updatedAt: Timestamp
  members?: BusinessMember[]
  subscription?: BusinessSubscription
}

export interface BusinessMember {
  userId: UserId
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Timestamp
  invitedBy?: UserId
}

export interface BusinessSubscription {
  id: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
}

export interface UpdateBusinessRequest {
  name?: string
  description?: string
  website?: URL
  address?: BusinessInfo['address']
  contactInfo?: ContactInfo
}

// Analytics API types
export interface AnalyticsRequest {
  dateRange: {
    from: string
    to: string
  }
  metrics: string[]
  groupBy?: 'day' | 'week' | 'month'
  filters?: Record<string, string>
}

export interface AnalyticsMetricExtended {
  name: string
  value: number
  change?: {
    value: number
    percentage: number
    period: string
  }
  unit?: string
  format?: 'number' | 'currency' | 'percentage'
}

export interface AnalyticsChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    color?: string
  }>
}

export interface AnalyticsResponse {
  metrics: AnalyticsMetricExtended[]
  charts: Record<string, AnalyticsChartData>
  period: {
    from: string
    to: string
  }
}

// File Upload API types
export interface FileUploadRequest {
  file: File
  type: 'avatar' | 'document' | 'image' | 'media'
  metadata?: Record<string, unknown>
}

export interface ApiFile {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: URL
  thumbnailUrl?: URL
  uploadedBy: UserId
  uploadedAt: Timestamp
  metadata?: Record<string, unknown>
}

export interface FileUploadResponse {
  file: ApiFile
  uploadUrl?: URL
}

// Notification API types
export interface ApiNotification {
  id: string
  userId: UserId
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: Timestamp
  readAt?: Timestamp
  expiresAt?: Timestamp
}

export interface NotificationListRequest extends PaginationParams {
  read?: boolean
  type?: ApiNotification['type']
}

export interface NotificationListResponse {
  notifications: ApiNotification[]
  total: number
  unreadCount: number
}

export interface MarkNotificationReadRequest {
  notificationIds: string[]
}

// Search API types
export interface SearchRequest {
  query: string
  type?: 'all' | 'users' | 'leads' | 'messages' | 'businesses'
  filters?: Record<string, unknown>
  limit?: number
}

export interface SearchResult<T = unknown> {
  id: string
  type: string
  title: string
  description?: string
  url?: string
  data: T
  score: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  took: number
}

// Webhook API types
export interface WebhookEvent<T = unknown> {
  id: string
  event: string
  data: T
  timestamp: Timestamp
  signature?: string
  source: string
}

export interface CreateWebhookRequest {
  url: URL
  events: string[]
  secret?: string
  active?: boolean
}

export interface ApiWebhook {
  id: string
  userId: UserId
  url: URL
  events: string[]
  secret: string
  active: boolean
  lastDeliveryAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  deliveryStats: {
    total: number
    successful: number
    failed: number
  }
}

// Subscription and Billing API types
export interface CreateSubscriptionRequest {
  planId: string
  paymentMethodId?: string
  trialDays?: number
}

export interface ApiSubscription {
  id: string
  userId: UserId
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  trialEnd?: Timestamp
  cancelAtPeriodEnd: boolean
  canceledAt?: Timestamp
  endedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ApiPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: Record<string, number>
  popular?: boolean
  active: boolean
}

export interface BillingPortalRequest {
  returnUrl?: URL
}

export interface BillingPortalResponse {
  url: URL
}

// Integration API types
export interface ApiIntegration {
  id: string
  userId: UserId
  type: 'google' | 'facebook' | 'zapier' | 'slack' | 'email'
  name: string
  status: 'active' | 'inactive' | 'error'
  config: Record<string, unknown>
  lastSyncAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateIntegrationRequest {
  type: ApiIntegration['type']
  name: string
  config: Record<string, unknown>
}

export interface UpdateIntegrationRequest {
  name?: string
  config?: Record<string, unknown>
  status?: ApiIntegration['status']
}