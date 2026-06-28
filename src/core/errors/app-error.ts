/**
 * Domain error hierarchy. These are framework-agnostic and safe to throw from
 * any layer. The presentation layer maps them to HTTP status codes / UI states.
 * `message` is safe to surface to the (single, trusted) user; never embed
 * secrets.
 */
export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "EXTERNAL_SERVICE"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    statusCode: number,
    details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Données invalides.", details?: unknown) {
    super("VALIDATION", message, 422, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentification requise.") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé.") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable.") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit avec l'état actuel.", details?: unknown) {
    super("CONFLICT", message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Trop de requêtes. Réessayez plus tard.") {
    super("RATE_LIMITED", message, 429);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "Service externe indisponible.", details?: unknown) {
    super("EXTERNAL_SERVICE", message, 502, details);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
