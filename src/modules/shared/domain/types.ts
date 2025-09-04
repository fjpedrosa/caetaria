/**
 * Shared Domain Types - Pure domain concepts without framework dependencies
 * Domain layer - Framework-agnostic business logic types
 */

// =============================================================================
// CORE BUSINESS DOMAIN TYPES
// =============================================================================

// Form domain concepts (business logic, not UI)
export interface FormErrorState {
  hasError: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface FormLoadingState {
  isSubmitting: boolean;
  isValidating: boolean;
  submitStatus: 'idle' | 'loading' | 'success' | 'error';
}

// =============================================================================
// PERFORMANCE AND MONITORING TYPES (Domain concepts)
// =============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  networkLatency?: number;
  errorCount: number;
}

// =============================================================================
// COMMON VALUE OBJECTS AND DOMAIN PRIMITIVES
// =============================================================================

export type EntityId = string & { readonly __brand: unique symbol };

export interface DomainEvent {
  id: string;
  aggregateId: EntityId;
  eventType: string;
  timestamp: Date;
  version: number;
  data: Record<string, unknown>;
}

export interface AggregateRoot {
  readonly id: EntityId;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// =============================================================================
// COMMON BUSINESS RULES AND VALIDATION
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface BusinessRule<T> {
  validate(entity: T): ValidationResult;
  message: string;
}

// =============================================================================
// ERROR HANDLING (Domain layer)
// =============================================================================

export interface DomainError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
}

export interface ValidationError extends DomainError {
  readonly fieldErrors: Record<string, string[]>;
}

// =============================================================================
// COMMON QUERY AND FILTER TYPES
// =============================================================================

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions[];
  filters?: FilterOptions[];
}