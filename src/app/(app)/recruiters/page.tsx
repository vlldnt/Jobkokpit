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
import { RecruitersTable } from "@/features/recruiters/components/recruiters-table";
import { listRecruiters } from "@/features/recruiters/service";

export const metadata: Metadata = { title: "Recruteurs" };

export default async function RecruitersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const { items, total } = await listRecruiters({ skip, take, search });

  return (
    <>
      <PageHeader
        title="Recruteurs"
        description="Vos contacts recruteurs."
        action={
          <Button asChild>
            <Link href="/recruiters/new">
              <Plus />
              Nouveau recruteur
            </Link>
          </Button>
        }
      />

      <SearchForm
        basePath="/recruiters"
        placeholder="Rechercher un recruteur…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucun recruteur"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Ajoutez vos contacts recruteurs."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/recruiters/new">Nouveau recruteur</Link>
              </Button>
            )
          }
        />
      ) : (
        <RecruitersTable recruiters={items} />
      )}

      <PaginationNav
        basePath="/recruiters"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
