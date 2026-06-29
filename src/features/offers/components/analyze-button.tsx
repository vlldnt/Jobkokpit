"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { analyzeOfferAction } from "../actions";

export function AnalyzeButton({
  offerId,
  hasAnalysis,
}: {
  offerId: string;
  hasAnalysis: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    startTransition(async () => {
      const res = await analyzeOfferAction(offerId);
      if (!res.ok) setError(res.error ?? "Analyse impossible.");
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={run} disabled={isPending} variant="outline">
        <Sparkles />
        {isPending
          ? "Analyse en cours…"
          : hasAnalysis
            ? "Relancer l'analyse"
            : "Analyser avec l'IA"}
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
