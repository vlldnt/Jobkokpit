"use client";

import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Synchroniser les sources</CardTitle>
        <CardDescription>
          Interroge France Travail et Adzuna, déduplique et ajoute les nouvelles
          offres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mots-clés" htmlFor="query">
              <Input id="query" name="query" placeholder="développeur React…" />
            </Field>
            <Field label="Localisation" htmlFor="location">
              <Input id="location" name="location" placeholder="Paris…" />
            </Field>
          </div>
          <SubmitButton>Synchroniser</SubmitButton>
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
