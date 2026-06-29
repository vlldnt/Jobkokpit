import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";

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
import { OffersTable } from "@/features/offers/components/offers-table";
import { listOffers } from "@/features/offers/service";

export const metadata: Metadata = { title: "Offres" };

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const { items, total } = await listOffers({ skip, take, search });

  return (
    <>
      <PageHeader
        title="Offres"
        description="Les offres d'emploi que vous suivez."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/offers/import">
                <Download />
                Importer
              </Link>
            </Button>
            <Button asChild>
              <Link href="/offers/new">
                <Plus />
                Nouvelle offre
              </Link>
            </Button>
          </div>
        }
      />

      <SearchForm
        basePath="/offers"
        placeholder="Rechercher une offre…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucune offre"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Ajoutez une offre manuellement pour commencer."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/offers/new">Nouvelle offre</Link>
              </Button>
            )
          }
        />
      ) : (
        <OffersTable offers={items} />
      )}

      <PaginationNav
        basePath="/offers"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
