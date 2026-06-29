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
import { deleteOfferAction } from "../actions";

export type OfferRow = {
  id: string;
  title: string;
  status: string;
  remote: string;
  location: string | null;
  updatedAt: Date;
  company: { name: string } | null;
};

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  NEW: "default",
  ANALYZED: "info",
  SHORTLISTED: "info",
  APPLIED: "success",
  ARCHIVED: "outline",
  EXPIRED: "destructive",
};

export function OffersTable({ offers }: { offers: OfferRow[] }) {
  const { rows, remove, isPending } = useResourceList(
    offers,
    deleteOfferAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Intitulé</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Télétravail</TableHead>
          <TableHead>Mise à jour</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((o) => (
          <TableRow key={o.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link href={`/offers/${o.id}`} className="hover:underline">
                {o.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {o.company?.name ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[o.status] ?? "default"}>
                {labelFor("offerStatus", o.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {labelFor("remote", o.remote)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {o.updatedAt.toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                >
                  <Link href={`/offers/${o.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer « ${o.title} » ?`)) remove(o.id);
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
