import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaginationNav } from "@/components/pagination-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  parsePagination,
  totalPages,
  type SearchParams,
} from "@/lib/pagination";
import { listAuditLogs } from "@/features/history/service";

export const metadata: Metadata = { title: "Historique" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { page, pageSize, skip, take } = parsePagination(sp);
  const { items, total } = await listAuditLogs({ skip, take });

  return (
    <>
      <PageHeader
        title="Historique"
        description="Journal d'audit de vos actions (traçabilité RGPD)."
      />

      {items.length === 0 ? (
        <EmptyState
          title="Aucune entrée"
          description="Vos actions seront journalisées ici."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground">
                  {dateFmt.format(log.createdAt)}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.action}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.entityType}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.ip ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        basePath="/history"
        page={page}
        totalPages={totalPages(total, pageSize)}
      />
    </>
  );
}
