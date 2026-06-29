import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import {
  parsePagination,
  parseSearch,
  totalPages,
  type SearchParams,
} from "@/lib/pagination";
import { CoverLetterPanel } from "@/features/documents/components/cover-letter-panel";
import { DocumentsTable } from "@/features/documents/components/documents-table";
import {
  listDocumentApplicationOptions,
  listDocuments,
} from "@/features/documents/service";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const [{ items, total }, apps] = await Promise.all([
    listDocuments({ skip, take, search }),
    listDocumentApplicationOptions(),
  ]);

  const options = apps.map((a) => ({
    id: a.id,
    label: `${a.offer?.title ?? "Candidature"}${a.company ? ` · ${a.company.name}` : ""}`,
  }));

  return (
    <>
      <PageHeader
        title="Documents"
        description="CV, lettres de motivation et pièces."
        action={
          <Button asChild>
            <Link href="/documents/new">
              <Plus />
              Nouveau document
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <CoverLetterPanel applications={options} />
      </div>

      <SearchForm
        basePath="/documents"
        placeholder="Rechercher un document…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucun document"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Ajoutez un CV ou générez une lettre de motivation."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/documents/new">Nouveau document</Link>
              </Button>
            )
          }
        />
      ) : (
        <DocumentsTable documents={items} />
      )}

      <PaginationNav
        basePath="/documents"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
