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
import { CompaniesTable } from "@/features/companies/components/companies-table";
import { listCompanies } from "@/features/companies/service";

export const metadata: Metadata = { title: "Entreprises" };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const { items, total } = await listCompanies({ skip, take, search });

  return (
    <>
      <PageHeader
        title="Entreprises"
        description="Les entreprises que vous ciblez."
        action={
          <Button asChild>
            <Link href="/companies/new">
              <Plus />
              Nouvelle entreprise
            </Link>
          </Button>
        }
      />

      <SearchForm
        basePath="/companies"
        placeholder="Rechercher une entreprise…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucune entreprise"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Ajoutez votre première entreprise pour commencer."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/companies/new">Nouvelle entreprise</Link>
              </Button>
            )
          }
        />
      ) : (
        <CompaniesTable companies={items} />
      )}

      <PaginationNav
        basePath="/companies"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
