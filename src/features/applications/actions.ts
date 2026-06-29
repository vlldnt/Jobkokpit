"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { parseApplicationForm } from "./schemas";
import * as service from "./service";

export async function createApplicationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseApplicationForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.createApplication(parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/applications");
  redirect("/applications");
}

export async function updateApplicationAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseApplicationForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateApplication(id, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}/edit`);
  redirect("/applications");
}

export async function deleteApplicationAction(
  id: string,
): Promise<DeleteResult> {
  try {
    await service.deleteApplication(id);
    revalidatePath("/applications");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}
