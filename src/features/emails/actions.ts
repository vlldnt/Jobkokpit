"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toActionError, toDeleteError } from "@/lib/action-result";
import type { ActionState, DeleteResult } from "@/lib/result";
import { parseMessageForm, parseThreadForm } from "./schemas";
import * as service from "./service";

export async function createThreadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseThreadForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let id: string;
  try {
    const thread = await service.createThread(parsed.data);
    id = thread.id;
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath("/emails");
  redirect(`/emails/${id}`);
}

export async function addMessageAction(
  threadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseMessageForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs en erreur.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.addMessage(threadId, parsed.data);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(`/emails/${threadId}`);
  return { status: "success", message: "Message ajouté." };
}

export async function deleteThreadAction(id: string): Promise<DeleteResult> {
  try {
    await service.deleteThread(id);
    revalidatePath("/emails");
    return { ok: true };
  } catch (error) {
    return toDeleteError(error);
  }
}
