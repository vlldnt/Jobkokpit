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
import { ThreadsTable } from "@/features/emails/components/threads-table";
import { listThreads } from "@/features/emails/service";

export const metadata: Metadata = { title: "E-mails" };

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const search = parseSearch(sp);

  const { items, total } = await listThreads({ skip, take, search });

  return (
    <>
      <PageHeader
        title="E-mails"
        description="Vos échanges, chiffrés au repos."
        action={
          <Button asChild>
            <Link href="/emails/new">
              <Plus />
              Nouvelle conversation
            </Link>
          </Button>
        }
      />

      <SearchForm
        basePath="/emails"
        placeholder="Rechercher un sujet…"
        defaultValue={search}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucune conversation"
          description={
            search
              ? "Aucun résultat pour cette recherche."
              : "Créez une conversation pour suivre vos échanges."
          }
          action={
            !search && (
              <Button asChild variant="outline">
                <Link href="/emails/new">Nouvelle conversation</Link>
              </Button>
            )
          }
        />
      ) : (
        <ThreadsTable threads={items} />
      )}

      <PaginationNav
        basePath="/emails"
        page={page}
        totalPages={totalPages(total, pageSize)}
        query={search}
      />
    </>
  );
}
