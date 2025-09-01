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
  FactoryFunction,
  ModuleConfig,
  SingletonEntry,
  UseCaseFactory
} from './application/interfaces/dependency-container';
export {
  createDependencyContainer,
  createSimpleDependencyContainer,
  createUseCaseFactory,
  DEPENDENCY_TOKENS,
  Injectable,
  isLegacyContainer,
  migrateLegacyContainer,
  SimpleDependencyContainer} from './application/interfaces/dependency-container';

// Pure Container Operations - Functional dependency injection
export type { ContainerState } from './utils/container-operations';
export {
  clear,
  clearSpecific,
  createInitialContainerState,
  getAllTokens,
  getContainerStats,
  has,
  isValidToken,
  register,
  registerFactory,
  registerSingleton,
  resolve,
  validateContainerState} from './utils/container-operations';

// Functional Container Implementations
export {
  combineContainerStates,
  ContainerBuilder,
  containerBuilder,
  createFunctionalContainer,
  createImmutableContainer,
  createScopedContainer} from './utils/functional-container';

// Error Boundary and Error Handling
export {
  createErrorFingerprint,
  createErrorReport,
  determineErrorSeverity,
  generateErrorId,
  sanitizeErrorReport,
  shouldReportError,
  validateErrorReport} from './domain/services/error-reporting.service';
export type {
  EnhancedError,
  ErrorBoundaryConfig,
  ErrorInfo,
  ErrorReport,
  ErrorReportingConfig,
  ErrorSeverity} from './domain/types/error.types';
export {
  defaultErrorReporter,
  ErrorReporter,
  reportError
} from './infra/services/error-reporter';
export type { ErrorBoundaryProps } from './ui/components/error-boundary';
export { default as ErrorBoundary, withErrorBoundary } from './ui/components/error-boundary';
export {
  ErrorFallback,
  LoadingErrorFallback,
  MinimalErrorFallback} from './ui/components/error-fallback';