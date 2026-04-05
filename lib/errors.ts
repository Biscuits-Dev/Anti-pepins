export class AppError extends Error {
  declare readonly name: string;

  constructor(message: string) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  declare readonly name: "ValidationError";

  constructor(
    public readonly field: string,
    message: string,
    public readonly code = "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  declare readonly name: "NotFoundError";

  constructor(resource: string, id?: string) {
    super(
      id
        ? `Resource "${resource}" with id "${id}" not found`
        : `Resource "${resource}" not found`
    );
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  declare readonly name: "UnauthorizedError";

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  declare readonly name: "ForbiddenError";

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ServerError extends AppError {
  declare readonly name: "ServerError";

  constructor(message = "Internal server error") {
    super(message);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class NetworkError extends AppError {
  declare readonly name: "NetworkError";

  constructor(message = "Network error", public readonly status?: number) {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return !error.status || error.status >= 500 || error.status === 408;
  }
  return error instanceof ServerError;
}

export function formatError(error: unknown): string {
  if (error instanceof ValidationError) return `Validation — ${error.field}: ${error.message}`;
  if (error instanceof NotFoundError)   return `Not found: ${error.message}`;
  if (error instanceof UnauthorizedError) return `Unauthorized: ${error.message}`;
  if (error instanceof ForbiddenError)  return `Forbidden: ${error.message}`;
  if (error instanceof ServerError)     return `Server error: ${error.message}`;
  if (error instanceof NetworkError)    return `Network error: ${error.message}`;
  if (error instanceof Error)           return `${error.name}: ${error.message}`;
  return "An unknown error occurred";
}

type ErrorContext = Record<string, unknown>;

export function logError(error: unknown, context?: ErrorContext): void {
  const entry: ErrorContext = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "UnknownError",
    ...(process.env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : {}),
    ...context,
  };

  console.error("[ERROR]", JSON.stringify(entry, null, 2));

  if (process.env.NODE_ENV === "production") {
    const sentry = (globalThis as Record<string, unknown>)["Sentry"] as
      | { captureException?: (e: unknown, ctx?: unknown) => void }
      | undefined;
    sentry?.captureException?.(error, { extra: entry });
  }
}

type AnyAsyncFn = (...args: never[]) => Promise<unknown>;

export function withErrorHandling<T extends AnyAsyncFn>(
  fn: T,
  onError?: (error: unknown) => void
): (...args: Parameters<T>) => Promise<unknown> {
  return async (...args: Parameters<T>) => {
    try {
      return await (fn as (...a: Parameters<T>) => Promise<unknown>)(...args);
    } catch (error) {
      logError(error);
      onError?.(error);
      throw error;
    }
  };
}

export function createValidationErrors(
  errors: Record<string, string>
): ValidationError[] {
  return Object.entries(errors).map(
    ([field, message]) => new ValidationError(field, message)
  );
}

export function getFirstValidationError(
  errors: ValidationError[]
): ValidationError | null {
  return errors[0] ?? null;
}

export function hasValidationErrors(errors: ValidationError[]): boolean {
  return errors.length > 0;
}

import type React from "react";

export interface ErrorBoundaryFallbackProps {
  readonly error: Error;
  readonly resetErrorBoundary: () => void;
  readonly componentStack?: string;
  readonly fallback?: React.ReactNode;
}