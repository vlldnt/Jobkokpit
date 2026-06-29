"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { parseRecruiterForm } from "./schemas";
import * as service from "./service";

export async function createRecruiterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseRecruiterForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.createRecruiter(parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/recruiters");
  redirect("/recruiters");
}

export async function updateRecruiterAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseRecruiterForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateRecruiter(id, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/recruiters");
  revalidatePath(`/recruiters/${id}/edit`);
  redirect("/recruiters");
}

export async function deleteRecruiterAction(id: string): Promise<DeleteResult> {
  try {
    await service.deleteRecruiter(id);
    revalidatePath("/recruiters");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}
