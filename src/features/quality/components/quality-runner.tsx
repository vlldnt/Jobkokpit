"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { runQualityScanAction } from "../actions";
import type { IssueSeverity, QualityReport } from "../types";

const SEV_VARIANT: Record<IssueSeverity, BadgeProps["variant"]> = {
  error: "destructive",
  warning: "warning",
  info: "info",
};

const SEV_LABEL: Record<IssueSeverity, string> = {
  error: "Erreur",
  warning: "Avertissement",
  info: "Info",
};

export function QualityRunner() {
  const [isPending, start] = useTransition();
  const [report, setReport] = useState<QualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    start(async () => {
      const res = await runQualityScanAction();
      if (res.ok) setReport(res.report);
      else setError(res.error);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={isPending}>
          <ShieldCheck />
          {isPending ? "Analyse en cours…" : "Lancer le contrôle"}
        </Button>
        {error && <span className="text-destructive text-sm">{error}</span>}
      </div>

      {report && (
        <>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="destructive">{report.counts.error} erreur(s)</Badge>
            <Badge variant="warning">{report.counts.warning} avert.</Badge>
            <Badge variant="info">{report.counts.info} info(s)</Badge>
            {report.expiredMarked > 0 && (
              <Badge variant="outline">
                {report.expiredMarked} offre(s) expirée(s) marquée(s)
              </Badge>
            )}
          </div>

          {report.issues.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center text-sm">
                Aucun problème détecté. Vos données sont propres.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Problèmes détectés</CardTitle>
                <CardDescription>
                  Contrôle du{" "}
                  {new Date(report.scannedAt).toLocaleString("fr-FR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                {report.issues.map((issue) => (
                  <div
                    key={`${issue.kind}:${issue.entityId}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{issue.label}</p>
                      <p className="text-muted-foreground text-sm">
                        {issue.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={SEV_VARIANT[issue.severity]}>
                        {SEV_LABEL[issue.severity]}
                      </Badge>
                      {issue.href && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={issue.href}>Corriger</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
