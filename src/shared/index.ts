/**
 * Shared utilities, components, and resources
 * 
 * This module exports all shared functionality organized using atomic design principles:
 * - Components: Atomic design hierarchy (atoms, molecules, organisms)
 * - Lib: Utility functions, constants, and validators
 * - Types: TypeScript type definitions
 * - Config: Application and API configuration
 * - Hooks: Reusable React hooks
 */

// Components (Atomic Design)
export * from "./components"

// Utilities and Libraries
export * from "./lib"

// Type Definitions - selective export to avoid conflicts
export {
  // Re-export all types except those that conflict with components
  type Nullable,
  type Optional,
  type Maybe,
  type Email,
  type PhoneNumber,
  type URL,
  type UserId,
  type Timestamp,
  type ID,
  type Status,
  type Priority,
  type Theme,
  type Language,
  type ApiResponse,
  type PaginationParams,
  type PaginationMeta,
  type PaginatedResponse,
  type FormFieldState,
  type ValidationResult,
  type FileUpload,
  type UploadedFile,
  type User,
  type UserPreferences,
  type AuthSession,
  type ComponentProps,
  type VariantProps,
  type EventHandler,
  type AsyncEventHandler,
  type LoadingState,
  type AsyncState,
  type SearchParams,
  type SearchResult,
  type NavItem,
  type Breadcrumb,
  type TableColumn,
  type TableActionConfig,
  type ModalProps,
  type Notification,
  type AnalyticsEvent,
  type AnalyticsMetric,
  type AppConfig,
  type AppError,
  type WebhookPayload,
  type Address,
  type ContactInfo,
  type BusinessInfo,
  type WhatsAppMessage,
  type WhatsAppContact,
  type DeviceInfo,
  type ColorPalette,
  type DeepPartial,
  type DeepRequired,
  type PickOptional,
  type OmitStrict,
  type AsyncFunction,
  type EventCallback,
} from "./types"

// Export all utility types from utils.types
export * from "./types/utils.types"
export * from "./types/api.types"

// Configuration
export * from "./config"

// React Hooks
export * from "./hooks"