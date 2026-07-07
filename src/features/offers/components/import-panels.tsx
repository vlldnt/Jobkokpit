"use client";

import { useActionState, useState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { idleAction, type ActionState } from "@/lib/result";
import {
  importOfferTextAction,
  importOfferUrlAction,
  syncOffersAction,
} from "../import-actions";
import { DEV_KEYWORD_PRESETS } from "../keyword-presets";

function Feedback({ state }: { state: ActionState }) {
  if (state.status === "success" && state.message) {
    return (
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        {state.message}
      </p>
    );
  }
  if (state.status === "error") {
    return <p className="text-destructive text-sm">{state.message}</p>;
  }
  return null;
}

function SyncForm() {
  const [state, action] = useActionState(syncOffersAction, idleAction);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function addKeyword(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setKeywords((prev) =>
      prev.some((k) => k.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value],
    );
    setDraft("");
  }

  function removeKeyword(value: string) {
    setKeywords((prev) => prev.filter((k) => k !== value));
  }

  const availablePresets = DEV_KEYWORD_PRESETS.filter(
    (p) => !keywords.some((k) => k.toLowerCase() === p.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synchroniser les sources</CardTitle>
        <CardDescription>
          Interroge France Travail et Adzuna, déduplique et ajoute les nouvelles
          offres. Chaque mot-clé lance sa propre recherche.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {/* Chaque mot-clé est envoyé sur sa propre ligne à l'action. */}
          <input type="hidden" name="keywords" value={keywords.join("\n")} />

          <Field label="Mots-clés" htmlFor="keyword-draft">
            <div className="flex gap-2">
              <Input
                id="keyword-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addKeyword(draft);
                  }
                }}
                placeholder="Développeur React…"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addKeyword(draft)}
              >
                Ajouter
              </Button>
            </div>

            {keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <Badge key={k} variant="info" className="gap-1 pr-1">
                    {k}
                    <button
                      type="button"
                      onClick={() => removeKeyword(k)}
                      aria-label={`Retirer ${k}`}
                      className="hover:bg-foreground/10 ml-0.5 rounded-sm px-1 leading-none"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">
                Suggestions développeur — cliquez pour ajouter :
              </p>
              <div className="flex flex-wrap gap-2">
                {availablePresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => addKeyword(p)}
                    className="border-input hover:bg-accent hover:text-accent-foreground rounded-md border px-2 py-0.5 text-xs transition-colors"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/40 text-muted-foreground rounded-md border p-3 text-xs">
            <span className="text-foreground font-medium">
              Présentiel / hybride :
            </span>{" "}
            Aveyron, Tarn, Lot, Lozère, Cantal.
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remoteEverywhere"
              defaultChecked
              className="border-input size-4 rounded"
            />
            Inclure le full télétravail partout en France
          </label>

          <SubmitButton pendingText="Synchronisation…">
            Synchroniser
            {keywords.length > 0 ? ` (${keywords.length})` : ""}
          </SubmitButton>
          <Feedback state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

function ImportUrlForm() {
  const [state, action] = useActionState(importOfferUrlAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer depuis une URL</CardTitle>
        <CardDescription>
          Colle le lien d’une annonce (LinkedIn, Indeed, site carrière…). L’IA
          en extrait les informations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Field label="URL de l'annonce" htmlFor="url" error={fe?.url?.[0]}>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://…"
              required
            />
          </Field>
          <SubmitButton>Importer</SubmitButton>
          {state.status === "error" && !fe && <Feedback state={state} />}
        </form>
      </CardContent>
    </Card>
  );
}

function ImportTextForm() {
  const [state, action] = useActionState(importOfferTextAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer par copier-coller</CardTitle>
        <CardDescription>
          Colle le texte d’une offre. Utile quand le site bloque l’accès direct.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Field label="Texte de l'offre" htmlFor="text" error={fe?.text?.[0]}>
            <Textarea
              id="text"
              name="text"
              className="min-h-48"
              placeholder="Collez ici le contenu de l'annonce…"
              required
            />
          </Field>
          <SubmitButton>Importer</SubmitButton>
          {state.status === "error" && !fe && <Feedback state={state} />}
        </form>
      </CardContent>
    </Card>
  );
}

export function OfferImportPanels() {
  return (
    <div className="space-y-6">
      <SyncForm />
      <div className="grid gap-6 lg:grid-cols-2">
        <ImportUrlForm />
        <ImportTextForm />
      </div>
    </div>
  );
}
