import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelFor } from "@/lib/enums";
import { getStats } from "@/features/stats/service";

export const metadata: Metadata = { title: "Statistiques" };

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Breakdown({
  title,
  group,
  rows,
}: {
  title: string;
  group: "offerStatus" | "applicationStatus";
  rows: { status: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune donnée.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {labelFor(group, r.status)}
                </span>
                <span className="font-medium tabular-nums">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <>
      <PageHeader
        title="Statistiques"
        description="Indicateurs de votre recherche et consommation IA."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Offres" value={stats.totals.offers} />
        <StatCard label="Candidatures" value={stats.totals.applications} />
        <StatCard label="Entreprises" value={stats.totals.companies} />
        <StatCard label="Analyses IA" value={stats.totals.analyzed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Breakdown
          title="Offres par statut"
          group="offerStatus"
          rows={stats.offersByStatus}
        />
        <Breakdown
          title="Candidatures par statut"
          group="applicationStatus"
          rows={stats.applicationsByStatus}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consommation IA</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Exécutions</span>
                <span className="font-medium tabular-nums">
                  {stats.ai.runs}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-medium tabular-nums">
                  {stats.ai.tokens.toLocaleString("fr-FR")}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Coût estimé</span>
                <span className="font-medium tabular-nums">
                  {stats.ai.costUsd.toFixed(4)} $
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
