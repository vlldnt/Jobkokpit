import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeneratePrep } from "@/features/interviews/components/generate-prep";
import {
  listInterviewPreps,
  listPrepApplicationOptions,
} from "@/features/interviews/service";

export const metadata: Metadata = { title: "Entretiens" };

export default async function InterviewsPage() {
  const [preps, applications] = await Promise.all([
    listInterviewPreps(),
    listPrepApplicationOptions(),
  ]);

  const options = applications.map((a) => ({
    id: a.id,
    label: `${a.offer?.title ?? "Candidature"}${a.company ? ` · ${a.company.name}` : ""}`,
  }));

  return (
    <>
      <PageHeader
        title="Préparation aux entretiens"
        description="Questions, quiz, cas pratiques et plan de révision générés par l'IA."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GeneratePrep applications={options} />
        </div>

        <div className="space-y-3 lg:col-span-2">
          {preps.length === 0 ? (
            <EmptyState
              title="Aucune préparation"
              description="Générez votre première préparation depuis une candidature."
            />
          ) : (
            preps.map((prep) => (
              <Card key={prep.id}>
                <CardHeader>
                  <Link href={`/interviews/${prep.id}`}>
                    <CardTitle className="hover:underline">
                      {prep.application?.offer?.title ?? "Préparation"}
                    </CardTitle>
                  </Link>
                  <CardDescription>
                    {prep.application?.company?.name
                      ? `${prep.application.company.name} · `
                      : ""}
                    {prep.model ?? "—"} ·{" "}
                    {prep.updatedAt.toLocaleDateString("fr-FR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/interviews/${prep.id}`}
                    className="text-sm hover:underline"
                  >
                    Voir la préparation →
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
