"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { companySizeOptions } from "@/lib/enums";
import { idleAction, type ActionState } from "@/lib/result";

export type CompanyFormValues = {
  name: string;
  website: string;
  sector: string;
  size: string;
  location: string;
  description: string;
  notes: string;
};

const EMPTY: CompanyFormValues = {
  name: "",
  website: "",
  sector: "",
  size: "UNKNOWN",
  location: "",
  description: "",
  notes: "",
};

export function CompanyForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  defaultValues?: Partial<CompanyFormValues>;
}) {
  const [state, formAction] = useActionState(action, idleAction);
  const values = { ...EMPTY, ...defaultValues };
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-5" noValidate>
      <Field label="Nom *" htmlFor="name" error={fe?.name?.[0]}>
        <Input id="name" name="name" defaultValue={values.name} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Secteur" htmlFor="sector" error={fe?.sector?.[0]}>
          <Input id="sector" name="sector" defaultValue={values.sector} />
        </Field>
        <Field label="Taille" htmlFor="size" error={fe?.size?.[0]}>
          <Select id="size" name="size" defaultValue={values.size}>
            {companySizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Site web" htmlFor="website" error={fe?.website?.[0]}>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://…"
            defaultValue={values.website}
          />
        </Field>
        <Field
          label="Localisation"
          htmlFor="location"
          error={fe?.location?.[0]}
        >
          <Input id="location" name="location" defaultValue={values.location} />
        </Field>
      </div>

      <Field
        label="Description"
        htmlFor="description"
        error={fe?.description?.[0]}
      >
        <Textarea
          id="description"
          name="description"
          defaultValue={values.description}
        />
      </Field>

      <Field label="Notes" htmlFor="notes" error={fe?.notes?.[0]}>
        <Textarea id="notes" name="notes" defaultValue={values.notes} />
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/companies">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
