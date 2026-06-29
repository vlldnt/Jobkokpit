"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatusOptions } from "@/lib/enums";
import { idleAction, type ActionState } from "@/lib/result";

export type ApplicationFormValues = {
  companyId: string;
  offerId: string;
  status: string;
  appliedAt: string;
  nextActionAt: string;
  notes: string;
};

const EMPTY: ApplicationFormValues = {
  companyId: "",
  offerId: "",
  status: "DRAFT",
  appliedAt: "",
  nextActionAt: "",
  notes: "",
};

export function ApplicationForm({
  action,
  submitLabel,
  companies,
  offers,
  defaultValues,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  companies: { id: string; name: string }[];
  offers: { id: string; title: string }[];
  defaultValues?: Partial<ApplicationFormValues>;
}) {
  const [state, formAction] = useActionState(action, idleAction);
  const v = { ...EMPTY, ...defaultValues };
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="max-w-2xl space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Offre" htmlFor="offerId" error={fe?.offerId?.[0]}>
          <Select id="offerId" name="offerId" defaultValue={v.offerId}>
            <option value="">— Aucune —</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </Select>
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

      <Field label="Statut" htmlFor="status" error={fe?.status?.[0]}>
        <Select id="status" name="status" defaultValue={v.status}>
          {applicationStatusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date de candidature" htmlFor="appliedAt">
          <Input
            id="appliedAt"
            name="appliedAt"
            type="date"
            defaultValue={v.appliedAt}
          />
        </Field>
        <Field label="Prochaine action" htmlFor="nextActionAt">
          <Input
            id="nextActionAt"
            name="nextActionAt"
            type="date"
            defaultValue={v.nextActionAt}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes" error={fe?.notes?.[0]}>
        <Textarea
          id="notes"
          name="notes"
          className="min-h-32"
          defaultValue={v.notes}
        />
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/applications">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
