"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cleanOffersAction } from "../actions";

/**
 * "Nettoyer la liste" — supprime toutes les offres sauf les favoris ❤.
 * Demande confirmation (action destructive) puis rafraîchit via revalidatePath.
 */
export function CleanOffersButton() {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            "Supprimer toutes les offres sauf tes favoris ❤ ? Cette action est irréversible.",
          )
        )
          return;
        start(async () => {
          const res = await cleanOffersAction();
          if (res.ok) {
            alert(`${res.deleted} offre(s) supprimée(s). Favoris conservés.`);
          } else {
            alert(res.error);
          }
        });
      }}
    >
      <Sparkles />
      {pending ? "Nettoyage…" : "Nettoyer"}
    </Button>
  );
}
