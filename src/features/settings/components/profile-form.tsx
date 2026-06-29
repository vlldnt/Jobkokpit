"use client";

import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { idleAction } from "@/lib/result";
import { updateProfileAction } from "../actions";

export function ProfileForm({ email, name }: { email: string; name: string }) {
  const [state, action] = useActionState(updateProfileAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="E-mail" htmlFor="email">
        <Input id="email" value={email} disabled readOnly />
      </Field>
      <Field label="Nom" htmlFor="name" error={fe?.name?.[0]}>
        <Input id="name" name="name" defaultValue={name} />
      </Field>
      <SubmitButton>Enregistrer</SubmitButton>
      {state.status === "success" && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {state.message}
        </p>
      )}
      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
    </form>
  );
}
