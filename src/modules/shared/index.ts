/**
 * Shared Module Barrel Export
 * Clean Architecture - Shared cross-cutting concerns
 */

// Domain Layer - Value objects and errors
export type {
  Result,
  Success,
  Failure
} from './domain/value-objects/result';

export {
  success,
  failure,
  isSuccess,
  isFailure,
  mapResult,
  flatMapResult,
  mapError,
  unwrap,
  unwrapOr,
  mapResultAsync,
  flatMapResultAsync,
  combineResults
} from './domain/value-objects/result';

export {
  ApplicationError,
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ExternalServiceError,
  TechnicalError,
  RateLimitError,
  ConfigurationError,
  isApplicationError,
  getErrorCode,
  getErrorMessage,
  createErrorResponse
} from './domain/errors/application-errors';

// Application Layer - Dependency injection
export type {
  DependencyContainer,
  DependencyToken,
  ModuleConfig,
  UseCaseFactory
} from './application/interfaces/dependency-container';

export {
  DEPENDENCY_TOKENS,
  SimpleDependencyContainer,
  Injectable,
  createUseCaseFactory
} from './application/interfaces/dependency-container';