/**
 * Lightweight Result type for operations whose failure is an expected outcome
 * (e.g. form submissions). Throw `AppError` for exceptional/unexpected cases;
 * return `Result` when the caller is meant to branch on success/failure.
 */
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Shape returned by Server Actions consumed via `useActionState`.
 * `fieldErrors` mirrors Zod's flattened field errors.
 */
export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  | { status: "success"; message?: string };

export const idleAction: ActionState = { status: "idle" };

/** Result returned by delete Server Actions consumed in list views. */
export type DeleteResult = { ok: boolean; error?: string };
