"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError } from "@/lib/action-result";
import type { ActionState } from "@/lib/result";
import { generateInterviewPrep } from "./service";

export async function generatePrepAction(
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
    id = await generateInterviewPrep(applicationId);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/interviews");
  redirect(`/interviews/${id}`);
}
