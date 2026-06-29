import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ThreadForm } from "@/features/emails/components/thread-form";
import { listEmailApplicationOptions } from "@/features/emails/service";

export const metadata: Metadata = { title: "Nouvelle conversation" };

export default async function NewThreadPage() {
  const apps = await listEmailApplicationOptions();
  const options = apps.map((a) => ({
    id: a.id,
    label: `${a.offer?.title ?? "Candidature"}${a.company ? ` · ${a.company.name}` : ""}`,
  }));

  return (
    <>
      <PageHeader title="Nouvelle conversation" />
      <ThreadForm applications={options} />
    </>
  );
}
