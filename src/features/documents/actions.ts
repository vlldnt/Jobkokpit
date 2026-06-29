"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { parseDocumentForm } from "./schemas";
import * as service from "./service";

export async function createDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDocumentForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.createDocument(parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/documents");
  redirect("/documents");
}

export async function updateDocumentAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDocumentForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateDocument(id, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}/edit`);
  redirect("/documents");
}

export async function deleteDocumentAction(id: string): Promise<DeleteResult> {
  try {
    await service.deleteDocument(id);
    revalidatePath("/documents");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}

export async function generateCoverLetterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  if (!applicationId) {
    return {
      status: "error",
      message: "Sélectionnez une candidature.",
      fieldErrors: { applicationId: ["Sélectionnez une candidature."] },
    };
  }

  let id: string;
  try {
    id = await service.generateCoverLetterDocument(applicationId);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/documents");
  redirect(`/documents/${id}/edit`);
}
