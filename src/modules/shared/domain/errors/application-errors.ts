/**
 * Application Error Types
 * Shared domain layer - Common application errors
 */

/**
 * Base application error class
 */
export abstract class ApplicationError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'validation' | 'business' | 'technical' | 'external';

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Validation errors - User input validation failures
 */
export class ValidationError extends ApplicationError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = 'validation' as const;

  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Business rule violations
 */
export class BusinessRuleError extends ApplicationError {
  readonly code = 'BUSINESS_RULE_ERROR';
  readonly category = 'business' as const;

  constructor(
    message: string,
    public readonly rule: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends ApplicationError {
  readonly code = 'NOT_FOUND_ERROR';
  readonly category = 'business' as const;

  constructor(
    resource: string,
    identifier: string,
    context?: Record<string, unknown>
  ) {
    super(`${resource} with identifier '${identifier}' not found`, context);
  }
}

/**
 * Conflict errors - Resource already exists
 */
export class ConflictError extends ApplicationError {
  readonly code = 'CONFLICT_ERROR';
  readonly category = 'business' as const;

  constructor(
    message: string,
    public readonly conflictingField?: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Authorization errors
 */
export class UnauthorizedError extends ApplicationError {
  readonly code = 'UNAUTHORIZED_ERROR';
  readonly category = 'business' as const;

  constructor(
    message: string = 'Unauthorized access',
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Permission errors
 */
export class ForbiddenError extends ApplicationError {
  readonly code = 'FORBIDDEN_ERROR';
  readonly category = 'business' as const;

  constructor(
    message: string = 'Access forbidden',
    public readonly requiredPermission?: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends ApplicationError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly category = 'external' as const;

  constructor(
    message: string,
    public readonly service: string,
    public readonly statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Technical/Infrastructure errors
 */
export class TechnicalError extends ApplicationError {
  readonly code = 'TECHNICAL_ERROR';
  readonly category = 'technical' as const;

  constructor(
    message: string,
    public readonly originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends ApplicationError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly category = 'technical' as const;

  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends ApplicationError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly category = 'technical' as const;

  constructor(
    message: string,
    public readonly configKey: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

/**
 * Type guard to check if error is an ApplicationError
 */
export function isApplicationError(error: unknown): error is ApplicationError {
  return error instanceof ApplicationError;
}

/**
 * Get error code from any error
 */
export function getErrorCode(error: unknown): string {
  if (isApplicationError(error)) {
    return error.code;
  }

  if (error instanceof Error) {
    return 'UNKNOWN_ERROR';
  }

  return 'UNEXPECTED_ERROR';
}

/**
 * Get error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Create error response object
 */
export function createErrorResponse(error: unknown): {
  code: string;
  message: string;
  category: string;
  context?: Record<string, unknown>;
} {
  if (isApplicationError(error)) {
    return {
      code: error.code,
      message: error.message,
      category: error.category,
      context: error.context,
    };
  }

  return {
    code: getErrorCode(error),
    message: getErrorMessage(error),
    category: 'technical',
  };
}