"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { idleAction } from "@/lib/result";
import { createThreadAction } from "../actions";

export function ThreadForm({
  applications,
}: {
  applications: { id: string; label: string }[];
}) {
  const [state, action] = useActionState(createThreadAction, idleAction);
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="max-w-2xl space-y-5" noValidate>
      <Field label="Sujet *" htmlFor="subject" error={fe?.subject?.[0]}>
        <Input id="subject" name="subject" required />
      </Field>
      <Field
        label="Candidature liée"
        htmlFor="applicationId"
        error={fe?.applicationId?.[0]}
      >
        <Select id="applicationId" name="applicationId" defaultValue="">
          <option value="">— Aucune —</option>
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </Select>
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>Créer la conversation</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/emails">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
