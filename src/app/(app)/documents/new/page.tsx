import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { createDocumentAction } from "@/features/documents/actions";
import { DocumentForm } from "@/features/documents/components/document-form";
import { listDocumentApplicationOptions } from "@/features/documents/service";

export const metadata: Metadata = { title: "Nouveau document" };

export default async function NewDocumentPage() {
  const apps = await listDocumentApplicationOptions();
  const options = apps.map((a) => ({
    id: a.id,
    label: `${a.offer?.title ?? "Candidature"}${a.company ? ` · ${a.company.name}` : ""}`,
  }));

  return (
    <>
      <PageHeader title="Nouveau document" />
      <DocumentForm
        action={createDocumentAction}
        submitLabel="Créer"
        applications={options}
      />
    </>
  );
}
