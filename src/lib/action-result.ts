import "server-only";

import { isAppError } from "@/core/errors/app-error";
import type { ActionState, DeleteResult } from "@/lib/result";

/** Map a thrown error to a form ActionState (safe message for the user). */
export function toActionError(error: unknown): ActionState {
  if (isAppError(error)) return { status: "error", message: error.message };
  return { status: "error", message: "Une erreur inattendue est survenue." };
}

/** Map a thrown error to a DeleteResult for list-view delete actions. */
export function toDeleteError(error: unknown): DeleteResult {
  return {
    ok: false,
    error: isAppError(error) ? error.message : "Suppression impossible.",
  };
}
