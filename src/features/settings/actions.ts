"use server";

import { revalidatePath } from "next/cache";

import { toActionError } from "@/lib/action-result";
import type { ActionState } from "@/lib/result";
import { updateProfile } from "./service";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length > 200) {
    return {
      status: "error",
      message: "Nom trop long.",
      fieldErrors: { name: ["Nom trop long (max 200)."] },
    };
  }

  try {
    await updateProfile(name);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/settings");
  return { status: "success", message: "Profil mis à jour." };
}
