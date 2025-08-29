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
  type Address,
  type AnalyticsEvent,
  type AnalyticsMetric,
  type ApiResponse,
  type AppConfig,
  type AppError,
  type AsyncEventHandler,
  type AsyncFunction,
  type AsyncState,
  type AuthSession,
  type Breadcrumb,
  type BusinessInfo,
  type ColorPalette,
  type ComponentProps,
  type ContactInfo,
  type DeepPartial,
  type DeepRequired,
  type DeviceInfo,
  type Email,
  type EventCallback,
  type EventHandler,
  type FileUpload,
  type FormFieldState,
  type ID,
  type Language,
  type LoadingState,
  type Maybe,
  type ModalProps,
  type NavItem,
  type Notification,
  // Re-export all types except those that conflict with components
  type Nullable,
  type OmitStrict,
  type Optional,
  type PaginatedResponse,
  type PaginationMeta,
  type PaginationParams,
  type PhoneNumber,
  type PickOptional,
  type Priority,
  type SearchParams,
  type SearchResult,
  type Status,
  type TableActionConfig,
  type TableColumn,
  type Theme,
  type Timestamp,
  type UploadedFile,
  type URL,
  type User,
  type UserId,
  type UserPreferences,
  type ValidationResult,
  type VariantProps,
  type WebhookPayload,
  type WhatsAppContact,
  type WhatsAppMessage,
} from "./types"

// Export all utility types from utils.types
export * from "./types/api.types"
export * from "./types/utils.types"

// Configuration
export * from "./config"

// React Hooks
export * from "./hooks"