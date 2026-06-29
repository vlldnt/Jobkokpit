import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labelFor } from "@/lib/enums";
import { listDueFollowUps } from "@/features/applications/orchestration";
import { getStats } from "@/features/stats/service";

export const metadata: Metadata = { title: "Tableau de bord" };

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("fr-FR") : "—");

export default async function DashboardPage() {
  const [stats, followUps] = await Promise.all([
    getStats(),
    listDueFollowUps(),
  ]);

  const cards = [
    { label: "Offres suivies", value: stats.totals.offers, href: "/offers" },
    {
      label: "Candidatures",
      value: stats.totals.applications,
      href: "/applications",
    },
    {
      label: "Entreprises",
      value: stats.totals.companies,
      href: "/companies",
    },
    { label: "Relances à faire", value: followUps.length, href: "#followups" },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre recherche d'emploi."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:border-foreground/20 transition-colors">
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {card.value}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card id="followups">
        <CardHeader>
          <CardTitle className="text-base">Relances à faire</CardTitle>
          <CardDescription>
            Candidatures dont la prochaine action est due.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Rien à relancer pour l’instant.
            </p>
          ) : (
            <ul className="divide-y">
              {followUps.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <Link
                    href={`/applications/${f.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {f.offer?.title ?? f.company?.name ?? "Candidature"}
                  </Link>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {labelFor("applicationStatus", f.status)}
                    </Badge>
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {fmt(f.nextActionAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
