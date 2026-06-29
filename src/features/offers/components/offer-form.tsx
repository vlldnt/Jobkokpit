"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field } from "@/components/form/field";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  offerSourceOptions,
  offerStatusOptions,
  remoteOptions,
  seniorityOptions,
  type Option,
} from "@/lib/enums";
import { idleAction, type ActionState } from "@/lib/result";

export type OfferFormValues = {
  title: string;
  companyId: string;
  status: string;
  source: string;
  remote: string;
  seniority: string;
  contractType: string;
  location: string;
  url: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  postedAt: string;
  expiresAt: string;
  description: string;
};

const EMPTY: OfferFormValues = {
  title: "",
  companyId: "",
  status: "NEW",
  source: "MANUAL",
  remote: "UNKNOWN",
  seniority: "UNKNOWN",
  contractType: "",
  location: "",
  url: "",
  salaryMin: "",
  salaryMax: "",
  currency: "EUR",
  postedAt: "",
  expiresAt: "",
  description: "",
};

function SelectField({
  id,
  label,
  options,
  defaultValue,
  error,
}: {
  id: string;
  label: string;
  options: Option[];
  defaultValue: string;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <Select id={id} name={id} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function OfferForm({
  action,
  submitLabel,
  companies,
  defaultValues,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  companies: { id: string; name: string }[];
  defaultValues?: Partial<OfferFormValues>;
}) {
  const [state, formAction] = useActionState(action, idleAction);
  const v = { ...EMPTY, ...defaultValues };
  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="max-w-3xl space-y-5" noValidate>
      <Field label="Intitulé du poste *" htmlFor="title" error={fe?.title?.[0]}>
        <Input id="title" name="title" defaultValue={v.title} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
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
        <SelectField
          id="status"
          label="Statut"
          options={offerStatusOptions}
          defaultValue={v.status}
          error={fe?.status?.[0]}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          id="remote"
          label="Télétravail"
          options={remoteOptions}
          defaultValue={v.remote}
          error={fe?.remote?.[0]}
        />
        <SelectField
          id="seniority"
          label="Niveau"
          options={seniorityOptions}
          defaultValue={v.seniority}
          error={fe?.seniority?.[0]}
        />
        <SelectField
          id="source"
          label="Source"
          options={offerSourceOptions}
          defaultValue={v.source}
          error={fe?.source?.[0]}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Type de contrat"
          htmlFor="contractType"
          error={fe?.contractType?.[0]}
        >
          <Input
            id="contractType"
            name="contractType"
            placeholder="CDI, CDD, Freelance…"
            defaultValue={v.contractType}
          />
        </Field>
        <Field
          label="Localisation"
          htmlFor="location"
          error={fe?.location?.[0]}
        >
          <Input id="location" name="location" defaultValue={v.location} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Salaire min"
          htmlFor="salaryMin"
          error={fe?.salaryMin?.[0]}
        >
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            min={0}
            defaultValue={v.salaryMin}
          />
        </Field>
        <Field
          label="Salaire max"
          htmlFor="salaryMax"
          error={fe?.salaryMax?.[0]}
        >
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            min={0}
            defaultValue={v.salaryMax}
          />
        </Field>
        <Field label="Devise" htmlFor="currency" error={fe?.currency?.[0]}>
          <Input id="currency" name="currency" defaultValue={v.currency} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date de publication" htmlFor="postedAt">
          <Input
            id="postedAt"
            name="postedAt"
            type="date"
            defaultValue={v.postedAt}
          />
        </Field>
        <Field label="Date d'expiration" htmlFor="expiresAt">
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            defaultValue={v.expiresAt}
          />
        </Field>
      </div>

      <Field label="Lien de l'offre" htmlFor="url" error={fe?.url?.[0]}>
        <Input
          id="url"
          name="url"
          type="url"
          placeholder="https://…"
          defaultValue={v.url}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        error={fe?.description?.[0]}
      >
        <Textarea
          id="description"
          name="description"
          className="min-h-40"
          defaultValue={v.description}
        />
      </Field>

      {state.status === "error" && !fe && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <div className="flex gap-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href="/offers">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
