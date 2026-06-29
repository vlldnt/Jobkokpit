import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { updateDocumentAction } from "@/features/documents/actions";
import { DocumentForm } from "@/features/documents/components/document-form";
import {
  getDocument,
  listDocumentApplicationOptions,
} from "@/features/documents/service";

export const metadata: Metadata = { title: "Modifier le document" };

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doc, apps] = await Promise.all([
    getDocument(id),
    listDocumentApplicationOptions(),
  ]);
  if (!doc) notFound();

  const options = apps.map((a) => ({
    id: a.id,
    label: `${a.offer?.title ?? "Candidature"}${a.company ? ` · ${a.company.name}` : ""}`,
  }));

  const action = updateDocumentAction.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier le document" description={doc.title} />
      <DocumentForm
        action={action}
        submitLabel="Enregistrer"
        applications={options}
        defaultValues={{
          title: doc.title,
          type: doc.type,
          applicationId: doc.applicationId ?? "",
          content: doc.content ?? "",
        }}
      />
    </>
  );
}
