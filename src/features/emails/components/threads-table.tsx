"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResourceList } from "@/components/use-resource-list";
import { deleteThreadAction } from "../actions";

export type ThreadRow = {
  id: string;
  subject: string;
  updatedAt: Date;
  application: { offer: { title: string } | null } | null;
  _count: { messages: number };
};

export function ThreadsTable({ threads }: { threads: ThreadRow[] }) {
  const { rows, remove, isPending } = useResourceList(
    threads,
    deleteThreadAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sujet</TableHead>
          <TableHead>Candidature</TableHead>
          <TableHead className="text-right">Messages</TableHead>
          <TableHead>Mise à jour</TableHead>
          <TableHead className="w-16 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t) => (
          <TableRow key={t.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link href={`/emails/${t.id}`} className="hover:underline">
                {t.subject}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {t.application?.offer?.title ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground text-right tabular-nums">
              {t._count.messages}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {t.updatedAt.toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer « ${t.subject} » ?`)) remove(t.id);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
