"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { labelFor } from "@/lib/enums";
import { deleteDocumentAction } from "../actions";

export type DocumentRow = {
  id: string;
  title: string;
  type: string;
  version: number;
  updatedAt: Date;
  application: { offer: { title: string } | null } | null;
};

export function DocumentsTable({ documents }: { documents: DocumentRow[] }) {
  const { rows, remove, isPending } = useResourceList(
    documents,
    deleteDocumentAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Candidature</TableHead>
          <TableHead>Mise à jour</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((d) => (
          <TableRow key={d.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link
                href={`/documents/${d.id}/edit`}
                className="hover:underline"
              >
                {d.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {labelFor("documentType", d.type)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {d.application?.offer?.title ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {d.updatedAt.toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                >
                  <Link href={`/documents/${d.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer « ${d.title} » ?`)) remove(d.id);
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
