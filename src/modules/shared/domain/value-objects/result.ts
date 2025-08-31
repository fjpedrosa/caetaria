/**
 * Result Value Object
 * Shared domain layer - Functional error handling pattern
 */

/**
 * Success result type
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
  readonly error?: never;
}

/**
 * Failure result type
 */
export interface Failure<E> {
  readonly success: false;
  readonly data?: never;
  readonly error: E;
}

/**
 * Result union type for functional error handling
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Creates a successful result
 */
export function success<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a failure result
 */
export function failure<E>(error: E): Failure<E> {
  return {
    success: false,
    error,
  };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

/**
 * Map function for transforming successful results
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isSuccess(result)) {
    return success(fn(result.data));
  }
  return result;
}

/**
 * FlatMap function for chaining operations that return Results
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isSuccess(result)) {
    return fn(result.data);
  }
  return result;
}

/**
 * Map error function for transforming error types
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (isFailure(result)) {
    return failure(fn(result.error));
  }
  return result as Success<T>;
}

/**
 * Get value or throw error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}

/**
 * Get value or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Async version of map
 */
export async function mapResultAsync<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Promise<U>
): Promise<Result<U, E>> {
  if (isSuccess(result)) {
    try {
      const transformedData = await fn(result.data);
      return success(transformedData);
    } catch (error) {
      return failure(error as E);
    }
  }
  return result;
}

/**
 * Async version of flatMap
 */
export async function flatMapResultAsync<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (isSuccess(result)) {
    return await fn(result.data);
  }
  return result;
}

/**
 * Combine multiple results into a single result with an array
 */
export function combineResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];

  for (const result of results) {
    if (isFailure(result)) {
      return result;
    }
    values.push(result.data);
  }

  return success(values);
}