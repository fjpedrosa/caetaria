/**
 * Global type definitions for the application
 */

// Utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Common branded types for better type safety
export type Email = string & { readonly __brand: unique symbol }
export type PhoneNumber = string & { readonly __brand: unique symbol }
export type URL = string & { readonly __brand: unique symbol }
export type UserId = string & { readonly __brand: unique symbol }
export type Timestamp = number & { readonly __brand: unique symbol }

// Common object patterns
export type ID<T extends string = string> = T
export type Status = 'active' | 'inactive' | 'pending' | 'archived'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'es' | 'fr' | 'pt' | 'de'

// Generic API response structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
    timestamp?: string
  }
}

// Pagination types
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Form and validation types
export interface FormFieldState {
  value: string
  error?: string
  touched?: boolean
  dirty?: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// File and upload types
export interface FileUpload {
  file: File
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

// User and authentication types
export interface User {
  id: UserId
  email: Email
  firstName: string
  lastName: string
  avatar?: URL
  role: 'admin' | 'user' | 'guest'
  status: Status
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: Theme
  language: Language
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  timezone: string
  dateFormat: string
}

export interface AuthSession {
  user: User
  token: string
  refreshToken: string
  expiresAt: Timestamp
}

// Component prop patterns
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

export interface VariantProps<T extends Record<string, any>> {
  variant?: keyof T
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl'
}

// Event handling types
export interface EventHandler<T = unknown> {
  (event: T): void
}

export interface AsyncEventHandler<T = unknown> {
  (event: T): Promise<void>
}

// Loading and async states
export interface LoadingState {
  isLoading: boolean
  error?: string
  lastLoadedAt?: Timestamp
}

export interface AsyncState<T> extends LoadingState {
  data?: T
}

// Search and filtering types
export interface SearchParams {
  query?: string
  filters?: Record<string, unknown>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
}

export interface SearchResult<T> {
  items: T[]
  total: number
  query: string
  filters: Record<string, unknown>
}

// Navigation and routing types
export interface NavItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  active?: boolean
  children?: NavItem[]
}

export interface Breadcrumb {
  label: string
  href?: string
}

// Table and data display types
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableActionConfig<T = any> {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (record: T) => void
  disabled?: (record: T) => boolean
  variant?: 'default' | 'destructive'
}

// Modal and dialog types
export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

// Analytics and tracking types
export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  userId?: UserId
  timestamp?: Timestamp
}

export interface AnalyticsMetric {
  name: string
  value: number
  unit?: string
  change?: {
    value: number
    period: string
  }
}

// Configuration and environment types
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  features: Record<string, boolean>
  analytics?: {
    googleAnalyticsId?: string
    mixpanelToken?: string
    hotjarId?: string
    enableTracking?: boolean
  }
  social?: {
    twitter?: string
    facebook?: string
    linkedin?: string
    instagram?: string
    github?: string
    youtube?: string
    discord?: string
  }
}

// Error types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, unknown>
}

// Webhook and external API types
export interface WebhookPayload<T = unknown> {
  id: string
  event: string
  data: T
  timestamp: Timestamp
  signature?: string
}

// Business domain types
export interface Address {
  street?: string
  city?: string
  state?: string
  country: string
  zipCode?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ContactInfo {
  email?: Email
  phone?: PhoneNumber
  website?: URL
  address?: Address
}

export interface BusinessInfo extends ContactInfo {
  name: string
  description?: string
  industry?: string
  size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
  logo?: URL
}

// WhatsApp specific types
export interface WhatsAppMessage {
  id: string
  from: PhoneNumber
  to: PhoneNumber
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location'
  content: unknown
  timestamp: Timestamp
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface WhatsAppContact {
  phoneNumber: PhoneNumber
  name?: string
  profilePicture?: URL
  lastSeen?: Timestamp
}

// Device and browser detection
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile'
  os: string
  browser: string
  userAgent: string
}

// Color and theme types
export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  success: string
  warning: string
  error: string
}

// Utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type PickOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// Function type helpers
export type AsyncFunction<TArgs extends any[] = [], TReturn = void> = (
  ...args: TArgs
) => Promise<TReturn>

export type EventCallback<TData = unknown> = (data: TData) => void

// React specific augmentations
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

// Environment variables (augment process.env)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      NEXT_PUBLIC_APP_URL: string
      NEXT_PUBLIC_API_URL: string
      WHATSAPP_ACCESS_TOKEN?: string
      WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string
      DATABASE_URL?: string
    }
  }
}

// Window object augmentations for client-side APIs
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    // Add other global client-side APIs here
  }
}