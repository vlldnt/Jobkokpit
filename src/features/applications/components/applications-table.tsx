"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
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
import { deleteApplicationAction } from "../actions";

export type ApplicationRow = {
  id: string;
  status: string;
  appliedAt: Date | null;
  nextActionAt: Date | null;
  updatedAt: Date;
  offer: { title: string } | null;
  company: { name: string } | null;
};

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  DRAFT: "outline",
  APPLIED: "default",
  SCREENING: "info",
  INTERVIEW: "info",
  TECHNICAL_TEST: "info",
  OFFER: "success",
  ACCEPTED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("fr-FR") : "—");

export function ApplicationsTable({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const { rows, remove, isPending } = useResourceList(
    applications,
    deleteApplicationAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Poste</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Postulé le</TableHead>
          <TableHead>Prochaine action</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((a) => (
          <TableRow key={a.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link href={`/applications/${a.id}`} className="hover:underline">
                {a.offer?.title ?? "Candidature spontanée"}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {a.company?.name ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[a.status] ?? "default"}>
                {labelFor("applicationStatus", a.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {fmt(a.appliedAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {fmt(a.nextActionAt)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                >
                  <Link href={`/applications/${a.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm("Supprimer cette candidature ?")) remove(a.id);
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
