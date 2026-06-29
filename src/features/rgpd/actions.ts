"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError } from "@/lib/action-result";
import type { ActionState } from "@/lib/result";
import { eraseUserData } from "./service";

export async function eraseDataAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== "SUPPRIMER") {
    return {
      status: "error",
      message: "Tapez SUPPRIMER pour confirmer.",
      fieldErrors: { confirm: ["Confirmation requise."] },
    };
  }

  try {
    await eraseUserData();
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
