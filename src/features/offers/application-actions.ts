"use server";

import { revalidatePath } from "next/cache";

import { isAppError } from "@/core/errors/app-error";
import type { DeleteResult } from "@/lib/result";
import * as svc from "./application-service";

const message = (error: unknown) =>
  isAppError(error) ? error.message : "Une erreur inattendue est survenue.";

export async function toggleInterestedAction(
  id: string,
  interested: boolean,
): Promise<DeleteResult> {
  try {
    await svc.setInterested(id, interested);
    revalidatePath(`/offers/${id}`);
    revalidatePath("/offers");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function dismissOfferAction(
  id: string,
  dismissed: boolean,
): Promise<DeleteResult> {
  try {
    await svc.setDismissed(id, dismissed);
    revalidatePath(`/offers/${id}`);
    revalidatePath("/offers");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function saveContactAction(
  id: string,
  data: { contactEmail: string; contactPhone: string },
): Promise<DeleteResult> {
  try {
    await svc.saveContact(id, data);
    revalidatePath(`/offers/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export async function saveApplicationDocsAction(
  id: string,
  data: { coverLetter: string; outreachEmail: string },
): Promise<DeleteResult> {
  try {
    await svc.saveApplicationDocs(id, data);
    revalidatePath(`/offers/${id}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}

export type GenerateDocsResult =
  | { ok: true; coverLetter: string; outreachEmail: string }
  | { ok: false; error: string };

export async function generateApplicationDocsAction(
  id: string,
): Promise<GenerateDocsResult> {
  try {
    const docs = await svc.generateApplicationDocs(id);
    revalidatePath(`/offers/${id}`);
    return { ok: true, ...docs };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
}
