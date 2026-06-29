"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { parseCompanyForm } from "./schemas";
import * as service from "./service";

export async function createCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseCompanyForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.createCompany(parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompanyAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseCompanyForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateCompany(id, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}/edit`);
  redirect("/companies");
}

export async function deleteCompanyAction(id: string): Promise<DeleteResult> {
  try {
    await service.deleteCompany(id);
    revalidatePath("/companies");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}
