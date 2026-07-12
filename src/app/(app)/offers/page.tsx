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
import { CleanOffersButton } from "@/features/offers/components/clean-offers-button";
import { OffersTable } from "@/features/offers/components/offers-table";
import {
  OFFER_QUICK_FILTERS,
  parseOfferFilter,
} from "@/features/offers/quick-filters";
import { listOffers } from "@/features/offers/service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Offres" };

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);
  const filter = parseOfferFilter(sp.f);

  const { items, total } = await listOffers({ skip, take, search, filter });

  const filterHref = (value?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (value) params.set("f", value);
    const qs = params.toString();
    return qs ? `/offers?${qs}` : "/offers";
  };

  return (
    <>
      <PageHeader
        title="Offres"
        description="Les offres d'emploi que vous suivez."
        action={
          <div className="flex items-center gap-2">
            <CleanOffersButton />
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
        hiddenParams={filter ? { f: filter } : undefined}
      />

      {/* Filtres rapides : modalité, zone, type de contrat. */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Link
          href={filterHref()}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !filter
              ? "bg-primary text-primary-foreground border-transparent"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Tous
        </Link>
        {OFFER_QUICK_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={filterHref(filter === f.value ? undefined : f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground border-transparent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Aucune offre"
          description={
            search || filter
              ? "Aucun résultat pour cette recherche."
              : "Ajoutez une offre manuellement pour commencer."
          }
          action={
            !search &&
            !filter && (
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
        extraParams={filter ? { f: filter } : undefined}
      />
    </>
  );
}
