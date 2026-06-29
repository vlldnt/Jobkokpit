import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PrepView } from "@/features/interviews/components/prep-view";
import { getInterviewPrep } from "@/features/interviews/service";

export const metadata: Metadata = { title: "Préparation entretien" };

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prep = await getInterviewPrep(id);
  if (!prep) notFound();

  const title = prep.application?.offer?.title ?? "Préparation";
  const company = prep.application?.company?.name;

  return (
    <>
      <PageHeader
        title={title}
        description={company ?? undefined}
        action={
          <Button asChild variant="ghost">
            <Link href="/interviews">
              <ArrowLeft />
              Retour
            </Link>
          </Button>
        }
      />
      <PrepView prep={prep} />
    </>
  );
}
