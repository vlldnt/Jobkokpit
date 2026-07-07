"use client";

import { useState, useTransition } from "react";
import { Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateApplicationDocsAction,
  saveApplicationDocsAction,
  saveContactAction,
  toggleInterestedAction,
} from "../application-actions";

/** Header toggle: pin / "Intéressé". */
export function InterestedToggle({
  offerId,
  initial,
}: {
  offerId: string;
  initial: boolean;
}) {
  const [interested, setInterested] = useState(initial);
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant={interested ? "default" : "outline"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const next = !interested;
          const res = await toggleInterestedAction(offerId, next);
          if (res.ok) setInterested(next);
        })
      }
    >
      <Star className={interested ? "fill-current" : ""} />
      {interested ? "Intéressé" : "Marquer intéressé"}
    </Button>
  );
}

function Status({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return (
    <p
      className={
        msg.ok
          ? "text-sm text-emerald-600 dark:text-emerald-400"
          : "text-destructive text-sm"
      }
    >
      {msg.text}
    </p>
  );
}

export type WorkspaceInitial = {
  interested: boolean;
  contactEmail: string;
  contactPhone: string;
  coverLetter: string;
  outreachEmail: string;
};

export function ApplicationWorkspace({
  offerId,
  initial,
}: {
  offerId: string;
  initial: WorkspaceInitial;
}) {
  // Contact
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [contactMsg, setContactMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [savingContact, startContact] = useTransition();

  // Documents
  const [coverLetter, setCoverLetter] = useState(initial.coverLetter);
  const [outreachEmail, setOutreachEmail] = useState(initial.outreachEmail);
  const [docsMsg, setDocsMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [generating, startGenerate] = useTransition();
  const [savingDocs, startSaveDocs] = useTransition();

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>
            Email et téléphone du recruteur, pour postuler directement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="recruteur@entreprise.fr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Téléphone</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={savingContact}
              onClick={() =>
                startContact(async () => {
                  setContactMsg(null);
                  const res = await saveContactAction(offerId, {
                    contactEmail,
                    contactPhone,
                  });
                  setContactMsg(
                    res.ok
                      ? { ok: true, text: "Contact enregistré." }
                      : { ok: false, text: res.error ?? "Erreur." },
                  );
                })
              }
            >
              {savingContact ? "Enregistrement…" : "Enregistrer le contact"}
            </Button>
            <Status msg={contactMsg} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Candidature</CardTitle>
              <CardDescription>
                Lettre de motivation et email à envoyer, modifiables.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={generating}
              onClick={() =>
                startGenerate(async () => {
                  setDocsMsg(null);
                  const res = await generateApplicationDocsAction(offerId);
                  if (res.ok) {
                    setCoverLetter(res.coverLetter);
                    setOutreachEmail(res.outreachEmail);
                    setDocsMsg({ ok: true, text: "Brouillon généré." });
                  } else {
                    setDocsMsg({ ok: false, text: res.error });
                  }
                })
              }
            >
              <Sparkles />
              {generating ? "Génération…" : "Générer avec l'IA"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Lettre de motivation</Label>
            <Textarea
              id="coverLetter"
              className="min-h-48"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Générez un brouillon ou rédigez votre lettre…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outreachEmail">Email à envoyer</Label>
            <Textarea
              id="outreachEmail"
              className="min-h-32"
              value={outreachEmail}
              onChange={(e) => setOutreachEmail(e.target.value)}
              placeholder="Email d'accompagnement…"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              disabled={savingDocs}
              onClick={() =>
                startSaveDocs(async () => {
                  setDocsMsg(null);
                  const res = await saveApplicationDocsAction(offerId, {
                    coverLetter,
                    outreachEmail,
                  });
                  setDocsMsg(
                    res.ok
                      ? { ok: true, text: "Candidature enregistrée." }
                      : { ok: false, text: res.error ?? "Erreur." },
                  );
                })
              }
            >
              {savingDocs ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Status msg={docsMsg} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
