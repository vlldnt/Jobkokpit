"use client";

import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { idleAction } from "@/lib/result";
import { eraseDataAction } from "@/features/rgpd/actions";

export function EraseData() {
  const [state, action] = useActionState(eraseDataAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-4" noValidate>
      <p className="text-muted-foreground text-sm">
        Supprime définitivement toutes vos données (offres, candidatures,
        entreprises, documents, e-mails…). Votre compte est conservé. Action
        irréversible.
      </p>
      <Field
        label="Tapez SUPPRIMER pour confirmer"
        htmlFor="confirm"
        error={fe?.confirm?.[0]}
      >
        <Input id="confirm" name="confirm" autoComplete="off" />
      </Field>
      <SubmitButton variant="destructive">Tout supprimer</SubmitButton>
      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
    </form>
  );
}
