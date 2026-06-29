"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { idleAction, type ActionState } from "@/lib/result";

export type RecruiterFormValues = {
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  companyId: string;
  notes: string;
};

const EMPTY: RecruiterFormValues = {
  name: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  companyId: "",
  notes: "",
};

export function RecruiterForm({
  action,
  submitLabel,
  companies,
  defaultValues,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  companies: { id: string; name: string }[];
  defaultValues?: Partial<RecruiterFormValues>;
}) {
  const [state, formAction] = useActionState(action, idleAction);
  const v = { ...EMPTY, ...defaultValues };
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-5" noValidate>
      <Field label="Nom *" htmlFor="name" error={fe?.name?.[0]}>
        <Input id="name" name="name" defaultValue={v.name} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="email" error={fe?.email?.[0]}>
          <Input id="email" name="email" type="email" defaultValue={v.email} />
        </Field>
        <Field label="Téléphone" htmlFor="phone" error={fe?.phone?.[0]}>
          <Input id="phone" name="phone" defaultValue={v.phone} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="LinkedIn"
          htmlFor="linkedinUrl"
          error={fe?.linkedinUrl?.[0]}
        >
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/…"
            defaultValue={v.linkedinUrl}
          />
        </Field>
        <Field
          label="Entreprise"
          htmlFor="companyId"
          error={fe?.companyId?.[0]}
        >
          <Select id="companyId" name="companyId" defaultValue={v.companyId}>
            <option value="">— Aucune —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes" error={fe?.notes?.[0]}>
        <Textarea id="notes" name="notes" defaultValue={v.notes} />
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/recruiters">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
