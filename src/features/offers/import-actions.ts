"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError } from "@/lib/action-result";
import type { ActionState } from "@/lib/result";
import {
  importOfferFromText,
  importOfferFromUrl,
  syncOffersForCurrentUser,
} from "./sync-service";

export async function syncOffersAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const queries = String(formData.get("keywords") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  // Unchecked checkboxes are absent from FormData.
  const remoteEverywhere = formData.get("remoteEverywhere") != null;
  // Bouton "Rechercher en Europe" : recherche à part, jamais par défaut.
  const scope = formData.get("scope") === "europe" ? "europe" : "france";

  try {
    const res = await syncOffersForCurrentUser({
      queries,
      remoteEverywhere,
      scope,
      limit: 20,
    });
    revalidatePath("/offers");
    const sources = res.providers.length
      ? res.providers.join(", ")
      : "aucune source configurée";
    const keywordCount = res.queries.length
      ? ` sur ${res.queries.length} mot(s)-clé(s)`
      : "";
    const errors = res.errors.length
      ? ` · Erreurs : ${[...new Set(res.errors)].join("; ")}`
      : "";
    return {
      status: "success",
      message: `${res.created} offre(s) ajoutée(s), ${res.skipped} ignorée(s)${keywordCount}. Sources : ${sources}.${errors}`,
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function importOfferUrlAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) {
    return {
      status: "error",
      message: "URL requise.",
      fieldErrors: { url: ["URL requise."] },
    };
  }

  let id: string;
  try {
    id = await importOfferFromUrl(url);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/offers");
  redirect(`/offers/${id}`);
}

export async function importOfferTextAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const text = String(formData.get("text") ?? "").trim();
  if (!text) {
    return {
      status: "error",
      message: "Texte requis.",
      fieldErrors: { text: ["Texte requis."] },
    };
  }

  let id: string;
  try {
    id = await importOfferFromText(text);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/offers");
  redirect(`/offers/${id}`);
}
