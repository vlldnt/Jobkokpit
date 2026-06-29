"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

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
import { deleteRecruiterAction } from "../actions";

export type RecruiterRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: { name: string } | null;
};

export function RecruitersTable({
  recruiters,
}: {
  recruiters: RecruiterRow[];
}) {
  const { rows, remove, isPending } = useResourceList(
    recruiters,
    deleteRecruiterAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link
                href={`/recruiters/${r.id}/edit`}
                className="hover:underline"
              >
                {r.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.company?.name ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.email ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {r.phone ?? "—"}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                >
                  <Link href={`/recruiters/${r.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer « ${r.name} » ?`)) remove(r.id);
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
