import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelFor } from "@/lib/enums";
import { contractBadge } from "@/features/offers/contract-kind";
import { remoteBadge } from "@/features/offers/remote-badge";
import { extractContact } from "@/features/offers/contact-extract";
import { AnalyzeButton } from "@/features/offers/components/analyze-button";
import {
  ApplicationWorkspace,
  InterestedToggle,
} from "@/features/offers/components/application-workspace";
import { OfferAnalysisCard } from "@/features/offers/components/offer-analysis";
import { getOfferDetail } from "@/features/offers/service";

export const metadata: Metadata = { title: "Offre" };

const fmtDate = (d: Date | null) => (d ? d.toLocaleDateString("fr-FR") : "—");

/** Small dashboard-style info tile. */
function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferDetail(id);
  if (!offer) notFound();

  const salary =
    offer.salaryMin || offer.salaryMax
      ? `${offer.salaryMin ?? "?"} – ${offer.salaryMax ?? "?"} ${offer.currency ?? ""}`
      : "—";

  const contract = contractBadge(offer.contractType, offer.title);
  const remote = remoteBadge(offer.remote);

  // Pre-fill contact from the description when not set manually.
  const guessed = extractContact(offer.description);
  const workspaceInitial = {
    interested: offer.interested,
    contactEmail: offer.contactEmail ?? guessed.email,
    contactPhone: offer.contactPhone ?? guessed.phone,
    coverLetter: offer.coverLetter ?? "",
    outreachEmail: offer.outreachEmail ?? "",
  };

  return (
    <>
      <PageHeader
        title={offer.title}
        description={offer.company?.name ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <InterestedToggle offerId={offer.id} initial={offer.interested} />
            <Button asChild variant="ghost">
              <Link href={`/offers/${offer.id}/edit`}>
                <Pencil />
                Modifier
              </Link>
            </Button>
            <AnalyzeButton offerId={offer.id} hasAnalysis={!!offer.analysis} />
          </div>
        }
      />

      {/* Badges + lien annonce */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={contract.variant}>{contract.label}</Badge>
        <Badge variant={remote.variant}>{remote.label}</Badge>
        <Badge>{labelFor("offerStatus", offer.status)}</Badge>
        <Badge variant="outline">{labelFor("offerSource", offer.source)}</Badge>
        {offer.url && (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <a href={offer.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Voir l’annonce
            </a>
          </Button>
        )}
      </div>

      {/* Tuiles d'informations */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile label="Ville">{offer.location ?? "—"}</Tile>
        <Tile label="Télétravail">
          <Badge variant={remote.variant}>{remote.label}</Badge>
        </Tile>
        <Tile label="Salaire">{salary}</Tile>
        <Tile label="Niveau">{labelFor("seniority", offer.seniority)}</Tile>
        <Tile label="Entreprise">{offer.company?.name ?? "—"}</Tile>
        <Tile label="Contrat">
          <Badge variant={contract.variant}>{contract.label}</Badge>
        </Tile>
        <Tile label="Publiée le">{fmtDate(offer.postedAt)}</Tile>
        <Tile label="Expire le">{fmtDate(offer.expiresAt)}</Tile>
      </div>

      {/* Analyse IA */}
      <div className="mt-6">
        {offer.analysis ? (
          <OfferAnalysisCard analysis={offer.analysis} />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Analyse IA</CardTitle>
                <AnalyzeButton
                  offerId={offer.id}
                  hasAnalysis={!!offer.analysis}
                />
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Aucune analyse pour l’instant. Lancez l’analyse pour obtenir un
              résumé, les compétences clés et un score de compatibilité.
            </CardContent>
          </Card>
        )}
      </div>

      <ApplicationWorkspace offerId={offer.id} initial={workspaceInitial} />

      {offer.description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{offer.description}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
