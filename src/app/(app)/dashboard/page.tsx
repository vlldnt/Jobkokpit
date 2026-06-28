import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [offers, applications, companies, followUps] = await Promise.all([
    db.jobOffer.count({ where: { userId: user.id, deletedAt: null } }),
    db.application.count({ where: { userId: user.id, deletedAt: null } }),
    db.company.count({ where: { userId: user.id, deletedAt: null } }),
    db.application.count({
      where: {
        userId: user.id,
        deletedAt: null,
        nextActionAt: { lte: new Date() },
      },
    }),
  ]);

  const stats = [
    { label: "Offres suivies", value: offers },
    { label: "Candidatures", value: applications },
    { label: "Entreprises", value: companies },
    { label: "Relances à faire", value: followUps },
  ];

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre recherche d'emploi."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}
