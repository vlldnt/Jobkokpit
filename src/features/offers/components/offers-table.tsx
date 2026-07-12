"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { ExternalLink, Heart, Pencil, ThumbsDown, Trash2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { labelFor } from "@/lib/enums";
import { deleteOfferAction } from "../actions";
import {
  dismissOfferAction,
  toggleInterestedAction,
} from "../application-actions";
import { contractBadge } from "../contract-kind";
import { isEuropeLocation } from "../region";
import { remoteBadge } from "../remote-badge";

export type OfferRow = {
  id: string;
  title: string;
  status: string;
  remote: string;
  location: string | null;
  contractType: string | null;
  url: string | null;
  interested: boolean;
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

type Optimistic =
  | { type: "remove"; id: string }
  | { type: "like"; id: string; value: boolean };

export function OffersTable({ offers }: { offers: OfferRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [rows, apply] = useOptimistic(
    offers,
    (state: OfferRow[], action: Optimistic) => {
      if (action.type === "remove") return state.filter((r) => r.id !== action.id);
      return state.map((r) =>
        r.id === action.id ? { ...r, interested: action.value } : r,
      );
    },
  );

  function like(id: string, next: boolean) {
    startTransition(async () => {
      apply({ type: "like", id, value: next });
      await toggleInterestedAction(id, next);
    });
  }

  function dislike(id: string) {
    startTransition(async () => {
      apply({ type: "remove", id });
      await dismissOfferAction(id, true);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      apply({ type: "remove", id });
      await deleteOfferAction(id);
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Intitulé</TableHead>
          <TableHead>Entreprise</TableHead>
          <TableHead>Ville</TableHead>
          <TableHead>Contrat</TableHead>
          <TableHead>Télétravail</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-48 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((o) => {
          const c = contractBadge(o.contractType, o.title);
          const r = remoteBadge(o.remote);
          return (
            <TableRow key={o.id} data-pending={isPending ? "" : undefined}>
              <TableCell className="font-medium">
                {/* Nouvel onglet : la liste reste ouverte pour y revenir. */}
                <Link
                  href={`/offers/${o.id}`}
                  target="_blank"
                  className="hover:underline"
                >
                  {o.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {o.company?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  {o.location ?? "—"}
                  {isEuropeLocation(o.location) && (
                    <Badge variant="europe">Europe</Badge>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={c.variant}>{c.label}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={r.variant}>{r.label}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[o.status] ?? "default"}>
                  {labelFor("offerStatus", o.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {o.url && (
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label="Voir l'annonce (nouvel onglet)"
                      title="Voir l'annonce (nouvel onglet)"
                    >
                      <a href={o.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={o.interested ? "Retirer des favoris" : "J'aime"}
                    title={o.interested ? "Retirer des favoris" : "J'aime"}
                    onClick={() => like(o.id, !o.interested)}
                  >
                    <Heart
                      className={cn(
                        o.interested && "fill-rose-500 text-rose-500",
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="J'aime pas (masquer)"
                    title="J'aime pas — mettre de côté"
                    onClick={() => dislike(o.id)}
                  >
                    <ThumbsDown />
                  </Button>
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
          );
        })}
      </TableBody>
    </Table>
  );
}
