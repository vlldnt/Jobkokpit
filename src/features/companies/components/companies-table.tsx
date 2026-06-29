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
import { labelFor } from "@/lib/enums";
import { deleteCompanyAction } from "../actions";

export type CompanyRow = {
  id: string;
  name: string;
  sector: string | null;
  size: string;
  location: string | null;
  website: string | null;
  _count: { offers: number; applications: number };
};

export function CompaniesTable({ companies }: { companies: CompanyRow[] }) {
  const { rows, remove, isPending } = useResourceList(
    companies,
    deleteCompanyAction,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Secteur</TableHead>
          <TableHead>Taille</TableHead>
          <TableHead>Localisation</TableHead>
          <TableHead className="text-right">Offres</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((c) => (
          <TableRow key={c.id} data-pending={isPending ? "" : undefined}>
            <TableCell className="font-medium">
              <Link
                href={`/companies/${c.id}/edit`}
                className="hover:underline"
              >
                {c.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {c.sector ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {labelFor("companySize", c.size)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {c.location ?? "—"}
            </TableCell>
            <TableCell className="text-muted-foreground text-right tabular-nums">
              {c._count.offers}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Modifier"
                >
                  <Link href={`/companies/${c.id}/edit`}>
                    <Pencil />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer « ${c.name} » ?`)) remove(c.id);
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
