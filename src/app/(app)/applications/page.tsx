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
import { ApplicationsTable } from "@/features/applications/components/applications-table";
import { listApplications } from "@/features/applications/service";

export const metadata: Metadata = { title: "Candidatures" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const { items, total } = await listApplications({ skip, take, search });

  return (
    <>
      <PageHeader
        title="Candidatures"
        description="Le pipeline de vos candidatures."
        action={
          <Button asChild>
            <Link href="/applications/new">
              <Plus />
              Nouvelle candidature
            </Link>
          </Button>
        }
      />

      <SearchForm
        basePath="/applications"
        placeholder="Rechercher (poste, entreprise)…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucune candidature"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Créez votre première candidature pour suivre son avancement."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/applications/new">Nouvelle candidature</Link>
              </Button>
            )
          }
        />
      ) : (
        <ApplicationsTable applications={items} />
      )}

      <PaginationNav
        basePath="/applications"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
