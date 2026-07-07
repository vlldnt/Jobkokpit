"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { analyzeOfferById } from "./analysis-service";
import { parseOfferForm } from "./schemas";
import * as service from "./service";

export async function createOfferAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseOfferForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.createOffer(parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/offers");
  redirect("/offers");
}

export async function updateOfferAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseOfferForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateOffer(id, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/offers");
  revalidatePath(`/offers/${id}/edit`);
  redirect("/offers");
}

export async function deleteOfferAction(id: string): Promise<DeleteResult> {
  try {
    await service.deleteOffer(id);
    revalidatePath("/offers");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}

export type CleanResult =
  | { ok: true; deleted: number }
  | { ok: false; error: string };

export async function cleanOffersAction(): Promise<CleanResult> {
  try {
    const deleted = await service.cleanNonFavorites();
    revalidatePath("/offers");
    return { ok: true, deleted };
  } catch (error) {
    const r = toDeleteError(error);
    return { ok: false, error: r.error ?? "Nettoyage impossible." };
  }
}

export async function analyzeOfferAction(id: string): Promise<DeleteResult> {
  try {
    await analyzeOfferById(id);
    revalidatePath(`/offers/${id}`);
    revalidatePath("/offers");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}
