/**
 * Shared Module Barrel Export
 * Clean Architecture - Shared cross-cutting concerns
 */

// Domain Layer - Value objects and errors
export {
  ApplicationError,
  BusinessRuleError,
  ConfigurationError,
  ConflictError,
  createErrorResponse,
  ExternalServiceError,
  ForbiddenError,
  getErrorCode,
  getErrorMessage,
  isApplicationError,
  NotFoundError,
  RateLimitError,
  TechnicalError,
  UnauthorizedError,
  ValidationError} from './domain/errors/application-errors';
export type {
  Failure,
  Result,
  Success} from './domain/value-objects/result';
export {
  combineResults,
  failure,
  flatMapResult,
  flatMapResultAsync,
  isFailure,
  isSuccess,
  mapError,
  mapResult,
  mapResultAsync,
  success,
  unwrap,
  unwrapOr} from './domain/value-objects/result';

// Application Layer - Dependency injection
export type {
  DependencyContainer,
  DependencyToken,
  ModuleConfig,
  UseCaseFactory
} from './application/interfaces/dependency-container';
export {
  createUseCaseFactory,
  DEPENDENCY_TOKENS,
  Injectable,
  SimpleDependencyContainer} from './application/interfaces/dependency-container';