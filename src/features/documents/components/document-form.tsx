"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { documentTypeOptions } from "@/lib/enums";
import { idleAction, type ActionState } from "@/lib/result";

export type DocumentFormValues = {
  title: string;
  type: string;
  applicationId: string;
  content: string;
};

const EMPTY: DocumentFormValues = {
  title: "",
  type: "OTHER",
  applicationId: "",
  content: "",
};

export function DocumentForm({
  action,
  submitLabel,
  applications,
  defaultValues,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  applications: { id: string; label: string }[];
  defaultValues?: Partial<DocumentFormValues>;
}) {
  const [state, formAction] = useActionState(action, idleAction);
  const v = { ...EMPTY, ...defaultValues };
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="max-w-3xl space-y-5" noValidate>
      <Field label="Titre *" htmlFor="title" error={fe?.title?.[0]}>
        <Input id="title" name="title" defaultValue={v.title} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" htmlFor="type" error={fe?.type?.[0]}>
          <Select id="type" name="type" defaultValue={v.type}>
            {documentTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Candidature liée"
          htmlFor="applicationId"
          error={fe?.applicationId?.[0]}
        >
          <Select
            id="applicationId"
            name="applicationId"
            defaultValue={v.applicationId}
          >
            <option value="">— Aucune —</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Contenu" htmlFor="content" error={fe?.content?.[0]}>
        <Textarea
          id="content"
          name="content"
          className="min-h-64 font-mono text-sm"
          defaultValue={v.content}
        />
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/documents">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
