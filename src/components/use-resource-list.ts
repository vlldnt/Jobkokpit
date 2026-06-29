"use client";

import { useOptimistic, useTransition } from "react";

import type { DeleteResult } from "@/lib/result";

/**
 * Client helper for list views: optimistically removes a row while the delete
 * Server Action runs. After the action's `revalidatePath`, the server sends a
 * fresh list and the optimistic state resyncs automatically.
 */
export function useResourceList<T extends { id: string }>(
  initial: T[],
  deleteAction: (id: string) => Promise<DeleteResult | void>,
) {
  const [isPending, startTransition] = useTransition();
  const [rows, applyOptimistic] = useOptimistic(
    initial,
    (state: T[], removedId: string) => state.filter((r) => r.id !== removedId),
  );

  function remove(id: string) {
    startTransition(async () => {
      applyOptimistic(id);
      await deleteAction(id);
    });
  }

  return { rows, remove, isPending };
}
